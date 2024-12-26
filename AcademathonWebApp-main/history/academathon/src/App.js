import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';


import MainPage from "./main.js";
import LoginPage from './auth/login';
import SignUpPage from './auth/signup';
import ProfilePage from './profile/myprofile';
import ViewProfilePage from './profile/viewprofile';
import SearchPage from './search/search';
import StudentSignUp from './auth/studentsignup.js'; 
import { useEffect, useState } from 'react';
import firebase from "./auth/firebase.js";
import Scheduler from './ui/scheduler.js';
import Header from "./main/header.js";


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        setUser(user);
      } else {
        // If there was a redirect, try to get the redirect result
        try {
          await firebase.auth().getRedirectResult();
        } catch (error) {
          console.error('Error getting redirect result:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  const isAuthenticated = !!user;

  return (

    <Router> {/* Wrap your App component with Router */}
      <div className="app">
      <Header></Header>

        <Routes> {/* Use Switch to render only the first matching route */}
        

        <Route path="/" element={<MainPage />} />
          <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />} />
          <Route path="/scheduler" element={isAuthenticated ? <Scheduler /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage/> : <Navigate to="/login"/>} />
          <Route path="/studentsignup" element={<StudentSignUp />} />
          <Route path="/viewprofile" element={isAuthenticated ? <ViewProfilePage/> : <Navigate to="/login"/>} /> {/* Define route for ViewProfilePage with UID parameter */}


        </Routes>
      </div>
    </Router>
  );
}



/*
/  mainPage
LoginPage
SignUpPage
ProfilePage
ViewProfilePage
SearchPage
BookingPage
PaymentPage

*/



export default App;
