/* ============================================
   EduNova — Teacher Dashboard JavaScript
   ============================================ */

const TEACHER_SHARE = 0.60;
const PLATFORM_SHARE = 0.40;

document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn || session.role !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }
    initSidebar();
    initTabs();
    loadTeacherProfile();
    loadOverviewStats();
    loadTeacherCourses();
    loadMyStudents();
    loadEarnings();
    loadSchedule();
    initUploadForm();
    initScheduleForm();
});

/* ---- Sidebar & Tabs (reuse pattern from dashboard.js) ---- */
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const close = document.getElementById('sidebarClose');
    if (toggle && sidebar) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    if (close && sidebar) close.addEventListener('click', () => sidebar.classList.remove('open'));
}

function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item[data-tab]').forEach(n => {
        n.classList.toggle('active', n.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');
}

/* ---- Load Teacher Profile ---- */
function loadTeacherProfile() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || session.role !== 'teacher') return;

    const name = session.name || 'Teacher';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const avatarEl = document.getElementById('teacherAvatar');
    const nameEl = document.getElementById('teacherName');
    const topbarName = document.getElementById('topbarTeacherName');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = name;
    if (topbarName) topbarName.textContent = name.split(' ')[0];
}

/* ---- Overview Stats ---- */
function loadOverviewStats() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const teacherCourses = getTeacherCourses(session.email);
    const enrollments = getTeacherEnrollments(session.email);
    const totalRevenue = enrollments.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const teacherEarnings = totalRevenue * TEACHER_SHARE;
    const platformEarnings = totalRevenue * PLATFORM_SHARE;

    // Unique students
    const uniqueStudents = new Set(enrollments.map(e => e.studentEmail)).size;

    document.getElementById('statCourses').textContent = teacherCourses.length;
    document.getElementById('statStudents').textContent = uniqueStudents;
    document.getElementById('statEarnings').textContent = EduCurrency.format(teacherEarnings);
    document.getElementById('statRating').textContent = '4.8';

    document.getElementById('splitTeacherAmount').textContent = EduCurrency.format(teacherEarnings);
    document.getElementById('splitPlatformAmount').textContent = EduCurrency.format(platformEarnings);
    document.getElementById('splitTotalAmount').textContent = EduCurrency.format(totalRevenue);

    const badge = document.getElementById('courseCountBadge');
    if (badge) badge.textContent = teacherCourses.length;

    // Populate recent enrollments
    const tbody = document.getElementById('teacherEnrollmentsBody');
    if (tbody) {
        if (enrollments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No enrollments yet. Upload a course to get started!</td></tr>';
        } else {
            tbody.innerHTML = enrollments.slice(-10).reverse().map(e => `
                <tr>
                    <td><strong>${escapeHtml(e.studentName || 'Student')}</strong></td>
                    <td>${escapeHtml(e.courseTitle)}</td>
                    <td><span class="status-badge status-active">${e.teachingMode || 'recorded'}</span></td>
                    <td>${EduCurrency.format(parseFloat(e.amount))}</td>
                    <td><strong style="color:#00b894;">${EduCurrency.format(parseFloat(e.amount) * TEACHER_SHARE)}</strong></td>
                    <td>${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span class="status-badge status-active">${e.status}</span></td>
                </tr>
            `).join('');
        }
    }
}

/* ---- Teacher Courses ---- */
function getTeacherCourses(email) {
    const allCourses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    return allCourses.filter(c => c.teacherEmail === email);
}

function getTeacherEnrollments(email) {
    const allEnrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    return allEnrollments.filter(e => e.teacherEmail === email);
}

