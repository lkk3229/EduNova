const NCERT_SOURCE_URL = 'https://ncert.nic.in/textbook.php';

const CLASS_WISE_CATALOG = {
    1: [
        { subject: 'English', title: 'Marigold', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class1English.pdf' },
        { subject: 'Mathematics', title: 'Math-Magic', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class1Maths.pdf' },
        { subject: 'Hindi', title: 'Rimjhim', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class1Hindi.pdf' },
        { subject: 'Environmental Studies', title: 'Looking Around', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class1EVS.pdf' }
    ],
    2: [
        { subject: 'English', title: 'Marigold', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class2English.pdf' },
        { subject: 'Mathematics', title: 'Math-Magic', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class2Maths.pdf' },
        { subject: 'Hindi', title: 'Rimjhim', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class2Hindi.pdf' },
        { subject: 'Environmental Studies', title: 'Looking Around', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class2EVS.pdf' }
    ],
    3: [
        { subject: 'English', title: 'Marigold', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class3English.pdf' },
        { subject: 'Mathematics', title: 'Math-Magic', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class3Maths.pdf' },
        { subject: 'Hindi', title: 'Rimjhim', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class3Hindi.pdf' },
        { subject: 'Environmental Studies', title: 'Looking Around', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class3EVS.pdf' }
    ],
    4: [
        { subject: 'English', title: 'Marigold', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class4English.pdf' },
        { subject: 'Mathematics', title: 'Math-Magic', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class4Maths.pdf' },
        { subject: 'Hindi', title: 'Rimjhim', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class4Hindi.pdf' },
        { subject: 'Environmental Studies', title: 'Looking Around', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class4EVS.pdf' }
    ],
    5: [
        { subject: 'English', title: 'Marigold', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class5English.pdf' },
        { subject: 'Mathematics', title: 'Math-Magic', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class5Maths.pdf' },
        { subject: 'Hindi', title: 'Rimjhim', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class5Hindi.pdf' },
        { subject: 'Environmental Studies', title: 'Looking Around', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class5EVS.pdf' }
    ],
    6: [
        { subject: 'English', title: 'Honeysuckle', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6English.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6Maths.pdf' },
        { subject: 'Hindi', title: 'Vasant', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6Hindi.pdf' },
        { subject: 'Science', title: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6Science.pdf' },
        { subject: 'Social Science', title: 'Our Pasts-I, The Earth Our Habitat, Social and Political Life-I', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6SSt.pdf' },
        { subject: 'Sanskrit', title: 'Ruchira', language: 'Sanskrit', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class6Sanskrit.pdf' }
    ],
    7: [
        { subject: 'English', title: 'Honeysuckle', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7English.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7Maths.pdf' },
        { subject: 'Hindi', title: 'Vasant', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7Hindi.pdf' },
        { subject: 'Science', title: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7Science.pdf' },
        { subject: 'Social Science', title: 'Our Pasts-II, Our Environment, Social and Political Life-II', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7SSt.pdf' },
        { subject: 'Sanskrit', title: 'Ruchira', language: 'Sanskrit', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class7Sanskrit.pdf' }
    ],
    8: [
        { subject: 'English', title: 'Honeydew', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8English.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8Maths.pdf' },
        { subject: 'Hindi', title: 'Vasant', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8Hindi.pdf' },
        { subject: 'Science', title: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8Science.pdf' },
        { subject: 'Social Science', title: 'Our Pasts-III, Resources and Development, Social and Political Life-III', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8SSt.pdf' },
        { subject: 'Sanskrit', title: 'Ruchira', language: 'Sanskrit', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class8Sanskrit.pdf' }
    ],
    9: [
        { subject: 'English', title: 'Beehive / Moments', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9English.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9Maths.pdf' },
        { subject: 'Hindi', title: 'Kshitij / Sparsh', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9Hindi.pdf' },
        { subject: 'Science', title: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9Science.pdf' },
        { subject: 'Social Science', title: 'India and the Contemporary World-I, Contemporary India-I, Democratic Politics-I', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9SSt.pdf' },
        { subject: 'Sanskrit', title: 'Shemushi', language: 'Sanskrit', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class9Sanskrit.pdf' }
    ],
    10: [
        { subject: 'English', title: 'First Flight / Footprints Without Feet', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10English.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10Maths.pdf' },
        { subject: 'Hindi', title: 'Kshitij / Sparsh', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10Hindi.pdf' },
        { subject: 'Science', title: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10Science.pdf' },
        { subject: 'Social Science', title: 'India and the Contemporary World-II, Contemporary India-II, Democratic Politics-II', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10SSt.pdf' },
        { subject: 'Sanskrit', title: 'Shemushi', language: 'Sanskrit', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class10Sanskrit.pdf' }
    ],
    11: [
        { subject: 'Physics', title: 'Physics', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Physics.pdf' },
        { subject: 'Chemistry', title: 'Chemistry', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Chemistry.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Maths.pdf' },
        { subject: 'Biology', title: 'Biology', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Biology.pdf' },
        { subject: 'English', title: 'Hornbill / Snapshots', stream: 'General', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11English.pdf' },
        { subject: 'Hindi', title: 'Aroh / Vitan', stream: 'General', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Hindi.pdf' },
        { subject: 'Accountancy', title: 'Accountancy', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Accountancy.pdf' },
        { subject: 'Economics', title: 'Introductory Microeconomics', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Economics.pdf' },
        { subject: 'Business Studies', title: 'Business Studies', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11BusinessStudies.pdf' },
        { subject: 'History', title: 'Themes in World History', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11History.pdf' },
        { subject: 'Geography', title: 'Fundamentals of Physical Geography', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Geography.pdf' },
        { subject: 'Political Science', title: 'Political Theory', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11PoliticalScience.pdf' },
        { subject: 'Sociology', title: 'Introduction to Sociology', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class11Sociology.pdf' }
    ],
    12: [
        { subject: 'Physics', title: 'Physics', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Physics.pdf' },
        { subject: 'Chemistry', title: 'Chemistry', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Chemistry.pdf' },
        { subject: 'Mathematics', title: 'Mathematics', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Maths.pdf' },
        { subject: 'Biology', title: 'Biology', stream: 'Science', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Biology.pdf' },
        { subject: 'English', title: 'Flamingo / Vistas', stream: 'General', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12English.pdf' },
        { subject: 'Hindi', title: 'Antra / Antral', stream: 'General', language: 'Hindi', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Hindi.pdf' },
        { subject: 'Accountancy', title: 'Accountancy', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Accountancy.pdf' },
        { subject: 'Economics', title: 'Introductory Macroeconomics', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Economics.pdf' },
        { subject: 'Business Studies', title: 'Business Studies', stream: 'Commerce', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12BusinessStudies.pdf' },
        { subject: 'History', title: 'Themes in Indian History', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12History.pdf' },
        { subject: 'Geography', title: 'Fundamentals of Human Geography', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Geography.pdf' },
        { subject: 'Political Science', title: 'Politics in India since Independence', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12PoliticalScience.pdf' },
        { subject: 'Sociology', title: 'Indian Society', stream: 'Arts', language: 'English', pdfUrl: 'https://ncert.nic.in/pdf/publication/Class12Sociology.pdf' }
    ]
};

function slugify(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildNCERTCatalog() {
    const books = [];

    Object.entries(CLASS_WISE_CATALOG).forEach(([classLevel, entries]) => {
        entries.forEach((entry, index) => {
            const classNumber = Number(classLevel);
            const id = `ncert-${classNumber}-${slugify(entry.subject)}-${index + 1}`;
            books.push({
                id,
                board: 'NCERT',
                boardId: 'ncert',
                classLevel: classNumber,
                subject: entry.subject,
                language: entry.language,
                stream: entry.stream || 'General',
                title: `NCERT Class ${classNumber} ${entry.title}`,
                description: `NCERT ${entry.subject} textbook for Class ${classNumber} (${entry.language}).`,
                sourceUrl: NCERT_SOURCE_URL,
                pdfUrl: entry.pdfUrl,
                tags: ['NCERT', `Class ${classNumber}`, entry.subject, entry.language, entry.stream || 'General']
            });
        });
    });

    return books;
}

const NCERT_BOOKS = buildNCERTCatalog();

module.exports = {
    NCERT_SOURCE_URL,
    NCERT_BOOKS
};
