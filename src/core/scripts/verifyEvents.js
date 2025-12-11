
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { logger } from '../utils/logger';

const verify = async () => {
    try {
        logger.log("Verifying events_global...");
        const snapshot = await getDocs(collection(db, 'events_global'));
        logger.log(`Found ${snapshot.size} global events.`);
        if (snapshot.size > 0) {
            const first = snapshot.docs[0].data();
            logger.log("Sample event:", JSON.stringify(first, null, 2));
            logger.log("Date type:", typeof first.date, first.date?.constructor?.name);
            if (first.date && typeof first.date.toDate === 'function') {
                logger.log("Date.toDate() works:", first.date.toDate());
            } else {
                logger.log("Date is not a Timestamp with toDate()");
            }
        }
    } catch (error) {
        logger.error("Error verification:", error);
    }
};

verify();
