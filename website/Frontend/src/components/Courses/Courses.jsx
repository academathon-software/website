import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap,
  faFlask,
  faGlobe,
  faCalculator,
  faPalette,
  faFolderPlus,
  faTrash,
  faArchive,
  faUndo,
  faBook,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { tutorSubjectAPI, subjectAPI } from '../../services/api';
import './Courses.css';

const Courses = () => {
  const navigate = useNavigate();
  const { setUserType } = useUser();
  const [activeTab, setActiveTab] = useState('currently-teaching');
  const [currentlyTeaching, setCurrentlyTeaching] = useState([]);
  const [pastCourses, setPastCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Comprehensive course catalog based on grade levels
  const allCoursesByCategory = {
    'Math': {
      icon: faCalculator,
      color: '#e74c3c',
      courses: [
        // Primary (Grades 1-3)
        'Addition & Subtraction',
        'Place Value',
        'Patterns',
        'Basic Geometry',
        'Time & Money',
        // Junior (Grades 4-6)
        'Multiplication & Division',
        'Fractions',
        'Decimals',
        'Intro Algebra (Patterns)',
        'Geometry',
        'Measurement',
        // Intermediate (Grades 7-8)
        'Integers',
        'Ratios & Rates',
        'Equations (Intro)',
        'Pythagorean Theorem',
        'Graphing Basics',
        'Probability',
        // Grade 9
        'Foundations of Algebra',
        'Linear Relations',
        'Analytic Geometry (Intro)',
        // Grade 10
        'Quadratics',
        'Trigonometry Basics',
        'Systems of Equations',
        // Grade 11
        'Functions',
        'College Math',
        'Workplace Math',
        // Grade 12
        'Advanced Functions',
        'Calculus & Vectors',
        'Data Management',
        'Statistics'
      ]
    },
    'English / Language Arts': {
      icon: faBook,
      color: '#f1c40f',
      courses: [
        // Primary (Grades 1-3)
        'Reading',
        'Phonics',
        'Writing',
        'Spelling',
        'Basic Grammar',
        // Junior (Grades 4-6)
        'Reading Comprehension',
        'Paragraph Writing',
        'Grammar',
        'Vocabulary',
        // Intermediate (Grades 7-8)
        'English Language Arts',
        'Reading & Analysis',
        'Essay Writing',
        'Grammar & Composition',
        // Grade 9-12
        'English 9',
        'English 10',
        'English 11',
        'English 12',
        'Literature',
        'Literature & Composition',
        'Literature Analysis',
        'Writing & Rhetoric',
        'Media Studies',
        'University Preparation'
      ]
    },
    'Science': {
      icon: faFlask,
      color: '#2ecc71',
      courses: [
        // Primary (Grades 1-3)
        'Life Systems',
        'Materials',
        'Weather & Seasons',
        'Simple Machines',
        // Junior (Grades 4-6)
        'Electricity',
        'Space',
        'Biodiversity',
        // Intermediate (Grades 7-8)
        'Cells & Systems',
        'Fluids',
        'Heat & Energy',
        'Ecology',
        // Grade 9
        'General Science',
        'Biology Intro',
        'Chemistry Intro',
        'Physics Intro',
        // Grades 10-12
        'Biology',
        'Chemistry',
        'Physics'
      ]
    },
    'Social Studies': {
      icon: faGlobe,
      color: '#9b59b6',
      courses: [
        // Junior (Grades 4-6)
        'Heritage & Identity',
        'People & Environments',
        'History Basics',
        'Geography Basics',
        // Intermediate (Grades 7-8)
        'History',
        'Geography',
        'World Cultures',
        'Canadian Studies',
        // Grade 9
        'Geography 9',
        'World Geography',
        // Grade 10
        'History 10',
        'Canadian History',
        'Civics & Career Studies',
        // Grade 11
        'Social Sciences',
        'World History',
        'Law & Politics',
        // Grade 12
        'World Issues',
        'Philosophy'
      ]
    },
    'French': {
      icon: faGlobe,
      color: '#e67e22',
      courses: [
        'French Basics',
        'French Reading',
        'French Writing',
        'French Intermediate',
        'French Conversation',
        'French Grammar',
        'French Advanced',
        'French Literature',
        'French Communication',
        'French 9',
        'French 10',
        'French 11',
        'French 12',
        'Core French',
        'French Immersion'
      ]
    },
    'Technology / CS': {
      icon: faGraduationCap,
      color: '#3498db',
      courses: [
        // Intermediate (Grades 7-8)
        'Coding Fundamentals',
        'Robotics Basics',
        'Digital Literacy',
        // Grade 9
        'Intro to Coding (Python)',
        'Intro to Coding (Java)',
        'Web Basics',
        // Grade 10
        'Programming Fundamentals',
        'Web Development Basics',
        'Computer Science',
        // Grade 11
        'Programming (Intermediate)',
        'Data Structures',
        'Web Development',
        'App Development',
        // Grade 12
        'Software Engineering',
        'OOP',
        'Algorithms',
        'Databases',
        'Web Applications'
      ]
    },
    'Business': {
      icon: faBook,
      color: '#8B4513',
      courses: [
        // Grade 9
        'Intro to Business (optional)',
        'Entrepreneurship Basics',
        // Grade 10
        'Intro to Business',
        'Entrepreneurship',
        'Marketing Basics',
        // Grade 11
        'Marketing',
        'Accounting (Intro)',
        'Business Management',
        // Grade 12
        'Financial Accounting',
        'Finance & Investing',
        'Marketing & Management',
        'Business Leadership'
      ]
    }
  };

  // Set user type when component mounts
  useEffect(() => {
    setUserType('tutor');
  }, [setUserType]);

  // Fetch tutor's subjects on mount
  useEffect(() => {
    fetchTutorSubjects();
  }, []);

  // Fetch all available subjects for browsing
  useEffect(() => {
    if (activeTab === 'browse-courses') {
      fetchAllSubjects();
    } else {
      // Clear search query when switching away from browse-courses tab
      setSearchQuery('');
    }
  }, [activeTab]);

  const fetchTutorSubjects = async () => {
    try {
      setLoading(true);
      const response = await tutorSubjectAPI.getMySubjects();
      const subjects = response.data;
      
      // Separate by status
      const current = subjects.filter(s => s.status === 'CURRENTLY_TEACHING');
      const past = subjects.filter(s => s.status === 'PAST');
      
      setCurrentlyTeaching(current);
      setPastCourses(past);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showMessage('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      // Generate comprehensive course list from our catalog
      const courses = [];
      let id = 1;
      
      Object.entries(allCoursesByCategory).forEach(([category, data]) => {
        data.courses.forEach(courseName => {
          courses.push({
            id: id++,
            name: courseName,
            category: category,
            icon: data.icon,
            color: data.color
          });
        });
      });
      
      setAllSubjects(courses);
    } catch (error) {
      console.error('Error loading courses:', error);
      showMessage('Failed to load available courses', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const getSubjectIcon = (subjectName) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math') || name.includes('calculus') || name.includes('algebra')) {
      return faCalculator;
    } else if (name.includes('science') || name.includes('biology') || name.includes('chemistry') || name.includes('physics')) {
      return faFlask;
    } else if (name.includes('history') || name.includes('geography') || name.includes('social')) {
      return faGlobe;
    } else if (name.includes('art') || name.includes('music')) {
      return faPalette;
    }
    return faBook;
  };

  const getSubjectColor = (index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#9b59b6', '#e67e22', '#3498db', '#2ecc71', '#f39c12', '#1abc9c'];
    return colors[index % colors.length];
  };

  const handleAddCourse = async () => {
    if (!selectedSubject) {
      showMessage('Please select a subject', 'error');
      return;
    }

    try {
      await tutorSubjectAPI.addSubject({
        subjectName: selectedSubject,
        status: 'CURRENTLY_TEACHING'
      });
      
      showMessage('Subject added successfully!', 'success');
      setShowAddModal(false);
      setSelectedSubject('');
      await fetchTutorSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add subject';
      showMessage(errorMsg, 'error');
    }
  };

  const handleRemoveCourse = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to remove "${subjectName}" from your teaching list?`)) {
      return;
    }

    try {
      await tutorSubjectAPI.removeSubject(subjectId);
      showMessage('Subject removed successfully!', 'success');
      await fetchTutorSubjects();
    } catch (error) {
      console.error('Error removing subject:', error);
      showMessage('Failed to remove subject', 'error');
    }
  };

  const handleMoveToPast = async (subjectId, subjectName) => {
    if (!window.confirm(`Move "${subjectName}" to past courses?`)) {
      return;
    }

    try {
      await tutorSubjectAPI.updateSubjectStatus(subjectId, 'PAST');
      showMessage('Subject moved to past courses!', 'success');
      await fetchTutorSubjects();
    } catch (error) {
      console.error('Error updating status:', error);
      showMessage('Failed to update subject status', 'error');
    }
  };

  const handleMoveToCurrent = async (subjectId, subjectName) => {
    if (!window.confirm(`Move "${subjectName}" back to currently teaching?`)) {
      return;
    }

    try {
      await tutorSubjectAPI.updateSubjectStatus(subjectId, 'CURRENTLY_TEACHING');
      showMessage('Subject moved to currently teaching!', 'success');
      await fetchTutorSubjects();
    } catch (error) {
      console.error('Error updating status:', error);
      showMessage('Failed to update subject status', 'error');
    }
  };

  const getCoursesByTab = () => {
    switch (activeTab) {
      case 'currently-teaching':
        return currentlyTeaching;
      case 'past-courses':
        return pastCourses;
      case 'browse-courses':
        // Filter out subjects already in tutor's list
        const tutorSubjectNames = [...currentlyTeaching, ...pastCourses].map(s => s.subjectName);
        let availableSubjects = allSubjects.filter(s => !tutorSubjectNames.includes(s.name));
        
        // Apply category filter
        if (selectedCategory !== 'all') {
          availableSubjects = availableSubjects.filter(s => s.category === selectedCategory);
        }
        
        // Apply search filter if search query exists
        if (searchQuery.trim()) {
          availableSubjects = availableSubjects.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        return availableSubjects;
      default:
        return currentlyTeaching;
    }
  };

  const getAvailableSubjects = () => {
    // Get courses not already in tutor's list
    const tutorSubjectNames = [...currentlyTeaching, ...pastCourses].map(s => s.subjectName);
    return allSubjects
      .filter(s => !tutorSubjectNames.includes(s.name))
      .sort((a, b) => {
        // Sort by category first, then by course name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
  };

  return (
    <div className="courses-page">
      <TutorSidebar />
      
      <div className="courses-main-content">
        <div className="courses-header">
          <h1>My Courses</h1>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="courses-tabs">
          <button 
            className={`tab ${activeTab === 'currently-teaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('currently-teaching')}
          >
            Currently Teaching
          </button>
          <button 
            className={`tab ${activeTab === 'past-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('past-courses')}
          >
            Past Courses
          </button>
          <button 
            className={`tab ${activeTab === 'browse-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse-courses')}
          >
            Browse Courses
          </button>
        </div>

        {/* Search Bar and Category Filter for Browse Courses */}
        {activeTab === 'browse-courses' && (
          <div className="search-container">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div className="category-filter">
              <label htmlFor="category-select">Filter by subject:</label>
              <select
                id="category-select"
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {Object.keys(allCoursesByCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">Loading subjects...</div>
        ) : (
          <>
            {/* Course Cards Grid */}
            <div className="courses-grid">
              {activeTab === 'browse-courses' ? (
                // Browse tab shows all available courses not in tutor's list
                getCoursesByTab().length > 0 ? (
                  getCoursesByTab().map((course) => (
                    <div 
                      key={course.id} 
                      className="course-card browse-card" 
                      style={{ backgroundColor: course.color }}
                    >
                      <div className="course-icon">
                        <FontAwesomeIcon icon={course.icon} />
                      </div>
                      <div className="course-info">
                        <div className="course-category">{course.category}</div>
                        <div className="course-title">{course.name}</div>
                        <button 
                          className="add-to-teaching-btn"
                          onClick={async () => {
                            try {
                              await tutorSubjectAPI.addSubject({
                                subjectName: course.name,
                                status: 'CURRENTLY_TEACHING'
                              });
                              showMessage('Course added!', 'success');
                              await fetchTutorSubjects();
                              await fetchAllSubjects();
                            } catch (error) {
                              console.error('Error adding course:', error);
                              showMessage('Failed to add course', 'error');
                            }
                          }}
                        >
                          Add to Teaching
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>
                      {searchQuery || selectedCategory !== 'all'
                        ? `No courses found`
                        : 'All available courses are already in your list'}
                    </p>
                  </div>
                )
              ) : (
                // Currently Teaching and Past Courses tabs
                <>
                  {getCoursesByTab().length > 0 ? (
                    getCoursesByTab().map((subject, index) => (
                      <div 
                        key={subject.subjectId} 
                        className="course-card" 
                        style={{ backgroundColor: getSubjectColor(index) }}
                      >
                        <div className="course-icon">
                          <FontAwesomeIcon icon={getSubjectIcon(subject.subjectName)} />
                        </div>
                        <div className="course-info">
                          <div className="course-title">{subject.subjectName}</div>
                          <button 
                            className="view-course-btn"
                            onClick={() => navigate(`/my-courses/${encodeURIComponent(subject.subjectName)}`)}
                          >
                            View Course
                          </button>
                          <div className="course-actions">
                            {activeTab === 'currently-teaching' ? (
                              <>
                                <button 
                                  className="action-btn archive-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToPast(subject.subjectId, subject.subjectName);
                                  }}
                                  title="Move to Past"
                                >
                                  <FontAwesomeIcon icon={faArchive} /> Past
                                </button>
                                <button 
                                  className="action-btn remove-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCourse(subject.subjectId, subject.subjectName);
                                  }}
                                  title="Remove"
                                >
                                  <FontAwesomeIcon icon={faTrash} /> Remove
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="action-btn restore-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToCurrent(subject.subjectId, subject.subjectName);
                                  }}
                                  title="Move to Current"
                                >
                                  <FontAwesomeIcon icon={faUndo} /> Restore
                                </button>
                                <button 
                                  className="action-btn remove-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCourse(subject.subjectId, subject.subjectName);
                                  }}
                                  title="Remove"
                                >
                                  <FontAwesomeIcon icon={faTrash} /> Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>
                        {activeTab === 'currently-teaching' 
                          ? "You're not currently teaching any subjects. Add one to get started!"
                          : "No past courses yet."}
                      </p>
                    </div>
                  )}
                  
                  {/* Add Course Card for Currently Teaching tab */}
                  {activeTab === 'currently-teaching' && (
                    <div className="add-course-card" onClick={() => {
                      setShowAddModal(true);
                      fetchAllSubjects();
                    }}>
                      <div className="add-course-icon">
                        <FontAwesomeIcon icon={faFolderPlus} />
                      </div>
                      <button className="add-course-btn">Add Course</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Add Course Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add Course</h2>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="subject-select"
              >
                <option value="">Select a course...</option>
                {Object.keys(allCoursesByCategory).map(category => (
                  <optgroup key={category} label={category}>
                    {getAvailableSubjects()
                      .filter(s => s.category === category)
                      .map(course => (
                        <option key={course.id} value={course.name}>
                          {course.name}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
              </select>
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSubject('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn" 
                  onClick={handleAddCourse}
                >
                  Add Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

