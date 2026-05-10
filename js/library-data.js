(function () {
    'use strict';

    const PRIMARY_SUBJECTS = ['English', 'Mathematics', 'Environmental Studies', 'Hindi'];
    const MIDDLE_SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'];
    const SECONDARY_SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'];
    const SUBJECT_ALIASES = {
        mathematics: ['mathematics', 'maths', 'math', 'arithmetic'],
        english: ['english'],
        science: ['science'],
        biology: ['biology'],
        physics: ['physics'],
        chemistry: ['chemistry'],
        accountancy: ['accountancy', 'accounts'],
        economics: ['economics'],
        'social science': ['social science', 'sst', 'social studies'],
        hindi: ['hindi'],
        history: ['history'],
        geography: ['geography'],
        'political science': ['political science', 'civics'],
        sociology: ['sociology'],
        'computer studies': ['computer studies', 'computer science', 'computers'],
        'business studies': ['business studies'],
        'environmental studies': ['environmental studies', 'evs']
    };

    // Real NCERT Textbook Catalog (Classes 1-12)
    const NCERT_TEXTBOOKS = {
        1: {
            English: { title: 'Marigold', description: 'Introductory English course with colorful stories and illustrations for Class 1' },
            Mathematics: { title: 'Math-Magic', description: 'Foundational mathematics with engaging number activities for Class 1' },
            Hindi: { title: 'Rimjhim', description: 'Introduction to Hindi language through stories and activities for Class 1' },
            'Environmental Studies': { title: 'Looking Around', description: 'Basic environmental awareness and observation skills for Class 1' }
        },
        2: {
            English: { title: 'Marigold', description: 'Intermediate English with stories, poems and language activities for Class 2' },
            Mathematics: { title: 'Math-Magic', description: 'Number concepts, addition, subtraction and basic geometry for Class 2' },
            Hindi: { title: 'Rimjhim', description: 'Hindi language development through stories, poems and rhymes for Class 2' },
            'Environmental Studies': { title: 'Looking Around', description: 'Environmental studies covering plants, animals and social awareness for Class 2' }
        },
        3: {
            English: { title: 'Marigold', description: 'English language and literature with stories, dialogues and comprehension for Class 3' },
            Mathematics: { title: 'Math-Magic', description: 'Multiplication, division, fractions and basic data handling for Class 3' },
            Hindi: { title: 'Rimjhim', description: 'Hindi language development with prose and poems for Class 3' },
            'Environmental Studies': { title: 'Looking Around', description: 'Life skills, health awareness and basic science concepts for Class 3' }
        },
        4: {
            English: { title: 'Marigold', description: 'English language skills and literature comprehension for Class 4' },
            Mathematics: { title: 'Math-Magic', description: 'Large numbers, multiplication, division, fractions and geometry for Class 4' },
            Hindi: { title: 'Rimjhim', description: 'Comprehensive Hindi language and literature for Class 4' },
            'Environmental Studies': { title: 'Looking Around', description: 'Science, social science and life skills integrated curriculum for Class 4' }
        },
        5: {
            English: { title: 'Marigold', description: 'Advanced English language and comprehension for Class 5' },
            Mathematics: { title: 'Math-Magic', description: 'Decimals, percentages, measurements and basic statistics for Class 5' },
            Hindi: { title: 'Rimjhim', description: 'Advanced Hindi language, literature and creative writing for Class 5' },
            'Environmental Studies': { title: 'Looking Around', description: 'Integrated environmental science and social studies for Class 5' }
        },
        6: {
            English: { title: 'Honeysuckle', description: 'English language and literature textbook for Class 6' },
            Mathematics: { title: 'Mathematics', description: 'Number systems, geometry, algebra basics and data handling for Class 6' },
            Hindi: { title: 'Vasant', description: 'Hindi language and literature for Class 6' },
            Science: { title: 'Science', description: 'Basic physical science, life science and earth science for Class 6' },
            'Social Science': { title: 'Our Pasts–I, The Earth Our Habitat, Social and Political Life–I', description: 'History, geography and civics for Class 6' }
        },
        7: {
            English: { title: 'Honeysuckle', description: 'English language and literature with diverse texts for Class 7' },
            Mathematics: { title: 'Mathematics', description: 'Fractions, algebraic expressions, geometry and statistics for Class 7' },
            Hindi: { title: 'Vasant', description: 'Hindi literature and comprehension skills for Class 7' },
            Science: { title: 'Science', description: 'Physics, chemistry and biology concepts for Class 7' },
            'Social Science': { title: 'Our Pasts–II, Our Environment, Social and Political Life–II', description: 'History, geography and civics for Class 7' }
        },
        8: {
            English: { title: 'Honeydew', description: 'English language and literature for Class 8' },
            Mathematics: { title: 'Mathematics', description: 'Rational numbers, exponents, algebraic expressions and geometry for Class 8' },
            Hindi: { title: 'Vasant', description: 'Hindi language and literature for Class 8' },
            Science: { title: 'Science', description: 'Cell structure, reproduction, force and pressure, electricity for Class 8' },
            'Social Science': { title: 'Our Pasts–III, Resources and Development, Social and Political Life–III', description: 'History, geography and civics for Class 8' }
        },
        9: {
            English: { title: 'Beehive / Moments', description: 'English textbook and supplementary reader for Class 9' },
            Mathematics: { title: 'Mathematics', description: 'Number systems, polynomials, geometry, coordinates and statistics for Class 9' },
            Hindi: { title: 'Kshitij / Sparsh', description: 'Hindi textbook and supplementary reader for Class 9' },
            Science: { title: 'Science', description: 'Physics, chemistry and biology for Class 9 (Matter, Atoms, Forces, Life Processes)' },
            'Social Science': { title: 'India and the Contemporary World–I, Contemporary India–I, Democratic Politics–I', description: 'History, geography and civics for Class 9' }
        },
        10: {
            English: { title: 'First Flight / Footprints Without Feet', description: 'English textbook and supplementary reader for Class 10' },
            Mathematics: { title: 'Mathematics', description: 'Real numbers, polynomials, trigonometry, geometry and statistics for Class 10' },
            Hindi: { title: 'Kshitij / Sparsh', description: 'Hindi textbook and supplementary reader for Class 10' },
            Science: { title: 'Science', description: 'Physics, chemistry and biology for Class 10 (Electricity, Acids, Genetics, Evolution)' },
            'Social Science': { title: 'India and the Contemporary World–II, Contemporary India–II, Democratic Politics–II', description: 'History, geography and civics for Class 10' }
        },
        11: {
            'Science-Physics': { title: 'Physics', stream: 'Science', description: 'Mechanics, waves, thermodynamics, electricity and magnetism for Class 11' },
            'Science-Chemistry': { title: 'Chemistry', stream: 'Science', description: 'Chemical bonding, thermodynamics, equilibrium, organic chemistry for Class 11' },
            'Science-Mathematics': { title: 'Mathematics', stream: 'Science', description: 'Functions, limits, derivatives, conic sections, probability for Class 11' },
            'Science-Biology': { title: 'Biology', stream: 'Science', description: 'Cell structure, photosynthesis, respiration, genetics for Class 11' },
            'English-General': { title: 'Hornbill / Snapshots', stream: 'General', description: 'English textbook and supplementary reader for Class 11' },
            'Hindi-General': { title: 'Aroh / Vitan', stream: 'General', description: 'Hindi textbook and supplementary reader for Class 11' },
            'Commerce-Accountancy': { title: 'Accountancy', stream: 'Commerce', description: 'Financial accounting basics for Class 11' },
            'Commerce-Economics': { title: 'Introductory Microeconomics', stream: 'Commerce', description: 'Economics fundamentals for Class 11' },
            'Commerce-BusinessStudies': { title: 'Business Studies', stream: 'Commerce', description: 'Business fundamentals and organization for Class 11' },
            'Arts-History': { title: 'Themes in World History', stream: 'Arts', description: 'World history themes for Class 11' },
            'Arts-Geography': { title: 'Fundamentals of Physical Geography', stream: 'Arts', description: 'Physical geography basics for Class 11' },
            'Arts-PoliticalScience': { title: 'Political Theory', stream: 'Arts', description: 'Political science concepts for Class 11' },
            'Arts-Sociology': { title: 'Introduction to Sociology', stream: 'Arts', description: 'Sociology basics for Class 11' }
        },
        12: {
            'Science-Physics': { title: 'Physics', stream: 'Science', description: 'Electrostatics, optics, semiconductors, nuclei for Class 12' },
            'Science-Chemistry': { title: 'Chemistry', stream: 'Science', description: 'Solutions, electrochemistry, kinetics, polymers for Class 12' },
            'Science-Mathematics': { title: 'Mathematics', stream: 'Science', description: 'Relations, calculus, vectors, 3D geometry, linear programming for Class 12' },
            'Science-Biology': { title: 'Biology', stream: 'Science', description: 'Reproduction, genetics, molecular biology, evolution for Class 12' },
            'English-General': { title: 'Flamingo / Vistas', stream: 'General', description: 'English textbook and supplementary reader for Class 12' },
            'Hindi-General': { title: 'Antra / Antral', stream: 'General', description: 'Hindi textbook and supplementary reader for Class 12' },
            'Commerce-Accountancy': { title: 'Accountancy', stream: 'Commerce', description: 'Advanced financial and management accounting for Class 12' },
            'Commerce-Economics': { title: 'Introductory Macroeconomics', stream: 'Commerce', description: 'Macroeconomics for Class 12' },
            'Commerce-BusinessStudies': { title: 'Business Studies', stream: 'Commerce', description: 'Advanced business management and organization for Class 12' },
            'Arts-History': { title: 'Themes in Indian History', stream: 'Arts', description: 'Indian history themes for Class 12' },
            'Arts-Geography': { title: 'Fundamentals of Human Geography', stream: 'Arts', description: 'Human geography for Class 12' },
            'Arts-PoliticalScience': { title: 'Politics in India since Independence', stream: 'Arts', description: 'Indian political science for Class 12' },
            'Arts-Sociology': { title: 'Indian Society', stream: 'Arts', description: 'Sociology of Indian society for Class 12' }
        }
    };

    const NCERT_MATH_FIRST_CHAPTERS = {
        1: { title: 'Shapes and Space', concepts: ['identifying shapes', 'understanding positions', 'noticing patterns around us'] },
        2: { title: 'What Is Long, What Is Round?', concepts: ['comparing lengths', 'recognising curved and round objects', 'basic measurement vocabulary'] },
        3: { title: 'Where to Look From', concepts: ['viewpoints', 'top and side views', 'observing objects from different directions'] },
        4: { title: 'Building with Bricks', concepts: ['patterns in structures', 'counting layers', 'visual reasoning'] },
        5: { title: 'The Fish Tale', concepts: ['large numbers', 'place value', 'reading and writing number names'] },
        6: { title: 'Knowing Our Numbers', concepts: ['place value', 'comparing numbers', 'estimation and number system basics'] },
        7: { title: 'Integers', concepts: ['positive and negative numbers', 'number line operations', 'ordering integers'] },
        8: { title: 'Rational Numbers', concepts: ['fractions as rational numbers', 'equivalent forms', 'operations on rational numbers'] },
        9: { title: 'Number Systems', concepts: ['real numbers', 'irrational numbers', 'decimal expansion'] },
        10: { title: 'Real Numbers', concepts: ['Euclid division lemma', 'HCF and LCM', 'decimal representation of rationals'] },
        11: { title: 'Sets', concepts: ['set notation', 'types of sets', 'operations on sets'] },
        12: { title: 'Relations and Functions', concepts: ['ordered pairs', 'domain and range', 'types of relations and functions'] }
    };

    const SENIOR_SECONDARY_STREAMS = {
        science: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
        commerce: ['English', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics'],
        arts: ['English', 'History', 'Political Science', 'Geography', 'Sociology', 'Economics']
    };

    const BOARD_CONFIG = [
        {
            id: 'ncert',
            name: 'NCERT',
            badge: 'National Curriculum',
            description: 'Core NCERT textbooks aligned for Classes 1 to 12 across foundational, middle, secondary, and senior secondary subjects.',
            aliases: ['ncert', 'cbse', 'national curriculum'],
            note: 'Most titles align with NCERT classroom and board preparation patterns.'
        },
        {
            id: 'icse',
            name: 'ICSE',
            badge: 'CISCE Curriculum',
            description: 'ICSE and ISC-aligned textbooks for Classes 1 to 12 with strong emphasis on language depth, problem solving, and applications.',
            aliases: ['icse', 'isc', 'cisce'],
            note: 'Senior secondary titles cover ISC streams for Science, Commerce, and Arts.'
        },
        {
            id: 'stateboards',
            name: 'State Boards',
            badge: 'Regional Boards',
            description: 'Representative State Board books for Classes 1 to 12 covering regional and state-prescribed school subjects.',
            aliases: ['state board', 'state boards', 'maharashtra board', 'up board', 'tamil nadu board'],
            note: 'Includes representative references from Maharashtra, Uttar Pradesh, and Tamil Nadu boards.'
        }
    ];

    const STATE_SERIES = ['Maharashtra', 'Uttar Pradesh', 'Tamil Nadu'];

    function titleCase(value) {
        return String(value)
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function buildGenericChapters(subject, classNumber) {
        return [
            {
                number: 1,
                title: `Introduction to ${subject}`,
                summary: `Foundational ideas for ${subject} in Class ${classNumber}.`,
                concepts: [`core vocabulary of ${subject.toLowerCase()}`, 'basic understanding', 'guided examples']
            },
            {
                number: 2,
                title: `${subject} in Daily Learning`,
                summary: `Applied classroom usage and everyday examples for ${subject}.`,
                concepts: ['worked examples', 'practice exercises', 'observation-based learning']
            },
            {
                number: 3,
                title: `${subject} Practice and Review`,
                summary: `Review chapter with structured exercises and recap material.`,
                concepts: ['short questions', 'guided revision', 'teacher-led reinforcement']
            }
        ];
    }

    function buildReader(board, classNumber, subject) {
        const normalizedSubject = subject.toLowerCase();
        const genericReader = {
            access: 'preview',
            availabilityNote: 'Interactive preview is available now. Full scanned books or PDFs can be attached later.',
            chapters: buildGenericChapters(subject, classNumber)
        };

        if (board.id === 'ncert' && normalizedSubject === 'mathematics') {
            const chapterOne = NCERT_MATH_FIRST_CHAPTERS[classNumber];
            genericReader.chapters = [
                {
                    number: 1,
                    title: chapterOne.title,
                    summary: `Chapter 1 for NCERT Class ${classNumber} Mathematics focuses on ${chapterOne.concepts.join(', ')}.`,
                    concepts: chapterOne.concepts
                },
                {
                    number: 2,
                    title: 'Guided Practice',
                    summary: 'Worked examples and exercise-driven reinforcement for the same mathematics level.',
                    concepts: ['practice sets', 'teacher explanations', 'step-by-step solving']
                },
                {
                    number: 3,
                    title: 'Review and Assessment',
                    summary: 'Mixed review questions and recap tasks for retention.',
                    concepts: ['revision questions', 'mental maths', 'application tasks']
                }
            ];
            genericReader.answeringNote = 'The library can identify the first chapter and guide concept-based answers, but exact exercise-by-exercise solutions still require the precise class and question text.';
        }

        return genericReader;
    }

    function normalizeSubjectQuery(subjectQuery) {
        const normalized = String(subjectQuery || '').toLowerCase().trim();
        if (!normalized) return '';

        const matchedAlias = Object.entries(SUBJECT_ALIASES).find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)));
        return matchedAlias ? titleCase(matchedAlias[0]) : titleCase(normalized);
    }

    function getSubjectsForClass(classNumber) {
        if (classNumber <= 5) return PRIMARY_SUBJECTS;
        if (classNumber <= 8) return MIDDLE_SUBJECTS;
        if (classNumber <= 10) return SECONDARY_SUBJECTS;
        
        // For senior secondary, extract subjects from real NCERT data
        if (NCERT_TEXTBOOKS[classNumber]) {
            const subjects = new Set();
            Object.keys(NCERT_TEXTBOOKS[classNumber]).forEach(key => {
                const subject = key.includes('-') ? key.split('-')[1] : key;
                subjects.add(subject.replace(/([A-Z])/g, ' $1').trim());
            });
            return Array.from(subjects);
        }
        
        return [];
    }

    function createBook(board, classNumber, subject, extra) {
        return {
            id: `${board.id}-class-${classNumber}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            boardId: board.id,
            board: board.name,
            classLevel: classNumber,
            title: extra.title,
            subject,
            stream: extra.stream || 'General',
            description: extra.description,
            tags: extra.tags,
            reader: extra.reader
        };
    }

    function buildJuniorBooks(board, classNumber) {
        const books = [];
        
        if (board.id === 'ncert' && NCERT_TEXTBOOKS[classNumber]) {
            // Use real NCERT textbook data
            Object.entries(NCERT_TEXTBOOKS[classNumber]).forEach(([subject, bookData]) => {
                books.push(createBook(board, classNumber, subject, {
                    title: `NCERT Class ${classNumber} ${bookData.title}`,
                    description: bookData.description,
                    tags: [board.name, `Class ${classNumber}`, subject, board.badge],
                    reader: buildReader(board, classNumber, subject)
                }));
            });
        } else {
            // Use generic template for ICSE and State Boards
            const subjects = getSubjectsForClass(classNumber);
            const titlePrefix = board.id === 'icse'
                ? 'ICSE'
                : `${STATE_SERIES[(classNumber - 1) % STATE_SERIES.length]} State Board`;

            subjects.forEach((subject) => {
                books.push(createBook(board, classNumber, subject, {
                    title: `${titlePrefix} Class ${classNumber} ${subject}`,
                    description: `${subject} textbook for ${board.name} Class ${classNumber}, curated for the EduNova Library module.`,
                    tags: [board.name, `Class ${classNumber}`, subject, board.badge],
                    reader: buildReader(board, classNumber, subject)
                }));
            });
        }
        
        return books;
    }

    function buildSeniorBooks(board, classNumber) {
        const books = [];
        
        if (board.id === 'ncert' && NCERT_TEXTBOOKS[classNumber]) {
            // Use real NCERT textbook data for senior classes
            Object.entries(NCERT_TEXTBOOKS[classNumber]).forEach(([key, bookData]) => {
                const [stream, subject] = key.includes('-') ? key.split('-') : [bookData.stream || 'General', key];
                const actualSubject = key.includes('-') ? subject.replace(/([A-Z])/g, ' $1').trim() : key;
                
                books.push(createBook(board, classNumber, actualSubject, {
                    title: `NCERT Class ${classNumber} ${bookData.title}`,
                    stream: stream.charAt(0).toUpperCase() + stream.slice(1),
                    description: bookData.description,
                    tags: [board.name, `Class ${classNumber}`, actualSubject, stream, board.badge],
                    reader: buildReader(board, classNumber, actualSubject)
                }));
            });
        } else {
            // Use generic template for other boards
            Object.entries(SENIOR_SECONDARY_STREAMS).forEach(([stream, subjects]) => {
                subjects.forEach((subject) => {
                    const seriesLabel = board.id === 'stateboards'
                        ? `${STATE_SERIES[(classNumber + subject.length) % STATE_SERIES.length]} State Board`
                        : board.name;

                    books.push(createBook(board, classNumber, subject, {
                        title: `${seriesLabel} Class ${classNumber} ${subject}`,
                        stream: stream.charAt(0).toUpperCase() + stream.slice(1),
                        description: `${subject} reference for ${board.name} Class ${classNumber} ${stream} stream learners.`,
                        tags: [board.name, `Class ${classNumber}`, subject, stream, board.badge],
                        reader: buildReader(board, classNumber, subject)
                    }));
                });
            });
        }

        return books;
    }

    function buildCatalog() {
        const catalog = [];

        BOARD_CONFIG.forEach((board) => {
            for (let classNumber = 1; classNumber <= 12; classNumber += 1) {
                if (classNumber <= 10) {
                    catalog.push(...buildJuniorBooks(board, classNumber));
                } else {
                    catalog.push(...buildSeniorBooks(board, classNumber));
                }
            }
        });

        return catalog;
    }

    const books = buildCatalog();

    function listClasses() {
        return Array.from({ length: 12 }, (_, index) => index + 1);
    }

    function getBooks(boardId, classLevel) {
        return books.filter((book) => {
            const boardMatch = !boardId || boardId === 'all' || book.boardId === boardId;
            const classMatch = !classLevel || classLevel === 'all' || book.classLevel === Number(classLevel);
            return boardMatch && classMatch;
        });
    }

    function searchBooks(query, boardId, classLevel) {
        const normalized = String(query || '').toLowerCase().trim();
        const visibleBooks = getBooks(boardId, classLevel);

        if (!normalized) return visibleBooks;

        return visibleBooks.filter((book) => {
            return [book.title, book.subject, book.description, book.stream, book.board, book.tags.join(' ')]
                .join(' ')
                .toLowerCase()
                .includes(normalized);
        });
    }

    function getBoard(boardId) {
        return BOARD_CONFIG.find((board) => board.id === boardId) || null;
    }

    function getBoardOverview(boardId) {
        const board = getBoard(boardId);
        if (!board) return null;

        const boardBooks = getBooks(boardId, 'all');
        return {
            ...board,
            classCount: 12,
            totalBooks: boardBooks.length,
            subjects: Array.from(new Set(boardBooks.map((book) => book.subject))).sort()
        };
    }

    function getBookById(bookId) {
        return books.find((book) => book.id === bookId) || null;
    }

    function findBook(boardId, classLevel, subjectQuery) {
        const normalizedSubject = normalizeSubjectQuery(subjectQuery);
        return books.find((book) => {
            const boardMatch = !boardId || boardId === 'all' || book.boardId === boardId;
            const classMatch = !classLevel || classLevel === 'all' || book.classLevel === Number(classLevel);
            const subjectMatch = !normalizedSubject || book.subject === normalizedSubject;
            return boardMatch && classMatch && subjectMatch;
        }) || null;
    }

    window.EduNovaLibrary = {
        boards: BOARD_CONFIG,
        books,
        classes: listClasses(),
        getBoard,
        getBoardOverview,
        getBookById,
        findBook,
        getBooks,
        searchBooks,
        normalizeSubjectQuery
    };
})();