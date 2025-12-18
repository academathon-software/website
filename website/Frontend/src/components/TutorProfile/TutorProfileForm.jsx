import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import apiService from '../../services/api';
import './TutorProfileForm.css';

const TutorProfileForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    bio: '',
    hourlyRate: '',
    subjects: []
  });
  
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!!initialData);

  useEffect(() => {
    loadSubjects();
    if (initialData) {
      setFormData({
        email: initialData.user?.email || '',
        password: '',
        displayName: initialData.displayName || '',
        bio: initialData.bio || '',
        hourlyRate: initialData.hourlyRate || '',
        subjects: initialData.subjects?.map(s => s.name) || []
      });
    }
  }, [initialData]);

  const loadSubjects = async () => {
    try {
      const subjects = await apiService.getSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectToggle = (subjectName) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter(s => s !== subjectName)
        : [...prev.subjects, subjectName]
    }));
  };

  const addCustomSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subjectToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileData = {
        displayName: formData.displayName,
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate),
        subjects: formData.subjects
      };

      if (isEditMode) {
        // Update existing profile
        await apiService.updateTutorProfile(initialData.id, profileData);
      } else {
        // Create new profile
        profileData.email = formData.email;
        profileData.password = formData.password;
        await apiService.createTutorProfile(profileData);
      }

      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-profile-form">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Tutor Profile' : 'Create Tutor Profile'}</h2>
        <button className="btn-close" onClick={onCancel}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {!isEditMode && (
          <>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                minLength="6"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="displayName">Display Name *</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="How students will see your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={loading}
            rows="4"
            placeholder="Tell students about your teaching experience and expertise..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate ($) *</label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleInputChange}
            required
            disabled={loading}
            min="1"
            step="0.01"
            placeholder="e.g., 45.00"
          />
        </div>

        <div className="form-group">
          <label>Subjects *</label>
          <div className="subjects-selection">
            <div className="available-subjects">
              <h4>Available Subjects</h4>
              <div className="subjects-grid">
                {availableSubjects.map(subject => (
                  <button
                    key={subject.id}
                    type="button"
                    className={`subject-chip ${formData.subjects.includes(subject.name) ? 'selected' : ''}`}
                    onClick={() => handleSubjectToggle(subject.name)}
                    disabled={loading}
                  >
                    {subject.name}
                    {formData.subjects.includes(subject.name) && (
                      <FontAwesomeIcon icon={faMinus} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-subject">
              <h4>Add Custom Subject</h4>
              <div className="custom-subject-input">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  disabled={loading || !newSubject.trim()}
                  className="btn-add-subject"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="selected-subjects">
              <h4>Selected Subjects ({formData.subjects.length})</h4>
              <div className="selected-subjects-list">
                {formData.subjects.map(subject => (
                  <span key={subject} className="selected-subject">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      disabled={loading}
                      className="btn-remove-subject"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || formData.subjects.length === 0}
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                {isEditMode ? 'Update Profile' : 'Create Profile'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileForm;

