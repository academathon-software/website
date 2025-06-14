import React from 'react';
import "./login.css";
import Button from '../ui/button';
import { useState } from 'react';
import firebase from './firebase';

function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // Handle successful login
      console.log("SUCCESSFULY LOGGED IN!");
    } catch (error) {
      console.error(error);
      setError(error.message);

      // Handle login error
    }
  };

  return (
    <><div className='greenblock'>
      <div className="title">
      academathon
      </div>
      
      <div className="login-container">
      <form onSubmit={handleLogin}>
      <h2 className='logintext'>Login</h2>
      <h3 className='undertext'>Welcome back! Login into your account </h3>
        <text className='text'>Email</text>
        <input
          className='custom-input'
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <text className='text'>Password</text>
        <input
          className='custom-input'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />


        <div className="login-button">
          <Button text="Sign In" />
        </div>
      </form>
      <div className="error">
        {error && <p>{error}</p>}
      </div>
      <h4 className='underbutton'>Don't have an account?<strong> <a href="./src/auth/signup.js">Sign up</a></strong></h4>
      </div>
    </div></>

    
  );
}

export default LoginPage;