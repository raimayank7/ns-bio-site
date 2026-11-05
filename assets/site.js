/* designs.niveshsahayak.in: theme, menu, business search, order form (opens WhatsApp) and the live-demo viewer.
   window.NSD (written by build.py) = {wa, price, types:{id:name}, designs:{id:{name,type}}} */
(function () {
  var D = window.NSD || { types: {}, designs: {} }, h = document.documentElement;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ready() { h.classList.add('ready'); }
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(ready); else ready();

  function dark() { return h.dataset.theme ? h.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  var tt = $('[data-theme-toggle]');
  if (tt) tt.addEventListener('click', function () {
    var t = dark() ? 'light' : 'dark';
    h.dataset.theme = t;
    try { localStorage.setItem('nsd-theme', t); } catch (e) {}
    syncDemo();
  });

  var nav = $('#nav'), mb = $('.menu-b');
  if (mb) mb.addEventListener('click', function () { mb.setAttribute('aria-expanded', nav.classList.toggle('open') ? 'true' : 'false'); });
  if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });

  /* business search on the home page */
  var q = $('[data-find]'), none = $('[data-findnone]');
  if (q) {
    $('[data-find-form]').addEventListener('submit', function (e) { e.preventDefault(); var f = $('.tcard:not([hidden])'); if (f && f.href) location.href = f.href; });
    q.addEventListener('input', function () {
      var w = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), shown = 0;
      $$('[data-find-list] [data-find]').forEach(function (c) {
        var ok = !w.length || w.some(function (x) { return x.length > 2 && c.dataset.find.indexOf(x.replace(/s$/, '')) > -1; });
        c.hidden = !ok; if (ok) shown++;
      });
      none.hidden = !(w.length && !shown);
      var b = none.querySelector('[data-order]'); if (b) b.dataset.what = q.value.trim();
    });
  }

  /* order form */
  var dlg;
  function opt(v, t, sel) { return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + t + '</option>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'ord';
    dlg.setAttribute('aria-labelledby', 'ord-t');
    dlg.innerHTML = '<form method="dialog" novalidate><div class="ohd"><div><h2 id="ord-t">Get this website</h2><p class="osub" data-o-sub></p></div>' +
      '<button class="ib" type="button" data-o-close aria-label="Close"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="two"><label>Your name<input name="name" autocomplete="name" required></label>' +
      '<label>Business name<input name="biz" autocomplete="organization"></label></div>' +
      '<div class="two"><label>Type of business<select name="type"></select></label>' +
      '<label>City<input name="city" autocomplete="address-level2"></label></div>' +
      '<label data-o-other hidden>What does your business do?<input name="what"></label>' +
      '<fieldset><legend>What do you need?</legend>' +
      '<label class="opt"><input type="radio" name="plan" value="Website design (' + D.price + ')" checked><span>Website design, ' + D.price + '<small>This design made with your business details</small></span></label>' +
      '<label class="opt"><input type="radio" name="plan" value="Full set-up including domain"><span>Full set-up including domain<small>We also connect your domain and put it online. Price on WhatsApp.</small></span></label></fieldset>' +
      '<div class="two"><label>Pages<select name="pages">' + opt('One page', 'One page') + opt('Up to 5 pages', 'Up to 5 pages', 1) + opt('More than 5 pages', 'More than 5') + opt('Not sure', 'Not sure') + '</select></label>' +
      '<label>Language<select name="lang">' + opt('English', 'English') + opt('English and Hindi', 'English + Hindi') + opt('English and Punjabi', 'English + Punjabi') + opt('Other', 'Other') + '</select></label></div>' +
      '<label>Anything else? (optional)<textarea name="msg" rows="2"></textarea></label>' +
      '<button class="btn wa" type="submit"><svg class="ic" viewBox="0 0 24 24"><path fill="currentColor" d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.9C23.94 5.34 18.6 0 12.05 0zm5.42 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35z"/></svg>Send on WhatsApp</button>' +
      '<p class="note">This opens WhatsApp with your answers typed in. Nothing is sent until you press send there. We agree the price before you pay.</p></form>';
    document.body.appendChild(dlg);
    var sel = dlg.querySelector('[name=type]');
    sel.innerHTML = Object.keys(D.types).map(function (k) { return opt(k, esc(D.types[k])); }).join('') + opt('other', 'Something else');
    sel.addEventListener('change', function () { dlg.querySelector('[data-o-other]').hidden = sel.value !== 'other'; });
    dlg.querySelector('[data-o-close]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('form').addEventListener('submit', send);
  }
  function send(e) {
    e.preventDefault();
    var f = e.target, n = f.name.value.trim();
    if (!n) { f.name.focus(); f.name.setAttribute('aria-invalid', 'true'); return; }
    var t = f.type.value, des = dlg.dataset.design, L = ['Hello Nivesh Sahayak, I would like a website.'];
    if (des && D.designs[des]) L.push('Design: ' + D.designs[des].name + ' ' + location.origin + '/view/' + des + '/');
    else L.push('Design: custom design');
    L.push('Plan: ' + f.plan.value);
    L.push('Name: ' + n);
    if (f.biz.value.trim()) L.push('Business: ' + f.biz.value.trim());
    L.push('Type: ' + (t === 'other' ? 'Other' + (f.what.value.trim() ? ' (' + f.what.value.trim() + ')' : '') : D.types[t]));
    if (f.city.value.trim()) L.push('City: ' + f.city.value.trim());
    L.push('Pages: ' + f.pages.value, 'Language: ' + f.lang.value);
    if (dlg.dataset.colour) L.push('Colour I liked: ' + dlg.dataset.colour);
    if (f.msg.value.trim()) L.push('Note: ' + f.msg.value.trim());
    window.open('https://wa.me/' + D.wa + '?text=' + encodeURIComponent(L.join('\n')), '_blank', 'noopener');
    dlg.close();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-order]');
    if (!b) return;
    if (!dlg) build();
    var des = b.dataset.design || '', d = D.designs[des], sel = dlg.querySelector('[name=type]');
    dlg.dataset.design = des;
    dlg.dataset.colour = (des && cur.design === des) ? cur.colour : '';
    sel.value = d ? d.type : (b.dataset.type || (b.dataset.what ? 'other' : sel.value));
    if (b.dataset.what) dlg.querySelector('[name=what]').value = b.dataset.what;
    dlg.querySelector('[data-o-other]').hidden = sel.value !== 'other';
    dlg.querySelector('[data-o-sub]').textContent = d ? 'Design: ' + d.name : 'Custom design: tell us about your business';
    dlg.showModal();
    setTimeout(function () { dlg.querySelector('[name=name]').focus(); }, 50);
  });

  /* live-demo viewer */
  var fr = $('iframe[data-demo]'), stage = $('.vstage'), cur = { c: 0, design: fr ? fr.dataset.demo : '', colour: '' };
  function syncDemo() {
    if (!fr || !fr.contentWindow) return;
    fr.contentWindow.postMessage({ nsd: 'set', mode: dark() ? 'dark' : 'light', c: cur.c }, location.origin);
  }
  if (fr) {
    fr.addEventListener('load', syncDemo);
    $$('[data-dev]').forEach(function (b) {
      if (b.tagName !== 'BUTTON') return;
      b.addEventListener('click', function () {
        stage.dataset.dev = b.dataset.dev;
        $$('button[data-dev]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
    $$('.sw').forEach(function (b) {
      b.addEventListener('click', function () {
        cur.c = +b.dataset.c; cur.colour = b.getAttribute('aria-label').replace('Colour ', '');
        $$('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        syncDemo();
      });
    });
    var vm = $('[data-vmode]');
    if (vm) vm.addEventListener('click', function () { tt.click(); });
    window.addEventListener('message', function (e) {
      if (e.origin === location.origin && e.data && e.data.nsd === 'mode' && (dark() ? 'dark' : 'light') !== e.data.mode) tt.click();
    });
    if (innerWidth < 760) $('button[data-dev="desk"]').setAttribute('aria-pressed', 'true');
  }

  /* one sponsor card on showroom pages ([data-sponsor]), from Share's master list; never our own, family or website-builder offers */
  var sp = $('[data-sponsor]');
  if (sp && window.fetch) {
    var RIVAL = /website\s?builder|wix|wordpress|squarespace|shopify|hostinger|godaddy|dukaan|webflow|weebly|linktree|beacons/i;
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
    var india = /Calcutta|Kolkata/.test((Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '');
    fetch('https://share.groupchaton.com/promos.json', { mode: 'cors' }).then(function (r) { return r.json(); }).then(function (j) {
      var list = (j.promos || []).filter(function (p) {
        return p && /^https:\/\//.test(p.href || '') && !p.own && !p.family && (!p.india || india) && !RIVAL.test([p.title, p.line, p.href].join(' '));
      });
      if (!list.length) return;
      var p = list[Math.floor(Math.random() * list.length)];
      var img = p.imgs && p.imgs.length ? p.imgs[Math.floor(Math.random() * p.imgs.length)] : '';
      sp.innerHTML = '<a class="sponsor" href="' + esc(p.href) + '" target="_blank" rel="sponsored noopener">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" width="72" height="72">' : '') +
        '<span><small>Sponsored</small><b>' + esc(p.title) + '</b>' + (p.line ? '<span>' + esc(p.line) + '</span>' : '') +
        (p.cta ? '<em>' + esc(p.cta) + ' →</em>' : '') + '</span></a>' +
        '<p class="sp-own">Want your business on this card? <a href="https://promo.niveshsahayak.in/">Promote it here</a></p>';
      sp.hidden = false;
    }).catch(function () {});
  }
})();
