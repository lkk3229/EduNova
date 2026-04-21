/* ============================================
   EduNova — Dashboard JavaScript
   ============================================ */

const TEACHER_SHARE = 0.60;
const PLATFORM_SHARE = 0.40;

document.addEventListener('DOMContentLoaded', () => {
    // --- Super Admin Access Control ---
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn || session.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    initSidebar();
    initTabs();
    populateOverviewStats();
    populateUsersTable();
    populateTeachersTable();
    populateCoursesAdmin();
    populateRevenueByTeacher();
    populateRevenueOverviewCards();
    populateCourseApprovals();
    populateAdminEnrollments();
    populateAdminMeetings();
    populateAdminContent();
    populateReportsSummary();
});

/* ---- Overview / Sidebar live counts ---- */
function populateOverviewStats() {
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const schedules = JSON.parse(localStorage.getItem('edunova_schedules') || '[]');
    const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');

    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const totalRev = enrollments.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('overviewStudents', students.toLocaleString());
    set('overviewTeachers', teachers.toLocaleString());
    set('overviewCourses', courses.length.toLocaleString());
    set('overviewRevenue', (window.EduCurrency ? EduCurrency.format(totalRev) : '$' + totalRev.toFixed(2)));
    set('overviewSchedules', schedules.length.toLocaleString());
    set('overviewCerts', certs.length.toLocaleString());

    set('sidebarUserCount', users.length);
    set('sidebarCourseCount', courses.length);
    set('sidebarTeacherCount', teachers);
    set('sidebarEnrollCount', enrollments.length);

    const footer = document.getElementById('usersTableFooter');
    if (footer) footer.textContent = `Showing ${users.length} user${users.length === 1 ? '' : 's'}`;
}

function populateRevenueOverviewCards() {
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const total = enrollments.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const fmt = v => window.EduCurrency ? EduCurrency.format(v) : '$' + v.toFixed(2);
    set('revTotalRevenue', fmt(total));
    set('revPlatformShare', fmt(total * PLATFORM_SHARE));
    set('revTeacherShare', fmt(total * TEACHER_SHARE));
    set('revPending', fmt(0));
}

/* ---- Sidebar Toggle ---- */
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const close = document.getElementById('sidebarClose');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    if (close && sidebar) {
        close.addEventListener('click', () => sidebar.classList.remove('open'));
    }
}

/* ---- Tab Navigation ---- */
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');

            // Update active nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Update active tab
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

/* ---- Populate Users Table ---- */
function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    // Sample seed users removed — only registered users from localStorage will appear
    const users = [];

    // Add any localStorage users
    const localUsers = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    localUsers.forEach(u => {
        users.push({
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: u.role,
            joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            courses: 0,
            status: u.status || 'active',
            initials: `${u.firstName[0]}${u.lastName[0]}`.toUpperCase(),
            color: 'bg-gradient'
        });
    });

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">No registered users yet. Sign up a student or teacher to see them here.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const isLocalUser = localUsers.some(u => u.email === user.email);
        const isPending = user.status === 'pending' && user.role === 'teacher';

        let actionBtns = '';
        if (isLocalUser) {
            actionBtns = `
                <button class="action-btn" title="${user.status === 'suspended' ? 'Reactivate' : 'Suspend'}" onclick="adminToggleUserStatus('${user.email}')"><i class="fas fa-${user.status === 'suspended' ? 'redo' : 'ban'}"></i></button>
                <button class="action-btn action-btn-danger" title="Delete" onclick="adminDeleteUser('${user.email}')"><i class="fas fa-trash"></i></button>
            `;
            if (isPending) {
                actionBtns = `
                    <button class="action-btn" title="Approve" onclick="adminApproveTeacher('${user.email}')" style="color:#00b894;"><i class="fas fa-check"></i></button>
                    <button class="action-btn" title="Reject" onclick="adminRejectTeacher('${user.email}')" style="color:#d63031;"><i class="fas fa-times"></i></button>
                ` + actionBtns;
            }
        } else {
            actionBtns = '<span style="color:var(--text-muted); font-size:12px;">Demo user</span>';
        }

        return `
        <tr>
            <td><input type="checkbox" title="Select user"></td>
            <td>
                <div class="table-user">
                    <div class="avatar avatar-sm ${user.color}">${user.initials}</div>
                    <div><strong>${escapeHtml(user.name)}</strong><br><small>${escapeHtml(user.email)}</small></div>
                </div>
            </td>
            <td><span class="status-badge" style="background: rgba(102,126,234,0.15); color: #667eea;">${capitalize(user.role)}</span></td>
            <td>${user.joined}</td>
            <td>${user.courses}</td>
            <td><span class="status-badge status-${user.status}">${capitalize(user.status)}</span></td>
            <td>${actionBtns}</td>
        </tr>
        `;
    }).join('');
}

