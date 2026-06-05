import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TutorSignup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowLeft,
  faSearch,
  faCheck,
  faChevronDown,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import logoImg from '../../assets/academathonLogo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/* ── Step metadata for the left panel ── */
const STEPS = [
  { num: 1, label: 'Your account',  desc: 'Name, pronouns & password' },
  { num: 2, label: 'Academic info', desc: 'University & program'       },
  { num: 3, label: 'Grade levels',  desc: 'Which grades you teach'     },
  { num: 4, label: 'Subjects',      desc: 'What you teach'             },
];

/* ── Eyebrow / heading per step ── */
const STEP_COPY = [
  { eyebrow: 'Step 1 of 4', heading: <>Create your <em>account.</em></>,   sub: 'Set up your login to get started.' },
  { eyebrow: 'Step 2 of 4', heading: <>Academic <em>background.</em></>,    sub: 'Tell us about your university and program.' },
  { eyebrow: 'Step 3 of 4', heading: <>Grade <em>levels.</em></>,           sub: 'Which grade levels will you be teaching?' },
  { eyebrow: 'Step 4 of 4', heading: <>Your <em>subjects.</em></>,          sub: 'Select the subjects you\'ll be teaching.' },
];

// --- Searchable Dropdown Component ---
const SearchableDropdown = ({ label, value, onChange, options, placeholder, error, errorText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearch('');
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="form-group searchable-dropdown-group" ref={dropdownRef}>
      <label>{label}</label>
      <div className={`searchable-dropdown ${isOpen ? 'open' : ''} ${error ? 'has-error' : ''}`}>
        <div
          className="searchable-dropdown-input-wrapper"
          onClick={() => { setIsOpen(!isOpen); if (!isOpen && inputRef.current) inputRef.current.focus(); }}
        >
          <input
            ref={inputRef}
            type="text"
            className={`searchable-dropdown-input ${error ? 'error' : ''}`}
            placeholder={value || placeholder || 'Select...'}
            value={isOpen ? search : value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <FontAwesomeIcon icon={faChevronDown} className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`} />
        </div>
        {isOpen && (
          <div className="searchable-dropdown-list">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <div
                  key={option}
                  className={`searchable-dropdown-item ${option === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                  {option === value && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
              ))
            ) : (
              <div className="searchable-dropdown-empty">No results found</div>
            )}
          </div>
        )}
      </div>
      {errorText && <span className="error-text">{errorText}</span>}
    </div>
  );
};

// --- Canadian Universities ---
const CANADIAN_UNIVERSITIES = [
  'Acadia University',
  'Alberta University of the Arts',
  'Algoma University',
  'Ambrose University',
  'Athabasca University',
  'Bishop\'s University',
  'Brandon University',
  'Brescia University College',
  'Brock University',
  'Burman University',
  'Canadian Mennonite University',
  'Cape Breton University',
  'Capilano University',
  'Carleton University',
  'Crandall University',
  'Concordia University',
  'Concordia University of Edmonton',
  'Dalhousie University',
  'Emily Carr University of Art + Design',
  'First Nations University of Canada',
  'HEC Montréal',
  'Huron University College',
  'Université Laval',
  'King\'s University',
  'King\'s University College',
  'Kwantlen Polytechnic University',
  'Lakehead University',
  'Laurentian University',
  'MacEwan University',
  'McGill University',
  'McMaster University',
  'Memorial University of Newfoundland',
  'Mount Allison University',
  'Mount Royal University',
  'Mount Saint Vincent University',
  'Nipissing University',
  'NSCAD University',
  'OCAD University',
  'Ontario Tech University',
  'Polytechnique Montréal',
  'Queen\'s University',
  'Redeemer University',
  'Royal Military College of Canada',
  'Royal Roads University',
  'Saint Mary\'s University',
  'Saint Paul University',
  'Simon Fraser University',
  'St. Francis Xavier University',
  'St. Thomas University',
  'Thompson Rivers University',
  'Toronto Metropolitan University',
  'Trent University',
  'Trinity Western University',
  'Université de Moncton',
  'Université de Montréal',
  'Université de Sherbrooke',
  'Université du Québec à Chicoutimi',
  'Université du Québec à Montréal',
  'Université du Québec à Rimouski',
  'Université du Québec à Trois-Rivières',
  'Université du Québec en Abitibi-Témiscamingue',
  'Université du Québec en Outaouais',
  'Université Sainte-Anne',
  'University of Alberta',
  'University of British Columbia',
  'University of Calgary',
  'University of Guelph',
  'University of King\'s College',
  'University of Lethbridge',
  'University of Manitoba',
  'University of New Brunswick',
  'University of Northern British Columbia',
  'University of Ottawa',
  'University of Prince Edward Island',
  'University of Regina',
  'University of Saskatchewan',
  'University of the Fraser Valley',
  'University of Toronto',
  'University of Victoria',
  'University of Waterloo',
  'University of Windsor',
  'University of Winnipeg',
  'Vancouver Island University',
  'Western University',
  'Wilfrid Laurier University',
  'York University'
].sort();

