import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft } from 'react-icons/fa';
import Post from '../components/Post';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [initialPostIndex, setInitialPostIndex] = useState(0);
    const containerRef = useRef(null);
    const hasScrolledToInitial = useRef(false);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                setLoading(true);

                // 1. Fetch the selected post to get the user ID
                console.log('Fetching post:', id);
                const postDoc = await getDoc(doc(db, 'posts', id));
                if (!postDoc.exists()) {
                    console.warn('Post not found:', id);
                    setLoading(false);
                    return;
                }

                const selectedPost = { id: postDoc.id, ...postDoc.data() };
                const userId = selectedPost.authorId || selectedPost.userId; // Prefer authorId

                if (!userId) {
                    // If no user ID, just show the single post
                    setPosts([selectedPost]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch all posts from this user
                // Note: Using 'authorId' and client-side sorting to avoid index issues
                try {
                    console.log('Fetching user feed for:', userId);
                    const userPostsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', userId)
                    );
                    const postsSnap = await getDocs(userPostsQuery);
                    const userPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                    // Sort by createdAt desc
                    userPosts.sort((a, b) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                        return dateB - dateA;
                    });

                    // Find the index of the selected post
                    const selectedIndex = userPosts.findIndex(p => p.id === id);

                    // If the selected post isn't in the feed (e.g. mismatch), add it
                    if (selectedIndex === -1) {
                        userPosts.unshift(selectedPost);
                        setInitialPostIndex(0);
                    } else {
                        setInitialPostIndex(selectedIndex);
                    }

                    setPosts(userPosts);
                } catch (feedErr) {
                    console.error("Error loading user feed, falling back to single post:", feedErr);
                    setPosts([selectedPost]);
                    setInitialPostIndex(0);
                }

            } catch (err) {
                console.error("Error loading posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [id]);

    // Scroll to the initial post after posts are loaded
    useEffect(() => {
        if (!loading && posts.length > 0 && containerRef.current && !hasScrolledToInitial.current) {
            hasScrolledToInitial.current = true;

            // Scroll to the selected post
            const postElements = containerRef.current.children;
            if (postElements[initialPostIndex]) {
                postElements[initialPostIndex].scrollIntoView({ behavior: 'instant' });
            }
        }
    }, [loading, posts, initialPostIndex]);

    if (loading) {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                Loading...
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                Post not found
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#000', position: 'relative' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 50,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)'
                }}
            >
                <FaArrowLeft />
            </button>

            {/* Scrollable Feed */}
            <div
                ref={containerRef}
                style={{
                    height: '100vh',
                    width: '100vw',
                    overflowY: 'scroll',
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth'
                }}
            >
                {posts.map((post) => (
                    <div key={post.id} style={{ scrollSnapAlign: 'start' }}>
                        <Post post={post} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostDetail;
