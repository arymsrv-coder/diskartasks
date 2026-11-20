/* Messages page (messages.html?with=<handle>). A conversation list and a chat thread; replies from the other student are canned
   and arrive after a short "typing" pause. Phones show the list first, then the thread. */
(function () {
  'use strict';

  Store.init();
  var viewer = Auth.require();
  if (!viewer) return;
  UI.mount({ page: 'messages' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var me = viewer.handle;
  var q = UI.query();
  var requested = q.get('with');
  var activeId = null;
  var showThread = false;                    // phones: false = list, true = thread
  // On a phone the list and the thread are separate screens (max-width 767px, see pages.css). A thread only counts as
  // read once it is actually on screen, so the newest conversation keeps its unread dot while the list is showing.
  function threadVisible() { return showThread || !(window.matchMedia && window.matchMedia('(max-width: 767px)').matches); }
  var typingTimers = {};

  function other(conv) { return conv.members[0] === me ? conv.members[1] : conv.members[0]; }
  function isUnread(conv) {
    var seen = conv.readCount[me] || 0;
    return conv.messages.some(function (m, i) { return m.from !== me && i >= seen; });
  }
  function fmt(iso) {
    var d = new Date(iso), n = Store.now();
    if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function convById(id) { return Store.conversationsOf(me).filter(function (c) { return c.id === id; })[0]; }

  // ---------- open the requested thread (or the first one)
  if (requested) {
    if (requested !== me && Store.getUser(requested)) { activeId = Store.openConversation(me, requested).id; showThread = true; }
    else UI.toast('We couldn’t open that chat.');
  }
  var all = Store.conversationsOf(me);
  if (!all.length) {
    $('messages').hidden = true;
    $('inbox-empty').hidden = false;
    $('inbox-empty').innerHTML = '<div class="empty-state">' + Icons.svg('message', { size: 48 }) + '<h2>No messages yet</h2><p>Message a seller from their gig or profile and your chat will show up here.</p><a class="btn btn--primary" href="browse.html">Browse Gigs</a></div>';
    return;
  }
  if (!activeId || !convById(activeId)) { activeId = all[0].id; }
  $('send').innerHTML = Icons.svg('send', { size: 22 });

  // ---------- list
  function renderList() {
    $('convo-list').innerHTML = Store.conversationsOf(me).map(function (c) {
      var h = other(c), u = Store.getUser(h), last = c.messages[c.messages.length - 1];
      var name = u ? u.name : 'Former student';
      var preview = last ? (last.from === me ? 'You: ' : '') + last.text : 'No messages yet. Say hello!';
      return '<button type="button" class="convo" data-id="' + esc(c.id) + '"' + (c.id === activeId ? ' aria-current="true"' : '') + '>' + UI.avatar(u, 48) +
        '<span class="convo__main"><span class="convo__top"><strong>' + esc(name) + '</strong>' + (last ? '<time>' + esc(fmt(last.at)) + '</time>' : '') + '</span>' +
        '<span class="convo__preview">' + esc(preview) + '</span></span>' + (isUnread(c) ? '<span class="convo__dot" aria-label="Unread messages"></span>' : '') + '</button>';
    }).join('');
  }
  $('convo-list').addEventListener('click', function (e) {
    var b = e.target.closest('.convo');
    if (!b) return;
    openThread(b.getAttribute('data-id'));
  });

  // ---------- thread
  function bubble(m) {
    var mine = m.from === me;
    return '<div class="bubble-row' + (mine ? ' is-mine' : '') + '"><div class="bubble"><p>' + esc(m.text) + '</p><time>' + esc(fmt(m.at)) + '</time></div></div>';
  }
  function renderThread(keepTyping) {
    var c = convById(activeId);
    var h = other(c), u = Store.getUser(h);
    $('thread-head').innerHTML = '<button class="thread__back icon-btn" type="button" id="back" aria-label="Back to conversations">' + Icons.svg('arrow-left', { size: 22 }) + '</button>' + UI.avatar(u, 44) +
      '<div class="thread__who">' + (u ? (u.isSeller ? '<a href="seller.html?u=' + encodeURIComponent(h) + '"><strong>' + esc(u.name) + '</strong></a>' : '<strong>' + esc(u.name) + '</strong>') + '<span class="caption">@' + esc(h) + '</span>' : '<strong>Former student</strong><span class="caption">This account is no longer active</span>') + '</div>';
    $('back').addEventListener('click', function () { showThread = false; UI.setUrl('messages.html'); applyView(); });
    $('thread-body').innerHTML = c.messages.length ? c.messages.map(bubble).join('') : '<p class="thread__empty">No messages yet. Say hello!</p>';
    if (keepTyping) $('thread-body').insertAdjacentHTML('beforeend', typingRow());
    $('thread-body').scrollTop = $('thread-body').scrollHeight;
    var former = !u;
    $('draft').disabled = former;
    $('composer-note').hidden = !former;
    $('composer-note').textContent = former ? 'You can no longer message this student.' : '';
    updateSend();
  }
  function typingRow() { return '<div class="bubble-row" id="typing"><span class="sr-only">Typing…</span><div class="bubble bubble--typing" aria-hidden="true"><span></span><span></span><span></span></div></div>'; }

  function openThread(id) {
    activeId = id;
    showThread = true;
    var c = convById(id);
    Store.markRead(id, me);                                  // opening a thread reads it
    UI.refreshBadges();
    UI.setUrl('messages.html?with=' + encodeURIComponent(other(c)));
    renderList();
    renderThread(!!typingTimers[id]);
    applyView();
    $('draft').focus({ preventScroll: true });
  }
  function applyView() { $('messages').classList.toggle('is-thread', showThread); }

  // ---------- composer
  function updateSend() { $('send').disabled = $('draft').disabled || !$('draft').value.trim(); }
  function autosize() { var d = $('draft'); d.style.height = 'auto'; d.style.height = Math.min(d.scrollHeight, 140) + 'px'; }
  $('draft').addEventListener('input', function () { updateSend(); autosize(); });
  $('draft').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!$('send').disabled) $('composer').requestSubmit(); }
  });

  $('composer').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = $('draft').value;
    if (!text.trim()) return;                                // whitespace-only can never be sent
    var convId = activeId;
    var r = Store.sendMessage(convId, me, text);
    if (!r.ok) { UI.toast(r.error); return; }
    $('draft').value = '';
    autosize();
    renderList();
    renderThread(true);                                      // appends the message and the typing indicator
    var partner = other(convById(convId));
    if (!Store.getUser(partner)) { renderThread(false); return; }
    clearTimeout(typingTimers[convId]);
    typingTimers[convId] = setTimeout(function () {
      delete typingTimers[convId];
      var reply = Store.autoReply(convId, partner);
      if (activeId === convId) { if (threadVisible()) { Store.markRead(convId, me); UI.refreshBadges(); } renderThread(false); }
      renderList();
      if (!reply && activeId === convId) renderThread(false);
    }, 1500);
  });

  // a message sent in another tab shows up when this tab regains focus
  window.addEventListener('focus', function () { var c = convById(activeId); if (c) { if (threadVisible()) Store.markRead(activeId, me); renderList(); renderThread(!!typingTimers[activeId]); UI.refreshBadges(); } });

  // ---------- start
  if (threadVisible()) Store.markRead(activeId, me);
  UI.refreshBadges();
  renderList();
  renderThread(false);
  applyView();
  // keep the address bar honest: an unusable ?with= is replaced by the thread that actually opened (or by the plain list on phones)
  if (requested) UI.setUrl(showThread ? 'messages.html?with=' + encodeURIComponent(other(convById(activeId))) : 'messages.html');
})();
