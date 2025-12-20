import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import { FaBold, FaItalic, FaQuoteRight, FaListUl, FaListOl } from 'react-icons/fa';

/**
 * 1. The Hook (Manages Editor Instance & Re-renders)
 */
export const useTextEditor = ({ content, onChange, placeholder, limit }) => {
    // Force re-render on editor state changes
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3], // Only H2 and H3 allowed
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || "Write your story...",
            }),
            CharacterCount.configure({
                limit: limit || 3000,
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON(), editor.getText());
            }
            forceUpdate(n => n + 1);
        },
        onSelectionUpdate: ({ editor }) => {
            forceUpdate(n => n + 1);
        },
        onTransaction: ({ editor }) => {
            forceUpdate(n => n + 1);
        },
        editorProps: {
            attributes: {
                class: 'rich-text-content', // Shared CSS class for WYSIWYG
                style: 'outline: none; min-height: 150px;'
            },
        },
    });

    return editor;
};

/**
 * 2. The Toolbar (UI controls)
 */
export const EditorToolbar = ({ editor }) => {
    if (!editor) return null;

    const preventFocusLoss = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const btnStyle = (isActive) => ({
        background: isActive ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: isActive ? '#7FFFD4' : '#aaa',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '0.8rem',
        padding: 0,
        transition: 'all 0.1s'
    });

    return (
        <div className="editor-toolbar" style={{
            display: 'flex',
            gap: '0.1rem',
            padding: '0.2rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(20, 20, 20, 0.98)',
            position: 'relative', /* Changed from sticky to relative per user request */
            zIndex: 10,
            backdropFilter: 'blur(15px)',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            alignItems: 'center',
            marginBottom: '0',
            width: '100%',
            boxSizing: 'border-box'
        }}
            onMouseDown={preventFocusLoss}
        >
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                style={btnStyle(editor.isActive('bold'))}
                title="Bold (Cmd+B)"
                type="button"
            >
                <FaBold size={11} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                style={btnStyle(editor.isActive('italic'))}
                title="Italic (Cmd+I)"
                type="button"
            >
                <FaItalic size={11} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 0.4rem' }}></div>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                style={btnStyle(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
                type="button"
            >
                <span style={{ fontWeight: 700, fontSize: '12px' }}>H2</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                style={btnStyle(editor.isActive('heading', { level: 3 }))}
                title="Heading 3"
                type="button"
            >
                <span style={{ fontWeight: 600, fontSize: '11px' }}>H3</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                style={btnStyle(editor.isActive('blockquote'))}
                title="Quote"
                type="button"
            >
                <FaQuoteRight size={11} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 0.4rem' }}></div>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={btnStyle(editor.isActive('bulletList'))}
                title="Bullet List"
                type="button"
            >
                <FaListUl size={11} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={btnStyle(editor.isActive('orderedList'))}
                title="Ordered List"
                type="button"
            >
                <FaListOl size={11} />
            </button>
        </div>
    );
};

/**
 * 3. The Canvas (Editor Area)
 * Simplified to use default font only. No Font Switching.
 */
export const EditorCanvas = ({ editor, limit = 3000 }) => {
    if (!editor) return null;

    // SAFE storage access (prevent crash)
    const charCount = editor.storage.characterCount?.characters ? editor.storage.characterCount.characters() : 0;

    const isNearLimit = charCount > limit - 300;
    const isAtLimit = charCount >= limit;

    return (
        <div
            className="rich-text-editor-container"
            style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'text'
            }}
            onClick={() => editor.chain().focus().run()} // Focus editor when clicking empty area
        >
            <EditorContent editor={editor} style={{ flex: 1 }} />

            {/* Character Limit Warning */}
            {isNearLimit && (
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '0.75rem',
                    color: isAtLimit ? '#FF4D4D' : '#FFD93D',
                    background: 'rgba(5, 5, 5, 0.85)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px 0 0 0',
                    pointerEvents: 'none',
                    zIndex: 20,
                    backdropFilter: 'blur(4px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {isAtLimit ? 'Limit reached (3k)' : `${charCount} / ${limit}`}
                </div>
            )}
        </div>
    );
};
