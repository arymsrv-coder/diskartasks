IMAGES
Every picture on the site is a real photo in this folder (51 files). They are crops of the eleven source
photos supplied by the project owner; images/CREDITS.txt lists each file. The footer's "Photo credits" link opens it.

WHAT EACH FILE IS FOR (names are set in js/data.js)
hero-1.jpg .. hero-4.jpg          the four photos in the Home page hero
about-1.jpg .. about-4.jpg        the four photos in the About page collage
contact.jpg                       the photo beside "Let's stay in touch" on the Contact page
campus.jpg                        the SLSU main building (Home, with the "Campus gigs, handled." caption)
campus-2.jpg                      campus in evening light (Contact and About strips, Sign In / Sign Up background)
campus-3.jpg                      a campus walkway (the "How it works" card on Home)
banner.jpg                        the wide banner behind "Browse Gigs" and the profile cover strips
gig-01.jpg .. gig-18.jpg          the cover of each of the 18 sample gigs (gig-NN is gig number NN)
work-<seller>-<n>.jpg             portfolio pieces on the seller pages (12 files)
team-<name>.jpg                   the eight team portraits on the About page (set in SEED.team in js/data.js)

New gigs start from one of six category photos (gig-01, gig-03, gig-06, gig-13, gig-16 and gig-18); sellers can also
upload their own cover on the Post a gig page, which is resized in the browser and stored in their browser only.

HOW TO SWAP A PHOTO
1. Save the new picture as a JPEG in the same shape as the one it replaces:
     gig covers      1200 x 675 (16:9), keep the subject near the middle
     hero / about / contact / portfolio   1000 x 750 (4:3)
     campus          1600 x 1000          banner   2400 x 800
2. Copy it over the old file in this folder, keeping the file name. (To use a new file name instead, change the
   name in js/data.js: SEED.images for the page photos, GIG_PHOTO for gig covers, tiles([...]) for portfolio.)
3. Reload the page. A missing or misspelled file falls back to a coloured placeholder tile, never a broken picture.
   If the site still shows old pictures after you change data.js, raise SEED.version: the browser keeps its demo
   data until the version changes, or until you use Reset demo data.
4. Update the description in SEED.photoAlt (screen readers read it) and the line in CREDITS.txt.
   "node tests/run.js" fails if a photo is unused, uncredited, lacks a description, is not a JPEG, or if this folder
   passes 6 MB.
