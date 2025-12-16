import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCPVs7JvYem7o4V7NtAUxTIUelza84ECD8",
    authDomain: "lets-chat-396b6.firebaseapp.com",
    projectId: "lets-chat-396b6",
    storageBucket: "lets-chat-396b6.appspot.com",
    messagingSenderId: "594184860005",
    appId: "1:594184860005:web:51f6ae8b0c517105b3318c",
    measurementId: "G-WMP2RGGL8N"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

let auth;
try {
    auth = getAuth(app);
} catch {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

export { app, db, auth };