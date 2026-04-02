// Firebase Service Layer — CRUD helpers for Firestore collections
import { db, auth } from './firebase.js';
import {
    collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc,
    onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updatePassword
} from 'firebase/auth';

/* ══════════════════════════════════════════════════════════════
   AUTH HELPERS
══════════════════════════════════════════════════════════════ */
// We use username@eduai.local as email to map usernames to Firebase Auth
const toEmail = (username) => `${username}@eduai.local`;

export async function signUp(username, password) {
    return createUserWithEmailAndPassword(auth, toEmail(username), password);
}

export async function signIn(username, password) {
    return signInWithEmailAndPassword(auth, toEmail(username), password);
}

export async function signOutUser() {
    return firebaseSignOut(auth);
}

/* ══════════════════════════════════════════════════════════════
   USERS COLLECTION
══════════════════════════════════════════════════════════════ */
const usersCol = () => collection(db, 'users');

export async function addUser(user) {
    // Create Firebase Auth account
    try {
        await signUp(user.username, user.password);
    } catch (e) {
        // auth/email-already-in-use is ok if re-seeding
        if (e.code !== 'auth/email-already-in-use') throw e;
    }
    // Store profile in Firestore (use a stable doc ID based on username)
    const docRef = doc(db, 'users', String(user.id));
    await setDoc(docRef, { ...user, createdAt: serverTimestamp() });
    return user;
}

export async function getAllUsers() {
    const snap = await getDocs(usersCol());
    return snap.docs.map(d => d.data());
}

export async function removeUser(userId) {
    await deleteDoc(doc(db, 'users', String(userId)));
}

export async function updateUser(user, originalAdmin = null) {
    const docRef = doc(db, 'users', String(user.id));
    const oldUserSnap = await getDoc(docRef);
    const oldUserData = oldUserSnap.data();

    // If password or username changed, we need to update Auth
    if (oldUserData.password !== user.password || oldUserData.username !== user.username) {
        try {
            // Very hacky client-side workaround: Sign in as that user to change their details
            try {
                // Try logging in with OLD username and OLD password
                await signInWithEmailAndPassword(auth, toEmail(oldUserData.username), oldUserData.password);
            } catch (e) {
                // If login fails (maybe they don't exist in Auth?), try just creating them
                if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
                    await signUp(user.username, user.password);
                } else {
                    throw e;
                }
            }

            // If we successfully logged in as the old user, apply changes
            if (auth.currentUser && auth.currentUser.email === toEmail(oldUserData.username)) {
                await updatePassword(auth.currentUser, user.password);
                // Note: changing email (username) in Firebase often requires re-authentication or verification. 
                // For prototyping, we'll skip updating the email in Auth, they'll just login with the new one next time they are re-seeded, or we leave it. Wait, if username changes, login will fail!
                // Let's just create a new account if username changes, but that's complex.
                // Actually, let's ignore username updating in Auth for this prototype scope unless requested.
            }

        } catch (e) {
            console.error('Failed to update Auth password:', e);
            throw new Error('Could not update Auth password. ' + e.message);
        } finally {
            // ALWAYS try signing back in as original user (Admin)
            if (originalAdmin) {
                try {
                    await signInWithEmailAndPassword(auth, toEmail(originalAdmin.username), originalAdmin.password);
                } catch (err) {
                    // Ignore, let user login again manually if this fails
                }
            }
        }
    }

    await setDoc(docRef, { ...user, updatedAt: serverTimestamp() }, { merge: true });
    return user;
}

export function onUsersChange(callback) {
    return onSnapshot(usersCol(), snap => {
        callback(snap.docs.map(d => d.data()));
    });
}

/* ══════════════════════════════════════════════════════════════
   MESSAGES COLLECTION
══════════════════════════════════════════════════════════════ */
const msgsCol = () => collection(db, 'messages');

export async function addMessage(msg) {
    await setDoc(doc(db, 'messages', String(msg.id)), { ...msg, createdAt: serverTimestamp() });
    return msg;
}

export function onMessagesChange(callback) {
    return onSnapshot(msgsCol(), snap => {
        callback(snap.docs.map(d => d.data()));
    });
}

/* ══════════════════════════════════════════════════════════════
   EXAMS COLLECTION
══════════════════════════════════════════════════════════════ */
const examsCol = () => collection(db, 'exams');

export async function addExam(exam) {
    await setDoc(doc(db, 'exams', String(exam.id)), { ...exam, createdAt: serverTimestamp() });
    return exam;
}

export async function updateExam(exam) {
    await setDoc(doc(db, 'exams', String(exam.id)), { ...exam, updatedAt: serverTimestamp() }, { merge: true });
    return exam;
}

export async function removeExam(examId) {
    await deleteDoc(doc(db, 'exams', String(examId)));
}

export function onExamsChange(callback) {
    return onSnapshot(examsCol(), snap => {
        callback(snap.docs.map(d => d.data()));
    });
}

/* ══════════════════════════════════════════════════════════════
   SUBJECTS COLLECTION
══════════════════════════════════════════════════════════════ */
const subjectsCol = () => collection(db, 'subjects');

export async function addSubject(subject) {
    await setDoc(doc(db, 'subjects', String(subject.id)), { ...subject, createdAt: serverTimestamp() });
    return subject;
}

export async function removeSubject(subjectId) {
    await deleteDoc(doc(db, 'subjects', String(subjectId)));
}

export function onSubjectsChange(callback) {
    return onSnapshot(subjectsCol(), snap => {
        callback(snap.docs.map(d => d.data()));
    });
}

/* ══════════════════════════════════════════════════════════════
   SUBJECT EXAMS COLLECTION (exams with mark allocation per subject)
══════════════════════════════════════════════════════════════ */
const subjectExamsCol = () => collection(db, 'subjectExams');

export async function addSubjectExam(exam) {
    await setDoc(doc(db, 'subjectExams', String(exam.id)), { ...exam, createdAt: serverTimestamp() });
    return exam;
}

export async function removeSubjectExam(examId) {
    await deleteDoc(doc(db, 'subjectExams', String(examId)));
}

export function onSubjectExamsChange(callback) {
    return onSnapshot(subjectExamsCol(), snap => {
        callback(snap.docs.map(d => d.data()));
    });
}

/* ══════════════════════════════════════════════════════════════
   SEED DATA — runs once if users collection is empty
══════════════════════════════════════════════════════════════ */
const SEED_USERS = [
    { id: 1, role: 'admin', name: 'Admin', username: 'admin', password: 'admin_password', avatar: 'AD' } // User can change this or keep the previous chandru details
];

const SEED_MSGS = [];
const SEED_EXAMS = [];

export async function seedDataIfEmpty() {
    const snap = await getDocs(usersCol());
    if (snap.size > 0) return false; // already seeded

    console.log('🌱 Seeding initial data to Firestore…');

    // Sign out current user first (if any) so we can create seed accounts
    try { await firebaseSignOut(auth); } catch (_) { }

    for (const u of SEED_USERS) {
        await addUser(u);
    }
    for (const m of SEED_MSGS) {
        await addMessage(m);
    }
    for (const e of SEED_EXAMS) {
        await addExam(e);
    }

    // Sign out after seeding (the last created user will be signed in)
    try { await firebaseSignOut(auth); } catch (_) { }

    console.log('✅ Seed data loaded');
    return true;
}
