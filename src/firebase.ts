import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

//初期化
const firebaseApp = firebase.initializeApp(firebaseConfig);

//react 内で使えるようにする
export const db = firebaseApp.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
//コンポーネント内でも使用できるようにする。
export const provider = new firebase.auth.GoogleAuthProvider();