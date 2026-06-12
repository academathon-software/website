import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React from 'react';
import HomeV2 from './components/Home/HomeV2';
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
import Wallet from './components/Wallet/Wallet';
import LessonHistory from './components/LessonHistory/LessonHistory';
import Profile from './components/Profile/Profile';
import Courses from './components/Courses/Courses';
import CourseDetails from './components/Courses/CourseDetails';
import AvailabilityManager from './components/Availability/AvailabilityManager';
import Messages from './components/Messages/Messages';
import About from './About/About';
import Pricing from './Pricing/Pricing';
import Team from './Team/Team';
import Contact from './Contact/Contact';
import { UserProvider } from './context/UserContext';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import SessionExpiryWatcher from './components/Auth/SessionExpiryWatcher';

function App() {
  return (
    <UserProvider>
      <Router>
      <SessionExpiryWatcher />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeV2 />} />
          <Route path="about" element={<About />} />
          <Route path="team" element={<Team />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="signup/tutor/:token" element={<TutorSignup />} />
          <Route path="verify" element={<Verification />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="contact" element={<Contact />} />
        </Route>
          {/* Student-only routes */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="book-lesson" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <BookLesson />
            </ProtectedRoute>
          } />
          <Route path="wallet" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <Wallet />
            </ProtectedRoute>
          } />
          
          {/* Tutor-only routes */}
          <Route path="tutor-dashboard" element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <TutorDashboard />
            </ProtectedRoute>
          } />
          <Route path="courses" element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="courses/:id" element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <CourseDetails />
            </ProtectedRoute>
          } />
          <Route path="my-courses/:subjectName" element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <CourseDetails />
            </ProtectedRoute>
          } />
          <Route path="availability" element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <AvailabilityManager />
            </ProtectedRoute>
          } />
          
          {/* Routes for both students and tutors */}
          <Route path="calendar" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'TUTOR']}>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="lesson-history" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'TUTOR']}>
              <LessonHistory />
            </ProtectedRoute>
          } />
          <Route path="messages" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'TUTOR']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes - all admin functionality is now tabs in /admin-dashboard */}
          <Route path="admin-dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={<Navigate to="/admin-dashboard?tab=users" replace />} />
          <Route path="admin/statistics" element={<Navigate to="/admin-dashboard?tab=statistics" replace />} />
          <Route path="admin/bookings" element={<Navigate to="/admin-dashboard?tab=bookings" replace />} />
          <Route path="admin/invitations" element={<Navigate to="/admin-dashboard?tab=tutors" replace />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
