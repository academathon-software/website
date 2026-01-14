import React, { useState } from 'react';
import "./profileForm.css";
const ProfileForm = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleImageChange = (e) => {
    setProfileImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle form submission, like sending data to a server

    

    alert('Profile updated!');
  };

  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Profile Picture:</label>
          <input type="file" onChange={handleImageChange} />
          {profileImage && <img src={profileImage} alt="Profile Preview" />}
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Bio:</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfileForm;