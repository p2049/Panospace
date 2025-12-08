import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';

const Debug = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Running Debug Query...");
                const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));

                const snapshot = await getDocs(q);
                console.log("Snapshot size:", snapshot.size);

                const posts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setData(posts);
            } catch (err) {
                console.error("Debug Query Error:", err);
                setData({ error: err.message, code: err.code });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ padding: '20px', background: '#fff', color: '#000', minHeight: '100vh' }}>
            <h1>Debug Data - Latest 20 Posts</h1>
            {loading ? <p>Loading...</p> : (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
};

export default Debug;
