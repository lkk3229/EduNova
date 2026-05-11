#!/usr/bin/env node
/**
 * Supabase Database Schema Setup Script
 * Creates all required tables in Supabase PostgreSQL database
 * 
 * Usage: node backend/scripts/setupSupabaseSchema.js
 * 
 * Prerequisites:
 * - SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env
 * - Supabase client library installed: npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
});

const SQL_SCHEMAS = [
    // Users table
    `
    CREATE TABLE IF NOT EXISTS users (
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
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `,

    // Courses table
    `
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'INR',
      level VARCHAR(50) DEFAULT 'beginner',
      duration INT,
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
    CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
    CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
    `,

    // Enrollments table
    `
    CREATE TABLE IF NOT EXISTS enrollments (
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
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    `,

    // Transactions table
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'refund')),
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method VARCHAR(50),
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255),
      razorpay_signature VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_course_id ON transactions(course_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_id ON transactions(razorpay_payment_id);
    `,

    // Certificates table
    `
    CREATE TABLE IF NOT EXISTS certificates (
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
    CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);
    `,

    // Books table
    `
    CREATE TABLE IF NOT EXISTS books (
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
    CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
    CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    `,

    // Meetings table
    `
    CREATE TABLE IF NOT EXISTS meetings (
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
    CREATE INDEX IF NOT EXISTS idx_meetings_course_id ON meetings(course_id);
    CREATE INDEX IF NOT EXISTS idx_meetings_teacher_id ON meetings(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
    CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
    `,

    // Audit logs table
    `
    CREATE TABLE IF NOT EXISTS audit_logs (
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
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
    `
];

async function setupSchema() {
    console.log('🚀 Setting up Supabase database schema...\n');

    try {
        // Execute each schema creation
        for (let i = 0; i < SQL_SCHEMAS.length; i++) {
            const schema = SQL_SCHEMAS[i];
            const { error } = await supabase.rpc('exec_sql', { sql: schema });

            if (error) {
                console.log(`⚠️  Schema ${i + 1}: ${error.message}`);
            } else {
                console.log(`✅ Schema ${i + 1} created successfully`);
            }
        }

        console.log('\n✅ Database schema setup complete!');
        console.log('📚 Tables created:');
        console.log('   - users');
        console.log('   - courses');
        console.log('   - enrollments');
        console.log('   - transactions');
        console.log('   - certificates');
        console.log('   - books');
        console.log('   - meetings');
        console.log('   - audit_logs');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n💡 Note: Supabase RPC "exec_sql" may not be available.');
        console.log('   Use Supabase SQL Editor to create tables manually:');
        console.log('   1. Open Supabase Dashboard');
        console.log('   2. Go to SQL Editor');
        console.log('   3. Copy SQL from SUPABASE_MIGRATION.md');
        process.exit(1);
    }
}

setupSchema();
