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

const coursesData = [
    /* ================================================
       SECTION 1 — EARLY CHILDHOOD (Playway / Pre-K)
       ================================================ */
    { id: 1, title: 'Playway: Fun with ABCs & Numbers', category: 'early-childhood', edLevel: 'playway',
      teacher: 'Ms. Priya Sharma', teacherInitials: 'PS', teacherColor: 'bg-pink', teacherEmail: 'priya@email.com',
      rating: 4.9, reviews: 1820, students: 5400, hours: 12, level: 'Beginner',
      price: 9.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.rose, badge: 'Bestseller',
      description: 'Animated lessons for toddlers — letters, numbers, colors, shapes & nursery rhymes.' },
    { id: 2, title: 'Playway: Creative Art & Craft for Tiny Hands', category: 'early-childhood', edLevel: 'playway',
      teacher: 'Ms. Priya Sharma', teacherInitials: 'PS', teacherColor: 'bg-pink', teacherEmail: 'priya@email.com',
      rating: 4.8, reviews: 980, students: 3100, hours: 8, level: 'Beginner',
      price: 7.99, teachingMode: 'group', maxGroupSize: 20, allowDemo: true,
      gradient: G.coral, badge: '',
      description: 'Paper craft, finger painting, clay modeling — fine motor skill development for ages 3-5.' },
    { id: 3, title: 'Nursery: Phonics & Early Reading', category: 'early-childhood', edLevel: 'nursery',
      teacher: 'Mrs. Anita Desai', teacherInitials: 'AD', teacherColor: 'bg-purple', teacherEmail: 'anita@email.com',
      rating: 4.7, reviews: 1340, students: 4200, hours: 14, level: 'Beginner',
      price: 12.99, teachingMode: 'hybrid', maxGroupSize: 25, allowDemo: true,
      gradient: G.purple, badge: 'Popular',
      description: 'Phonics-based reading readiness — blending, sight words & simple sentences for ages 4-6.' },
    { id: 4, title: 'Kindergarten: Math & Logic Foundations', category: 'early-childhood', edLevel: 'kindergarten',
      teacher: 'Mrs. Anita Desai', teacherInitials: 'AD', teacherColor: 'bg-purple', teacherEmail: 'anita@email.com',
      rating: 4.8, reviews: 1560, students: 4800, hours: 16, level: 'Beginner',
      price: 14.99, teachingMode: 'group', maxGroupSize: 30, allowDemo: true,
      gradient: G.sky, badge: '',
      description: 'Counting, addition, subtraction, patterns & logical thinking for KG students.' },
    { id: 5, title: 'KG: Environmental Studies & General Knowledge', category: 'early-childhood', edLevel: 'kindergarten',
      teacher: 'Ms. Priya Sharma', teacherInitials: 'PS', teacherColor: 'bg-pink', teacherEmail: 'priya@email.com',
      rating: 4.6, reviews: 670, students: 2100, hours: 10, level: 'Beginner',
      price: 0, teachingMode: 'recorded', maxGroupSize: null, allowDemo: false,
      gradient: G.green, badge: 'Free',
      description: 'Animals, plants, seasons, good habits & the world around us — free for all kids!' },

    /* ================================================
       SECTION 2 — PRIMARY SCHOOL (Class 1–5) — CBSE
       ================================================ */
    { id: 6, title: 'CBSE Class 1-2: English — Reading & Writing', category: 'cbse', edLevel: 'primary',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.7, reviews: 2100, students: 6500, hours: 20, level: 'Beginner',
      price: 14.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.teal, badge: 'Bestseller',
      description: 'Grammar, comprehension, story writing & vocabulary aligned with NCERT Class 1-2 syllabus.' },
    { id: 7, title: 'CBSE Class 1-2: Mathematics — Fun with Numbers', category: 'cbse', edLevel: 'primary',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.8, reviews: 2450, students: 7200, hours: 22, level: 'Beginner',
      price: 14.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.blue, badge: '',
      description: 'Number sense, addition, subtraction, multiplication basics — NCERT aligned for Class 1-2.' },
    { id: 8, title: 'CBSE Class 3-5: Science — Exploring Nature', category: 'cbse', edLevel: 'primary',
      teacher: 'Ms. Deepa Joshi', teacherInitials: 'DJ', teacherColor: 'bg-cyan', teacherEmail: 'deepa@email.com',
      rating: 4.8, reviews: 1890, students: 5600, hours: 28, level: 'Beginner',
      price: 19.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.cyan, badge: 'Popular',
      description: 'Plants, animals, human body, materials, weather — NCERT Science for Class 3-5 with experiments.' },
    { id: 9, title: 'CBSE Class 3-5: Mathematics — Problem Solving', category: 'cbse', edLevel: 'primary',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.9, reviews: 3100, students: 8900, hours: 32, level: 'Beginner',
      price: 19.99, teachingMode: 'hybrid', maxGroupSize: 50, allowDemo: true,
      gradient: G.indigo, badge: 'Bestseller',
      description: 'Fractions, geometry, measurement, data handling — complete NCERT Math for Class 3-5.' },
    { id: 10, title: 'CBSE Class 3-5: Social Studies & Hindi', category: 'cbse', edLevel: 'primary',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.6, reviews: 1200, students: 3800, hours: 26, level: 'Beginner',
      price: 16.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'History, geography, civics & Hindi grammar — NCERT combined course for Class 3-5.' },

    /* ================================================
       SECTION 3 — MIDDLE SCHOOL (Class 6–8) — CBSE
       ================================================ */
    { id: 11, title: 'CBSE Class 6-8: Mathematics Complete', category: 'cbse', edLevel: 'middle',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 4200, students: 12000, hours: 56, level: 'Intermediate',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.orange, badge: 'Bestseller',
      description: 'Algebra, geometry, ratio, integers, data handling — complete NCERT Math Class 6-8.' },
    { id: 12, title: 'CBSE Class 6-8: Science (Physics, Chemistry, Bio)', category: 'cbse', edLevel: 'middle',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 3800, students: 10500, hours: 52, level: 'Intermediate',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.pink, badge: 'Popular',
      description: 'Light, electricity, chemical reactions, cell biology — NCERT Science for Class 6-8.' },
    { id: 13, title: 'CBSE Class 6-8: English Language & Literature', category: 'cbse', edLevel: 'middle',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.7, reviews: 2100, students: 6200, hours: 36, level: 'Intermediate',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.lime, badge: '',
      description: 'Grammar, comprehension, essay writing, Honeydew & It So Happened textbook coverage.' },
    { id: 14, title: 'CBSE Class 6-8: Social Science (History, Geo, Civics)', category: 'cbse', edLevel: 'middle',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.6, reviews: 1800, students: 5100, hours: 40, level: 'Intermediate',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.navy, badge: '',
      description: 'Indian history, world geography, democratic politics — NCERT for Class 6-8.' },

    /* ================================================
       SECTION 4 — SECONDARY (Class 9–10) — CBSE
       ================================================ */
    { id: 15, title: 'CBSE Class 9-10: Mathematics — Board Prep', category: 'cbse', edLevel: 'secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 6500, students: 18000, hours: 72, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.sunset, badge: 'Bestseller',
      description: 'Polynomials, trigonometry, coordinate geometry, statistics — complete board exam preparation.' },
    { id: 16, title: 'CBSE Class 10: Science — Physics, Chemistry, Biology', category: 'cbse', edLevel: 'secondary',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.9, reviews: 5800, students: 16000, hours: 68, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.red, badge: 'Hot',
      description: 'Chemical reactions, electricity, magnetism, heredity, ecology — CBSE Class 10 board mastery.' },
    { id: 17, title: 'CBSE Class 9-10: English — Grammar & Literature', category: 'cbse', edLevel: 'secondary',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.7, reviews: 3200, students: 9500, hours: 42, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.teal, badge: '',
      description: 'Beehive, Moments, grammar, letter/essay writing — board exam English prep.' },
    { id: 18, title: 'CBSE Class 9-10: Social Science Complete', category: 'cbse', edLevel: 'secondary',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.7, reviews: 2900, students: 8500, hours: 48, level: 'Intermediate',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: '',
      description: 'History, geography, economics, political science — full Class 9-10 SST board prep.' },

    /* ================================================
       SECTION 5 — SENIOR SECONDARY (Class 11–12) — CBSE
       ================================================ */
    { id: 19, title: 'CBSE Class 11-12: Physics — Complete Course', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.9, reviews: 5200, students: 14000, hours: 80, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.dark, badge: 'Bestseller',
      description: 'Mechanics, thermodynamics, electromagnetism, optics, modern physics — NCERT + HC Verma approach.' },
    { id: 20, title: 'CBSE Class 11-12: Chemistry — Organic, Inorganic, Physical', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 4800, students: 13000, hours: 76, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.plum, badge: 'Hot',
      description: 'Atomic structure, bonding, organic reactions, electrochemistry — full board + competitive prep.' },
    { id: 21, title: 'CBSE Class 11-12: Mathematics — Calculus to Probability', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 5600, students: 15000, hours: 84, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.indigo, badge: 'Bestseller',
      description: 'Limits, derivatives, integrals, vectors, 3D geometry, probability — complete NCERT + extras.' },
    { id: 22, title: 'CBSE Class 11-12: Biology — NEET Foundation', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 4100, students: 11000, hours: 70, level: 'Advanced',
      price: 44.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'Cell biology, genetics, ecology, human physiology, plant biology — NEET + board combined.' },
    { id: 23, title: 'CBSE Class 11-12: Accountancy & Business Studies', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'CA Neha Kapoor', teacherInitials: 'NK', teacherColor: 'bg-orange', teacherEmail: 'neha@email.com',
      rating: 4.7, reviews: 2800, students: 7600, hours: 60, level: 'Advanced',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'Double-entry system, financial statements, partnership, company accounts + business studies.' },
    { id: 24, title: 'CBSE Class 11-12: Computer Science with Python', category: 'cbse', edLevel: 'senior-secondary',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.8, reviews: 3200, students: 8800, hours: 48, level: 'Intermediate',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.blue, badge: 'Popular',
      description: 'Python programming, data structures, SQL, networking — complete CBSE CS board prep.' },

    /* ================================================
       SECTION 6 — ICSE / ISC BOARD
       ================================================ */
    { id: 25, title: 'ICSE Class 9-10: Mathematics — Selina & ML Aggarwal', category: 'icse', edLevel: 'secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.8, reviews: 3600, students: 9800, hours: 64, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.orange, badge: 'Bestseller',
      description: 'Quadratics, trigonometry, circles, constructions — ICSE board with Selina solutions.' },
    { id: 26, title: 'ICSE Class 9-10: Physics & Chemistry', category: 'icse', edLevel: 'secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.7, reviews: 2900, students: 7800, hours: 58, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.teal, badge: '',
      description: 'Force, work, energy, mole concept, organic chemistry — ICSE concise & Selina based.' },
    { id: 27, title: 'ICSE Class 9-10: English Language & Literature', category: 'icse', edLevel: 'secondary',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.6, reviews: 1800, students: 5200, hours: 38, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.lime, badge: '',
      description: 'Treasure Trove, grammar, composition, comprehension — complete ICSE English prep.' },
    { id: 28, title: 'ISC Class 11-12: Physics — Advanced Level', category: 'icse', edLevel: 'senior-secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.8, reviews: 2100, students: 5600, hours: 72, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.navy, badge: '',
      description: 'Mechanics, waves, electrostatics, current electricity, modern physics — ISC board focus.' },
    { id: 29, title: 'ISC Class 11-12: Mathematics', category: 'icse', edLevel: 'senior-secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.8, reviews: 2400, students: 6300, hours: 76, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.indigo, badge: 'Popular',
      description: 'Relations, calculus, probability, linear programming — ISC Maths full syllabus.' },

    /* ================================================
       SECTION 7 — STATE BOARD
       ================================================ */
    { id: 30, title: 'State Board: Class 10 Mathematics (Maharashtra)', category: 'state-board', edLevel: 'secondary',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.7, reviews: 2800, students: 8100, hours: 54, level: 'Intermediate',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.sunset, badge: 'Popular',
      description: 'Arithmetic, algebra, geometry, trigonometry, statistics — Maharashtra SSC board focus.' },
    { id: 31, title: 'State Board: Class 10 Science (Maharashtra)', category: 'state-board', edLevel: 'secondary',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.6, reviews: 2200, students: 6500, hours: 50, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.cyan, badge: '',
      description: 'Gravitation, chemical reactions, life processes, environment — Maharashtra SSC Science.' },
    { id: 32, title: 'State Board: Class 12 Physics (UP Board)', category: 'state-board', edLevel: 'senior-secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.5, reviews: 1600, students: 4200, hours: 60, level: 'Advanced',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.dark, badge: '',
      description: 'Electrostatics, current electricity, optics, modern physics — UP Board syllabus aligned.' },
    { id: 33, title: 'State Board: Class 10 Tamil Nadu — Mathematics', category: 'state-board', edLevel: 'secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.7, reviews: 1900, students: 5500, hours: 48, level: 'Intermediate',
      price: 27.99, teachingMode: 'hybrid', maxGroupSize: 50, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'Relations, algebra, geometry, trigonometry, statistics — TN State Board syllabus.' },

    /* ================================================
       SECTION 8 — IB (International Baccalaureate)
       ================================================ */
    { id: 34, title: 'IB MYP: Mathematics — Years 4 & 5', category: 'ib', edLevel: 'middle',
      teacher: 'Dr. Emily Johnson', teacherInitials: 'EJ', teacherColor: 'bg-purple', teacherEmail: 'emily@email.com',
      rating: 4.8, reviews: 1200, students: 3100, hours: 44, level: 'Intermediate',
      price: 59.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.purple, badge: '',
      description: 'Number, algebra, geometry, statistics & probability — IB MYP criteria-based approach.' },
    { id: 35, title: 'IB DP: Mathematics Analysis & Approaches (HL)', category: 'ib', edLevel: 'senior-secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 1800, students: 4200, hours: 72, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.indigo, badge: 'Popular',
      description: 'Calculus, algebra, functions, vectors, statistics — IB DP Higher Level with IA guidance.' },
    { id: 36, title: 'IB DP: Physics (SL & HL)', category: 'ib', edLevel: 'senior-secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.8, reviews: 1500, students: 3800, hours: 64, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.dark, badge: '',
      description: 'Mechanics, waves, electromagnetism, nuclear physics — SL & HL with IA & past papers.' },
    { id: 37, title: 'IB DP: English A — Language & Literature', category: 'ib', edLevel: 'senior-secondary',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.7, reviews: 980, students: 2400, hours: 40, level: 'Advanced',
      price: 59.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'Textual analysis, comparative essay, individual oral — IB English A complete guide.' },

    /* ================================================
       SECTION 9 — CAMBRIDGE (IGCSE / A-Level)
       ================================================ */
    { id: 38, title: 'IGCSE: Mathematics (0580) — Extended', category: 'cambridge', edLevel: 'secondary',
      teacher: 'Dr. Emily Johnson', teacherInitials: 'EJ', teacherColor: 'bg-purple', teacherEmail: 'emily@email.com',
      rating: 4.8, reviews: 2100, students: 5600, hours: 56, level: 'Intermediate',
      price: 54.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.blue, badge: 'Popular',
      description: 'Number, algebra, functions, geometry, statistics — CIE IGCSE 0580 extended with past papers.' },
    { id: 39, title: 'IGCSE: Physics (0625) — Complete Course', category: 'cambridge', edLevel: 'secondary',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.7, reviews: 1800, students: 4600, hours: 48, level: 'Intermediate',
      price: 54.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.teal, badge: '',
      description: 'Forces, energy, waves, electricity, nuclear — CIE IGCSE Physics with practicals.' },
    { id: 40, title: 'A-Level: Mathematics (9709) — Pure & Statistics', category: 'cambridge', edLevel: 'senior-secondary',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 2400, students: 6200, hours: 80, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 50, allowDemo: true,
      gradient: G.orange, badge: 'Bestseller',
      description: 'Pure Math, Mechanics & Statistics — CIE A-Level 9709 with worked past papers.' },
    { id: 41, title: 'A-Level: Chemistry (9701) — Complete Course', category: 'cambridge', edLevel: 'senior-secondary',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 1900, students: 5100, hours: 72, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 50, allowDemo: true,
      gradient: G.plum, badge: '',
      description: 'Atomic structure, organic, inorganic, physical chemistry — CIE A-Level with past papers.' },

    /* ================================================
       SECTION 10 — COMPETITIVE EXAMS
       ================================================ */
    { id: 42, title: 'JEE Main & Advanced — Complete Physics', category: 'competitive', edLevel: 'competitive',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.9, reviews: 7200, students: 22000, hours: 120, level: 'Advanced',
      price: 79.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.dark, badge: 'Bestseller',
      description: 'Mechanics, electrodynamics, optics, modern physics — JEE level problems & strategies.' },
    { id: 43, title: 'JEE Main & Advanced — Complete Chemistry', category: 'competitive', edLevel: 'competitive',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 6100, students: 19000, hours: 110, level: 'Advanced',
      price: 79.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.pink, badge: 'Hot',
      description: 'Physical, organic, inorganic chemistry — reaction mechanisms, numericals & PYQs.' },
    { id: 44, title: 'JEE Main & Advanced — Complete Mathematics', category: 'competitive', edLevel: 'competitive',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.9, reviews: 6800, students: 20000, hours: 115, level: 'Advanced',
      price: 79.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.sunset, badge: 'Bestseller',
      description: 'Algebra, calculus, coordinate geometry, vectors — JEE Advanced level problem solving.' },
    { id: 45, title: 'NEET Complete Biology — Botany & Zoology', category: 'competitive', edLevel: 'competitive',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.9, reviews: 8900, students: 28000, hours: 100, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.green, badge: 'Bestseller',
      description: 'Cell biology, genetics, human physiology, ecology, plant morphology — NEET focused.' },
    { id: 46, title: 'NEET Physics & Chemistry Combined', category: 'competitive', edLevel: 'competitive',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.8, reviews: 5600, students: 16000, hours: 90, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.navy, badge: '',
      description: 'Complete NEET Physics + Chemistry — concepts, numericals, NCERT line-by-line & PYQs.' },
    { id: 47, title: 'UPSC CSE — General Studies Prelims & Mains', category: 'competitive', edLevel: 'competitive',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.8, reviews: 4200, students: 11000, hours: 150, level: 'Advanced',
      price: 99.99, teachingMode: 'hybrid', maxGroupSize: 300, allowDemo: true,
      gradient: G.slate, badge: 'Hot',
      description: 'Polity, history, geography, economy, environment, ethics, essay — complete UPSC strategy.' },
    { id: 48, title: 'CAT / MBA Entrance — Quant, VARC, DILR', category: 'competitive', edLevel: 'competitive',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.7, reviews: 3100, students: 8500, hours: 80, level: 'Advanced',
      price: 59.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'Quantitative aptitude, verbal ability, logical reasoning — IIM CAT preparation.' },
    { id: 49, title: 'GATE — Computer Science & IT', category: 'competitive', edLevel: 'competitive',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.8, reviews: 2800, students: 7400, hours: 90, level: 'Advanced',
      price: 59.99, teachingMode: 'hybrid', maxGroupSize: 150, allowDemo: true,
      gradient: G.blue, badge: '',
      description: 'Data structures, algorithms, OS, DBMS, networks, theory of computation — GATE CS prep.' },
    { id: 50, title: 'GRE Preparation — Quant & Verbal Complete', category: 'competitive', edLevel: 'competitive',
      teacher: 'Dr. Emily Johnson', teacherInitials: 'EJ', teacherColor: 'bg-purple', teacherEmail: 'emily@email.com',
      rating: 4.7, reviews: 2200, students: 5800, hours: 50, level: 'Intermediate',
      price: 49.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.purple, badge: '',
      description: 'Vocabulary, reading comprehension, quantitative reasoning — GRE 320+ strategy.' },

    /* ================================================
       SECTION 11 — UNDERGRADUATE (B.Tech / B.Sc / B.Com / BA)
       ================================================ */
    { id: 51, title: 'B.Tech: Engineering Mathematics (Sem 1-4)', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'Mr. Suresh Iyer', teacherInitials: 'SI', teacherColor: 'bg-orange', teacherEmail: 'suresh@email.com',
      rating: 4.8, reviews: 3600, students: 9800, hours: 72, level: 'Intermediate',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.indigo, badge: 'Popular',
      description: 'Linear algebra, calculus, differential equations, probability — engineering math foundation.' },
    { id: 52, title: 'B.Tech: Data Structures & Algorithms in C/C++', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.9, reviews: 5100, students: 14000, hours: 56, level: 'Intermediate',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.blue, badge: 'Bestseller',
      description: 'Arrays, linked lists, trees, graphs, sorting, dynamic programming — placement ready.' },
    { id: 53, title: 'B.Com: Financial Accounting & Cost Accounting', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'CA Neha Kapoor', teacherInitials: 'NK', teacherColor: 'bg-orange', teacherEmail: 'neha@email.com',
      rating: 4.7, reviews: 2400, students: 6800, hours: 48, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'Journal entries, ledger, trial balance, cost sheets, budgeting — B.Com university exams.' },
    { id: 54, title: 'B.Sc: Organic Chemistry — Reactions & Mechanisms', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.6, reviews: 1800, students: 4600, hours: 40, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.pink, badge: '',
      description: 'Named reactions, stereochemistry, spectroscopy — B.Sc Chemistry university prep.' },
    { id: 55, title: 'BA: Political Science — Western & Indian Political Thought', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.5, reviews: 1200, students: 3200, hours: 36, level: 'Intermediate',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: '',
      description: 'Plato, Aristotle, Marx, Ambedkar, Indian constitution — BA political science university exams.' },
    { id: 56, title: 'BBA/MBA: Principles of Management & Marketing', category: 'undergraduate', edLevel: 'undergraduate',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.6, reviews: 1600, students: 4200, hours: 32, level: 'Intermediate',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.coral, badge: '',
      description: 'Planning, organizing, staffing, marketing mix, consumer behavior — management fundamentals.' },

    /* ================================================
       SECTION 12 — POSTGRADUATE (M.Tech / M.Sc / MBA / MA)
       ================================================ */
    { id: 57, title: 'M.Tech: Machine Learning & Deep Learning', category: 'postgraduate', edLevel: 'postgraduate',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 4.9, reviews: 3200, students: 8500, hours: 68, level: 'Advanced',
      price: 59.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.pink, badge: 'Bestseller',
      description: 'Regression, SVM, CNNs, RNNs, transformers, GANs — research-grade ML with Python.' },
    { id: 58, title: 'MBA: Strategic Management & Leadership', category: 'postgraduate', edLevel: 'postgraduate',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.7, reviews: 2100, students: 5400, hours: 44, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.red, badge: '',
      description: 'Porter\'s 5 forces, SWOT, blue ocean strategy, change management, case studies.' },
    { id: 59, title: 'M.Sc: Advanced Quantum Mechanics', category: 'postgraduate', edLevel: 'postgraduate',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.8, reviews: 890, students: 2100, hours: 48, level: 'Advanced',
      price: 54.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.dark, badge: '',
      description: 'Hilbert spaces, Dirac notation, perturbation theory, scattering — M.Sc Physics.' },
    { id: 60, title: 'MA: Research Methodology & Academic Writing', category: 'postgraduate', edLevel: 'postgraduate',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.6, reviews: 1100, students: 3200, hours: 28, level: 'Advanced',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.navy, badge: '',
      description: 'Research design, data collection, thesis writing, APA/MLA citation — for all MA/MSc students.' },

    /* ================================================
       SECTION 13 — PhD / RESEARCH
       ================================================ */
    { id: 61, title: 'PhD: Research Paper Writing & Publication Strategy', category: 'phd', edLevel: 'phd',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.9, reviews: 1400, students: 3800, hours: 24, level: 'Advanced',
      price: 39.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: 'Popular',
      description: 'SCI/Scopus journal targeting, literature review, manuscript structure, peer review process.' },
    { id: 62, title: 'PhD: Advanced Statistical Methods with R & SPSS', category: 'phd', edLevel: 'phd',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 4.8, reviews: 1100, students: 2900, hours: 36, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.plum, badge: '',
      description: 'ANOVA, regression, factor analysis, SEM, mixed models — doctoral-level data analysis.' },
    { id: 63, title: 'PhD: Systematic Literature Review & Meta-Analysis', category: 'phd', edLevel: 'phd',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.7, reviews: 780, students: 1900, hours: 20, level: 'Advanced',
      price: 34.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'PRISMA guidelines, search strategy, quality assessment, effect size — for all disciplines.' },

    /* ================================================
       SECTION 14 — TECHNOLOGY & SOFTWARE ENGINEERING
       ================================================ */
    { id: 64, title: 'Full-Stack Web Development Bootcamp', category: 'web-dev', edLevel: 'professional',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.8, reviews: 2341, students: 5670, hours: 48, level: 'All Levels',
      price: 49.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.blue, badge: 'Bestseller',
      description: 'Master HTML, CSS, JavaScript, React, Node.js and build 20+ real projects.' },
    { id: 65, title: 'AI & Machine Learning Masterclass', category: 'ai-ml', edLevel: 'professional',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 5.0, reviews: 1890, students: 2890, hours: 62, level: 'Intermediate',
      price: 59.99, teachingMode: 'hybrid', maxGroupSize: 50, allowDemo: true,
      gradient: G.pink, badge: 'New',
      description: 'From Python basics to building neural networks. Complete AI journey.' },
    { id: 66, title: 'Flutter & Dart — Build 15 Apps', category: 'mobile', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.7, reviews: 1567, students: 1567, hours: 38, level: 'Beginner',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.cyan, badge: 'Hot',
      description: 'Create beautiful cross-platform mobile apps with Flutter framework.' },
    { id: 67, title: 'React Advanced Patterns & Performance', category: 'web-dev', edLevel: 'professional',
      teacher: 'Dr. Emily Johnson', teacherInitials: 'EJ', teacherColor: 'bg-purple', teacherEmail: 'emily@email.com',
      rating: 4.9, reviews: 982, students: 3420, hours: 24, level: 'Advanced',
      price: 44.99, teachingMode: 'group', maxGroupSize: 30, allowDemo: true,
      gradient: G.purple, badge: 'Popular',
      description: 'Master advanced React patterns, hooks, context, performance optimization.' },
    { id: 68, title: 'AWS Cloud Architect Certification Prep', category: 'cloud', edLevel: 'professional',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.8, reviews: 1243, students: 4230, hours: 56, level: 'Intermediate',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.orange, badge: 'Certification',
      description: 'Complete AWS Solutions Architect exam preparation with hands-on labs.' },
    { id: 69, title: 'Python for Data Science & Analytics', category: 'data-science', edLevel: 'professional',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 4.9, reviews: 2156, students: 4500, hours: 42, level: 'Beginner',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.green, badge: 'Bestseller',
      description: 'Learn Python, Pandas, NumPy, Matplotlib, and real-world data analysis.' },
    { id: 70, title: 'Cybersecurity & Ethical Hacking', category: 'cybersecurity', edLevel: 'professional',
      teacher: 'Tom Wilson', teacherInitials: 'TW', teacherColor: 'bg-blue', teacherEmail: 'tom@email.com',
      rating: 4.7, reviews: 1123, students: 1890, hours: 44, level: 'Intermediate',
      price: 54.99, teachingMode: 'group', maxGroupSize: 40, allowDemo: true,
      gradient: G.dark, badge: 'Hot',
      description: 'Penetration testing, network security, and ethical hacking techniques.' },
    { id: 71, title: 'Node.js & Express — Backend Mastery', category: 'web-dev', edLevel: 'professional',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.8, reviews: 1567, students: 3200, hours: 34, level: 'Intermediate',
      price: 44.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.lime, badge: 'Popular',
      description: 'Build RESTful APIs, authentication, databases, and deploy to production.' },
    { id: 72, title: 'Swift & iOS Development Complete Guide', category: 'mobile', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.6, reviews: 890, students: 1200, hours: 40, level: 'Beginner',
      price: 49.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.sky, badge: '',
      description: 'Build iOS apps with Swift, SwiftUI, and Xcode from scratch.' },
    { id: 73, title: 'DevOps: Docker, Kubernetes & CI/CD', category: 'cloud', edLevel: 'professional',
      teacher: 'Tom Wilson', teacherInitials: 'TW', teacherColor: 'bg-blue', teacherEmail: 'tom@email.com',
      rating: 4.8, reviews: 2100, students: 5800, hours: 52, level: 'Intermediate',
      price: 59.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.teal, badge: 'Hot',
      description: 'Container orchestration, Jenkins, GitHub Actions, Terraform — full DevOps pipeline.' },
    { id: 74, title: 'Blockchain Development with Solidity & Web3', category: 'web-dev', edLevel: 'professional',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.6, reviews: 980, students: 2400, hours: 36, level: 'Advanced',
      price: 54.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.indigo, badge: 'New',
      description: 'Smart contracts, DApps, NFTs, DeFi — build on Ethereum with Solidity & Hardhat.' },
    { id: 75, title: 'Introduction to Programming (Free)', category: 'web-dev', edLevel: 'professional',
      teacher: 'Dr. Emily Johnson', teacherInitials: 'EJ', teacherColor: 'bg-purple', teacherEmail: 'emily@email.com',
      rating: 4.9, reviews: 5430, students: 12000, hours: 12, level: 'Beginner',
      price: 0, teachingMode: 'recorded', maxGroupSize: null, allowDemo: false,
      gradient: G.blue, badge: 'Free',
      description: 'Start your coding journey! Learn programming fundamentals step by step.' },

    /* ================================================
       SECTION 15 — DESIGN & CREATIVE ARTS
       ================================================ */
    { id: 76, title: 'UI/UX Design Masterclass with Figma', category: 'design', edLevel: 'professional',
      teacher: 'Alice Wong', teacherInitials: 'AW', teacherColor: 'bg-orange', teacherEmail: 'alice@email.com',
      rating: 4.6, reviews: 876, students: 2100, hours: 36, level: 'Beginner',
      price: 42.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.rose, badge: 'New',
      description: 'Design stunning interfaces, wireframes, prototypes, and design systems.' },
    { id: 77, title: 'Graphic Design — Photoshop, Illustrator & InDesign', category: 'design', edLevel: 'professional',
      teacher: 'Alice Wong', teacherInitials: 'AW', teacherColor: 'bg-orange', teacherEmail: 'alice@email.com',
      rating: 4.7, reviews: 1450, students: 3800, hours: 42, level: 'Beginner',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.coral, badge: '',
      description: 'Logo design, branding, posters, social media graphics — Adobe Creative Suite mastery.' },
    { id: 78, title: 'Video Editing & Motion Graphics — Premiere Pro & After Effects', category: 'design', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.6, reviews: 1100, students: 2800, hours: 38, level: 'Intermediate',
      price: 44.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.plum, badge: '',
      description: 'Cuts, transitions, color grading, animations, VFX — YouTube & film editing.' },
    { id: 79, title: '3D Modeling & Animation with Blender', category: 'design', edLevel: 'professional',
      teacher: 'Alice Wong', teacherInitials: 'AW', teacherColor: 'bg-orange', teacherEmail: 'alice@email.com',
      rating: 4.7, reviews: 920, students: 2200, hours: 44, level: 'Intermediate',
      price: 49.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.sunset, badge: '',
      description: 'Modeling, texturing, rigging, animation, rendering — Blender for games & film.' },

    /* ================================================
       SECTION 16 — BUSINESS, FINANCE & MANAGEMENT
       ================================================ */
    { id: 80, title: 'Digital Marketing & SEO Strategy', category: 'business', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.5, reviews: 678, students: 1450, hours: 28, level: 'Beginner',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.red, badge: '',
      description: 'Master Google Ads, SEO, social media marketing, and analytics.' },
    { id: 81, title: 'Financial Modeling & Investment Banking', category: 'finance', edLevel: 'professional',
      teacher: 'CA Neha Kapoor', teacherInitials: 'NK', teacherColor: 'bg-orange', teacherEmail: 'neha@email.com',
      rating: 4.8, reviews: 2100, students: 5600, hours: 44, level: 'Advanced',
      price: 69.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.gold, badge: 'Popular',
      description: 'DCF, LBO, M&A modeling, Excel mastery — Wall Street analyst prep.' },
    { id: 82, title: 'Stock Market Trading & Technical Analysis', category: 'finance', edLevel: 'professional',
      teacher: 'CA Neha Kapoor', teacherInitials: 'NK', teacherColor: 'bg-orange', teacherEmail: 'neha@email.com',
      rating: 4.6, reviews: 3200, students: 9800, hours: 36, level: 'Intermediate',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.teal, badge: 'Hot',
      description: 'Candlestick patterns, indicators, risk management, options — become a confident trader.' },
    { id: 83, title: 'Project Management — PMP & Agile/Scrum', category: 'business', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.7, reviews: 1800, students: 4800, hours: 40, level: 'Intermediate',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 60, allowDemo: true,
      gradient: G.navy, badge: 'Certification',
      description: 'PMBOK, Agile, Scrum, Kanban — PMP certification prep with mock exams.' },
    { id: 84, title: 'Entrepreneurship & Startup Masterclass', category: 'business', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.5, reviews: 1200, students: 3200, hours: 24, level: 'Beginner',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.coral, badge: '',
      description: 'Idea validation, MVP, fundraising, pitch decks, growth hacking — launch your startup.' },
    { id: 85, title: 'Tally Prime & GST — Complete Accounting', category: 'finance', edLevel: 'professional',
      teacher: 'CA Neha Kapoor', teacherInitials: 'NK', teacherColor: 'bg-orange', teacherEmail: 'neha@email.com',
      rating: 4.7, reviews: 4500, students: 13000, hours: 32, level: 'Beginner',
      price: 19.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.orange, badge: 'Bestseller',
      description: 'Tally Prime, GST returns, TDS, payroll, inventory — job-ready accounting skills.' },

    /* ================================================
       SECTION 17 — HEALTHCARE & MEDICINE
       ================================================ */
    { id: 86, title: 'Medical Terminology & Anatomy Basics', category: 'healthcare', edLevel: 'professional',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.7, reviews: 1800, students: 4600, hours: 32, level: 'Beginner',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.green, badge: '',
      description: 'Body systems, medical prefixes/suffixes, anatomical terminology — for nursing & allied health.' },
    { id: 87, title: 'Clinical Pharmacology — Drug Classes & Interactions', category: 'healthcare', edLevel: 'postgraduate',
      teacher: 'Dr. Meena Gupta', teacherInitials: 'MG', teacherColor: 'bg-pink', teacherEmail: 'meena@email.com',
      rating: 4.8, reviews: 1200, students: 3100, hours: 40, level: 'Advanced',
      price: 49.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'Pharmacokinetics, pharmacodynamics, drug interactions — for MBBS, pharmacy & nursing.' },
    { id: 88, title: 'Nursing: Patient Care & Clinical Skills', category: 'healthcare', edLevel: 'professional',
      teacher: 'Ms. Deepa Joshi', teacherInitials: 'DJ', teacherColor: 'bg-cyan', teacherEmail: 'deepa@email.com',
      rating: 4.6, reviews: 980, students: 2600, hours: 36, level: 'Intermediate',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.cyan, badge: '',
      description: 'Vital signs, wound care, medication administration, patient communication — GNM/BSc Nursing.' },

    /* ================================================
       SECTION 18 — LAW
       ================================================ */
    { id: 89, title: 'Indian Constitution & Constitutional Law', category: 'law', edLevel: 'undergraduate',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.8, reviews: 2200, students: 6100, hours: 42, level: 'Intermediate',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: 'Popular',
      description: 'Fundamental rights, DPSP, amendments, landmark judgments — LLB & CLAT prep.' },
    { id: 90, title: 'Contract Law & Business Law', category: 'law', edLevel: 'undergraduate',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.6, reviews: 1400, students: 3800, hours: 36, level: 'Intermediate',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.navy, badge: '',
      description: 'Indian Contract Act, Sale of Goods, Negotiable Instruments, Company Law — LLB exams.' },
    { id: 91, title: 'CLAT Preparation — Complete Course', category: 'competitive', edLevel: 'competitive',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.7, reviews: 1800, students: 4900, hours: 60, level: 'Intermediate',
      price: 44.99, teachingMode: 'hybrid', maxGroupSize: 80, allowDemo: true,
      gradient: G.indigo, badge: '',
      description: 'Legal reasoning, logical reasoning, English, GK, quantitative — NLU entrance prep.' },

    /* ================================================
       SECTION 19 — LANGUAGES
       ================================================ */
    { id: 92, title: 'English Speaking & Communication Skills', category: 'language', edLevel: 'professional',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.8, reviews: 6200, students: 18000, hours: 24, level: 'Beginner',
      price: 14.99, teachingMode: 'group', maxGroupSize: 30, allowDemo: true,
      gradient: G.blue, badge: 'Bestseller',
      description: 'Spoken English, pronunciation, vocabulary, public speaking, interview skills.' },
    { id: 93, title: 'IELTS Preparation — Band 7+ Strategy', category: 'language', edLevel: 'professional',
      teacher: 'Mrs. Kavita Nair', teacherInitials: 'KN', teacherColor: 'bg-green', teacherEmail: 'kavita@email.com',
      rating: 4.8, reviews: 3800, students: 10500, hours: 36, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 40, allowDemo: true,
      gradient: G.teal, badge: 'Hot',
      description: 'Listening, reading, writing, speaking — IELTS Academic & General with mock tests.' },
    { id: 94, title: 'Learn French — Beginner to B2', category: 'language', edLevel: 'professional',
      teacher: 'Ms. Priya Sharma', teacherInitials: 'PS', teacherColor: 'bg-pink', teacherEmail: 'priya@email.com',
      rating: 4.6, reviews: 1400, students: 3800, hours: 48, level: 'Beginner',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 20, allowDemo: true,
      gradient: G.rose, badge: '',
      description: 'French grammar, vocabulary, conversation, DELF B2 preparation — immersive method.' },
    { id: 95, title: 'Learn German — A1 to B1', category: 'language', edLevel: 'professional',
      teacher: 'Ms. Priya Sharma', teacherInitials: 'PS', teacherColor: 'bg-pink', teacherEmail: 'priya@email.com',
      rating: 4.5, reviews: 1100, students: 2900, hours: 44, level: 'Beginner',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 20, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'German grammar, vocabulary, Goethe exam prep — A1 to B1 comprehensive.' },
    { id: 96, title: 'Learn Japanese — JLPT N5 to N3', category: 'language', edLevel: 'professional',
      teacher: 'Alice Wong', teacherInitials: 'AW', teacherColor: 'bg-orange', teacherEmail: 'alice@email.com',
      rating: 4.7, reviews: 980, students: 2400, hours: 52, level: 'Beginner',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 15, allowDemo: true,
      gradient: G.sunset, badge: '',
      description: 'Hiragana, katakana, kanji, grammar, conversation — JLPT N5 to N3 prep.' },
    { id: 97, title: 'Sanskrit — Beginner to Intermediate', category: 'language', edLevel: 'professional',
      teacher: 'Mrs. Anita Desai', teacherInitials: 'AD', teacherColor: 'bg-purple', teacherEmail: 'anita@email.com',
      rating: 4.5, reviews: 620, students: 1600, hours: 30, level: 'Beginner',
      price: 19.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'Sanskrit alphabet, sandhi, vibhakti, subhashitas — school & competitive exam prep.' },

    /* ================================================
       SECTION 20 — MUSIC, ARTS & PERFORMING ARTS
       ================================================ */
    { id: 98, title: 'Learn Guitar — Beginner to Advanced', category: 'music-arts', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.8, reviews: 2100, students: 5800, hours: 40, level: 'All Levels',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 20, allowDemo: true,
      gradient: G.cyan, badge: 'Popular',
      description: 'Chords, scales, fingerpicking, music theory, songs — acoustic & electric guitar.' },
    { id: 99, title: 'Indian Classical Vocal — Hindustani & Carnatic', category: 'music-arts', edLevel: 'professional',
      teacher: 'Mrs. Anita Desai', teacherInitials: 'AD', teacherColor: 'bg-purple', teacherEmail: 'anita@email.com',
      rating: 4.7, reviews: 890, students: 2200, hours: 36, level: 'Beginner',
      price: 24.99, teachingMode: 'individual', maxGroupSize: null, allowDemo: true,
      gradient: G.purple, badge: '',
      description: 'Ragas, taal, alankar, bandish — classical vocal training with live practice sessions.' },
    { id: 100, title: 'Piano / Keyboard — Complete Course', category: 'music-arts', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.6, reviews: 1200, students: 3200, hours: 32, level: 'Beginner',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 15, allowDemo: true,
      gradient: G.sky, badge: '',
      description: 'Notes, chords, scales, sight reading, songs — keyboard for beginners to intermediate.' },
    { id: 101, title: 'Drawing & Sketching — Pencil & Charcoal', category: 'music-arts', edLevel: 'professional',
      teacher: 'Alice Wong', teacherInitials: 'AW', teacherColor: 'bg-orange', teacherEmail: 'alice@email.com',
      rating: 4.7, reviews: 1400, students: 3600, hours: 28, level: 'Beginner',
      price: 19.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: '',
      description: 'Shading, perspective, portraits, still life — traditional drawing fundamentals.' },
    { id: 102, title: 'Photography — DSLR & Mobile Photography', category: 'music-arts', edLevel: 'professional',
      teacher: 'Mike Ross', teacherInitials: 'MR', teacherColor: 'bg-cyan', teacherEmail: 'mike@email.com',
      rating: 4.5, reviews: 1800, students: 4800, hours: 24, level: 'Beginner',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.dark, badge: '',
      description: 'Composition, lighting, editing, portrait, landscape — turn photos into art.' },

    /* ================================================
       SECTION 21 — GOVERNMENT & CIVIL SERVICES
       ================================================ */
    { id: 103, title: 'SSC CGL — Complete Preparation', category: 'govt-exam', edLevel: 'competitive',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.7, reviews: 3800, students: 11000, hours: 80, level: 'Intermediate',
      price: 39.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.blue, badge: 'Popular',
      description: 'Quant, English, reasoning, GK — Tier 1 & 2 complete prep with mock tests.' },
    { id: 104, title: 'Bank PO & Clerk — IBPS / SBI', category: 'govt-exam', edLevel: 'competitive',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.6, reviews: 4200, students: 13000, hours: 72, level: 'Intermediate',
      price: 34.99, teachingMode: 'hybrid', maxGroupSize: 200, allowDemo: true,
      gradient: G.teal, badge: 'Hot',
      description: 'Reasoning, quantitative aptitude, English, computer, banking awareness — prelims & mains.' },
    { id: 105, title: 'Railway RRB NTPC & Group D', category: 'govt-exam', edLevel: 'competitive',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.5, reviews: 3200, students: 9500, hours: 60, level: 'Beginner',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.orange, badge: '',
      description: 'Mathematics, reasoning, GK, science — complete RRB NTPC & Group D preparation.' },
    { id: 106, title: 'Teaching Exams — CTET / TET / KVS', category: 'govt-exam', edLevel: 'competitive',
      teacher: 'Ms. Deepa Joshi', teacherInitials: 'DJ', teacherColor: 'bg-cyan', teacherEmail: 'deepa@email.com',
      rating: 4.7, reviews: 2600, students: 7200, hours: 56, level: 'Intermediate',
      price: 29.99, teachingMode: 'hybrid', maxGroupSize: 100, allowDemo: true,
      gradient: G.lime, badge: '',
      description: 'Child development, pedagogy, math, science, social studies — Paper 1 & 2 combined.' },

    /* ================================================
       SECTION 22 — FITNESS, YOGA & WELLNESS
       ================================================ */
    { id: 107, title: 'Yoga & Meditation — Beginner to Advanced', category: 'fitness', edLevel: 'professional',
      teacher: 'Mrs. Anita Desai', teacherInitials: 'AD', teacherColor: 'bg-purple', teacherEmail: 'anita@email.com',
      rating: 4.8, reviews: 3400, students: 9800, hours: 28, level: 'All Levels',
      price: 19.99, teachingMode: 'group', maxGroupSize: 50, allowDemo: true,
      gradient: G.green, badge: 'Popular',
      description: 'Asanas, pranayama, meditation, flexibility — transform your body and mind.' },
    { id: 108, title: 'Nutrition & Diet Planning — Certified Course', category: 'fitness', edLevel: 'professional',
      teacher: 'Ms. Deepa Joshi', teacherInitials: 'DJ', teacherColor: 'bg-cyan', teacherEmail: 'deepa@email.com',
      rating: 4.6, reviews: 1200, students: 3200, hours: 24, level: 'Beginner',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.forest, badge: '',
      description: 'Macros, meal planning, sports nutrition, weight management — become a nutrition coach.' },

    /* ================================================
       SECTION 23 — ENGINEERING & ARCHITECTURE
       ================================================ */
    { id: 109, title: 'AutoCAD & Civil Engineering Drawing', category: 'engineering', edLevel: 'professional',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.7, reviews: 1800, students: 4800, hours: 40, level: 'Intermediate',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.navy, badge: '',
      description: '2D drafting, 3D modeling, construction drawings, plans — AutoCAD for civil engineers.' },
    { id: 110, title: 'Mechanical Engineering — SolidWorks & FEA', category: 'engineering', edLevel: 'professional',
      teacher: 'Mr. Rakesh Kumar', teacherInitials: 'RK', teacherColor: 'bg-blue', teacherEmail: 'rakesh@email.com',
      rating: 4.6, reviews: 1200, students: 3200, hours: 44, level: 'Intermediate',
      price: 44.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.slate, badge: '',
      description: 'Part modeling, assembly, simulation, finite element analysis — SolidWorks mastery.' },
    { id: 111, title: 'Electrical Engineering — Power Systems & Machines', category: 'engineering', edLevel: 'undergraduate',
      teacher: 'Prof. Raj Patel', teacherInitials: 'RP', teacherColor: 'bg-green', teacherEmail: 'raj@email.com',
      rating: 4.7, reviews: 1600, students: 4200, hours: 48, level: 'Intermediate',
      price: 34.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.gold, badge: '',
      description: 'Transformers, motors, generators, power distribution, transmission — B.Tech EE core.' },

    /* ================================================
       SECTION 24 — PERSONAL DEVELOPMENT & SOFT SKILLS
       ================================================ */
    { id: 112, title: 'Public Speaking & Presentation Skills', category: 'personal-dev', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.7, reviews: 2400, students: 6800, hours: 16, level: 'Beginner',
      price: 19.99, teachingMode: 'group', maxGroupSize: 25, allowDemo: true,
      gradient: G.coral, badge: 'Popular',
      description: 'Overcome stage fear, structure your speech, body language, storytelling techniques.' },
    { id: 113, title: 'Time Management & Productivity Masterclass', category: 'personal-dev', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.5, reviews: 1800, students: 5200, hours: 8, level: 'Beginner',
      price: 0, teachingMode: 'recorded', maxGroupSize: null, allowDemo: false,
      gradient: G.teal, badge: 'Free',
      description: 'Pomodoro, GTD, Eisenhower matrix, deep work — proven productivity frameworks.' },
    { id: 114, title: 'Interview Preparation & Resume Building', category: 'personal-dev', edLevel: 'professional',
      teacher: 'Nina Chen', teacherInitials: 'NC', teacherColor: 'bg-pink', teacherEmail: 'nina@email.com',
      rating: 4.6, reviews: 3200, students: 9200, hours: 12, level: 'Beginner',
      price: 14.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.blue, badge: '',
      description: 'ATS-friendly resume, LinkedIn optimization, mock interviews, salary negotiation.' },
    { id: 115, title: 'Emotional Intelligence & Leadership', category: 'personal-dev', edLevel: 'professional',
      teacher: 'Prof. Arun Mehta', teacherInitials: 'AM', teacherColor: 'bg-purple', teacherEmail: 'arun@email.com',
      rating: 4.6, reviews: 980, students: 2600, hours: 14, level: 'Intermediate',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.purple, badge: '',
      description: 'Self-awareness, empathy, conflict resolution, team leadership — EQ for career growth.' },

    /* ================================================
       SECTION 25 — AGRICULTURE & ENVIRONMENTAL SCIENCE
       ================================================ */
    { id: 116, title: 'Organic Farming & Sustainable Agriculture', category: 'agriculture', edLevel: 'professional',
      teacher: 'Ms. Deepa Joshi', teacherInitials: 'DJ', teacherColor: 'bg-cyan', teacherEmail: 'deepa@email.com',
      rating: 4.6, reviews: 890, students: 2400, hours: 24, level: 'Beginner',
      price: 19.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.green, badge: '',
      description: 'Composting, crop rotation, pest management, hydroponics — modern farming techniques.' },

    /* ================================================
       SECTION 26 — DATA, ANALYTICS & EMERGING TECH
       ================================================ */
    { id: 117, title: 'Generative AI — ChatGPT, Midjourney & Prompt Engineering', category: 'ai-ml', edLevel: 'professional',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 4.9, reviews: 4800, students: 14000, hours: 20, level: 'Beginner',
      price: 29.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.plum, badge: 'Trending',
      description: 'LLMs, prompt engineering, AI art, workflow automation — harness generative AI.' },
    { id: 118, title: 'Power BI & Tableau — Data Visualization', category: 'data-science', edLevel: 'professional',
      teacher: 'Dr. Sarah Chen', teacherInitials: 'SC', teacherColor: 'bg-pink', teacherEmail: 'sarah@email.com',
      rating: 4.7, reviews: 2200, students: 6100, hours: 32, level: 'Intermediate',
      price: 39.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.sky, badge: '',
      description: 'Dashboards, DAX, calculated fields, storytelling with data — BI for business analysts.' },
    { id: 119, title: 'SQL & Database Management — MySQL & PostgreSQL', category: 'data-science', edLevel: 'professional',
      teacher: 'Alex Parker', teacherInitials: 'AP', teacherColor: 'bg-blue', teacherEmail: 'alex@email.com',
      rating: 4.8, reviews: 3100, students: 8600, hours: 28, level: 'Beginner',
      price: 24.99, teachingMode: 'recorded', maxGroupSize: null, allowDemo: true,
      gradient: G.lime, badge: 'Popular',
      description: 'Queries, joins, subqueries, indexing, stored procedures — SQL from zero to pro.' },
    { id: 120, title: 'Internet of Things (IoT) with Arduino & Raspberry Pi', category: 'engineering', edLevel: 'professional',
      teacher: 'Tom Wilson', teacherInitials: 'TW', teacherColor: 'bg-blue', teacherEmail: 'tom@email.com',
      rating: 4.6, reviews: 1100, students: 2800, hours: 36, level: 'Intermediate',
      price: 44.99, teachingMode: 'hybrid', maxGroupSize: 30, allowDemo: true,
      gradient: G.teal, badge: 'New',
      description: 'Sensors, actuators, MQTT, cloud dashboards — build real IoT projects.' }
];

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
