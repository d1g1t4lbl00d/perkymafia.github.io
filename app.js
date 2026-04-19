/* ============================================================
   PERKY MAFIA — app.js
   Handles: tweaks, cursor (crosshair + pill trail), ticker, easter eggs, audio
   ============================================================ */

(() => {
  const T = window.__TWEAKS;

  // ----------------- apply tweaks -----------------
  function applyTweaks() {
    const html = document.documentElement;
    html.dataset.palette = T.palette;
    html.dataset.fontdisplay = T.fontDisplay;
    html.dataset.mode = T.mode;
    html.dataset.chaos = T.chaos >= 60 ? "high" : (T.chaos >= 30 ? "mid" : "low");
    html.dataset.grain = T.effects.grain ? "on" : "off";
    html.dataset.scan  = T.effects.scanlines ? "on" : "off";
    html.dataset.blur  = T.effects.blur ? "on" : "off";
    html.dataset.glitch = T.effects.glitch ? "on" : "off";
    document.body.classList.toggle("no-custom-cursor", !T.effects.cursor);

    // hero layout
    document.querySelectorAll(".hero .sticker").forEach(el => {
      el.style.display = (T.heroLayout === "clean") ? "none" : "";
    });
    document.querySelectorAll(".hero .tape").forEach(el => {
      el.style.display = (T.heroLayout === "clean") ? "none" : "";
    });
    if (T.heroLayout === "tabloid") {
      document.querySelector(".hero").style.background =
        "repeating-linear-gradient(90deg, var(--paper) 0 20px, color-mix(in oklab, var(--paper) 90%, #000) 20px 21px), var(--bg)";
      document.querySelector(".hero").style.color = "var(--ink)";
      document.querySelector(".hero .mega").style.color = "var(--ink)";
      document.querySelector(".hero .mega").style.textShadow = "4px 4px 0 var(--accent)";
    } else {
      document.querySelector(".hero").style.background = "";
      document.querySelector(".hero").style.color = "";
      document.querySelector(".hero .mega").style.color = "";
      document.querySelector(".hero .mega").style.textShadow = "";
    }

    // ambient audio
    if (T.effects.audio) { try { ensureAmbient(); } catch(e){} }
    else { try { stopAmbient(); } catch(e){} }

    renderTicker();
    syncTweaksUI();
  }
  window.__applyTweaks = applyTweaks;

  function postEdits(edits) {
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*"); } catch(e){}
  }

  // ----------------- ticker -----------------
  function renderTicker() {
    const track = document.getElementById("ticker-track");
    if (!track) return;
    const content = T.marqueeText;
    const seg = `<span>${escapeHtml(content)}</span><span class="sep"></span>`;
    track.innerHTML = seg.repeat(8);
  }
  function escapeHtml(s){ return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  // ----------------- cursor: crosshair (precise) + pill tail (lagging) -----------------
  const cursor = document.getElementById("cursor");
  const tail   = document.getElementById("cursorTail");
  let tx = window.innerWidth/2, ty = window.innerHeight/2;   // target = real mouse
  let px = tx, py = ty;                                      // pill lag
  document.addEventListener("mousemove", e => {
    tx = e.clientX; ty = e.clientY;
    // Crosshair tracks 1:1 for precision
    cursor.style.transform = `translate(${tx - 12}px, ${ty - 12}px)`;
  });
  function tickTail(){
    // pill follows with easing
    px += (tx - px) * 0.14;
    py += (ty - py) * 0.14;
    const dx = tx - px, dy = ty - py;
    const rot = Math.atan2(dy, dx) * 180 / Math.PI;
    tail.style.transform = `translate(${px}px, ${py}px) rotate(${rot}deg)`;
    requestAnimationFrame(tickTail);
  }
  requestAnimationFrame(tickTail);
  // Initial positions
  cursor.style.transform = `translate(${tx - 12}px, ${ty - 12}px)`;

  // cursor hide when leaving window
  document.addEventListener("mouseleave", () => { cursor.style.opacity = 0; tail.style.opacity = 0; });
  document.addEventListener("mouseenter", () => { cursor.style.opacity = 1; tail.style.opacity = 1; });

  // logo click easter egg
  const logo = document.getElementById("logoHero");
  let logoClicks = 0, logoClickT = 0;
  logo && logo.addEventListener("click", () => {
    const now = Date.now();
    if (now - logoClickT > 1500) logoClicks = 0;
    logoClickT = now; logoClicks++;
    if (logoClicks >= 5) { openEegg("★ LOGO RITUAL ★", "El logo no está contento. Ni triste. Está perky."); logoClicks=0; }
  });
  const pill = document.getElementById("pillHero");
  pill && pill.addEventListener("mouseenter", () => pill.classList.add("wobble"));
  pill && pill.addEventListener("mouseleave", () => pill.classList.remove("wobble"));

  // ----------------- tweaks panel -----------------
  const panel = document.getElementById("tweaksPanel");
  document.getElementById("openTweaksBtn").addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("closeTweaks").addEventListener("click", () => panel.classList.remove("open"));

  function syncTweaksUI() {
    panel.querySelectorAll("[data-chip-group]").forEach(grp => {
      const key = grp.dataset.chipGroup;
      grp.querySelectorAll(".chip-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.v === T[key]);
      });
    });
    const chaos = document.getElementById("chaosRange"); if (chaos) { chaos.value = T.chaos; document.getElementById("chaosLbl").textContent = T.chaos; }
    const mq = document.getElementById("marqueeInput"); if (mq) mq.value = T.marqueeText;
    panel.querySelectorAll("input[type=checkbox][data-fx]").forEach(c => {
      c.checked = !!T.effects[c.dataset.fx];
    });
  }
  panel.querySelectorAll("[data-chip-group]").forEach(grp => {
    grp.addEventListener("click", e => {
      const btn = e.target.closest(".chip-btn"); if (!btn) return;
      const key = grp.dataset.chipGroup; T[key] = btn.dataset.v;
      applyTweaks(); postEdits({[key]: T[key]});
    });
  });
  document.getElementById("chaosRange").addEventListener("input", e => {
    T.chaos = parseInt(e.target.value,10); applyTweaks(); postEdits({chaos:T.chaos});
  });
  document.getElementById("marqueeInput").addEventListener("input", e => {
    T.marqueeText = e.target.value; renderTicker(); postEdits({marqueeText:T.marqueeText});
  });
  panel.querySelectorAll("input[type=checkbox][data-fx]").forEach(c => {
    c.addEventListener("change", () => {
      T.effects[c.dataset.fx] = c.checked; applyTweaks();
      postEdits({ effects: T.effects });
    });
  });

  // ----------------- edit mode protocol -----------------
  window.addEventListener("message", (ev) => {
    const d = ev.data || {};
    if (d.type === "__activate_edit_mode") panel.classList.add("open");
    if (d.type === "__deactivate_edit_mode") panel.classList.remove("open");
  });
  try { window.parent.postMessage({type:"__edit_mode_available"}, "*"); } catch(e){}

  // ----------------- easter eggs -----------------
  const eegg = document.getElementById("eegg");
  function openEegg(title, text) {
    document.getElementById("eeggTitle").textContent = title;
    document.getElementById("eeggText").textContent = text;
    eegg.classList.add("open");
  }
  document.getElementById("eeggClose").addEventListener("click", () => eegg.classList.remove("open"));
  eegg.addEventListener("click", e => { if (e.target === eegg) eegg.classList.remove("open"); });

  const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let kIdx = 0;
  const perky = ["p","e","r","k","y"];
  let pIdx = 0;
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === konami[kIdx]) { kIdx++; if (kIdx === konami.length) { openEegg("☠ KONAMI UNLOCKED ☠", "+30 vidas. VIP en la próxima."); kIdx=0; } }
    else kIdx = (k === konami[0]) ? 1 : 0;

    const kl = k.toLowerCase();
    if (kl === perky[pIdx]) { pIdx++; if (pIdx === perky.length) { openEegg("🩹 P.E.R.K.Y. 🩹", "Una mafia no se elige, te elige a ti. welcome home."); pIdx=0; } }
    else pIdx = (kl === perky[0]) ? 1 : 0;
  });

  // ----------------- ambient audio (webaudio drone) -----------------
  let actx, gain, oscA, oscB, lfo, started = false;
  function ensureAmbient(){
    if (started) { gain.gain.linearRampToValueAtTime(0.05, actx.currentTime+0.5); return; }
    actx = new (window.AudioContext||window.webkitAudioContext)();
    oscA = actx.createOscillator(); oscB = actx.createOscillator();
    oscA.type="sine"; oscA.frequency.value=55;
    oscB.type="sawtooth"; oscB.frequency.value=82;
    lfo = actx.createOscillator(); lfo.frequency.value=0.12;
    const lfog = actx.createGain(); lfog.gain.value=8;
    lfo.connect(lfog); lfog.connect(oscB.frequency);
    gain = actx.createGain(); gain.gain.value=0;
    oscA.connect(gain); oscB.connect(gain); gain.connect(actx.destination);
    oscA.start(); oscB.start(); lfo.start();
    started = true;
    gain.gain.linearRampToValueAtTime(0.05, actx.currentTime+1.5);
    document.getElementById("audioIcon").textContent = "🔊";
  }
  function stopAmbient(){
    if (!started) return;
    try { gain.gain.linearRampToValueAtTime(0, actx.currentTime+0.4); } catch(e){}
    document.getElementById("audioIcon").textContent = "🔈";
  }
  document.getElementById("audioBtn").addEventListener("click", () => {
    T.effects.audio = !T.effects.audio;
    if (T.effects.audio) ensureAmbient(); else stopAmbient();
    postEdits({effects: T.effects});
    syncTweaksUI();
  });

  // force-play hero creature video (some browsers block autoplay until .play() called)
  const heroVid = document.getElementById("pillHero");
  if (heroVid && heroVid.tagName === "VIDEO") {
    const tryPlay = () => heroVid.play().catch(()=>{});
    tryPlay();
    document.addEventListener("click", tryPlay, { once: true });
    document.addEventListener("touchstart", tryPlay, { once: true });
  }
  // also play any bg <video> elements
  document.querySelectorAll("video").forEach(v => { try { v.play().catch(()=>{}); } catch(e){} });

  // ----------------- init -----------------
  applyTweaks();
})();
