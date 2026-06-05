import React, { useState } from 'react';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faEye,
  faEyeSlash,
  faArrowRight,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    interests: [],
  });

  const pronounOptions = [
    'she/her',
    'he/him',
    'they/them',
    'she/they',
    'he/they',
    'Prefer not to say',
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
    'Economics', 'Psychology', 'Philosophy',
  ];

  // Must match the labels tutors store on their profile so grade-based
  // tutor filtering ("%\"7th Grade\"%") works without translation.
  const gradeLevels = [
    '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
    '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade',
    'College/University', 'Adult Learner',
  ];

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 0.5;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1.5;
    if (password.length >= 16) score += 1;
    if (/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) score += 1;
    if (score < 2) return 0;
    if (score < 3.5) return 1;
    if (score < 5) return 2;
    if (score < 6.5) return 3;
    return 4;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errs.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errs.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errs.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errs.push('One special character');
    return errs;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else {
      const pwErrs = validatePassword(formData.password);
      if (pwErrs.length > 0) newErrors.password = pwErrs.join(', ');
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.pronouns) newErrors.pronouns = 'Please select your pronouns';
    if (!formData.gradeLevel) newErrors.gradeLevel = 'Please select your grade level';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'password') setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setErrors({});
      setSignupStep(2);
    }
  };
  const handlePrevStep = () => {
    setErrors({});
    setSignupStep(1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: `${formData.firstName} ${formData.lastName}`.trim(),
          role: formData.role,
          pronouns: formData.pronouns,
          studentGrade: formData.gradeLevel,
        }),
      });
      if (response.ok) {
        navigate('/verify', { state: { email: formData.email } });
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

  const getPasswordStrengthText = () =>
    ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength] || 'Weak';

  const getPasswordStrengthColor = () =>
    ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'][passwordStrength] || '#EF4444';

  return (
    <div className="su-page">

      <div className="su-wrap">

        {/* Progress stepper */}
        <div className="su-progress" aria-label="Sign-up progress">
          <div className={`su-step${signupStep >= 1 ? ' su-step--active' : ''}`} aria-current={signupStep === 1 ? 'step' : undefined}>1</div>
          <div className="su-connector" />
          <div className={`su-step${signupStep >= 2 ? ' su-step--active' : ''}`} aria-current={signupStep === 2 ? 'step' : undefined}>2</div>
        </div>

        {/* Heading */}
        <p className="su-eyebrow">
          {signupStep === 1 ? 'Account details' : 'Your profile'}
        </p>
        <h1 className="su-heading">
          {signupStep === 1
            ? <>Create your <em>account.</em></>
            : <>Tell us about <em>yourself.</em></>}
        </h1>
        {signupStep === 1 && (
          <p className="su-subheading">
            Already have an account?{' '}
            <a href="/login" className="su-link">Sign in</a>
          </p>
        )}

        <form
          onSubmit={signupStep === 2 ? handleSignUp : (e) => { e.preventDefault(); handleNextStep(); }}
          className="su-form"
          noValidate
        >
          {/* ── Step 1 ── */}
          {signupStep === 1 && (
            <>
              <div className="su-row">
                <div className="su-field">
                  <label className="su-label" htmlFor="su-firstName">First Name</label>
                  <input
                    id="su-firstName"
                    className={`su-input${errors.firstName ? ' su-input--error' : ''}`}
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className="su-field-error">{errors.firstName}</span>}
                </div>

                <div className="su-field">
                  <label className="su-label" htmlFor="su-lastName">Last Name</label>
                  <input
                    id="su-lastName"
                    className={`su-input${errors.lastName ? ' su-input--error' : ''}`}
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className="su-field-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-email">Email</label>
                <input
                  id="su-email"
                  className={`su-input${errors.email ? ' su-input--error' : ''}`}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="su-field-error">{errors.email}</span>}
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-password">Password</label>
                <div className="su-password-wrap">
                  <input
                    id="su-password"
                    className={`su-input${errors.password ? ' su-input--error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="su-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {formData.password && (
                  <div className="su-strength">
                    <div className="su-strength-bar">
                      <div
                        className="su-strength-fill"
                        style={{
                          width: `${Math.max(((passwordStrength + 1) / 5) * 100, 5)}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      />
                    </div>
                    <span className="su-strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                {errors.password && <span className="su-field-error">{errors.password}</span>}
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-confirmPassword">Confirm Password</label>
                <div className="su-password-wrap">
                  <input
                    id="su-confirmPassword"
                    className={`su-input${errors.confirmPassword ? ' su-input--error' : ''}`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="su-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.confirmPassword && <span className="su-field-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="su-btn-primary">
                Continue <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </>
          )}

          {/* ── Step 2 ── */}
          {signupStep === 2 && (
            <>
              <div className="su-field">
                <label className="su-label" htmlFor="su-pronouns">Pronouns</label>
                <select
                  id="su-pronouns"
                  className={`su-input su-select${errors.pronouns ? ' su-input--error' : ''}`}
                  value={formData.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                >
                  <option value="">Select your pronouns</option>
                  {pronounOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.pronouns && <span className="su-field-error">{errors.pronouns}</span>}
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-gradeLevel">Grade Level</label>
                <select
                  id="su-gradeLevel"
                  className={`su-input su-select${errors.gradeLevel ? ' su-input--error' : ''}`}
                  value={formData.gradeLevel}
                  onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                >
                  <option value="">Select your grade level</option>
                  {gradeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.gradeLevel && <span className="su-field-error">{errors.gradeLevel}</span>}
              </div>

              <div className="su-field">
                <label className="su-label">
                  Subjects of Interest{' '}
                  <span className="su-optional">(Optional)</span>
                </label>
                <div className="su-interests">
                  {availableInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className={`su-tag${formData.interests.includes(interest) ? ' su-tag--active' : ''}`}
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

              <div className="su-actions">
                <button type="button" className="su-btn-ghost" onClick={handlePrevStep}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <button type="submit" className="su-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </>
          )}
        </form>

        {errors.general && (
          <div className="su-error-banner" role="alert">
            <p>{errors.general}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default SignUpPage;
