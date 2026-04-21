/* ============================================
   EduNova — Certificate Generation
   Generates a downloadable PDF-style certificate
   rendered on an HTML5 Canvas.
   ============================================ */

(function () {
    'use strict';

    /**
     * Generate a unique certification ID.
     */
    function generateCertId() {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        return 'ENOVA-' + ts + '-' + rand;
    }

    /**
     * Generate a certification URL.
     */
    function generateCertURL(certId) {
        return 'https://edunova.com/verify/' + certId;
    }

    /**
     * Mark a course as completed and issue a certificate.
     * Stores in localStorage under edunova_certificates.
     */
    function issueCertificate(enrollment) {
        const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');

        // Check if already issued
        const existing = certs.find(c =>
            c.courseId === enrollment.courseId && c.studentEmail === enrollment.studentEmail
        );
        if (existing) return existing;

        const certId = generateCertId();
        const cert = {
            certId: certId,
            certURL: generateCertURL(certId),
            certificateName: 'Certificate of Completion',
            providerName: 'EduNova — Learn Without Limits',
            studentName: enrollment.studentName,
            studentEmail: enrollment.studentEmail,
            courseId: enrollment.courseId,
            courseTitle: enrollment.courseTitle,
            teacher: enrollment.teacher,
            teacherEmail: enrollment.teacherEmail,
            teachingMode: enrollment.teachingMode,
            issueDate: new Date().toISOString(),
            completionDate: new Date().toISOString(),
            status: 'issued'
        };

        certs.push(cert);
        localStorage.setItem('edunova_certificates', JSON.stringify(certs));

        // Mark enrollment as completed
        const enrollments = JSON.parse(localStorage.getItem('edunova_enrollments') || '[]');
        const idx = enrollments.findIndex(e =>
            e.courseId === enrollment.courseId && e.studentEmail === enrollment.studentEmail
        );
        if (idx !== -1) {
            enrollments[idx].status = 'completed';
            enrollments[idx].completionDate = cert.completionDate;
            enrollments[idx].certId = certId;
            localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));
        }

        return cert;
    }

    /**
     * Get all certificates for a student.
     */
    function getStudentCertificates(email) {
        const certs = JSON.parse(localStorage.getItem('edunova_certificates') || '[]');
        return certs.filter(c => c.studentEmail === email);
    }

    /**
     * Render and download the certificate as a PNG image.
     */
    function downloadCertificate(cert) {
        const canvas = document.createElement('canvas');
        canvas.width = 1400;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        // ---- Background ----
        const bgGrad = ctx.createLinearGradient(0, 0, 1400, 1000);
        bgGrad.addColorStop(0, '#0f0c29');
        bgGrad.addColorStop(0.5, '#1a1a3e');
        bgGrad.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1400, 1000);

        // ---- Decorative border ----
        const borderGrad = ctx.createLinearGradient(0, 0, 1400, 1000);
        borderGrad.addColorStop(0, '#667eea');
        borderGrad.addColorStop(1, '#764ba2');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, 1340, 940);

        // Inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(45, 45, 1310, 910);

        // ---- Corner decorations ----
        drawCornerDecor(ctx, 30, 30, 1, 1);
        drawCornerDecor(ctx, 1370, 30, -1, 1);
        drawCornerDecor(ctx, 30, 970, 1, -1);
        drawCornerDecor(ctx, 1370, 970, -1, -1);

        // ---- Logo / Provider ----
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎓 EduNova', 700, 90);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Learn Without Limits', 700, 115);

        // ---- Certificate Title ----
        const titleGrad = ctx.createLinearGradient(300, 150, 1100, 200);
        titleGrad.addColorStop(0, '#667eea');
        titleGrad.addColorStop(1, '#a78bfa');
        ctx.fillStyle = titleGrad;
        ctx.font = 'bold 44px "Segoe UI", Georgia, serif';
        ctx.fillText('CERTIFICATE OF COMPLETION', 700, 190);

        // ---- Divider ----
        const divGrad = ctx.createLinearGradient(400, 0, 1000, 0);
        divGrad.addColorStop(0, 'rgba(102, 126, 234, 0)');
        divGrad.addColorStop(0.5, 'rgba(102, 126, 234, 0.8)');
        divGrad.addColorStop(1, 'rgba(102, 126, 234, 0)');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(350, 215);
        ctx.lineTo(1050, 215);
        ctx.stroke();

        // ---- "This is to certify that" ----
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('This is to certify that', 700, 270);

        // ---- Student Name ----
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Georgia, "Times New Roman", serif';
        ctx.fillText(cert.studentName || 'Student', 700, 330);

        // ---- Underline under name ----
        const nameWidth = ctx.measureText(cert.studentName || 'Student').width;
        const ulGrad = ctx.createLinearGradient(700 - nameWidth / 2, 0, 700 + nameWidth / 2, 0);
        ulGrad.addColorStop(0, 'rgba(102, 126, 234, 0)');
        ulGrad.addColorStop(0.3, '#667eea');
        ulGrad.addColorStop(0.7, '#764ba2');
        ulGrad.addColorStop(1, 'rgba(102, 126, 234, 0)');
        ctx.strokeStyle = ulGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(700 - nameWidth / 2 - 20, 345);
        ctx.lineTo(700 + nameWidth / 2 + 20, 345);
        ctx.stroke();

        // ---- "has successfully completed" ----
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('has successfully completed the course', 700, 395);

        // ---- Course Title ----
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        // Wrap long course titles
        const maxWidth = 1000;
        const courseTitle = cert.courseTitle || 'Course';
        if (ctx.measureText(courseTitle).width > maxWidth) {
            ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        }
        wrapText(ctx, courseTitle, 700, 445, maxWidth, 34);

        // ---- Instructor ----
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Taught by: ' + (cert.teacher || 'Instructor'), 700, 510);

        // ---- Details grid ----
        const detailY = 580;
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'left';

        // Column 1 - Certificate ID
        ctx.fillText('Certificate ID', 120, detailY);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 15px "Segoe UI", monospace';
        ctx.fillText(cert.certId, 120, detailY + 22);

        // Column 2 - Issue Date
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Issue Date', 460, detailY);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(new Date(cert.issueDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        }), 460, detailY + 22);

        // Column 3 - Provider
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Issued by', 780, detailY);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(cert.providerName, 780, detailY + 22);

        // Column 4 - Verification URL
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Verify at', 700, detailY + 70);
        ctx.fillStyle = '#667eea';
        ctx.font = '14px "Segoe UI", monospace';
        ctx.fillText(cert.certURL, 700, detailY + 90);

        // ---- Signatures ----
        const sigY = 770;
        ctx.textAlign = 'center';

        // Left signature — Instructor
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(200, sigY);
        ctx.lineTo(500, sigY);
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(cert.teacher || 'Instructor', 350, sigY + 25);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Course Instructor', 350, sigY + 45);

        // Right signature — EduNova Admin
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(900, sigY);
        ctx.lineTo(1200, sigY);
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText('EduNova Administration', 1050, sigY + 25);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Platform Director', 1050, sigY + 45);

        // ---- Footer ----
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '11px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('This certificate is digitally issued by EduNova. Verify authenticity at ' + cert.certURL, 700, 940);

        // ---- Download ----
        const link = document.createElement('a');
        link.download = 'EduNova_Certificate_' + cert.certId + '.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }

    function drawCornerDecor(ctx, x, y, dx, dy) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 40 * dy);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 40 * dx, y);
        ctx.stroke();
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        if (ctx.measureText(text).width <= maxWidth) {
            ctx.fillText(text, x, y);
            return;
        }
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxWidth && line) {
                ctx.fillText(line.trim(), x, currentY);
                line = word + ' ';
                currentY += lineHeight;
            } else {
                line = test;
            }
        }
        if (line.trim()) ctx.fillText(line.trim(), x, currentY);
    }

    /**
     * Show a certificate preview modal.
     */
    function showCertificateModal(cert) {
        let modal = document.getElementById('certModal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'certModal';
        modal.innerHTML = `
            <div class="modal-card cert-modal-card">
                <div class="modal-header">
                    <h3><i class="fas fa-certificate"></i> Certificate of Completion</h3>
                    <button class="modal-close" onclick="document.getElementById('certModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cert-preview">
                    <div class="cert-preview-inner">
                        <div class="cert-badge-icon"><i class="fas fa-award"></i></div>
                        <h2 class="cert-title">Certificate of Completion</h2>
                        <p class="cert-subtitle">This is to certify that</p>
                        <h3 class="cert-student-name">${escapeHtml(cert.studentName)}</h3>
                        <p class="cert-subtitle">has successfully completed</p>
                        <h4 class="cert-course-name">${escapeHtml(cert.courseTitle)}</h4>
                        <p class="cert-instructor">Taught by <strong>${escapeHtml(cert.teacher)}</strong></p>

                        <div class="cert-details-grid">
                            <div class="cert-detail">
                                <span class="cert-detail-label">Certificate ID</span>
                                <span class="cert-detail-value">${escapeHtml(cert.certId)}</span>
                            </div>
                            <div class="cert-detail">
                                <span class="cert-detail-label">Issue Date</span>
                                <span class="cert-detail-value">${new Date(cert.issueDate).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}</span>
                            </div>
                            <div class="cert-detail">
                                <span class="cert-detail-label">Provider</span>
                                <span class="cert-detail-value">${escapeHtml(cert.providerName)}</span>
                            </div>
                            <div class="cert-detail">
                                <span class="cert-detail-label">Verification URL</span>
                                <span class="cert-detail-value cert-url">${escapeHtml(cert.certURL)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cert-actions">
                    <button class="btn btn-primary" onclick="EduCert.download(EduCert._lastCert)">
                        <i class="fas fa-download"></i> Download Certificate
                    </button>
                    <button class="btn btn-outline" onclick="document.getElementById('certModal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /* ---- Expose globally ---- */
    window.EduCert = {
        issue: issueCertificate,
        getForStudent: getStudentCertificates,
        download: downloadCertificate,
        show: function (cert) {
            EduCert._lastCert = cert;
            showCertificateModal(cert);
        },
        _lastCert: null
    };

})();
