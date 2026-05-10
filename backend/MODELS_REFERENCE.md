// EduNova Backend Models - Sample Database Schemas
// Save these in: backend/models/

// ==================== User Model ====================
const userSchema = {
    _id: ObjectId,
    name: String,
    email: String (unique),
    password: String (hashed),
    userType: 'student' | 'teacher' | 'admin',
    phone: String,
    profilePicture: String,
    bio: String,
    enrolledCourses: [ObjectId],
    taughtCourses: [ObjectId],
    certificates: [ObjectId],
    createdAt: Date,
    updatedAt: Date
};

// ==================== Course Model ====================
const courseSchema = {
    _id: ObjectId,
    title: String,
    description: String,
    teacherId: ObjectId (ref: User),
    category: String,
    level: 'beginner' | 'intermediate' | 'advanced',
    price: Number,
    currency: String,
    duration: Number (in hours),
    thumbnail: String,
    status: 'draft' | 'published' | 'archived',
    students: [ObjectId],
    modules: [
        {
            title: String,
            duration: Number,
            lessons: [
                {
                    title: String,
                    videoUrl: String,
                    duration: Number,
                    resources: [String]
                }
            ]
        }
    ],
    createdAt: Date,
    updatedAt: Date
};

// ==================== Certificate Model ====================
const certificateSchema = {
    _id: ObjectId,
    certificateId: String (unique, e.g., 'ENOVA-XXX-XXX'),
    userId: ObjectId (ref: User),
    courseId: ObjectId (ref: Course),
    issuedDate: Date,
    expiryDate: Date,
    grade: String,
    score: Number,
    certificateUrl: String,
    verificationUrl: String,
    isVerified: Boolean
};

// ==================== Book Model ====================
const bookSchema = {
    _id: ObjectId,
    title: String,
    description: String,
    author: String,
    subject: String,
    classLevel: Number,
    board: 'NCERT' | 'ICSE' | 'StateBoard',
    pdfUrl: String,
    thumbnail: String,
    chapters: [
        {
            number: Number,
            title: String,
            summary: String,
            concepts: [String]
        }
    ],
    tags: [String],
    rating: Number,
    views: Number,
    createdAt: Date
};

// ==================== Enrollment Model ====================
const enrollmentSchema = {
    _id: ObjectId,
    userId: ObjectId (ref: User),
    courseId: ObjectId (ref: Course),
    enrollmentDate: Date,
    completionPercentage: Number,
    lastAccessedAt: Date,
    certificateIssued: Boolean,
    certificateId: ObjectId (ref: Certificate),
    status: 'active' | 'completed' | 'dropped'
};

// ==================== Meeting/Live Class Model ====================
const meetingSchema = {
    _id: ObjectId,
    title: String,
    teacherId: ObjectId (ref: User),
    courseId: ObjectId (ref: Course),
    scheduledAt: Date,
    duration: Number,
    maxParticipants: Number,
    meetingLink: String,
    recordingUrl: String,
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
    attendees: [ObjectId],
    createdAt: Date
};

// ==================== Payment/Transaction Model ====================
const transactionSchema = {
    _id: ObjectId,
    userId: ObjectId (ref: User),
    courseId: ObjectId (ref: Course),
    amount: Number,
    currency: String,
    paymentMethod: 'card' | 'upi' | 'wallet' | 'bankTransfer',
    transactionId: String (unique),
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    teacherId: ObjectId (ref: User),
    teacherCommission: Number,
    platformCommission: Number,
    createdAt: Date,
    completedAt: Date
};

// ==================== Library Reading Progress ====================
const readingProgressSchema = {
    _id: ObjectId,
    userId: ObjectId (ref: User),
    bookId: ObjectId (ref: Book),
    lastChapterRead: Number,
    percentageRead: Number,
    notes: [
        {
            chapterNumber: Number,
            note: String,
            createdAt: Date
        }
    ],
    lastAccessedAt: Date,
    markedForReview: Boolean
};

// ==================== Chatbot Conversation ====================
const conversationSchema = {
    _id: ObjectId,
    userId: ObjectId (ref: User),
    topic: String,
    messages: [
        {
            role: 'user' | 'assistant',
            content: String,
            timestamp: Date,
            attachments: [String]
        }
    ],
    relatedBooks: [ObjectId],
    isLibraryScoped: Boolean,
    createdAt: Date,
    updatedAt: Date
};

// ==================== MongoDB Index Recommendations ====================
/*
User Collection:
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ userType: 1 })
db.users.createIndex({ createdAt: -1 })

Course Collection:
db.courses.createIndex({ teacherId: 1 })
db.courses.createIndex({ status: 1 })
db.courses.createIndex({ category: 1 })
db.courses.createIndex({ createdAt: -1 })

Certificate Collection:
db.certificates.createIndex({ certificateId: 1 }, { unique: true })
db.certificates.createIndex({ userId: 1 })
db.certificates.createIndex({ courseId: 1 })

Book Collection:
db.books.createIndex({ board: 1, classLevel: 1 })
db.books.createIndex({ subject: 1 })
db.books.createIndex({ tags: 1 })

Enrollment Collection:
db.enrollments.createIndex({ userId: 1, courseId: 1 }, { unique: true })
db.enrollments.createIndex({ courseId: 1 })
db.enrollments.createIndex({ status: 1 })
*/
