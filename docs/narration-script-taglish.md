# Campus Gigs: Taglish Narration Script (UI/UX class presentation, ~3:30)

All numbers, quotes and names below are made up for the project (demo data), as you said.

## ElevenLabs setup (1 voice)
1. Model: choose **Eleven Multilingual v2** (stable, supports Filipino/Tagalog) or **Eleven v3** (more expressive, also supports Filipino). Avoid Turbo/Flash for Taglish, since they handle code-switching worse.
2. Voice: open the Voice Library, filter Language = Filipino (or Tagalog) and pick one that sounds young and friendly. If none sounds right, any warm English voice on Multilingual v2 will still read Taglish; it will just have a slightly English accent. Test a 2-sentence sample first (costs very few credits).
3. Settings: Stability ~40%, Similarity ~75%, Style ~25%.
4. Credits: generate ONE section at a time and only regenerate the part you dislike. Do not regenerate the whole script.
5. Pauses: `<break time="0.5s" />` works on Multilingual v2. On v3, delete the tags and rely on line breaks and "...".
6. Spelling is written the way it should sound ("Kampus Gigs" is fine as "Campus Gigs"; prices are written out as "pesos").

---

## VOICEOVER (paste this part)

### 1. Hook
Deadline na bukas, pero wala ka pang logo para sa org ninyo. <break time="0.4s" /> O kaya, kailangan mo ng tutor sa Calculus, pero hindi mo alam kung sino ang lalapitan. <break time="0.5s" />
Familiar ba? <break time="0.6s" />

### 2. Problem
Sa ngayon, ang ginagawa natin, mag-po-post sa Facebook group, maghihintay ng sagot, tapos hindi mo pa sigurado kung legit ang kausap mo. Walang order history. Walang reviews. Walang kasiguraduhan. <break time="0.7s" />

### 3. Solution
Kaya ginawa namin ang Campus Gigs. <break time="0.4s" /> Isang marketplace kung saan ang mga SLSU students ay puwedeng mag-offer at mag-hire ng services, para sa isa't isa. <break time="0.7s" />

### 4. Browse
Simulan natin sa homepage. Malinaw, simple, at diretso sa punto. <break time="0.3s" /> May anim na categories: Design, Tech, Writing, Tutoring, Admin Support, at Others. Pumili ka lang, o gamitin ang search. <break time="0.3s" />
Sa Browse page, puwede kang mag-filter at mag-sort, para makita agad ang top-rated na gigs, o yung pasok sa budget mo. <break time="0.7s" />

### 5. Trust
Bawat seller ay verified na SLSU student. <break time="0.3s" /> Kaya hindi ka makikipag-deal sa kung sino lang. Kasamahan mo sa campus ang kausap mo. <break time="0.3s" />
Sa bawat gig, makikita mo ang packages, ang delivery days, at ang totoong reviews ng ibang students, bago ka pa mag-decide. <break time="0.7s" />

### 6. Ordering
Nahanap mo na ang bagay sa'yo? <break time="0.3s" /> I-message mo ang seller mismo sa app. Pag-usapan ang details, piliin ang package, at mag-order, sa ilang taps lang. <break time="0.3s" />
Susundan mo ang order mo mula In Progress hanggang Completed. At ang bayad? Sa meet-up, face to face sa campus. Walang complicated na checkout. <break time="0.3s" /> Pagkatapos, mag-iwan ka ng honest review para makatulong sa susunod na student. <break time="0.7s" />

### 7. Sellers
At kung ikaw naman ang may skills? <break time="0.4s" /> Gawin mo itong kita. <break time="0.3s" />
Sa Post a Gig page, ilalagay mo lang ang title, category, description, at skills mo. Puwede kang mag-set ng hanggang tatlong packages: Basic, Standard, at Pro. <break time="0.3s" /> At habang nag-ta-type ka, may live preview na nagpapakita kung paano lalabas ang gig mo sa Browse. <break time="0.3s" /> Walang hulaan, kitang-kita mo agad. <break time="0.7s" />

### 8. Why us (comparison)
Kumpara sa Facebook groups o sa pasalitang rekomendasyon, ang Campus Gigs ay may verified students, order tracking, ratings at reviews, at meet-up payment, lahat sa isang lugar. <break time="0.7s" />

### 9. Impact (made-up demo numbers)
Sa aming pilot na may demo data: mahigit isang libo at dalawang daang students ang sumali, may apat na raan at limampung gigs na naka-post, at may average rating na 4.8 sa lima. <break time="0.3s" /> At ayon sa feedback ng mga nag-test, siyam sa sampung buyers ang nakahanap ng seller sa loob lang ng isang araw. <break time="0.7s" />

### 10. Pricing
Libre ang magsimula. <break time="0.3s" /> Ang Basic plan ay free para sa buyers at sellers. Kung gusto mo ng extras, may Campus Plus na siyamnapu't siyam na piso kada buwan para sa buyers, at Pro Seller na isandaan at apatnapu't siyam na piso kada buwan, na zero percent ang service fee. <break time="0.3s" /> Para sa project na ito, demo lang ang mga presyo, walang totoong bayad na kinukuha. <break time="0.7s" />

### 11. Design and accessibility (for your UI/UX class)
Dahil ito ay UI/UX project, binigyan namin ng pansin ang karanasan ng bawat user. <break time="0.3s" /> Pare-pareho ang kulay, font, at components sa lahat ng pages, kaya madaling matutunan. <break time="0.3s" /> Gumagana ito sa phone, tablet, at laptop. <break time="0.3s" /> May keyboard support, malinaw na labels para sa screen readers, at puwedeng i-pause ang rotating na testimonials para sa mga nahihirapang magbasa nang mabilis. <break time="0.3s" /> Kahit mali ang input mo sa form, may malinaw na error messages na magsasabi kung ano ang aayusin. <break time="0.7s" />

### 12. Close
Ang Campus Gigs ay hindi lang isang website. <break time="0.4s" /> Isa itong komunidad, kung saan ang talento ng bawat SLSU student ay may pagkakataong lumago. <break time="0.6s" />
Campus Gigs. <break time="0.4s" /> Find skilled students. <break time="0.3s" /> Get things done. <break time="0.6s" />
Maraming salamat po!

---

## Made-up figures (change freely, just keep them consistent with your slides)
| Item | Value used |
|---|---|
| Students joined | 1,200+ |
| Gigs posted | 450 |
| Average rating | 4.8 / 5 |
| Found a seller within a day | 9 in 10 |
| Campus Plus | 99 pesos / month (from your pricing page) |
| Pro Seller | 149 pesos / month, 0% fee (from your pricing page) |

## Slide / screen guide
1. Hook + 2. Problem: a screenshot of a messy Facebook group post (or a plain slide)
3. Solution: homepage hero
4. Browse: categories grid, then browse.html with filters
5. Trust: "Why Choose Campus Gigs?" band, then a gig page with reviews
6. Ordering: gig.html, order.html, messages.html, profile.html orders tab
7. Sellers: post-gig.html with live preview
8. Why us: comparison table on the homepage
9. Impact: one simple stats slide
10. Pricing: pricing.html
11. Design: dev/kit.html (your style guide) works well here
12. Close: "Ready to get started?" CTA
