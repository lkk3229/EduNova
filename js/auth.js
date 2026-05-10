/* ============================================
   EduNova — Authentication JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPasswordStrength();
    initStudentForm();
    initTeacherForm();
    initLoginForm();
    initForgotPassword();
});

/* ---- Password Strength Meter ---- */
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculateStrength(password);
        updateStrengthUI(strength);
    });
}

function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function updateStrengthUI(score) {
    const fill = document.querySelector('.strength-fill');
    const text = document.querySelector('.strength-text');
    if (!fill || !text) return;

    const levels = [
        { width: '0%', color: 'transparent', label: 'Enter a password' },
        { width: '20%', color: '#d63031', label: 'Very Weak' },
        { width: '40%', color: '#e17055', label: 'Weak' },
        { width: '60%', color: '#fdcb6e', label: 'Fair' },
        { width: '80%', color: '#00b894', label: 'Strong' },
        { width: '100%', color: '#00cec9', label: 'Very Strong' }
    ];

    const level = levels[score];
    fill.style.width = level.width;
    fill.style.background = level.color;
    text.textContent = level.label;
    text.style.color = level.color;
}

/* ---- Student Registration ---- */
function initStudentForm() {
    const form = document.getElementById('studentRegForm');
    if (!form) return;

    // Show interests only after education level is selected, with level-appropriate options
    const educationSelect = document.getElementById('education');
    const interestsGroup = document.getElementById('interestsGroup');
    const interestTags = document.getElementById('interestTags');

    const interestsByLevel = {
        'high-school': [
            { value: 'science', label: 'Science' },
            { value: 'mathematics', label: 'Mathematics' },
            { value: 'social-studies', label: 'Social Studies' },
            { value: 'english', label: 'English & Literature' },
            { value: 'hindi', label: 'Hindi' },
            { value: 'computers', label: 'Computers' },
            { value: 'arts', label: 'Arts & Craft' },
            { value: 'sports', label: 'Sports & Fitness' }
        ],
        'senior-secondary': [
            { value: 'physics', label: 'Physics' },
            { value: 'chemistry', label: 'Chemistry' },
            { value: 'biology', label: 'Biology' },
            { value: 'mathematics', label: 'Mathematics' },
            { value: 'accountancy', label: 'Accountancy' },
            { value: 'economics', label: 'Economics' },
            { value: 'business-studies', label: 'Business Studies' },
            { value: 'political-science', label: 'Political Science' },
            { value: 'computer-science', label: 'Computer Science' },
            { value: 'jee-prep', label: 'JEE Preparation' },
            { value: 'neet-prep', label: 'NEET Preparation' },
            { value: 'arts-humanities', label: 'Arts & Humanities' }
        ],
        'undergraduate': [
            { value: 'engineering', label: 'Engineering' },
            { value: 'medical', label: 'Medical & Health' },
            { value: 'commerce', label: 'Commerce & Finance' },
            { value: 'web-dev', label: 'Web Development' },
            { value: 'data-science', label: 'Data Science' },
            { value: 'ai-ml', label: 'AI & Machine Learning' },
            { value: 'design', label: 'UI/UX Design' },
            { value: 'law', label: 'Law' },
            { value: 'business', label: 'Business & Marketing' },
            { value: 'arts', label: 'Arts & Literature' },
            { value: 'languages', label: 'Foreign Languages' }
        ],
        'graduate': [
            { value: 'web-dev', label: 'Web Development' },
            { value: 'data-science', label: 'Data Science' },
            { value: 'ai-ml', label: 'AI & Machine Learning' },
            { value: 'cloud', label: 'Cloud Computing' },
            { value: 'cybersecurity', label: 'Cybersecurity' },
            { value: 'mobile-dev', label: 'Mobile Development' },
            { value: 'management', label: 'Management' },
            { value: 'research', label: 'Research Methods' },
            { value: 'design', label: 'UI/UX Design' },
            { value: 'finance', label: 'Finance & Analytics' }
        ],
        'postgraduate': [
            { value: 'ai-ml', label: 'AI & Machine Learning' },
            { value: 'data-science', label: 'Data Science' },
            { value: 'research', label: 'Research & Thesis Writing' },
            { value: 'mba', label: 'MBA & Leadership' },
            { value: 'cloud', label: 'Cloud Architecture' },
            { value: 'cybersecurity', label: 'Cybersecurity' },
            { value: 'medical-pg', label: 'Medical Specializations' },
            { value: 'law-pg', label: 'Advanced Legal Studies' },
            { value: 'publications', label: 'Journal Publications' }
        ],
        'professional': [
            { value: 'web-dev', label: 'Web Development' },
            { value: 'data-science', label: 'Data Science' },
            { value: 'ai-ml', label: 'AI & Machine Learning' },
            { value: 'cloud', label: 'Cloud Computing' },
            { value: 'cybersecurity', label: 'Cybersecurity' },
            { value: 'mobile-dev', label: 'Mobile Development' },
            { value: 'design', label: 'UI/UX Design' },
            { value: 'business', label: 'Business & Marketing' },
            { value: 'project-mgmt', label: 'Project Management' },
            { value: 'devops', label: 'DevOps & SRE' }
        ]
    };

    if (educationSelect && interestsGroup && interestTags) {
        educationSelect.addEventListener('change', () => {
            const level = educationSelect.value;
            if (!level) {
                interestsGroup.style.display = 'none';
                return;
            }
            const interests = interestsByLevel[level] || [];
            interestTags.innerHTML = interests.map(i =>
                `<label class="tag-checkbox"><input type="checkbox" value="${i.value}"> ${i.label}</label>`
            ).join('');
            interestsGroup.style.display = 'block';
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 8) {
            showNotification('Password must be at least 8 characters.', 'error');
            return;
        }

        // Collect form data
        const studentData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            education: document.getElementById('education').value,
            interests: getCheckedValues(form.querySelectorAll('.interest-tags input[type="checkbox"]:checked')),
            password: password,
            role: 'student',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        saveUser(studentData);

        showNotification('Account created successfully! Welcome to EduNova! 🎉', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

/* ---- Teacher Registration ---- */
function initTeacherForm() {
    const form = document.getElementById('teacherRegForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.getElementById('tPassword').value;
        const confirmPassword = document.getElementById('tConfirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        const teacherData = {
            firstName: document.getElementById('tFirstName').value,
            lastName: document.getElementById('tLastName').value,
            email: document.getElementById('tEmail').value,
            phone: document.getElementById('tPhone').value,
            qualification: document.getElementById('qualification').value,
            experience: document.getElementById('experience').value,
            expertise: getCheckedValues(form.querySelectorAll('.interest-tags input[type="checkbox"]:checked:not([name="teachingMode"])')),
            bio: document.getElementById('bio').value,
            teachingStyle: document.getElementById('teachingStyle').value,
            teachingMode: getCheckedValues(form.querySelectorAll('input[name="teachingMode"]:checked')),
            linkedin: document.getElementById('linkedin')?.value || '',
            portfolio: document.getElementById('portfolio')?.value || '',
            password: password,
            role: 'teacher',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        saveUser(teacherData);

        showNotification('Application submitted! Our team will review it within 24 hours. 📝', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

/* ---- Login ---- */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const requestedNext = urlParams.get('next');

    function getPostLoginTargetByRole(role) {
        const safeNext = resolveSafeNext(requestedNext);
        if (safeNext) return safeNext;

        if (role === 'admin') return 'admin.html';
        if (role === 'teacher') return 'teacher-dashboard.html';
        return 'student-dashboard.html';
    }

    function resolveSafeNext(nextValue) {
        if (!nextValue) return '';
        const normalized = String(nextValue).trim();
        if (!normalized) return '';
        if (/^https?:\/\//i.test(normalized)) return '';
        if (normalized.includes('..')) return '';
        return normalized;
    }

    function setEnglishLoginTicket(session) {
        const target = resolveSafeNext(requestedNext);
        if (target !== 'english-speaking.html') return;

        const userId = String(session.email || session.name || '').toLowerCase();
        if (!userId) return;

        sessionStorage.setItem('edunova_english_login_ticket', JSON.stringify({
            userId,
            issuedAt: new Date().toISOString()
        }));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const role = form.querySelector('input[name="role"]:checked').value;

        // Demo credentials
        const demoUsers = {
            'admin@edunova.com': { password: 'admin123', role: 'admin', name: 'Super Admin' },
            'teacher@edunova.com': { password: 'teacher123', role: 'teacher', name: 'Dr. Emily Johnson' },
            'student@edunova.com': { password: 'student123', role: 'student', name: 'Rahul Kumar' }
        };

        const demoUser = demoUsers[email];

        if (demoUser && demoUser.password === password) {
            // Enforce role match — student can only login as student, etc.
            if (demoUser.role !== role) {
                showNotification(`This account is registered as a ${demoUser.role}. Please select the correct role.`, 'error');
                return;
            }

            // Set session
            const session = {
                email: email,
                name: demoUser.name,
                role: demoUser.role,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('edunova_session', JSON.stringify(session));
            setEnglishLoginTicket(session);

            showNotification(`Welcome back, ${demoUser.name}! 👋`, 'success');

            setTimeout(() => {
                window.location.href = getPostLoginTargetByRole(demoUser.role);
            }, 1500);
            return;
        }

        // Check localStorage users
        const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
        const user = users.find(u => u.email === email);

        if (user) {
            // Verify password
            if (user.password && user.password !== password) {
                showNotification('Invalid credentials. Please try again.', 'error');
                return;
            }

            // Enforce role match — student can only login as student, etc.
            if (user.role !== role) {
                showNotification(`This account is registered as a ${user.role}. Please select the correct role.`, 'error');
                return;
            }

            // Check if user is suspended
            if (user.status === 'suspended') {
                showNotification('Your account has been suspended. Contact admin.', 'error');
                return;
            }

            // Check if teacher is approved
            if (user.role === 'teacher' && user.status === 'pending') {
                showNotification('Your teacher application is still under review.', 'warning');
                return;
            }
            if (user.role === 'teacher' && user.status === 'rejected') {
                showNotification('Your teacher application was rejected. Contact admin.', 'error');
                return;
            }

            const session = {
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('edunova_session', JSON.stringify(session));
            setEnglishLoginTicket(session);

            showNotification(`Welcome back, ${session.name}! 👋`, 'success');

            setTimeout(() => {
                window.location.href = getPostLoginTargetByRole(user.role);
            }, 1500);
        } else {
            showNotification('Invalid credentials. Please try again.', 'error');
        }
    });
}

/* ---- Helpers ---- */
function getCheckedValues(checkboxes) {
    return Array.from(checkboxes).map(cb => cb.value);
}

function saveUser(userData) {
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    // Check if email already exists
    const exists = users.find(u => u.email === userData.email);
    if (exists) {
        showNotification('An account with this email already exists.', 'warning');
        return false;
    }
    users.push(userData);
    localStorage.setItem('edunova_users', JSON.stringify(users));
    return true;
}

/* ---- Forgot Password ---- */
function initForgotPassword() {
    const link = document.getElementById('forgotPasswordLink');
    const modal = document.getElementById('forgotPasswordModal');
    const closeBtn = document.getElementById('closeForgotModal');
    const emailForm = document.getElementById('forgotEmailForm');
    const resetForm = document.getElementById('resetPasswordForm');
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');

    if (!link || !modal) return;

    let targetUserEmail = null;

    // Open modal
    link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        step1.style.display = 'block';
        step2.style.display = 'none';
        const forgotEmailInput = document.getElementById('forgotEmail');
        if (forgotEmailInput) forgotEmailInput.value = '';
        targetUserEmail = null;
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Step 1: Find account by email
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim().toLowerCase();

        // Check demo users — cannot reset demo passwords
        const demoEmails = ['admin@edunova.com', 'teacher@edunova.com', 'student@edunova.com'];
        if (demoEmails.includes(email)) {
            showNotification('Demo account passwords cannot be reset. Use the demo credentials shown on the login page.', 'warning');
            return;
        }

        // Check registered users
        const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email);

        if (!user) {
            showNotification('No account found with this email address.', 'error');
            return;
        }

        targetUserEmail = user.email;
        const nameLabel = document.getElementById('forgotUserName');
        if (nameLabel) nameLabel.textContent = `Resetting password for ${user.firstName} ${user.lastName} (${user.role})`;

        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    // Step 2: Set new password
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        if (newPass.length < 8) {
            showNotification('Password must be at least 8 characters.', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        // Update password in localStorage
        const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
        const userIndex = users.findIndex(u => u.email === targetUserEmail);
        if (userIndex === -1) {
            showNotification('User not found. Please try again.', 'error');
            return;
        }

        users[userIndex].password = newPass;
        localStorage.setItem('edunova_users', JSON.stringify(users));

        showNotification('Password reset successfully! You can now log in with your new password.', 'success');
        modal.style.display = 'none';
    });
}
