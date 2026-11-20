# Campus Gigs: Shot List (for approval, nothing captured yet)

Master clock: `timeline.json` (VO 264.9 s). 1920x1080, 30 fps. Local server only (`python3 -m http.server 8077` in the project folder). Brand: Slate Teal `#2F5A66`, Poppins headings, Inter body (from `css/tokens.css`).
Accounts (from `js/data.js`): buyer **Juana Dela Cruz**, seller **Paolo D.** (Sign In page has "Demo buyer / Demo seller" buttons; I never type the credentials by hand and never show the password).
Reset demo data before each take so seed state is identical.

Legend: **SCREEN** = real capture of the site. **MOGRAPH** = designed graphic (HTML/CSS rendered to frames, composited by ffmpeg). **SFX** = sound effect.

## ACT 1: Hook / ad (0:00 to 0:46.5), dark, punchy, MOGRAPH only
| # | Time | VO | Visual | SFX |
|---|---|---|---|---|
| 1 | 0.0-3.3 | "11 na ng gabi, bukas na ang pasahan" | Dark desk scene: laptop glow, digital clock reading 11:00 PM, subtle push-in | low room tone, clock tick |
| 2 | 3.9-4.8 | "Ay Diyos ko!" | Quick shake + word "BUKAS NA!" | hit |
| 3 | 5.8-15.8 | term paper, bagsak sa Calculus, tutor na mahal | Kinetic text stack: TERM PAPER / CALCULUS / ₱₱₱ crossing out | sigh-length riser |
| 4 | 17.5-19.3 | "Been there, done that" | Hard cut to a single-line freeze frame, vignette | cough-sync beat |
| 5 | 19.9-36.3 | Facebook group posting, tag-tag, ghoster | Generic mock group feed (no real Facebook logo/UI, no real people): post is typed, tags pile up, "Seen" ticks, reply bubble "?" then fades to ghost icon | typing, notification pings |
| 6 | 36.5-41.5 | oras nasayang, walang review, walang kasiguraduhan | Hourglass drains; two stamped words WALANG REVIEW / WALANG KASIGURADUHAN | stamp hits |
| 7 | 41.9-46.5 | "Akala mo lang wala! PERO MERON x3" | Beat-drop: each MERON slams bigger; screen flips from dark to teal on the third | 3 impact hits, whoosh |

## ACT 2: Reveal (46.8 to 58.8), SCREEN + MOGRAPH
| # | Time | VO | Visual | SFX |
|---|---|---|---|---|
| 8 | 46.8-50.0 | "Paano kung may isang lugar..." | Teal wash, soft light, campus photo (`images/campus.jpg`, CC BY-SA, credit in end card) | pad swell |
| 9 | 50.3-58.7 | Ito ang Campus Gigs, for SLSU students | Logo wipe-in over `index.html` hero ("Find skilled SLSU students. Get things done.") | applause under "Ito ang Campus Gigs" |

## ACT 3: Buyer walkthrough (59.4 to 142.3), SCREEN, signed in as Juana
| # | Time | VO | Page / action | Zoom target / on-screen text |
|---|---|---|---|---|
| 10 | 59.4-65.8 | homepage, malinis, malinaw | `index.html` slow scroll from hero | hero headline, hero proof line ("N00+ gigs completed, rated and reviewed" is a real on-site number; use it) |
| 11 | 66.4-76.7 | six categories, named one by one | `index.html` #categories grid | Highlight each tile in sync with cues: Design 69.4, Tech 70.5, Writing 72.5, Tutoring 74.5, Admin/Others 75.5. Lower-third counter "6 categories" |
| 12 | 77.1-80.1 | "mag-type sa search bar" | `browse.html`, type "calculus" in search | typing sound; results narrow to Calculus tutoring |
| 13 | 80.4-85.9 | rating, mura, "isang pindot lang" | Same page, open Sort: **Top Rated**, then **Price: Low to High** | callouts "Top rated", "Lowest price". **No "fastest" claim shown** (not on site); VO says it, visual just moves on |
| 14 | 86.4-100.5 | verified students, hindi estranghero | Gig 13 "College Algebra and Calculus Tutoring" by Ken C. (`gig.html?id=13`), pan to seller block and verified badge | highlight verified badge; caption "Verified SLSU students" |
| 15 | 101.0-111.4 | portfolio, araw ng paggawa, tapat na review | `seller.html?u=ken_c`: portfolio tiles, then gig package days, then reviews | 3 callouts in sync: 102.8 portfolio, 106.2 days, 107.8 reviews |
| 16 | 111.4-122.1 | kausapin, piliin, mag-order | `messages.html` (send a short message), then `order.html?gig=13&pkg=Standard`, fill date/time/notes, press Place order | highlight chat box, then package + Place order button |
| 17 | 122.6-128.8 | masusubaybayan ang order | `profile.html` Orders tab: "In Progress" pill with meet-up date and time, then a seeded "Completed" one | callout "In Progress → Completed". (Honest: two statuses, no timeline) |
| 18 | 129.0-136.7 | bayad sa meet-up, walang card | `order.html` payment box **"Pay on meet-up (demo)"** | zoom on payment box; text "No card. No checkout." |
| 19 | 137.3-142.3 | mag-iwan ng review | `profile.html` completed order, "Leave a review" modal: 5 stars + short text, submit | star fill animation, then cut |

