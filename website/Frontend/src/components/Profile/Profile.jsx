import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { userAPI, tutorAPI } from '../../services/api';

const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'Prefer not to say'
];

const STUDENT_GRADE_OPTIONS = [
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'College/University',
  'Adult Learner'
];

// Tutors pick from the same set so the JSON-LIKE filter on
// tutor_profiles.grade_levels stays aligned with what students store.
const TUTOR_GRADE_OPTIONS = STUDENT_GRADE_OPTIONS;

const Profile = () => {
  const { isTutor } = useUser();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    bio: '',
    username: '',
    email: '',
    contactEmail: '',
    pronouns: '',
    studentGrade: ''
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

  // Tutor-only state
  const [tutorProfileId, setTutorProfileId] = useState(null);
  const [tutorGradeLevels, setTutorGradeLevels] = useState([]);
  const [originalTutorGradeLevels, setOriginalTutorGradeLevels] = useState([]);

  const toggleTutorGradeLevel = (grade) => {
    if (!isEditing) return;
    setTutorGradeLevels(prev => (
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    ));
  };

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
          contactEmail: userData.contactEmail || '',
          pronouns: userData.pronouns || '',
          studentGrade: userData.studentGrade || ''
        };
        
        setProfileData(data);
        setOriginalData(data);
        setProfilePictureUrl(userData.profilePictureUrl);

        // Tutors also have a TutorProfile with grade levels they teach
        if (isTutor) {
          try {
            const tutorRes = await tutorAPI.getMyProfile();
            const grades = Array.isArray(tutorRes.data?.gradeLevels) ? tutorRes.data.gradeLevels : [];
            setTutorProfileId(tutorRes.data?.id || null);
            setTutorGradeLevels(grades);
            setOriginalTutorGradeLevels(grades);
          } catch (tutorErr) {
            console.error('Could not load tutor profile:', tutorErr);
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        // 401s redirect globally; everything else is surfaced as a load error.
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isTutor]);

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

      // For tutors: also persist their teaching grade levels
      if (isTutor && tutorProfileId) {
        await tutorAPI.updateTutor(tutorProfileId, {
          gradeLevels: tutorGradeLevels
        });
      }
      
      // Refetch user data to ensure we have the latest from the backend
      const userResponse = await userAPI.getCurrentUser();
      const userData = userResponse.data;
      
      const updatedData = {
        bio: userData.bio || '',
        username: userData.displayUsername || userData.username || '',
        email: userData.email || '',
        contactEmail: userData.contactEmail || '',
        pronouns: userData.pronouns || '',
        studentGrade: userData.studentGrade || ''
      };
      
      setProfileData(updatedData);
      setOriginalData(updatedData);
      setProfilePictureUrl(newProfilePictureUrl || userData.profilePictureUrl);

      // Snapshot the saved grade levels as the new "original" so cancel works
      if (isTutor) {
        setOriginalTutorGradeLevels(tutorGradeLevels);
      }
      
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
    setTutorGradeLevels(originalTutorGradeLevels);
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

          {error && <div className="error-message">{error}</div>}
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
                <label htmlFor="pronouns">Pronouns</label>
                <select
                  id="pronouns"
                  value={profileData.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="">Select your pronouns</option>
                  {PRONOUN_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {!isTutor && (
                <div className="form-group">
                  <label htmlFor="studentGrade">Grade Level</label>
                  <select
                    id="studentGrade"
                    value={profileData.studentGrade}
                    onChange={(e) => handleInputChange('studentGrade', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="">Select your grade level</option>
                    {STUDENT_GRADE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}

              {isTutor && (
                <div className="form-group">
                  <label>Grade Levels You Teach</label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: isEditing ? '#fff' : '#f9fafb'
                  }}>
                    {TUTOR_GRADE_OPTIONS.map(option => {
                      const selected = tutorGradeLevels.includes(option);
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => toggleTutorGradeLevel(option)}
                          disabled={!isEditing}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            border: `1px solid ${selected ? '#1A803D' : '#d1d5db'}`,
                            backgroundColor: selected ? '#1A803D' : 'white',
                            color: selected ? 'white' : '#374151',
                            cursor: isEditing ? 'pointer' : 'default',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            opacity: isEditing ? 1 : 0.85
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ marginTop: '6px', fontSize: '0.8rem', color: '#6b7280' }}>
                    Students looking for help will only see you in the tutor list for these grade levels.
                  </p>
                </div>
              )}
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