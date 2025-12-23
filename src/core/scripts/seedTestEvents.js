
import { db } from '../../firebase.js';
import { collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { logger } from '../utils/logger';

export const seedTestEvents = async () => {
    const batch = writeBatch(db);
    const date = new Date();

    // Create timestamps for today, tomorrow, and next week
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    const eventsToCreate = [
        {
            title: "Panospace Launch Party",
            description: "Join us for the official launch of Panospace! Share your best shots from the platform.",
            eventType: "contest",
            active: true,
            visibleDate: Timestamp.fromDate(today),
            eventDate: Timestamp.fromDate(today),
            startTime: Timestamp.fromDate(today),
            expiresAt: Timestamp.fromDate(nextWeek),
            requiredTags: ["panolaunch", "firstpost"],
            creatorName: "Panospace Team",
            creatorId: "system",
            location: "Global",
            requirements: {
                camera: "Any",
                filmStock: "Any"
            }
        },
        {
            title: "Neon Nights Walk",
            description: "Capture the city lights this evening. Look for reflections and vibrant colors.",
            eventType: "contest",
            active: true,
            visibleDate: Timestamp.fromDate(today),
            eventDate: Timestamp.fromDate(today),
            startTime: Timestamp.fromDate(today),
            expiresAt: Timestamp.fromDate(tomorrow),
            requiredTags: ["neonnights", "city"],
            creatorName: "Panospace Team",
            creatorId: "system",
            location: "City Center",
            requirements: {
                filmStock: "CineStill 800T"
            }
        },
        {
            title: "Quiet Mornings",
            description: "A prompt for early risers. Capture the stillness of 6AM.",
            eventType: "prompt",
            active: true,
            visibleDate: Timestamp.fromDate(tomorrow),
            eventDate: Timestamp.fromDate(tomorrow),
            startTime: Timestamp.fromDate(tomorrow),
            expiresAt: Timestamp.fromDate(nextWeek),
            requiredTags: ["morning", "quiet"],
            creatorName: "Panospace Team",
            creatorId: "system",
            location: "Anywhere"
        }
    ];

    eventsToCreate.forEach((evt, index) => {
        const id = `test_event_${index}_${Date.now()}`;
        const ref = doc(collection(db, 'events'), id);
        batch.set(ref, evt);
    });

    try {
        await batch.commit();
        console.log("Successfully seeded test events.");
        return true;
    } catch (error) {
        console.error("Error seeding test events:", error);
        return false;
    }
};