## ACT 4: Seller walkthrough (142.6 to 176.0), SCREEN, signed in as Paolo D.
| # | Time | VO | Page / action | On-screen |
|---|---|---|---|---|
| 20 | 142.6-151.0 | "At ikaw, Pay-Yuyan?" edit, design, code, turo | Quick montage of 4 icons (edit, design, code, tutor) over teal, then dissolve to `index.html` "Become a Seller" button area | MOGRAPH montage |
| 21 | 151.4-160.1 | Post Gig: title, category, description, skills | `post-gig.html` split-screen: form left, **live preview** card right. Type title, pick category chip, type description, add 2-3 skills (Enter) | highlight each field as named |
| 22 | 160.6-165.5 | three packages: Basic, Standard, Pro | Toggle the three tiers on, fill price/days | tier tabs highlighted in order at 163.4 |
| 23 | 166.0-172.0 | "habang nagta-type, may live preview" | Keep typing in title; zoom on the preview card updating on the right | arrow + label "Live preview" |
| 24 | 173.2-175.9 | "Walang hulaan. Kitang-kita mo na." | Pull back to show form + preview, hold | **Do not press Publish** |

## ACT 5: Proof (176.4 to 210.0), MOGRAPH + SCREEN
| # | Time | VO | Visual | SFX |
|---|---|---|---|---|
| 25 | 176.4-189.8 | compare to Facebook groups; lahat nasa iisang lugar | `index.html` #compare table scroll-in, then MOGRAPH checkmark grid: verified students / order tracking / rating & review / meet-up pay, Campus Gigs all ticked vs Facebook groups unticked | tick sounds on cues 179.4, 182.0, 185.1 |
| 26 | 190.3-206.7 | 455+, 4.8, 9 of 10, isang araw | Big animated counters: **455+ gigs**, **4.8 ★**, **9 / 10 found a seller in 1 day**. Small footnote text: "Projected / target figures for this demo" (see Open Questions) | counter ticks |
| 27 | 207.9-209.1 | "Isang araw!" | Single huge "1 ARAW" slam | crowd cheer |

## ACT 6: Pricing (210.2 to 231.0), SCREEN
| # | Time | VO | Page / action | On-screen |
|---|---|---|---|---|
| 28 | 210.2-216.3 | Libre ang magsimula, Basic libre | `pricing.html` buyer tab: Basic card, "Free" | highlight price |
| 29 | 216.9-223.8 | Campus Plus 99/mo for buyers | Same: Campus Plus card, "₱99 / month" | callout |
| 30 | 223.8-230.7 | Pro Seller 149/mo, no service fee | Switch to sellers tab: Pro Seller card, "₱149 / month", "0% service fee" | callout. If VO "Basic for sellers" shows, card says "Starter": add caption "Free to start" so it doesn't look wrong |

## ACT 7: Close (231.4 to 264.9), MOGRAPH + stills
| # | Time | VO | Visual | SFX |
|---|---|---|---|---|
| 31 | 231.4-247.3 | hindi lang website, komunidad, nasa tabi mo lang | Slow montage of real photos from `images/` (about-1..4, hero-1..4), teal overlay, line "Isang komunidad." | soft music swell |
| 32 | 247.8-256.0 | Campus Gigs! ... WALANG TAMAD! | Logo + tagline "Humanap ng mahuhusay na estudyante." then "WALANG TAMAD!" slam on the beat | applause |
| 33 | 256.8-264.9 | Maraming salamat po. Demo lang ang presyo | End card: logo, "campus-gigs (demo)", photo credits line, **"Demo lang ang lahat ng presyo. Walang totoong perang kinukuha."** held on screen to end | none |

## Audio plan
VO untouched. Music bed: low-key tension in Act 1, bright upbeat from the "MERON" drop, ducked 12-15 dB under VO, final mix about -14 LUFS. Music and SFX must be royalty-free or generated; I will name every file and its source before downloading.

## Captions
Burned-in Tagalog captions, bracket tags removed, script spelling (not the rough whisper spelling), safe margins, plus `.srt`.

## Open questions I need you to decide
1. **Screen recording method.** The browser tools take screenshots only, not video. Options: (a) install Playwright + Chromium (about 150-200 MB) and record scripted takes at exactly 1920x1080 (recommended, repeatable); (b) you screen-record by hand with macOS (Cmd+Shift+5) while I give you a click script; (c) I capture screenshot sequences and animate them (lower fidelity, no live typing).
2. **The 455+ / 9-in-10 stats.** Show them as above with a "demo figures" footnote (recommended), show them with no footnote, or cut those visuals and play the VO over the pricing/compare visuals.
3. **Hook mock feed.** Generic mock group feed (recommended; avoids using Facebook's real UI) vs. stylised illustration only.
4. **Length.** Build to the full 4:25 (recommended, since the VO is final) or cut.
5. **Aspect ratios.** 16:9 only, or also a 9:16 cut of the Act 1 hook and Act 4 live-preview for social.
