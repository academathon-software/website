import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (username, email, password, role) => api.post('/auth/signup', { username, email, password, role }),
  verify: (email, verificationCode) => api.post('/auth/verify', { email, verificationCode }),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/me', data),
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProfilePicture: () => api.delete('/users/profile-picture'),
  getProfilePicture: () => api.get('/users/profile-picture'),
};

// Tutor API
export const tutorAPI = {
  // Search tutors with filters
  searchTutors: (params = {}) => 
    api.get('/api/tutors', { params }),
  
  // Get tutor by ID
  getTutorById: (id) => api.get(`/api/tutors/${id}`),
  
  // Get current user's tutor profile
  getMyProfile: () => api.get('/api/tutors/me'),
  
  // Create tutor profile
  createTutor: (data) => api.post('/api/tutors', data),
  
  // Update tutor profile
  updateTutor: (id, data) => api.put(`/api/tutors/${id}`, data),
  
  // Delete tutor profile
  deleteTutor: (id) => api.delete(`/api/tutors/${id}`),
};

// Booking API
export const bookingAPI = {
  // Create a new booking
  createBooking: (bookingData) => api.post('/api/bookings', bookingData),
  
  // Get all bookings for current user
  getUserBookings: () => api.get('/api/bookings'),
  
  // Get upcoming bookings
  getUpcomingBookings: () => api.get('/api/bookings/upcoming'),
  
  // Get past bookings
  getPastBookings: () => api.get('/api/bookings/past'),
  
  // Get pending bookings (tutor only)
  getPendingBookings: () => api.get('/api/bookings/pending'),
  
  // Get bookings within a date range
  getBookingsByDateRange: (start, end) => 
    api.get('/api/bookings/range', {
      params: { start, end }
    }),
  
  // Get a specific booking
  getBookingById: (id) => api.get(`/api/bookings/${id}`),
  
  // Cancel a booking
  cancelBooking: (id) => api.put(`/api/bookings/${id}/cancel`),
  
  // Confirm a booking (tutor only)
  confirmBooking: (id) => api.put(`/api/bookings/${id}/confirm`),
  
  // Reject a booking (tutor only)
  rejectBooking: (id, reason) => api.put(`/api/bookings/${id}/reject`, { reason }),
  
  // Mark a booking as completed
  completeBooking: (id) => api.put(`/api/bookings/${id}/complete`),
  
  // Check if a tutor is available
  checkAvailability: (tutorId, start, end) => 
    api.get('/api/bookings/check-availability', {
      params: { tutorId, start, end }
    }),
  
  // Request a reschedule (student only)
  requestReschedule: (bookingId, startTime, endTime) => 
    api.put(`/api/bookings/${bookingId}/reschedule`, { startTime, endTime }),
  
  // Accept a reschedule request (tutor only)
  acceptReschedule: (bookingId) => 
    api.put(`/api/bookings/${bookingId}/reschedule/accept`),
  
  // Reject a reschedule request (tutor only)
  rejectReschedule: (bookingId, reason) => 
    api.put(`/api/bookings/${bookingId}/reschedule/reject`, { reason }),
};

// Payment API
export const paymentAPI = {
  // Create a payment intent for a booking
  createPaymentIntent: (bookingId) => 
    api.post('/api/payments/create-intent', { bookingId }),
  
  // Get payment details for a booking
  getPaymentDetails: (bookingId) => 
    api.get(`/api/payments/booking/${bookingId}`),
  
  // Confirm payment success
  confirmPayment: (paymentIntentId) => 
    api.post('/api/payments/confirm', { paymentIntentId }),
  
  // Refund a payment
  refundPayment: (bookingId) => 
    api.post(`/api/payments/refund/${bookingId}`),
};

// Availability API
export const availabilityAPI = {
  // Get tutor's recurring schedule
  getSchedule: (tutorId) => api.get(`/api/availability/${tutorId}`),
  
  // Get available time slots for booking
  getAvailableSlots: (tutorId, start, end, duration = 60) => 
    api.get(`/api/availability/${tutorId}/slots`, {
      params: { start, end, duration }
    }),
  
  // Set/update recurring schedule (tutor only)
  setRecurringSchedule: (schedules) => 
    api.post('/api/availability/schedule', { schedules }),
  
  // Get current tutor's exceptions
  getMyExceptions: () => api.get('/api/availability/exceptions'),
  
  // Get exceptions for a specific tutor
  getTutorExceptions: (tutorId) => api.get(`/api/availability/${tutorId}/exceptions`),
  
  // Add an availability exception (tutor only)
  addException: (exceptionData) => 
    api.post('/api/availability/exception', exceptionData),
  
  // Remove an exception (tutor only)
  removeException: (exceptionId) => 
    api.delete(`/api/availability/exception/${exceptionId}`),
};

// Tutor Subject API (Course Management)
export const tutorSubjectAPI = {
  // Get current tutor's subjects with status
  getMySubjects: (status) => 
    api.get('/api/tutors/me/subjects', { params: status ? { status } : {} }),
  
  // Add a subject to tutor's teaching list
  addSubject: (subjectData) => 
    api.post('/api/tutors/me/subjects', subjectData),
  
  // Update subject status (move to past/current)
  updateSubjectStatus: (subjectId, status) => 
    api.put(`/api/tutors/me/subjects/${subjectId}`, { status }),
  
  // Remove a subject from teaching list
  removeSubject: (subjectId) => 
    api.delete(`/api/tutors/me/subjects/${subjectId}`),
};

// Subject API (for browsing all subjects)
export const subjectAPI = {
  getAllSubjects: () => api.get('/api/subjects'),
};

// Course Content API (for lesson plans and syllabi)
export const courseContentAPI = {
  // Get course content by subject name
  getCourseContent: (subjectName) => 
    api.get('/api/course-content', { params: { subjectName } }),
  
  // Update course content (lesson plan and/or syllabus)
  updateCourseContent: (contentData) => 
    api.put('/api/course-content', contentData),
};

// Messaging API
export const messageAPI = {
  // Send a message
  sendMessage: (recipientId, content, bookingId = null) => 
    api.post('/api/messages/send', { recipientId, content, bookingId }),
  
  // Get all conversations for current user
  getConversations: () => api.get('/api/messages/conversations'),
  
  // Get messages in a specific conversation
  getConversationMessages: (conversationId) => 
    api.get(`/api/messages/conversations/${conversationId}`),
  
  // Get or create conversation with another user
  getOrCreateConversation: (otherUserId, bookingId = null) => 
    api.get(`/api/messages/conversations/with/${otherUserId}`, {
      params: bookingId ? { bookingId } : {}
    }),
  
  // Mark conversation as read
  markAsRead: (conversationId) => 
    api.post(`/api/messages/conversations/${conversationId}/read`),
  
  // Edit a message
  editMessage: (messageId, content) => 
    api.put(`/api/messages/${messageId}`, { content }),
  
  // Delete a message
  deleteMessage: (messageId) => 
    api.delete(`/api/messages/${messageId}`),
};

export default api;
