import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { setDoc, doc, getDoc, addDoc, collection, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv;

describe('Firestore Security Rules', () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: 'panospace-test',
            firestore: {
                rules: readFileSync('firestore.rules', 'utf8'),
                host: 'localhost',
                port: 8080,
            },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    afterEach(async () => {
        await testEnv.clearFirestore();
    });

    describe('Users Collection', () => {
        test('authenticated users can read any user profile', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const userRef = doc(alice.firestore(), 'users', 'bob');

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users', 'bob'), {
                    displayName: 'Bob',
                    bio: 'Test bio',
                });
            });

            await assertSucceeds(getDoc(userRef));
        });

        test('unauthenticated users cannot read user profiles', async () => {
            const unauth = testEnv.unauthenticatedContext();
            const userRef = doc(unauth.firestore(), 'users', 'bob');

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users', 'bob'), {
                    displayName: 'Bob',
                });
            });

            await assertFails(getDoc(userRef));
        });

        test('users can create their own profile', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const userRef = doc(alice.firestore(), 'users', 'alice');

            await assertSucceeds(
                setDoc(userRef, {
                    displayName: 'Alice',
                    bio: 'My bio',
                })
            );
        });

        test('users cannot create profiles for other users', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const userRef = doc(alice.firestore(), 'users', 'bob');

            await assertFails(
                setDoc(userRef, {
                    displayName: 'Bob',
                })
            );
        });

        test('users can update their own profile', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const userRef = doc(alice.firestore(), 'users', 'alice');

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users', 'alice'), {
                    displayName: 'Alice',
                });
            });

            await assertSucceeds(
                updateDoc(userRef, {
                    bio: 'Updated bio',
                })
            );
        });

        test('users cannot update other users profiles', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const userRef = doc(alice.firestore(), 'users', 'bob');

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users', 'bob'), {
                    displayName: 'Bob',
                });
            });

            await assertFails(
                updateDoc(userRef, {
                    bio: 'Hacked bio',
                })
            );
        });
    });

    describe('Posts Collection', () => {
        test('authenticated users can read posts', async () => {
            const alice = testEnv.authenticatedContext('alice');

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await addDoc(collection(context.firestore(), 'posts'), {
                    authorId: 'bob',
                    title: 'Test Post',
                });
            });

            const postsRef = collection(alice.firestore(), 'posts');
            await assertSucceeds(getDoc(doc(postsRef, 'testpost')));
        });

        test('unauthenticated users cannot read posts', async () => {
            const unauth = testEnv.unauthenticatedContext();
            const postRef = doc(unauth.firestore(), 'posts', 'testpost');

            await assertFails(getDoc(postRef));
        });

        test('users can create posts with their own authorId', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const postsRef = collection(alice.firestore(), 'posts');

            await assertSucceeds(
                addDoc(postsRef, {
                    authorId: 'alice',
                    title: 'My Post',
                    items: [],
                    createdAt: new Date(),
                })
            );
        });

        test('users cannot create posts with another users authorId', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const postsRef = collection(alice.firestore(), 'posts');

            await assertFails(
                addDoc(postsRef, {
                    authorId: 'bob',
                    title: 'Fake Post',
                    items: [],
                })
            );
        });

        test('users can update their own posts', async () => {
            const alice = testEnv.authenticatedContext('alice');
            let postId;

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const docRef = await addDoc(collection(context.firestore(), 'posts'), {
                    authorId: 'alice',
                    title: 'Original Title',
                });
                postId = docRef.id;
            });

            const postRef = doc(alice.firestore(), 'posts', postId);
            await assertSucceeds(
                updateDoc(postRef, {
                    title: 'Updated Title',
                })
            );
        });

        test('users cannot update other users posts', async () => {
            const alice = testEnv.authenticatedContext('alice');
            let postId;

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const docRef = await addDoc(collection(context.firestore(), 'posts'), {
                    authorId: 'bob',
                    title: 'Bobs Post',
                });
                postId = docRef.id;
            });

            const postRef = doc(alice.firestore(), 'posts', postId);
            await assertFails(
                updateDoc(postRef, {
                    title: 'Hacked Title',
                })
            );
        });

        test('users can delete their own posts', async () => {
            const alice = testEnv.authenticatedContext('alice');
            let postId;

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const docRef = await addDoc(collection(context.firestore(), 'posts'), {
                    authorId: 'alice',
                    title: 'To Delete',
                });
                postId = docRef.id;
            });

            const postRef = doc(alice.firestore(), 'posts', postId);
            await assertSucceeds(deleteDoc(postRef));
        });

        test('users cannot delete other users posts', async () => {
            const alice = testEnv.authenticatedContext('alice');
            let postId;

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const docRef = await addDoc(collection(context.firestore(), 'posts'), {
                    authorId: 'bob',
                    title: 'Bobs Post',
                });
                postId = docRef.id;
            });

            const postRef = doc(alice.firestore(), 'posts', postId);
            await assertFails(deleteDoc(postRef));
        });
    });
});
