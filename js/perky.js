/* ==========================================================
   PERKY MAFIA — interacción de la web
   ========================================================== */
(function () {
  'use strict';

  /* ---------- año ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- la altura real de la barra, para que el hero encaje ---------- */
  var bar = document.querySelector('.bar');
  if (bar) {
    var setBarH = function () {
      document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
    };
    setBarH();
    window.addEventListener('resize', setBarH);
    if ('ResizeObserver' in window) new ResizeObserver(setBarH).observe(bar);
  }

  /* ---------- la barra se esconde al bajar ---------- */
  if (bar) {
    var last = window.pageYOffset, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        bar.classList.toggle('is-hidden', y > last && y > 140);
        last = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- artistas: el reproductor se carga al pedirlo, no antes ---------- */
  var SPOTIFY = 'https://open.spotify.com/embed/artist/';
  var SOUNDCLOUD = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/';
  var SC_OPTS = '&color=%23ff2a6d&auto_play=false&hide_related=true&show_comments=false' +
                '&show_user=true&show_reposts=false&show_teaser=false&visual=false';

  document.querySelectorAll('.artist').forEach(function (item) {
    var btn = item.querySelector('.artist-btn');
    var box = item.querySelector('.artist-embed');
    var play = item.querySelector('.artist-play');
    var label = item.querySelector('.artist-name');
    var name = label ? label.textContent : 'artista';
    var spotify = item.getAttribute('data-spotify');
    var soundcloud = item.getAttribute('data-soundcloud');
    if (!btn || !box || (!spotify && !soundcloud)) return;

    var shut = play ? play.textContent : '';

    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      box.hidden = !open;
      if (play) play.textContent = open ? '■ cerrar' : shut;

      if (open && !box.firstChild) {
        var frame = document.createElement('iframe');
        if (spotify) {
          frame.src = SPOTIFY + spotify + '?utm_source=generator';
          frame.title = 'Spotify de ' + name;
          frame.className = 'embed-spotify';
          frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        } else {
          frame.src = SOUNDCLOUD + encodeURIComponent(soundcloud) + SC_OPTS;
          frame.title = 'SoundCloud de ' + name;
          frame.className = 'embed-soundcloud';
          frame.allow = 'autoplay';
        }
        frame.loading = 'lazy';
        frame.setAttribute('frameborder', '0');
        box.appendChild(frame);
      }
    });
  });

  /* ---------- aparecer al hacer scroll ---------- */
  var targets = document.querySelectorAll('.sect-head, .artist, .player-box, .mafia-card, .mafia-side > *');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      obs.observe(el);
    });
  }

  /* ---------- el secreto ---------- */
  var egg = document.getElementById('egg');
  var eggBtn = document.getElementById('eggBtn');
  var eggClose = document.getElementById('eggClose');

  function openEgg() {
    if (!egg) return;
    egg.hidden = false;
    document.body.style.overflow = 'hidden';
    if (eggClose) eggClose.focus();
  }
  function closeEgg() {
    if (!egg) return;
    egg.hidden = true;
    document.body.style.overflow = '';
    if (eggBtn) eggBtn.focus();
  }

  if (eggBtn) eggBtn.addEventListener('click', openEgg);
  if (eggClose) eggClose.addEventListener('click', closeEgg);
  if (egg) egg.addEventListener('click', function (e) { if (e.target === egg) closeEgg(); });

  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var typed = [];

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && egg && !egg.hidden) { closeEgg(); return; }
    typed.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (typed.length > KONAMI.length) typed.shift();
    if (typed.join(',') === KONAMI.join(',')) { typed = []; openEgg(); }
  });
})();
