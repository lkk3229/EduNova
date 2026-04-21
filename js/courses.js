/* ============================================
   EduNova — Courses Page JavaScript
   ============================================ */

const TEACHER_SHARE = 0.60;
const PLATFORM_SHARE = 0.40;

/* ---- Gradient Presets ---- */
const G = {
    blue:    'linear-gradient(135deg, #667eea, #764ba2)',
    pink:    'linear-gradient(135deg, #f093fb, #f5576c)',
    cyan:    'linear-gradient(135deg, #4facfe, #00f2fe)',
    purple:  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    orange:  'linear-gradient(135deg, #ffecd2, #fcb69f)',
    green:   'linear-gradient(135deg, #00b894, #00cec9)',
    rose:    'linear-gradient(135deg, #fa709a, #fee140)',
    dark:    'linear-gradient(135deg, #2c3e50, #3498db)',
    red:     'linear-gradient(135deg, #e74c3c, #e67e22)',
    lime:    'linear-gradient(135deg, #2ecc71, #27ae60)',
    teal:    'linear-gradient(135deg, #11998e, #38ef7d)',
    indigo:  'linear-gradient(135deg, #5f72bd, #9b23ea)',
    coral:   'linear-gradient(135deg, #ff6b6b, #feca57)',
    slate:   'linear-gradient(135deg, #636e72, #b2bec3)',
    gold:    'linear-gradient(135deg, #f7971e, #ffd200)',
    navy:    'linear-gradient(135deg, #0c3483, #a2b6df)',
    forest:  'linear-gradient(135deg, #134e5e, #71b280)',
    sunset:  'linear-gradient(135deg, #f12711, #f5af19)',
    sky:     'linear-gradient(135deg, #89f7fe, #66a6ff)',
    plum:    'linear-gradient(135deg, #c471f5, #fa71cd)',
};

const coursesData = []; // Sample seed data removed � only real teacher uploads will appear

// Convert USD-scale prices to INR (base currency)
const USD_TO_INR = 83;
coursesData.forEach(c => { if (c.price > 0) c.price = Math.round(c.price * USD_TO_INR); });

document.addEventListener('DOMContentLoaded', () => {
    // Merge teacher-uploaded courses from localStorage
    loadTeacherCourses();
    renderCourses(coursesData);
    initCurrencySelector();
});

function initCurrencySelector() {
    const select = document.getElementById('currencySelect');
    if (!select) return;
    const currencies = EduCurrency.all();
    select.innerHTML = currencies.map(c =>
        `<option value="${c.code}" ${c.code === EduCurrency.code ? 'selected' : ''}>${c.symbol} ${c.code} — ${c.name}</option>`
    ).join('');
}

function loadTeacherCourses() {
    const uploaded = JSON.parse(localStorage.getItem('edunova_courses') || '[]');
    uploaded.forEach(c => {
        if (c.status === 'approved' && !coursesData.find(d => d.id === c.id)) {
            coursesData.push(c);
        }
    });
}

function getTeachingModeLabel(mode) {
    const labels = {
        'recorded': 'Self-paced',
        'individual': '1-on-1 Live',
        'group': 'Group Live',
        'hybrid': 'Hybrid'
    };
    return labels[mode] || mode;
}

function getTeachingModeIcon(mode) {
    const icons = {
        'recorded': 'fa-play-circle',
        'individual': 'fa-user',
        'group': 'fa-users',
        'hybrid': 'fa-layer-group'
    };
    return icons[mode] || 'fa-book';
}

function renderCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    const countEl = document.getElementById('courseCount');
    if (!grid) return;

    if (countEl) countEl.textContent = courses.length;

    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]');

    if (courses.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">No courses found</h3>
                <p style="color: var(--text-secondary);">Try adjusting your filters or search query.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = courses.map(course => {
        const starsHtml = generateStars(course.rating);
        const priceHtml = course.price === 0 ? '<span style="color: #00b894; font-weight: 800;">Free</span>' : EduCurrency.format(course.price);

        // Check enrollment status
        const isEnrolled = session && enrollments.find(e => e.courseId === course.id && e.studentEmail === session.email);
        const hasDemoUsed = session && demos.find(d => d.courseId === course.id && d.studentEmail === session.email);

        let actionButtons = '';
        if (isEnrolled) {
            actionButtons = `<button class="btn btn-success btn-full" style="margin-top: 12px;" disabled><i class="fas fa-check-circle"></i> Enrolled</button>`;
        } else if (course.price === 0) {
            actionButtons = `<button class="btn btn-primary btn-full" style="margin-top: 12px;" onclick="enrollCourse(${course.id})"><i class="fas fa-plus-circle"></i> Enroll Free</button>`;
        } else if (hasDemoUsed) {
            actionButtons = `
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn btn-outline btn-full" disabled style="flex: 0 0 auto; opacity: 0.5;"><i class="fas fa-play-circle"></i> Demo Used</button>
                    <button class="btn btn-primary btn-full" style="flex: 1;" onclick="showPaymentModal(${course.id})"><i class="fas fa-lock-open"></i> Enroll ${EduCurrency.format(course.price)}</button>
                </div>`;
        } else {
            actionButtons = `
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    ${course.allowDemo ? `<button class="btn btn-outline btn-full" style="flex: 1;" onclick="takeDemo(${course.id})"><i class="fas fa-play-circle"></i> Free Demo</button>` : ''}
                    <button class="btn btn-primary btn-full" style="flex: 1;" onclick="showPaymentModal(${course.id})"><i class="fas fa-lock-open"></i> Enroll ${EduCurrency.format(course.price)}</button>
                </div>`;
        }

        return `
            <div class="course-card" data-category="${course.category}" data-edlevel="${course.edLevel || ''}">
                <div class="course-image" style="background: ${course.gradient};">
                    ${course.badge ? `<div class="course-badge">${escapeHtml(course.badge)}</div>` : ''}
                    <div class="course-category">${escapeHtml(getCategoryLabel(course.category))}</div>
                    ${course.edLevel ? `<div class="course-ed-level">${escapeHtml(getEdLevelLabel(course.edLevel))}</div>` : ''}
                </div>
                <div class="course-content">
                    <div class="course-rating">
                        <div class="stars">${starsHtml}</div>
                        <span>${course.rating} (${course.reviews.toLocaleString()})</span>
                    </div>
                    <h3>${escapeHtml(course.title)}</h3>
                    <p>${escapeHtml(course.description)}</p>
                    <div class="course-meta">
                        <span><i class="fas fa-clock"></i> ${course.hours} hours</span>
                        <span><i class="fas fa-signal"></i> ${course.level}</span>
                        <span><i class="fas ${getTeachingModeIcon(course.teachingMode)}"></i> ${getTeachingModeLabel(course.teachingMode)}</span>
                    </div>
                    <div class="course-footer">
                        <div class="course-teacher">
                            <div class="avatar avatar-sm ${course.teacherColor}">${course.teacherInitials}</div>
                            <span>${escapeHtml(course.teacher)}</span>
                        </div>
                        <div class="course-price">${priceHtml}</div>
                    </div>
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

function generateStars(rating) {
    let html = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="far fa-star"></i>';

    return html;
}

function getCategoryLabel(cat) {
    const labels = {
        'early-childhood': 'Early Childhood',
        'cbse': 'CBSE Board',
        'icse': 'ICSE / ISC',
        'state-board': 'State Board',
        'ib': 'IB Curriculum',
        'cambridge': 'Cambridge (IGCSE / A-Level)',
        'competitive': 'Competitive Exams',
        'undergraduate': 'Undergraduate',
        'postgraduate': 'Postgraduate',
        'phd': 'PhD & Research',
        'web-dev': 'Web Development',
        'data-science': 'Data Science',
        'mobile': 'Mobile Development',
        'ai-ml': 'AI & Machine Learning',
        'design': 'Design',
        'business': 'Business',
        'finance': 'Finance',
        'cloud': 'Cloud Computing',
        'cybersecurity': 'Cybersecurity',
        'healthcare': 'Healthcare',
        'law': 'Law',
        'language': 'Languages',
        'music-arts': 'Music & Arts',
        'govt-exam': 'Government Exams',
        'fitness': 'Fitness & Wellness',
        'engineering': 'Engineering',
        'personal-dev': 'Personal Development',
        'agriculture': 'Agriculture'
    };
    return labels[cat] || cat;
}

function getEdLevelLabel(lv) {
    const labels = {
        'playway': 'Playway / Pre-K',
        'nursery': 'Nursery',
        'kindergarten': 'Kindergarten',
        'primary': 'Primary (Class 1-5)',
        'middle': 'Middle (Class 6-8)',
        'secondary': 'Secondary (Class 9-10)',
        'senior-secondary': 'Senior Secondary (Class 11-12)',
        'competitive': 'Competitive Exams',
        'undergraduate': 'Undergraduate',
        'postgraduate': 'Postgraduate',
        'phd': 'PhD & Research',
        'professional': 'Professional / Skill-based'
    };
    return labels[lv] || lv;
}

function filterCourses() {
    const search = (document.getElementById('courseSearch')?.value || '').toLowerCase();

    // Gather checked category values
    const catCheckboxes = document.querySelectorAll('.filter-group-section.cat-filter .filter-checkbox input');
    const checkedCats = [...catCheckboxes].filter(cb => cb.checked && cb.value !== 'all').map(cb => cb.value);
    const allCatChecked = [...catCheckboxes].some(cb => cb.value === 'all' && cb.checked);

    // Gather checked education level values
    const lvlCheckboxes = document.querySelectorAll('.filter-group-section.lvl-filter .filter-checkbox input');
    const checkedLvls = [...lvlCheckboxes].filter(cb => cb.checked).map(cb => cb.value);

    // Gather checked level (difficulty) values
    const diffCheckboxes = document.querySelectorAll('.filter-group-section.diff-filter .filter-checkbox input');
    const checkedDiffs = [...diffCheckboxes].filter(cb => cb.checked).map(cb => cb.value.toLowerCase());

    // Gather price filters
    const priceCheckboxes = document.querySelectorAll('.filter-group-section.price-filter .filter-checkbox input');
    const checkedPrices = [...priceCheckboxes].filter(cb => cb.checked).map(cb => cb.value);

    // Gather rating filters
    const ratingCheckboxes = document.querySelectorAll('.filter-group-section.rating-filter .filter-checkbox input');
    const checkedRatings = [...ratingCheckboxes].filter(cb => cb.checked).map(cb => cb.value);

    let filtered = coursesData;

    if (search) {
        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(search) ||
            c.teacher.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search) ||
            getCategoryLabel(c.category).toLowerCase().includes(search) ||
            (c.edLevel && getEdLevelLabel(c.edLevel).toLowerCase().includes(search))
        );
    }

    if (checkedCats.length > 0 && !allCatChecked) {
        filtered = filtered.filter(c => checkedCats.includes(c.category));
    }

    if (checkedLvls.length > 0) {
        filtered = filtered.filter(c => c.edLevel && checkedLvls.includes(c.edLevel));
    }

    if (checkedDiffs.length > 0) {
        filtered = filtered.filter(c => checkedDiffs.includes(c.level.toLowerCase()));
    }

    if (checkedPrices.length > 0) {
        filtered = filtered.filter(c => {
            if (checkedPrices.includes('free') && c.price === 0) return true;
            if (checkedPrices.includes('paid') && c.price > 0) return true;
            return false;
        });
    }

    if (checkedRatings.length > 0) {
        const minRating = Math.min(...checkedRatings.map(r => parseFloat(r)));
        filtered = filtered.filter(c => c.rating >= minRating);
    }

    renderCourses(filtered);
}

function sortCourses() {
    const sortBy = document.getElementById('sortSelect')?.value;
    let sorted = [...coursesData];

    switch (sortBy) {
        case 'newest': sorted.reverse(); break;
        case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
        case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
        default: sorted.sort((a, b) => b.students - a.students);
    }

    renderCourses(sorted);
}

function clearFilters() {
    document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
    const searchInput = document.getElementById('courseSearch');
    if (searchInput) searchInput.value = '';
    renderCourses(coursesData);
}

function setView(view) {
    const grid = document.getElementById('coursesGrid');
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = '';
    }
}

/* ---- Demo Class Logic ---- */
function takeDemo(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn) {
        showNotification('Please log in to take a demo class.', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    const demos = JSON.parse(localStorage.getItem('edunova_demos') || '[]');
    const existing = demos.find(d => d.courseId === courseId && d.studentEmail === session.email);

    if (existing) {
        showNotification('You already used your free demo for this course. Please enroll to continue.', 'warning');
        return;
    }

    // Record demo
    demos.push({
        courseId: courseId,
        courseTitle: course.title,
        teacher: course.teacher,
        studentEmail: session.email,
        studentName: session.name,
        date: new Date().toISOString(),
        status: 'completed'
    });
    localStorage.setItem('edunova_demos', JSON.stringify(demos));

    showNotification(`Demo class started for "${course.title}"! You can enroll after the demo to continue. 🎓`, 'success');

    // Re-render to update buttons
    setTimeout(() => renderCourses(coursesData), 1000);
}

/* ---- Payment & Enrollment ---- */
function showPaymentModal(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn) {
        showNotification('Please log in to enroll.', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    const teacherShare = EduCurrency.format(course.price * TEACHER_SHARE);
    const platformShare = EduCurrency.format(course.price * PLATFORM_SHARE);

    // Create payment modal
    let modal = document.getElementById('paymentModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'paymentModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 480px;">
            <div class="modal-header">
                <h3><i class="fas fa-lock"></i> Secure Payment</h3>
                <button class="modal-close" onclick="closePaymentModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="payment-modal-body">
                <div class="payment-course-info">
                    <div class="course-image-mini" style="background: ${course.gradient};"></div>
                    <div>
                        <h4>${escapeHtml(course.title)}</h4>
                        <p>By ${escapeHtml(course.teacher)} · ${getTeachingModeLabel(course.teachingMode)}</p>
                    </div>
                </div>
                <div class="payment-breakdown">
                    <div class="payment-row">
                        <span>Course Price</span>
                        <strong>${EduCurrency.format(course.price)}</strong>
                    </div>
                    <div class="payment-row" style="font-size: 13px; color: var(--text-muted);">
                        <span>Teacher earnings (60%)</span>
                        <span>${teacherShare}</span>
                    </div>
                    <div class="payment-row" style="font-size: 13px; color: var(--text-muted);">
                        <span>Platform fee (40%)</span>
                        <span>${platformShare}</span>
                    </div>
                    <div class="payment-row payment-total">
                        <span>Total</span>
                        <strong>${EduCurrency.format(course.price)}</strong>
                    </div>
                </div>
                <form class="payment-form" onsubmit="processPayment(event, ${courseId})">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="4242 4242 4242 4242" maxlength="19" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry</label>
                            <input type="text" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label>CVC</label>
                            <input type="text" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-full">
                        <i class="fas fa-shield-alt"></i> Pay ${EduCurrency.format(course.price)}
                    </button>
                    <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 12px;">
                        <i class="fas fa-lock"></i> Secured with 256-bit SSL encryption (Demo)
                    </p>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePaymentModal();
    });
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.remove();
}

function processPayment(event, courseId) {
    event.preventDefault();

    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    const course = coursesData.find(c => c.id === courseId);
    if (!session || !course) return;

    // Record enrollment
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    enrollments.push({
        courseId: courseId,
        courseTitle: course.title,
        teacher: course.teacher,
        teacherEmail: course.teacherEmail,
        studentEmail: session.email,
        studentName: session.name,
        amount: course.price,
        teacherShare: (course.price * TEACHER_SHARE).toFixed(2),
        platformShare: (course.price * PLATFORM_SHARE).toFixed(2),
        teachingMode: course.teachingMode,
        date: new Date().toISOString(),
        status: 'active'
    });
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));

    // Record payment
    const payments = JSON.parse(localStorage.getItem('edunova_payments') || '[]');
    payments.push({
        courseId: courseId,
        courseTitle: course.title,
        teacher: course.teacher,
        studentEmail: session.email,
        amount: course.price,
        method: 'Credit Card',
        date: new Date().toISOString(),
        status: 'completed'
    });
    localStorage.setItem('edunova_payments', JSON.stringify(payments));

    closePaymentModal();
    showNotification(`Payment successful! You are now enrolled in "${course.title}" 🎉`, 'success');

    setTimeout(() => renderCourses(coursesData), 500);
}

function enrollCourse(courseId) {
    const session = JSON.parse(localStorage.getItem('edunova_session') || 'null');
    if (!session || !session.loggedIn) {
        showNotification('Please log in to enroll.', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    if (course.price > 0) {
        showPaymentModal(courseId);
        return;
    }

    // Free course — enroll directly
    const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
    enrollments.push({
        courseId: courseId,
        courseTitle: course.title,
        teacher: course.teacher,
        teacherEmail: course.teacherEmail,
        studentEmail: session.email,
        studentName: session.name,
        amount: 0,
        teacherShare: '0.00',
        platformShare: '0.00',
        teachingMode: course.teachingMode,
        date: new Date().toISOString(),
        status: 'active'
    });
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));

    showNotification(`Enrolled in "${course.title}" for free! 🎉`, 'success');
    setTimeout(() => renderCourses(coursesData), 500);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