/* ---- Populate Teachers Table ---- */
function populateTeachersTable() {
    const tbody = document.getElementById('teachersTableBody');
    if (!tbody) return;

    // Sample demo teachers removed — only registered teachers from localStorage will appear
    const demoTeachers = [];

    // Add registered teachers from localStorage
    const localUsers = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const localTeachers = localUsers.filter(u => u.role === 'teacher').map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        expertise: (u.expertise || []).join(', ') || 'Not specified',
        courses: 0,
        students: 0,
        rating: '-',
        revenue: EduCurrency.format(0),
        initials: `${u.firstName[0]}${u.lastName[0]}`.toUpperCase(),
        color: 'bg-gradient',
        isDemo: false,
        status: u.status
    }));

    const allTeachers = [...demoTeachers, ...localTeachers];

    if (allTeachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">No teachers registered yet.</td></tr>';
        return;
    }

    tbody.innerHTML = allTeachers.map(t => {
        let actionBtns = '';
        if (t.isDemo) {
            actionBtns = '<span style="color:var(--text-muted); font-size:12px;">Demo teacher</span>';
        } else {
            const isPending = t.status === 'pending';
            const isSuspended = t.status === 'suspended';
            actionBtns = `
                ${isPending ? `<button class="action-btn" title="Approve" onclick="adminApproveTeacher('${t.email}')" style="color:#00b894;"><i class="fas fa-check-circle"></i></button>
                <button class="action-btn" title="Reject" onclick="adminRejectTeacher('${t.email}')" style="color:#d63031;"><i class="fas fa-times-circle"></i></button>` : ''}
                <button class="action-btn" title="${isSuspended ? 'Reactivate' : 'Suspend'}" onclick="adminToggleUserStatus('${t.email}')"><i class="fas fa-${isSuspended ? 'redo' : 'ban'}"></i></button>
                <button class="action-btn action-btn-danger" title="Delete" onclick="adminDeleteUser('${t.email}')"><i class="fas fa-trash"></i></button>
            `;
        }

        const statusClass = t.status === 'pending' ? 'status-pending' : t.status === 'suspended' ? 'status-inactive' : t.status === 'rejected' ? 'status-rejected' : 'status-active';

        return `
        <tr>
            <td>
                <div class="table-user">
                    <div class="avatar avatar-sm ${t.color}">${t.initials}</div>
                    <div><strong>${escapeHtml(t.name)}</strong><br><small>${escapeHtml(t.email)}</small></div>
                </div>
            </td>
            <td>${escapeHtml(t.expertise)}</td>
            <td>${t.courses}</td>
            <td>${typeof t.students === 'number' ? t.students.toLocaleString() : t.students}</td>
            <td>${t.rating !== '-' ? `<span class="stars" style="color: #ffd700;">★</span> ${t.rating}` : '-'}</td>
            <td><strong style="color: #00b894;">${t.revenue}</strong></td>
            <td>${actionBtns}</td>
        </tr>
        `;
    }).join('');
}

