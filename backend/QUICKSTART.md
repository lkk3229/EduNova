# EduNova Backend - Quick Start Guide (v3.7)

## Installation & Setup

### Prerequisites
- Node.js 14+ installed
- npm 6+ installed
- MongoDB instance (local or MongoDB Atlas)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Installed Packages:**
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- nodemailer (email sending)
- express-rate-limit (rate limiting)
- helmet (security headers)
- morgan (request logging)
- express-validator (input validation)

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

**Minimum Configuration:**

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/edunova

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 3: Setup MongoDB

#### Option A: Local MongoDB

```bash
# Install MongoDB Community Edition
# macOS:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongosh

# Create database (optional - auto-created on first insert)
> use edunova
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Create database user
5. Add IP whitelist (0.0.0.0 for development)
6. Copy connection string
7. Update `.env` with MONGODB_URI

### Step 4: Setup Email Service (Gmail)

1. Enable 2-factor authentication on Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy 16-character password
5. Update `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=aaaa bbbb cccc dddd
   ```

### Step 5: Generate JWT Secret

```bash
# Generate 32-character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output and update `.env` JWT_SECRET

### Step 6: Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**Expected Output:**
```
🚀 EduNova Backend running on http://localhost:5000
📚 API Base: http://localhost:5000/api
🏥 Health Check: http://localhost:5000/api/health
🔐 Security: Helmet, Rate Limiting, CORS enabled
```

---

## Testing the Backend

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass@123",
    "userType": "student"
  }'
```

**Check your email for verification link!**

### 3. Verify Email

Extract token from email and verify:

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-from-email"
  }'
```

### 4. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass@123"
  }'
```

**Save the returned token for authenticated requests**

### 5. Get User Profile (Requires Token)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Optional: Seed Database

Populate with sample data:

```bash
npm run seed
```

**Creates:**
- 4 test users (admin, teacher, 2 students)
- 6 NCERT books
- 3 sample courses

**Test Credentials:**
```
Admin:   admin@edunova.com / admin123
Teacher: teacher@edunova.com / teacher123
Student: alice@edunova.com / student123
```

---

## Security Features Enabled ✅

✅ Email verification (24hr token)
✅ Password reset (1hr token)
✅ Input validation & sanitization
✅ Rate limiting (auth endpoints protected)
✅ Security headers (Helmet)
✅ Request logging (Morgan)
✅ Password hashing (bcryptjs)
✅ JWT authentication
✅ CORS protection

See [SECURITY_FEATURES.md](./SECURITY_FEATURES.md) for details.

---

## Troubleshooting

**MongoDB Connection Error?**
```bash
# Start MongoDB
mongod
# or
brew services start mongodb-community
```

**Email Not Sending?**
- Use Gmail app password (not account password)
- Verify EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS in .env

**Port 5000 Already in Use?**
```bash
# Change PORT in .env
# or kill the process:
lsof -i :5000
kill -9 <PID>
```

**Rate Limit Error?**
- Too many login attempts - wait 15 minutes
- Check rate limiting in server.js

---

## Next Steps

1. Connect frontend to backend
2. Setup payment gateway (Razorpay)
3. Configure file uploads (AWS S3)
4. Deploy to production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

---

**Ready to go live?** Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 🚀
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth functions
async function login(email, password) {
    const result = await apiCall('/auth/login', 'POST', { email, password });
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
}

async function register(name, email, password, userType = 'student') {
    const result = await apiCall('/auth/register', 'POST', { 
        name, email, password, userType 
    });
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Book functions
async function fetchBooks() {
    return await apiCall('/books');
}

async function fetchBook(bookId) {
    return await apiCall(`/books/${bookId}`);
}

// Course functions
async function fetchCourses() {
    return await apiCall('/courses');
}

async function enrollCourse(courseId) {
    return await apiCall(`/courses/${courseId}/enroll`, 'POST');
}

// Certificate functions
async function issueCertificate(userId, courseId) {
    return await apiCall('/certificates', 'POST', { userId, courseId });
}

async function verifyCertificate(certificateId) {
    return await apiCall(`/certificates/verify/${certificateId}`);
}
```

### Update: `login.html` Login Handler

```html
<form id="loginForm">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    <button type="submit">Login</button>
</form>

<script src="js/api-client.js"></script>
<script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await login(
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            window.location.href = 'student-dashboard.html';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
</script>
```

---

## File Structure

```
WebDesign_EduNova/
├── index.html
├── library.html
├── login.html
├── js/
│   ├── app.js
│   ├── api-client.js          ← NEW
│   └── ...
├── backend/                    ← NEW
│   ├── server.js             (created)
│   ├── package.json          (created)
│   ├── .env                  (create from .env.example)
│   ├── .env.example          (created)
│   ├── models/               (create later)
│   ├── routes/               (create later)
│   └── middleware/           (create later)
└── BACKEND_SETUP_GUIDE.md    ← Detailed guide
```

---

## Troubleshooting

### ❌ "MongoDB connection error"
- Make sure MongoDB is running (`mongod`)
- Check `MONGODB_URI` in `.env`
- For Atlas, verify connection string and IP whitelist

### ❌ "Port 5000 already in use"
```bash
# Use different port
PORT=5001 npm run dev

# Or kill existing process
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### ❌ "CORS error in browser"
- Check `CORS_ORIGIN` in `.env`
- Make sure frontend is on the whitelisted origin
- Check browser console for exact error

### ❌ "Missing dependencies"
```bash
npm install
```

---

## Development Commands

```bash
# Start in dev mode (auto-reload on changes)
npm run dev

# Start in production mode
npm start

# Install new dependency
npm install package-name

# Remove dependency
npm uninstall package-name
```

---

## Common API Endpoints Reference

```
Authentication:
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get current user (needs token)

Books/Library:
GET    /api/books              - Get all books
GET    /api/books/:bookId      - Get book by ID
POST   /api/books              - Add new book (admin)
PUT    /api/books/:bookId      - Update book (admin)
DELETE /api/books/:bookId      - Delete book (admin)

Courses:
GET    /api/courses            - Get all courses
POST   /api/courses            - Create course
GET    /api/courses/:id        - Get course details
POST   /api/courses/:id/enroll - Enroll in course

Certificates:
POST   /api/certificates       - Issue certificate
GET    /api/certificates/:id   - Get certificate
GET    /api/certificates/verify/:certId - Verify certificate
```

---

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Tested API endpoints
3. ⬜ Connect frontend to API (create `api-client.js`)
4. ⬜ Setup database models (User, Course, Certificate)
5. ⬜ Implement protected routes
6. ⬜ Add file upload for certificates
7. ⬜ Deploy to production

---

## Support

- Check [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) for detailed setup
- MongoDB Docs: https://docs.mongodb.com/
- Express.js Docs: https://expressjs.com/
- JWT Guide: https://jwt.io/

