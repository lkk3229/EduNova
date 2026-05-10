# EduNova Backend - Security & Production Features (v3.6)

## 🔐 Security Features Implemented

This document outlines all security measures and production-ready features added to the EduNova backend.

---

## 1. Email Verification & Authentication ✅

### Signup with Email Verification
- User registers → Verification email sent
- User must click email link to verify account
- Unverified users cannot login
- Verification tokens expire after 24 hours

**Endpoint**: `POST /api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "userType": "student"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "token": "eyJhbGc...",
  "user": { /* user data */ }
}
```

### Verify Email
**Endpoint**: `POST /api/auth/verify-email`

```json
{
  "token": "verification-token-from-email"
}
```

### Resend Verification Email
**Endpoint**: `POST /api/auth/resend-verification`

```json
{
  "email": "john@example.com"
}
```

---

## 2. Password Reset System ✅

### Request Password Reset
**Endpoint**: `POST /api/auth/forgot-password`

```json
{
  "email": "john@example.com"
}
```

**Features**:
- Sends secure reset link to email
- Reset tokens expire after 1 hour
- User securely creates new password
- Auto-login after successful reset

### Reset Password
**Endpoint**: `POST /api/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass@123",
  "confirmPassword": "NewSecurePass@123"
}
```

---

## 3. Input Validation & Sanitization ✅

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Email Validation
- Valid email format required
- Automatically normalized and lowercased
- Uniqueness enforced in database

### Other Field Validations
- Name: 2-50 characters
- Phone: Valid phone format
- Bio: Maximum 500 characters
- Course title: 3-100 characters
- Meeting scheduled date must be in future
- Duration limits: 15-480 minutes for meetings

**All validated with `express-validator`**

---

## 4. Rate Limiting ✅

### General API Rate Limit
- **Limit**: 100 requests per 15 minutes per IP
- **Applied to**: All `/api/*` routes
- **Response**: 429 Too Many Requests

### Authentication Endpoint Rate Limit
- **Limit**: 5 requests per 15 minutes per IP
- **Applied to**: 
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/forgot-password`
- **Purpose**: Prevent brute force attacks
- **Response**: 429 Too Many Requests

**Configured in**: `server.js` using `express-rate-limit`

---

## 5. Security Headers with Helmet ✅

All responses include security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

**Prevents**:
- Man-in-the-middle attacks
- Clickjacking
- MIME-type sniffing
- XSS attacks

---

## 6. Password Hashing & Storage ✅

### Bcryptjs Implementation
- **Salt Rounds**: 10
- **Algorithm**: bcrypt (industry standard)
- **Never stored**: Plain text passwords
- **Token generation**: Crypto-based random tokens

```javascript
// Passwords hashed automatically on user creation/update
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(password, salt);
```

---

## 7. JWT Token Management ✅

### Token Features
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Storage**: Browser localStorage or sessionStorage
- **Transmission**: Authorization header with Bearer scheme

### Token Validation
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- Validates signature
- Checks expiration
- Retrieves user context from database
- Supports role-based access control

---

## 8. CORS Configuration ✅

### Trusted Origins
```env
CORS_ORIGIN=http://localhost:3000
```

### Headers Allowed
- Content-Type
- Authorization
- Accept
- Origin

### Credentials Support
- Cookies/credentials allowed from trusted origins

---

## 9. Request Logging ✅

### Morgan Logging
- Logs all HTTP requests
- Format: `combined` (Apache combined log format)
- Includes:
  - Method, path, status code
  - Response time
  - User agent
  - IP address

**Useful for**:
- Debugging
- Performance monitoring
- Security auditing
- Access analytics

---

## 10. Error Handling ✅

### Standardized Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Error Codes
- **400**: Bad Request (validation failed)
- **401**: Unauthorized (no/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, number, and special character"
    }
  ]
}
```

---

## 11. Email Service Integration ✅

### Supported Email Services
- **Gmail** (with app-specific password)
- **Outlook**
- **Custom SMTP servers**

