
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';

const verify = async () => {
    try {
        console.log("Verifying events_global...");
        const snapshot = await getDocs(collection(db, 'events_global'));
        console.log(`Found ${snapshot.size} global events.`);
        if (snapshot.size > 0) {
            const first = snapshot.docs[0].data();
            console.log("Sample event:", JSON.stringify(first, null, 2));
            console.log("Date type:", typeof first.date, first.date?.constructor?.name);
            if (first.date && typeof first.date.toDate === 'function') {
                console.log("Date.toDate() works:", first.date.toDate());
            } else {
                console.log("Date is not a Timestamp with toDate()");
            }
        }
    } catch (error) {
        console.error("Error verification:", error);
    }
};

verify();
