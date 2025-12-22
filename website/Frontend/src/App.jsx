import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React from 'react';
import Home from './components/Home/Home';
import './App.css'
import Login from './auth/Login/Login';
import Signup from './auth/Signup/Signup';
import TutorSignup from './auth/TutorSignup/TutorSignup';
import Verification from './auth/Verification/Verification';
import ForgotPassword from './auth/ForgotPassword/ForgotPassword';
import ResetPassword from './auth/ResetPassword/ResetPassword';
import Layout from './components/Layout/Layout';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TutorDashboard from './components/Dashboard/TutorDashboard';
import Calendar from './components/Calendar/Calendar';
import BookLesson from './components/BookLesson/BookLesson';
import LessonHistory from './components/LessonHistory/LessonHistory';
import Profile from './components/Profile/Profile';
import Courses from './components/Courses/Courses';
import CourseDetails from './components/Courses/CourseDetails';
import AvailabilityManager from './components/Availability/AvailabilityManager';
import Messages from './components/Messages/Messages';
import About from './About/About';
import Pricing from './Pricing/Pricing';
import Team from './Team/Team';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="team" element={<Team />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="signup/tutor/:token" element={<TutorSignup />} />
          <Route path="verify" element={<Verification />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="tutor-dashboard" element={<TutorDashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="book-lesson" element={<BookLesson />} />
          <Route path="lesson-history" element={<LessonHistory />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="my-courses/:subjectName" element={<CourseDetails />} />
          <Route path="availability" element={<AvailabilityManager />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
