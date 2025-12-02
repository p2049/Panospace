"use strict";
/**
 * Search/Algolia Integration Cloud Functions
 *
 * Handles indexing users and posts in Algolia search service
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexPostInAlgolia = exports.indexUserInAlgolia = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Algolia configuration
// Note: Algolia is optional. If not configured, search falls back to Firestore
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || ((_a = functions.config().algolia) === null || _a === void 0 ? void 0 : _a.app_id) || '';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || ((_b = functions.config().algolia) === null || _b === void 0 ? void 0 : _b.admin_key) || '';
let algoliaClient = null;
let postsIndex = null;
let usersIndex = null;
if (ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY) {
    const algoliasearch = require('algoliasearch');
    algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    postsIndex = algoliaClient.initIndex('posts');
    usersIndex = algoliaClient.initIndex('users');
    console.log('Algolia initialized successfully');
}
else {
    console.warn('Algolia not configured - search will use Firestore fallback');
}
/**
 * Callable Function: Index a user in Algolia
 */
exports.indexUserInAlgolia = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing userId');
    }
    if (!usersIndex) {
        return { success: false, message: 'Algolia not configured' };
    }
    try {
        // Fetch user
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        // Index in Algolia
        await usersIndex.saveObject({
            objectID: userId,
            userId,
            displayName: userData.displayName || '',
            username: userData.username || '',
            bio: userData.bio || '',
            photoURL: userData.photoURL || '',
            keywords: userData.searchKeywords || []
        });
        console.log(`Indexed user ${userId} in Algolia`);
        return { success: true };
    }
    catch (error) {
        console.error('Error indexing user:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * Callable Function: Index a post in Algolia
 */
exports.indexPostInAlgolia = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { postId } = data;
    if (!postId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing postId');
    }
    if (!postsIndex) {
        return { success: false, message: 'Algolia not configured' };
    }
    try {
        // Fetch post
        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Post not found');
        }
        const postData = postDoc.data();
        // Index in Algolia
        await postsIndex.saveObject({
            objectID: postId,
            postId,
            authorId: postData.authorId || '',
            authorName: postData.authorName || '',
            title: postData.title || '',
            description: postData.description || '',
            tags: postData.tags || [],
            imageUrl: postData.imageUrl || '',
            location: postData.location || {},
            createdAt: ((_a = postData.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) || 0,
            shopLinked: postData.shopLinked || false,
            keywords: postData.searchKeywords || []
        });
        console.log(`Indexed post ${postId} in Algolia`);
        return { success: true };
    }
    catch (error) {
        console.error('Error indexing post:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=search.js.map