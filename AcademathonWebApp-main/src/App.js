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
import PaymentForm from './payment/payment.js';
import ProfileForm from "./profile/profileForm.js"

import { getProfileImage } from './firefunc/firebaseFuncs.js';

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import SettingsPage from './profile/Settings.js';

const stripePromise = loadStripe("pk_test_51OaQU6F1ibQofTuIiQLGOjBh5Klo9Acj4IuKSI90mbxeSYBdoQgdycdd8Y3CT8BHTYAj5smwOCXDtZyjMa5kiJ9200p08LOsph");

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('/assets/profile.jpg'); // Default image


  //get information here.

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        setUser(user);

        const id = user.uid;
        let userProfileImageUrl = null;
        try{
          
          userProfileImageUrl = await getProfileImage(id);//I think this?

        }catch{
          //error
        }
        console.log("Profile Image:", userProfileImageUrl);

        if (userProfileImageUrl) {
          console.log("Setting profile image:"+id);
          setProfileImageUrl(userProfileImageUrl); //this sets it, then in settings you can change it.
        }

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
      <Header profileImage={profileImageUrl}></Header>

        <Routes> {/* Use Switch to render only the first matching route */}
        

        <Route path="/" element={<MainPage />} />
          <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />} />
          <Route path="/scheduler" element={isAuthenticated ? <Scheduler /> : <Navigate to="/login" />} />
          <Route path="/profileForm" element={isAuthenticated ? <ProfileForm /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage setProfileImage={setProfileImageUrl} /> : <Navigate to="/login" />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage/> : <Navigate to="/login"/>} />
          <Route path="/payment" element={isAuthenticated ? <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements> : <Navigate to="/login"/>} />
          <Route path="/studentsignup" element={<StudentSignUp />} />
          <Route path="/viewprofile" element={isAuthenticated ? <ViewProfilePage/> : <Navigate to="/login"/>} /> {}
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
