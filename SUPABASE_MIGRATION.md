# Supabase PostgreSQL Migration Guide

**Date**: May 11, 2026  
**Project**: EduNova  
**Version**: Phase 8 - Supabase Integration

---

## Overview

This document guides the migration from MongoDB (Mongoose) to Supabase (PostgreSQL) as the primary database backend for EduNova. The integration maintains backward compatibility with MongoDB as an optional fallback.

---

## Architecture Changes

### Before (MongoDB)
```
Frontend (HTML/JS) → Backend (Express/Node.js) → MongoDB (Mongoose models)
```

### After (Supabase)
```
Frontend (HTML/JS) → Backend (Express/Node.js) → Supabase Client → PostgreSQL (via supabase-js)
```

### Benefits
- **Compliance**: PostgreSQL with built-in audit trails
- **Scalability**: Supabase serverless infrastructure
- **Real-time**: Supabase Realtime subscriptions for live updates
- **Auth**: Integrated JWT-based authentication
- **Storage**: Supabase Storage for file uploads (replaces Multer)
- **Security**: Row-level security (RLS) policies

---

## Database Schema (PostgreSQL)

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  phone VARCHAR(20),
  age INT,
  gender VARCHAR(10),
  country VARCHAR(100),
  bio TEXT,
  profile_picture_url TEXT,
  teaching_experience INT,
  qualifications TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### 2. Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  level VARCHAR(50) DEFAULT 'beginner',
  duration INT, -- in hours
  language VARCHAR(50) DEFAULT 'en',
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'published', 'archived')),
  enrollment_count INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
```

### 3. Enrollments Table
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  progress_percentage INT DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  certificate_earned BOOLEAN DEFAULT FALSE,
  certificate_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

### 4. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'refund')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50), -- 'razorpay', 'manual', etc.
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_course_id ON transactions(course_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_razorpay_id ON transactions(razorpay_payment_id);
```

### 5. Certificates Table
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(255) UNIQUE NOT NULL,
  issued_date TIMESTAMP DEFAULT NOW(),
  validity_months INT,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
```

### 6. Books Table (Library)
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  isbn VARCHAR(20),
  category VARCHAR(100),
  language VARCHAR(50) DEFAULT 'en',
  pdf_url TEXT,
  cover_image_url TEXT,
  publication_year INT,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_isbn ON books(isbn);
```

### 7. Meetings Table (Live Classes)
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  meeting_url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  max_participants INT,
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_meetings_course_id ON meetings(course_id);
CREATE INDEX idx_meetings_teacher_id ON meetings(teacher_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_status ON meetings(status);
```

### 8. Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  scope VARCHAR(100),
  method VARCHAR(10),
  path TEXT,
  status_code INT,
  duration_ms INT,
  query_params JSONB,
  body JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## Migration Steps

### Step 1: Create Tables in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Copy and paste each table creation SQL above
4. Execute each query to create the tables

**Or use Supabase CLI:**
```bash
supabase db push  # Push local migrations to your Supabase project
```

### Step 2: Set Up Row-Level Security (RLS)

Enable RLS on sensitive tables to enforce user-level data access:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile (or admins see all)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin'
  );

-- Similar policies for enrollments, transactions, certificates...
```

### Step 3: Update Backend Routes

Replace Mongoose models with Supabase Repository layer:

**Before (Mongoose):**
```javascript
const user = await User.findById(userId);
```

**After (Supabase):**
```javascript
const { UserRepository } = require('../lib/supabaseRepository');
const user = await UserRepository.findById(userId);
```

### Step 4: Test Endpoints

Update backend routes to use Supabase:
1. `GET /api/courses` - List published courses
2. `GET /api/courses/:id` - Get course details
3. `POST /api/enrollments` - Enroll in course
4. `GET /api/users/profile` - Get logged-in user profile

---

## Environment Configuration

### Development (.env)
```bash
SUPABASE_URL=https://niguemzjxpzzcouhhvep.supabase.co
SUPABASE_ANON_KEY=eyJ...  # From Settings → API
SUPABASE_SERVICE_KEY=eyJ...  # From Settings → API
```

### Production (.env.production)
Same format, but use production Supabase project credentials.

---

## Backward Compatibility

The backend maintains optional MongoDB support:
- If `SUPABASE_URL` is not set, it will attempt MongoDB connection
- Can run both databases in parallel during migration
- Gradually migrate routes one by one

---

## Next Steps

1. ✅ **Environment Configuration**: Updated .env.example and .env.production.example
2. ✅ **Client Library**: Installed @supabase/supabase-js
3. ✅ **Supabase Config**: Created backend/config/supabase.js
4. ✅ **Repository Layer**: Created backend/lib/supabaseRepository.js
5. ⏳ **Database Schema**: Create tables in Supabase dashboard
6. ⏳ **Route Migration**: Update routes to use Supabase Repository
7. ⏳ **Testing**: Test all endpoints with Supabase
8. ⏳ **Data Migration**: Migrate existing MongoDB data to PostgreSQL
9. ⏳ **Storage**: Set up Supabase Storage for file uploads
10. ⏳ **Realtime**: Enable Supabase Realtime for live features

---

## Troubleshooting

### Connection Error: "Supabase not initialized"
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env
- Verify API keys from Supabase dashboard

### No Rows Found (PGRST116)
- This is expected when a record doesn't exist
- Repository layer handles this gracefully (returns null)

### CORS Errors
- Add your frontend domain to Supabase **Settings → API → CORS**

---

## Support

For Supabase documentation, visit: https://supabase.com/docs  
For backend integration questions, refer to backend/lib/supabaseRepository.js
