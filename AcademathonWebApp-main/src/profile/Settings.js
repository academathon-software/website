import "./Settings.css";
import React, { useState, useEffect } from 'react';
import firebase from "../auth/firebase";
import { getImageURL, getProfileInfo, updateProfileInfo, updateProfileImage } from '../firefunc/firebaseFuncs';

function SettingsPage({setProfileImage}) {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("John Doe");
  const [bio, setBio] = useState("Software Engineer");
  const user = firebase.auth().currentUser;
  const uid = user?.uid;
  // State to track which field is editable



  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    const runFunc = async () => {
    const snapshot = await getProfileInfo(uid);//returns snapshot
    const img_path = snapshot.data()?.image_path;
    

    let imageURL;
    
    if(!img_path){
        imageURL = "";
    }else{
        imageURL = await getImageURL(img_path);
    }


    if(!imageURL){
        imageURL="";
    }


    const fetchedData={id:snapshot.id, image_url:imageURL, ...snapshot.data()};
    setName(fetchedData.name);
    setBio(fetchedData.bio);
    setProfilePic(imageURL);

    
}

runFunc();
   
    // Clean up the listener when the component unmounts
    return () => {};
}, []);






  const [isEditing, setIsEditing] = useState({
    name: false,
    bio: false,
    email: false,
  });

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        //call update profile pic here.
      updateProfileImage(file,uid);
      const uobj = URL.createObjectURL(file);
      setProfilePic(URL.createObjectURL(file));
      setProfileImage(uobj);
    }
  };

  const handleSaveChanges = async () => {

    await updateProfileInfo({name:name,bio:bio});

    console.log("Changes saved:", { name, bio});
  };

  const toggleEdit = (field) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-container">
        {/* Profile Picture */}
        <div className="setting-section profile-pic-section">
          <label htmlFor="profilePicInput">
            <img
              src={profilePic || "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-pic"
            />
            <p>Change Profile Picture</p>
          </label>
          <input
            type="file"
            id="profilePicInput"
            accept="image/*"
            onChange={handleProfilePicChange}
          />
        </div>

        {/* Name */}
        <div className="setting-section">
          <label>Name</label>
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing.name}
            />
            <button onClick={() => toggleEdit("name")}>
              {isEditing.name ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="setting-section">
          <label>Bio</label>
          <div className="input-container">
            <textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing.bio}
            ></textarea>
            <button onClick={() => toggleEdit("bio")}>
              {isEditing.bio ? "Save" : "Edit"}
            </button>
          </div>
        </div>
       

        {/* Save Button */}
        <button className="save-btn" onClick={handleSaveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;