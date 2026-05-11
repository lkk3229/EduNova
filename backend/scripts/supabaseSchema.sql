/**
 * Supabase Schema Setup Script (Phase 8)
 * 
 * Run this SQL in your Supabase Dashboard > SQL Editor to create the required tables.
 * 
 * Tables:
 * - users: Student/teacher accounts with roles
 * - courses: Course catalog with instructors
 * - enrollments: Student course enrollments with progress
 * - certificates: Generated certificates per course
 * - books: Library catalog
 * - borrowing: Book borrowing records
 * - meetings: Live classes/meetings with attendees
 * - transactions: Payment records
 * - audit_logs: Privileged action audit trail
 * 
 * RLS (Row-Level Security): Enabled for data isolation
 * Auth: Uses Supabase JWT + custom roles (student, teacher, admin)
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  phone VARCHAR(20),
  profile_photo_url TEXT,
  bio TEXT,
  country VARCHAR(100),
  timezone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================================================
-- 2. COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  language VARCHAR(20) DEFAULT 'en',
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  cover_image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'published', 'archived')),
  enrollment_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ============================================================================
-- 3. ENROLLMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- ============================================================================
-- 4. CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verification_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);

-- ============================================================================
-- 5. BOOKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  cover_image_url TEXT,
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  language VARCHAR(20) DEFAULT 'en',
  published_year INT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

-- ============================================================================
-- 6. BORROWING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS borrowing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_borrowing_student_id ON borrowing(student_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_book_id ON borrowing(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_status ON borrowing(status);

-- ============================================================================
-- 7. MEETINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 60,
  meeting_link VARCHAR(500),
  max_participants INT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'started', 'ended', 'cancelled')),
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetings_course_id ON meetings(course_id);
CREATE INDEX IF NOT EXISTS idx_meetings_instructor_id ON meetings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);

-- ============================================================================
-- 8. MEETING_ATTENDEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(meeting_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_participant_id ON meeting_attendees(participant_id);

-- ============================================================================
-- 9. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50) NOT NULL,
  payment_provider_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_course_id ON transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================================================
-- 10. AUDIT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),
  actor_email VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  scope VARCHAR(100),
  method VARCHAR(10),
  path VARCHAR(500),
  query_string TEXT,
  request_body TEXT,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_scope ON audit_logs(scope);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: Admins can see all, users can see themselves
CREATE POLICY "users_read_policy" ON users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "users_update_own_policy" ON users FOR UPDATE
  USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Courses: Public read, instructors can update own, admins can update all
CREATE POLICY "courses_read_policy" ON courses FOR SELECT USING (true);

CREATE POLICY "courses_insert_policy" ON courses FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));

CREATE POLICY "courses_update_policy" ON courses FOR UPDATE
  USING (instructor_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Enrollments: Users see their own, admins see all
CREATE POLICY "enrollments_read_policy" ON enrollments FOR SELECT
  USING (student_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Books: Public read
CREATE POLICY "books_read_policy" ON books FOR SELECT USING (true);

-- Borrowing: Users see their own
CREATE POLICY "borrowing_read_policy" ON borrowing FOR SELECT
  USING (student_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- Audit logs: Admins only
CREATE POLICY "audit_logs_read_policy" ON audit_logs FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER borrowing_updated_at BEFORE UPDATE ON borrowing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA (Optional - Comment out or modify as needed)
-- ============================================================================

-- Example admin user (password hash: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES ('admin@edunova.local', '$2a$10$eImiTXuWVxfaHNYY0iNAiOjZz.Kcw.b1i9./2kPZaAJ/h0x5Q6Dwe', 'Admin', 'User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Example teacher user (password hash: teacher123)
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES ('teacher@edunova.local', '$2a$10$5p/tq1VNR0W4aQmL/vE7keOpPvMjDHxPH9zKQJ2a/F2h8n8m.2OQa', 'John', 'Doe', 'teacher', 'active')
ON CONFLICT (email) DO NOTHING;

-- Example student user (password hash: student123)
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES ('student@edunova.local', '$2a$10$9UkpXvJMG2nH0YcKxL4r4.zRm3eF5qK2B1m7sN8oP9lR0T4dI6.oa', 'Jane', 'Smith', 'student', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
-- All tables, indexes, RLS policies, and triggers have been created.
-- Next steps:
-- 1. Verify tables in Supabase Table Editor
-- 2. Update your .env with SUPABASE_URL and SUPABASE_SERVICE_KEY
-- 3. Run: npm start (will test connection automatically)
-- 4. Verify /api/health endpoint responds with status 200
-- 5. Begin migrating routes from MongoDB to Supabase repositories
