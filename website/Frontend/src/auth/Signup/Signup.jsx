import React from 'react';
import "./Signup.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faCheck, 
  faTimes, 
  faEye, 
  faEyeSlash,
  faGraduationCap,
  faCalendarAlt,
  faArrowRight,
  faArrowLeft,
  faStar
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Student signup page - for tutors, use the unique invitation link
function SignUpPage() {
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    pronouns: '',
    gradeLevel: '',
    interests: []
  });

  const pronounOptions = [
    'she/her',
    'he/him',
    'they/them',
    'she/they',
    'he/they',
    'Prefer not to say'
  ];
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [signupStep, setSignupStep] = useState(1);
  const navigate = useNavigate();

  const availableInterests = [
    'Mathematics', 'Science', 'English', 'History', 'Computer Science',
    'Physics', 'Chemistry', 'Biology', 'Art', 'Music', 'Languages',
    'Economics', 'Psychology', 'Philosophy'
  ];

  // Must match the labels tutors store on their profile so grade-based
  // tutor filtering ("%\"7th Grade\"%") works without translation.
  const gradeLevels = [
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

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    let score = 0;
    
    // Length check
    if (password.length >= 8) {
      strength++;
      score += 1;
    }
    if (password.length >= 12) {
      score += 0.5;
    }
    
    // Character variety checks
    if (/[A-Z]/.test(password)) {
      strength++;
      score += 1;
    }
    if (/[a-z]/.test(password)) {
      strength++;
      score += 1;
    }
    if (/[0-9]/.test(password)) {
      strength++;
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
      score += 1.5;
    }
    
    // Additional complexity
    if (password.length >= 16) {
      score += 1;
    }
    if (/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) {
      score += 1;
    }
    
    // Map score to 0-4 range for 5 levels
    if (score < 2) return 0; // Weak
    if (score < 3.5) return 1; // Fair
    if (score < 5) return 2; // Good
    if (score < 6.5) return 3; // Strong
    return 4; // Very Strong
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join(', ');
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.pronouns) {
      newErrors.pronouns = 'Please select your pronouns';
    }
    if (!formData.gradeLevel) {
      newErrors.gradeLevel = 'Please select your grade level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Update password strength
    if (field === 'password') {
      const strength = calculatePasswordStrength(value);
      const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
      const text = strengthTexts[strength] || 'Weak';
      console.log('Password:', value, 'Strength:', strength, 'Text:', text);
      setPasswordStrength(strength);
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setSignupStep(2);
    }
  };

  const handlePrevStep = () => {
    setSignupStep(1);
  };


  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: `${formData.firstName} ${formData.lastName}`.trim(),
          role: formData.role,
          pronouns: formData.pronouns,
          studentGrade: formData.gradeLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("SUCCESSFULLY SIGNED UP!");
        console.log("User created:", data);
        
        // Redirect to verification page with email
        navigate('/verify', { 
          state: { email: formData.email } 
        });
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return strengthTexts[passwordStrength] || 'Weak';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    return colors[passwordStrength] || '#dc3545';
  };

  return (
    <div className='signup-page'>
      <div className='greenblock'>
        <div className='welcome-content'>
          <div className='title'>
            <FontAwesomeIcon icon={faGraduationCap} />
            Academathon
          </div>
          <h2>Join Hundreds of Successful Students</h2>
          <p>Connect with expert tutors and accelerate your learning journey</p>
          <div className='features-list'>
            <div className='feature-item'>
              <FontAwesomeIcon icon={faStar} />
              <span>Expert Tutors</span>
            </div>
            <div className='feature-item'>
              <FontAwesomeIcon icon={faStar} />
              <span>Personalized Learning</span>
            </div>
            <div className='feature-item'>
              <FontAwesomeIcon icon={faStar} />
              <span>Flexible Scheduling</span>
            </div>
          </div>
        </div>
      </div>
    
      <div className="signup-container">
        <div className="signup-header">
          <div className="progress-indicator">
            <div className={`step ${signupStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${signupStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
            </div>
          </div>
          <h2 className='starttext'>
            {signupStep === 1 ? 'Create Your Account' : 'Complete Your Profile'}
          </h2>
          <h3 className='undertext'>
            {signupStep === 1 
              ? 'Let\'s start with your basic information' 
              : 'Tell us more about your learning goals'}
          </h3>
        </div>

        <form onSubmit={signupStep === 2 ? handleSignUp : (e) => { e.preventDefault(); handleNextStep(); }}>
          {signupStep === 1 && (
            <div className="form-step">
              <div className="name-row">
                <div className="input-group">
                  <label className='text'>First Name</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                      className={`custom-input ${errors.firstName ? 'error' : ''}`}
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>

                <div className="input-group">
                  <label className='text'>Last Name</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                      className={`custom-input ${errors.lastName ? 'error' : ''}`}
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="input-group">
                <label className='text'>Email Address</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    className={`custom-input ${errors.email ? 'error' : ''}`}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label className='text'>Password</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    className={`custom-input ${errors.password ? 'error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${Math.max(((passwordStrength + 1) / 5) * 100, 5)}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label className='text'>Confirm Password</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    className={`custom-input ${errors.confirmPassword ? 'error' : ''}`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="next-btn">
                Continue
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          )}

          {signupStep === 2 && (
            <div className="form-step">
              <div className="input-group">
                <label className='text'>Pronouns</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <select
                    className={`custom-input ${errors.pronouns ? 'error' : ''}`}
                    value={formData.pronouns}
                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                    required
                  >
                    <option value="">Select your pronouns</option>
                    {pronounOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                {errors.pronouns && <span className="error-text">{errors.pronouns}</span>}
              </div>

              <div className="input-group">
                <label className='text'>Grade Level</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <select
                    className={`custom-input ${errors.gradeLevel ? 'error' : ''}`}
                    value={formData.gradeLevel}
                    onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                    required
                  >
                    <option value="">Select your grade level</option>
                    {gradeLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                {errors.gradeLevel && <span className="error-text">{errors.gradeLevel}</span>}
              </div>

              <div className="input-group">
                <label className='text'>Subjects of Interest (Optional)</label>
                <div className="interests-container">
                  {availableInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                      {formData.interests.includes(interest) && (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="back-btn" onClick={handlePrevStep}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back
                </button>
                <button type="submit" className="sign-up-btn" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
          )}
        </form>
        
        {errors.general && (
          <div className="error-general">
            <FontAwesomeIcon icon={faTimes} />
            {errors.general}
          </div>
        )}
        
        <h4 className='underbutton'>
          Already have an account?
          <strong> <a href="/login">Login</a></strong>
        </h4>
      </div>
    </div>
  );
}

export default SignUpPage;