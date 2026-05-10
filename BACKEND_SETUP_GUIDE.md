# EduNova Backend Setup Guide

## Overview
This guide explains how to add a Node.js/Express backend with a database to the EduNova frontend project.

---

## 1. Backend Technology Stack (Recommended)

### Option A: Node.js + Express (Easiest)
- **Server**: Node.js + Express.js
- **Database**: MongoDB (NoSQL) or PostgreSQL (SQL)
- **Authentication**: JWT tokens
- **API Style**: RESTful or GraphQL

### Option B: Python + Flask/Django
- **Server**: Python Flask or Django
- **Database**: PostgreSQL or MySQL
- **Authentication**: JWT or Session-based

### Option C: Java/Spring Boot
- **Server**: Spring Boot
- **Database**: PostgreSQL or MySQL
- **Authentication**: JWT tokens

**Recommendation**: Node.js + Express + MongoDB (easiest for JavaScript developers)

---

## 2. Project Structure

```
WebDesign_EduNova/
├── frontend/                    (current files)
│   ├── index.html
│   ├── library.html
│   ├── css/
│   ├── js/
│   └── ...
│
└── backend/                     (to be created)
    ├── server.js               (entry point)
    ├── config/
    │   ├── db.js              (database connection)
    │   └── env.js             (environment variables)
    ├── routes/
    │   ├── auth.js            (login, register)
    │   ├── books.js           (library books)
    │   ├── courses.js         (course management)
    │   ├── users.js           (user profiles)
    │   └── certificates.js    (certificate generation)
    ├── controllers/
    │   ├── authController.js
    │   ├── booksController.js
    │   ├── coursesController.js
    │   └── ...
    ├── models/
    │   ├── User.js            (user schema)
    │   ├── Course.js          (course schema)
    │   ├── Certificate.js     (certificate schema)
    │   └── ...
    ├── middleware/
    │   ├── auth.js            (JWT verification)
    │   └── errorHandler.js
    ├── package.json
    └── .env                   (environment variables)
```

---

## 3. Step-by-Step Setup (Node.js + Express + MongoDB)

### Step 1: Initialize Node.js Backend

```bash
# Navigate to project root
cd WebDesign_EduNova

# Create backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv mongoose bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### Step 2: Create `backend/package.json`

```json
{
  "name": "edunova-backend",
  "version": "1.0.0",
  "description": "EduNova Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

### Step 3: Create `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edunova
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Create `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/certificates', require('./routes/certificates'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`EduNova Backend running on http://localhost:${PORT}`);
});
```

### Step 5: Create User Model (`backend/models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    phone: String,
    profilePicture: String,
    bio: String,
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
```

### Step 6: Create Authentication Routes (`backend/routes/auth.js`)

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        user = new User({ name, email, password, userType });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, userType: user.userType }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, userType: user.userType }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
```

### Step 7: Create Middleware for Authentication (`backend/middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
```

### Step 8: Create Books Route (`backend/routes/books.js`)

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all books (public)
router.get('/', async (req, res) => {
    try {
        // Return NCERT books data from frontend or database
        const books = await Book.find();
        res.json({ success: true, books });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get book by ID
router.get('/:bookId', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.json({ success: true, book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add book to library (admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        const { title, description, subject, classLevel, pdfUrl } = req.body;
        
        const book = new Book({ title, description, subject, classLevel, pdfUrl });
        await book.save();
        
        res.status(201).json({ success: true, book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
```

---

## 4. Connect Frontend to Backend

### Update `js/app.js` to use API

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return response.json();
}

// Login example
async function login(email, password) {
    const result = await apiCall('/auth/login', 'POST', { email, password });
    if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'student-dashboard.html';
    } else {
        alert(result.message);
    }
}

// Fetch books from backend
async function fetchBooks() {
    const result = await apiCall('/books');
    if (result.success) {
        return result.books;
    }
}
```

### Update `login.html` form

```html
<form id="loginForm">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    <button type="submit">Login</button>
</form>

<script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await login(
            document.getElementById('email').value,
            document.getElementById('password').value
        );
    });
</script>
```

---

## 5. Database Setup

### Option A: MongoDB Local Installation
```bash
# Install MongoDB Community Edition
# Then start MongoDB service
mongod

# Or use MongoDB Atlas (Cloud)
# Create account at https://www.mongodb.com/cloud/atlas
# Get connection string and update .env
```

### Option B: PostgreSQL
```sql
-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userType VARCHAR(50) DEFAULT 'student',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacherId INTEGER REFERENCES users(id),
    price DECIMAL(10, 2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id),
    courseId INTEGER REFERENCES courses(id),
    certificateId VARCHAR(50) UNIQUE,
    issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Required API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user (protected)

### Books/Library
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add new book (admin)
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (teacher)
- `POST /api/courses/:id/enroll` - Enroll in course (student)
- `GET /api/courses/:id/students` - Get course students (teacher)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `GET /api/users/:id/certificates` - Get user certificates

### Certificates
- `POST /api/certificates` - Issue certificate
- `GET /api/certificates/:id` - Get certificate details
- `GET /api/certificates/verify/:certificateId` - Verify certificate

---

## 7. Running the Project

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### Terminal 2: Frontend (Optional - for local server)
```bash
# If using Python
python -m http.server 3000

# Or use Live Server in VS Code
# Or serve through Express static files
```

---

## 8. CORS Configuration

Update `backend/server.js`:
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', 'https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 9. Environment Variables for Deployment

### Production `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edunova
JWT_SECRET=your_long_random_secret_key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## 10. Deployment Options

- **Backend**: Heroku, Railway, Render, AWS, DigitalOcean
- **Database**: MongoDB Atlas, PostgreSQL on AWS RDS, Heroku Postgres
- **Frontend**: Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront

---

## Next Steps

1. Set up Node.js and MongoDB
2. Create backend folder structure
3. Initialize npm and install dependencies
4. Create models and routes
5. Update frontend to use API endpoints
6. Test authentication and CRUD operations
7. Deploy to production

---

## Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Guide](https://jwt.io/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Mongoose Documentation](https://mongoosejs.com/)

