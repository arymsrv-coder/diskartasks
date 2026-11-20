# Campus Gigs Website: Design

Date: 2026-11-15. Status: approved by the owner on 2026-11-15; amended 2026-11-16 with the owner's reference pass (Indeed and Upwork, see "Reference pass").

## Intent and why

Campus Gigs is a marketplace where SLSU students buy and sell services: design, tech, writing, tutoring and admin support. The owner is a student building it as a **UI/UX course submission**. Eight mockups and a component kit already define how it looks. This project turns them into a working website.

Because it is graded as coursework, the data can be fake. What matters is that someone clicking through it believes it is a real product: it looks like the mockups, and no button is dead.

## Source material (read before planning)

All under `/Users/arymsr.vendiola/Downloads/UI_UX MAAM GARAY/`:

- `Idea/`: the eight mockups. `homepage.png`, `browse.png`, `about.png`, `contact.png`, `sign in.png`, `sign up.png`, `user_consumer.png` (buyer profile), `user_seller.png` (seller profile). **These are the source of truth.**
- `Campus Gigs UI Asset Kit Board (1).png`: colours, type, radii, spacing and component sizes.
- `UI Assets/`: the same components exported as PNGs at 1x/2x/3x. Reference pictures only; not usable as code.
- `Website sample UI_UX/campus-gigs-website.html`: an earlier four-page prototype. Useful for ideas (filter, sort and pagination logic; FAQ accordion). It conflicts with the mockups (different hero headline, four categories instead of six, no sign-in or profiles), so the mockups win. Its notes mention an "execution plan" with placeholder prices that we do not have; ignore those.
- `Downloads/First coding run for the website.pdf` (added 2026-11-16): the owner's reference pass. Screenshots of Indeed for Employers (`https://ph.indeed.com/?hl=en`, labelled "Landing page") and Upwork (`https://www.upwork.com`, labelled Home page, Browse gigs, Pricing, header and footer), with the instruction to apply them to the design system and the shared header, footer and pop-ups. The mockups still win for page bodies; the references win for the shell and for section patterns. See "Reference pass".
- The two PDFs in `Downloads/Lecture and Activity/` belong to a marketing class and are unrelated.

## Goals

1. Match the eight mockups closely in layout, copy, colour and component styling.
2. Add four pages the mockups imply but do not show, in the same visual style: **gig detail, order, messages, post a gig**. Every button leads somewhere.
3. Run the full marketplace loop with mock data (see "Definition of done").
4. Persist everything in the browser, so sign-ups, favorites, orders and messages survive a refresh.
5. Work on desktop, tablet and phone. The kit includes a mobile app bar and a bottom navigation, so the phone layout uses them.
6. Open by double-clicking `index.html`. The folder can be zipped and submitted as is.
7. Take the header, footer, pop-ups and section patterns from the owner's Indeed and Upwork references (see "Reference pass"), keeping the mockups' palette, type, copy and page bodies.

## Non-goals

- No server, real accounts, real payments, real email or real file hosting.
- No pixel-perfect copy of the mockups' AI-generated photography.
- No admin area, no notifications system, no multi-language support.

## Anti-goals (a failure even if it technically works)

- A dead button or link anywhere. Every interactive element navigates, opens something, or gives visible feedback.
- A site that only works with seeded browser data. It must recover from empty or corrupted storage by reseeding.
- Looking like a generic template instead of these mockups.
- Needing internet to function. Fonts may come from Google Fonts, but must fall back gracefully; everything else is local.

## Constraints

- Plain HTML, CSS and JavaScript. No framework, no build step, no package install.
- Must work from `file://`. So: no ES modules (browsers block them there), no `fetch` of local JSON files. Use classic `<script>` tags and put data in `.js` files.
- Output goes in `/Users/arymsr.vendiola/Campus Gig/`. The originals in Downloads stay untouched.
- Currency is Philippine peso (₱). The school is SLSU (Southern Luzon State University). Contact details shown in the mockup: `campusgigs@slsu.edu.ph`, "SLSU Main Campus".

