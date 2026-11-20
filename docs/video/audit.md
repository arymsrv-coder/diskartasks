# Script vs. site audit (checkpoint 1)

VO file: docs/i like vo2.mp3 — 264.9 s (4:25), 44.1 kHz mono. Script: docs/narration-script-filipino-v3-final.md

| Script claim | Site reality | Verdict |
|---|---|---|
| Six categories (Design & Creative, Tech & Development, Writing & Editing, Tutoring, Admin Support, Others) | js/data.js has exactly these six | OK |
| Search bar | Browse has search (?q=) | OK |
| "Highest rating / cheapest / fastest" in one tap | Sort options: Most Recent, Price Low-High, Price High-Low, Top Rated. Price-range filters too. No "fastest" sort | PARTIAL: film rating + price only, don't show "fastest" |
| Verified SLSU students | Home page "Verified Students" + shield; emails must be @slsu.edu.ph | OK (copy claim, not a real verification flow) |
| Portfolio, delivery days, reviews before ordering | seller.js has portfolio, gig tiers have days, reviews exist | OK |
| Chat on site | messages.html | OK |
| Order + tracking "from day and time until done" | Orders have meet-up date/time and two statuses: In Progress / Completed (profile.js, seller can Mark completed) | PARTIAL: show status pills + date/time, not a detailed timeline |
| Pay on meet-up | gig.html + order.html: "Pay on meet-up (demo)" | OK |
| Review after order | profile.js "Leave a review" on completed orders | OK |
| Post Gig: title, category, description, skills, Basic/Standard/Pro, live preview | post-gig.js: all present, preview is a real gig card | OK |
| Basic plan free for buyers AND sellers | Buyer plan "Basic" free. Seller free plan is named "Starter" (5% fee) | MISMATCH in name; show Starter on screen or accept the VO as is |
| Campus Plus PHP 99/mo (buyers) | pricing: "Campus Plus", PHP 99 / month | OK |
| Pro Seller PHP 149/mo, no service fee | pricing: PHP 149 / month, 0% fee | OK |
| 455+ gigs | Seed data has 18 gigs; no counter on site | UNSOURCED: motion graphic only |
| 4.8 average rating | Seed gigs mostly rated 4.8 | Plausible, no site stat |
| 9 of 10 buyers found a seller in a day | Not on site | UNSOURCED |
| Comparison vs Facebook groups | index.html compare table | OK, film it |

All data is seeded demo data (README). Demo accounts: Juana Dela Cruz (buyer), Paolo D. (seller); credentials in js/data.js SEED.demo.

## Timing flag
Prompt targeted 2:30-3:00 but the VO is 4:25. Plan for 4:25 or tell me where to cut the VO.

## Timeline status
No whisper installed (no python whisper/faster_whisper, no whisper-cpp). Silence detection found 32 pauses (≥0.45 s) at: 2.3, 4.0, 5.5, 9.8, 17.9, 19.9, 23.1, 25.2, 26.4, 28.9, 30.4, 48.7, 71.1, 72.5, 160.7, 163.4, 166.1, 173.3, 176.4, 187.8, 196.5, 207.5, 212.6, 231.3, 234.6, 236.4, 242.0, 246.1, 248.0, 251.9, 254.8, 258.7 s.
Long uninterrupted stretches (30.4-48.7-71.1, 72.5-160.7) mean silence anchors alone are too coarse for the walkthrough beats. Need either a transcription tool or your timestamps.
