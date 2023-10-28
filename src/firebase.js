import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvrfocVBx3iSi3UNtUPDKYDhULbDe7Gaw",
  authDomain: "web2-projekt1.firebaseapp.com",
  projectId: "web2-projekt1",
  storageBucket: "web2-projekt1.appspot.com",
  messagingSenderId: "914514286485",
  appId: "1:914514286485:web:df296a2fc45c0f6425889c",
  measurementId: "G-KFQ0QGQYWB"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);