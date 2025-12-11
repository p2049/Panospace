
import { db } from '../../firebase.js';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { logger } from '../utils/logger';

const FULL_MOONS = [
    { "dateUTC": "2025-01-13T22:28Z", "name": "Wolf Moon" },
    { "dateUTC": "2025-02-12T15:53Z", "name": "Snow Moon" },
    { "dateUTC": "2025-03-14T07:54Z", "name": "Worm Moon" },
    { "dateUTC": "2025-04-13T00:22Z", "name": "Pink Moon" },
    { "dateUTC": "2025-05-12T15:55Z", "name": "Flower Moon" },
    { "dateUTC": "2025-06-11T06:42Z", "name": "Strawberry Moon" },
    { "dateUTC": "2025-07-10T18:05Z", "name": "Buck Moon" },
    { "dateUTC": "2025-08-09T03:56Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2025-09-07T11:09Z", "name": "Harvest Moon" },
    { "dateUTC": "2025-10-06T18:45Z", "name": "Hunter's Moon" },
    { "dateUTC": "2025-11-05T02:20Z", "name": "Beaver Moon" },
    { "dateUTC": "2025-12-04T11:14Z", "name": "Cold Moon" },

    { "dateUTC": "2026-01-03T00:03Z", "name": "Wolf Moon" },
    { "dateUTC": "2026-02-01T16:10Z", "name": "Snow Moon" },
    { "dateUTC": "2026-03-03T10:38Z", "name": "Worm Moon" },
    { "dateUTC": "2026-04-02T05:12Z", "name": "Pink Moon" },
    { "dateUTC": "2026-05-01T22:44Z", "name": "Flower Moon" },
    { "dateUTC": "2026-05-31T15:45Z", "name": "Strawberry Moon" },
    { "dateUTC": "2026-06-30T05:55Z", "name": "Buck Moon" },
    { "dateUTC": "2026-07-29T17:38Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2026-08-28T03:11Z", "name": "Harvest Moon" },
    { "dateUTC": "2026-09-26T11:49Z", "name": "Hunter's Moon" },
    { "dateUTC": "2026-10-25T20:11Z", "name": "Beaver Moon" },
    { "dateUTC": "2026-11-24T05:49Z", "name": "Cold Moon" },

    { "dateUTC": "2027-01-23T17:17Z", "name": "Wolf Moon" },
    { "dateUTC": "2027-02-22T08:12Z", "name": "Snow Moon" },
    { "dateUTC": "2027-03-24T01:43Z", "name": "Worm Moon" },
    { "dateUTC": "2027-04-22T18:51Z", "name": "Pink Moon" },
    { "dateUTC": "2027-05-22T11:37Z", "name": "Flower Moon" },
    { "dateUTC": "2027-06-21T02:13Z", "name": "Strawberry Moon" },
    { "dateUTC": "2027-07-20T16:00Z", "name": "Buck Moon" },
    { "dateUTC": "2027-08-19T03:27Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2027-09-17T12:03Z", "name": "Harvest Moon" },
    { "dateUTC": "2027-10-16T19:58Z", "name": "Hunter's Moon" },
    { "dateUTC": "2027-11-15T04:28Z", "name": "Beaver Moon" },
    { "dateUTC": "2027-12-14T13:05Z", "name": "Cold Moon" },

    { "dateUTC": "2028-01-13T00:45Z", "name": "Wolf Moon" },
    { "dateUTC": "2028-02-11T15:12Z", "name": "Snow Moon" },
    { "dateUTC": "2028-03-12T06:31Z", "name": "Worm Moon" },
    { "dateUTC": "2028-04-10T22:58Z", "name": "Pink Moon" },
    { "dateUTC": "2028-05-10T15:40Z", "name": "Flower Moon" },
    { "dateUTC": "2028-06-09T06:20Z", "name": "Strawberry Moon" },
    { "dateUTC": "2028-07-08T18:12Z", "name": "Buck Moon" },
    { "dateUTC": "2028-08-07T05:19Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2028-09-05T14:39Z", "name": "Harvest Moon" },
    { "dateUTC": "2028-10-05T00:03Z", "name": "Hunter's Moon" },
    { "dateUTC": "2028-11-03T09:17Z", "name": "Beaver Moon" },
    { "dateUTC": "2028-12-02T19:11Z", "name": "Cold Moon" },

    { "dateUTC": "2029-01-01T06:10Z", "name": "Wolf Moon" },
    { "dateUTC": "2029-01-30T18:45Z", "name": "Blue Moon" },
    { "dateUTC": "2029-03-01T09:14Z", "name": "Worm Moon" },
    { "dateUTC": "2029-03-31T00:24Z", "name": "Pink Moon" },
    { "dateUTC": "2029-04-29T15:06Z", "name": "Flower Moon" },
    { "dateUTC": "2029-05-29T04:35Z", "name": "Strawberry Moon" },
    { "dateUTC": "2029-06-27T17:28Z", "name": "Buck Moon" },
    { "dateUTC": "2029-07-27T06:22Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2029-08-25T19:54Z", "name": "Harvest Moon" },
    { "dateUTC": "2029-09-24T08:42Z", "name": "Hunter's Moon" },
    { "dateUTC": "2029-10-23T22:06Z", "name": "Beaver Moon" },
    { "dateUTC": "2029-11-22T12:09Z", "name": "Cold Moon" },

    { "dateUTC": "2030-01-21T01:15Z", "name": "Wolf Moon" },
    { "dateUTC": "2030-02-19T15:00Z", "name": "Snow Moon" },
    { "dateUTC": "2030-03-21T05:41Z", "name": "Worm Moon" },
    { "dateUTC": "2030-04-19T20:12Z", "name": "Pink Moon" },
    { "dateUTC": "2030-05-19T10:30Z", "name": "Flower Moon" },
    { "dateUTC": "2030-06-18T01:02Z", "name": "Strawberry Moon" },
    { "dateUTC": "2030-07-17T14:50Z", "name": "Buck Moon" },
    { "dateUTC": "2030-08-16T03:32Z", "name": "Sturgeon Moon" },
    { "dateUTC": "2030-09-14T15:02Z", "name": "Harvest Moon" },
    { "dateUTC": "2030-10-14T01:18Z", "name": "Hunter's Moon" },
    { "dateUTC": "2030-11-12T11:33Z", "name": "Beaver Moon" },
    { "dateUTC": "2030-12-11T21:55Z", "name": "Cold Moon" }
];

export const seedFullMoons = async () => {
    const batch = writeBatch(db);
    const eventsRef = collection(db, "events_global");

    FULL_MOONS.forEach((moon) => {
        // Create a precise timestamp from the UTC string
        const eventDate = new Date(moon.dateUTC);
        if (isNaN(eventDate.getTime())) {
            logger.error(`Invalid date for ${moon.name}: ${moon.dateUTC}`);
            return;
        }

        const id = `moon_${moon.dateUTC.replace(/[:\\.]/g, '')}`;
        const docRef = doc(eventsRef, id);

        batch.set(docRef, {
            type: "celestial",
            subtype: "full_moon",
            title: moon.name,
            date: Timestamp.fromDate(eventDate),
            dateString: moon.dateUTC, // Store text for reference
            description: `The ${moon.name} full moon.`,
            icon: "moon",
            region: "global",
            hemisphere: "both"
        });
    });

    try {
        await batch.commit();
        logger.log(`Successfully seeded ${FULL_MOONS.length} full moon events.`);
    } catch (error) {
        logger.error("Error seeding full moons:", error);
    }
};