### Email Templates
All emails are HTML formatted with branding:

1. **Verification Email**
   - Verification link valid 24 hours
   - Welcome message
   - Security information

2. **Password Reset Email**
   - Reset link valid 1 hour
   - Security warning
   - If suspicious, can ignore

3. **Welcome Email**
   - Post-verification
   - Feature overview
   - Call to action

4. **Course Enrollment Confirmation**
   - Course name
   - Quick start guide
   - Access instructions

### Configuration
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
FRONTEND_URL=http://localhost:3000
```

---

## 12. Environment Variable Validation ✅

### Required Variables Check
```javascript
// Add to server.js startup
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not set - exiting');
    process.exit(1);
}
```

### Production Checklist
- [ ] NODE_ENV=production
- [ ] JWT_SECRET is strong (>32 characters)
- [ ] MONGODB_URI points to production database
- [ ] EMAIL credentials configured
- [ ] CORS_ORIGIN is frontend domain
- [ ] FRONTEND_URL is correct

---

## 13. Data Protection ✅

### Password Protection
- Passwords selected with `select: false` in schema
- Never included in API responses
- `toJSON()` method removes password

### Sensitive Data
- Verification tokens hashed with SHA256
- Reset tokens hashed with SHA256
- Tokens expire automatically

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

This installs:
- `nodemailer` - Email sending
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `morgan` - Request logging
- `express-validator` - Input validation

### 2. Configure Environment
```bash
cp .env.example .env
nano .env
```

**Essential settings**:
```env
NODE_ENV=production
JWT_SECRET=generate-32-char-random-string
MONGODB_URI=your-mongodb-connection
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend.com
```

### 3. Generate Gmail App Password
For Gmail:
1. Enable 2-factor authentication
2. Go to https://myaccount.google.com/apppasswords
3. Generate password for "Mail" and "Windows Computer"
4. Copy 16-character password to EMAIL_PASS

### 4. Start Server
```bash
npm run dev    # Development
npm start      # Production
```

---

## Testing Security Features

### Test Email Verification
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass@123",
    "userType": "student"
  }'

# Check email for verification token
# Extract token and verify email:
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-verification-token"
  }'

# Now can login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass@123"
  }'
```

### Test Rate Limiting
```bash
# Make 6 rapid login attempts - 6th will be blocked
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Response on 6th request: 429 Too Many Requests
```

### Test Input Validation
```bash
# Invalid password (no special char)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Response: 400 with validation error
```

---

## Monitoring & Maintenance

### Check Logs
```bash
tail -f logs/access.log      # Request logs (Morgan)
tail -f logs/error.log       # Error logs
```

### Monitor Performance
```bash
npm install -g pm2
pm2 logs edunova-api         # Real-time logs
pm2 monitoring               # CPU/Memory usage
```

### Regular Maintenance
- [ ] Review access logs for suspicious activity
- [ ] Update npm packages monthly
- [ ] Rotate JWT_SECRET annually
- [ ] Backup database daily
- [ ] Test email functionality weekly

---

## Version History

- **v3.6**: 
  - ✅ Email verification system
  - ✅ Password reset flow
  - ✅ Input validation middleware
  - ✅ Rate limiting (general + auth)
  - ✅ Security headers (Helmet)
  - ✅ Request logging (Morgan)
  - ✅ Improved error handling
  - ✅ Environment configuration

---

## Next Steps

**Phase 2 (HIGH PRIORITY)**:
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] File upload system (AWS S3)
- [ ] Email templates in database
- [ ] Two-factor authentication (2FA)
- [ ] API key authentication for third-party integrations

**Phase 3 (MEDIUM PRIORITY)**:
- [ ] Advanced logging (Winston/Sentry)
- [ ] Database query optimization
- [ ] Caching layer (Redis)
- [ ] Performance monitoring (New Relic)
- [ ] Load testing & optimization

---

**All security features are production-ready! 🎉**
