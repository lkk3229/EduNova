# EduNova Backend API - Complete Documentation

## Version 3.6

### Quick Links
- **API Base URL**: `http://localhost:5000/api`
- **Health Check**: `GET /api/health`
- **Admin Dashboard**: `/api/admin`
- **Frontend Integration**: See [js/api-client.js](../js/api-client.js)

---

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Books API](#books-api)
3. [Courses API](#courses-api)
4. [Users API](#users-api)
5. [Certificates API](#certificates-api)
6. [Meetings API](#meetings-api)
7. [Admin API](#admin-api)
8. [Error Handling](#error-handling)
9. [Response Format](#response-format)

---

## Authentication API

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "userType": "student"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "userType": "student"
    }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
    "email": "john@example.com",
    "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "userType": "student"
    }
}
```

### POST /api/auth/refresh-token
Refresh an expired JWT token.

**Headers:**
```
Authorization: Bearer {old_token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Books API

### GET /api/books
List all books with optional filters.

**Query Parameters:**
- `board` (optional): Filter by board (ncert, icse, state)
- `classLevel` (optional): Filter by class (1-12)
- `subject` (optional): Filter by subject (Mathematics, English, Science, etc.)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/books?board=ncert&classLevel=6&subject=Mathematics&page=1&limit=10
```

**Response (200 OK):**
```json
{
    "success": true,
    "total": 150,
    "page": 1,
    "pages": 15,
    "books": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Mathematics Class 6",
            "subject": "Mathematics",
            "classLevel": 6,
            "board": "ncert",
            "pdfUrl": "https://ncert.nic.in/pdf/...",
            "chapters": [],
            "tags": ["ncert", "class-6", "mathematics"],
            "createdAt": "2026-01-15T10:30:00Z"
        }
    ]
}
```

### GET /api/books/ncert/catalog
Get NCERT catalog for Classes 1-12 with filters for subject, language, stream, and class.

**Query Parameters:**
- `classLevel` (optional): Filter by class (1-12)
- `subject` (optional): Case-insensitive subject filter
- `language` (optional): Case-insensitive language filter
- `stream` (optional): Stream filter (General/Science/Commerce/Arts)
- `search` (optional): Full-text search on title/subject/description/language/stream

**Example:**
```
GET /api/books/ncert/catalog?classLevel=10&language=Hindi
```

**Response (200 OK):**
```json
{
    "success": true,
    "sourceUrl": "https://ncert.nic.in/textbook.php",
    "total": 1,
    "books": [
        {
            "id": "ncert-10-hindi-3",
            "board": "NCERT",
            "boardId": "ncert",
            "classLevel": 10,
            "subject": "Hindi",
            "language": "Hindi",
            "stream": "General",
            "title": "NCERT Class 10 Kshitij / Sparsh",
            "description": "NCERT Hindi textbook for Class 10 (Hindi).",
            "sourceUrl": "https://ncert.nic.in/textbook.php",
            "pdfUrl": "https://ncert.nic.in/pdf/publication/Class10Hindi.pdf",
            "tags": ["NCERT", "Class 10", "Hindi", "Hindi", "General"]
        }
    ]
}
```

### GET /api/books/ncert/classes
List all available NCERT classes from catalog.

### GET /api/books/ncert/subjects
List subjects from NCERT catalog.

**Query Parameters:**
- `classLevel` (optional): Filter subjects by class.

### GET /api/books/ncert/languages
List languages from NCERT catalog.

**Query Parameters:**
- `classLevel` (optional): Filter languages by class.

### GET /api/books/:id
Get single book details.

**Response (200 OK):**
```json
{
    "success": true,
    "book": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Mathematics Class 6",
        "description": "NCERT Mathematics textbook for Class 6",
        "subject": "Mathematics",
        "classLevel": 6,
        "board": "ncert",
        "pdfUrl": "https://ncert.nic.in/pdf/...",
        "chapters": ["Chapter 1", "Chapter 2"],
        "tags": ["ncert", "class-6", "mathematics"]
    }
}
```

### GET /api/books/search
Search books by title and subject.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Max results (default: 10)

**Example:**
```
GET /api/books/search?q=mathematics&limit=5
```

**Response (200 OK):**
```json
{
    "success": true,
    "results": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Mathematics Class 6",
            "subject": "Mathematics",
            "classLevel": 6
        }
    ]
}
```

---

## Courses API

### GET /api/courses
List all active courses.

**Query Parameters:**
- `category` (optional): Filter by category
- `level` (optional): Filter by level (beginner, intermediate, advanced)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
    "success": true,
    "total": 10,
    "courses": [
        {
            "_id": "507f1f77bcf86cd799439012",
            "title": "NCERT Mathematics Class 10",
            "description": "Complete course covering NCERT Mathematics Class 10",
            "price": 0,
            "category": "Mathematics",
            "level": "intermediate",
            "duration": 90,
            "rating": 4.5,
            "enrollmentCount": 125,
            "status": "active"
        }
    ]
}
```

### GET /api/courses/:id
Get course details with sections.

**Response (200 OK):**
```json
{
    "success": true,
    "course": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "NCERT Mathematics Class 10",
        "description": "Complete course covering NCERT Mathematics Class 10",
        "price": 0,
        "category": "Mathematics",
        "instructorId": {
            "_id": "507f1f77bcf86cd799439001",
            "name": "John Teacher",
            "email": "teacher@edunova.com"
        },
        "sections": [
            {
                "title": "Chapter 1: Real Numbers",
                "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                "title": "Chapter 2: Polynomials",
                "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
            }
        ]
    }
}
```

### POST /api/courses/:id/enroll
Enroll current user in a course.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Enrolled successfully",
    "enrollment": {
        "_id": "507f1f77bcf86cd799439013",
        "userId": "507f1f77bcf86cd799439003",
        "courseId": "507f1f77bcf86cd799439012",
        "progress": 0,
        "status": "in-progress"
    }
}
```

### PUT /api/courses/:id/progress
Update course completion progress.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
    "progress": 50
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Progress updated",
    "enrollment": {
        "progress": 50,
        "status": "in-progress"
    }
}
```

