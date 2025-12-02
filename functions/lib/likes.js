"use strict";
/**
 * Likes Domain Cloud Functions
 *
 * Handles like/unlike triggers to maintain accurate like counts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLikeDelete = exports.onLikeCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Trigger: When a like is created
 * Action: Increment the post's like count
 */
exports.onLikeCreate = functions.firestore
    .document('likes/{likeId}')
    .onCreate(async (snapshot, context) => {
    const likeData = snapshot.data();
    const postId = likeData.postId;
    if (!postId) {
        console.warn('Like document missing postId');
        return;
    }
    try {
        await db.collection('posts').doc(postId).update({
            likeCount: admin.firestore.FieldValue.increment(1)
        });
        console.log(`Incremented like count for post ${postId}`);
    }
    catch (error) {
        console.error(`Error incrementing like count for post ${postId}:`, error);
    }
});
/**
 * Trigger: When a like is deleted
 * Action: Decrement the post's like count
 */
exports.onLikeDelete = functions.firestore
    .document('likes/{likeId}')
    .onDelete(async (snapshot, context) => {
    const likeData = snapshot.data();
    const postId = likeData.postId;
    if (!postId) {
        console.warn('Like document missing postId');
        return;
    }
    try {
        await db.collection('posts').doc(postId).update({
            likeCount: admin.firestore.FieldValue.increment(-1)
        });
        console.log(`Decremented like count for post ${postId}`);
    }
    catch (error) {
        console.error(`Error decrementing like count for post ${postId}:`, error);
    }
});
//# sourceMappingURL=likes.js.map