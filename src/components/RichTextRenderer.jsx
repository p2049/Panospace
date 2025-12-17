import React from 'react';

const RenderMarks = ({ text, marks }) => {
    if (!marks || marks.length === 0) return <>{text}</>;

    const mark = marks[0];
    const restMarks = marks.slice(1);
    const wrappedText = <RenderMarks text={text} marks={restMarks} />;

    switch (mark.type) {
        case 'bold':
            return <strong>{wrappedText}</strong>;
        case 'italic':
            return <em>{wrappedText}</em>;
        case 'strike': // Supported by default parser sometimes, handle if present
        case 'underline':
            return <u style={{ textDecorationThickness: '1px', textUnderlineOffset: '3px' }}>{wrappedText}</u>;
        case 'link':
            return (
                <a
                    href={mark.attrs.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent card click propagation
                    className="rich-text-link"
                >
                    {wrappedText}
                </a>
            );
        default:
            return wrappedText;
    }
};

const RenderNode = ({ node }) => {
    if (node.type === 'text') {
        return <RenderMarks text={node.text} marks={node.marks} />;
    }

    const children = node.content ? node.content.map((child, i) => <RenderNode key={i} node={child} />) : null;

    switch (node.type) {
        case 'paragraph':
            return <p>{children || <br />}</p>; // Handle empty paragraphs with br
        case 'heading':
            const Level = `h${node.attrs?.level || 2}`; // Default H2
            return <Level>{children}</Level>;
        case 'bulletList':
            return <ul>{children}</ul>;
        case 'orderedList':
            return <ol>{children}</ol>;
        case 'listItem':
            return <li>{children}</li>;
        case 'blockquote':
            return <blockquote>{children}</blockquote>;
        case 'hardBreak':
            return <br />;
        default:
            return null; // Ignore unknown blocks
    }
};

export const RichTextRenderer = ({ content }) => {
    if (!content || !content.content) return null;

    return (
        <div className="rich-text-content">
            {content.content.map((node, i) => (
                <RenderNode key={i} node={node} />
            ))}
        </div>
    );
};