---

## Users API

### GET /api/users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "_id": "507f1f77bcf86cd799439003",
        "name": "Alice Student",
        "email": "alice@edunova.com",
        "userType": "student",
        "phone": "9000000003",
        "bio": "Class 10 Student",
        "profilePicture": "https://example.com/pic.jpg",
        "createdAt": "2026-01-15T10:30:00Z"
    }
}
```

### PUT /api/users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
    "name": "Alice Updated",
    "bio": "Class 11 Student",
    "phone": "9000000005"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "user": { /* updated user */ }
}
```

### GET /api/users/enrollments
Get all user enrollments.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "enrollments": [
        {
            "_id": "507f1f77bcf86cd799439013",
            "courseId": {
                "_id": "507f1f77bcf86cd799439012",
                "title": "NCERT Mathematics Class 10"
            },
            "progress": 75,
            "status": "in-progress",
            "enrollmentDate": "2026-01-15T10:30:00Z"
        }
    ]
}
```

### GET /api/users/certificates
Get all user certificates.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "certificates": [
        {
            "_id": "507f1f77bcf86cd799439014",
            "certificateId": "ENOVA-123456-001",
            "courseId": {
                "title": "NCERT Science Class 8"
            },
            "status": "valid",
            "issuedAt": "2026-01-20T10:30:00Z"
        }
    ]
}
```

---

## Certificates API

