// Database Seed Script
// Save as: backend/scripts/seedData.js
// Run with: node scripts/seedData.js or npm run seed

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const User = require('../models/User');
const Course = require('../models/Course');
const Book = require('../models/Book');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edunova');
        console.log('✓ MongoDB connected for seeding');
    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Create seed data
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Book.deleteMany({});
        await Enrollment.deleteMany({});
        await Certificate.deleteMany({});
        console.log('✓ Cleared existing data');

        // ==================== Create Users ====================
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@edunova.com',
            password: await bcryptjs.hash('admin123', 10),
            userType: 'admin',
            phone: '9000000001',
            bio: 'Platform Administrator'
        });

        const teacherUser = await User.create({
            name: 'John Teacher',
            email: 'teacher@edunova.com',
            password: await bcryptjs.hash('teacher123', 10),
            userType: 'teacher',
            phone: '9000000002',
            bio: 'Experienced Mathematics Teacher'
        });

        const studentUser1 = await User.create({
            name: 'Alice Student',
            email: 'alice@edunova.com',
            password: await bcryptjs.hash('student123', 10),
            userType: 'student',
            phone: '9000000003',
            bio: 'Class 10 Student'
        });

        const studentUser2 = await User.create({
            name: 'Bob Scholar',
            email: 'bob@edunova.com',
            password: await bcryptjs.hash('student456', 10),
            userType: 'student',
            phone: '9000000004',
            bio: 'Class 11 Science Student'
        });

        console.log('✓ Created 4 users (1 admin, 1 teacher, 2 students)');

        // ==================== Create NCERT Books ====================
        const books = [
            // Class 6 - Mathematics
            {
                title: 'Mathematics Class 6',
                description: 'NCERT Mathematics textbook for Class 6',
                subject: 'Mathematics',
                classLevel: 6,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6Mathematics.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-6', 'mathematics']
            },
            // Class 6 - English
            {
                title: 'English Honeysuckle Class 6',
                description: 'NCERT English textbook for Class 6',
                subject: 'English',
                classLevel: 6,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6English.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-6', 'english']
            },
            // Class 8 - Science
            {
                title: 'Science Class 8',
                description: 'NCERT Science textbook for Class 8',
                subject: 'Science',
                classLevel: 8,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8Science.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-8', 'science']
            },
            // Class 10 - Mathematics
            {
                title: 'Mathematics Class 10',
                description: 'NCERT Mathematics textbook for Class 10',
                subject: 'Mathematics',
                classLevel: 10,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10Mathematics.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-10', 'mathematics']
            },
            // Class 12 - Physics
            {
                title: 'Physics Class 12 Part 1',
                description: 'NCERT Physics textbook for Class 12 Part 1',
                subject: 'Physics',
                classLevel: 12,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Physics.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-12', 'physics', 'science']
            },
            // Class 12 - Chemistry
            {
                title: 'Chemistry Class 12 Part 1',
                description: 'NCERT Chemistry textbook for Class 12 Part 1',
                subject: 'Chemistry',
                classLevel: 12,
                board: 'ncert',
                pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Chemistry.pdf',
                authorId: teacherUser._id,
                tags: ['ncert', 'class-12', 'chemistry', 'science']
            }
        ];

        const createdBooks = await Book.insertMany(books);
        console.log(`✓ Created ${createdBooks.length} NCERT books`);

        // ==================== Create Courses ====================
        const courses = [
            {
                title: 'NCERT Mathematics Class 10',
                description: 'Complete course covering NCERT Mathematics Class 10 syllabus',
                price: 0,
                category: 'Mathematics',
                instructorId: teacherUser._id,
                level: 'intermediate',
                duration: 90,
                status: 'active',
                sections: [
                    {
                        title: 'Chapter 1: Real Numbers',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                    },
                    {
                        title: 'Chapter 2: Polynomials',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                    }
                ],
                enrollmentCount: 1
            },
            {
                title: 'NCERT Science Class 8',
                description: 'Complete course covering NCERT Science Class 8',
                price: 0,
                category: 'Science',
                instructorId: teacherUser._id,
                level: 'beginner',
                duration: 60,
                status: 'active',
                sections: [
                    {
                        title: 'Chapter 1: Crop Production and Management',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                    }
                ],
                enrollmentCount: 2
            },
            {
                title: 'Advanced Physics Class 12',
                description: 'In-depth Physics course for Class 12 students',
                price: 500,
                category: 'Physics',
                instructorId: teacherUser._id,
                level: 'advanced',
                duration: 120,
                status: 'active',
                sections: [
                    {
                        title: 'Unit 1: Electrostatics',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                    },
                    {
                        title: 'Unit 2: Current Electricity',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                    }
                ],
                enrollmentCount: 0
            }
        ];

        const createdCourses = await Course.insertMany(courses);
        console.log(`✓ Created ${createdCourses.length} courses`);

        // ==================== Create Enrollments ====================
        const enrollments = [
            {
                userId: studentUser1._id,
                courseId: createdCourses[0]._id,
                progress: 75,
                status: 'in-progress'
            },
            {
                userId: studentUser1._id,
                courseId: createdCourses[1]._id,
                progress: 100,
                status: 'completed'
            },
            {
                userId: studentUser2._id,
                courseId: createdCourses[1]._id,
                progress: 45,
                status: 'in-progress'
            }
        ];

        const createdEnrollments = await Enrollment.insertMany(enrollments);
        console.log(`✓ Created ${createdEnrollments.length} enrollments`);

        // ==================== Create Certificates ====================
        const certificates = [
            {
                certificateId: `ENOVA-${Date.now()}-001`,
                userId: studentUser1._id,
                courseId: createdCourses[1]._id,
                status: 'valid'
            }
        ];

        const createdCertificates = await Certificate.insertMany(certificates);
        console.log(`✓ Created ${createdCertificates.length} certificates`);

        // ==================== Summary ====================
        console.log('\n========== Seeding Complete ==========');
        console.log('✓ Admin login: admin@edunova.com / admin123');
        console.log('✓ Teacher login: teacher@edunova.com / teacher123');
        console.log('✓ Student 1 login: alice@edunova.com / student123');
        console.log('✓ Student 2 login: bob@edunova.com / student456');
        console.log(`\n✓ Total Users: 4`);
        console.log(`✓ Total Books: ${createdBooks.length}`);
        console.log(`✓ Total Courses: ${createdCourses.length}`);
        console.log(`✓ Total Enrollments: ${createdEnrollments.length}`);
        console.log(`✓ Total Certificates: ${createdCertificates.length}`);
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('✗ Seeding failed:', error.message);
        process.exit(1);
    }
};

// Run seeding
connectDB().then(() => seedDatabase());
