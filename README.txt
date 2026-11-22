DISKARTASKS
A marketplace where SLSU students buy and sell services.
This is a UI/UX course project. Everything you see is demo data.

HOW TO OPEN IT
1. Double-click index.html. It opens in your browser. No install, no server.
2. Use Chrome, Edge or Safari. They are the browsers this site is meant for
   and they keep your demo data between visits.
   If a browser will not give the site normal storage when it is opened from a
   file, the data lasts only while the tab stays open. A notice at the top of
   the page says so when that happens.

WHAT THE STORAGE NOTICE MEANS
- "Your browser keeps this demo's data only while this tab stays open":
  the browser would not give the site normal storage, so it uses a fallback.
  Everything works; it is just forgotten when you close the tab.
- "Storage is blocked in this browser": nothing is saved from page to page.
  Open the site in Chrome, Edge or Safari.
- To start over at any time, use "Reset demo data" in Settings (when signed in)
  or on the Sign In page (when signed out), or clear the site's storage in your
  browser and reload. The seed data comes back.

TRY IT FAST: TWO DEMO ACCOUNTS
- A buyer: Juana Dela Cruz
- A seller: Paolo D.
The Sign In page has a button for each ("Demo buyer", "Demo seller") that
fills in the form for you.
The email and password for both are in js/data.js (look for SEED.demo).
They are demo credentials. Do not reuse a real password anywhere on this site.

SIGNING UP YOURSELF
Use an email that ends in @slsu.edu.ph and a password of at least 8 characters.
This is demo only: the password is not sent anywhere, so do not use a real one.

THE 12 PAGES
index.html       Home
browse.html      Browse gigs (search, filters, sorting)
gig.html         One gig (?id=1)
order.html       Order a gig (?gig=1&pkg=Standard)
seller.html      A seller's page (?u=paolo_d)
profile.html     Your profile, orders, favorites, reviews and settings
messages.html    Your conversations
post-gig.html    Post or edit a gig
pricing.html     Plans for buyers and sellers
about.html       About: story, mission, vision, values, the problem and solution, the team, FAQ, and the contact form (#contact)
signin.html      Sign in
signup.html      Sign up

LOOK AND FEEL: COLOURFUL AND DARK MODE
The default look is the "colourful" palette: warm cream page, green and orange buttons, mint and coral shapes,
pastel category tiles. The moon/sun button in the header (and the top bar on phones) switches to the dark palette
(deep teal header, hero and panels with olive-yellow buttons). The choice is remembered in your browser.
Colours live in css/tokens.css; the dark palette is the block at the end of that file.

BRAND
The logo is in brand/: logo.png (for light backgrounds), logo-dark.png (the navy parts turned cream, used in dark mode
and in the footer), favicon.png and apple-touch-icon.png. js/icons.js (Icons.logo) puts the logo and the name
"DiskarTasks" in the header, app bar and footer. Main colours: green #017A3F (primary buttons), deep navy #082743 (text),
forest #082E34 (footer and dark bands), teal #0B6B4F (links and accents). All are in css/tokens.css.
Tagline: "Aral sa Umaga, Diskarte All Day—The Free-Yuyan Way."

IMAGES
All pictures are cropped from the eleven photos supplied by the project owner (images/ has 43 files, plus 8 team portraits supplied by the team members).
images/CREDITS.txt lists them (also linked from the footer, "Photo credits"); images/README.txt explains which
file is used where and how to swap one.

FOLDERS
css/      five stylesheets, loaded in this order: tokens, base, components, shell, pages
js/       shared scripts (util, icons, storage, data, store, auth, ui)
js/pages/ one script per page
tests/    automated checks for the data and site rules
dev/      kit.html is a style guide that shows every component
docs/     the design spec and the build plan

RUNNING THE TESTS
You need Node.js (written and tested with Node 22; older versions are not
tested). No packages to install. From this folder:

    node tests/run.js

It prints every check and ends with "N passed, 0 failed".
The tests cover the data layer (accounts, orders, reviews, messages, storage)
and static rules for all 12 pages (links exist, no dead "#" links, scripts and
stylesheets load in the right order). They do not open a browser.

KNOWN LIMITS
- There is no server. Accounts and orders live in your own browser only.
- Messages get a canned reply after a short typing pause.
- Payments are never taken. Plans and prices on the Pricing page are examples.
- Google and Apple sign-in buttons are simulated.
