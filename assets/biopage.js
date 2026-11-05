/* Bio pages (bio.niveshsahayak.in/demo/<id>/): draws the page from window.NSB (sample creator) or from the details a
   visitor types on /try/<id>/ (sent here by postMessage, same origin only). Nothing is stored or sent anywhere.
   NSB = {id, feature, sample, year, ic:{name: svg path}} */
(function () {
  var B = window.NSB, h = document.documentElement, root = document.getElementById('bp'), sample = true;
  var SOCIAL = { instagram: ['Instagram', 'https://instagram.com/'], youtube: ['YouTube', 'https://youtube.com/@'], whatsapp: ['WhatsApp', 'https://wa.me/'],
    x: ['X', 'https://x.com/'], facebook: ['Facebook', 'https://facebook.com/'], linkedin: ['LinkedIn', 'https://linkedin.com/in/'],
    telegram: ['Telegram', 'https://t.me/'], email: ['Email', 'mailto:'] };
  var ICK = { x: 'xlogo', email: 'mail' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) {
    if (n === 'whatsapp') return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="' + B.wa + '"/></svg>';
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + (B.ic[ICK[n] || n] || B.ic.link) + '"/></svg>';
  }
  /* only web, mail and WhatsApp links; handles and numbers become full links */
  function url(u) {
    u = String(u || '').trim();
    if (!u || u === '#') return '#';
    if (/^https?:\/\/[^\s"'<>]+$/i.test(u)) return u;
    if (/^[\w.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(u)) return 'https://' + u;
    return '';
  }
  function socialUrl(k, v) {
    v = String(v || '').trim();
    if (!v || v === '#') return '#';
    if (/^https?:\/\//i.test(v)) return url(v);
    if (k === 'whatsapp') { var d = v.replace(/\D/g, ''); if (d.length === 10) d = '91' + d; return d.length >= 11 ? 'https://wa.me/' + d : ''; }
    if (k === 'email') return /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(v) ? 'mailto:' + v : '';
    v = v.replace(/^@/, '');
    return /^[\w.-]{1,60}$/.test(v) ? SOCIAL[k][1] + v : '';
  }
  function a(href, inner, cls) {
    if (!href) return '';
    var ext = href !== '#' && href.indexOf('mailto:') !== 0;
    return '<a class="' + (cls || '') + '" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener nofollow"' : '') + (href === '#' ? ' data-sample' : '') + '>' + inner + '</a>';
  }
  function initials(n) {
    var w = String(n || '').replace(/^(coach|dr|ca|mr|mrs|ms)\.?\s+/i, '').split(/\s+/).filter(function (x) { return /[A-Za-zऀ-ൿ]/.test(x); });
    if (!w.length) return '?';
    return (w.length > 1 ? w[0].charAt(0) + w[w.length - 1].charAt(0) : w[0].slice(0, 2)).toUpperCase();
  }

  function draw(d) {
    var links = (d.links || []).filter(function (l) { return l && String(l[0] || '').trim(); });
    var soc = Object.keys(SOCIAL).filter(function (k) { return d.social && String(d.social[k] || '').trim(); });
    var av = d.photo && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d.photo)
      ? '<img src="' + d.photo + '" alt="' + esc(d.name) + '">' : '<span>' + esc(initials(d.name)) + '</span>';
    var f = '', ft = d.feature && String(d.feature[0] || '').trim();
    if (B.feature === 'video') f = a(url(d.feature && d.feature[1]) || '#', '<span class="vthumb"><i>' + ic('play') + '</i></span><span class="vt"><small>' + ic('youtube') + 'Newest video</small><b>' + esc(ft || 'Your newest video') + '</b></span>', 'feat fv');
    else if (B.feature === 'release') f = a(url(d.feature && d.feature[1]) || '#', '<span class="cov">' + ic('music') + '</span><span class="vt"><small>Latest release</small><b>' + esc(ft || 'Your latest song') + '</b><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></span>', 'feat fr');
    else if (B.feature === 'tiles') f = '<div class="feat tiles" aria-label="Artwork"><i></i><i></i><i></i><i></i><i></i><i></i><p>' + (sample ? 'Sample artwork' : 'Your work appears here') + '</p></div>';
    else if (B.feature === 'shows' || B.feature === 'products') {
      /* list features: the visitor's own rows if any, otherwise the sample rows (still marked as samples) */
      var rows = (d[B.feature] && d[B.feature].length ? d[B.feature] : B.sample[B.feature]) || [], own = !!(d[B.feature] && d[B.feature].length);
      f = '<div class="feat ' + (B.feature === 'shows' ? 'shows' : 'prods') + '">' + (B.feature === 'shows' ? '<small>' + ic('calendar') + 'Upcoming shows</small>' : '<small>' + ic('tag') + 'Shop</small>') + '<ul>' +
        rows.map(function (r) {
          var href = url(r[2]) || (own ? '' : '#');
          var inner = B.feature === 'shows' ? '<span class="sd">' + esc(r[0]) + '</span><span class="sv">' + esc(r[1]) + '</span>' + ic('right')
            : '<span class="pp">' + ic('cart') + '</span><b>' + esc(r[0]) + '</b><span class="pr">' + esc(r[1]) + '</span>';
          return '<li>' + (href ? a(href, inner, '') : '<span class="nolink">' + inner + '</span>') + '</li>';
        }).join('') + '</ul></div>';
    }
    root.innerHTML =
      '<header class="top"><div class="cover" aria-hidden="true"></div><div class="av">' + av + '</div>' +
      '<div class="who"><h1>' + esc(d.name || 'Your name') + '</h1>' + (d.handle ? '<p class="handle">@' + esc(String(d.handle).replace(/^@/, '')) + '</p>' : '') + '</div></header>' +
      (d.bio ? '<p class="bio">' + esc(d.bio) + '</p>' : '') +
      (soc.length ? '<nav class="soc" aria-label="Social links">' + soc.map(function (k) { return a(socialUrl(k, d.social[k]), ic(k) + '<span class="vh">' + SOCIAL[k][0] + '</span>', 's-' + k); }).join('') + '</nav>' : '') +
      f +
      '<ul class="lnk">' + links.map(function (l, i) { var u = url(l[1]) || (sample ? '#' : ''); return '<li>' + (u ? a(u, '<span>' + esc(l[0]) + '</span>' + ic('right'), i === 0 ? 'first' : '') : '<span class="nolink">' + esc(l[0]) + '</span>') + '</li>'; }).join('') + '</ul>' +
      '<footer class="bf"><p>&copy; ' + B.year + ' ' + esc(d.name || '') + '</p><p><span data-ns-credit="">Designed &amp; Developed by: <a href="https://www.niveshsahayak.in/">Nivesh Sahayak</a></span></p></footer>';
  }
  draw(B.sample);
  h.classList.add('ready');

  var toast = document.querySelector('.toast'), tt;
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-sample]');
    if (!s) return;
    e.preventDefault();
    toast.innerHTML = 'Sample link. On your bio site it opens <b>your</b> page. <a href="/try/' + B.id + '/" target="_top">Try it with your details</a>';
    toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 5000);
  });
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.nsb !== 'set') return;
    if (e.data.mode === 'light' || e.data.mode === 'dark') h.dataset.mode = e.data.mode;
    if (/^[0-2]$/.test(String(e.data.c))) h.dataset.c = String(e.data.c);
    if (e.data.data) { sample = false; draw(e.data.data); }
  });
  if (window.parent !== window) window.parent.postMessage({ nsb: 'ready' }, location.origin);
})();
