/* /try/<id>/: the visitor fills in their own details; the phone preview (iframe of /demo/<id>/) redraws as they type.
   The draft (including a small copy of the photo) stays in this browser only (localStorage nsb-draft).
   "Get this bio site" opens WhatsApp with everything typed in; nothing is sent until the visitor sends it there.
   window.NSBT = {id, style, feature, palettes:[names], wa, price, sample:{...}} */
(function () {
  var T = window.NSBT, f = document.getElementById('bf'), fr = document.querySelector('.tprev iframe'), h = document.documentElement;
  var KEY = 'nsb-draft', SOC = ['instagram', 'youtube', 'whatsapp', 'x', 'facebook', 'linkedin', 'telegram', 'email'], MAXL = 8;
  var st = { c: 0, photo: '' };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function dark() { return h.dataset.theme ? h.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }

  /* link rows */
  var list = $('[data-links]');
  function row(t, u) {
    var li = document.createElement('li');
    li.innerHTML = '<input name="lt" placeholder="Button text, e.g. Watch my latest reel" maxlength="60" aria-label="Button text">' +
      '<input name="lu" type="url" inputmode="url" placeholder="https://…" aria-label="Link">' +
      '<span class="lact"><button type="button" class="ib sm" data-up aria-label="Move up">' + T.ic.up + '</button>' +
      '<button type="button" class="ib sm" data-del aria-label="Remove link">' + T.ic.trash + '</button></span>';
    li.querySelector('[name=lt]').value = t || ''; li.querySelector('[name=lu]').value = u && u !== '#' ? u : '';
    list.appendChild(li);
  }
  function rowsFix() { $('[data-add]').hidden = list.children.length >= MAXL; }
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var li = b.closest('li');
    if (b.hasAttribute('data-del')) li.remove();
    if (b.hasAttribute('data-up') && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
    rowsFix(); changed();
  });
  $('[data-add]').addEventListener('click', function () { row('', ''); rowsFix(); list.lastChild.querySelector('input').focus(); });

  function read() {
    var d = { name: f.pname.value.trim(), handle: f.handle.value.trim().replace(/^@/, ''), bio: f.bio.value.trim(), photo: st.photo,
      links: $$('li', list).map(function (li) { return [li.querySelector('[name=lt]').value.trim(), li.querySelector('[name=lu]').value.trim()]; }).filter(function (l) { return l[0]; }),
      social: {} };
    SOC.forEach(function (k) { var v = f['s_' + k].value.trim(); if (v) d.social[k] = v; });
    if (f.ft) d.feature = [f.ft.value.trim(), f.fu.value.trim()];
    return d;
  }
  function fill(d) {
    f.pname.value = d.name || ''; f.handle.value = d.handle || ''; f.bio.value = d.bio || '';
    SOC.forEach(function (k) { var v = d.social && d.social[k]; f['s_' + k].value = v && v !== '#' ? v : ''; });
    if (f.ft) { f.ft.value = (d.feature && d.feature[0]) || ''; f.fu.value = d.feature && d.feature[1] !== '#' ? d.feature[1] || '' : ''; }
    list.innerHTML = ''; (d.links || []).forEach(function (l) { row(l[0], l[1]); }); rowsFix();
    st.photo = d.photo || ''; photoUi();
    $('[data-count]').textContent = (f.bio.value.length) + ' / 160';
  }
  function send() {
    if (fr.contentWindow) fr.contentWindow.postMessage({ nsb: 'set', data: read(), c: st.c, mode: dark() ? 'dark' : 'light' }, location.origin);
  }
  var saveT;
  function changed() {
    send();
    $('[data-count]').textContent = (f.bio.value.length) + ' / 160';
    clearTimeout(saveT);
    saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify({ d: read(), c: st.c })); } catch (e) {} }, 400);
  }
  f.addEventListener('input', changed);
  window.addEventListener('message', function (e) { if (e.origin === location.origin && e.data && e.data.nsb === 'ready') send(); });

  /* photo: square crop, 320 px JPEG, kept only in this browser */
  var pin = f.photo;
  function photoUi() {
    var p = $('[data-pic]');
    p.innerHTML = st.photo ? '<img src="' + st.photo + '" alt="Your photo">' : T.ic.image;
    $('[data-pic-del]').hidden = !st.photo;
  }
  pin.addEventListener('change', function () {
    var file = pin.files && pin.files[0]; if (!file || !/^image\//.test(file.type)) return;
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var s = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = 320;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 320, 320);
      st.photo = c.toDataURL('image/jpeg', 0.85); URL.revokeObjectURL(url); pin.value = ''; photoUi(); changed();
    };
    img.onerror = function () { URL.revokeObjectURL(url); alert('This picture could not be opened. Please try a JPG or PNG photo.'); };
    img.src = url;
  });
  $('[data-pic-del]').addEventListener('click', function () { st.photo = ''; photoUi(); changed(); });

  /* colours, light/dark, design switch, start again */
  $$('.sw').forEach(function (b) {
    b.addEventListener('click', function () {
      st.c = +b.dataset.c; $$('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); changed();
    });
  });
  var tt = $('[data-theme-toggle]'); if (tt) tt.addEventListener('click', function () { setTimeout(send, 30); });
  $('[data-design]').addEventListener('change', function (e) { changed(); location.href = '/try/' + e.target.value + '/'; });
  $('[data-reset]').addEventListener('click', function () { st.c = 0; fill(T.sample); try { localStorage.removeItem(KEY); } catch (e) {} $$('.sw').forEach(function (x, i) { x.setAttribute('aria-pressed', i ? 'false' : 'true'); }); changed(); });
  $('[data-jump]').addEventListener('click', function () { $('.tprev').scrollIntoView({ behavior: 'smooth' }); });

  /* order on WhatsApp */
  $('[data-wa-order]').addEventListener('click', function () {
    var d = read();
    if (!d.name) { f.pname.focus(); f.pname.setAttribute('aria-invalid', 'true'); return; }
    var L = ['Hello Nivesh Sahayak, I want a bio website.', 'Design: ' + T.style + ' (' + T.palettes[st.c] + ', ' + (dark() ? 'dark' : 'light') + ') ' + location.origin + '/demo/' + T.id + '/',
      'Plan: ' + (f.plan.value === 'full' ? 'Full set-up including domain' : 'Bio website ' + T.price), 'Name: ' + d.name];
    if (d.handle) L.push('Handle: @' + d.handle);
    if (d.bio) L.push('Bio: ' + d.bio);
    if (d.feature && d.feature[0]) L.push('Featured: ' + d.feature[0] + (d.feature[1] ? ' ' + d.feature[1] : ''));
    if (d.links.length) { L.push('Links:'); d.links.forEach(function (l) { L.push('- ' + l[0] + (l[1] ? ': ' + l[1] : '')); }); }
    var s = Object.keys(d.social).map(function (k) { return $('label[for=s_' + k + ']').textContent.trim() + ': ' + d.social[k]; });
    if (s.length) L.push('Social: ' + s.join(', '));
    L.push(st.photo ? 'I will send my photo in this chat.' : 'Photo: I will send it in this chat (or use initials).');
    window.open('https://wa.me/' + T.wa + '?text=' + encodeURIComponent(L.join('\n')), '_blank', 'noopener');
  });

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  fill(saved && saved.d ? saved.d : T.sample);
  if (saved && /^[0-2]$/.test(String(saved.c))) { st.c = +saved.c; $$('.sw').forEach(function (x, i) { x.setAttribute('aria-pressed', i === st.c ? 'true' : 'false'); }); }
  fr.addEventListener('load', send);
})();
