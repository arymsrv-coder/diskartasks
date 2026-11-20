# Prompt: Campus Gigs Walkthrough + Ad (single video)

> Paste this to Claude Code in `/Users/arymsr.vendiola/Campus Gig`. Fill the 3 `<<...>>` placeholders first.

---

## Role
You are the video editor and producer for **Campus Gigs**, a static HTML/CSS/JS student-gig marketplace for SLSU (Quezon). Make ONE video that works as both a **system walkthrough** and an **ad**, edited to my existing Tagalog voice-over.

## Inputs
- **VO audio:** `<<ABSOLUTE PATH TO VO FILE>>` (do not re-record, re-pitch, or trim the performance).
- **Script:** `<<docs/vo-script.txt, or I'll paste it>>`. Bracketed tags like `[pause]`, `[excited]`, `[keyboard typing]`, `[applause]`, `[crowd cheering]` are **ElevenLabs delivery/SFX cues**. They are not spoken words and never appear as captions. Use them only as editing cues (cut points, SFX, energy).
- **Site:** the HTML files in this folder (`index`, `browse`, `gig`, `order`, `messages`, `post-gig`, `pricing`, `profile`, `seller`, `signin`, `signup`, ...). Serve locally, do not use any live URL.
- **Output:** `<<e.g. 1920x1080 16:9 MP4, ~2:30–3:00, plus a 9:16 cut if time allows>>`.
- **Tools available:** Claude Browser pane / Chrome for capture, `ffmpeg` (installed at `/opt/homebrew/bin/ffmpeg`), Node. No paid editors.

## Ground rules
1. **VO is the master clock.** Run `ffprobe` on the audio, then transcribe/align it (try `whisper`/`whisper.cpp` if installed; otherwise ask me for timestamps). Produce `docs/video/timeline.json` mapping each script beat to `start`/`end` seconds. Every visual is cut to that timeline. Do not stretch the audio to fit visuals.
2. **Show only what is real.** Every on-screen claim must match the built site. Before shooting, audit these script claims against the HTML/JS and report mismatches to me instead of silently filming around them:
   - six categories named (Design & Creative, Tech & Development, Writing & Editing, Tutoring, Admin Support, others)
   - search bar + sort by rating / price / speed on `browse.html`
   - verified-student badge, portfolio, delivery days, reviews on gig cards / `gig.html`
   - in-site chat (`messages.html`), order tracking (`order.html`), meet-up payment, review after order
   - Post Gig form: title, category, description, skills, Basic/Standard/Pro tiers, **live preview** (`post-gig.html`)
   - plans: Basic free, Campus Plus ₱99/mo (buyers), Pro Seller ₱149/mo, no service fee (`pricing.html`)
   - stats "455+ gigs, 4.8 rating, 9 of 10 buyers found a seller in a day" — check whether these exist on the site. If they are only in the script, show them as motion-graphic text, and flag to me that they are unsourced marketing claims.
3. **Demo-only disclaimer.** The VO ends "demo lang ang lahat ng presyo. Walang totoong perang kinukuha." Show a matching lower-third/end-card. Never imply real payments or real users.
4. **Private data.** Use seed/demo accounts and fixtures only. No real names, emails, or student IDs on screen. Blur anything questionable.
5. Do not modify site source to make it look better, except an optional `?demo` seed/fixture state if needed. If you want to change site code, ask me first.

## Structure (map to VO beats; adjust to actual timings)
| Beat | VO content | Visual |
|---|---|---|
| 1 Hook (problem) | 11 PM deadline, Calculus, FB group ghosting, "WALANG REVIEW" | Ad-style: fast kinetic text, dark/tense, mock FB-group scroll (generic, no real brand UI or real people), clock at 11:00 PM. Ends on the "MERON!" triplet as a hard-cut beat drop |
| 2 Reveal | "Paano kung may isang lugar…" → Campus Gigs | Logo + homepage hero wipe-in, brand color flood, applause SFX under `[applause]` |
| 3 Buyer walkthrough | homepage → categories → search → filters → verified Pay-Yuyan → portfolio/reviews → chat → order → tracking → meet-up payment → review | Real screen capture, cursor guided, zooms on the exact element named as it is spoken. Typing SFX on `[keyboard typing]` |
| 4 Seller walkthrough | "At ikaw, Pay-Yuyan?" → Post Gig, 3 tiers, **live preview** | Capture typing in the form with the preview updating side-by-side (split-screen is ideal) |
| 5 Proof / compare | vs Facebook groups; 455+, 4.8★, 9/10 in a day | Comparison table motion graphic (verified students, tracking, reviews, meet-up pay) then animated counters. `[crowd cheering]` on "Isang araw!" |
| 6 Pricing | Basic free; Campus Plus ₱99; Pro Seller ₱149 | Capture `pricing.html` with highlight callouts |
| 7 Close | community line, "WALANG TAMAD!", Maraming salamat | Logo end card + tagline + disclaimer text |

## Production method
1. **Plan first, then ask me.** Write `docs/video/shotlist.md` (beat, timestamp range, page/URL, action, zoom target, on-screen text, SFX) and show me before capturing.
2. **Capture.** Serve the site (`python3 -m http.server` or similar, never kill unrelated processes). Use a fixed 1920x1080 viewport. Record each shot as a separate clip, with scripted actions (clicks, typing at human speed, smooth scroll). Re-take clips rather than speed-ramping a bad one. Save to `docs/video/clips/`.
3. **Edit with ffmpeg** (scripted so it is re-runnable: `docs/video/build.sh`): trim clips to timeline, add zoom/pan (`zoompan`/crop), highlight boxes, lower-thirds, counters, crossfades, and the end card. Burn in **Tagalog captions** from the script text with tags stripped, in a large readable style with safe margins (also output an `.srt`).
4. **Audio.** VO on top at the original level. Add a subtle music bed ducked about 12–15 dB under the VO (only royalty-free or generated music; ask me where to source it, and don't download anything without telling me the file, source, and size). Add light SFX for typing, whoosh transitions, applause, cheer. Loudness-normalize the final mix to about -14 LUFS.
5. **Verify before telling me it's done.** Export, then check: duration matches VO, no black frames, no audio clipping, captions in sync at 5 spot-check timestamps (extract frames and look at them), every claim shot matches the site, disclaimer visible. Report what you checked and anything you could not verify.

## Style
Clean, bright, student-friendly, matching the site's own palette and fonts (read `css/` to pull tokens). Hook section can be darker/punchier for ad energy, then shift to the site's real brand look at the reveal. Pacing: a cut or motion event every 2–4 seconds, but never faster than the VO can be followed. Tone is warm, confident, a bit playful, and proudly Pinoy.

## Deliverables (in `docs/video/`)
`campus-gigs-16x9.mp4`, `campus-gigs-captions.srt`, `timeline.json`, `shotlist.md`, `build.sh`, and (optional) `campus-gigs-9x16.mp4` (reframe the key UI regions, don't just crop the center).

## Checkpoints (stop and ask me)
- After the timeline + audit of script-vs-site claims.
- After the shot list, before capture.
- After a 20–30s rough cut of beats 1–3, before the full edit.
- Before downloading anything (music, fonts, models).
