#!/usr/bin/env node

/**
 * Firestore Index Creation Helper
 * 
 * This script provides the Firebase CLI commands to create all required indexes.
 * Run this from your project root AFTER installing Firebase CLI globally.
 * 
 * Installation: npm install -g firebase-tools
 * Login: firebase login
 * Then run: node scripts/createIndexes.js
 */

const indexes = [
    {
        collection: 'posts',
        fields: [
            { field: 'searchKeywords', mode: 'ARRAY_CONTAINS' },
            { field: 'createdAt', mode: 'DESCENDING' }
        ]
    },
    {
        collection: 'posts',
        fields: [
            { field: 'tags', mode: 'ARRAY_CONTAINS' },
            { field: 'createdAt', mode: 'DESCENDING' }
        ]
    },
    {
        collection: 'posts',
        fields: [
            { field: 'authorId', mode: 'ASCENDING' },
            { field: 'createdAt', mode: 'DESCENDING' }
        ]
    }
];

console.log('🔥 FIRESTORE INDEX CREATION COMMANDS\n');
console.log('Run these commands one at a time:\n');

indexes.forEach((index, i) => {
    const fieldsStr = index.fields.map(f => `${f.field}:${f.mode.toLowerCase()}`).join(',');
    console.log(`${i + 1}. firebase firestore:indexes:create --collection-group=${index.collection} --field=${fieldsStr}`);
});

console.log('\n📌 Or use the Firebase Console links in FIRESTORE_INDEXES.md\n');