function loadTeacherCourses() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const grid = document.getElementById('teacherCoursesGrid');
    if (!grid) return;

    const courses = getTeacherCourses(session.email);

    if (courses.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3>No courses uploaded yet</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Upload your first course and start earning 60% of every enrollment!</p>
                <button class="btn btn-primary" onclick="switchTab('upload-course')"><i class="fas fa-plus"></i> Upload Course</button>
            </div>
        `;
        return;
    }

    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        'linear-gradient(135deg, #00b894, #00cec9)',
        'linear-gradient(135deg, #ffecd2, #fcb69f)'
    ];

    grid.innerHTML = courses.map((course, i) => {
        const statusLabel = course.status === 'approved' ? 'Live' : course.status === 'pending' ? 'Pending Review' : 'Rejected';
        const statusClass = course.status === 'approved' ? 'status-active' : course.status === 'pending' ? 'status-pending' : 'status-inactive';
        const gradient = course.gradient || gradients[i % gradients.length];

        return `
            <div class="course-card">
                <div class="course-image" style="background: ${gradient};">
                    <div class="course-badge">${statusLabel}</div>
                    <div class="course-category">${escapeHtml(getCategoryLabel(course.category))}</div>
                </div>
                <div class="course-content">
                    <h3>${escapeHtml(course.title)}</h3>
                    <p style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(course.description || '')}</p>
                    <div class="course-meta" style="margin-top: 8px;">
                        <span><i class="fas fa-clock"></i> ${course.hours}h</span>
                        <span><i class="fas fa-signal"></i> ${course.level}</span>
                        <span><i class="fas fa-indian-rupee-sign"></i> ${course.status === 'approved' ? EduCurrency.format(course.approvedPrice) : EduCurrency.format(course.price)}</span>
                    </div>
                    <div class="course-footer" style="margin-top: 12px;">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        <div class="course-price">Your share: <strong style="color:#00b894;">${EduCurrency.format((course.approvedPrice || course.price) * TEACHER_SHARE)}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* ---- Upload Course Form ---- */