/* ---- Populate Courses Admin ---- */
function populateCoursesAdmin() {
    const grid = document.getElementById('coursesAdminGrid');
    if (!grid) return;

    // Sample admin courses removed — load only real teacher uploads from localStorage
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]')
        .filter(c => c.status === 'approved')
        .map(c => ({
            title: c.title,
            teacher: c.teacher || 'Unknown',
            students: c.students || 0,
            rating: c.rating || 0,
            price: EduCurrency.format(c.approvedPrice || c.price || 0),
            status: 'active',
            gradient: c.gradient || 'linear-gradient(135deg, #667eea, #764ba2)',
            category: c.category || 'General'
        }));

    if (courses.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-muted);"><i class="fas fa-book-open" style="font-size:48px; margin-bottom:16px;"></i><h3>No courses yet</h3><p>Approved teacher uploads will appear here.</p></div>';
        return;
    }

    grid.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-image" style="background: ${course.gradient};">
                <div class="course-badge">${course.status === 'active' ? 'Active' : 'Draft'}</div>
                <div class="course-category">${escapeHtml(course.category)}</div>
            </div>
            <div class="course-content">
                <div class="course-rating">
                    <div class="stars"><i class="fas fa-star"></i></div>
                    <span>${course.rating} (${course.students.toLocaleString()} students)</span>
                </div>
                <h3>${escapeHtml(course.title)}</h3>
                <div class="course-footer" style="margin-top: 12px;">
                    <span style="font-size: 14px; color: var(--text-secondary);">By ${escapeHtml(course.teacher)}</span>
                    <div class="course-price">${course.price}</div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn btn-sm btn-outline" style="flex: 1;"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-primary" style="flex: 1;"><i class="fas fa-eye"></i> View</button>
                </div>
            </div>
        </div>
    `).join('');
}

/* ---- Admin Actions ---- */
function approveTeacher(btn) {
    const row = btn.closest('tr');
    const name = row.querySelector('strong').textContent;
    row.style.opacity = '0.5';
    row.style.pointerEvents = 'none';
    showNotification(`${name} has been approved as a teacher! ✅`, 'success');
    setTimeout(() => row.remove(), 1000);
}

function rejectTeacher(btn) {
    const row = btn.closest('tr');
    const name = row.querySelector('strong').textContent;
    row.style.opacity = '0.5';
    row.style.pointerEvents = 'none';
    showNotification(`${name}'s application has been rejected.`, 'warning');
    setTimeout(() => row.remove(), 1000);
}

/* ---- Revenue By Teacher ---- */
function populateRevenueByTeacher() {
    const tbody = document.getElementById('revenueByTeacherBody');
    if (!tbody) return;

    // Build entirely from registered teachers + real enrollments
    const localUsers = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');

    const revenueByEmail = {};
    const studentsByEmail = {};
    enrollments.forEach(e => {
        revenueByEmail[e.teacherEmail] = (revenueByEmail[e.teacherEmail] || 0) + parseFloat(e.amount || 0);
        if (!studentsByEmail[e.teacherEmail]) studentsByEmail[e.teacherEmail] = new Set();
        studentsByEmail[e.teacherEmail].add(e.studentEmail);
    });

    const teachers = localUsers
        .filter(u => u.role === 'teacher')
        .map(u => {
            const email = u.email;
            const courseCount = courses.filter(c => c.teacherEmail === email).length;
            return {
                name: `${u.firstName} ${u.lastName}`,
                email,
                initials: `${u.firstName[0] || ''}${u.lastName[0] || ''}`.toUpperCase(),
                color: 'bg-gradient',
                revenue: revenueByEmail[email] || 0,
                courses: courseCount,
                students: studentsByEmail[email] ? studentsByEmail[email].size : 0
            };
        });

    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No registered teachers yet.</td></tr>';
        return;
    }

    tbody.innerHTML = teachers.map(t => `
        <tr>
            <td>
                <div class="table-user">
                    <div class="avatar avatar-sm ${t.color}">${t.initials}</div>
                    <div><strong>${escapeHtml(t.name)}</strong><br><small>${escapeHtml(t.email)}</small></div>
                </div>
            </td>
            <td><strong>${EduCurrency.format(t.revenue)}</strong></td>
            <td><strong style="color: #00b894;">${EduCurrency.format(t.revenue * TEACHER_SHARE)}</strong></td>
            <td><strong style="color: #667eea;">${EduCurrency.format(t.revenue * PLATFORM_SHARE)}</strong></td>
            <td>${t.courses}</td>
            <td>${t.students.toLocaleString()}</td>
            <td><span class="status-badge status-active">${t.revenue > 0 ? 'Paid' : 'No earnings'}</span></td>
        </tr>
    `).join('');
}

