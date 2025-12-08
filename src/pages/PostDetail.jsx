import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaArrowLeft } from 'react-icons/fa';
import Post from '@/components/Post';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [initialPostIndex, setInitialPostIndex] = useState(0);
    const containerRef = useRef(null);
    const hasScrolledToInitial = useRef(false);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                setLoading(true);

                // Check if we have context posts passed from navigation (e.g. from Search)
                if (location.state?.contextPosts) {

                    setPosts(location.state.contextPosts);
                    setInitialPostIndex(location.state.initialIndex || 0);
                    setLoading(false);
                    return;
                }

                // 1. Fetch the selected post to get the user ID

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

                // 2. Fetch recent posts from this user (limit to 10 for "More from this author")
                try {

                    const userPostsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', userId),
                        orderBy('createdAt', 'desc'),
                        limit(10)
                    );
                    const postsSnap = await getDocs(userPostsQuery);
                    const userPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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
    }, [id, location.state]);

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
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(127, 255, 212, 0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(127, 255, 212, 0.1)'
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
