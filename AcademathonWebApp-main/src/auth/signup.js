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
    <><div className='greenblock'>
      <div className='title'>
      academathon
      </div>
    
    
      <div className="signup-container">
        <form onSubmit={handleSignUp}>
        <h2 className='starttext'>Let's ~get started</h2>
        <h3 className='undertext'>Welcome! Begin with setting up your account </h3>
          <text className='text'>First name</text>
          <input
            className='custom-input'
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
         
          <text className='text'>Email</text>
          <input
            className='custom-input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <text className='text'>Password</text>
          <input
            className='custom-input'
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <text className='text'>Confirm Password</text>
          <input
            className='custom-input'
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="signup-button">
            <Button text="Sign Up"/>
          </div>      
        </form>
        <div className="error">
          {error && <p>{error}</p>}
        </div>
        <h4 className='underbutton'>Already have an account?<strong> <a href="./src/auth/login.js">Login</a></strong></h4>
      </div>
      </div></>
  );
}



export default SignUpPage;