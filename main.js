(function () {
  'use strict';
  var WA = '201030605380';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  // WhatsApp links: real anchors with real hrefs
  $$('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  $('#year').textContent = new Date().getFullYear();

  // hero entrance (no blocking intro)
  requestAnimationFrame(function () { document.body.classList.add('loaded'); });

  // mobile menu
  var btn = $('#menuBtn'), nav = $('#nav');
  function closeMenu() { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  $$('.reveal, [data-service]').forEach(function (el) { io.observe(el); });

  // journey progression
  var steps = $$('#steps li'), fill = $('#trackFill');
  var jio = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    jio.disconnect();
    if (reduce) { steps.forEach(function (s) { s.classList.add('on'); }); return; }
    steps.forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, i * 700); });
    fill.style.transform = 'scaleX(1)';
  }, { threshold: 0.4 });
  jio.observe($('#steps'));

  // active nav link
  var links = $$('.nav a');
  var sio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { sio.observe(s); });

  // scroll: header, progress, light parallax (single rAF-throttled listener)
  var header = $('#header'), bar = $('#progressBar'), rotor = $('.rotor'), glowA = $('.glow-a'), giant = $('.giant-bg');
  var ticking = false, isMobile = window.matchMedia('(max-width: 900px)');
  function update() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (!reduce && !isMobile.matches && y < innerHeight * 1.2) {
      rotor.style.transform = 'translate3d(0,' + (y * 0.12) + 'px,0) rotate(' + (y * 0.03) + 'deg)';
      glowA.style.transform = 'translate3d(0,' + (y * -0.08) + 'px,0)';
    }
    if (!reduce && !isMobile.matches && giant) {
      var r = giant.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) giant.style.transform = 'translate(-50%, calc(-50% + ' + (r.top * -0.12) + 'px))';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // missing-part form -> WhatsApp (real delivery path, no fake submit)
  var form = $('#missingForm'), note = $('#formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var car = form.car.value.trim(), part = form.part.value.trim(), ok = true;
    [form.car, form.part].forEach(function (f) { var bad = !f.value.trim(); f.classList.toggle('err', bad); if (bad) ok = false; });
    if (!ok) { note.textContent = 'من فضلك اكتب بيانات العربية واسم القطعة.'; return; }
    var msg = 'أهلاً Ali Auto Parts، مش لاقي قطعة وعايز أعرف إمكانية توفيرها.\nالعربية: ' + car + '\nالقطعة: ' + part;
    var url = waLink(msg);
    note.innerHTML = '';
    var l = document.createElement('a');
    l.href = url; l.target = '_blank'; l.rel = 'noopener noreferrer';
    l.textContent = 'افتح الرسالة في واتساب';
    l.style.cssText = 'font-weight:800;text-decoration:underline';
    note.appendChild(l);
    note.appendChild(document.createTextNode(' ثم ابعتها بنفسك.'));
    try { window.open(url, '_blank', 'noopener'); } catch (err) {}
  });
})();
