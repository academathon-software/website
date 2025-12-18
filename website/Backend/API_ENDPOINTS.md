# Academathon API Endpoints

## Authentication Endpoints
Base URL: `/auth`

### POST /auth/signup
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "role": "STUDENT" | "TUTOR" | "ADMIN"
}
```

### POST /auth/login
Authenticate user and get JWT token
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/verify
Verify user account with verification code
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

### POST /auth/resend
Resend verification code
```
POST /auth/resend?email=user@example.com
```

## Tutor Profile Endpoints
Base URL: `/api/tutors`

### GET /api/tutors
Search and filter tutors with pagination
**Query Parameters:**
- `subject` (optional): Filter by subject name
- `name` (optional): Search by tutor display name
- `minRate` (optional): Minimum hourly rate
- `maxRate` (optional): Maximum hourly rate
- `page` (default: 0): Page number
- `size` (default: 10): Page size
- `sort` (default: "createdAt"): Sort field
- `direction` (default: "desc"): Sort direction (asc/desc)

**Example:** `/api/tutors?subject=Mathematics&minRate=20&maxRate=50&page=0&size=5`

### GET /api/tutors/{id}
Get specific tutor profile by ID

### GET /api/tutors/me
Get current user's tutor profile (requires authentication)

### POST /api/tutors
Create new tutor profile
```json
{
  "email": "tutor@example.com",
  "password": "password123",
  "displayName": "Dr. John Smith",
  "bio": "Experienced mathematics tutor with 10+ years of experience",
  "hourlyRate": 45.00,
  "subjects": ["Mathematics", "Calculus", "Statistics"]
}
```

### PUT /api/tutors/{id}
Update tutor profile (owner only)
```json
{
  "displayName": "Dr. John Smith",
  "bio": "Updated bio information",
  "hourlyRate": 50.00,
  "subjects": ["Mathematics", "Calculus", "Statistics", "Physics"]
}
```

### DELETE /api/tutors/{id}
Delete tutor profile (owner only)

## Subject Management Endpoints
Base URL: `/api/subjects`

### GET /api/subjects
Get all available subjects

### GET /api/subjects/{id}
Get subject by ID

### POST /api/subjects
Create new subject (admin only)
```json
{
  "name": "Advanced Calculus"
}
```

### PUT /api/subjects/{id}
Update subject name (admin only)
```json
{
  "name": "Updated Subject Name"
}
```

### DELETE /api/subjects/{id}
Delete subject (admin only)

## Student Profile Endpoints
Base URL: `/api/students`

### GET /api/students/me
Get current student's profile (requires authentication)

### PUT /api/students/me
Update student profile
```json
{
  "username": "newusername"
}
```

### GET /api/students
Get all students (admin only)

## User Management Endpoints
Base URL: `/users`

### GET /users/me
Get current authenticated user information

### GET /users/
Get all users (admin only)

### DELETE /users/delete/{email}
Delete user by email (admin only)

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Paginated Response
```json
{
  "tutors": [...],
  "currentPage": 0,
  "totalPages": 5,
  "totalElements": 47,
  "hasNext": true,
  "hasPrevious": false
}
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

