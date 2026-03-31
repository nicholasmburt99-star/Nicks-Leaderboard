import { initializeApp } from 'firebase/app';
import { getFirestore, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrx-4PdSbwJOgtncTMVVwoKpa3yuxPCQQ",
  authDomain: "nick-s-crm.firebaseapp.com",
  projectId: "nick-s-crm",
  storageBucket: "nick-s-crm.firebasestorage.app",
  messagingSenderId: "1064811073006",
  appId: "1:1064811073006:web:86b00e36f24945c6c592ff",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const CRM_DOC = doc(db, 'crm', 'data');
