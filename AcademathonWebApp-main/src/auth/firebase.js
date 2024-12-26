import firebase from 'firebase/compat/app'; // Update the import statement
import 'firebase/compat/auth'; // Update the import statement
import { getStorage } from 'firebase/storage';

import { getAuth } from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator} from 'firebase/functions'; 

import {getFirestore, doc,collection,getDoc} from 'firebase/firestore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const firebaseConfig = {
    apiKey: "AIzaSyAL1sZiiI8PPEFe3hXFcbICDkhyttZ5Fdo",
    authDomain: "academathon-84824.firebaseapp.com",
    projectId: "academathon-84824",
    storageBucket: "academathon-84824.appspot.com",
    messagingSenderId: "244642652303",
    appId: "1:244642652303:web:a230784f4e583e09e790fa",
    measurementId: "G-PQD8MVTCQ9"
  };

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const auth = getAuth(app);



if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}


export default firebase;
export { db,storage, functions,auth};