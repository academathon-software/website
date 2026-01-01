import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TutorSignup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faArrowLeft,
  faSearch,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

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
        const response = await fetch(`http://localhost:8080/api/tutor-invitations/validate/${token}`);
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
      const response = await fetch('http://localhost:8080/auth/signup/tutor', {
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
              
              <div className="form-group">
                <label>University</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className={errors.university ? 'error' : ''}
                />
                {errors.university && <span className="error-text">{errors.university}</span>}
              </div>

              <div className="form-group">
                <label>Program</label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => handleInputChange('program', e.target.value)}
                  className={errors.program ? 'error' : ''}
                />
                {errors.program && <span className="error-text">{errors.program}</span>}
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  placeholder="e.g., Junior, Senior, Graduate"
                  className={errors.academicYear ? 'error' : ''}
                />
                {errors.academicYear && <span className="error-text">{errors.academicYear}</span>}
              </div>

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
              
              <div className="search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Can't find your course? Search here"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
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

