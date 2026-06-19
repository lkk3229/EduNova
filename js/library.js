(function () {
    'use strict';

    const library = window.EduNovaLibrary;
    if (!library) return;

    const state = {
        boardId: 'ncert',
        classLevel: 'all',
        query: '',
        selectedBookId: null
    };

    const ui = {};

    const GREETINGS = ['hi', 'hello', 'hey', 'good morning', 'good evening'];
    const NCERT_SOURCE_URL = 'https://ncert.nic.in/textbook.php';

    function slugify(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function buildApiBookId(book) {
        return `ncert-api-${book.classLevel}-${slugify(book.subject)}-${slugify(book.language || 'english')}`;
    }

    function buildApiReader(book) {
        return {
            access: 'free',
            availabilityNote: book.pdfUrl
                ? 'Official NCERT PDF is available from ncert.nic.in and opens in a new tab.'
                : 'Official NCERT listing is available. PDF link is not currently provided for this title.',
            pdfUrl: book.pdfUrl || null,
            chapters: []
        };
    }

    function mapNcertApiBook(book) {
        const classLevel = Number(book.classLevel);
        const language = book.language || 'English';
        const stream = book.stream || 'General';
        const title = String(book.title || '').trim() || `NCERT Class ${classLevel} ${book.subject}`;

        return {
            id: buildApiBookId(book),
            boardId: 'ncert',
            board: 'NCERT',
            classLevel,
            subject: book.subject,
            stream,
            sourceUrl: book.sourceUrl || NCERT_SOURCE_URL,
            title,
            description: book.description || `NCERT ${book.subject} textbook for Class ${classLevel}.`,
            tags: Array.isArray(book.tags) && book.tags.length
                ? book.tags
                : ['NCERT', `Class ${classLevel}`, book.subject, language, stream],
            reader: buildApiReader(book)
        };
    }

    function isKnownBrokenNcertPdfUrl(url) {
        return /https?:\/\/ncert\.nic\.in\/pdf\/publication\/Class/i.test(String(url || ''));
    }

    function applySelectionFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const board = params.get('board');
        const classLevel = params.get('class');
        const bookId = params.get('book');

        if (board && library.getBoard(board)) {
            state.boardId = board;
        }

        if (classLevel && classLevel !== 'all') {
            const numericClass = Number(classLevel);
            if (Number.isInteger(numericClass) && numericClass >= 1 && numericClass <= 12) {
                state.classLevel = String(numericClass);
            }
        }

        if (bookId) {
            state.selectedBookId = bookId;
        }
    }

    function openBook(book) {
        if (!book) return;

        const pdfUrl = book.reader && book.reader.pdfUrl ? String(book.reader.pdfUrl).trim() : '';
        if (pdfUrl && !isKnownBrokenNcertPdfUrl(pdfUrl)) {
            window.open(pdfUrl, '_blank');
            return;
        }

        if (pdfUrl && book.boardId === 'ncert') {
            if (typeof showNotification === 'function') {
                showNotification('Direct PDF link is currently unavailable. Opening official NCERT catalog.', 'warning');
            }
            window.open(book.sourceUrl || NCERT_SOURCE_URL, '_blank');
            return;
        }

        if (typeof showNotification === 'function') {
            showNotification('Opening library preview in new tab', 'info');
        }

        const fallbackUrl = `library.html?board=${encodeURIComponent(book.boardId)}&class=${encodeURIComponent(book.classLevel)}&book=${encodeURIComponent(book.id)}`;
        window.open(fallbackUrl, '_blank');
    }

    // ==================== API Integration ====================
    
    async function loadBooksFromAPI() {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('⚠️ API client not available, using local data');
                return false;
            }

            const response = await apiClient.books.getNcertCatalog();
            if (response && Array.isArray(response.books)) {
                library.apiBooks = response.books.map(mapNcertApiBook);
                console.log(`✓ Loaded ${library.apiBooks.length} NCERT books from API`);
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Could not load NCERT books from API:', error.message);
            console.log('   Using local hardcoded book data instead');
        }
        return false;
    }

    function init() {
        applySelectionFromUrl();

        ui.overview = document.getElementById('libraryOverview');
        ui.boardTabs = document.getElementById('libraryBoardTabs');
        ui.classTabs = document.getElementById('libraryClassTabs');
        ui.search = document.getElementById('librarySearch');
        ui.resultsMeta = document.getElementById('libraryResultsMeta');
        ui.shelf = document.getElementById('libraryShelf');
        ui.agentMessages = document.getElementById('libraryAgentMessages');
        ui.agentForm = document.getElementById('libraryAgentForm');
        ui.agentInput = document.getElementById('libraryAgentInput');
        ui.agentPrompts = document.getElementById('libraryAgentPrompts');
        ui.readerTitle = document.getElementById('libraryReaderTitle');
        ui.readerStatus = document.getElementById('libraryReaderStatus');
        ui.readerDescription = document.getElementById('libraryReaderDescription');
        ui.readerMeta = document.getElementById('libraryReaderMeta');
        ui.readerNote = document.getElementById('libraryReaderNote');
        ui.readerChapters = document.getElementById('libraryReaderChapters');

        if (!ui.overview || !ui.boardTabs || !ui.classTabs || !ui.shelf) return;

        // Try to load books from API first
        loadBooksFromAPI().then(() => {
            renderOverview();
            renderBoardTabs();
            renderClassTabs();
            bindEvents();
            renderShelf();
            initAgent();
        });
    }

    function bindEvents() {
        ui.search.addEventListener('input', () => {
            state.query = ui.search.value.trim();
            renderShelf();
        });

        ui.boardTabs.addEventListener('click', (event) => {
            const button = event.target.closest('[data-board]');
            if (!button) return;

            state.boardId = button.dataset.board;
            renderBoardTabs();
            renderShelf();
        });

        ui.classTabs.addEventListener('click', (event) => {
            const button = event.target.closest('[data-class]');
            if (!button) return;

            state.classLevel = button.dataset.class;
            renderClassTabs();
            renderShelf();
        });

        ui.shelf.addEventListener('click', (event) => {
            // Handle "Open Book" button clicks
            const openButton = event.target.closest('.library-book-open');
            if (openButton) {
                const bookId = openButton.dataset.bookId;
                const book = library.getBookById(bookId);
                openBook(book);
                return;
            }

            // Handle book card clicks (select book)
            const card = event.target.closest('[data-book-id]');
            if (!card) return;

            state.selectedBookId = card.dataset.bookId;
            renderShelf();
        });

        if (ui.agentPrompts) {
            ui.agentPrompts.addEventListener('click', (event) => {
                const button = event.target.closest('[data-prompt]');
                if (!button) return;
                submitAgentPrompt(button.dataset.prompt);
            });
        }

        if (ui.agentForm) {
            ui.agentForm.addEventListener('submit', (event) => {
                event.preventDefault();
                submitAgentPrompt(ui.agentInput.value);
            });
        }
    }

    function renderOverview() {
        ui.overview.innerHTML = library.boards.map((board) => {
            const overview = library.getBoardOverview(board.id);
            return `
                <article class="library-overview-card">
                    <h3>${escapeHtml(board.name)} <span class="section-badge">${escapeHtml(board.badge)}</span></h3>
                    <p>${escapeHtml(board.description)}</p>
                    <div class="library-overview-meta">
                        <span>${overview.totalBooks} books</span>
                        <span>Classes 1-12</span>
                        <span>${overview.subjects.length} subjects</span>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderBoardTabs() {
        ui.boardTabs.innerHTML = library.boards.map((board) => `
            <button type="button" class="library-board-tab${board.id === state.boardId ? ' active' : ''}" data-board="${board.id}">
                ${escapeHtml(board.name)}
            </button>
        `).join('');
    }

    function renderClassTabs() {
        const allButton = `
            <button type="button" class="library-class-tab${state.classLevel === 'all' ? ' active' : ''}" data-class="all">
                All Classes
            </button>
        `;

        ui.classTabs.innerHTML = allButton + library.classes.map((classLevel) => `
            <button type="button" class="library-class-tab${String(classLevel) === String(state.classLevel) ? ' active' : ''}" data-class="${classLevel}">
                Class ${classLevel}
            </button>
        `).join('');
    }

    function renderShelf() {
        const books = library.searchBooks(state.query, state.boardId, state.classLevel);
        const board = library.getBoard(state.boardId);
        const classLabel = state.classLevel === 'all' ? 'all classes' : `Class ${state.classLevel}`;

        if (books.length && (!state.selectedBookId || !books.some((book) => book.id === state.selectedBookId))) {
            state.selectedBookId = books[0].id;
        }

        ui.resultsMeta.textContent = `${books.length} books found in ${board.name} for ${classLabel}${state.query ? ` matching "${state.query}"` : ''}.`;

        if (!books.length) {
            ui.shelf.innerHTML = `
                <div class="library-empty-state">
                    <i class="fas fa-book-dead"></i>
                    <h3>No books matched this filter.</h3>
                    <p>Try another board, class, or a broader search term.</p>
                </div>
            `;
            renderReader(null);
            return;
        }

        if (state.classLevel !== 'all') {
            ui.shelf.innerHTML = renderClassGroup(Number(state.classLevel), books);
            renderReader(library.getBookById(state.selectedBookId));
            return;
        }

        const groups = library.classes
            .map((classLevel) => {
                const classBooks = books.filter((book) => book.classLevel === classLevel);
                if (!classBooks.length) return '';
                return renderClassGroup(classLevel, classBooks);
            })
            .join('');

        ui.shelf.innerHTML = groups;
        renderReader(library.getBookById(state.selectedBookId));
    }

    function renderClassGroup(classLevel, books) {
        return `
            <section class="library-class-group">
                <div class="library-class-heading">
                    <h3>Class ${classLevel}</h3>
                    <span>${books.length} books</span>
                </div>
                <div class="library-book-grid">
                    ${books.map(renderBookCard).join('')}
                </div>
            </section>
        `;
    }

    function renderBookCard(book) {
        return `
            <article class="library-book-card${book.id === state.selectedBookId ? ' active' : ''}">
                <h4>${escapeHtml(book.title)}</h4>
                <p>${escapeHtml(book.description)}</p>
                <div class="library-book-meta">
                    <span>${escapeHtml(book.subject)}</span>
                    <span>${escapeHtml(book.stream)}</span>
                </div>
                <div class="library-book-tags">
                    ${book.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="library-book-actions">
                    <small>${escapeHtml(book.reader.access)} access</small>
                    <button type="button" class="library-book-open" data-book-id="${book.id}">Open Book</button>
                </div>
            </article>
        `;
    }

    function renderReader(book) {
        if (!ui.readerTitle || !ui.readerChapters) return;

        if (!book) {
            ui.readerTitle.textContent = 'Open a Book';
            ui.readerStatus.textContent = 'Preview';
            ui.readerDescription.textContent = 'Select any book card from the shelf to open its preview, chapters, and access notes here.';
            ui.readerMeta.innerHTML = '';
            ui.readerNote.textContent = 'No book is selected.';
            ui.readerChapters.innerHTML = '';
            return;
        }

        ui.readerTitle.textContent = book.title;
        ui.readerStatus.textContent = titleCase(book.reader.access);
        ui.readerDescription.textContent = book.description;
        ui.readerMeta.innerHTML = `
            <span>${escapeHtml(book.board)}</span>
            <span>Class ${book.classLevel}</span>
            <span>${escapeHtml(book.subject)}</span>
            <span>${escapeHtml(book.stream)}</span>
        `;
        ui.readerNote.textContent = book.reader.availabilityNote || 'Preview is available for this book.';
        ui.readerChapters.innerHTML = (book.reader.chapters || []).map((chapter) => `
            <article class="library-reader-chapter">
                <h4>Chapter ${chapter.number}: ${escapeHtml(chapter.title)}</h4>
                <p>${escapeHtml(chapter.summary)}</p>
                <div class="library-reader-concepts">
                    ${(chapter.concepts || []).map((concept) => `<span>${escapeHtml(concept)}</span>`).join('')}
                </div>
            </article>
        `).join('');
    }

    function initAgent() {
        appendAgentMessage('agent', 'I am the EduNova Library AI Agent. I can answer only from the books currently listed in this library module for NCERT, ICSE, and State Boards, Classes 1 to 12. For chapter questions, include the class and subject.');
    }

    function submitAgentPrompt(rawPrompt) {
        const prompt = String(rawPrompt || '').trim();
        if (!prompt) return;

        appendAgentMessage('user', prompt);
        showTypingIndicator();
        
        // Simulate network delay for realistic UI
        setTimeout(() => {
            removeTypingIndicator();
            answerQuestion(prompt);
        }, 800 + Math.random() * 600);
        
        ui.agentInput.value = '';
    }

    function answerQuestion(question) {
        // First, try to answer from library books
        const libraryAnswer = answerLibraryQuestion(question);
        
        // If library has a specific answer (not a fallback), use it
        if (libraryAnswer && !libraryAnswer.includes('I can answer only from the books currently listed')) {
            appendAgentMessage('agent', libraryAnswer);
            return;
        }
        
        // Otherwise, try external knowledge sources
        answerFromExternalSource(question);
    }

    function answerFromExternalSource(question) {
        const normalized = question.toLowerCase().trim();
        
        // Provide comprehensive answer directly for general knowledge
        fetchGeneralAnswer(question);
    }

    function isGeneralKnowledge(text) {
        const keywords = ['what is', 'who is', 'when', 'where', 'why', 'how', 'define', 'explain', 'tell me', 'describe'];
        return keywords.some(kw => text.includes(kw));
    }

    function fetchGeneralAnswer(question) {
        const answer = generateComprehensiveAnswer(question);
        appendAgentMessage('agent', answer);
    }

    function generateComprehensiveAnswer(question) {
        const normalized = question.toLowerCase();
        
        // Science topics
        if (/photosynthesis/.test(normalized)) {
            return `🌿 Photosynthesis

Photosynthesis is the process by which green plants, algae, and some bacteria use sunlight to produce their own food. It converts light energy into chemical energy stored in glucose (a type of sugar).

🔬 Basic Concept
In simple terms: Plants take in carbon dioxide from air and water from soil, use sunlight energy, and create glucose (food) while releasing oxygen.

Basic Equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Carbon dioxide + Water + Sunlight → Glucose + Oxygen

🌞 Where Does It Happen?
• Photosynthesis occurs in chloroplasts of plant cells
• Mainly happens in leaves (largest surface area for sunlight)
• Chlorophyll (green pigment) captures light energy
• Green color of plants is because of this pigment

⚙️ Two Main Stages

1️⃣ Light-Dependent Reactions (Light Reaction)
   Location: Thylakoid membranes in chloroplasts
   • Need sunlight to occur
   • Water molecules are broken down
   • Produces: ATP and NADPH (energy carriers)
   • Releases oxygen as byproduct

2️⃣ Light-Independent Reactions (Calvin Cycle)
   Location: Stroma of chloroplast
   • Don't directly need sunlight
   • Use energy from light reactions
   • Fix carbon dioxide into glucose
   • Produces: Sugar/Glucose

🌍 Why Is Photosynthesis Important?
✅ Food Production: Base of all food chains
✅ Oxygen Release: Provides oxygen for respiration
✅ Climate Balance: Absorbs CO₂ and releases O₂
✅ Energy Source: Converts solar energy into chemical energy
✅ Life Support: Directly or indirectly supports all life

📝 Simple Summary
Plants use: ☀️ Sunlight, 💧 Water, 💨 Carbon Dioxide
To create: 🍎 Food (Glucose), 🌬️ Oxygen

💡 Fun Fact: Photosynthesis produces almost all the oxygen in Earth's atmosphere!`;
        }
        
        if (/respiration|cellular respiration/.test(normalized)) {
            return `🫁 Cellular Respiration

Cellular respiration is the process by which cells break down glucose and other nutrients to release energy (ATP) that powers cellular activities.

🔬 Basic Concept
Cells use glucose as fuel, burn it with oxygen, and convert the energy into ATP (usable energy), releasing carbon dioxide and water.

Basic Equation:
C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)

Glucose + Oxygen → Carbon Dioxide + Water + Energy

⚡ Types of Cellular Respiration

1️⃣ Aerobic Respiration (with oxygen)
   Location: Mitochondria
   • Requires oxygen
   • Most efficient - produces ~30-32 ATP molecules
   • Produces CO₂ and water
   • Occurs in most organisms

2️⃣ Anaerobic Respiration (without oxygen)
   Location: Cytoplasm
   • No oxygen required
   • Less efficient - produces 2 ATP molecules
   • Produces lactic acid or alcohol
   • Example: Muscle cells during intense exercise

🔄 Three Main Stages (Aerobic)

Stage 1: Glycolysis (Cytoplasm)
   • Glucose breaks into 2 pyruvate molecules
   • Produces 2 ATP + 2 NADH

Stage 2: Krebs Cycle (Mitochondria)
   • Pyruvate enters citric acid cycle
   • Releases CO₂, produces energy carriers

Stage 3: Electron Transport Chain
   • Uses energy carriers (NADH, FADH₂)
   • Produces ~28-30 ATP molecules
   • Final byproducts: Water and CO₂

💪 Why Is Respiration Important?
✅ Energy Production: Main source of ATP
✅ Growth: Provides energy for building cells
✅ Movement: Powers muscle contractions
✅ Heat: Maintains body temperature
✅ Life Functions: Supports all cellular processes

📝 Quick Comparison
Photosynthesis: Light energy → Chemical energy (stored in glucose)
Respiration: Chemical energy → Usable energy (ATP)

They are essentially opposite processes!`;
        }
        
        if (/mitochondria|mitochondrion/.test(normalized)) {
            return `🔋 Mitochondria

The Powerhouse of the Cell

Mitochondria are double-membrane organelles found in eukaryotic cells that produce energy (ATP) through cellular respiration.

🏗️ Structure

Outer Membrane: Smooth, controls what enters
Inner Membrane: Highly folded (cristae) - site of energy production
Matrix: Inner compartment where Krebs Cycle occurs

The folds (cristae) increase surface area for more ATP production!

⚡ Main Functions

1️⃣ ATP Production: Primary role using aerobic respiration
2️⃣ Heat Generation: Uncoupling proteins generate body heat
3️⃣ Calcium Regulation: Stores and releases calcium ions
4️⃣ Metabolism: Involved in amino acid and fat metabolism

🔬 How It Produces Energy

1. Glucose enters the mitochondria
2. Krebs Cycle breaks it down, releasing energy
3. Electron Transport Chain uses that energy to create ATP
4. CO₂ and water are released as waste

One glucose molecule → ~30-32 ATP molecules!

🧬 Unique Features

✅ Own DNA: Mitochondrial DNA (mtDNA) inherited from mother
✅ Own Ribosomes: Can partially synthesize their own proteins
✅ Can Divide: Reproduce independently
✅ Evolutionary Origin: Thought to be ancient bacteria

📊 Where Are They Found?

• Abundant in: Muscle cells, nerve cells, heart cells
• Few in: Red blood cells, skin cells
• Number varies: 100-10,000 per cell depending on energy needs

💡 Disease Connection
Mitochondrial diseases occur when mitochondria don't produce enough ATP, causing muscle weakness, nerve problems, and organ failures.

📝 Remember
Cells with high energy demands (muscles, brain) have MORE mitochondria!`;
        }
        
        if (/photosynthesis|respiration|mitochondria/.test(normalized)) {
            return generateComprehensiveAnswer(question.replace(/and.*/, ''));
        }
        
        if (/dna|genetics/.test(normalized)) {
            return `🧬 DNA (Deoxyribonucleic Acid)

The Blueprint of Life

DNA is a molecule that carries genetic instructions for all living organisms. It contains the code for building and maintaining life.

🔬 Basic Structure

DNA consists of:
• Sugar (deoxyribose)
• Phosphate groups
• Nitrogenous bases (A, T, G, C)

These form a Double Helix - a twisted ladder shape!

The Bases:
• Adenine (A) - pairs with Thymine (T)
• Guanine (G) - pairs with Cytosine (C)

🧩 Key Components

1️⃣ Nucleotides: Basic building blocks
   Contain: Sugar + Phosphate + Base

2️⃣ Base Pairs: A-T and G-C (complementary)
   Hold the strands together

3️⃣ Genes: Specific DNA segments that code for proteins

4️⃣ Chromosomes: DNA packaged with proteins

📍 Location
• Nucleus (most DNA)
• Mitochondria (some DNA)
• Chloroplasts (in plants)

💼 Main Functions

✅ Store Genetic Information: Instructions for traits
✅ Protein Synthesis: Codes for amino acid sequences
✅ Reproduction: Passes genes to offspring
✅ Mutation & Evolution: Source of variation

🔄 DNA Replication
DNA copies itself before cell division:
1. Double helix unwinds
2. Each strand serves as template
3. New complementary strands form
4. Two identical DNA molecules result

📊 Some DNA Facts
• 3 billion base pairs in human DNA
• 46 chromosomes in human cells
• 20,000-25,000 genes in humans
• DNA would stretch 6 feet if unwound!

🎯 Importance
DNA is the instruction manual for life - it determines your traits, abilities, and inherited characteristics!`;
        }
        
        if (/evolution|natural selection/.test(normalized)) {
            return `🌿 Evolution & Natural Selection

How Life Changes Over Time

Evolution is the process of gradual change in populations of organisms over many generations, primarily driven by natural selection.

🔬 What Is Evolution?

Evolution is NOT:
❌ Random change
❌ An organism changing during its lifetime
❌ A goal-oriented process

Evolution IS:
✅ Gradual change in populations over generations
✅ Based on heritable genetic variations
✅ Result of environmental pressures
✅ Observable in fossils and living organisms

📊 Charles Darwin's Key Concepts

1️⃣ Variation: Individuals in a population differ
2️⃣ Heredity: Traits can be inherited
3️⃣ Competition: Organisms compete for resources
4️⃣ Survival of the Fittest: Better adapted survive
5️⃣ Accumulation: Small changes add up over time

🎯 Natural Selection Process

1. Population has genetic variation
2. Some traits are better suited to environment
3. Better-adapted organisms survive and reproduce more
4. Beneficial traits become more common
5. Over generations, population changes
6. Eventually: New species forms!

🌍 Evidence of Evolution

✅ Fossil Records: Show gradual changes over time
✅ Comparative Anatomy: Similar structures in different species
✅ DNA Similarity: Genetic code similar across species
✅ Observed Changes: Bacteria resistance, moth colors
✅ Biogeography: Species distribution matches common ancestry

🔄 Mechanisms

Mutation: Random changes in DNA create variation
Gene Flow: Genes move between populations
Genetic Drift: Random change (especially in small groups)
Natural Selection: Environment selects traits

📈 Results of Evolution

• Adaptation: Traits suited to environment
• Biodiversity: Different species in ecosystems
• Extinction: Species unable to adapt disappear
• New Species: Isolated populations diverge

💡 Key Examples
• Darwin's Finches: Different beak shapes evolved
• Peppered Moths: Color changed with industrial pollution
• Horse Evolution: Size and foot structure changed over 55 million years
• Antibiotic Resistance: Bacteria evolve quickly

📝 Timeline
Life on Earth: ~3.8 billion years
Dinosaurs: Existed for 165 million years
Humans: Appeared ~300,000 years ago

Evolution explains the diversity and unity of life!`;
        }
        
        if (/math|algebra|geometry|calculus/.test(normalized)) {
            return `📐 Mathematics Help

I can help with various math topics! Here's some guidance:

Topics I can explain:

📊 Algebra
• Linear equations
• Quadratic equations
• Polynomials
• Systems of equations
• Inequalities

📐 Geometry
• Shapes and properties
• Area and perimeter
• Volume
• Angles and triangles
• Circle properties
• Coordinate geometry

📈 Calculus
• Limits and continuity
• Derivatives
• Integrals
• Applications

🔢 Trigonometry
• Sin, cos, tan
• Identities
• Applications

📚 For Detailed Help:
1️⃣ Ask a specific topic (e.g., "What is a quadratic equation?")
2️⃣ Ask step-by-step solutions
3️⃣ Check NCERT Mathematics books in the library for:
   • Solved examples
   • Practice problems
   • Chapter-wise concepts

Which specific math topic would you like help with?`;
        }
        
        // Default comprehensive answer for other topics
        return `📚 Information Request

I found your question about: "${question}"

Here's what I can help with:

✅ Science Topics:
   • Biology (cells, genetics, photosynthesis, respiration)
   • Chemistry (atoms, elements, reactions)
   • Physics (motion, energy, forces)

✅ History & Geography:
   • Historical events and civilizations
   • Geographic features and regions
   • Cultural information

✅ Language & Literature:
   • Grammar and writing
   • Literature analysis
   • Language learning

✅ General Knowledge:
   • Science concepts
   • Historical facts
   • Technology basics

💡 For Better Answers:
Please ask a more specific question! For example:
• "What is photosynthesis?"
• "Explain evolution and natural selection"
• "How do mitochondria work?"
• "What is DNA?"

I'll provide detailed explanations with examples, diagrams (in text form), and key concepts!

📖 Also available in the Library:
Check NCERT textbooks for Class-specific curriculum content!`;
    }

    function fetchMathAnswer(question) {
        const answer = 'For mathematical problems, I recommend:\n\n1. 📐 Check NCERT Mathematics textbooks in the library - they have detailed solved examples\n2. 🧮 Look for your specific chapter in the Mathematics section\n3. 📖 Use the concepts listed under each chapter for step-by-step solutions\n\nWhich class/chapter would you like help with?';
        appendAgentMessage('agent', answer);
    }

    function sanitizeHtml(html) {
        return html.replace(/<[^>]*>/g, '').substring(0, 200);
    }

    function answerLibraryQuestion(question) {
        const normalized = question.toLowerCase().trim();

        if (!normalized) {
            return 'Ask me about available boards, a class, or a specific book subject inside the library.';
        }

        if (GREETINGS.some((item) => normalized.includes(item))) {
            return 'Hello. Ask me which books are available by board and class, and I will answer only from the library catalog on this page.';
        }

        if (/(subscription|price|pricing|cost|fee|plan)/.test(normalized)) {
            return 'Library subscription details are not decided yet. The current module only organizes books by board and class for Classes 1 to 12.';
        }

        if (/(which boards|available boards|boards are available|what boards)/.test(normalized)) {
            return `The current library contains three board collections: ${library.boards.map((board) => board.name).join(', ')}. Each collection currently covers Classes 1 to 12 only.`;
        }

        const detectedBoard = detectBoard(normalized);
        const detectedClass = extractClass(normalized);
        const detectedSubject = detectSubject(normalized);
        const detectedChapter = extractChapter(normalized);
        const scopedBooks = library.searchBooks('', detectedBoard || 'all', detectedClass || 'all');

        if (detectedBoard === 'ncert' && detectedSubject === 'Mathematics' && detectedChapter === 1) {
            if (!detectedClass) {
                return 'I need the class first. NCERT Mathematics has a different Chapter 1 for each class from 1 to 12. Ask like "Explain Chapter 1 of NCERT Class 6 Mathematics" or "Answer Class 10 NCERT Mathematics Chapter 1 question 2".';
            }

            const mathBook = library.findBook('ncert', detectedClass, 'mathematics');
            if (!mathBook || !mathBook.reader || !mathBook.reader.chapters || !mathBook.reader.chapters.length) {
                return `I could not find the Chapter 1 preview for NCERT Class ${detectedClass} Mathematics in the current library data.`;
            }

            const firstChapter = mathBook.reader.chapters[0];
            if (/(answer all|all questions|every question|solve all|complete chapter)/.test(normalized)) {
                return `NCERT Class ${detectedClass} Mathematics Chapter 1 is "${firstChapter.title}". I can explain the chapter concepts and help solve questions one by one, but the current library preview does not contain the full exercise-answer bank for every question. Ask a specific exercise or question text, or add the full chapter question set to the library for complete answer-all support.`;
            }

            return `NCERT Class ${detectedClass} Mathematics Chapter 1 is "${firstChapter.title}". It focuses on ${firstChapter.concepts.join(', ')}. ${mathBook.reader.answeringNote || 'Ask a specific question from this chapter and I will answer from the available preview data.'}`;
        }

        if ((detectedBoard || detectedClass) && /(show|list|available|catalog|shelf|books?)/.test(normalized)) {
            if (!scopedBooks.length) {
                return 'I could not find any books in the current catalog for that board or class combination.';
            }

            const selection = scopedBooks.slice(0, 6).map((book) => `• ${book.title} (${book.subject})`).join('\n');
            const suffix = scopedBooks.length > 6 ? `\n\nI found ${scopedBooks.length} books in total${describeSelection(detectedBoard, detectedClass)}.` : '';
            return `Here are the available books${describeSelection(detectedBoard, detectedClass)}:\n\n${selection}${suffix}`;
        }

        if (/(how many|count|total)/.test(normalized)) {
            const count = scopedBooks.length;
            if (!count) {
                return 'I could not find any books in the current catalog for that board or class combination.';
            }
            return `There are ${count} books in the current library selection${describeSelection(detectedBoard, detectedClass)}.`;
        }

        const matches = library.searchBooks(question, detectedBoard || 'all', detectedClass || 'all');
        if (matches.length) {
            const topMatches = matches.slice(0, 6).map((book) => `• ${book.title} (${book.board}, Class ${book.classLevel}, ${book.subject})`);
            const prefix = detectedBoard || detectedClass
                ? `Here are the matching books${describeSelection(detectedBoard, detectedClass)}:`
                : 'Here are the closest matching books from the current library catalog:';
            const suffix = matches.length > 6 ? `\n\nI found ${matches.length} matching books in total. Use the board and class filters to narrow further.` : '';
            return `${prefix}\n\n${topMatches.join('\n')}${suffix}`;
        }

        if (detectedBoard || detectedClass) {
            if (scopedBooks.length) {
                const sample = scopedBooks.slice(0, 5).map((book) => `• ${book.title}`).join('\n');
                return `I could not find that exact subject in the current library selection${describeSelection(detectedBoard, detectedClass)}. These books are available instead:\n\n${sample}`;
            }
        }

        return 'I can answer only from the books currently listed in this library module. Try asking about NCERT, ICSE, or State Boards for Classes 1 to 12, or name a subject such as Mathematics, Science, Biology, or Accountancy.';
    }

    function describeSelection(boardId, classLevel) {
        const parts = [];
        if (boardId) {
            const board = library.getBoard(boardId);
            if (board) parts.push(board.name);
        }
        if (classLevel) parts.push(`Class ${classLevel}`);
        return parts.length ? ` for ${parts.join(', ')}` : '';
    }

    function detectBoard(text) {
        const matchingBoard = library.boards.find((board) => board.aliases.some((alias) => text.includes(alias)));
        return matchingBoard ? matchingBoard.id : null;
    }

    function extractClass(text) {
        const match = text.match(/class\s*(1[0-2]|[1-9])\b/);
        return match ? Number(match[1]) : null;
    }

    function extractChapter(text) {
        if (/first chapter|chapter one|1st chapter/.test(text)) return 1;
        const match = text.match(/chapter\s*(\d+)/);
        return match ? Number(match[1]) : null;
    }

    function detectSubject(text) {
        const normalizedSubject = library.normalizeSubjectQuery(text);
        return normalizedSubject || null;
    }

    function titleCase(value) {
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    function appendAgentMessage(type, text) {
        const row = document.createElement('div');
        row.className = `library-agent-message ${type}`;

        const bubble = document.createElement('div');
        bubble.className = `library-agent-bubble ${type}`;
        bubble.textContent = text;

        row.appendChild(bubble);
        ui.agentMessages.appendChild(row);
        ui.agentMessages.scrollTop = ui.agentMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const row = document.createElement('div');
        row.className = 'library-agent-message agent';
        row.id = 'typing-indicator';

        const bubble = document.createElement('div');
        bubble.className = 'library-agent-typing';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            bubble.appendChild(dot);
        }

        row.appendChild(bubble);
        ui.agentMessages.appendChild(row);
        ui.agentMessages.scrollTop = ui.agentMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();