// --- Programs of Study ---
const PROGRAMS_OF_STUDY = [
  'Accounting',
  'Actuarial Science',
  'Applied Mathematics',
  'Biochemistry',
  'Biology',
  'Biomedical Sciences',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Commerce',
  'Communications',
  'Computer Engineering',
  'Computer Science',
  'Creative Writing',
  'Criminology',
  'Data Science',
  'Economics',
  'Education',
  'Electrical Engineering',
  'English',
  'English Literature',
  'Entrepreneurship',
  'Environmental Science',
  'Environmental Studies',
  'Finance',
  'French',
  'French Studies',
  'Geography',
  'Health Sciences',
  'History',
  'Human Resources Management',
  'Information Systems',
  'Information Technology',
  'International Business',
  'International Relations',
  'Journalism',
  'Kinesiology',
  'Law',
  'Linguistics',
  'Management',
  'Marketing',
  'Mathematics',
  'Mechanical Engineering',
  'Media Studies',
  'Music',
  'Neuroscience',
  'Nursing',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Administration',
  'Social Work',
  'Sociology',
  'Software Engineering',
  'Statistics',
  'Teaching / Education',
  'Translation Studies',
  'Urban Planning',
].sort();

function TutorSignup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    pronouns: '',
    university: '',
    program: '',
    academicYear: '',
    gradeLevels: [],
    subjects: [],
    bio: '',
    hourlyRate: '25.00'
  });

  const [errors, setErrors] = useState({});
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pronounOptions = [
    'she/her',
    'he/him',
    'they/them',
    'she/they',
    'he/they',
    'Prefer not to say'
  ];

  const availableGradeLevels = [
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

  // Same subjects available to students — tutors pick which ones they teach
  const ALL_SUBJECTS = [
    'Math',
    'English',
    'Science',
    'French',
    'History',
    'Computer Science',
    'Business',
    'Advanced Functions',
    'Functions',
    'Calculus & Vectors',
    'Chemistry',
    'Social Studies',
    'Physics',
    'Biology',
    'Accounting',
    'Data Management',
    'Stats & Probability',
    'Economics'
  ];

  const filteredSubjects = ALL_SUBJECTS.filter(subject =>
    subject.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tutor-invitations/validate/${token}`);
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
          setFormData(prev => ({ ...prev, email: data.email }));
        } else {
          setError(data.message || 'Invalid or expired invitation link');
        }
      } catch (err) {
        setError('Failed to validate invitation link');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleGradeLevel = (grade) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(grade)
        ? prev.gradeLevels.filter(g => g !== grade)
        : [...prev.gradeLevels, grade]
    }));
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.pronouns) newErrors.pronouns = 'Please select your pronouns';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.program.trim()) newErrors.program = 'Program is required';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Academic year is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (formData.gradeLevels.length === 0) {
      newErrors.gradeLevels = 'Please select at least one grade level';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (formData.subjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      default: isValid = true;
    }
    if (isValid) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep4()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          pronouns: formData.pronouns,
          university: formData.university,
          program: formData.program,
          academicYear: formData.academicYear,
          gradeLevels: formData.gradeLevels,
          subjects: formData.subjects,
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate)
        })
      });

      if (response.ok) {
        navigate('/verify', { state: { email: formData.email } });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Loading state ── */
  if (isLoading && currentStep === 1) {
    return (
      <div className="tutor-signup-page">
        <div className="loading">Validating your invitation…</div>
      </div>
    );
  }

  /* ── Invalid / expired token ── */
  if (!tokenValid) {
    return (
      <div className="tutor-signup-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="error-container">
          <h2>Invitation not found</h2>
          <p>{error || 'This invite link is invalid or has expired. Please contact Academathon to receive a new one.'}</p>
          <button onClick={() => navigate('/')}>Back to home</button>
        </div>
      </div>
    );
  }

  const copy = STEP_COPY[currentStep - 1];

  return (
    <div className="tutor-signup-page">

      {/* ── Left: green visual panel ── */}
      <div className="green-panel">
        <div className="panel-content">

          {/* Logo */}
          <img src={logoImg} alt="Academathon" className="ts-logo-img" />

          {/* Panel copy */}
          <p className="ts-panel-eyebrow">Tutor Onboarding</p>
          <h2 className="ts-panel-heading">
            Join our <em>teaching community.</em>
          </h2>
          <p className="ts-panel-sub">
            Set up your tutor profile and start connecting with students across Canada.
          </p>

          {/* 4-step indicator */}
          <div className="step-indicator" aria-label="Setup progress">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className={`step-item ${currentStep >= step.num ? 'active' : ''}`}
                aria-current={currentStep === step.num ? 'step' : undefined}
              >
                <div className="step-number">
                  {currentStep > step.num
                    ? <FontAwesomeIcon icon={faCheck} />
                    : step.num}
                </div>
                <div className="step-text">
                  <span className="step-label">{step.label}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="form-panel">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Step 1: Account ── */}
          {currentStep === 1 && (
            <div className="form-step">
              <p className="form-step-eyebrow">{copy.eyebrow}</p>
              <h2>{copy.heading}</h2>
              <p>{copy.sub}</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ts-firstName">First name</label>
                  <input
                    id="ts-firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="ts-lastName">Last name</label>
                  <input
                    id="ts-lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ts-email">Email</label>
                <input
                  id="ts-email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ts-pronouns">Pronouns</label>
                <select
                  id="ts-pronouns"
                  value={formData.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  className={errors.pronouns ? 'error' : ''}
                >
                  <option value="">Select your pronouns</option>
                  {pronounOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.pronouns && <span className="error-text">{errors.pronouns}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ts-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="ts-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ts-confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="ts-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(p => !p)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="button" className="btn-primary" onClick={handleNext}>
                Continue <FontAwesomeIcon icon={faArrowRight} />
              </button>

              <p className="login-link">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>
          )}

          {/* ── Step 2: Academic Info ── */}
          {currentStep === 2 && (
            <div className="form-step">
              <p className="form-step-eyebrow">{copy.eyebrow}</p>
              <h2>{copy.heading}</h2>
              <p>{copy.sub}</p>

              <SearchableDropdown
                label="University"
                value={formData.university}
                onChange={(val) => handleInputChange('university', val)}
                options={CANADIAN_UNIVERSITIES}
                placeholder="Search for your university…"
                error={!!errors.university}
                errorText={errors.university}
              />

              <SearchableDropdown
                label="Program of Study"
                value={formData.program}
                onChange={(val) => handleInputChange('program', val)}
                options={PROGRAMS_OF_STUDY}
                placeholder="Search for your program…"
                error={!!errors.program}
                errorText={errors.program}
              />

              <SearchableDropdown
                label="Academic Year"
                value={formData.academicYear}
                onChange={(val) => handleInputChange('academicYear', val)}
                options={[
                  '1st Year',
                  '2nd Year',
                  '3rd Year',
                  '4th Year',
                  '5th Year',
                  'Graduate (Masters)',
                  'Graduate (PhD)',
                  'Post-Graduate',
                  'Alumni'
                ]}
                placeholder="Select your academic year…"
                error={!!errors.academicYear}
                errorText={errors.academicYear}
              />
            </div>
          )}

          {/* ── Step 3: Grade Levels ── */}
          {currentStep === 3 && (
            <div className="form-step">
              <p className="form-step-eyebrow">{copy.eyebrow}</p>
              <h2>{copy.heading}</h2>
              <p>{copy.sub}</p>

              <button
                type="button"
                className="select-all-btn"
                onClick={() => {
                  if (formData.gradeLevels.length === availableGradeLevels.length) {
                    setFormData(prev => ({ ...prev, gradeLevels: [] }));
                  } else {
                    setFormData(prev => ({ ...prev, gradeLevels: [...availableGradeLevels] }));
                  }
                }}
              >
                {formData.gradeLevels.length === availableGradeLevels.length ? 'Deselect All' : 'Select All'}
              </button>

              <div className="selection-grid">
                {availableGradeLevels.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    className={`selection-card ${formData.gradeLevels.includes(grade) ? 'selected' : ''}`}
                    onClick={() => toggleGradeLevel(grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
              {errors.gradeLevels && <span className="error-text" style={{ display: 'block', marginTop: 12 }}>{errors.gradeLevels}</span>}
            </div>
          )}

          {/* ── Step 4: Subjects ── */}
          {currentStep === 4 && (
            <div className="form-step">
              <p className="form-step-eyebrow">{copy.eyebrow}</p>
              <h2>{copy.heading}</h2>
              <p>{copy.sub}</p>
              <p className="hint-text">You can always update your subjects later from your profile.</p>

              <div className="search-and-actions">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search subjects…"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => {
                    if (formData.subjects.length === ALL_SUBJECTS.length) {
                      setFormData(prev => ({ ...prev, subjects: [] }));
                    } else {
                      setFormData(prev => ({ ...prev, subjects: [...ALL_SUBJECTS] }));
                    }
                  }}
                >
                  {formData.subjects.length === ALL_SUBJECTS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="selection-grid subjects-grid">
                {filteredSubjects.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    className={`selection-card subject-card ${formData.subjects.includes(subject) ? 'selected' : ''}`}
                    onClick={() => toggleSubject(subject)}
                  >
                    <span className="subject-indicator"></span>
                    {subject}
                  </button>
                ))}
              </div>
              {errors.subjects && <span className="error-text" style={{ display: 'block', marginTop: 12 }}>{errors.subjects}</span>}
            </div>
          )}

          {/* General error */}
          {error && <div className="error-message">{error}</div>}

          {/* ── Navigation: dots + back / next ── */}
          {currentStep > 1 && (
            <div className="form-navigation">
              <div className="progress-dots" aria-label="Step progress">
                {STEPS.map(s => (
                  <span key={s.num} className={`dot ${currentStep === s.num ? 'active' : ''}`} />
                ))}
              </div>

              <div className="nav-buttons">
                {currentStep < 4 && (
                  <>
                    <button type="button" className="btn-back" onClick={handleBack}>
                      <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                    <button type="button" className="btn-next" onClick={handleNext}>
                      Next <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <button type="button" className="btn-back" onClick={handleBack}>
                      <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                    <button type="submit" className="btn-next" disabled={isLoading}>
                      {isLoading ? 'Creating…' : <>Finish <FontAwesomeIcon icon={faArrowRight} /></>}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default TutorSignup;
