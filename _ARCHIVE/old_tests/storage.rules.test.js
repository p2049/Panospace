import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

let testEnv;

describe('Storage Security Rules', () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: 'panospace-test',
            storage: {
                rules: readFileSync('storage.rules', 'utf8'),
                host: 'localhost',
                port: 9199,
            },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    afterEach(async () => {
        await testEnv.clearStorage();
    });

    describe('Posts Storage', () => {
        test('authenticated users can upload to their own posts folder', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'posts/alice/image.jpg');

            await assertSucceeds(
                uploadString(storageRef, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url')
            );
        });

        test('authenticated users cannot upload to other users posts folder', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'posts/bob/image.jpg');

            await assertFails(
                uploadString(storageRef, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url')
            );
        });

        test('unauthenticated users cannot upload', async () => {
            const unauth = testEnv.unauthenticatedContext();
            const storageRef = ref(unauth.storage(), 'posts/alice/image.jpg');

            await assertFails(
                uploadString(storageRef, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url')
            );
        });

        test('public read is disabled for posts', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'posts/alice/image.jpg');

            // Upload with security disabled
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const ref2 = ref(context.storage(), 'posts/alice/image.jpg');
                await uploadString(ref2, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url');
            });

            // Try to read - should fail even when authenticated
            await assertFails(getDownloadURL(storageRef));
        });
    });

    describe('Profile Photos Storage', () => {
        test('authenticated users can upload their own profile photo', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'profile_photos/alice/photo.jpg');

            await assertSucceeds(
                uploadString(storageRef, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url')
            );
        });

        test('authenticated users cannot upload other users profile photos', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'profile_photos/bob/photo.jpg');

            await assertFails(
                uploadString(storageRef, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url')
            );
        });

        test('authenticated users can read profile photos', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const storageRef = ref(alice.storage(), 'profile_photos/bob/photo.jpg');

            // Upload with security disabled
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const ref2 = ref(context.storage(), 'profile_photos/bob/photo.jpg');
                await uploadString(ref2, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url');
            });

            // Should succeed - profile photos are readable
            await assertSucceeds(getDownloadURL(storageRef));
        });

        test('unauthenticated users cannot read profile photos', async () => {
            const unauth = testEnv.unauthenticatedContext();
            const storageRef = ref(unauth.storage(), 'profile_photos/alice/photo.jpg');

            // Upload with security disabled
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const ref2 = ref(context.storage(), 'profile_photos/alice/photo.jpg');
                await uploadString(ref2, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'data_url');
            });

            await assertFails(getDownloadURL(storageRef));
        });
    });
});