/* ---- Course Approvals ---- */
function populateCourseApprovals() {
    const tbody = document.getElementById('courseApprovalsBody');
    if (!tbody) return;

    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]')
        .filter(c => c.status === 'pending');

    const approvalCount = document.getElementById('approvalCount');
    if (approvalCount) approvalCount.textContent = courses.length;

    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No pending course approvals.</td></tr>';
        return;
    }

    const modeLabels = { recorded: 'Self-paced', individual: '1-on-1', group: 'Group', hybrid: 'Hybrid' };
    const catLabels = {
        'web-dev': 'Web Dev', 'data-science': 'Data Sci', 'mobile': 'Mobile',
        'ai-ml': 'AI/ML', 'design': 'Design', 'business': 'Business',
        'cloud': 'Cloud', 'cybersecurity': 'Security'
    };

    tbody.innerHTML = courses.map(c => `
        <tr data-course-id="${c.id}">
            <td>
                <strong>${escapeHtml(c.title)}</strong><br>
                <small style="color: var(--text-muted);">${c.hours}h · ${c.level}</small>
            </td>
            <td>${escapeHtml(c.teacher)}</td>
            <td><span class="status-badge status-active">${catLabels[c.category] || c.category}</span></td>
            <td>${modeLabels[c.teachingMode] || c.teachingMode}</td>
            <td><strong>${EduCurrency.format(c.price)}</strong></td>
            <td>
                <input type="number" class="admin-price-input" value="${c.price.toFixed(2)}" min="0" step="0.01" style="width: 100px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary);" id="price-${c.id}">
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveCourse(${c.id})"><i class="fas fa-check"></i> Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectCourse(${c.id})"><i class="fas fa-times"></i> Reject</button>
            </td>
        </tr>
    `).join('');
}

function approveCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const priceInput = document.getElementById(`price-${courseId}`);
    const adminPrice = priceInput ? parseFloat(priceInput.value) : course.price;

    course.status = 'approved';
    course.approvedPrice = adminPrice;
    course.price = adminPrice; // final price set by admin

    localStorage.setItem('edunova_courses', JSON.stringify(courses));

    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    if (row) {
        row.style.opacity = '0.5';
        setTimeout(() => row.remove(), 800);
    }

    showNotification(`Course "${course.title}" approved at ${EduCurrency.format(adminPrice)}! Teacher gets ${EduCurrency.format(adminPrice * TEACHER_SHARE)} (60%).`, 'success');

    // Update approval count
    const remaining = courses.filter(c => c.status === 'pending').length;
    const badge = document.getElementById('approvalCount');
    if (badge) badge.textContent = remaining;
}

function rejectCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    course.status = 'rejected';
    localStorage.setItem('edunova_courses', JSON.stringify(courses));

    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    if (row) {
        row.style.opacity = '0.5';
        setTimeout(() => row.remove(), 800);
    }

    showNotification(`Course "${course.title}" has been rejected.`, 'warning');

    const remaining = courses.filter(c => c.status === 'pending').length;
    const badge = document.getElementById('approvalCount');
    if (badge) badge.textContent = remaining;
}

/* ---- Modal ---- */
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

/* ---- Helpers ---- */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---- Admin: Enrollment Management ---- */
function populateAdminEnrollments() {
    const tbody = document.getElementById('adminEnrollmentsBody');
    if (!tbody) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');

    if (enrollments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No enrollments found.</td></tr>';
        return;
    }

    const modeLabels = { recorded: 'Self-paced', individual: '1-on-1 Live', group: 'Group Live', hybrid: 'Hybrid' };

    tbody.innerHTML = enrollments.slice().reverse().map(e => {
        const isLive = e.teachingMode === 'individual' || e.teachingMode === 'group' || e.teachingMode === 'hybrid';
        const isCompleted = e.status === 'completed';

        let actionBtns = '';
        if (isCompleted) {
            actionBtns = '<span class="status-badge" style="background: rgba(0,184,148,0.15); color: #00b894;"><i class="fas fa-check-circle"></i> Done</span>';
        } else {
            actionBtns = `<button class="btn btn-sm btn-success" onclick="adminMarkComplete('${e.courseId}', '${e.studentEmail}')" title="Mark Complete"><i class="fas fa-check-circle"></i> Complete</button>`;
        }

        return `
        <tr>
            <td><strong>${escapeHtml(e.studentName || 'Student')}</strong><br><small style="color:var(--text-muted);">${escapeHtml(e.studentEmail)}</small></td>
            <td>${escapeHtml(e.courseTitle)}</td>
            <td>${escapeHtml(e.teacher || '-')}</td>
            <td><span class="status-badge ${isLive ? 'status-pending' : 'status-active'}">${modeLabels[e.teachingMode] || 'Self-paced'}</span></td>
            <td><strong>${EduCurrency.format(parseFloat(e.amount || 0))}</strong></td>
            <td>${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td><span class="status-badge ${isCompleted ? 'status-completed' : 'status-active'}">${isCompleted ? 'Completed' : capitalize(e.status || 'active')}</span></td>
            <td>${actionBtns}</td>
        </tr>
        `;
    }).join('');
}

