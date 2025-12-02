// Run this in browser console to check Firestore index status
// Open: http://localhost:5176 and paste in console

(async () => {
    const { collection, query, where, orderBy, getDocs } = window;
    const db = window.db;
    const auth = window.auth;

    const user = auth.currentUser;
    if (!user) {
        console.log('❌ No user logged in');
        return;
    }

    console.log('✅ User:', user.email);
    console.log('Checking indexes...\n');

    // Test posts index
    try {
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        console.log(`✅ Posts index READY - Found ${postsSnapshot.size} posts`);
    } catch (err) {
        console.log('❌ Posts index NOT READY:', err.message);
    }

    // Test shopItems index
    try {
        const shopQuery = query(
            collection(db, 'shopItems'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const shopSnapshot = await getDocs(shopQuery);
        console.log(`✅ Shop index READY - Found ${shopSnapshot.size} items`);
    } catch (err) {
        console.log('❌ Shop index NOT READY:', err.message);
    }
})();
