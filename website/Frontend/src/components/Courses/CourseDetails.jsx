import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faEdit,
  faSave,
  faGraduationCap,
  faFlask,
  faGlobe,
  faCalculator,
  faPalette
} from '@fortawesome/free-solid-svg-icons';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { courseContentAPI } from '../../services/api';
import './CourseDetails.css';

const CourseDetails = () => {
  const { id, subjectName } = useParams();
  const navigate = useNavigate();
  const { setUserType } = useUser();
  const [isEditingLessonPlan, setIsEditingLessonPlan] = useState(false);
  const [isEditingSyllabus, setIsEditingSyllabus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [lessonPlan, setLessonPlan] = useState('');
  const [syllabus, setSyllabus] = useState('');
  
  // Set user type when component mounts
  useEffect(() => {
    setUserType('tutor');
  }, [setUserType]);

  // Helper function to get icon based on subject name
  const getSubjectIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('math') || lowerName.includes('calculus') || lowerName.includes('algebra')) {
      return faCalculator;
    } else if (lowerName.includes('science') || lowerName.includes('biology') || lowerName.includes('chemistry') || lowerName.includes('physics')) {
      return faFlask;
    } else if (lowerName.includes('history') || lowerName.includes('geography') || lowerName.includes('social')) {
      return faGlobe;
    } else if (lowerName.includes('art') || lowerName.includes('music')) {
      return faPalette;
    }
    return faGraduationCap;
  };

  // Helper function to get color based on index (using simple hash of subject name)
  const getSubjectColor = (name) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#9b59b6', '#e67e22', '#3498db', '#2ecc71', '#f39c12', '#1abc9c'];
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Use subject name from URL if available, otherwise fall back to id
  const courseName = subjectName ? decodeURIComponent(subjectName) : 
                    (id === '1' ? 'Advanced Functions' : 
                     id === '2' ? 'Biology' : 
                     id === '3' ? 'Algebra Basics' : 
                     id === '4' ? 'World History' : 
                     id === '5' ? 'Calculus' : 
                     id === '6' ? 'Chemistry' : 
                     id === '7' ? 'Art Fundamentals' : 
                     'Course');

  const course = {
    title: courseName,
    subject: courseName,
    icon: getSubjectIcon(courseName),
    color: getSubjectColor(courseName)
  };

  // Fetch course content when component mounts or subject changes
  useEffect(() => {
    fetchCourseContent();
  }, [courseName]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await courseContentAPI.getCourseContent(courseName);
      const content = response.data;
      
      setLessonPlan(content.lessonPlan || '');
      setSyllabus(content.syllabus || '');
    } catch (error) {
      console.error('Error fetching course content:', error);
      showMessage('Failed to load course content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveLessonPlan = async () => {
    try {
      await courseContentAPI.updateCourseContent({
        subjectName: courseName,
        lessonPlan: lessonPlan,
        syllabus: syllabus
      });
      
      setIsEditingLessonPlan(false);
      showMessage('Lesson plan saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      showMessage('Failed to save lesson plan', 'error');
    }
  };

  const handleSaveSyllabus = async () => {
    try {
      await courseContentAPI.updateCourseContent({
        subjectName: courseName,
        lessonPlan: lessonPlan,
        syllabus: syllabus
      });
      
      setIsEditingSyllabus(false);
      showMessage('Syllabus saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving syllabus:', error);
      showMessage('Failed to save syllabus', 'error');
    }
  };

  return (
    <div className="course-details-page">
      <TutorSidebar />
      
      <div className="course-details-main-content">
        {/* Back Button and Course Header */}
        <div className="course-details-header">
          <button className="back-btn" onClick={() => navigate('/courses')}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Courses</span>
          </button>
          
          <div className="course-info-header" style={{ borderLeftColor: course.color }}>
            <div className="course-icon-large" style={{ backgroundColor: course.color }}>
              <FontAwesomeIcon icon={course.icon} />
            </div>
            <div className="course-header-text">
              <h1>{course.title}</h1>
              <p>{course.subject}</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">Loading course content...</div>
        ) : (
          /* Main Content Grid */
          <div className="course-content-grid">
          {/* Lesson Plan Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Lesson Plan</h2>
              {isEditingLessonPlan ? (
                <button 
                  className="save-btn"
                  onClick={handleSaveLessonPlan}
                >
                  <FontAwesomeIcon icon={faSave} />
                  <span>Save</span>
                </button>
              ) : (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingLessonPlan(true)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {isEditingLessonPlan ? (
              <textarea
                className="content-editor"
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                placeholder="Enter your lesson plan here..."
              />
            ) : (
              <div className="content-viewer">
                {lessonPlan.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* Syllabus Section */}
          <div className="content-section">
            <div className="section-header">
              <h2>Syllabus</h2>
              {isEditingSyllabus ? (
                <button 
                  className="save-btn"
                  onClick={handleSaveSyllabus}
                >
                  <FontAwesomeIcon icon={faSave} />
                  <span>Save</span>
                </button>
              ) : (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingSyllabus(true)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {isEditingSyllabus ? (
              <textarea
                className="content-editor"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                placeholder="Enter your syllabus here..."
              />
            ) : (
              <div className="content-viewer">
                {syllabus.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;

