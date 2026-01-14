import React, { useState, useEffect, useRef } from 'react';
import "./header.css";
import academathonLogo from "../assets/academathon_logo.jpeg"; // Import the image
import DropdownProfile from './dropdownProfile';
import profilePic from "../profile/profile.jpg";
import "./dropdownProfile.css";
import firebase from "../auth/firebase";
import { getProfileInfo } from '../firefunc/firebaseFuncs';

const Header = ({ profileImage }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef(null);
  const [data, setData] = useState(null);
  const [isStudent,setIsStudent] = useState(false);

  

  let image;
  
  if (!profileImage) {
    image = profilePic;
  } else {
    image = profileImage;
  }


  useEffect(() => {
    let unsubscribe = null;

    const runFunc = async () => {
      unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          setIsAuthenticated(true);
          const id = user.uid;
          try {
            const snapshot = await getProfileInfo(id);
            
            const profileData = snapshot.data();
            console.log("Header data:",snapshot);
            setData(profileData);

            if (profileData?.type !== "student") {
              setIsStudent(false);
            }else{
              setIsStudent(true);
            }
          } catch (error) {
            console.error("Error fetching profile info:", error);
          }
        } else {
          setIsAuthenticated(false);
          setData(null);
          setIsStudent(false);
        }
      });
    };

    runFunc();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

    return (
      <header className="header">
        <div className="logo">
          <img src={academathonLogo} alt="Tutor Website Logo" />
        </div>
        <nav className="nav">
          <ul className='list'>
            
            {!isAuthenticated && (
              <>
                <li className='item'>
                  <a className='link' href="login">Login</a>
                </li>
                <li className='item'>
                  <a className='link' href="signup">Tutor Sign Up</a>
                </li>
                <li className='item'>
                  <a className='link' href="studentsignup">Student Sign Up</a>
                </li>
              </>
            )}
            {(isAuthenticated && isStudent) && (
              <> 
              <li className='item' ref={dropdownRef}>
              <a className='link' href="search">Search</a>
              </li>
              <li>
                <img
                  src={image}
                  alt="Profile"
                  className="profile-picture"
                  onClick={() => setOpenProfile((prev) => !prev)}
                />
                {openProfile && <DropdownProfile />}
              </li></>
              
            )}
            {(isAuthenticated && !isStudent) && (
              <> 
              <li className='item'>
              <a className='link' href="scheduler">Schedule</a>
              </li>
              <li>
              <img
                src={image || profilePic}  // Use default image if 'image' is null
                alt="Profile"
                className="profile-picture"
                onClick={() => setOpenProfile((prev) => !prev)}
              />
                {openProfile && <DropdownProfile />}
              </li></>
              
            )}
          </ul>
        </nav>
      </header>
    );
}

export default Header;
