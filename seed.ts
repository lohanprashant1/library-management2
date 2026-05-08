import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createHash } from 'crypto';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db', 'custom.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const hashedPassword = hashPassword('admin123');

  // Create default admin
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Library Administrator',
    },
  });

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      libraryName: 'City Central Library',
      address: '123 Main Street, City Center',
      phone: '+91 98765 43210',
      email: 'library@citycentral.in',
      aboutText:
        'Welcome to City Central Library! We offer a vast collection of books across all genres, comfortable reading spaces, and a welcoming community for all book lovers. Our mission is to promote reading and lifelong learning.',
      maxBooksPerMember: 5,
      maxLoanDays: 14,
      finePerDay: 2.0,
      openingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM\nSunday: 10:00 AM - 4:00 PM',
      membershipFee: 100.0,
    },
  });

  // Create default categories
  const categories = [
    { name: 'Fiction', description: 'Novels, short stories, and literary fiction' },
    { name: 'Non-Fiction', description: 'Biographies, essays, and factual works' },
    { name: 'Science & Technology', description: 'Computer science, engineering, and scientific research' },
    { name: 'History', description: 'World history, regional history, and historical analysis' },
    { name: 'Philosophy', description: 'Philosophical texts, ethics, and logic' },
    { name: 'Self-Help', description: 'Personal development, motivation, and wellness' },
    { name: 'Children', description: "Children's books, fairy tales, and young adult fiction" },
    { name: 'Education', description: 'Textbooks, study guides, and academic resources' },
    { name: 'Religion & Spirituality', description: 'Religious texts and spiritual guidance' },
    { name: 'Art & Literature', description: 'Art history, poetry, and literary criticism' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  // Create default authors
  const authors = [
    { name: 'Rabindranath Tagore', bio: 'Nobel laureate poet, writer, and philosopher from India' },
    { name: 'R.K. Narayan', bio: 'Famous Indian writer known for Malgudi stories' },
    { name: 'Chetan Bhagat', bio: 'Indian author and columnist known for bestselling novels' },
    { name: 'J.K. Rowling', bio: 'British author known for the Harry Potter series' },
    { name: 'APJ Abdul Kalam', bio: "Former President of India, scientist, and author" },
    { name: 'Sudha Murthy', bio: 'Indian author, philanthropist, and chairperson of Infosys Foundation' },
    { name: 'Amish Tripathi', bio: 'Indian author known for the Shiva Trilogy' },
    { name: 'Ruskin Bond', bio: 'Indian author of British descent known for nature writing' },
  ];

  for (const author of authors) {
    await prisma.author.upsert({
      where: { name: author.name },
      update: {},
      create: author,
    });
  }

  // ─── DONORS ─────────────────────────────────────────────────────────
  const donors = [
    { name: 'Rajesh Kumar Sharma', designation: 'CEO', organization: 'TechVision India Pvt. Ltd.', amount: 500000, year: '2024', description: 'Annual corporate donation for library digitization project', donorType: 'Corporate', isFeatured: true },
    { name: 'Dr. Priya Mehta', designation: 'Professor Emeritus', organization: 'Indian Institute of Technology', amount: 100000, year: '2024', description: 'Personal contribution in memory of late husband for science section expansion', donorType: 'Individual', isFeatured: true },
    { name: 'Alumni Association Batch of 1995', designation: '', organization: 'City Central University Alumni Network', amount: 250000, year: '2023', description: 'Batch contribution for setting up the digital learning lab', donorType: 'Alumni', isFeatured: false },
  ];

  for (const donor of donors) {
    await prisma.donor.create({ data: donor });
  }

  // ─── NEW ARRIVALS ───────────────────────────────────────────────────
  const newArrivals = [
    { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', category: 'Science & Technology', itemType: 'Book', description: 'Comprehensive textbook on AI covering search, reasoning, and machine learning', arrivalDate: '2025-01-15', featured: true },
    { title: 'IEEE Transactions on Pattern Analysis', author: 'IEEE', category: 'Science & Technology', itemType: 'Journal', description: 'Latest issue covering deep learning applications in computer vision', arrivalDate: '2025-01-10', featured: false },
    { title: 'Sustainable Development Goals and Higher Education', author: 'UNESCO Publishing', category: 'Education', itemType: 'Report', description: 'UNESCO report on integrating SDGs into university curricula', arrivalDate: '2025-01-08', featured: true },
    { title: 'Quantum Computing Fundamentals', author: 'Michael Nielsen & Isaac Chuang', category: 'Science & Technology', itemType: 'Book', description: 'Introduction to quantum computation and quantum information', arrivalDate: '2025-01-05', featured: false },
    { title: 'National Geographic Documentary Collection', author: 'National Geographic', category: 'Art & Literature', itemType: 'AV', description: 'Box set of 20 documentaries covering nature, science, and culture', arrivalDate: '2025-01-03', featured: false },
  ];

  for (const item of newArrivals) {
    await prisma.newArrival.create({ data: item });
  }

  // ─── E-RESOURCES ───────────────────────────────────────────────────
  const eresources = [
    { name: 'JSTOR', url: 'https://www.jstor.org', description: 'Digital library of academic journals, books, and primary sources covering humanities, social sciences, and sciences', category: 'Database', accessType: 'IP Based', publisher: 'ITHAKA', sortOrder: 1, isActive: true },
    { name: 'IEEE Xplore Digital Library', url: 'https://ieeexplore.ieee.org', description: 'Full-text access to IEEE and IET journals, conferences, and standards in engineering and technology', category: 'Database', accessType: 'IP Based', publisher: 'IEEE', sortOrder: 2, isActive: true },
    { name: 'PubMed Central', url: 'https://www.ncbi.nlm.nih.gov/pmc', description: 'Free full-text archive of biomedical and life sciences journal literature at the U.S. NIH', category: 'e-Journal', accessType: 'Open Access', publisher: 'National Institutes of Health', sortOrder: 3, isActive: true },
    { name: 'SpringerLink', url: 'https://link.springer.com', description: 'Access to millions of scientific documents from journals, books, series, protocols, and reference works', category: 'e-Book', accessType: 'IP Based', publisher: 'Springer Nature', sortOrder: 4, isActive: true },
    { name: 'Scopus', url: 'https://www.scopus.com', description: 'Largest abstract and citation database of peer-reviewed literature covering all research disciplines', category: 'Database', accessType: 'IP Based', publisher: 'Elsevier', sortOrder: 5, isActive: true },
    { name: 'ScienceDirect', url: 'https://www.sciencedirect.com', description: 'Full-text scientific database offering journal articles and book chapters covering physical sciences, engineering, life sciences, health sciences, and social sciences', category: 'e-Journal', accessType: 'IP Based', publisher: 'Elsevier', sortOrder: 6, isActive: true },
    { name: 'Web of Science', url: 'https://www.webofscience.com', description: 'Multidisciplinary citation index database providing access to high-impact research across sciences, social sciences, and arts & humanities', category: 'Database', accessType: 'Remote', publisher: 'Clarivate', sortOrder: 7, isActive: true },
    { name: 'Project Gutenberg', url: 'https://www.gutenberg.org', description: 'Free library of over 70,000 digitized ebooks in the public domain, focusing on classic literature', category: 'e-Book', accessType: 'Open Access', publisher: 'Project Gutenberg Literary Archive Foundation', sortOrder: 8, isActive: true },
  ];

  for (const res of eresources) {
    await prisma.eResource.create({ data: res });
  }

  // ─── NOTICES ───────────────────────────────────────────────────────
  const notices = [
    { title: 'Library Hours Extended During Exam Period', content: 'The library will remain open until 11:00 PM from Monday to Saturday during the semester examination period (Feb 1 - Feb 28). Please carry your valid ID card for entry after regular hours.', type: 'Academic', priority: 'High', publishDate: '2025-01-20', expiryDate: '2025-02-28', isActive: true },
    { title: 'New E-Resource: IEEE Xplore Now Available', content: 'We are pleased to announce that IEEE Xplore Digital Library is now accessible from all campus computers. Students and faculty can access over 5 million documents including journals, conference papers, and technical standards.', type: 'General', priority: 'Normal', publishDate: '2025-01-15', expiryDate: '2025-06-15', isActive: true },
    { title: 'Mid-Semester Break - Library Closed', content: 'The library will remain closed from March 15 to March 22 for the mid-semester break. Online resources will remain accessible 24/7 through the library portal.', type: 'Holiday', priority: 'Normal', publishDate: '2025-01-10', expiryDate: '2025-03-25', isActive: true },
    { title: 'Plagiarism Awareness Workshop', content: 'A mandatory workshop on academic integrity and plagiarism prevention tools (Turnitin) will be held on January 30 at 2:00 PM in the Auditorium. All final-year students must attend.', type: 'Event', priority: 'High', publishDate: '2025-01-18', expiryDate: '2025-01-30', isActive: true },
    { title: 'Emergency Maintenance: Catalog System Down', content: 'The online catalog system will undergo scheduled maintenance on January 25 from 6:00 AM to 10:00 AM. Users will not be able to search or place holds during this period. We apologize for the inconvenience.', type: 'Urgent', priority: 'Critical', publishDate: '2025-01-22', expiryDate: '2025-01-26', isActive: true },
  ];

  for (const notice of notices) {
    await prisma.notice.create({ data: notice });
  }

  // ─── ASK LIBRARIAN ─────────────────────────────────────────────────
  const askLibrarian = [
    { question: 'How can I access JSTOR from off-campus?', answer: 'You can access JSTOR remotely by logging into the library portal with your university credentials. Go to the E-Resources section, select JSTOR, and you will be redirected through our proxy server. Alternatively, you can use the VPN connection provided by the IT department for full access to all subscribed databases.', name: 'Ananya Reddy', email: 'ananya.r@student.university.edu', category: 'Digital Resources', status: 'Answered' },
    { question: 'What is the maximum number of books I can borrow at once?', answer: 'Undergraduate students can borrow up to 5 books for 14 days. Postgraduate students and research scholars can borrow up to 8 books for 21 days. Faculty members can borrow up to 15 books for 30 days. All borrowed items can be renewed once if there are no pending reservations from other users.', name: 'Vikram Singh', email: 'vikram.s@student.university.edu', category: 'Borrowing', status: 'Answered' },
    { question: 'Does the library provide inter-library loan services for research papers not available in our collection?', answer: '', name: 'Meera Joshi', email: 'meera.j@research.university.edu', category: 'Services', status: 'Pending' },
  ];

  for (const item of askLibrarian) {
    await prisma.askLibrarian.create({ data: item });
  }

  // ─── FACULTY PUBLICATIONS ─────────────────────────────────────────
  const facultyPublications = [
    { title: 'Deep Learning Approaches for Natural Language Processing in Indian Languages', author: 'Dr. Arun Sharma', department: 'Computer Science & Engineering', journal: 'IEEE Transactions on Neural Networks', year: '2024', doi: '10.1109/TNN.2024.1234567', abstract: 'This paper presents novel transformer-based architectures optimized for morphologically rich Indian languages, achieving state-of-the-art results on multiple benchmark datasets for Hindi, Tamil, and Bengali NLP tasks.', pubType: 'Journal', url: 'https://doi.org/10.1109/TNN.2024.1234567' },
    { title: 'Sustainable Urban Planning: A Case Study of Smart City Initiatives in India', author: 'Dr. Kavitha Nair', department: 'Architecture & Planning', journal: 'Urban Studies Journal', year: '2024', doi: '10.1177/0042098024123456', abstract: 'An empirical analysis of smart city projects across five Indian metropolitan areas, evaluating their impact on urban sustainability indicators including air quality, green cover, and public transit accessibility.', pubType: 'Journal', url: '' },
    { title: 'Advances in CRISPR-Cas9 Gene Editing for Agricultural Applications', author: 'Prof. Ramesh Gupta', department: 'Biotechnology', journal: 'Nature Biotechnology Conference Proceedings', year: '2024', doi: '', abstract: 'Presentation of breakthrough CRISPR applications for crop improvement in drought-prone regions, with field trial results showing 30% yield improvement in rice varieties.', pubType: 'Conference', url: '' },
    { title: 'Blockchain-Based Framework for Transparent Academic Credential Verification', author: 'Dr. Priya Desai', department: 'Information Technology', journal: 'ACM Computing Surveys', year: '2023', doi: '10.1145/1234567', abstract: 'A comprehensive survey and proposed framework leveraging blockchain technology to create tamper-proof, globally verifiable academic credential systems addressing the growing problem of credential fraud.', pubType: 'Journal', url: 'https://doi.org/10.1145/1234567' },
    { title: 'Impact of Microplastics on Freshwater Ecosystems: A Comprehensive Review', author: 'Dr. Suresh Patil', department: 'Environmental Science', journal: 'Environmental Pollution', year: '2024', doi: '10.1016/j.envpol.2024.123456', abstract: 'Systematic review of 250+ studies examining microplastic contamination in freshwater bodies across South Asia, identifying critical source pathways and recommending policy interventions for mitigation.', pubType: 'Journal', url: '' },
  ];

  for (const pub of facultyPublications) {
    await prisma.facultyPublication.create({ data: pub });
  }

  // ─── PAST PAPERS ───────────────────────────────────────────────────
  const pastPapers = [
    { title: 'Data Structures and Algorithms - End Semester', course: 'Data Structures and Algorithms', courseCode: 'CS201', department: 'Computer Science & Engineering', year: '2024', semester: 'Fall', fileUrl: '/uploads/past-papers/cs201-2024-fall.pdf' },
    { title: 'Engineering Mathematics III - Mid Semester', course: 'Engineering Mathematics III', courseCode: 'MA301', department: 'Mathematics', year: '2024', semester: 'Fall', fileUrl: '/uploads/past-papers/ma301-2024-fall.pdf' },
    { title: 'Digital Signal Processing - End Semester', course: 'Digital Signal Processing', courseCode: 'EC401', department: 'Electronics & Communication', year: '2024', semester: 'Spring', fileUrl: '/uploads/past-papers/ec401-2024-spring.pdf' },
    { title: 'Organic Chemistry - End Semester', course: 'Organic Chemistry', courseCode: 'CH201', department: 'Chemistry', year: '2023', semester: 'Fall', fileUrl: '/uploads/past-papers/ch201-2023-fall.pdf' },
    { title: 'Thermodynamics - End Semester', course: 'Engineering Thermodynamics', courseCode: 'ME301', department: 'Mechanical Engineering', year: '2023', semester: 'Spring', fileUrl: '/uploads/past-papers/me301-2023-spring.pdf' },
  ];

  for (const paper of pastPapers) {
    await prisma.pastPaper.create({ data: paper });
  }

  // ─── LIBRARY RULES ─────────────────────────────────────────────────
  const libraryRules = [
    { title: 'General Library Etiquette', content: 'Maintain silence in the library premises. Mobile phones must be on silent mode. Food and beverages are not allowed in the reading areas. Sleeping in the library is strictly prohibited. Users must carry their valid ID cards at all times and produce them upon request by library staff.', category: 'Conduct', sortOrder: 1, isActive: true },
    { title: 'Book Borrowing Policy', content: 'Undergraduate students may borrow up to 5 books for 14 days. Postgraduate students and research scholars may borrow up to 8 books for 21 days. Faculty members may borrow up to 15 books for 30 days. All books must be returned or renewed before the due date. A fine of ₹2 per day per book will be charged for late returns.', category: 'Circulation', sortOrder: 1, isActive: true },
    { title: 'Membership Registration', content: 'All students and staff are automatically enrolled as library members at the time of admission or appointment. External membership is available for a fee of ₹500 per year. Members must update their contact information annually. Membership privileges are non-transferable.', category: 'Membership', sortOrder: 1, isActive: true },
    { title: 'Digital Resource Access Policy', content: 'Subscribed e-resources are accessible from campus IP addresses without login. Remote access requires authentication through the library proxy server or university VPN. Downloading entire issues or bulk downloading articles is prohibited and may result in temporary suspension of access privileges.', category: 'Digital', sortOrder: 1, isActive: true },
    { title: 'Reference Section Usage', content: 'Books marked as "Reference Only" (R) cannot be borrowed and must be used within the library. Photocopying of reference books is permitted for up to 10% of the total pages as per copyright law. Rare and manuscript materials require special permission from the Librarian for access.', category: 'General', sortOrder: 2, isActive: true },
  ];

  for (const rule of libraryRules) {
    await prisma.libraryRule.create({ data: rule });
  }

  // ─── PHOTO GALLERY ─────────────────────────────────────────────────
  const photoGallery = [
    { title: 'National Library Week Inauguration 2025', description: 'Chief Guest Dr. Kiran Bedi inaugurating the National Library Week celebrations at the central auditorium', image: '/uploads/gallery/library-week-2025.jpg', event: 'National Library Week', date: '2025-01-14', sortOrder: 1, isActive: true },
    { title: 'Book Donation Drive', description: 'Students and faculty participating in the annual book donation drive, collecting over 2000 books for rural libraries', image: '/uploads/gallery/book-donation.jpg', event: 'Book Donation Drive', date: '2024-12-10', sortOrder: 2, isActive: true },
    { title: 'New Library Building - Aerial View', description: 'Aerial photograph of the newly constructed 5-storey library building with its modern glass facade', image: '/uploads/gallery/new-building.jpg', event: 'Infrastructure', date: '2024-09-01', sortOrder: 3, isActive: true },
  ];

  for (const photo of photoGallery) {
    await prisma.photoGallery.create({ data: photo });
  }

  // ─── NEWSLETTERS ───────────────────────────────────────────────────
  const newsletters = [
    { title: 'Library Voice - January 2025', description: 'Monthly newsletter featuring new arrivals, upcoming events, database updates, and reading recommendations for the new semester', fileUrl: '/uploads/newsletters/january-2025.pdf', issue: 'Vol. 12, Issue 1', date: '2025-01-05' },
    { title: 'Library Voice - December 2024', description: 'Year-end special edition covering library statistics, top borrowed books of the year, and plans for the upcoming academic year', fileUrl: '/uploads/newsletters/december-2024.pdf', issue: 'Vol. 11, Issue 12', date: '2024-12-02' },
  ];

  for (const nl of newsletters) {
    await prisma.newsletter.create({ data: nl });
  }

  // ─── COMMITTEE ─────────────────────────────────────────────────────
  const committee = [
    { name: 'Dr. S. Ramakrishnan', designation: 'Professor & Head', department: 'Library & Information Science', role: 'Chairperson', email: 'ramakrishnan.s@university.edu', phone: '+91 98765 43210', photo: '', sortOrder: 1, isActive: true },
    { name: 'Dr. Meera Krishnan', designation: 'Associate Professor', department: 'Computer Science', role: 'Vice-Chair', email: 'meera.k@university.edu', phone: '+91 98765 43211', photo: '', sortOrder: 2, isActive: true },
    { name: 'Prof. Anand Sharma', designation: 'Associate Librarian', department: 'Central Library', role: 'Secretary', email: 'anand.s@university.edu', phone: '+91 98765 43212', photo: '', sortOrder: 3, isActive: true },
    { name: 'Dr. Lakshmi Priya', designation: 'Assistant Professor', department: 'Electronics & Communication', role: 'Member', email: 'lakshmi.p@university.edu', phone: '+91 98765 43213', photo: '', sortOrder: 4, isActive: true },
    { name: 'Mr. Rajesh Verma', designation: 'Research Scholar', department: 'Biotechnology', role: 'Member', email: 'rajesh.v@research.university.edu', phone: '+91 98765 43214', photo: '', sortOrder: 5, isActive: true },
  ];

  for (const member of committee) {
    await prisma.committee.create({ data: member });
  }

  // ─── RESEARCH GUIDES ───────────────────────────────────────────────
  const researchGuides = [
    { title: 'Getting Started with Systematic Reviews', description: 'A step-by-step guide for conducting systematic reviews and meta-analyses following PRISMA guidelines, covering search strategy development, study selection, and quality assessment', category: 'Research Methodology', content: 'This guide walks you through the complete systematic review process: formulating your research question using PICO framework, developing search strategies across multiple databases (PubMed, Scopus, Web of Science), managing references with Zotero, screening and selecting studies, performing quality assessment using ROBIS, and writing up your findings following PRISMA 2020 guidelines.', author: 'Dr. S. Ramakrishnan', fileUrl: '', sortOrder: 1, isActive: true },
    { title: 'Citation Management with Zotero', description: 'Comprehensive tutorial on using Zotero for reference management, including installation, browser connector setup, citation styles, and Word/LaTeX integration', category: 'Tools & Software', content: 'Learn to install and configure Zotero, add references from databases, organize your library with tags and collections, generate citations in APA, IEEE, Chicago and other styles, and integrate Zotero with Microsoft Word and LaTeX using BibTeX export.', author: 'Prof. Anand Sharma', fileUrl: '', sortOrder: 2, isActive: true },
    { title: 'Accessing and Using IEEE Xplore', description: 'Detailed guide on navigating IEEE Xplore Digital Library, including advanced search techniques, setting up alerts, and downloading full-text papers', category: 'Database Tutorials', content: 'Master IEEE Xplore with this guide covering basic and advanced search, using command search syntax, setting up email alerts for new publications, browsing by topic or publication, accessing conference proceedings and standards, and using the API for programmatic access.', author: 'Prof. Anand Sharma', fileUrl: '', sortOrder: 3, isActive: true },
    { title: 'Understanding Research Metrics: h-index, Impact Factor, and Altmetrics', description: 'Guide to understanding and using research performance metrics responsibly, including journal impact factors, author metrics, and alternative metrics', category: 'Research Impact', content: 'Understand the key research metrics: Journal Impact Factor (JIF) from Clarivate, SCImago Journal Rank (SJR), h-index and its variants (i10-index, g-index), field-normalized citation metrics, and altmetrics for tracking broader impact through social media, policy documents, and news coverage.', author: 'Dr. Meera Krishnan', fileUrl: '', sortOrder: 4, isActive: true },
  ];

  for (const guide of researchGuides) {
    await prisma.researchGuide.create({ data: guide });
  }

  // ─── CAS ALERTS ────────────────────────────────────────────────────
  const casAlerts = [
    { title: 'New Issue: Nature - AI and Machine Learning Special', description: 'Nature Volume 637, Issue 7979 features a special collection on recent breakthroughs in artificial intelligence and machine learning applications across scientific disciplines', category: 'New Issues', alertDate: '2025-01-20', source: 'Nature Publishing Group', url: 'https://www.nature.com/nature/volumes/637/issues/7979', isActive: true },
    { title: 'CFP: International Conference on Digital Libraries 2025', description: 'Call for papers for ICDL 2025 to be held at IIT Delhi, September 15-17, 2025. Deadline for abstract submission: April 30, 2025', category: 'Conferences', alertDate: '2025-01-18', source: 'IIT Delhi', url: 'https://icdl2025.iitd.ac.in', isActive: true },
    { title: 'UGC Research Grant: Digital Preservation of Cultural Heritage', description: 'University Grants Commission invites proposals for research grants under the Digital Preservation of Cultural Heritage initiative. Maximum grant amount: ₹25 lakhs. Last date: February 28, 2025', category: 'Grants', alertDate: '2025-01-15', source: 'UGC India', url: 'https://www.ugc.ac.in/grants', isActive: true },
    { title: 'New Arrivals: Springer Computer Science Collection 2025', description: '30 new Springer e-books added to the library collection covering topics in artificial intelligence, cybersecurity, cloud computing, and data science', category: 'New Arrivals', alertDate: '2025-01-12', source: 'Springer Nature', url: 'https://link.springer.com', isActive: true },
  ];

  for (const alert of casAlerts) {
    await prisma.cASAlert.create({ data: alert });
  }

  // ─── ILL REQUESTS ──────────────────────────────────────────────────
  const illRequests = [
    { title: 'Handbook of Computational Chemistry', author: 'Jerzy Leszczynski', journal: '', year: '2024', requesterName: 'Amit Patel', requesterEmail: 'amit.p@research.university.edu', department: 'Chemistry', status: 'Processing', remarks: 'Requested through British Library Document Supply Service. Expected delivery: 7-10 business days.' },
    { title: 'Proceedings of the International Conference on Robotics (ICRA 2024)', author: 'IEEE', journal: 'IEEE ICRA 2024', year: '2024', requesterName: 'Sneha Gupta', requesterEmail: 'sneha.g@research.university.edu', department: 'Mechanical Engineering', status: 'Fulfilled', remarks: 'Delivered via electronic inter-library loan. Access link shared via email.' },
  ];

  for (const req of illRequests) {
    await prisma.iLLRequest.create({ data: req });
  }

  console.log('Seed completed successfully!');
  console.log('Admin:', admin.username, '| Password: admin123');
  console.log('Settings:', settings.libraryName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
