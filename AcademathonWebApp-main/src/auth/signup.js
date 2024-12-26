import React from 'react';
import "./signup.css";
import Button from '../ui/button';
import { useState } from 'react';
import firebase from './firebase';
import {collection, setDoc, doc} from "firebase/firestore";
import {db} from "./firebase";
import { useNavigate } from 'react-router-dom';
import {sendEmailVerification} from 'firebase/auth';


/*

bio:

bookings:[{}]

name:

email:

pic:

subjects:[]

*/





function SignUpPage() {
  
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

      let uid;

      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;


      await sendEmailVerification(user);

      await createUserProfile(email,name,bio).then((docRef) => {
            setdocID(docRef);
            console.log("User UID:", uid);
            console.log("SUCCESSFULY Signed Up");
            navigate("/profile");
          }).catch((error) => {
            console.error("Code: ", error.code);
            console.error("Sign-up error:",error.message);
            console.error("Sign-up error:",error.stack);
          });
  };

  
  async function createUserProfile(email, name, bio) {
    /*
    This should later be done through node.js server
    THIS SHOULD BE DONE THROUGH node.js server

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
      type:"tutor",
      subjects:["TBD"],
      bookings:[],
      image_path: "Images/avatar-3814049_1280.png",
      pic:"",
      approved:false,
      schedule:{'Monday':[],'Tuesday':[],'Wednesday':[],'Thursday':[],'Friday':[],'Saturday':[],'Sunday':[]},

    };

    console.log("Data to be saved:", data);
    return await setDoc(doc(collection(db,"profiles"), currentUser.uid),data);

  }
  
  


  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>


        <input
          className='custom-input'
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='custom-input'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className='custom-input'
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <input
          className='custom-input'
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className='custom-input'
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="signup-button">
          <Button text="Sign Up"/>
        </div>      
      </form>
      <div className="error">
      {error && <p>{error}</p>}
      </div>

    </div>
  );
}



export default SignUpPage;