function initUploadForm() {
    const form = document.getElementById('uploadCourseForm');
    if (!form) return;

    // Price preview
    const priceInput = document.getElementById('coursePrice');
    if (priceInput) {
        priceInput.addEventListener('input', () => {
            const price = parseFloat(priceInput.value) || 0;
            document.getElementById('previewPrice').textContent = price.toFixed(2);
            document.getElementById('previewTeacherShare').textContent = (price * TEACHER_SHARE).toFixed(2);
            document.getElementById('previewPlatformShare').textContent = (price * PLATFORM_SHARE).toFixed(2);
        });
    }

    // Teaching mode — show/hide group size
    const modeSelect = document.getElementById('courseTeachingMode');
    if (modeSelect) {
        modeSelect.addEventListener('change', () => {
            const groupSizeGroup = document.getElementById('groupSizeGroup');
            if (groupSizeGroup) {
                groupSizeGroup.style.display = (modeSelect.value === 'group' || modeSelect.value === 'hybrid') ? 'block' : 'none';
            }
        });
    }

    // Video preview
    const videoInput = document.getElementById('courseVideo');
    if (videoInput) {
        videoInput.addEventListener('change', () => {
            const file = videoInput.files[0];
            if (file) {
                const preview = document.getElementById('courseVideoPreview');
                const box = document.getElementById('videoPreviewBox');
                preview.src = URL.createObjectURL(file);
                box.style.display = 'block';
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
        if (!session) return;

        const courseData = {
            id: Date.now(),
            title: document.getElementById('courseTitle').value,
            category: document.getElementById('courseCategory').value,
            level: document.getElementById('courseLevel').value,
            description: document.getElementById('courseDescription').value,
            hours: parseInt(document.getElementById('courseHours').value),
            price: parseFloat(document.getElementById('coursePrice').value),
            teachingMode: document.getElementById('courseTeachingMode').value,
            maxGroupSize: document.getElementById('maxGroupSize')?.value ? parseInt(document.getElementById('maxGroupSize').value) : null,
            allowDemo: document.getElementById('allowDemo')?.checked || false,
            teacher: session.name,
            teacherEmail: session.email,
            teacherInitials: session.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
            teacherColor: 'bg-purple',
            rating: 0,
            reviews: 0,
            students: 0,
            badge: 'New',
            gradient: getRandomGradient(),
            status: 'pending', // Awaiting admin approval
            approvedPrice: null,
            createdAt: new Date().toISOString()
        };

        // Save course
        const courses = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
        courses.push(courseData);
        localStorage.setItem('edunova_courses', JSON.stringify(courses));

        showNotification('Course submitted for review! Admin will approve and set the final price. 📝', 'success');

        form.reset();
        const box = document.getElementById('videoPreviewBox');
        if (box) box.style.display = 'none';

        setTimeout(() => {
            switchTab('my-courses');
            loadTeacherCourses();
            loadOverviewStats();
        }, 1500);
    });
}

function getRandomGradient() {
    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        'linear-gradient(135deg, #00b894, #00cec9)',
        'linear-gradient(135deg, #fa709a, #fee140)',
        'linear-gradient(135deg, #2ecc71, #27ae60)',
        'linear-gradient(135deg, #e74c3c, #e67e22)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

/* ---- My Students ---- */
function loadMyStudents() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const tbody = document.getElementById('myStudentsBody');
    if (!tbody) return;

    const enrollments = getTeacherEnrollments(session.email);

    if (enrollments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No students enrolled yet.</td></tr>';
        return;
    }

    const modeLabels = { recorded: 'Self-paced', individual: '1-on-1', group: 'Group', hybrid: 'Hybrid' };

    tbody.innerHTML = enrollments.map(e => {
        const isLive = e.teachingMode === 'individual' || e.teachingMode === 'group' || e.teachingMode === 'hybrid';
        const isCompleted = e.status === 'completed';
        const progress = isCompleted ? 100 : Math.floor(Math.random() * 80 + 10);

        let actionBtns = `<a href="meeting.html" class="btn btn-sm btn-primary" title="Join Class"><i class="fas fa-video"></i></a>`;
        if (isLive && !isCompleted) {
            actionBtns += ` <button class="btn btn-sm btn-success" title="Mark Complete" onclick="teacherMarkComplete('${e.courseId}', '${e.studentEmail}')"><i class="fas fa-check-circle"></i></button>`;
        }

        return `
        <tr>
            <td><strong>${escapeHtml(e.studentName || 'Student')}</strong><br><small style="color:var(--text-muted);">${escapeHtml(e.studentEmail)}</small></td>
            <td>${escapeHtml(e.courseTitle)}</td>
            <td><span class="status-badge status-active">${modeLabels[e.teachingMode] || 'Recorded'}</span></td>
            <td>${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td>
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 8px; width: 100px;">
                    <div style="background: ${isCompleted ? '#00b894' : 'var(--primary)'}; height: 100%; border-radius: 8px; width: ${progress}%;"></div>
                </div>
                <small style="color:var(--text-muted); font-size:11px;">${progress}%</small>
            </td>
            <td><span class="status-badge ${isCompleted ? 'status-completed' : 'status-active'}">${isCompleted ? 'Completed' : e.status}</span></td>
            <td>${actionBtns}</td>
        </tr>
        `;
    }).join('');
}

/* ---- Earnings ---- */
function loadEarnings() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const tbody = document.getElementById('earningsTableBody');
    if (!tbody) return;

    const enrollments = getTeacherEnrollments(session.email);

    if (enrollments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No transactions yet.</td></tr>';
        return;
    }

    const totalRevenue = enrollments.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalEarnedEl = document.getElementById('totalEarned');
    if (totalEarnedEl) totalEarnedEl.textContent = EduCurrency.format(totalRevenue * TEACHER_SHARE);

    tbody.innerHTML = enrollments.slice().reverse().map(e => {
        const amount = parseFloat(e.amount);
        return `
            <tr>
                <td>${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><strong>${escapeHtml(e.studentName || 'Student')}</strong></td>
                <td>${escapeHtml(e.courseTitle)}</td>
                <td>${EduCurrency.format(amount)}</td>
                <td><strong style="color:#00b894;">${EduCurrency.format(amount * TEACHER_SHARE)}</strong></td>
                <td>${EduCurrency.format(amount * PLATFORM_SHARE)}</td>
                <td><span class="status-badge status-active">Paid</span></td>
            </tr>
        `;
    }).join('');
}

/* ---- Schedule ---- */
function loadSchedule() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const grid = document.getElementById('scheduleGrid');
    if (!grid) return;

    const schedules = JSON.parse(localStorage.getItem('edunova_schedules') || '[]')
        .filter(s => s.teacherEmail === session.email);

    // Also populate the course dropdown in the schedule modal
    const schedCourse = document.getElementById('schedCourse');
    if (schedCourse) {
        const courses = getTeacherCourses(session.email);
        schedCourse.innerHTML = '<option value="">Select course</option>' +
            courses.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');
    }

    if (schedules.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-calendar-alt" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3>No classes scheduled</h3>
                <p style="color: var(--text-secondary);">Schedule your first live class!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = schedules.map(s => `
        <div class="schedule-card">
            <div class="schedule-card-header">
                <h4>${escapeHtml(s.courseTitle || 'Class')}</h4>
                <span class="status-badge status-active">${s.type === 'group' ? 'Group' : '1-on-1'}</span>
            </div>
            <div class="schedule-card-meta">
                <span><i class="fas fa-calendar"></i> ${s.date}</span>
                <span><i class="fas fa-clock"></i> ${s.time} (${s.duration} min)</span>
                <span><i class="fas fa-users"></i> ${s.type === 'group' ? 'Group Class' : 'Individual'}</span>
            </div>
            <a href="meeting.html" class="btn btn-primary btn-sm btn-full" style="margin-top: 12px;"><i class="fas fa-video"></i> Start Class</a>
        </div>
    `).join('');
}

function initScheduleForm() {
    const form = document.getElementById('scheduleForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
        if (!session) return;

        const courseId = document.getElementById('schedCourse').value;
        const courses = getTeacherCourses(session.email);
        const course = courses.find(c => String(c.id) === courseId);

        const schedule = {
            id: Date.now(),
            courseId: courseId,
            courseTitle: course ? course.title : 'Live Class',
            teacherEmail: session.email,
            teacherName: session.name,
            date: document.getElementById('schedDate').value,
            time: document.getElementById('schedTime').value,
            duration: parseInt(document.getElementById('schedDuration').value),
            type: document.getElementById('schedType').value,
            createdAt: new Date().toISOString()
        };

        const schedules = JSON.parse(localStorage.getItem('edunova_schedules') || '[]');
        schedules.push(schedule);
        localStorage.setItem('edunova_schedules', JSON.stringify(schedules));

        hideModal('scheduleModal');
        showNotification('Class scheduled successfully! 📅', 'success');
        loadSchedule();
    });
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

/* ---- Helpers ---- */
function getCategoryLabel(cat) {
    const labels = {
        'web-dev': 'Web Development', 'data-science': 'Data Science',
        'mobile': 'Mobile Development', 'ai-ml': 'AI & Machine Learning',
        'design': 'Design', 'business': 'Business',
        'cloud': 'Cloud Computing', 'cybersecurity': 'Cybersecurity'
    };
    return labels[cat] || cat;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---- Teacher: Mark Student Course Complete (Live courses only) ---- */
function teacherMarkComplete(courseId, studentEmail) {
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const idx = enrollments.findIndex(e => e.courseId == courseId && e.studentEmail === studentEmail);
    if (idx === -1) {
        showNotification('Enrollment not found.', 'warning');
        return;
    }

    const enrollment = enrollments[idx];
    const isLive = enrollment.teachingMode === 'individual' || enrollment.teachingMode === 'group' || enrollment.teachingMode === 'hybrid';
    if (!isLive) {
        showNotification('Only live course enrollments can be marked complete by the teacher.', 'warning');
        return;
    }

    enrollments[idx].status = 'completed';
    enrollments[idx].completionDate = new Date().toISOString();
    enrollments[idx].completedBy = 'teacher';
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));

    // Set progress to 100
    const progress = JSON.parse(localStorage.getItem('edunova_progress') || '{}');
    progress[courseId + '_' + studentEmail] = 100;
    localStorage.setItem('edunova_progress', JSON.stringify(progress));

    showNotification(`${enrollment.studentName || 'Student'}'s course "${enrollment.courseTitle}" marked as completed! They can now claim their certificate.`, 'success');
    loadMyStudents();
}