## Approaches considered (how it is built)

1. **Separate HTML pages sharing one stylesheet and a few plain scripts.** Each page has its own address (`gig.html?id=3`), Back works, and it opens by double-click. Shared header and footer are injected by a script, so they are not copied into every page. **Chosen.**
2. **One-page app with in-page routing.** Smoother transitions, but one large file with more that can break when someone clicks around.
3. **React + Vite.** Tidier components, but needs Node and a build step before anyone can open it, which is a risk for a graded submission.

The owner left the how to me, so this is my call, not something they chose.

On scope, the owner chose **the 8 mockup screens plus 4 supporting pages**, over the 8-screens-only option where unmapped buttons would open pop-ups.

## Pages (13)

| Page | File | Source | Behaviour |
|---|---|---|---|
| Home | `index.html` | mockup | Hero (H1 "Find skilled SLSU students. Get things done." with the last line in Slate Teal; buttons *Browse Gigs* and *Become a Seller*; tilted photo collage with a "Campus Gigs" sticker). Popular Categories (6 cards, each links to Browse filtered). Top-Rated Gigs (4 cards). "Why Choose Campus Gigs?" band. Testimonial carousel with dots, plus campus photo ("Campus gigs, handled."). Sign-up CTA band. Footer with newsletter field. |
| Browse | `browse.html` | mockup | Banner, category radios (All + 6), price checkboxes (Under ₱500, ₱500–₱1,000, ₱1,000+), search field, sort select (Most Recent, Price low→high, Price high→low, Top Rated), 3-column grid of 6 per page, pagination, "Recommended for you" row. State lives in the URL (`?q=&cat=&price=&sort=&page=`) so category links and Back work. Empty-result state. |
| About | `about.html` | mockup | Hero, Our Story, Our Mission, "How Campus Gigs Works" (Browse → Connect → Get It Done), Who It's For, FAQ accordion (3 questions), CTA. |
| Contact | `contact.html` | mockup | Info column and "Send us a message" form (Name, Email, Message, all required). Validates, stores the message locally and shows a success state. Nothing is actually sent. |
| Sign In | `signin.html` | mockup | Email and password (show/hide), Forgot password? (opens a modal that "sends" a reset link), Google and Apple buttons (simulated: sign in as the demo buyer), link to Sign Up. Two "use demo buyer / demo seller" buttons fill the form. Honours `?next=`; without it, sellers land on their seller page and everyone else on Profile. |
| Sign Up | `signup.html` | mockup | Tabs *Student (Buyer)* / *Freelancer (Seller)*; Full Name, SLSU Email, Password (show/hide, min 8). Honours `?role=seller` and `?next=`. A small note says "Demo only: don't use a real password". After sign-up: buyer goes to Profile, seller goes to their seller profile with a "Post your first gig" prompt. |
| Buyer profile | `profile.html` | mockup | The signed-in user's hub. Banner, avatar, handle, "SLSU Student", Edit Profile. The mockup stacks everything on one long page: **My Orders** (chips All / In Progress / Completed; order rows with status pill and *View Details*), then **Favorites** (thumbnail grid with hearts), then **Recent Reviews** (with *See all*). The tab bar and the left nav (Profile, My Orders, Favorites, Settings, Log Out) are anchor links that scroll to those sections and highlight the current one; they do not hide content. **Settings** opens a slide-in panel (see Behaviour). For accounts that are also sellers, the left nav gains *Seller page* (their own `seller.html`) and *Orders received*. |
| Seller profile | `seller.html?u=handle` | mockup | Public page, stacked like the mockup. Banner, avatar, handle, headline, rating and review count, "Joined …", **Message** and **Follow** buttons. Below that: About Me (bio, skill chips), Portfolio grid, My Gigs (list with *View Gig*), Reviews. The mockup's left nav (Profile, My Gigs, Portfolio, Settings, Log Out) and tab bar are anchor links that scroll to those sections. The nav is shown to everyone, but **Settings and Log Out appear only to the owner**, and "My Gigs" reads "Gigs" for visitors. When the owner views their own page, Message/Follow become **Edit profile** and **Post a gig**, and an **Orders received** section appears (with *Mark as completed*), reachable from the nav and the avatar menu. |
| Gig detail | `gig.html?id=` | new | Image gallery, title, seller card (links to profile, Message), description, heart, **Basic / Standard / Pro** package selector (price, delivery days, revisions, what is included), *Continue (₱…)* button, reviews, "More from this seller". On phones a sticky bottom bar holds the price and button. |
| Order | `order.html?gig=&pkg=` | new | Requires sign-in. Package summary (quantity stepper for hourly gigs), preferred date and time (the kit's date and time inputs), notes to the seller, payment shown as "Pay on meet-up (demo)", order summary. *Place order* shows a success state with an order number and a link to My Orders. Cannot order your own gig. |
| Messages | `messages.html?with=handle` | new | Requires sign-in. Conversation list on the left, chat thread on the right (list-then-thread on phones). Sending a message makes the other person "type" for about 1.5 s and then reply with a canned, on-topic message. Entering via *Message* on a gig or seller page opens or creates the thread. Unread badge on the nav Messages icon. |
| Post a gig | `post-gig.html?edit=id` | new | Seller-only (others see a "Become a seller" prompt). Title, category, description, skills, up to three packages (price, days, revisions, inclusions), cover image, live preview card. Publishing adds the gig to Browse and My Gigs. My Gigs can edit and delete. |
| Pricing | `pricing.html?for=` | reference | Added by the reference pass (call 17). An audience toggle (*Buyers* / *Sellers*, the kit's segmented control; `?for=sellers` selects Sellers, anything else Buyers) over two plan cards for that audience (the second marked POPULAR), a Key Features table that follows the toggle, an FAQ accordion and a closing CTA band. Plan buttons go to `signup.html?role=buyer` or `signup.html?role=seller`, with the note "Demo only: no payment is taken." All plans, fees and features are mock. |

Footer *Privacy Policy*, *Terms of Service*, *Accessibility*, *Sitemap* and *Seller guidelines* open short placeholder modals. Social icons give a brief "demo: placeholder link" toast. *Forgot password?* and the newsletter field work as described in their sections.

## Behaviour

**Header** (Upwork's structure, the mockup's logo, copy and colours). Sticky, with a soft shadow once the page scrolls. Left to right: logo; nav (*Browse Gigs* with a mega menu, *Pricing*, *About Us*, *Contact*); a search field with a category select (All categories plus the six) that submits to `browse.html?q=&cat=`; then *Sign In* (outline) and *Sign Up* (filled) when signed out. When signed in: a favorites icon (to `profile.html#favorites`), a Messages icon with an unread badge, the avatar menu (My Profile, My Orders, Messages; for sellers also My Seller Page, Orders received and Post a gig; Log out), and, for sellers, a persistent filled *Post a gig* button (Indeed's pairing of one quiet and one filled action). The **mega menu** opens on hover, focus or the chevron beside *Browse Gigs*: the six categories on the left, the highlighted category's four sub-services on the right (a name and one line each), and a row of links (*See all gigs*, *Become a seller*, *Pricing*). Each sub-service opens Browse filtered by that category and a search term. "My Profile" and the phone bottom navigation's Profile both open `profile.html`. Below 1024 px the header becomes the kit's mobile app bar (logo, search icon, menu button) and the menu button opens a drawer with the search field, the categories as an accordion, the other links and the sign-in actions. Below 768 px the 64px bottom navigation (Home, Search, +, Messages, Profile) is added. The centre + goes to Post a gig for sellers and to Sign Up otherwise.

**Footer** (Upwork's link columns inside the mockup's Deep Teal footer). A brand block (logo, "Made for campus. Made for each other.", Follow Us icons, the newsletter field), then four link groups: *For Buyers* (Browse Gigs, How it works, Pricing, My Orders), *For Sellers* (Become a Seller, Post a gig, Seller fees, Seller guidelines), *Resources* (Help & support, FAQ, Success stories) and *Company* (About Us, Contact Us). A legal row: "© 2026 Campus Gigs. All rights reserved.", Privacy Policy, Terms of Service, Accessibility, Sitemap. A page can show a breadcrumb strip above the footer. Every link goes to a real page or anchor, or opens a short modal; social icons give the placeholder toast.

**Pop-ups.** Modal, slide-in drawer and toast, plus the mega menu, the avatar menu and the mobile menu drawer. Modals and drawers trap focus, close on Esc and on a click outside, return focus to whatever opened them, and stop the page behind from scrolling. Only one popover (mega menu or avatar menu) is open at a time, and opening a modal closes it.

**Roles.** One account can both buy and sell. The sign-up tab only sets the starting role. A buyer can become a seller from *Become a Seller* or Settings (a confirm step, then a seller profile is created).

**Order lifecycle.** The buyer places an order, which starts as **In Progress** and appears in the buyer's My Orders and the seller's Orders received. The seller can **Mark as completed**. Once completed, the buyer sees **Leave a review** (stars plus text). The review updates the gig's rating and count, and appears on the gig page, the seller profile and the buyer's Reviews tab.

**Favorites and follows.** The heart toggles a gig into the user's Favorites; Follow toggles on a seller and changes the follower count. Both require sign-in; when signed out they send the user to Sign In with `?next=` to come back.

**Guards.** Order, Messages, Post a gig and own Profile require sign-in and redirect to Sign In with `?next=`.

**Smaller behaviours.** Newsletter validates the email and shows "Thanks, you're on the list" inline. Testimonial carousel has dots, swipe, and auto-advance that pauses on hover and is off under reduced-motion. FAQ accordion is keyboard operable. Settings (a slide-in panel opened from the left nav): edit display name and bio, notification toggles (kit's switch), Become a Seller, **Reset demo data**, Delete account.

## Data (all mock, stored in `localStorage`)

Storage keys are prefixed and versioned (e.g. `campusgigs.v1.*`). If a key is missing or fails to parse, reseed from `data.js`.

Every page is a separate HTML file, so plain in-memory state would vanish on each click. The storage layer therefore needs a real fallback. `store.js` hides the backend behind one small interface: `localStorage` by default. If it is blocked, or the browser isolates `file://` pages from each other (Firefox does this), switch to **`window.name`**, which survives navigation within the same tab, and show a small notice that data lasts until the tab is closed. In fallback mode, open any external link in a new tab so the data is never carried to another site. If both fail, show a clear "storage blocked, try Chrome, Edge or Safari" banner instead of breaking silently. Detection and wording are the builder's call. A `README.txt` in the folder explains how to open the site and recommends Chrome, Edge or Safari.

Records: users, gigs (with packages), orders, reviews, conversations and messages, favorites, follows, session, newsletter signups, contact messages.

Seed content:
- 6 categories: Design & Creative, Tech & Development, Writing & Editing, Tutoring, Admin Support, Others.
- About 18 gigs across all six (so Browse shows three pages of six). Prices between roughly ₱200 and ₱1,500 so every price filter returns results. Reuse the mockup gigs: Minimalist Logo for your Capstone (Paolo D., ₱350–₱900, 4.9), Brand Kit and Logo Pack (Bea S., from ₱450), Next.js Components and Bug Fixes (Jaya R., from ₱500), Technical VA Hours (Jaya R., from ₱300), Statistical Analysis and Data Reports (Ken C.), Academic Writing and Editing (Rhea M.). Invent the rest plausibly.
- About 7 sellers, including `paolo_d` (Graphic Designer, BSIT student, joined March 2025, 4.8 from 87 reviews, skill chips Graphic Design / Canva / Photo Editing / Branding) and `designbysaye`.
- Two demo accounts, defined in the seed file:
  - `juana.delacruz` (buyer): three orders (one In Progress "Logo Design for Your Project" ₱450 by `designbysaye`, two Completed), four favorites, a couple of reviews.
  - `paolo_d` (seller): published gigs, portfolio, one In Progress and one Completed order received, reviews, seeded conversations.
- 4 testimonials (including Ana Santos: "Campus Gigs made it so easy to get my logo for our capstone. Highly recommended!").
- Ratings shown are seeded; new reviews recompute rating and count.

## Design system (from the kit)

Colours: Warm Cream `#FBE8CE`, Pale Olive `#E9E4B8`, Slate Teal `#2F5A66`, Ivory `#FDFBE3`, Deep Teal `#0B1D22`. Use Ivory as the page background, Cream for hero areas, Deep Teal for primary buttons, footer and the CTA band, Slate Teal for secondary buttons and headline emphasis, Pale Olive for the soft bands and active states.

Type: Poppins for headings, Inter for body. The kit lists H1 32/40 bold, H2 24/32 semibold, Title 20/28 semibold, Body 16/24, Caption 14/20 as the base scale. Scale the hero H1 up on desktop to match the homepage mockup.

Radii 4 / 8 / 12 / 16 / 24 px. 8-point spacing. Component heights: button 48, input 52, chip 36, segmented control 40, filter bar 56, bottom navigation 64. Rebuild every component in CSS: primary, secondary, outline and disabled buttons; icon buttons; chips and removable tags; inputs with leading icons and a focus state; checkbox, radio and toggle; segmented control; pagination and stepper; rating stars; gig card; quantity stepper.

Icons: one inline SVG set, 2px rounded stroke in Deep Teal, matching the kit's 24px icons plus the extras the mockups use (shield-check, zap, handshake, users, layout-grid, send, and the four social marks).

Imagery: styled placeholder tiles in the palette (gradient, soft pattern, category icon), initials-on-colour avatars, and illustrated hero frames. Every image path goes through one map in the seed data, so real photos dropped into `images/` replace placeholders without code changes. A missing file falls back to the placeholder.

Added by the reference pass (call 14 says why the palette does not change). The kit's buttons are already fully rounded, so no new radius is needed. New tokens: a *Warm Cream* button for dark bands (the role of Indeed's gold button), soft shadows for cards, popovers and modals, a Pale Olive to Warm Cream gradient (Upwork's highlighted row), a Deep Teal to Slate Teal gradient for CTA bands, a display type size for hero headlines, an error red `#B3261E` (at least 5:1 on Ivory, Cream and Pale Olive) for cross marks and form errors, a 1200 px content width, and a 72 px header (56 px app bar on phones). New components, all in the kit's colours: highlighted keyword, thin heading rule, proof row with avatar stack, logo row, icon tab strip, specialty card, steps (three columns, and card), dark media card, comparison table with check and cross marks, key-features table, plan card with a POPULAR badge, SLSU-verified badge, accordion (plain, split with a preview panel, and FAQ split), quote band, stat line, CTA band (wide and card), curved-edge hero, seller card, link grid, breadcrumb, rating line and long-text prose.

## Reference pass: Indeed and Upwork (added 2026-11-16)

The owner's references set **structure and interaction**: how the header navigates, how the footer is organised, which section patterns a marketplace uses. They do not set brand. Campus Gigs keeps its palette, type, logo and copy from the mockups. Colour roles borrowed: Indeed's saturated blue panels become Slate Teal (Deep Teal for the darkest); Indeed's gold button becomes the Warm Cream button; Indeed's pink shape becomes Pale Olive; Upwork's green buttons become Deep Teal (filled) and outline; Upwork's green highlight gradient becomes Pale Olive to Warm Cream; Upwork's green check marks become Slate Teal.

| Reference | Pattern taken | Campus Gigs component | Proposed page |
|---|---|---|---|
| Upwork header | sticky bar, nav with mega menu, scoped search, Log in and Sign up pills | site header, mega menu, scoped search | every page |
| Indeed header | one quiet and one filled action, always visible | sellers' persistent *Post a gig* | every page (sellers) |
| Upwork footer | link columns, social row, legal row, breadcrumb above | site footer, breadcrumb | every page |
| Indeed "Ready to find your next hire?", Upwork "The talent your business needs is ready when you are" | card and wide CTA | CTA band (card, wide) | Home, About, Pricing |
| Indeed hero | dark panel with a curved edge, photo on the curve, light CTA | curved-edge hero | About |
| Indeed "Manage your hiring from start to finish" | three short columns under a thin rule | steps (three columns) | About ("How Campus Gigs Works") |
| Indeed "Your dashboard features" | accordion beside a preview panel | split accordion | About |
| Indeed testimonial | tinted band, quote mark, bold quote | quote band | About, Home |
| Indeed FAQ | heading left, accordion right | FAQ split | About, Pricing |
| Indeed sponsored-jobs stat | centred stat with a trend icon | stat line | Pricing |
| Upwork hero | big headline with highlighted words, proof row | highlighted keyword, proof row | Home |
| Upwork category tabs, specialty cards | icon tab strip; cards with "N available" and avatars | icon tab strip, specialty card | Home, Browse |
| Upwork "Trusted by" row | row of names | logo row | Home |
| Upwork "How work gets done" | steps card beside a dark media card | steps card, media card | Home |
| Upwork "Why us?" | highlighted-row comparison with checks and crosses | comparison table | Home or About |
| Upwork "Explore freelancer markets" | grid of text links | link grid | Browse ("Popular searches") |
| Upwork browse lists | freelancer cards with verified badge, rating line | seller card, rating line | Browse ("Top sellers") |
| Upwork Pricing | audience toggle, plan cards with POPULAR tag, key-features table | segmented control, plan card, key-features table | Pricing (new page) |

The header, footer and pop-ups are built in the shell and apply to every page. The section components are built into the design system first; where they land on each page is a proposal (the right-hand column) that the owner confirms before those page tasks start, because it changes the mockup layouts.

## Responsive and accessibility

Layouts at roughly 1280, 768 and 375 px. On phones, Browse filters collapse behind the kit's filter bar button. All modals trap focus and close on Esc. Visible `:focus-visible` outlines, labelled form fields, tab and accordion semantics, alt text, touch targets of at least 44 px, `prefers-reduced-motion` respected, text contrast of at least 4.5:1 (check Slate Teal on Cream).

## Definition of done

Run these in a browser and all must work without console errors:

1. **Buyer loop.** Home → Browse → filter to Design → open a gig → pick Standard → Continue → sign up as a Student → choose date and time → place order → it shows In Progress in My Orders.
2. **Seller loop.** Log out, sign in as the demo seller → Orders received → Mark as completed. Back as the buyer → Leave a review → the gig's rating and review count change.
3. **Post a gig.** Sign up as a Freelancer → Post a gig → it appears in Browse and in My Gigs; edit and delete work.
4. **Messaging.** Message a seller from a gig page → thread opens → a reply arrives.
5. **Persistence.** Refresh keeps all of the above. *Reset demo data* restores the seed. Clearing storage by hand and reloading reseeds cleanly. Repeat the buyer loop by double-clicking the file in Chrome and in Firefox (this exercises the storage fallback).
6. **Fidelity.** Each mockup page, put side by side with its screenshot, matches in layout, copy, colours and components, at desktop width. The header, footer and pop-ups are the exception: they follow the reference pass and keep the mockups' logo, copy and colours. The Pricing page is compared with the Upwork pricing screenshots instead.
7. **Responsive.** 375 px and 768 px have no horizontal scroll, and phone navigation works.
8. **No dead ends.** Every link, button, social icon, mega-menu link and footer link does something visible.
9. **Shell.** The mega menu, avatar menu, mobile menu drawer, modals and drawers work by mouse, touch and keyboard: Esc and an outside click close them, focus returns to what opened them, and two popovers are never open at once.

## Calls I made (the owner can overrule any of these)

1. Plain multi-page HTML/CSS/JS, as above.
2. Sign-up requires an `@slsu.edu.ph` email, because "verified SLSU students" is the product's core promise. The error message points to the demo accounts for anyone without one.
3. One account can both buy and sell.
4. Orders start In Progress; there is no payment step beyond "Pay on meet-up (demo)"; sellers complete orders; buyers review afterwards.
5. The other person's chat replies are canned.
6. Placeholder imagery by default.
7. Passwords are not secure and the UI says so. Mock hashing only, since the browser's crypto API is not reliable on `file://`.
8. Google/Apple sign-in, Forgot password, Privacy, Terms and social icons are lightweight simulations.
9. Settings is a slide-in panel, not its own page.
10. Storage falls back to `window.name` when `localStorage` is blocked or isolated per file (see Data), with a notice. This keeps the separate-pages approach.
11. The two profile pages are long stacked pages like the mockups. The tab bar and left nav scroll to sections rather than hiding content.
12. On the seller page the left nav shows for everyone; Settings and Log Out show only to the owner, since the mockup mixes owner navigation with visitor buttons.
13. "My Profile" always opens `profile.html`. A seller reaches their seller page and Orders received from the avatar menu and the profile nav, and signing in as a seller lands on their seller page.
14. The references change structure, not brand. The palette, type, logo and copy stay as the mockups define them (the owner's mockups and kit are the graded design); Indeed's blue, gold and pink and Upwork's green are translated into Slate Teal, Warm Cream, Pale Olive and Deep Teal.
15. The mockups' simple header and footer are replaced by the Upwork-style header (mega menu, scoped search) and footer (link columns). Everything the mockups show in them stays: logo, the three links, the search, Sign In and Sign Up, and the Deep Teal footer with tagline, Quick Links content, Follow Us and the newsletter field.
16. The Indeed "Landing page" is read as a source of marketing-section patterns (curved hero, three columns, feature accordion, testimonial band, CTA card, FAQ), proposed for About and Pricing, not as a separate page. The Upwork "Home page" sections are proposed as additions below the mockup's existing Home sections. Placement is confirmed by the owner before those tasks.
17. A Pricing page is added because both references have one and the Upwork header links to it. The plans, fees and features are mock (see Pages).
18. The mega menu has six categories with four invented sub-services each. A test checks every sub-service search term returns at least one gig, so no header link lands on an empty Browse page.
19. The header search's scope select lists the categories (All plus six), not Upwork's Talent/Jobs, because categories are what Browse can filter by.
20. The seller card's "verified" badge reads "SLSU verified", matching the Home band's "Verified Students".
21. Footer and header links that have no page of their own (Seller guidelines, Privacy, Terms, Accessibility, Sitemap) open short modals; Home, Browse, About and Pricing carry the anchors the footer links to (`#community`, `#how`, `#faq`, `?for=sellers`).

## Left to the builder

Seed copy beyond what is listed (gig descriptions, reviews, FAQ answers, mega-menu sub-service names, Pricing plans and feature rows); drawing the icons; how the hero collage is tilted and framed; animation and micro-interactions; exact breakpoints; the canned-reply text bank; how Post a gig handles an uploaded cover (suggested: resize to a small data URL, fall back to a tile); an optional "add portfolio item" on the owner's own seller page; internal file and function organisation within the structure below; and the test and verification approach.

Suggested structure:

```
Campus Gig/
  index.html  browse.html  about.html  contact.html  signin.html  signup.html
  profile.html  seller.html  gig.html  order.html  messages.html  post-gig.html  pricing.html
  css/   tokens.css  base.css  components.css  shell.css  pages.css
  js/    data.js (seed)  store.js (storage + domain logic)  ui.js (header, footer, toast, modal)
         auth.js  + one small script per page
  images/  (placeholders; real photos can be dropped in here)
  README.txt  (how to open the site; recommended browsers)
  docs/superpowers/specs/  (this file)
```
