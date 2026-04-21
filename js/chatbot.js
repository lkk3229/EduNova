/* ============================================
   EduNova — AI Chatbot (EduBot)
   Privacy-first: never reveals personal,
   account, or financial information.
   ============================================ */

(function () {
    'use strict';

    /* ---- Confidentiality Guard ---- */
    const BLOCKED_KEYWORDS = [
        'password', 'passwd', 'secret', 'credit card', 'card number',
        'cvv', 'cvc', 'ssn', 'social security', 'bank account',
        'account number', 'routing number', 'tax id', 'pan number',
        'aadhaar', 'passport number', 'driver license',
        'my email', 'my phone', 'my address', 'my salary',
        'my earning', 'my revenue', 'my payment', 'my balance',
        'show me user', 'list all user', 'give me data',
        'admin password', 'teacher password', 'student password',
        'other student', 'other teacher', 'someone else',
        'other people', 'another user', 'hack', 'exploit',
        'bypass', 'injection', 'xss', 'sql inject'
    ];

    const CONFIDENTIAL_RESPONSE =
        "I'm sorry, I can't share personal, account, or financial information. " +
        "This includes passwords, emails, phone numbers, payment details, and other users' data. " +
        "For account-related queries, please contact support at **support@edunova.com**.";

    /* ---- Knowledge Base ---- */
    const KB = [
        {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'greetings'],
            response: "Hello! 👋 I'm **EduBot**, your EduNova assistant. How can I help you today?\n\nYou can ask me about:\n• Courses & enrollment\n• Demo classes\n• Payment & pricing\n• Teaching on EduNova\n• Live classes & meetings"
        },
        {
            patterns: ['how are you', 'how do you do', 'what\'s up'],
            response: "I'm doing great, thanks for asking! 😊 How can I help you with EduNova today?"
        },
        {
            patterns: ['what is edunova', 'about edunova', 'tell me about', 'what does edunova do'],
            response: "**EduNova** is a comprehensive online learning platform covering **Playway to PhD** and professional skills:\n\n• **120+ courses** across CBSE, ICSE, IB, Cambridge, State Boards & professional fields\n• **Students** can browse, take free demos, and enroll in paid courses\n• **Teachers** earn **60%** of every enrollment\n• **Live classes** with video, chat, whiteboard & screen sharing\n\nCategories include: School (all boards), Competitive Exams (JEE, NEET, UPSC, CAT, GATE), College (UG/PG/PhD), Tech, Design, Business, Finance, Healthcare, Law, Languages, Music, Fitness & more! 🚀"
        },
        {
            patterns: ['enroll', 'how to enroll', 'join course', 'sign up for course', 'register for course'],
            response: "To enroll in a course:\n\n1. Browse courses at the **Courses** page\n2. Click **Free Demo** to try one class for free\n3. If you like it, click **Enroll** and complete payment\n4. Access your enrolled courses from your **Student Dashboard**\n\nFree courses can be enrolled instantly — no payment needed!"
        },
        {
            patterns: ['demo', 'free demo', 'trial', 'try before', 'free class', 'demo class'],
            response: "Great question! Every student gets **1 free demo class per course**. Here's how it works:\n\n• Browse any course and click **\"Free Demo\"**\n• Attend the demo class at no cost\n• After the demo, you need to **pay to enroll** and continue learning\n• Each course allows only **one demo** — choose wisely! 🎓"
        },
        {
            patterns: ['price', 'cost', 'how much', 'pricing', 'fee', 'payment', 'pay'],
            response: "Course prices are set by teachers and approved by the admin. Here's what you should know:\n\n• Prices vary per course (from **free** to premium)\n• We accept **credit cards, debit cards, UPI** and more\n• Free courses are always available!\n\nYou can see the price on each course card before enrolling."
        },
        {
            patterns: ['revenue', 'split', 'earning', 'how much teacher earn', 'teacher share', '60', '40'],
            response: "EduNova uses a **60/40 revenue split**:\n\n• **60%** goes to the **teacher** for every enrollment\n• **40%** goes to the **platform** (admin)\n\nFor example, if a course costs $50:\n• Teacher earns **$30**\n• Platform retains **$20**\n\nThis applies to all paid courses and live sessions."
        },
        {
            patterns: ['teach', 'become teacher', 'how to teach', 'register as teacher', 'teaching', 'apply as teacher'],
            response: "Want to teach on EduNova? Here's how:\n\n1. Go to **Register as Teacher**\n2. Fill in your details: qualifications, experience, teaching style, and fee structure\n3. Choose your **teaching mode**: Individual (1-on-1), Group, or Recorded\n4. Set your **fee** (per hour, week, or month)\n5. Submit your application — admin reviews within 24 hours\n\nOnce approved, you can upload courses and start earning! 💰"
        },
        {
            patterns: ['upload course', 'create course', 'add course', 'submit course', 'publish course'],
            response: "To upload a course as a teacher:\n\n1. Go to your **Teacher Dashboard** → **Upload Course**\n2. Fill in the course details (title, description, category, level)\n3. Upload your **video content** and materials\n4. Set your **proposed price** and teaching mode\n5. Submit for **admin review**\n\nThe admin will approve and may adjust the final price. You earn **60%** of every enrollment!"
        },
        {
            patterns: ['individual', 'one on one', '1 on 1', 'private class', 'personal tutor', 'private tutor'],
            response: "Yes! Teachers on EduNova can offer **Individual (1-on-1) sessions**:\n\n• Personalized attention for the student\n• Live video class via our built-in meeting room\n• Teacher sets the schedule and fee\n• The same 60/40 revenue split applies\n\nLook for courses marked **\"1-on-1 Live\"** in the catalog!"
        },
        {
            patterns: ['group', 'group class', 'batch', 'multiple student', 'class size'],
            response: "Teachers can conduct **Group Classes** with multiple students:\n\n• Teacher sets the **maximum group size** (e.g., 30, 50, 100)\n• All enrolled students join the same live session\n• Includes video, chat, whiteboard, and screen sharing\n• More affordable per student!\n\nLook for courses marked **\"Group Live\"** in the catalog."
        },
        {
            patterns: ['live class', 'meeting', 'video call', 'zoom', 'video class'],
            response: "EduNova has a built-in **video meeting room** (like Zoom!) with:\n\n• 🎥 Video & audio conferencing\n• 💬 Real-time chat\n• 🖥️ Screen sharing\n• 📝 Interactive whiteboard\n• 📁 File sharing\n• 🔴 Recording\n• 👋 Hand raise & reactions\n\nTeachers schedule live classes, and enrolled students can join from their dashboard."
        },
        {
            patterns: ['schedule', 'timing', 'when is class', 'class time', 'timetable'],
            response: "Live class schedules are managed by teachers:\n\n• Teachers create schedules from their **Teacher Dashboard**\n• Students see upcoming classes in their **Student Dashboard → Upcoming Classes**\n• Each class shows the date, time, duration, and type (group or 1-on-1)\n• Click **\"Join Class\"** when it's time to attend!"
        },
        {
            patterns: ['certificate', 'certification', 'completion'],
            response: "EduNova tracks your learning progress! Certificates are awarded upon course completion. You can view your certificates in your Student Dashboard. 🎓"
        },
        {
            patterns: ['refund', 'money back', 'cancel enrollment'],
            response: "For refund requests, please contact our support team at **support@edunova.com**. Refund policies may vary by course. We aim to resolve all requests within 48 hours."
        },
        {
            patterns: ['certificate', 'certification', 'credential', 'completion'],
            response: "Upon completing any course, you'll receive a **Certificate of Completion** that includes:\n\n• **Certificate Name** — Certificate of Completion\n• **Provider** — EduNova — Learn Without Limits\n• **Unique Certification ID** (e.g., ENOVA-XXXX-XXXXX)\n• **Verification URL** for employers to verify\n• Student name, course title, instructor name & issue date\n\nGo to your **Student Dashboard → Certificates** tab to view, download, and share your earned certificates! 🏆"
        },
        {
            patterns: ['currency', 'rupee', 'dollar', 'price currency', 'change currency', 'payment currency'],
            response: "EduNova automatically detects your location and shows prices in your local currency! 🌍\n\nWe support **18 currencies** including INR, USD, EUR, GBP, AUD, CAD, and more.\n\nTo change your currency manually, use the **Currency selector** on the Courses page (in the filter sidebar). Your preference will be saved across sessions."
        },
        {
            patterns: ['contact', 'support', 'help', 'customer service', 'email'],
            response: "You can reach EduNova support through:\n\n• **Email**: support@edunova.com\n• **Contact form** on our homepage\n• This chatbot for general questions!\n\nWe typically respond within 24 hours. 📧"
        },
        {
            patterns: ['admin', 'approve', 'course approval', 'review course'],
            response: "Course approval process:\n\n1. Teacher submits a course with a **proposed price**\n2. Admin reviews the course content and pricing\n3. Admin can **approve** (with the same or adjusted price) or **reject**\n4. Once approved, the course goes live on the catalog\n\nBoth admin and teacher collaborate on final pricing — it's fair for everyone!"
        },
        {
            patterns: ['thank', 'thanks', 'thank you', 'appreciate'],
            response: "You're welcome! 😊 Happy to help. If you have any more questions, just ask!"
        },
        {
            patterns: ['bye', 'goodbye', 'see you', 'exit', 'close'],
            response: "Goodbye! 👋 Happy learning on EduNova. Come back anytime you need help!"
        },
        /* ---- Education level / board questions ---- */
        {
            patterns: ['playway', 'pre-k', 'nursery', 'kindergarten', 'preschool', 'toddler', 'kg class'],
            response: "We have courses for the youngest learners! 🧒\n\n• **Playway**: ABCs, numbers, colors, art & craft\n• **Nursery**: Phonics & early reading\n• **Kindergarten**: Math foundations, EVS & GK\n\nAll taught with fun animations and interactive activities. Some are even **free**!"
        },
        {
            patterns: ['cbse', 'ncert', 'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6', 'class 7', 'class 8', 'class 9', 'class 10', 'class 11', 'class 12', 'board exam', 'board preparation'],
            response: "We have **complete CBSE courses** from Class 1 to Class 12:\n\n• **Primary (1-5)**: English, Math, Science, SST, Hindi\n• **Middle (6-8)**: Math, Science (PCB), English, Social Science\n• **Secondary (9-10)**: Board exam prep — Math, Science, English, SST\n• **Senior Sec (11-12)**: Physics, Chemistry, Math, Biology, Accounts, CS\n\nAll aligned with **NCERT syllabus** and board exam patterns! 📚"
        },
        {
            patterns: ['icse', 'isc', 'selina', 'ml aggarwal', 'cisce'],
            response: "ICSE/ISC board courses available:\n\n• **ICSE Class 9-10**: Mathematics, Physics, Chemistry, English\n• **ISC Class 11-12**: Physics, Mathematics\n\nBased on Selina & ML Aggarwal textbooks with detailed solutions!"
        },
        {
            patterns: ['state board', 'maharashtra board', 'up board', 'tamil nadu', 'ssc board'],
            response: "We cover **State Board** courses:\n\n• **Maharashtra SSC**: Class 10 Math & Science\n• **UP Board**: Class 12 Physics\n• **Tamil Nadu Board**: Class 10 Mathematics\n\nMore states being added regularly! Filter by \"State Board\" in the courses page."
        },
        {
            patterns: ['ib', 'international baccalaureate', 'myp', 'ib dp', 'ib diploma'],
            response: "IB Curriculum courses:\n\n• **MYP**: Mathematics (Years 4-5)\n• **IB DP**: Math Analysis & Approaches (HL), Physics (SL & HL), English A\n\nIncludes IA guidance and past paper practice! 🌍"
        },
        {
            patterns: ['igcse', 'cambridge', 'a-level', 'a level', 'cie', 'caie'],
            response: "Cambridge International courses:\n\n• **IGCSE**: Mathematics (0580), Physics (0625)\n• **A-Level**: Mathematics (9709), Chemistry (9701)\n\nWith worked past papers and examiner insights! 🎓"
        },
        {
            patterns: ['jee', 'iit', 'jee main', 'jee advanced', 'engineering entrance'],
            response: "Complete **JEE Main & Advanced** preparation:\n\n• **Physics** — Prof. Raj Patel (120 hrs)\n• **Chemistry** — Dr. Meena Gupta (110 hrs)\n• **Mathematics** — Mr. Suresh Iyer (115 hrs)\n\nProblem-solving strategies, PYQs, and mock tests included! 🏆"
        },
        {
            patterns: ['neet', 'medical entrance', 'mbbs entrance', 'aiims'],
            response: "NEET preparation courses:\n\n• **Biology (Botany + Zoology)** — 100 hours\n• **Physics + Chemistry Combined** — 90 hours\n\nNCERT line-by-line + previous year questions. 28,000+ students enrolled! 🩺"
        },
        {
            patterns: ['upsc', 'civil service', 'ias', 'ips'],
            response: "**UPSC CSE** complete preparation:\n\n• General Studies — Prelims & Mains (150 hours)\n• Polity, History, Geography, Economy, Environment, Ethics\n• Essay writing & answer structuring\n\nTaught by Prof. Arun Mehta with strategy sessions!"
        },
        {
            patterns: ['cat', 'mba entrance', 'iim', 'gmat'],
            response: "MBA entrance prep:\n\n• **CAT** — Quant, VARC, DILR (80 hours)\n• Mock tests and shortcut techniques\n\nPerfect for IIM aspirants!"
        },
        {
            patterns: ['gate', 'psu', 'gate exam'],
            response: "**GATE Computer Science & IT** — 90 hours:\n\n• Data Structures, Algorithms, OS, DBMS, Networks\n• Theory of Computation, Compiler Design\n• Previous year papers & mock tests"
        },
        {
            patterns: ['gre', 'toefl', 'ielts', 'study abroad'],
            response: "Study abroad exam prep:\n\n• **IELTS** — Band 7+ strategy (36 hrs) — Listening, Reading, Writing, Speaking\n• **GRE** — Quant & Verbal (50 hrs) — 320+ score strategy\n\nMock tests included with both!"
        },
        {
            patterns: ['ssc', 'bank', 'ibps', 'sbi', 'railway', 'rrb', 'government job', 'govt job', 'ctet', 'tet'],
            response: "Government exam preparation:\n\n• **SSC CGL** — Quant, English, Reasoning, GK (80 hrs)\n• **Bank PO/Clerk** — IBPS/SBI Prelims & Mains (72 hrs)\n• **Railway RRB** — NTPC & Group D (60 hrs)\n• **CTET/TET** — Paper 1 & 2 combined (56 hrs)\n\nAll with mock tests! 📋"
        },
        {
            patterns: ['undergraduate', 'btech', 'b.tech', 'bsc', 'b.sc', 'bcom', 'b.com', 'bba', 'ba', 'college', 'degree'],
            response: "Undergraduate courses:\n\n• **B.Tech**: Engineering Math, Data Structures & Algorithms, Electrical Engineering\n• **B.Sc**: Organic Chemistry\n• **B.Com**: Financial & Cost Accounting\n• **BA**: Political Science\n• **BBA**: Management & Marketing\n\nUniversity exam-oriented content! 🎓"
        },
        {
            patterns: ['postgraduate', 'mtech', 'msc', 'masters', 'mba course', 'ma course', 'm.tech', 'm.sc'],
            response: "Postgraduate courses:\n\n• **M.Tech**: Machine Learning & Deep Learning\n• **MBA**: Strategic Management & Leadership\n• **M.Sc**: Advanced Quantum Mechanics\n• **MA**: Research Methodology & Academic Writing\n\nResearch-grade content for master\'s students!"
        },
        {
            patterns: ['phd', 'doctorate', 'research', 'thesis', 'dissertation', 'journal', 'publication'],
            response: "PhD & Research courses:\n\n• **Research Paper Writing** & publication strategy\n• **Advanced Statistical Methods** with R & SPSS\n• **Systematic Literature Review** & meta-analysis\n\n1-on-1 guidance available for doctoral students! 📖"
        },
        {
            patterns: ['programming', 'coding', 'web development', 'software', 'python', 'javascript', 'react', 'node'],
            response: "Technology & Programming courses:\n\n• **Full-Stack Web Development** — HTML, CSS, JS, React, Node.js\n• **Python for Data Science** — Pandas, NumPy, Matplotlib\n• **Flutter & Dart** — 15 mobile apps\n• **Blockchain & Web3** — Solidity, DApps\n• **DevOps** — Docker, Kubernetes, CI/CD\n• **SQL & Databases** — MySQL, PostgreSQL\n• **Intro to Programming** — **FREE!**\n\nFrom beginner to advanced! 💻"
        },
        {
            patterns: ['finance', 'accounting', 'stock', 'trading', 'tally', 'gst', 'investment'],
            response: "Finance & Accounting courses:\n\n• **Financial Modeling & Investment Banking** — DCF, LBO, M&A\n• **Stock Market Trading** & Technical Analysis\n• **Tally Prime & GST** — Complete Accounting\n\nFrom Tally basics to Wall Street finance! 💰"
        },
        {
            patterns: ['healthcare', 'medical', 'nursing', 'pharmacy', 'anatomy', 'pharmacology'],
            response: "Healthcare courses:\n\n• **Medical Terminology & Anatomy** — for nursing & allied health\n• **Clinical Pharmacology** — drug classes & interactions\n• **Nursing: Patient Care** — clinical skills for GNM/BSc Nursing"
        },
        {
            patterns: ['law', 'legal', 'llb', 'clat', 'constitution', 'contract law'],
            response: "Law courses:\n\n• **Indian Constitution** & Constitutional Law\n• **Contract Law** & Business Law\n• **CLAT Preparation** — complete entrance course\n\nFor LLB students and CLAT aspirants! ⚖️"
        },
        {
            patterns: ['language', 'french', 'german', 'japanese', 'sanskrit', 'foreign language'],
            response: "Language courses:\n\n• **English Speaking** & Communication — $14.99\n• **IELTS** — Band 7+ strategy\n• **French** — Beginner to B2 (DELF prep)\n• **German** — A1 to B1 (Goethe prep)\n• **Japanese** — JLPT N5 to N3\n• **Sanskrit** — Beginner to Intermediate\n\nLearn a new language today! 🌐"
        },
        {
            patterns: ['music', 'guitar', 'piano', 'singing', 'art', 'drawing', 'photography', 'classical'],
            response: "Music & Arts courses:\n\n• **Guitar** — Beginner to Advanced\n• **Indian Classical Vocal** — Hindustani & Carnatic\n• **Piano / Keyboard** — Complete course\n• **Drawing & Sketching** — Pencil & Charcoal\n• **Photography** — DSLR & Mobile\n\nExpress your creative side! 🎵🎨"
        },
        {
            patterns: ['yoga', 'meditation', 'fitness', 'nutrition', 'diet', 'wellness', 'health'],
            response: "Fitness & Wellness:\n\n• **Yoga & Meditation** — Beginner to Advanced (group classes)\n• **Nutrition & Diet Planning** — certified course\n\nTransform your body and mind! 🧘"
        },
        {
            patterns: ['engineering', 'autocad', 'solidworks', 'mechanical', 'civil', 'electrical', 'iot'],
            response: "Engineering courses:\n\n• **AutoCAD** & Civil Engineering Drawing\n• **SolidWorks & FEA** — Mechanical Engineering\n• **Power Systems** — Electrical Engineering\n• **IoT** — Arduino & Raspberry Pi projects\n\nPractical, hands-on learning! ⚙️"
        },
        {
            patterns: ['soft skill', 'public speaking', 'interview', 'resume', 'personal development', 'leadership', 'productivity'],
            response: "Personal Development courses:\n\n• **Public Speaking** & Presentations\n• **Time Management** — **FREE!**\n• **Interview Prep** & Resume Building\n• **Emotional Intelligence** & Leadership\n\nBoost your career! 🚀"
        },
        {
            patterns: ['all courses', 'full list', 'how many courses', 'total courses', 'course catalog'],
            response: "EduNova offers **120+ courses** across:\n\n• 🏫 **School**: Playway, Nursery, KG, Class 1-12 (CBSE, ICSE, State, IB, Cambridge)\n• 📝 **Competitive**: JEE, NEET, UPSC, CAT, GATE, GRE, IELTS, SSC, Banking\n• 🎓 **College**: B.Tech, B.Sc, B.Com, BA, BBA, M.Tech, MBA, M.Sc, MA, PhD\n• 💻 **Tech**: Web Dev, AI/ML, Mobile, Cloud, Cybersecurity, Data Science\n• 🎨 **Creative**: Design, Music, Drawing, Photography, Video Editing\n• 💼 **Professional**: Finance, Business, Law, Healthcare, Engineering, Languages\n• 🧘 **Wellness**: Yoga, Nutrition, Fitness\n\nUse the **filters** on the Courses page to find exactly what you need!"
        }
    ];

    const FALLBACK_RESPONSE =
        "I'm not sure I understand that. Here are some things I can help with:\n\n" +
        "• **Courses** — Playway to PhD, all boards, all fields\n" +
        "• **Boards** — CBSE, ICSE, IB, Cambridge, State Boards\n" +
        "• **Competitive exams** — JEE, NEET, UPSC, CAT, GATE, IELTS\n" +
        "• **Professional** — Tech, Design, Finance, Healthcare, Law\n" +
        "• **Demo classes** — how free demos work\n\n" +
        "Try asking *\"What CBSE courses are available?\"* or *\"How does JEE prep work?\"*";

    /* ---- Chatbot Engine ---- */
    function isConfidentialQuery(text) {
        const lower = text.toLowerCase();
        return BLOCKED_KEYWORDS.some(keyword => lower.includes(keyword));
    }

    function findBestMatch(text) {
        const lower = text.toLowerCase().trim();

        // Confidentiality check first
        if (isConfidentialQuery(lower)) {
            return CONFIDENTIAL_RESPONSE;
        }

        let bestMatch = null;
        let bestScore = 0;

        for (const entry of KB) {
            for (const pattern of entry.patterns) {
                if (lower.includes(pattern)) {
                    const score = pattern.length;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = entry.response;
                    }
                }
            }
        }

        return bestMatch || FALLBACK_RESPONSE;
    }

    function formatMarkdown(text) {
        // Bold
        let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Newlines
        html = html.replace(/\n/g, '<br>');
        // Bullet points
        html = html.replace(/• /g, '<span class="bot-bullet">•</span> ');
        return html;
    }

    /* ---- Inject Chatbot UI ---- */
    function createChatbotUI() {
        // Floating button
        const fab = document.createElement('div');
        fab.className = 'chatbot-fab';
        fab.id = 'chatbotFab';
        fab.innerHTML = '<i class="fas fa-robot"></i>';
        fab.setAttribute('title', 'Chat with EduBot');

        // Chat window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        chatWindow.id = 'chatbotWindow';
        chatWindow.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
                    <div>
                        <h4>EduBot</h4>
                        <span class="chatbot-status"><span class="chatbot-status-dot"></span> Online</span>
                    </div>
                </div>
                <div class="chatbot-header-actions">
                    <button class="chatbot-header-btn" id="chatbotClear" title="Clear chat"><i class="fas fa-trash-alt"></i></button>
                    <button class="chatbot-header-btn" id="chatbotClose" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="chatbot-msg chatbot-msg-bot">
                    <div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div>
                    <div class="chatbot-msg-bubble">
                        Hi! 👋 I'm <strong>EduBot</strong>, your EduNova assistant.<br><br>
                        I can help with questions about courses, enrollment, demos, teaching, payments, and more.<br><br>
                        <span class="chatbot-privacy-note"><i class="fas fa-shield-alt"></i> I never share personal or account information.</span>
                    </div>
                </div>
                <div class="chatbot-quick-actions" id="chatbotQuickActions">
                    <button class="chatbot-quick-btn" data-q="What courses do you offer?">All courses</button>
                    <button class="chatbot-quick-btn" data-q="What CBSE courses are available?">CBSE Board</button>
                    <button class="chatbot-quick-btn" data-q="How does JEE preparation work?">JEE / NEET</button>
                    <button class="chatbot-quick-btn" data-q="How do I enroll in a course?">How to enroll?</button>
                    <button class="chatbot-quick-btn" data-q="How does the free demo work?">Free demo?</button>
                    <button class="chatbot-quick-btn" data-q="How do I become a teacher?">Become a teacher</button>
                    <button class="chatbot-quick-btn" data-q="Tell me about programming courses">Programming</button>
                </div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask me anything..." autocomplete="off" maxlength="500">
                <button class="chatbot-send-btn" id="chatbotSend"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(chatWindow);

        // Events
        fab.addEventListener('click', toggleChatbot);
        document.getElementById('chatbotClose').addEventListener('click', toggleChatbot);
        document.getElementById('chatbotSend').addEventListener('click', handleSend);
        document.getElementById('chatbotClear').addEventListener('click', clearChat);
        document.getElementById('chatbotInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Quick action buttons
        document.querySelectorAll('.chatbot-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const q = btn.getAttribute('data-q');
                document.getElementById('chatbotInput').value = q;
                handleSend();
                // Hide quick actions after first use
                const qa = document.getElementById('chatbotQuickActions');
                if (qa) qa.style.display = 'none';
            });
        });
    }

    function toggleChatbot() {
        const win = document.getElementById('chatbotWindow');
        const fab = document.getElementById('chatbotFab');
        win.classList.toggle('open');
        fab.classList.toggle('active');

        if (win.classList.contains('open')) {
            document.getElementById('chatbotInput').focus();
        }
    }

    function handleSend() {
        const input = document.getElementById('chatbotInput');
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';

        // Show typing indicator
        const typingId = showTyping();

        // Simulate response delay
        setTimeout(() => {
            removeTyping(typingId);
            const response = findBestMatch(text);
            appendMessage('bot', response);
        }, 600 + Math.random() * 800);
    }

    function appendMessage(sender, text) {
        const container = document.getElementById('chatbotMessages');
        const msg = document.createElement('div');
        msg.className = `chatbot-msg chatbot-msg-${sender}`;

        if (sender === 'bot') {
            msg.innerHTML = `
                <div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="chatbot-msg-bubble">${formatMarkdown(text)}</div>
            `;
        } else {
            msg.innerHTML = `
                <div class="chatbot-msg-bubble">${escapeHtml(text)}</div>
            `;
        }

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('chatbotMessages');
        const typing = document.createElement('div');
        typing.className = 'chatbot-msg chatbot-msg-bot chatbot-typing';
        typing.id = 'chatbotTyping';
        typing.innerHTML = `
            <div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="chatbot-msg-bubble chatbot-typing-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return typing.id;
    }

    function removeTyping() {
        const el = document.getElementById('chatbotTyping');
        if (el) el.remove();
    }

    function clearChat() {
        const container = document.getElementById('chatbotMessages');
        container.innerHTML = `
            <div class="chatbot-msg chatbot-msg-bot">
                <div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="chatbot-msg-bubble">
                    Chat cleared. How can I help you? 😊<br>
                    <span class="chatbot-privacy-note"><i class="fas fa-shield-alt"></i> I never share personal or account information.</span>
                </div>
            </div>
        `;
        const qa = document.getElementById('chatbotQuickActions');
        if (qa) qa.style.display = 'flex';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /* ---- Init on DOM ready ---- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatbotUI);
    } else {
        createChatbotUI();
    }
})();
