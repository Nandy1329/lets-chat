// Centralized Firebase initialization to ensure the default app exists
// before any feature (Auth/Firestore) is used across the app.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase config for shopping-list-demo-4accc
const firebaseConfig = {
    apiKey: "AIzaSyBuvmkpA_tx7sT96HXPmTxXDpybAZJUc3o",
    authDomain: "shopping-list-demo-4accc.firebaseapp.com",
    projectId: "shopping-list-demo-4accc",
    storageBucket: "shopping-list-demo-4accc.firebasestorage.app",
    messagingSenderId: "912724780140",
    appId: "1:912724780140:web:1392e68dd23b6bef23e449"
};
// Create or reuse the default app (prevents duplicate-app errors on fast refresh)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Feature SDKs bound to this app instance
export const db = getFirestore(app);

// Single, unified dynamic import for the Auth module to avoid duplicate module instances.
let authModulePromise;
const getAuthModule = () => {
    if (!authModulePromise) {
        authModulePromise = import('firebase/auth');
    }
    return authModulePromise;
};

// Async getter to ensure the module is loaded and the provider registered before returning the instance
export const getAuthInstance = async () => {
    const { getAuth, initializeAuth, getReactNativePersistence } = await getAuthModule();

    if (Platform.OS !== 'web') {
        try {
            return initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
        } catch (e) {
            return getAuth(app);
        }
    }
    return getAuth(app);
};

// Convenience helper for anonymous sign-in used by Start screen
export const signInAnonymouslyRN = async () => {
    try {
        const { signInAnonymously } = await getAuthModule();
        const auth = await getAuthInstance();
        return await signInAnonymously(auth);
    } catch (e) {
        // Fallback to compat API in case of provider registration issues in the bundler
        console.warn('[firebase] modular auth failed, falling back to compat:', e?.message || e);
        const compat = await import('firebase/compat/app');
        await import('firebase/compat/auth');
        const firebaseCompat = compat.default || compat;
        // Reuse existing app or initialize
        let appCompat;
        try {
            appCompat = firebaseCompat.app();
        } catch {
            appCompat = firebaseCompat.initializeApp(firebaseConfig);
        }
        return firebaseCompat.auth().signInAnonymously();
    }
};