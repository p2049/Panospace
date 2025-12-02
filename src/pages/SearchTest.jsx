import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { generateUserSearchKeywords, generatePostSearchKeywords } from '../utils/searchKeywords';

const SearchTest = () => {
    const { searchUsers, searchPosts } = useSearch();
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('Idle');

    const log = (msg, type = 'info') => {
        setResults(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const clearData = async () => {
        setStatus('Clearing Test Data...');
        const usersRef = collection(db, 'users');
        const postsRef = collection(db, 'posts');

        // Delete test users
        const testUsers = await getDocs(query(usersRef, where('isTest', '==', true)));
        testUsers.forEach(async (doc) => await deleteDoc(doc.ref));

        // Delete test posts
        const testPosts = await getDocs(query(postsRef, where('isTest', '==', true)));
        testPosts.forEach(async (doc) => await deleteDoc(doc.ref));

        log('Cleared old test data', 'success');
    };

    const seedData = async () => {
        setStatus('Seeding Data...');
        try {
            await clearData();

            // 1. Seed Users
            const user1 = {
                displayName: 'John Doe',
                username: 'johndoe',
                bio: 'Digital artist from NY',
                email: 'john@example.com',
                artTypes: ['Digital Art'],
                isTest: true,
                photoURL: 'https://via.placeholder.com/150'
            };
            user1.searchKeywords = generateUserSearchKeywords(user1);
            await addDoc(collection(db, 'users'), user1);

            const user2 = {
                displayName: 'Alice Smith',
                username: 'alice_art',
                bio: 'Lover of photography',
                email: 'alice@example.com',
                artTypes: ['Photography'],
                isTest: true,
                photoURL: 'https://via.placeholder.com/150'
            };
            user2.searchKeywords = generateUserSearchKeywords(user2);
            await addDoc(collection(db, 'users'), user2);

            // 2. Seed Posts
            const post1 = {
                title: 'Sunset Over Lake',
                authorName: 'John Doe',
                tags: ['landscape', 'nature', 'sunset', 'Digital Art'],
                location: { city: 'Chicago', state: 'Illinois', country: 'USA' },
                createdAt: new Date(),
                isTest: true,
                items: [{ type: 'image', url: 'https://via.placeholder.com/300' }]
            };
            post1.searchKeywords = generatePostSearchKeywords(post1);
            console.log('Post 1 searchKeywords:', post1.searchKeywords);
            await addDoc(collection(db, 'posts'), post1);

            const post2 = {
                title: 'City Portrait',
                authorName: 'Alice Smith',
                tags: ['portrait', 'city', 'urban', 'Photography'],
                location: { city: 'New York', state: 'NY', country: 'USA' },
                createdAt: new Date(),
                isTest: true,
                items: [{ type: 'image', url: 'https://via.placeholder.com/300' }]
            };
            post2.searchKeywords = generatePostSearchKeywords(post2);
            console.log('Post 2 searchKeywords:', post2.searchKeywords);
            await addDoc(collection(db, 'posts'), post2);

            log('Data Seeded Successfully', 'success');
            setStatus('Ready');
        } catch (err) {
            log(`Seeding failed: ${err.message}`, 'error');
            setStatus('Error');
        }
    };

    const runTests = async () => {
        setStatus('Running Tests...');
        setResults([]); // Clear logs
        let passed = 0;
        let total = 0;

        const assert = (condition, name) => {
            total++;
            if (condition) {
                passed++;
                log(`✅ ${name}`, 'success');
            } else {
                log(`❌ ${name}`, 'error');
            }
        };

        try {
            // Test A: Artist Search
            const { data: resA1 } = await searchUsers('john');
            assert(resA1.some(u => u.displayName === 'John Doe'), 'Artist: "john" finds John Doe');

            const { data: resA2 } = await searchUsers('alice');
            assert(resA2.some(u => u.displayName === 'Alice Smith'), 'Artist: "alice" finds Alice Smith');

            const { data: resA3 } = await searchUsers('digital');
            assert(resA3.some(u => u.displayName === 'John Doe'), 'Artist: "digital" (bio) finds John Doe');

            // Test B: Title Search
            const { data: resB1 } = await searchPosts('Sunset');
            console.log('[TEST B1] Searching for "Sunset", found:', resB1.map(p => p.title));
            assert(resB1.some(p => p.title === 'Sunset Over Lake'), 'Title: "Sunset" finds Post 1');

            const { data: resB2 } = await searchPosts('lake');
            console.log('[TEST B2] Searching for "lake", found:', resB2.map(p => p.title));
            assert(resB2.some(p => p.title === 'Sunset Over Lake'), 'Title: "lake" finds Post 1');

            // Test C: Tag Search
            const { data: resC1 } = await searchPosts('landscape');
            assert(resC1.some(p => p.title === 'Sunset Over Lake'), 'Tag: "landscape" finds Post 1');

            // Test D: Location Search
            const { data: resD1 } = await searchPosts('Chicago');
            assert(resD1.some(p => p.title === 'Sunset Over Lake'), 'Location: "Chicago" finds Post 1');

            const { data: resD2 } = await searchPosts('', { location: 'Illinois' });
            assert(resD2.some(p => p.title === 'Sunset Over Lake'), 'Location Filter: "Illinois" finds Post 1');

            // Test E: Art Type Search
            const { data: resE1 } = await searchPosts('', { artTypes: ['Photography'] });
            assert(resE1.some(p => p.title === 'City Portrait'), 'Art Type: "Photography" finds Post 2');
            assert(!resE1.some(p => p.title === 'Sunset Over Lake'), 'Art Type: "Photography" excludes Post 1');

            // Test F: Combined Search
            const { data: resF1 } = await searchPosts('sunset', { location: 'Chicago' });
            assert(resF1.some(p => p.title === 'Sunset Over Lake'), 'Combined: "sunset" + "Chicago" finds Post 1');

            const { data: resF2 } = await searchPosts('sunset', { location: 'New York' });
            assert(resF2.length === 0, 'Combined: "sunset" + "New York" returns 0 results');

            setStatus(`Tests Complete: ${passed}/${total} Passed`);

        } catch (err) {
            log(`Test Execution Failed: ${err.message}`, 'error');
            setStatus('Error');
        }
    };

    return (
        <div style={{ padding: '2rem', background: '#111', color: '#fff', minHeight: '100vh' }}>
            <h1>Search Test Harness</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={seedData} style={{ padding: '10px', background: '#333', color: '#fff' }}>
                    1. Seed Data
                </button>
                <button onClick={runTests} style={{ padding: '10px', background: '#007bff', color: '#fff' }}>
                    2. Run Tests
                </button>
                <button onClick={clearData} style={{ padding: '10px', background: '#d9534f', color: '#fff' }}>
                    3. Clear Data
                </button>
            </div>

            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Status: {status}</div>

            <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                {results.map((res, i) => (
                    <div key={i} style={{
                        color: res.type === 'success' ? '#4caf50' : res.type === 'error' ? '#f44336' : '#fff',
                        marginBottom: '4px'
                    }}>
                        [{res.time}] {res.msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchTest;
