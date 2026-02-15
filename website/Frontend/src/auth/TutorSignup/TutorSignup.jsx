import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TutorSignup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faArrowLeft,
  faSearch,
  faCheck,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
        <div className="searchable-dropdown-input-wrapper" onClick={() => { setIsOpen(!isOpen); if (!isOpen && inputRef.current) inputRef.current.focus(); }}>
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
    university: '',
    program: '',
    academicYear: '',
    schoolEmail: '',
    gradeLevels: [],
    subjects: [],
    bio: '',
    hourlyRate: '25.00'
  });

  const [errors, setErrors] = useState({});
  const [subjectSearch, setSubjectSearch] = useState('');

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

  // Comprehensive subject list organized by category
  const subjectsByCategory = {
    'Math': [
      'Addition & Subtraction', 'Place Value', 'Patterns', 'Basic Geometry', 'Time & Money',
      'Multiplication & Division', 'Fractions', 'Decimals', 'Intro Algebra', 'Geometry', 'Measurement',
      'Integers', 'Ratios & Rates', 'Equations', 'Pythagorean Theorem', 'Graphing', 'Probability',
      'Foundations of Algebra', 'Linear Relations', 'Analytic Geometry',
      'Quadratics', 'Trigonometry', 'Systems of Equations',
      'Functions', 'College Math', 'Workplace Math',
      'Advanced Functions', 'Calculus & Vectors', 'Data Management', 'Statistics'
    ],
    'English / Language Arts': [
      'Reading', 'Phonics', 'Writing', 'Spelling', 'Basic Grammar',
      'Reading Comprehension', 'Paragraph Writing', 'Grammar', 'Vocabulary',
      'English Language Arts', 'Essay Writing', 'Grammar & Composition',
      'English 9', 'English 10', 'English 11', 'English 12',
      'Literature', 'Literature Analysis', 'Writing & Rhetoric', 'Media Studies'
    ],
    'Science': [
      'Life Systems', 'Materials', 'Weather & Seasons', 'Simple Machines',
      'Electricity', 'Space', 'Biodiversity',
      'Cells & Systems', 'Fluids', 'Heat & Energy', 'Ecology',
      'General Science', 'Biology Intro', 'Chemistry Intro', 'Physics Intro',
      'Biology', 'Chemistry', 'Physics'
    ],
    'Social Studies': [
      'Heritage & Identity', 'People & Environments', 'History Basics', 'Geography Basics',
      'History', 'Geography', 'World Cultures', 'Canadian Studies',
      'World Geography', 'Canadian History', 'Civics & Career Studies',
      'Social Sciences', 'World History', 'Law & Politics', 'World Issues', 'Philosophy'
    ],
    'French': [
      'French Basics', 'French Reading', 'French Writing', 'French Intermediate',
      'French Conversation', 'French Grammar', 'French Advanced', 'French Literature',
      'Core French', 'French Immersion'
    ],
    'Technology / Computer Science': [
      'Coding Fundamentals', 'Robotics', 'Digital Literacy',
      'Python', 'Java', 'Web Basics',
      'Programming Fundamentals', 'Web Development', 'Computer Science',
      'Data Structures', 'App Development',
      'Software Engineering', 'OOP', 'Algorithms', 'Databases', 'Web Applications'
    ],
    'Business': [
      'Intro to Business', 'Entrepreneurship', 'Marketing Basics',
      'Marketing', 'Accounting', 'Business Management',
      'Financial Accounting', 'Finance & Investing', 'Business Leadership'
    ]
  };

  // Flatten all subjects into a single array
  const availableSubjects = Object.values(subjectsByCategory).flat();

  // Get unique subjects and sort alphabetically
  const uniqueSubjects = [...new Set(availableSubjects)].sort();

  const filteredSubjects = uniqueSubjects.filter(subject =>
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
    // Clear error when user starts typing
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
    if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
    
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
    
    switch(currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep4()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          program: formData.program,
          academicYear: formData.academicYear,
          schoolEmail: formData.schoolEmail,
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

  if (isLoading && currentStep === 1) {
    return (
      <div className="tutor-signup-page">
        <div className="loading">Validating invitation...</div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="tutor-signup-page">
        <div className="error-container">
          <h2>Invalid Invitation</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-signup-page">
      <div className="green-panel">
        <div className="panel-content">
          <h1 className="brand">academathon</h1>
          
          <div className="step-indicator">
            <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Create an account</span>
            </div>
            <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Set up your profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Let's get started</h2>
              <p>Welcome! Begin setting up your account</p>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="button" className="btn-primary" onClick={handleNext}>
                Sign up
              </button>

              <p className="login-link">
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <h2>Academic Information</h2>
              <p>Tell us about your university and program</p>
              
              <SearchableDropdown
                label="University"
                value={formData.university}
                onChange={(val) => handleInputChange('university', val)}
                options={CANADIAN_UNIVERSITIES}
                placeholder="Search for your university..."
                error={!!errors.university}
                errorText={errors.university}
              />

              <SearchableDropdown
                label="Program"
                value={formData.program}
                onChange={(val) => handleInputChange('program', val)}
                options={PROGRAMS_OF_STUDY}
                placeholder="Search for your program..."
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
                placeholder="Select your academic year..."
                error={!!errors.academicYear}
                errorText={errors.academicYear}
              />

              <div className="form-group">
                <label>School Email</label>
                <input
                  type="email"
                  value={formData.schoolEmail}
                  onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                  className={errors.schoolEmail ? 'error' : ''}
                />
                {errors.schoolEmail && <span className="error-text">{errors.schoolEmail}</span>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-step">
              <h2>Grade Levels</h2>
              <p>Which grade levels will you be teaching?</p>

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
              {errors.gradeLevels && <span className="error-text">{errors.gradeLevels}</span>}
            </div>
          )}

          {currentStep === 4 && (
            <div className="form-step">
              <h2>Subjects</h2>
              <p>Select the subjects you'll be teaching</p>
              <p className="hint-text">Don't worry — you can always update your subjects later from your profile.</p>
              
              <div className="search-and-actions">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Can't find your course? Search here"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => {
                    if (formData.subjects.length === uniqueSubjects.length) {
                      setFormData(prev => ({ ...prev, subjects: [] }));
                    } else {
                      setFormData(prev => ({ ...prev, subjects: [...uniqueSubjects] }));
                    }
                  }}
                >
                  {formData.subjects.length === uniqueSubjects.length ? 'Deselect All' : 'Select All'}
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
              {errors.subjects && <span className="error-text">{errors.subjects}</span>}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-navigation">
            <div className="progress-dots">
              <span className={`dot ${currentStep === 1 ? 'active' : ''}`}></span>
              <span className={`dot ${currentStep === 2 ? 'active' : ''}`}></span>
              <span className={`dot ${currentStep === 3 ? 'active' : ''}`}></span>
            </div>

            <div className="nav-buttons">
              {currentStep > 1 && currentStep < 4 && (
                <button type="button" className="btn-back" onClick={handleBack}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
              )}
              
              {currentStep === 2 && (
                <button type="button" className="btn-next" onClick={handleNext}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
              
              {currentStep === 3 && (
                <button type="button" className="btn-next" onClick={handleNext}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}

              {currentStep === 4 && (
                <>
                  <button type="button" className="btn-back" onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <button type="submit" className="btn-next" disabled={isLoading}>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TutorSignup;

