// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyANjxDuYStyCYL9mOF5xc_Dg0oDOGj4iS4",
    authDomain: "torquehub-f4066.firebaseapp.com",
    projectId: "torquehub-f4066",
    storageBucket: "torquehub-f4066.appspot.com",
    messagingSenderId: "531170885794",
    appId: "1:531170885794:web:b94873f93d47dea29297fb",
    measurementId: "G-M90JKM9FJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { storage };