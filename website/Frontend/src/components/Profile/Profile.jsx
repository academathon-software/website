import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { userAPI } from '../../services/api';

const Profile = () => {
  const { isTutor } = useUser();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    bio: '',
    username: '',
    email: '',
    pronouns: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getCurrentUser();
        const userData = response.data;
        
        const data = {
          bio: userData.bio || '',
          username: userData.displayUsername || userData.username || '',
          email: userData.email || '',
          pronouns: userData.pronouns || '',
          contactEmail: userData.contactEmail || '',
          contactPhone: userData.contactPhone || ''
        };
        
        setProfileData(data);
        setOriginalData(data);
        setProfilePictureUrl(userData.profilePictureUrl);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem('token')) {
          setError('SESSION_EXPIRED');
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      let newProfilePictureUrl = profilePictureUrl;

      // Upload profile picture if changed
      if (profilePictureFile) {
        const response = await userAPI.uploadProfilePicture(profilePictureFile);
        newProfilePictureUrl = response.data.profilePictureUrl;
      }

      // Update profile data (exclude email from updates)
      if (profileData) {
        const { email, ...profileUpdateData } = profileData;
        await userAPI.updateProfile(profileUpdateData);
      }
      
      // Refetch user data to ensure we have the latest from the backend
      const userResponse = await userAPI.getCurrentUser();
      const userData = userResponse.data;
      
      const updatedData = {
        bio: userData.bio || '',
        username: userData.displayUsername || userData.username || '',
        email: userData.email || '',
        pronouns: userData.pronouns || '',
        contactEmail: userData.contactEmail || '',
        contactPhone: userData.contactPhone || ''
      };
      
      setProfileData(updatedData);
      setOriginalData(updatedData);
      setProfilePictureUrl(newProfilePictureUrl || userData.profilePictureUrl);
      
      // Clear preview and file after URL is set
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setIsEditing(false);
    setError(null);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleDeleteProfilePicture = async () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      try {
        await userAPI.deleteProfilePicture();
        setProfilePictureUrl(null);
        setProfilePicturePreview(null);
        setProfilePictureFile(null);
        setSuccessMessage('Profile picture deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Error deleting profile picture:', err);
        setError('Failed to delete profile picture');
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        {isTutor ? <TutorSidebar /> : <StudentSidebar />}
        <div className="profile-main-content">
          <div className="profile-card">
            <div className="loading-message">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {isTutor ? <TutorSidebar /> : <StudentSidebar />}
      
      <div className="profile-main-content">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Welcome, {profileData.username || 'User'}!</h2>
            <p>Complete Your Profile</p>
          </div>

          {error === 'SESSION_EXPIRED' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
              <h2 style={{ color: '#333', marginBottom: '10px' }}>Session Expired</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>Your session has expired. Please log back in to continue.</p>
              <button 
                onClick={() => { localStorage.clear(); navigate('/login'); }}
                style={{ padding: '12px 30px', backgroundColor: '#1A803D', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
              >
                Log Back In
              </button>
            </div>
          )}
          {error && error !== 'SESSION_EXPIRED' && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="profile-content">
            <div className="profile-picture-section">
              <div className="profile-picture">
                {profilePicturePreview || profilePictureUrl ? (
                  <img 
                    src={profilePicturePreview || profilePictureUrl} 
                    alt="Profile" 
                    className="profile-picture-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="picture-placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#ccc"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#ccc"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="profile-picture-buttons">
                <input
                  type="file"
                  id="profile-picture-input"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                  onClick={(e) => {
                    // Reset the value to allow selecting the same file again
                    e.target.value = null;
                  }}
                />
                <button 
                  className="edit-picture-button" 
                  onClick={() => {
                    if (!isEditing) return;
                    const fileInput = document.getElementById('profile-picture-input');
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  disabled={!isEditing}
                >
                  {profilePictureUrl || profilePicturePreview ? 'Change' : 'Upload'}
                </button>
                {(profilePictureUrl || profilePicturePreview) && (
                  <button 
                    className="delete-picture-button" 
                    onClick={handleDeleteProfilePicture}
                    disabled={!isEditing}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="bio">Add/Edit Bio</label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Edit Username</label>
                <input
                  id="username"
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pronouns">Add/Edit Pronouns</label>
                <input
                  id="pronouns"
                  type="text"
                  value={profileData.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  placeholder="e.g., they/them, he/him, she/her"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Edit Contact Email</label>
                <input
                  id="contactEmail"
                  type="email"
                  value={profileData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Enter your contact email"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Edit/Add Contact Phone Number</label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={profileData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {!isEditing ? (
              <button 
                className="save-button"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;