/* ============================================
   EduNova — Student Dashboard JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn || session.role !== 'student') {
        window.location.href = 'login.html';
        return;
    }
    initSidebar();
    initTabs();
    loadStudentProfile();
    loadOverview();
    loadEnrolledCourses();
    loadDemoClasses();
    loadUpcomingClasses();
    loadPayments();
    loadCertificates();
});

/* ---- Sidebar & Tabs ---- */
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
            const target = document.getElementById(`tab-${tabId}`);
            if (target) target.classList.add('active');
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

/* ---- Load Profile ---- */
function loadStudentProfile() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const name = session.name || 'Student';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const avatarEl = document.getElementById('studentAvatar');
    const nameEl = document.getElementById('studentName');
    const topbarName = document.getElementById('topbarStudentName');
    const welcomeName = document.getElementById('welcomeName');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = name;
    if (topbarName) topbarName.textContent = name.split(' ')[0];
    if (welcomeName) welcomeName.textContent = name.split(' ')[0];
}

/* ---- Overview ---- */
function loadOverview() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]')
        .filter(e => e.studentEmail === session.email);
    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]')
        .filter(d => d.studentEmail === session.email);

    document.getElementById('statEnrolled').textContent = enrollments.length;
    document.getElementById('statDemos').textContent = demos.length;
    document.getElementById('statHours').textContent = enrollments.length * 12; // estimate

    const enrolledCount = document.getElementById('enrolledCount');
    if (enrolledCount) enrolledCount.textContent = enrollments.length;

    // Show demo banner if no enrollments
    const banner = document.getElementById('demoNoticeBanner');
    if (banner && enrollments.length === 0) {
        banner.style.display = 'flex';
    }

    // Continue learning grid
    const grid = document.getElementById('continueLearningGrid');
    if (grid) {
        if (enrollments.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                    <p style="color: var(--text-secondary);">No courses enrolled. <a href="courses.html" style="color: var(--primary);">Browse courses</a> to get started!</p>
                </div>
            `;
        } else {
            grid.innerHTML = enrollments.slice(0, 4).map(e => `
                <div class="course-card">
                    <div class="course-image" style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100px;">
                        <div class="course-badge">Enrolled</div>
                    </div>
                    <div class="course-content">
                        <h3 style="font-size: 15px;">${escapeHtml(e.courseTitle)}</h3>
                        <p style="font-size: 13px; color: var(--text-muted);">By ${escapeHtml(e.teacher)}</p>
                        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 8px; margin-top: 12px;">
                            <div style="background: var(--primary); height: 100%; border-radius: 8px; width: ${Math.floor(Math.random() * 70 + 10)}%;"></div>
                        </div>
                        <a href="meeting.html" class="btn btn-primary btn-sm btn-full" style="margin-top: 12px;"><i class="fas fa-play"></i> Continue</a>
                    </div>
                </div>
            `).join('');
        }
    }
}

/* ---- Enrolled Courses ---- */
function loadEnrolledCourses() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const grid = document.getElementById('enrolledCoursesGrid');
    if (!grid) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]')
        .filter(e => e.studentEmail === session.email);

    if (enrollments.length === 0) return; // default HTML handles empty state

    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #00b894, #00cec9)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        'linear-gradient(135deg, #fa709a, #fee140)'
    ];

    const modeLabels = { recorded: 'Self-paced', individual: '1-on-1 Live', group: 'Group Live', hybrid: 'Hybrid' };

    grid.innerHTML = enrollments.map((e, i) => {
        const progress = getProgress(e);
        const isCompleted = progress >= 100 || e.status === 'completed';
        const hasCert = isCompleted && hasCertificate(e.courseId, session.email);
        const isLive = e.teachingMode === 'individual' || e.teachingMode === 'group' || e.teachingMode === 'hybrid';

        let actionHtml = '';
        if (isCompleted) {
            actionHtml = hasCert
                ? `<button class="btn btn-success btn-sm btn-full" style="margin-top: 8px;" onclick="viewMyCertificate('${e.courseId}')"><i class="fas fa-certificate"></i> View Certificate</button>`
                : `<button class="btn btn-success btn-sm btn-full" style="margin-top: 8px;" onclick="claimCertificate('${e.courseId}')"><i class="fas fa-award"></i> Claim Certificate</button>`;
        } else if (isLive) {
            // Live courses can only be marked complete by teacher or admin
            actionHtml = `
                <a href="meeting.html" class="btn btn-primary btn-sm btn-full" style="margin-top: 8px;"><i class="fas fa-video"></i> Join Live Class</a>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px; text-align:center;">
                    <i class="fas fa-info-circle"></i> Completion is marked by your teacher or admin
                </p>`;
        } else {
            // Self-paced / recorded — students can mark done themselves
            actionHtml = `
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <a href="meeting.html" class="btn btn-primary btn-sm" style="flex:1;"><i class="fas fa-play"></i> Continue</a>
                    <button class="btn btn-outline btn-sm" style="flex:1;" onclick="markComplete('${e.courseId}')"><i class="fas fa-check"></i> Mark Done</button>
                </div>`;
        }

        return `
        <div class="course-card">
            <div class="course-image" style="background: ${gradients[i % gradients.length]}; height: 120px;">
                <div class="course-badge">${isCompleted ? '✅ Completed' : 'Enrolled'}</div>
            </div>
            <div class="course-content">
                <h3>${escapeHtml(e.courseTitle)}</h3>
                <p style="font-size: 13px; color: var(--text-muted);">By ${escapeHtml(e.teacher)}</p>
                <div class="course-meta" style="margin-top: 8px;">
                    <span><i class="fas fa-play-circle"></i> ${modeLabels[e.teachingMode] || 'Self-paced'}</span>
                    <span><i class="fas fa-indian-rupee-sign"></i> ${EduCurrency.format(parseFloat(e.amount))}</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 8px; margin-top: 12px; position: relative;">
                    <div style="background: ${isCompleted ? '#00b894' : 'var(--primary)'}; height: 100%; border-radius: 8px; width: ${isCompleted ? 100 : progress}%; transition: width 0.3s;"></div>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${isCompleted ? '100% Complete' : progress + '% Progress'}</p>
                ${actionHtml}
            </div>
        </div>
        `;
    }).join('');
}

/* ---- Demo Classes ---- */
function loadDemoClasses() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const tbody = document.getElementById('demoClassesBody');
    if (!tbody) return;

    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]')
        .filter(d => d.studentEmail === session.email);
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]')
        .filter(e => e.studentEmail === session.email);

    if (demos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No demo classes taken yet. Browse courses and try a free demo!</td></tr>';
        return;
    }

    tbody.innerHTML = demos.map(d => {
        const isEnrolled = enrollments.find(e => e.courseId === d.courseId);
        return `
            <tr>
                <td><strong>${escapeHtml(d.courseTitle)}</strong></td>
                <td>${escapeHtml(d.teacher)}</td>
                <td>${new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><span class="status-badge ${d.status === 'completed' ? 'status-active' : 'status-pending'}">${d.status}</span></td>
                <td>
                    ${isEnrolled
                        ? '<span class="status-badge status-active"><i class="fas fa-check"></i> Enrolled</span>'
                        : `<a href="courses.html" class="btn btn-sm btn-primary"><i class="fas fa-lock-open"></i> Enroll Now</a>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

/* ---- Upcoming Classes ----
   Shows ALL upcoming live classes from teachers (not only enrolled courses).
   Rules:
     - Enrolled student   -> Join free
     - Demo NOT yet used  -> Join 1st class as free demo
     - Demo already used  -> must pay (Enroll Now) before joining
     - allowDemo=false    -> must enroll/pay from the start
*/
function loadUpcomingClasses() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const grid = document.getElementById('studentScheduleGrid');
    if (!grid) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]')
        .filter(e => e.studentEmail === session.email);
    const enrolledCourseIds = new Set(enrollments.map(e => String(e.courseId)));

    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]')
        .filter(d => d.studentEmail === session.email);
    const demoUsedCourseIds = new Set(demos.map(d => String(d.courseId)));

    // Show only classes that are today or in the future
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allSchedules = JSON.parse(localStorage.getItem('edunova_schedules') || '[]')
        .filter(s => {
            if (!s.date) return true;
            const d = new Date(s.date); d.setHours(0, 0, 0, 0);
            return d >= today;
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    if (allSchedules.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-calendar-alt" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3>No upcoming classes</h3>
                <p style="color: var(--text-secondary);">Teachers will schedule live classes soon!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = allSchedules.map(s => {
        const sid = String(s.id);
        const cid = String(s.courseId);
        const isEnrolled = enrolledCourseIds.has(cid);
        const demoUsed = demoUsedCourseIds.has(cid);
        const fee = (s.approvedFee != null) ? s.approvedFee : (s.fee || 0);
        const allowDemo = s.allowDemo !== false; // default true if missing

        let actionHtml, statusBadge;
        if (isEnrolled) {
            statusBadge = '<span class="status-badge status-active">Enrolled</span>';
            actionHtml = `<a href="meeting.html" class="btn btn-primary btn-sm btn-full" onclick="recordClassJoin('${sid}')"><i class="fas fa-video"></i> Join Class</a>`;
        } else if (allowDemo && !demoUsed) {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-gift"></i> Free Demo Available</span>';
            actionHtml = `<button class="btn btn-success btn-sm btn-full" onclick="joinAsDemo('${sid}')"><i class="fas fa-play-circle"></i> Join Free Demo</button>`;
        } else {
            const reason = demoUsed ? 'Demo already used' : 'Paid class';
            statusBadge = `<span class="status-badge status-inactive"><i class="fas fa-lock"></i> ${reason}</span>`;
            actionHtml = `<button class="btn btn-primary btn-sm btn-full" onclick="payAndJoin('${sid}')"><i class="fas fa-credit-card"></i> Pay ${EduCurrency.format(fee)} &amp; Join</button>`;
        }

        return `
        <div class="schedule-card">
            <div class="schedule-card-header">
                <h4>${escapeHtml(s.topic || s.courseTitle || 'Live Class')}</h4>
                ${statusBadge}
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin:4px 0;">${escapeHtml(s.courseTitle || '')}</p>
            <div class="schedule-card-meta">
                <span><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(s.teacherName || 'Teacher')}</span>
                <span><i class="fas fa-calendar"></i> ${s.date}</span>
                <span><i class="fas fa-clock"></i> ${s.time} (${s.duration} min)</span>
                <span><i class="fas fa-tag"></i> ${fee > 0 ? EduCurrency.format(fee) + '/class' : 'Free'}</span>
            </div>
            ${actionHtml}
        </div>
        `;
    }).join('');
}

/* ---- Live-class join handlers ---- */
function _findSchedule(scheduleId) {
    const list = JSON.parse(localStorage.getItem('edunova_schedules') || '[]');
    return list.find(s => String(s.id) === String(scheduleId));
}

function recordClassJoin(scheduleId) {
    // Just navigate; placeholder for future attendance tracking
    return true;
}

function joinAsDemo(scheduleId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;
    const s = _findSchedule(scheduleId);
    if (!s) return;

    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]');
    const already = demos.some(d => d.studentEmail === session.email && String(d.courseId) === String(s.courseId));
    if (already) {
        showNotification('You have already used your free demo for this course. Please enroll to continue.', 'warning');
        return;
    }

    demos.push({
        id: Date.now(),
        scheduleId: s.id,
        courseId: s.courseId,
        courseTitle: s.courseTitle,
        teacher: s.teacherName,
        teacherEmail: s.teacherEmail,
        studentEmail: session.email,
        studentName: session.name,
        date: new Date().toISOString(),
        status: 'completed'
    });
    localStorage.setItem('edunova_demos', JSON.stringify(demos));
    showNotification('Free demo unlocked! Redirecting to your live class… 🎉', 'success');
    setTimeout(() => { window.location.href = 'meeting.html'; }, 800);
}

function payAndJoin(scheduleId) {
    const s = _findSchedule(scheduleId);
    if (!s) return;
    const fee = (s.approvedFee != null) ? s.approvedFee : (s.fee || 0);
    const ok = confirm(`This live class costs ${EduCurrency.format(fee)}.\n\nYour free demo for "${s.courseTitle}" has already been used.\nProceed to enroll & pay?`);
    if (!ok) return;
    // Hand off to courses page where the existing enrollment/payment flow lives
    window.location.href = 'courses.html';
}

/* ---- Payments ---- */
function loadPayments() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    const payments = JSON.parse(localStorage.getItem('edunova_payments') || '[]')
        .filter(p => p.studentEmail === session.email);

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No payments yet.</td></tr>';
        return;
    }

    tbody.innerHTML = payments.slice().reverse().map(p => `
        <tr>
            <td>${new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td><strong>${escapeHtml(p.courseTitle)}</strong></td>
            <td>${escapeHtml(p.teacher)}</td>
            <td><strong>${EduCurrency.format(parseFloat(p.amount))}</strong></td>
            <td>Credit Card</td>
            <td><span class="status-badge status-active">Completed</span></td>
            <td><button class="action-btn" title="Download"><i class="fas fa-download"></i></button></td>
        </tr>
    `).join('');
}

/* ---- Helpers ---- */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---- Progress Tracking ---- */
function getProgress(enrollment) {
    if (enrollment.status === 'completed') return 100;
    const progress = JSON.parse(localStorage.getItem('edunova_progress') || '{}');
    const key = enrollment.courseId + '_' + enrollment.studentEmail;
    return progress[key] || Math.floor(Math.random() * 60 + 15); // simulated progress for demo
}

function setProgress(courseId, email, value) {
    const progress = JSON.parse(localStorage.getItem('edunova_progress') || '{}');
    progress[courseId + '_' + email] = value;
    localStorage.setItem('edunova_progress', JSON.stringify(progress));
}

function hasCertificate(courseId, email) {
    const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
    return certs.some(c => c.courseId === courseId && c.studentEmail === email);
}

/* ---- Mark Course as Complete ---- */
function markComplete(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const idx = enrollments.findIndex(e => e.courseId == courseId && e.studentEmail === session.email);
    if (idx === -1) return;

    enrollments[idx].status = 'completed';
    enrollments[idx].completionDate = new Date().toISOString();
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));
    setProgress(courseId, session.email, 100);

    showNotification('Course marked as completed! You can now claim your certificate. 🎉', 'success');
    loadEnrolledCourses();
    loadCertificates();
}

/* ---- Claim Certificate ---- */
function claimCertificate(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const enrollment = enrollments.find(e => e.courseId == courseId && e.studentEmail === session.email);
    if (!enrollment) return;

    const cert = EduCert.issue({
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        studentName: session.name,
        studentEmail: session.email,
        teacher: enrollment.teacher,
        teacherEmail: enrollment.teacherEmail,
        teachingMode: enrollment.teachingMode
    });

    showNotification('Certificate issued successfully! 🏆', 'success');
    EduCert.show(cert);
    loadEnrolledCourses();
    loadCertificates();
}

/* ---- View Certificate ---- */
function viewMyCertificate(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
    const cert = certs.find(c => c.courseId == courseId && c.studentEmail === session.email);
    if (cert) EduCert.show(cert);
}

/* ---- Load Certificates Tab ---- */
function loadCertificates() {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session) return;

    const grid = document.getElementById('certificatesGrid');
    if (!grid) return;

    const certs = EduCert.getForStudent(session.email);

    // Update badge count
    const badge = document.getElementById('certCount');
    if (badge) badge.textContent = certs.length;

    if (certs.length === 0) return; // keep default empty state HTML

    grid.innerHTML = certs.map(cert => `
        <div class="cert-card">
            <div class="cert-card-header">
                <div class="cert-card-icon"><i class="fas fa-award"></i></div>
                <div class="cert-card-badge">Verified</div>
            </div>
            <div class="cert-card-body">
                <h3 class="cert-card-title">${escapeHtml(cert.courseTitle)}</h3>
                <p class="cert-card-instructor">Taught by ${escapeHtml(cert.teacher)}</p>
                <div class="cert-card-details">
                    <div class="cert-card-detail">
                        <span class="cert-card-label">Certificate ID</span>
                        <span class="cert-card-value">${escapeHtml(cert.certId)}</span>
                    </div>
                    <div class="cert-card-detail">
                        <span class="cert-card-label">Issued</span>
                        <span class="cert-card-value">${new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="cert-card-detail">
                        <span class="cert-card-label">Provider</span>
                        <span class="cert-card-value">${escapeHtml(cert.providerName)}</span>
                    </div>
                </div>
            </div>
            <div class="cert-card-actions">
                <button class="btn btn-primary btn-sm" onclick='EduCert.show(${JSON.stringify(cert).replace(/'/g, "&#39;")})'>
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-outline btn-sm" onclick='EduCert.download(${JSON.stringify(cert).replace(/'/g, "&#39;")})'>
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

/* ---- Notification Helper ---- */
function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.className = 'notification notification-' + (type || 'info');
    notif.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    notif.style.cssText = 'position:fixed; top:20px; right:20px; padding:16px 24px; border-radius:12px; z-index:10000; font-size:14px; font-weight:500; animation:slideInRight 0.3s ease; background:' + (type === 'success' ? 'linear-gradient(135deg, #00b894, #00cec9)' : 'linear-gradient(135deg, #667eea, #764ba2)') + '; color:#fff; box-shadow: 0 8px 32px rgba(0,0,0,0.3);';
    document.body.appendChild(notif);
    setTimeout(() => { notif.style.opacity = '0'; setTimeout(() => notif.remove(), 300); }, 3000);
}
