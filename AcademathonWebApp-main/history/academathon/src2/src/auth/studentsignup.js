import React from 'react';
import { Link } from 'react-router-dom';
import "./signup.css";
import Button from '../ui/button';
import Layout from '../layout';
import { useState } from 'react';
import firebase from './firebase';
import {collection, setDoc, doc} from "firebase/firestore";
import {db} from "./firebase";
import { useNavigate } from 'react-router-dom';


/*

bio:

bookings:[{}]

name:

email:

pic:

subjects:[]

*/





function StudentSignUp() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [docID,setdocID] = useState('');




  const handleSignUp = async (e) => {
      e.preventDefault();

        await firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
          firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // User signed in successfully, now call createUserProfile
              const user = userCredential.user;
              const uid = user.uid;
              createUserProfile(email,name,bio).then((docRef) => {
                setdocID(docRef);
                console.log("User UID:", uid);
                console.log("SUCCESSFULY Signed Up");
                navigate("/profile");
              }).catch((error) => {
                console.error("Code: ", error.code);
                console.error("Sign-up error:",error.message);
                console.error("Sign-up error:",error.stack);

              });
              // Call your createUserProfile function here
            })
            .catch((error) => {
              // Handle sign-in errors
              const errorCode = error.code;
              const errorMessage = error.message;
              console.error(errorMessage);
            });

          // User signed in successfully
          
          
          
        }).catch((error) => {
          // Handle sign-in errors
          console.error("Sign-up error:",error);
        setError(error.message);
        });

  };

  
  async function createUserProfile(email, name, bio) {
    /*
    This should later be done through node.js server
    */
    const currentUser = firebase.auth().currentUser;
    if(currentUser){
      console.log("USER AUTHENATICATED");
    }else{
      console.log("USER IS NOT AUTHENATICATED!");
    }
    const data = {
      email: email,
      name:name,
      name_lowercase:name.toLowerCase(),
      bio:bio,
      type:"student",
      bookings:[],
      pic:"",
      schedule:{'Monday':[],'Tuesday':[],'Wednesday':[],'Thursday':[],'Friday':[],'Saturday':[],'Sunday':[]},

    };
    return await setDoc(doc(collection(db,"profiles"), currentUser.uid),data);

  }
  
  


  return (
    <div className="signup-container">
      <h2>Student Sign-Up</h2>
      <form onSubmit={handleSignUp}>


        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="signup-button">
          <Button text="SignUp"/>
        </div>      
      </form>
      <div className="error">
      {error && <p>{error.message}</p>}
      </div>
    </div>
  );
}



export default StudentSignUp;