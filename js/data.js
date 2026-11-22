/* SEED: all mock content for DiskarTasks. Everything on the site comes from here (or from what a visitor creates).
   Orders, reviews, favorites, follows and conversations are added further down by their own sections. */
(function (root) {
  'use strict';

  var U = root.Util;

  function pk(name, price, days, revisions, includes) {
    return { name: name, price: price, days: days, revisions: revisions, includes: includes };
  }

  // Newest gig first: gig N was created N-1 days before 2026-11-14 09:00, always before the 2026-11-15 10:00 test clock.
  var BASE = new Date('2026-11-14T09:00:00').getTime();
  function created(id) { return new Date(BASE - (id - 1) * 86400000).toISOString(); }

  // Photos live in images/ (credits in images/CREDITS.txt). A gig or portfolio piece with no photo keeps its placeholder tile.
  var GIG_PHOTO = {};
  for (var gi = 1; gi <= 18; gi++) GIG_PHOTO[gi] = 'gig-' + (gi < 10 ? '0' : '') + gi + '.jpg';

  function gig(id, seller, title, category, description, skills, unit, packages, rating, count, showRange) {
    return {
      id: id, sellerHandle: seller, title: title, category: category, description: description,
      skills: skills, cover: GIG_PHOTO[id] ? 'img:' + GIG_PHOTO[id] : 'tile:' + category, unit: unit, packages: packages,
      showRange: !!showRange, rating: rating, ratingCount: count, createdAt: created(id)
    };
  }

  var SHARED_PASS = 'campus-gigs-demo-account';

  function user(handle, name, isSeller, headline, bio, skills, joined, color, rating, count, followers, portfolio, password) {
    return {
      handle: handle, name: name, email: handle + '@slsu.edu.ph', passHash: U.mockHash(password || SHARED_PASS),
      isSeller: isSeller, headline: headline, bio: bio, skills: skills, joined: joined, avatarColor: color,
      rating: rating, ratingCount: count, followers: followers, portfolio: portfolio || [],
      prefs: { notifyOrders: true, notifyMessages: true, newsletter: false }
    };
  }

  // [title, placeholder category, photo file]: the photo wins when there is one
  function tiles(list) { return list.map(function (t) { return { title: t[0], cover: t[2] ? 'img:' + t[2] : 'tile:' + t[1] }; }); }

  var DEMO = {
    buyer: { email: 'juana.delacruz@slsu.edu.ph', password: 'Campus-Buyer-26' },
    seller: { email: 'paolo_d@slsu.edu.ph', password: 'Campus-Seller-26' }
  };

  var SEED = {
    version: 'v4',   // bumped when seed content changes (v2: photos replace placeholder tiles) so stored demo data refreshes once

    categories: [
      { id: 'design', name: 'Design & Creative', icon: 'palette' },
      { id: 'tech', name: 'Tech & Development', icon: 'code' },
      { id: 'writing', name: 'Writing & Editing', icon: 'pencil' },
      { id: 'tutoring', name: 'Tutoring', icon: 'graduation' },
      { id: 'admin', name: 'Admin Support', icon: 'users' },
      { id: 'others', name: 'Others', icon: 'grid' }
    ],

    users: [
      user('paolo_d', 'Paolo D.', true, 'Graphic Designer · SLSU Student',
        'BSIT student who designs logos, posters and brand kits for student orgs and small shops around campus. I like clean, simple work that people remember.',
        ['Graphic Design', 'Canva', 'Photo Editing', 'Branding'], '2025-03', '#2F5A66', 4.8, 87, 124,
        tiles([['Org Poster Series', 'design', 'work-paolo-1.jpg'], ['Cafe Logo Pack', 'design', 'work-paolo-2.jpg'], ['Event Photo Set', 'others', 'work-paolo-3.jpg'], ['Capstone Brand Kit', 'design', 'work-paolo-4.jpg']]),
        DEMO.seller.password),
      user('bea_s', 'Bea S.', true, 'Brand Designer · SLSU Student',
        'I turn rough ideas into full brand kits: logo, colours, fonts and social templates.',
        ['Branding', 'Illustrator', 'Canva', 'Data Entry'], '2025-05', '#C9855A', 4.9, 74, 98, tiles([['Bakery Brand Kit', 'design', 'work-bea-1.jpg'], ['Org Merch Mockups', 'design', 'work-bea-2.jpg']])),
      user('jaya_r', 'Jaya R.', true, 'Web Developer & Tutor · SLSU Student',
        'Third-year IT student. I build React and Next.js interfaces, fix stubborn bugs and tutor beginners in Python.',
        ['Next.js', 'React', 'Python', 'JavaScript'], '2025-04', '#4F7C82', 4.8, 63, 87, tiles([['Capstone Dashboard', 'tech', 'work-jaya-1.jpg'], ['Booking Site', 'tech', 'work-jaya-2.jpg']])),
      user('ken_c', 'Ken C.', true, 'Data & Math Tutor · SLSU Student',
        'Statistics and applied math. I clean data, run the tests your thesis needs and explain the results clearly.',
        ['Statistics', 'Excel', 'SPSS', 'Python'], '2025-06', '#8FA66A', 4.7, 52, 61, tiles([['Survey Analysis Report', 'tech', 'work-ken-1.jpg']])),
      user('rhea_m', 'Rhea M.', true, 'Writer & Editor · SLSU Student',
        'English major. I edit theses, polish essays and help you find your voice, in plain, clear language.',
        ['Academic Writing', 'Editing', 'Proofreading', 'English'], '2025-02', '#7D5C7A', 4.8, 58, 73, tiles([['Thesis Formatting Sample', 'writing', 'work-rhea-1.jpg']])),
      user('mia_santos', 'Mia Santos', true, 'Designer & Writer · SLSU Student',
        'I design simple brands and write friendly blog posts for student businesses.',
        ['Logo Design', 'Copywriting', 'Blogging', 'Transcription'], '2025-07', '#B5894A', 4.9, 32, 40, tiles([['Boutique Logo', 'design', 'work-mia-1.jpg']])),
      user('designbysaye', 'Saye M.', true, 'Logo & Illustration · SLSU Student',
        'Fast, friendly logo design for projects, orgs and side hustles.',
        ['Logo Design', 'Illustration', 'Procreate'], '2025-08', '#566B91', 4.7, 31, 36, tiles([['Hand-drawn Logo', 'design', 'work-saye-1.jpg']])),
      user('juana.delacruz', 'Juana Dela Cruz', false, 'SLSU Student',
        'BS Business Administration. I hire fellow students for designs, tutoring and the odd bit of help with school work.',
        [], '2025-09', '#2F5A66', 0, 0, 0, [], DEMO.buyer.password)
    ],

    gigs: [
      gig(1, 'paolo_d', 'Minimalist Logo for your Capstone', 'design',
        'A clean, memorable logo for your capstone project, org or small business. Delivered as PNG and vector files with a one-page usage guide.',
        ['Logo Design', 'Branding', 'Canva'], 'project', [
          pk('Basic', 350, 3, 1, ['1 logo concept', 'PNG file']),
          pk('Standard', 600, 4, 2, ['2 logo concepts', 'PNG and SVG files', 'Colour and black-and-white versions']),
          pk('Pro', 900, 5, 3, ['3 logo concepts', 'All source files', 'Mini brand guide'])
        ], 4.9, 97, true),
      gig(2, 'bea_s', 'Brand Kit and Logo Pack', 'design',
        'Everything a new brand needs: logo, colour palette, font pairing and ready-to-post social media templates.',
        ['Branding', 'Illustrator', 'Social Media'], 'project', [
          pk('Basic', 450, 5, 2, ['Logo', 'Colour palette']),
          pk('Standard', 800, 7, 3, ['Logo and variations', 'Colour palette and fonts', '5 social templates']),
          pk('Pro', 1200, 10, 4, ['Full brand kit PDF', 'All source files', '10 social templates'])
        ], 4.9, 74),
      gig(3, 'jaya_r', 'Next.js Components and Bug Fixes', 'tech',
        'Reusable, accessible React components and quick fixes for your Next.js project. Clean code with short notes on what changed.',
        ['Next.js', 'React', 'JavaScript'], 'project', [
          pk('Basic', 500, 3, 1, ['1 component or bug fix', 'Short notes']),
          pk('Standard', 900, 5, 2, ['Up to 3 components or fixes', 'Notes and a walkthrough']),
          pk('Pro', 1400, 7, 3, ['Up to 6 components or fixes', 'Tests where useful', 'Walkthrough call'])
        ], 4.8, 63),
      gig(4, 'jaya_r', 'Technical VA Hours', 'admin',
        'A reliable virtual assistant for technical tasks: spreadsheets, form setups, light website edits and research. Billed per hour.',
        ['Virtual Assistant', 'Google Sheets', 'Research'], 'hour', [
          pk('Basic', 300, 1, 0, ['1 hour of work', 'End-of-day summary']),
          pk('Standard', 450, 1, 0, ['1 hour, technical tasks', 'Summary and shared files']),
          pk('Pro', 600, 1, 0, ['1 hour, advanced tasks', 'Summary and documentation'])
        ], 4.7, 49),
      gig(5, 'ken_c', 'Statistical Analysis and Data Reports', 'tech',
        'Data cleaning, descriptive and inferential tests, and a plain-language report you can put straight into your thesis.',
        ['Statistics', 'SPSS', 'Excel'], 'project', [
          pk('Basic', 600, 4, 1, ['Data cleaning', 'Descriptive statistics']),
          pk('Standard', 1000, 6, 2, ['Everything in Basic', '2 statistical tests', 'Written interpretation']),
          pk('Pro', 1500, 8, 3, ['Everything in Standard', 'Charts and tables', 'Review call'])
        ], 4.5, 38),
      gig(6, 'rhea_m', 'Academic Writing and Editing', 'writing',
        'Careful editing for essays, reports and theses: clearer sentences, stronger arguments, consistent citations.',
        ['Academic Writing', 'Editing', 'Proofreading'], 'project', [
          pk('Basic', 250, 2, 1, ['Up to 1,000 words', 'Grammar and clarity edit']),
          pk('Standard', 450, 3, 2, ['Up to 3,000 words', 'Structure feedback']),
          pk('Pro', 800, 5, 3, ['Up to 8,000 words', 'Citation check', 'Feedback call'])
        ], 4.6, 41),
      gig(7, 'designbysaye', 'Logo Design for Your Project', 'design',
        'A friendly, hand-finished logo for your project, shop or student organisation, with a few quick revisions.',
        ['Logo Design', 'Illustration', 'Procreate'], 'project', [
          pk('Basic', 450, 3, 2, ['1 logo concept', 'PNG file']),
          pk('Standard', 700, 5, 3, ['2 logo concepts', 'PNG and SVG files'])
        ], 4.7, 31),
      gig(8, 'mia_santos', 'Logo & Brand Design', 'design',
        'A logo and simple brand sheet for boutiques, cafes and campus businesses. Warm, readable, easy to reuse.',
        ['Logo Design', 'Branding', 'Photoshop'], 'project', [
          pk('Basic', 250, 3, 1, ['1 logo concept', 'PNG file']),
          pk('Standard', 500, 5, 2, ['2 logo concepts', 'Colour palette']),
          pk('Pro', 850, 7, 3, ['3 logo concepts', 'Brand sheet', 'All source files'])
        ], 4.9, 32),
      gig(9, 'jaya_r', 'Capstone Web App Development', 'tech',
        'A working web app for your capstone: login, a database-backed feature set and a clean interface, built with you step by step.',
        ['Web Development', 'JavaScript', 'Node.js'], 'project', [
          pk('Basic', 1200, 10, 2, ['Up to 3 pages', 'Basic login']),
          pk('Standard', 1350, 14, 3, ['Up to 6 pages', 'Login and database']),
          pk('Pro', 1500, 21, 4, ['Full feature set', 'Deployment help', 'Handover session'])
        ], 4.8, 22),
      gig(10, 'ken_c', 'Python Scripts and Excel Automation', 'tech',
        'Stop doing the same spreadsheet chores by hand. I write small Python scripts and Excel macros that do them for you.',
        ['Python', 'Excel', 'Automation'], 'project', [
          pk('Basic', 400, 3, 1, ['1 small script or macro']),
          pk('Standard', 700, 5, 2, ['Up to 3 scripts or macros', 'How-to notes']),
          pk('Pro', 1100, 7, 3, ['Custom workflow', 'Notes and a short call'])
        ], 4.6, 27),
      gig(11, 'rhea_m', 'Thesis Proofreading and Formatting', 'writing',
        'Final polish for your thesis: grammar, consistency, headings, tables and the formatting your adviser asked for.',
        ['Thesis', 'Proofreading', 'Formatting'], 'project', [
          pk('Basic', 300, 3, 1, ['Proofreading up to 5,000 words']),
          pk('Standard', 550, 4, 2, ['Proofreading up to 10,000 words', 'Formatting']),
          pk('Pro', 900, 6, 3, ['Full manuscript', 'Formatting and citations'])
        ], 4.8, 36),
      gig(12, 'mia_santos', 'Blog and Article Writing', 'writing',
        'Friendly, well-researched articles and blog posts for your org, shop or portfolio, written in your voice.',
        ['Blogging', 'Copywriting', 'SEO'], 'project', [
          pk('Basic', 200, 2, 1, ['1 article up to 500 words']),
          pk('Standard', 350, 3, 2, ['1 article up to 1,000 words', 'Headline options']),
          pk('Pro', 600, 5, 3, ['2 articles up to 1,000 words', 'Light SEO'])
        ], 4.5, 19),
      gig(13, 'ken_c', 'College Algebra and Calculus Tutoring', 'tutoring',
        'One-on-one sessions that make algebra and calculus click. We work through your own problem sets. Billed per hour.',
        ['Math', 'Calculus', 'Algebra'], 'hour', [
          pk('Basic', 250, 1, 0, ['1 hour session']),
          pk('Standard', 350, 1, 0, ['1 hour session', 'Practice set']),
          pk('Pro', 450, 1, 0, ['1 hour session', 'Practice set and exam tips'])
        ], 4.9, 44),
      gig(14, 'rhea_m', 'English Speaking Practice Sessions', 'tutoring',
        'Relaxed conversation practice for interviews, reports and presentations, with gentle feedback. Billed per hour.',
        ['English', 'Public Speaking'], 'hour', [
          pk('Basic', 200, 1, 0, ['1 hour session']),
          pk('Standard', 300, 1, 0, ['1 hour session', 'Written feedback'])
        ], 4.7, 33),
      gig(15, 'jaya_r', 'Programming 101 Tutoring in Python', 'tutoring',
        'Learn Python from scratch or catch up on your class: variables, loops, functions and small projects. Billed per hour.',
        ['Python', 'Programming'], 'hour', [
          pk('Basic', 300, 1, 0, ['1 hour session']),
          pk('Standard', 450, 1, 0, ['1 hour session', 'Practice exercises']),
          pk('Pro', 600, 1, 0, ['1 hour session', 'Exercises and code review'])
        ], 4.8, 29),
      gig(16, 'bea_s', 'Data Entry and Spreadsheet Cleanup', 'admin',
        'Accurate data entry and tidy spreadsheets: formatting, duplicates removed, formulas fixed.',
        ['Data Entry', 'Excel', 'Google Sheets'], 'project', [
          pk('Basic', 200, 2, 1, ['Up to 100 rows']),
          pk('Standard', 400, 3, 1, ['Up to 500 rows', 'Formatting']),
          pk('Pro', 700, 5, 2, ['Up to 2,000 rows', 'Formulas and a summary sheet'])
        ], 4.6, 24),
      gig(17, 'mia_santos', 'Transcription and Meeting Notes', 'admin',
        'Clean transcripts and short minutes for interviews, lectures and org meetings.',
        ['Transcription', 'Note-taking'], 'project', [
          pk('Basic', 250, 2, 1, ['Up to 30 minutes of audio']),
          pk('Standard', 450, 3, 1, ['Up to 60 minutes of audio', 'Action items'])
        ], 4.5, 17),
      gig(18, 'paolo_d', 'Photo Coverage for Campus Events', 'others',
        'Candid and group photos for your event, edited and delivered in a shared album within days.',
        ['Photography', 'Photo Editing'], 'project', [
          pk('Basic', 500, 3, 0, ['1 hour coverage', '20 edited photos']),
          pk('Standard', 900, 4, 0, ['2 hours coverage', '40 edited photos']),
          pk('Pro', 1500, 5, 0, ['4 hours coverage', '80 edited photos', 'Highlight reel'])
        ], 4.8, 21),
    ],

    orders: [],
    reviews: [],
    conversations: [],
    favorites: {},
    follows: {},

    // The team behind DiskarTasks (names, roles and school emails only; shown on the About page).
    team: [
      { id: "arym", name: "Arym Sherwin R. Vendiola", role: "Fullstack Developer (Leader)", email: "avendiola@slsu.edu.ph", photo: 'img:team-arym.jpg', duty: "Built all 12 pages, the shared shell, the data layer, dark mode and the automated tests." },
      { id: "brent", name: "Brent Paul O. Mecija", role: "UI/UX Developer", email: "", photo: 'img:team-brent.jpg', duty: "Designed the page mockups, mapped the buyer and seller flows and reviewed the build against the designs." },
      { id: "kharl", name: "Kharl Christian D. Dirain", role: "UI/UX Developer", email: "kdirain@slsu.edu.ph", photo: 'img:team-kharl.jpg', duty: "Created the UI asset kit (colours, type, components) and the phone and tablet layouts." },
      { id: "david", name: "David Andrew S. Casao", role: "Business Concept Developer", email: "dcasao@slsu.edu.ph", photo: 'img:team-david.jpg', duty: "Defined the business idea, user segments, six categories, package model and trust rules." },
      { id: "marvel", name: "Marvel Achilles E. De Lumban", role: "Content Manager", email: "malumban@slsu.edu.ph", photo: 'img:team-marvel.jpg', duty: "Wrote the site copy, gig descriptions, FAQs and narration scripts, and the image descriptions." },
      { id: "felix", name: "John Felix A. Sante", role: "Marketing / Promotion Specialist", email: "", photo: 'img:team-felix.jpg', duty: "Runs the social campaign: Facebook groups, Reels and TikToks, and post boosting." },
      { id: "cj", name: "Ryan CJ S. Peñaranda", role: "Marketing / Promotion Specialist", email: "rpenaranda@slsu.edu.ph", photo: 'img:team-cj.jpg', duty: "Runs the QR flyers, the campus demo booth and student organisation outreach." },
      { id: "yosefa", name: "Yosefa Perry R. Paroan", role: "Marketing / Promotion Specialist", email: "ypparoan@slsu.edu.ph", photo: 'img:team-yosefa.jpg', duty: "Recruits early freelancers, runs guided walkthroughs and tracks feedback." },
    ],

    testimonials: [
      { name: 'Ana Santos', role: 'SLSU Student', quote: 'DiskarTasks made it so easy to get my logo for our capstone. Highly recommended!' },
      { name: 'Marco Villanueva', role: 'BS Information Technology', quote: 'I booked a tutor for Calculus the same afternoon. Fast replies and fair prices.' },
      { name: 'Liza Ramos', role: 'BS Education', quote: 'As a seller I got my first three orders in a week. It feels like a campus community, not a faceless site.' },
      { name: 'Carlo Reyes', role: 'BS Business Administration', quote: 'The reviews helped me pick the right designer for our org posters. Great value.' }
    ],

    faq: [
      { q: 'Is DiskarTasks free to use?', a: 'Yes. Browsing, messaging and ordering are free. Sellers set their own prices and meet buyers on campus to complete the gig.' },
      { q: 'How do I become a seller?', a: 'Sign up with your SLSU email, choose Freelancer (Seller), then post your first gig from your seller page.' },
      { q: 'Is it safe to transact here?', a: 'Every member is a verified SLSU student, orders are tracked in the app and payment happens when you meet on campus. This demo does not take real payments.' }
    ],

    replies: {
      generic: [
        'Hi! Thanks for reaching out. I’m free this week, what do you have in mind?',
        'Hello! Happy to help. Can you tell me a bit more about what you need?',
        'Thanks for the message! I can start as soon as we agree on the details.'
      ],
      design: [
        'Sounds great! Do you have any colours or examples you like? I can send a first concept in a few days.',
        'Happy to design that. Could you share the name and a few words about the style you want?',
        'Thanks! Send me your idea and any references, and I’ll sketch something for you.'
      ],
      tech: [
        'Got it. Can you share the repo or a short description of the problem? I’ll take a look today.',
        'Sure, I can help with that. What stack are you using and when is your deadline?',
        'Thanks for asking! Send me the details and I’ll give you an estimate.'
      ],
      writing: [
        'Happy to help. How long is the paper and when is it due?',
        'Sure! Send it over when you’re ready and tell me what your adviser or teacher expects.',
        'Thanks for the message. I can fit that in this week, so share the draft whenever you like.'
      ],
      tutoring: [
        'Sure! What topic are you stuck on and when is your exam or deadline?',
        'Glad to help. Which days and times work for you? We can meet on campus.',
        'Thanks for reaching out. Bring your notes or problem set and we’ll go through them together.'
      ],
      admin: [
        'I can do that. How many rows or pages are we talking about, and when do you need it?',
        'Happy to help. Send me the file and the format you want and I’ll get started.',
        'Thanks! I have time this week. Tell me what the finished result should look like.'
      ],
      others: [
        'Thanks for the message! Tell me the date, place and what you have in mind.',
        'Happy to help. Can you share the details and your budget?',
        'Sounds fun! Let me check my schedule and get back to you shortly.'
      ]
    },

    demo: DEMO,

    // One map for page imagery. 'tile:<categoryId>' draws a placeholder tile; 'img:<filename>' uses a file in images/.
    images: {
      heroFrame1: 'img:hero-1.jpg', heroFrame2: 'img:hero-2.jpg', heroFrame3: 'img:hero-3.jpg', heroFrame4: 'img:hero-4.jpg',
      aboutCollage1: 'img:about-1.jpg', aboutCollage2: 'img:about-2.jpg', aboutCollage3: 'img:about-3.jpg', aboutCollage4: 'img:about-4.jpg',
      campus: 'img:campus.jpg', campusSunset: 'img:campus-2.jpg', campusWalk: 'img:campus-3.jpg', contactPhoto: 'img:contact.jpg', banner: 'img:banner.jpg'
    },

    // The starting cover for a new gig in each category (the Post a gig page offers these six). Falls back to the tile.
    // What each photo shows, for screen readers (used where the picture is content, e.g. the big picture on a gig page).
    photoAlt: {
      'team-arym.jpg': 'Portrait of Arym Sherwin R. Vendiola, Fullstack Developer (Leader).',
      'team-brent.jpg': 'Portrait of Brent Paul O. Mecija, UI/UX Developer.',
      'team-kharl.jpg': 'Portrait of Kharl Christian D. Dirain, UI/UX Developer.',
      'team-david.jpg': 'Portrait of David Andrew S. Casao, Business Concept Developer.',
      'team-marvel.jpg': 'Portrait of Marvel Achilles E. De Lumban, Content Manager.',
      'team-felix.jpg': 'Portrait of John Felix A. Sante, Marketing / Promotion Specialist.',
      'team-cj.jpg': 'Portrait of Ryan CJ S. Peñaranda, Marketing / Promotion Specialist.',
      'team-yosefa.jpg': 'Portrait of Yosefa Perry R. Paroan, Marketing / Promotion Specialist.',
      'about-1.jpg': 'A designer’s wooden desk with a laptop showing logo work, a sketchbook and a mug.',
      'about-2.jpg': 'A laptop screen full of code on a dark wooden desk.',
      'about-3.jpg': 'A brand identity guidelines flat lay with colour swatches and a tablet.',
      'about-4.jpg': 'A smiling student in a navy polo shirt in a bright, plant-filled study hall.',
      'banner.jpg': 'Code on a laptop screen resting on a dark wooden desk.',
      'campus.jpg': 'The Southern Luzon State University main building on a sunny day.',
      'campus-2.jpg': 'Campus buildings and lawn glowing in golden evening light.',
      'campus-3.jpg': 'Students walking along a tree-lined campus path beside a long white building.',
      'contact.jpg': 'A friendly student with long dark hair smiles at the camera.',
      'gig-01.jpg': 'A laptop screen showing logo design work in editing software.',
      'gig-02.jpg': 'Brand identity guidelines printed on papers with a colour palette and a tablet.',
      'gig-03.jpg': 'Code on a laptop screen in a dark editor.',
      'gig-04.jpg': 'A smiling student works at a laptop in a bright campus study area.',
      'gig-05.jpg': 'A laptop keyboard and screen with code beside a notebook.',
      'gig-06.jpg': 'A student writes in a notebook beside an open book on a campus table.',
      'gig-07.jpg': 'An open sketchbook with logo ideas next to a mug and a plant.',
      'gig-08.jpg': 'A tablet showing brand identity guidelines on printed colour palette sheets.',
      'gig-09.jpg': 'A close view of web code in a dark editor.',
      'gig-10.jpg': 'Lines of script code on a dark laptop screen.',
      'gig-11.jpg': 'An open book with highlighters and a hand writing notes on a wooden table.',
      'gig-12.jpg': 'A student typing on a laptop with a phone and water bottle on the table.',
      'gig-13.jpg': 'A student writing in a notebook at an outdoor table with books.',
      'gig-14.jpg': 'A smiling student with long dark hair in a sunlit study hall.',
      'gig-15.jpg': 'A smiling student in a navy polo shirt ready to help.',
      'gig-16.jpg': 'Hands typing on a silver laptop at a white desk.',
      'gig-17.jpg': 'A sketchbook, mug and plant on a wooden desk by a window.',
      'gig-18.jpg': 'A photographer holding a camera on a busy campus walkway.',
      'hero-1.jpg': 'A smiling student works on a laptop at a bright campus study area.',
      'hero-2.jpg': 'A smiling student in a navy polo shirt looks at the camera.',
      'hero-3.jpg': 'A student photographs the campus with a camera among trees and walkways.',
      'hero-4.jpg': 'A student writes notes at an outdoor campus table with an open textbook.',
      'work-bea-1.jpg': 'A brand guidelines page with typography notes on a wooden desk.',
      'work-bea-2.jpg': 'Colour palette cards, a camera lens and a marker on a desk.',
      'work-jaya-1.jpg': 'A code editor with a project file tree on a laptop screen.',
      'work-jaya-2.jpg': 'A laptop and a student working in a busy study area.',
      'work-ken-1.jpg': 'A student writing in a notebook next to a thick textbook and water bottle.',
      'work-mia-1.jpg': 'Students walking along a long campus path between lawns and buildings.',
      'work-paolo-1.jpg': 'Brand guideline sheets spread across a wooden desk.',
      'work-paolo-2.jpg': 'A stoneware mug and an open sketchbook beside a window.',
      'work-paolo-3.jpg': 'A student photographer aiming a camera outdoors.',
      'work-paolo-4.jpg': 'A tablet showing a brand identity presentation cover.',
      'work-rhea-1.jpg': 'An open textbook and highlighters on a wooden table.',
      'work-saye-1.jpg': 'An open sketchbook filled with hand-drawn logo concepts.'
    },

    categoryCovers: {
      design: 'img:gig-01.jpg', tech: 'img:gig-03.jpg', writing: 'img:gig-06.jpg',
      tutoring: 'img:gig-13.jpg', admin: 'img:gig-16.jpg', others: 'img:gig-18.jpg'
    }
  };

  // ---- Orders and reviews (Task 5). Ids continue from CG-1004; all createdAt values are before 2026-11-15T10:00. ----
  function seededOrder(id, gigId, pkgName, qty, buyer, date, time, notes, status, createdAt, reviewed) {
    var g = SEED.gigs.filter(function (x) { return x.id === gigId; })[0];
    var p = g.packages.filter(function (x) { return x.name === pkgName; })[0];
    return {
      id: id, gigId: gigId, gigTitle: g.title, buyer: buyer, seller: g.sellerHandle, pkg: pkgName, qty: qty,
      date: date, time: time, notes: notes, payment: 'Pay on meet-up (demo)', total: p.price * qty, status: status,
      createdAt: createdAt, reviewed: reviewed
    };
  }

  SEED.orders = [
    seededOrder('CG-1003', 7, 'Basic', 1, 'juana.delacruz', '2026-11-18', '14:00', 'Please make it simple, blue and white.', 'in_progress', '2026-11-12T09:30:00.000Z', false),
    seededOrder('CG-1002', 2, 'Standard', 1, 'juana.delacruz', '2026-10-28', '10:00', 'For our org’s new brand.', 'completed', '2026-10-24T08:00:00.000Z', false),
    seededOrder('CG-1001', 1, 'Standard', 1, 'juana.delacruz', '2026-10-05', '15:00', '', 'completed', '2026-10-01T07:15:00.000Z', true),
    seededOrder('CG-1004', 18, 'Basic', 1, 'bea_s', '2026-11-20', '13:00', 'Coverage for our org’s foundation day.', 'in_progress', '2026-11-13T05:45:00.000Z', false)
  ];

  function seededReview(id, gigId, orderId, buyer, stars, text, createdAt) {
    var g = SEED.gigs.filter(function (x) { return x.id === gigId; })[0];
    return { id: id, gigId: gigId, orderId: orderId, buyer: buyer, seller: g.sellerHandle, stars: stars, text: text, createdAt: createdAt };
  }

  // Reviews without an order (orderId null) are background reviews from other students.
  SEED.reviews = [
    seededReview(1, 1, 'CG-1001', 'juana.delacruz', 5, 'Paolo understood the brief right away and the logo came out clean. Great value!', '2026-10-12T10:00:00.000Z'),
    seededReview(2, 1, null, 'bea_s', 5, 'Fast, friendly and the files were well organised.', '2026-10-30T09:00:00.000Z'),
    seededReview(3, 1, null, 'ken_c', 4, 'Nice work. One extra revision and it was perfect.', '2026-11-04T09:00:00.000Z'),
    seededReview(4, 2, null, 'rhea_m', 5, 'The brand kit made our org look professional overnight.', '2026-11-02T09:00:00.000Z'),
    seededReview(5, 3, null, 'mia_santos', 5, 'Fixed a bug I had been stuck on for days. Clear explanation too.', '2026-11-06T09:00:00.000Z'),
    seededReview(6, 7, null, 'jaya_r', 4, 'Lovely hand-drawn style, delivered on time.', '2026-11-08T09:00:00.000Z'),
    seededReview(7, 13, null, 'juana.delacruz', 5, 'Calculus finally makes sense. Patient and well prepared.', '2026-11-09T09:00:00.000Z'),
    seededReview(8, 6, null, 'designbysaye', 5, 'My essay read so much better after Rhea’s edits.', '2026-11-10T09:00:00.000Z')
  ];

  // ---- Favorites and follows (Task 6). Favorites are oldest first; the newest is last. ----
  SEED.favorites = { 'juana.delacruz': [2, 7, 13, 3] };
  SEED.follows = { 'juana.delacruz': ['paolo_d'] };

  // ---- Conversations (Task 7). Only the juana/paolo thread has a message paolo_d has not read. ----
  SEED.conversations = [
    {
      id: 'c1', members: ['juana.delacruz', 'paolo_d'],
      messages: [
        { from: 'juana.delacruz', text: 'Hi Paolo! Do you also design logos for org shirts?', at: '2026-11-13T08:00:00.000Z' },
        { from: 'paolo_d', text: 'Hi Juana! Yes, I can adapt a logo for shirts. How many members are you?', at: '2026-11-13T08:20:00.000Z' },
        { from: 'juana.delacruz', text: 'About 40. Could you finish it by next Friday?', at: '2026-11-14T06:00:00.000Z' }
      ],
      readCount: { 'juana.delacruz': 2, paolo_d: 2 }
    },
    {
      id: 'c2', members: ['juana.delacruz', 'designbysaye'],
      messages: [
        { from: 'juana.delacruz', text: 'Hi Saye, I just placed my order for the logo.', at: '2026-11-12T10:00:00.000Z' },
        { from: 'designbysaye', text: 'Thanks Juana! I will send a first sketch by tomorrow.', at: '2026-11-12T10:30:00.000Z' }
      ],
      readCount: { 'juana.delacruz': 2, designbysaye: 2 }
    },
    {
      id: 'c3', members: ['bea_s', 'paolo_d'],
      messages: [
        { from: 'bea_s', text: 'Hi Paolo! I booked your photo coverage for our foundation day.', at: '2026-11-13T05:50:00.000Z' },
        { from: 'paolo_d', text: 'Got it, thank you Bea! See you there.', at: '2026-11-13T06:10:00.000Z' }
      ],
      readCount: { bea_s: 2, paolo_d: 2 }
    }
  ];

  // ---- Header mega menu (Task 9): six categories, four sub-services each. `q` is a Browse search term that matches seeded gigs
  // in that category (tests/catalog.test.js checks every one), so no header link lands on an empty page. ----
  function sub(label, desc, q) { return { label: label, desc: desc, q: q }; }
  SEED.navMenu = [
    { cat: 'design', subs: [
      sub('Logo Design', 'Memorable logos for projects, orgs and shops', 'logo'),
      sub('Brand Kits', 'Logo, colours, fonts and social templates', 'brand'),
      sub('Illustration', 'Hand-drawn art and custom visuals', 'illustration'),
      sub('Photo Editing', 'Clean, polished edits for events and portraits', 'photo')
    ] },
    { cat: 'tech', subs: [
      sub('Web Development', 'Websites and web apps for capstones and orgs', 'web'),
      sub('React and Next.js', 'Components, pages and bug fixes', 'react'),
      sub('Python and Automation', 'Scripts and macros that save hours', 'python'),
      sub('Data and Statistics', 'Analysis and reports for your thesis', 'statistics')
    ] },
    { cat: 'writing', subs: [
      sub('Academic Editing', 'Clearer essays, reports and papers', 'editing'),
      sub('Thesis Proofreading', 'Final polish and formatting', 'thesis'),
      sub('Blogs and Articles', 'Friendly posts for your org or shop', 'blog'),
      sub('Copywriting', 'Words that sell, written in your voice', 'copywriting')
    ] },
    { cat: 'tutoring', subs: [
      sub('Math and Calculus', 'Algebra and calculus that finally click', 'math'),
      sub('Programming', 'Learn Python from scratch or catch up', 'programming'),
      sub('English Practice', 'Conversation practice with gentle feedback', 'english'),
      sub('Public Speaking', 'Prepare for reports and presentations', 'speaking')
    ] },
    { cat: 'admin', subs: [
      sub('Virtual Assistant', 'Reliable help with technical tasks', 'virtual'),
      sub('Data Entry', 'Accurate entry and tidy records', 'data entry'),
      sub('Spreadsheets', 'Cleanup, formulas and summaries', 'spreadsheet'),
      sub('Transcription', 'Transcripts and meeting notes', 'transcription')
    ] },
    { cat: 'others', subs: [
      sub('Event Photography', 'Candid and group photos for campus events', 'photography'),
      sub('Campus Events', 'Coverage for foundation days and org events', 'campus'),
      sub('Photo Coverage', 'Edited albums delivered in days', 'photo coverage'),
      sub('Event Photos', 'Memories from your event, kept tidy', 'event')
    ] }
  ];

  // ---- Pricing page (Task 20). All plans, fees and figures are mock; no money moves anywhere on this site. ----
  // features rows: a = first plan, b = second plan (the popular one). true = included, false = not included, a string is shown as text.
  function row(label, a, b) { return { label: label, a: a, b: b }; }
  SEED.pricing = {
    buyers: {
      plans: [
        { name: 'Basic', blurb: 'For occasional, project-based help.', price: 'Free', fee: 'No buyer fees',
          includes: ['Browse gigs from verified SLSU students', 'Message sellers and compare packages', 'Orders tracked in your profile', 'Pay on meet-up (demo)'], cta: 'Get started for free' },
        { name: 'Campus Plus', blurb: 'For ongoing work across the semester.', price: '₱99 / month', fee: 'Billed monthly (demo)',
          includes: ['Everything in Basic', 'Saved seller shortlists', 'Priority replies from top sellers', 'Early access to new gigs'], cta: 'Start with Campus Plus' }
      ],
      features: [
        { group: 'Discover trusted sellers', rows: [row('Browse every gig on campus', true, true), row('SLSU-verified members only', true, true), row('Top-seller shortlist', false, true)] },
        { group: 'Hire with confidence', rows: [row('Order tracking in your profile', true, true), row('Ratings and reviews', true, true), row('Saved seller lists', 'Limited access', 'Unlimited access')] },
        { group: 'Stay in touch', rows: [row('Messages to sellers', '5 per day', '15 per day'), row('Priority replies', false, true), row('Early access to new gigs', false, true)] }
      ]
    },
    sellers: {
      plans: [
        { name: 'Starter', blurb: 'Start selling your skills today.', price: 'Free', fee: '5% service fee (demo)',
          includes: ['Post up to 3 gigs', 'Receive and complete orders', 'A seller page with a portfolio', 'Messages with buyers'], cta: 'Start selling for free' },
        { name: 'Pro Seller', blurb: 'For sellers with a steady stream of orders.', price: '₱149 / month', fee: '0% service fee (demo)',
          includes: ['Everything in Starter', 'Unlimited gigs', 'Featured placement in Browse', 'Seller insights (demo)'], cta: 'Go Pro' }
      ],
      features: [
        { group: 'Get discovered', rows: [row('Seller page and portfolio', true, true), row('Gigs you can post', '3', 'Unlimited'), row('Featured placement in Browse', false, true)] },
        { group: 'Run your orders', rows: [row('Order tracking', true, true), row('Mark orders as completed', true, true), row('Service fee', '5%', '0%')] },
        { group: 'Grow your reputation', rows: [row('Ratings and reviews', true, true), row('SLSU-verified badge', true, true), row('Seller insights', false, true)] }
      ]
    },
    faq: [
      { q: 'Do I have to pay to use DiskarTasks?', a: 'No. Browsing, messaging, ordering and selling are free. The paid plans only add extras, and in this demo no payment is ever taken.' },
      { q: 'How does payment work between students?', a: 'Orders are marked "Pay on meet-up (demo)": buyer and seller agree where to meet, and any payment happens in person. The site never touches money.' },
      { q: 'Is a service fee taken from my earnings?', a: 'Sellers on Starter would pay a 5% service fee and Pro sellers 0%. These figures are placeholders for the course project.' },
      { q: 'Can I switch plans later?', a: 'Yes. You can move between plans at any time, and your orders, reviews and messages stay with your account.' }
    ]
  };

  /* @@SEED-NEXT@@ */

  root.SEED = SEED;
})(typeof window !== 'undefined' ? window : this);
