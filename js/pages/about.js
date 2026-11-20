/* About & Contact page: story, how it works, profile features, testimonial, FAQ, and the message form
   (stored locally; nothing is sent). */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'about' });

  var esc = Util.esc;
  var user = Store.currentUser();

  document.querySelectorAll('[data-ico]').forEach(function (el) {
    el.insertAdjacentHTML('afterbegin', Icons.svg(el.getAttribute('data-ico'), { size: Number(el.getAttribute('data-size')) || 28 }));
  });

  var alts = { aboutCollage1: 'Students studying together', aboutCollage2: 'Student designing at a laptop', aboutCollage3: 'Student coding', aboutCollage4: 'Student writing' };
  document.querySelectorAll('[data-frame]').forEach(function (el) {
    var key = el.getAttribute('data-frame');
    el.innerHTML = UI.tile(SEED.images[key], alts[key]);
  });

  // signed-in sellers and buyers go straight to Post a gig (which offers the become-a-seller step to buyers)
  if (user) document.getElementById('about-seller').setAttribute('href', 'post-gig.html');

  // the testimonial band uses the first quote, Ana Santos'
  var t = Store.testimonials()[0];
  document.getElementById('about-quote').innerHTML = Icons.svg('quote', { size: 32 }) + '<p class="quote-band__text">“' + esc(t.quote) + '”</p><p class="quote-band__by"><strong>' + esc(t.name) + '</strong>, ' + esc(t.role) + '</p>';

  // FAQ from the seed, one open at a time
  document.getElementById('faq-acc').innerHTML = Store.faq().map(function (f, i) {
    return '<div class="acc__item"><h3><button class="acc__btn" type="button" id="fq' + i + 'b" aria-expanded="false" aria-controls="fq' + i + 'p">' + esc(f.q) + Icons.svg('chevron-down', { size: 20 }) + '</button></h3>' +
      '<div class="acc__panel" id="fq' + i + 'p" role="region" aria-labelledby="fq' + i + 'b" hidden>' + esc(f.a) + '</div></div>';
  }).join('');
  UI.accordion(document.getElementById('faq-acc'));
  UI.accordion(document.getElementById('profile-acc'));

  // closing call to action: a card beside a campus photo
  document.getElementById('about-cta-photo').innerHTML = UI.tile(SEED.images.campusSunset, 'SLSU campus buildings in golden evening light');
  document.getElementById('about-cta-card').innerHTML = UI.ctaBand({
    title: 'Ready to get started?', text: 'Join Campus Gigs today and be part of our growing community.',
    label: 'Browse Gigs', href: 'browse.html', variant: 'card'
  });

  // ---- Contact section
  var $ = function (id) { return document.getElementById(id); };

  $('contact-photo').innerHTML = UI.tile(SEED.images.contactPhoto, 'A friendly student smiling at the camera');
  $('ci-mail').innerHTML = Icons.svg('mail', { size: 22 });
  $('ci-pin').innerHTML = Icons.svg('pin', { size: 22 });
  $('ci-users').innerHTML = Icons.svg('users', { size: 22 });
  $('send-arrow').innerHTML = Icons.svg('arrow-right', { size: 20 });
  $('contact-socials').innerHTML = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['x-social', 'X'], ['youtube', 'YouTube']].map(function (s) {
    return '<button class="social" type="button" data-social aria-label="' + s[1] + '">' + Icons.svg(s[0], { size: 20 }) + '</button>';
  }).join('');
  $('contact-socials').addEventListener('click', function (e) { if (e.target.closest('[data-social]')) UI.toast('Demo: placeholder link'); });

  // signed-in visitors do not retype their name and email
  if (user) { $('c-name').value = user.name; $('c-email').value = user.email; }

  var fields = ['name', 'email', 'message'];
  function setError(field, message) {
    var input = $('c-' + field), p = $('e-' + field);
    if (message) {
      p.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(message) + '</span>';
      p.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'e-' + field);
      $('f-' + field).classList.add('field--error');
    } else {
      p.hidden = true;
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      $('f-' + field).classList.remove('field--error');
    }
  }
  fields.forEach(function (f) { $('c-' + f).addEventListener('input', function () { setError(f, ''); $('form-error').hidden = true; }); });

  var form = $('contact-form');
  var saving = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (saving) return;
    var v = { name: $('c-name').value.trim(), email: $('c-email').value.trim(), message: $('c-message').value.trim() };
    $('form-error').hidden = true;
    var problems = {};
    if (!v.name) problems.name = 'Enter your name.';
    if (!v.email) problems.email = 'Enter your email.';
    else if (!Util.isValidEmail(v.email)) problems.email = 'Enter a valid email address.';
    if (!v.message) problems.message = 'Write a message first.';
    fields.forEach(function (f) { setError(f, problems[f] || ''); });
    var firstBad = fields.filter(function (f) { return problems[f]; })[0];
    if (firstBad) { $('c-' + firstBad).focus(); return; }

    saving = true;
    $('send-btn').disabled = true;
    var r = Store.saveContact(v);
    if (!r.ok) {
      saving = false;
      $('send-btn').disabled = false;
      $('form-error').innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(r.error) + '</span>';
      $('form-error').hidden = false;
      return;
    }
    // success replaces the form
    $('contact-card').innerHTML = '<div class="empty-state" role="status">' + Icons.svg('check-circle', { size: 48 }) + '<h2>Message sent</h2><p>Thanks, ' + esc(v.name.split(/\s+/)[0]) + '. This is a demo, so your message is saved only in this browser, but the team would have it by now.</p><button class="btn btn--outline" type="button" id="send-another">Send another</button></div>';
    $('send-another').focus();
    $('send-another').addEventListener('click', function () { location.reload(); });
  });
})();
