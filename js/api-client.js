/**
 * EduNova API Client
 * Simple helper for frontend to communicate with backend API
 * 
 * Usage:
 * <script src="js/api-client.js"></script>
 * 
 * Examples:
 * await apiClient.auth.login(email, password)
 * await apiClient.books.getAll()
 * await apiClient.courses.enroll(courseId)
 */

class EduNovaAPI {
    constructor(baseUrl = 'http://localhost:5000/api') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('edunova_token') || null;
    }

    // ==================== Core Methods ====================
    
    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error.message);
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('edunova_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('edunova_token');
    }

    // ==================== Authentication ====================
    
    auth = {
        register: async (name, email, password, userType = 'student') => {
            const result = await this.request('/auth/register', 'POST', {
                name, email, password, userType
            });
            if (result.token) {
                this.setToken(result.token);
            }
            return result;
        },

        login: async (email, password) => {
            const result = await this.request('/auth/login', 'POST', {
                email, password
            });
            if (result.token) {
                this.setToken(result.token);
            }
            return result;
        },

        logout: () => {
            this.clearToken();
            return { success: true };
        },

        getProfile: async () => {
            return await this.request('/users/profile');
        },

        verifyEmail: async (token) => {
            return await this.request('/auth/verify-email', 'POST', { token });
        },

        resendVerification: async (email) => {
            return await this.request('/auth/resend-verification', 'POST', { email });
        },

        forgotPassword: async (email) => {
            return await this.request('/auth/forgot-password', 'POST', { email });
        },

        resetPassword: async (token, password, confirmPassword) => {
            const result = await this.request('/auth/reset-password', 'POST', {
                token, password, confirmPassword
            });
            if (result.token) {
                this.setToken(result.token);
            }
            return result;
        }
    };

    // ==================== Books / Library ====================
    
    books = {
        getAll: async () => {
            return await this.request('/books');
        },

        getNcertCatalog: async (filters = {}) => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    params.append(key, value);
                }
            });

            const query = params.toString() ? `?${params.toString()}` : '';
            return await this.request(`/books/ncert/catalog${query}`);
        },

        getNcertClasses: async () => {
            return await this.request('/books/ncert/classes');
        },

        getNcertSubjects: async (classLevel = null) => {
            const query = classLevel ? `?classLevel=${encodeURIComponent(classLevel)}` : '';
            return await this.request(`/books/ncert/subjects${query}`);
        },

        getNcertLanguages: async (classLevel = null) => {
            const query = classLevel ? `?classLevel=${encodeURIComponent(classLevel)}` : '';
            return await this.request(`/books/ncert/languages${query}`);
        },

        getById: async (bookId) => {
            return await this.request(`/books/${bookId}`);
        },

        search: async (query) => {
            return await this.request(`/books?search=${encodeURIComponent(query)}`);
        },

        create: async (bookData) => {
            return await this.request('/books', 'POST', bookData);
        },

        update: async (bookId, bookData) => {
            return await this.request(`/books/${bookId}`, 'PUT', bookData);
        },

        delete: async (bookId) => {
            return await this.request(`/books/${bookId}`, 'DELETE');
        }
    };

    // ==================== Courses ====================
    
    courses = {
        getAll: async () => {
            return await this.request('/courses');
        },

        getById: async (courseId) => {
            return await this.request(`/courses/${courseId}`);
        },

        create: async (courseData) => {
            return await this.request('/courses', 'POST', courseData);
        },

        update: async (courseId, courseData) => {
            return await this.request(`/courses/${courseId}`, 'PUT', courseData);
        },

        delete: async (courseId) => {
            return await this.request(`/courses/${courseId}`, 'DELETE');
        },

        enroll: async (courseId) => {
            return await this.request(`/courses/${courseId}/enroll`, 'POST');
        },

        getEnrolled: async () => {
            return await this.request('/courses/enrolled');
        },

        getProgress: async (courseId) => {
            return await this.request(`/courses/${courseId}/progress`);
        }
    };

    // ==================== Payments ====================

    payments = {
        checkout: async (courseId) => {
            return await this.request(`/payments/checkout/${courseId}`, 'POST');
        },

        verify: async (payload) => {
            return await this.request('/payments/verify', 'POST', payload);
        },

        getMine: async () => {
            return await this.request('/payments/mine');
        }
    };

    // ==================== Uploads ====================

    uploads = {
        uploadImage: async (file) => {
            return await this.uploadFile('/uploads/image', file);
        },

        uploadVideo: async (file) => {
            return await this.uploadFile('/uploads/video', file);
        }
    };

    // ==================== Certificates ====================
    
    certificates = {
        getAll: async () => {
            return await this.request('/certificates');
        },

        getById: async (certificateId) => {
            return await this.request(`/certificates/${certificateId}`);
        },

        issue: async (userId, courseId) => {
            return await this.request('/certificates', 'POST', {
                userId, courseId
            });
        },

        verify: async (certificateId) => {
            return await this.request(`/certificates/verify/${certificateId}`);
        },

        download: async (certificateId) => {
            return `${this.baseUrl}/certificates/${certificateId}/download`;
        }
    };

    // ==================== Users ====================
    
    users = {
        getProfile: async (userId) => {
            return await this.request(`/users/${userId}`);
        },

        updateProfile: async (userId, userData) => {
            return await this.request(`/users/${userId}`, 'PUT', userData);
        },

        getEnrollments: async (userId) => {
            return await this.request(`/users/${userId}/enrollments`);
        },

        getCertificates: async (userId) => {
            return await this.request(`/users/${userId}/certificates`);
        }
    };

    // ==================== Meetings ====================
    
    meetings = {
        getUpcoming: async () => {
            return await this.request('/meetings/upcoming');
        },

        getById: async (meetingId) => {
            return await this.request(`/meetings/${meetingId}`);
        },

        create: async (meetingData) => {
            return await this.request('/meetings', 'POST', meetingData);
        },

        join: async (meetingId) => {
            return await this.request(`/meetings/${meetingId}/join`, 'POST');
        }
    };

    // ==================== Admin ====================
    
    admin = {
        getStats: async () => {
            return await this.request('/admin/stats/overview');
        },

        getUsers: async (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return await this.request(`/admin/users${params ? '?' + params : ''}`);
        },

        updateUserRole: async (userId, userType) => {
            return await this.request(`/admin/users/${userId}/role`, 'PUT', { userType });
        },

        deleteUser: async (userId) => {
            return await this.request(`/admin/users/${userId}`, 'DELETE');
        },

        approveCourse: async (courseId) => {
            return await this.request(`/admin/courses/${courseId}/approve`, 'PUT');
        },

        rejectCourse: async (courseId, reason) => {
            return await this.request(`/admin/courses/${courseId}/reject`, 'PUT', { reason });
        },

        getPendingCourses: async () => {
            return await this.request('/admin/courses/pending');
        },

        revokeCertificate: async (certificateId) => {
            return await this.request(`/admin/certificates/${certificateId}`, 'DELETE');
        }
    };

    // ==================== Utilities ====================
    
    health = {
        check: async () => {
            return await this.request('/health');
        }
    };

    async uploadFile(endpoint, file) {
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        return result;
    }
}

// Create global instance
const apiClient = new EduNovaAPI();

// Example usage (uncomment to test)
/*
// Test API connection
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await apiClient.health.check();
        console.log('✓ Backend is running:', health);
    } catch (error) {
        console.error('✗ Backend is not available:', error.message);
    }
});
*/
