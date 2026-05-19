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
  // Same subject catalog used across the app (BookLesson, TutorSignup, Courses)
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
      const courses = ALL_SUBJECTS.map((name, index) => ({
        id: index + 1,
        name,
        icon: getSubjectIcon(name),
        color: getSubjectColor(index)
      }));
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

        // Apply search filter if search query exists
        if (searchQuery.trim()) {
          availableSubjects = availableSubjects.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                      {searchQuery
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
                {getAvailableSubjects().map(course => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
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

