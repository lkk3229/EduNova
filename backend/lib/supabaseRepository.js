// Supabase Repository Layer
// Provides database access methods for all models
// Save as: backend/lib/supabaseRepository.js

const { supabase } = require('../config/supabase');

// ==================== USER OPERATIONS ====================

const UserRepository = {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        return data || null;
    },

    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * Create new user
     * @param {Object} userData - User data { email, password_hash, role, name, ... }
     * @returns {Promise<Object>}
     */
    async create(userData) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>}
     */
    async update(id, updates) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * List users (with pagination)
     * @param {number} page - Page number (1-indexed)
     * @param {number} limit - Items per page
     * @returns {Promise<Array>}
     */
    async list(page = 1, limit = 10) {
        if (!supabase) throw new Error('Supabase not initialized');
        const offset = (page - 1) * limit;
        const { data, error } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    }
};

// ==================== COURSE OPERATIONS ====================

const CourseRepository = {
    /**
     * Find course by ID
     * @param {string} id - Course ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * List all courses (published)
     * @param {number} page - Page number (1-indexed)
     * @param {number} limit - Items per page
     * @returns {Promise<Array>}
     */
    async listPublished(page = 1, limit = 10) {
        if (!supabase) throw new Error('Supabase not initialized');
        const offset = (page - 1) * limit;
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('status', 'published')
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    },

    /**
     * Create new course
     * @param {Object} courseData - Course data
     * @returns {Promise<Object>}
     */
    async create(courseData) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update course
     * @param {string} id - Course ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>}
     */
    async update(id, updates) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ==================== ENROLLMENT OPERATIONS ====================

const EnrollmentRepository = {
    /**
     * Find enrollment by ID
     * @param {string} id - Enrollment ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * Find enrollment for user in course
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @returns {Promise<Object|null>}
     */
    async findByUserAndCourse(userId, courseId) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * List user enrollments
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async listByUser(userId) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    /**
     * Create enrollment
     * @param {Object} enrollmentData - Enrollment data
     * @returns {Promise<Object>}
     */
    async create(enrollmentData) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('enrollments')
            .insert([enrollmentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ==================== TRANSACTION OPERATIONS ====================

const TransactionRepository = {
    /**
     * Find transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * Create transaction
     * @param {Object} txData - Transaction data
     * @returns {Promise<Object>}
     */
    async create(txData) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('transactions')
            .insert([txData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update transaction
     * @param {string} id - Transaction ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>}
     */
    async update(id, updates) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ==================== CERTIFICATE OPERATIONS ====================

const CertificateRepository = {
    /**
     * Find certificate by ID
     * @param {string} id - Certificate ID
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    /**
     * List user certificates
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async listByUser(userId) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    /**
     * Create certificate
     * @param {Object} certData - Certificate data
     * @returns {Promise<Object>}
     */
    async create(certData) {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase
            .from('certificates')
            .insert([certData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// Export repositories
module.exports = {
    UserRepository,
    CourseRepository,
    EnrollmentRepository,
    TransactionRepository,
    CertificateRepository
};