### POST /api/certificates
Issue certificate on course completion.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
    "courseId": "507f1f77bcf86cd799439012"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "certificate": {
        "_id": "507f1f77bcf86cd799439014",
        "certificateId": "ENOVA-1234567890-001",
        "userId": "507f1f77bcf86cd799439003",
        "courseId": "507f1f77bcf86cd799439012",
        "status": "valid",
        "issuedAt": "2026-01-20T10:30:00Z"
    }
}
```

### GET /api/certificates/:certificateId
Get certificate by ID.

**Response (200 OK):**
```json
{
    "success": true,
    "certificate": { /* certificate details */ }
}
```

### GET /api/certificates/verify/:certificateId
Verify certificate authenticity (public endpoint).

**Response (200 OK):**
```json
{
    "success": true,
    "valid": true,
    "certificate": {
        "certificateId": "ENOVA-1234567890-001",
        "userName": "Alice Student",
        "courseName": "NCERT Science Class 8",
        "issuedDate": "2026-01-20",
        "status": "valid"
    }
}
```

---

## Meetings API

### GET /api/meetings
List meetings (upcoming by default).

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, live, completed, cancelled)
- `courseId` (optional): Filter by course
- `teacherId` (optional): Filter by teacher

**Response (200 OK):**
```json
{
    "success": true,
    "meetings": [
        {
            "_id": "507f1f77bcf86cd799439020",
            "title": "Live Math Class - Chapter 1",
            "description": "Discussion of polynomial concepts",
            "teacherId": {
                "name": "John Teacher",
                "email": "teacher@edunova.com"
            },
            "courseId": {
                "title": "NCERT Mathematics Class 10"
            },
            "scheduledAt": "2026-02-01T10:00:00Z",
            "duration": 60,
            "meetingLink": "https://zoom.us/j/123456789",
            "status": "scheduled",
            "attendees": []
        }
    ]
}
```

### GET /api/meetings/upcoming
Get only upcoming meetings.

**Response (200 OK):**
```json
{
    "success": true,
    "meetings": [ /* upcoming meetings */ ]
}
```

### POST /api/meetings
Create new meeting (teachers only).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
    "title": "Live Math Class - Chapter 2",
    "description": "Discussion of equations",
    "courseId": "507f1f77bcf86cd799439012",
    "scheduledAt": "2026-02-05T10:00:00Z",
    "duration": 60,
    "meetingLink": "https://zoom.us/j/123456789"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "meeting": { /* created meeting */ }
}
```

### POST /api/meetings/:id/join
Join a meeting.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Successfully joined meeting",
    "meetingLink": "https://zoom.us/j/123456789"
}
```

---

## Admin API

All Admin endpoints require authentication with `userType: 'admin'`.

### GET /api/admin/users
Get all users with pagination.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `role` (optional): Filter by role (student, teacher, admin)
- `search` (optional): Search by name or email
- `page` (optional): Page number
- `limit` (optional): Items per page

### PUT /api/admin/users/:id/role
Change user role.

**Request:**
```json
{
    "userType": "teacher"
}
```

### DELETE /api/admin/users/:id
Delete user account.

### GET /api/admin/courses
List all courses (including drafts).

### PUT /api/admin/courses/:id/approve
Approve course for publishing.

### GET /api/admin/stats/overview
Get platform statistics.

**Response (200 OK):**
```json
{
    "success": true,
    "stats": {
        "totalUsers": 450,
        "totalStudents": 400,
        "totalTeachers": 45,
        "totalCourses": 25,
        "totalBooks": 150,
        "totalEnrollments": 1200,
        "totalCertificates": 320
    }
}
```

---

## Error Handling

All errors follow this format:

```json
{
    "success": false,
    "message": "Error description",
    "statusCode": 400
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error |

---

## Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { /* response data */ }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "statusCode": 400
}
```

---

## Authentication

All protected endpoints require JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in 7 days. Use `/api/auth/refresh-token` to refresh before expiry.

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "userType": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Get Books
```bash
curl -X GET "http://localhost:5000/api/books?board=ncert&classLevel=6" \
  -H "Content-Type: application/json"
```

### Get Profile (Requires Token)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## Version History

- **v3.6**: Added Meetings API and Admin API routes, Database seed script
- **v3.5**: Added Books, Courses, Certificates APIs with complete integration
- **v3.4**: Initial backend setup with User authentication
