import { auth, db } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';

export const authService = {
    async register(email: string, password: string, name: string, phone: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData: User = {
            uid: user.uid,
            name,
            email,
            phone,
            address: [],
            role: 'customer',
            notificationsEnabled: true
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        return userData;
    },

    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        throw new Error('User document not found');
    },

    async logout() {
        await signOut(auth);
    },

    async resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    },

    async getUserProfile(uid: string) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    },

    async updateUserProfile(uid: string, data: Partial<User>) {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
    }
};
