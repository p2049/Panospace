import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import Post from '../components/Post';
import { FaRedo } from 'react-icons/fa';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const fetchPosts = async (isLoadMore = false) => {
        try {
            setLoading(true);
            const postsRef = collection(db, 'posts');
            const BATCH_SIZE = 10;

            let q = query(postsRef, orderBy('createdAt', 'desc'), limit(BATCH_SIZE));

            if (isLoadMore && lastDoc) {
                q = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(BATCH_SIZE));
            }

            const snapshot = await getDocs(q);
            const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (isLoadMore) {
                setPosts(prev => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }

            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            setHasMore(snapshot.docs.length === BATCH_SIZE);

        } catch (err) {
            console.error("Error fetching feed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const lastPostElementRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts(true);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#000', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
            {posts.map((post, index) => {
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post.id} style={{ scrollSnapAlign: 'start' }}>
                            <Post post={post} />
                        </div>
                    );
                } else {
                    return (
                        <div key={post.id} style={{ scrollSnapAlign: 'start' }}>
                            <Post post={post} />
                        </div>
                    );
                }
            })}

            {loading && (
                <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', scrollSnapAlign: 'start' }}>
                    Loading...
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to Panospace</h2>
                    <p style={{ color: '#aaa', maxWidth: '400px', marginBottom: '1.5rem' }}>Your feed is empty. Start by following artists or creating your own masterpiece.</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => fetchPosts()} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaRedo /> Refresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;
