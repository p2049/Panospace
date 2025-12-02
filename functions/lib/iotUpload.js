"use strict";
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
exports.iotUpload = void 0;
// functions/src/iotUpload.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const buffer_1 = require("buffer");
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();
/**
 * HTTP endpoint for IoT devices to upload a photo and create a post.
 *
 * Expected JSON body:
 *   {
 *     "deviceId": "string",          // identifier of the device
 *     "imageBase64": "string",      // JPEG/PNG data as base64
 *     "title": "optional string",
 *     "caption": "optional string",
 *     "tags": ["optional", "array"],
 *     "location": "optional string"
 *   }
 *
 * Authentication: simple shared secret passed as `Authorization: Bearer <secret>`.
 * The secret is stored in Functions config: `functions.config().iot.secret`.
 */
exports.iotUpload = functions.https.onRequest(async (req, res) => {
    var _a;
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }
    const secret = (_a = functions.config().iot) === null || _a === void 0 ? void 0 : _a.secret;
    const authHeader = req.headers["authorization"];
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
        return res.status(401).send("Unauthorized");
    }
    const { deviceId, imageBase64, title, caption, tags, location } = req.body;
    if (!deviceId || !imageBase64) {
        return res.status(400).send("Missing required fields: deviceId and imageBase64");
    }
    // Decode base64 image data
    const buffer = buffer_1.Buffer.from(imageBase64, "base64");
    const fileName = `iot/${deviceId}/${Date.now()}_${(0, uuid_1.v4)()}.jpg`;
    const file = bucket.file(fileName);
    try {
        // Upload to Cloud Storage
        await file.save(buffer, {
            metadata: { contentType: "image/jpeg" },
        });
        // Generate a signed URL (valid 24h) for the UI to display
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 24 * 60 * 60 * 1000,
        });
        // Create a Firestore post document
        const postRef = await db.collection("posts").add({
            title: title || "IoT Upload",
            caption: caption || "",
            imageUrl: url,
            authorUid: "iot-device", // placeholder – you can map deviceId → user later
            deviceId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            visibility: "public",
            tags: tags || [],
            location: location || "",
        });
        res.json({ success: true, postId: postRef.id, imageUrl: url });
    }
    catch (err) {
        console.error("IoT upload error:", err);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=iotUpload.js.map