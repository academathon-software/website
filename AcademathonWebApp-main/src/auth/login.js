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
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>


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


        <div className="login-button">
          <Button text="Login"/>
        </div>      
      </form>
      <div className="error">
      {error && <p>{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;