/* ---- Admin: Mark a student's course as complete ---- */
function adminMarkComplete(courseId, studentEmail) {
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const idx = enrollments.findIndex(e => e.courseId == courseId && e.studentEmail === studentEmail);
    if (idx === -1) {
        showNotification('Enrollment not found.', 'warning');
        return;
    }

    enrollments[idx].status = 'completed';
    enrollments[idx].completionDate = new Date().toISOString();
    enrollments[idx].completedBy = 'admin';
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));

    // Set progress to 100
    const progress = JSON.parse(localStorage.getItem('edunova_progress') || '{}');
    progress[courseId + '_' + studentEmail] = 100;
    localStorage.setItem('edunova_progress', JSON.stringify(progress));

    showNotification(`${enrollments[idx].studentName || 'Student'}'s course "${enrollments[idx].courseTitle}" marked as completed! The student can now claim their certificate.`, 'success');
    populateAdminEnrollments();
}

/* ---- Super Admin: Add User ---- */
function handleAddUser(e) {
    e.preventDefault();
    const firstName = document.getElementById('newUserFirstName').value.trim();
    const lastName = document.getElementById('newUserLastName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;

    if (!firstName || !lastName || !email || !password) {
        showNotification('All fields are required.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('A user with this email already exists.', 'warning');
        return;
    }

    users.push({
        firstName, lastName, email, role,
        password: password,
        status: role === 'teacher' ? 'approved' : 'active',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('edunova_users', JSON.stringify(users));

    hideModal('addUserModal');
    document.getElementById('addUserForm').reset();
    showNotification(`User ${firstName} ${lastName} (${role}) created successfully!`, 'success');
    populateUsersTable();
}

/* ---- Super Admin: Delete User ---- */
function adminDeleteUser(email) {
    if (email === 'admin@edunova.com') {
        showNotification('Cannot delete the super admin account.', 'error');
        return;
    }
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const filtered = users.filter(u => u.email !== email);
    localStorage.setItem('edunova_users', JSON.stringify(filtered));
    showNotification('User deleted.', 'success');
    populateUsersTable();
}

/* ---- Super Admin: Toggle User Status ---- */
function adminToggleUserStatus(email) {
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) return;
    user.status = user.status === 'active' || user.status === 'approved' ? 'suspended' : 'active';
    localStorage.setItem('edunova_users', JSON.stringify(users));
    showNotification(`User ${user.firstName} is now ${user.status}.`, 'success');
    populateUsersTable();
    populateTeachersTable();
}

/* ---- Super Admin: Approve/Reject Teacher ---- */
function adminApproveTeacher(email) {
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const user = users.find(u => u.email === email && u.role === 'teacher');
    if (!user) return;
    user.status = 'approved';
    localStorage.setItem('edunova_users', JSON.stringify(users));
    showNotification(`${user.firstName} ${user.lastName} has been approved as a teacher! ✅`, 'success');
    populateUsersTable();
    populateTeachersTable();
}

function adminRejectTeacher(email) {
    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const user = users.find(u => u.email === email && u.role === 'teacher');
    if (!user) return;
    user.status = 'rejected';
    localStorage.setItem('edunova_users', JSON.stringify(users));
    showNotification(`${user.firstName} ${user.lastName}'s application has been rejected.`, 'warning');
    populateUsersTable();
    populateTeachersTable();
}

/* ---- Super Admin: Delete Enrollment ---- */
function adminDeleteEnrollment(courseId, studentEmail) {
    let enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    enrollments = enrollments.filter(e => !(e.courseId == courseId && e.studentEmail === studentEmail));
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));
    showNotification('Enrollment removed.', 'success');
    populateAdminEnrollments();
}

/* ---- Super Admin: Delete Course ---- */
function adminDeleteCourse(courseId) {
    let courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    courses = courses.filter(c => c.id != courseId);
    localStorage.setItem('edunova_courses', JSON.stringify(courses));
    showNotification('Course deleted from uploaded courses.', 'success');
    populateCourseApprovals();
}

/* ---- Super Admin: Revoke Certificate ---- */
function adminRevokeCertificate(certId) {
    let certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
    certs = certs.filter(c => c.certId !== certId);
    localStorage.setItem('edunova_certificates', JSON.stringify(certs));
    showNotification('Certificate revoked.', 'success');
    populateAdminContent();
}

/* ---- Populate Live Classes (Meetings) Tab ---- */
function populateAdminMeetings() {
    const tbody = document.getElementById('adminMeetingsBody');
    if (!tbody) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const liveModes = ['individual', 'group', 'hybrid'];
    const liveEnrollments = enrollments.filter(e => liveModes.includes(e.teachingMode));

    // Group by course+teacher
    const courseMap = {};
    liveEnrollments.forEach(e => {
        const key = e.courseId + '_' + e.teacherEmail;
        if (!courseMap[key]) {
            courseMap[key] = { courseTitle: e.courseTitle, teacher: e.teacher, teachingMode: e.teachingMode, students: 0, enrolled: e.date };
        }
        courseMap[key].students++;
    });

    const entries = Object.values(courseMap);
    const modeLabels = { individual: '1-on-1 Live', group: 'Group Live', hybrid: 'Hybrid' };

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No live classes found.</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(e => `
        <tr>
            <td><strong>${escapeHtml(e.courseTitle)}</strong></td>
            <td>${escapeHtml(e.teacher)}</td>
            <td>${e.students}</td>
            <td><span class="status-badge status-pending">${modeLabels[e.teachingMode] || e.teachingMode}</span></td>
            <td>${new Date(e.enrolled).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td><strong>3 hours max</strong></td>
            <td><span class="status-badge status-active">Active</span></td>
            <td><a href="meeting.html" class="btn btn-sm btn-primary"><i class="fas fa-video"></i> Monitor</a></td>
        </tr>
    `).join('');
}

/* ---- Populate Content Management Tab ---- */
function populateAdminContent() {
    const certsBody = document.getElementById('adminCertsBody');
    if (!certsBody) return;

    const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');

    const totalEl = document.getElementById('totalCertsCount');
    if (totalEl) totalEl.textContent = certs.length;

    const currEl = document.getElementById('activeCurrencyDisplay');
    if (currEl && window.EduCurrency) currEl.textContent = EduCurrency.code;

    if (certs.length === 0) {
        certsBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No certificates issued yet.</td></tr>';
        return;
    }

    certsBody.innerHTML = certs.slice().reverse().map(c => `
        <tr>
            <td><code style="font-size:12px;">${escapeHtml(c.certId)}</code></td>
            <td><strong>${escapeHtml(c.studentName)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(c.studentEmail)}</small></td>
            <td>${escapeHtml(c.courseTitle)}</td>
            <td>${escapeHtml(c.teacher)}</td>
            <td>${new Date(c.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td><span class="status-badge status-active">Valid</span></td>
            <td>
                <button class="action-btn" title="View" onclick='EduCert.show(${JSON.stringify(c).replace(/'/g, "&#39;")})'><i class="fas fa-eye"></i></button>
                <button class="action-btn action-btn-danger" title="Revoke" onclick="adminRevokeCertificate('${c.certId}')"><i class="fas fa-ban"></i></button>
            </td>
        </tr>
    `).join('');
}

/* ---- Populate Reports Summary ---- */
function populateReportsSummary() {
    const tbody = document.getElementById('reportsSummaryBody');
    if (!tbody) return;

    const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
    const payments = JSON.parse(localStorage.getItem('edunova_payments') || '[]');
    const totalRevenue = enrollments.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    const metrics = [
        { name: 'Registered Users', count: users.length, icon: 'fa-users', color: '#667eea' },
        { name: 'Students', count: users.filter(u => u.role === 'student').length, icon: 'fa-user-graduate', color: '#4facfe' },
        { name: 'Teachers', count: users.filter(u => u.role === 'teacher').length, icon: 'fa-chalkboard-teacher', color: '#f093fb' },
        { name: 'Uploaded Courses', count: courses.length, icon: 'fa-book-open', color: '#00b894' },
        { name: 'Approved Courses', count: courses.filter(c => c.status === 'approved').length, icon: 'fa-check-double', color: '#00cec9' },
        { name: 'Total Enrollments', count: enrollments.length, icon: 'fa-user-plus', color: '#fdcb6e' },
        { name: 'Completed Courses', count: enrollments.filter(e => e.status === 'completed').length, icon: 'fa-flag-checkered', color: '#00b894' },
        { name: 'Certificates Issued', count: certs.length, icon: 'fa-certificate', color: '#a78bfa' },
        { name: 'Total Revenue', count: window.EduCurrency ? EduCurrency.format(totalRevenue) : totalRevenue, icon: 'fa-chart-bar', color: '#e17055' },
        { name: 'Payments Processed', count: payments.length, icon: 'fa-credit-card', color: '#6c5ce7' },
    ];

    tbody.innerHTML = metrics.map(m => `
        <tr>
            <td><i class="fas ${m.icon}" style="color:${m.color}; margin-right:8px;"></i> ${m.name}</td>
            <td><strong>${m.count}</strong></td>
            <td><span style="color: #00b894;"><i class="fas fa-arrow-up"></i></span></td>
        </tr>
    `).join('');
}

/* ---- Export Reports ---- */
function exportReport(type) {
    let csv = '';
    let filename = '';

    if (type === 'users') {
        const users = JSON.parse(localStorage.getItem('edunova_users') || '[]');
        csv = 'First Name,Last Name,Email,Role,Status,Created At\n';
        csv += users.map(u => `${u.firstName},${u.lastName},${u.email},${u.role},${u.status || 'active'},${u.createdAt}`).join('\n');
        filename = 'edunova_users_report.csv';
    } else if (type === 'enrollments') {
        const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
        csv = 'Student,Email,Course,Teacher,Mode,Amount,Date,Status\n';
        csv += enrollments.map(e => `${e.studentName},${e.studentEmail},${e.courseTitle},${e.teacher},${e.teachingMode},${e.amount},${e.date},${e.status}`).join('\n');
        filename = 'edunova_enrollments_report.csv';
    } else if (type === 'revenue') {
        const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
        csv = 'Student,Course,Teacher,Amount,Teacher Share (60%),Platform Share (40%),Date\n';
        csv += enrollments.map(e => {
            const amt = parseFloat(e.amount || 0);
            return `${e.studentName},${e.courseTitle},${e.teacher},${amt},${(amt * 0.60).toFixed(2)},${(amt * 0.40).toFixed(2)},${e.date}`;
        }).join('\n');
        filename = 'edunova_revenue_report.csv';
    } else if (type === 'certificates') {
        const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
        csv = 'Certificate ID,Student,Email,Course,Teacher,Provider,Issue Date,URL\n';
        csv += certs.map(c => `${c.certId},${c.studentName},${c.studentEmail},${c.courseTitle},${c.teacher},${c.providerName},${c.issueDate},${c.certURL}`).join('\n');
        filename = 'edunova_certificates_report.csv';
    }

    if (csv) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        showNotification(`${capitalize(type)} report exported successfully!`, 'success');
    }
}

/* ---- Super Admin: Wipe & Reset Platform Data ---- */
function adminResetPlatform(key) {
    if (!key) return;
    const keyMap = {
        users: 'edunova_users',
        enrollments: 'edunova_enrollments',
        courses: 'edunova_courses',
        certificates: 'edunova_certificates',
        payments: 'edunova_payments',
        progress: 'edunova_progress',
        demos: 'edunova_demos',
    };
    const lsKey = keyMap[key];
    if (lsKey) {
        localStorage.removeItem(lsKey);
        showNotification(`${capitalize(key)} data cleared.`, 'success');
        location.reload();
    }
}
