/* ==========================================================
   PERKY MAFIA — portada 3D
   Logotipo cromado que refleja lo que tiene alrededor, con la
   nube de pastillas volando delante. three.js r128, sin extras.
   ========================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('pills');
  var hero = document.querySelector('.hero');
  var fallback = document.querySelector('.hero-fallback');
  if (!canvas || !hero) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function giveUp() {
    canvas.style.display = 'none';
    if (fallback) fallback.hidden = false;
    hero.style.cursor = 'default';
  }

  if (typeof window.THREE === 'undefined') { giveUp(); return; }
  var TH = window.THREE;

  var COL = { ink: 0x080808, pink: 0xff2a6d, bone: 0xf3efe6, acid: 0xd7ff2e };

  /* ---------- escena ---------- */
  var renderer;
  try {
    renderer = new TH.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (e) { giveUp(); return; }

  renderer.setClearColor(COL.ink, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = TH.sRGBEncoding;
  renderer.toneMapping = TH.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  var scene = new TH.Scene();
  scene.fog = new TH.Fog(COL.ink, 16, 34);

  var camera = new TH.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  scene.add(new TH.HemisphereLight(0xffffff, 0x101010, 0.55));

  var keyLight = new TH.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 7, 9);
  scene.add(keyLight);

  var pinkLight = new TH.PointLight(COL.pink, 1.5, 44);
  pinkLight.position.set(-9, 4, 7);
  scene.add(pinkLight);

  var acidLight = new TH.PointLight(COL.acid, 1.1, 44);
  acidLight.position.set(10, -5, 6);
  scene.add(acidLight);

  /* ---------- el estudio que refleja el cromo ----------
     Una esfera con un degradado, puesta en la capa 1: la camara
     normal no la ve, pero la que graba los reflejos si. Sin ella
     el cromo seria un espejo de la nada, o sea negro. */
  var ENV_LAYER = 1;

  function studioTexture() {
    var c = document.createElement('canvas');
    c.width = 16; c.height = 256;
    var g = c.getContext('2d').createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#ffffff');   // cenit
    g.addColorStop(0.30, '#c8c4bd');
    g.addColorStop(0.49, '#6e6a66');
    g.addColorStop(0.51, '#ff2a6d');   // la linea del horizonte, en rosa
    g.addColorStop(0.62, '#3a1020');
    g.addColorStop(1.00, '#050505');   // suelo
    var ctx = c.getContext('2d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 256);
    var t = new TH.CanvasTexture(c);
    t.encoding = TH.sRGBEncoding;
    return t;
  }

  var studio = new TH.Mesh(
    new TH.SphereGeometry(40, 16, 24),
    new TH.MeshBasicMaterial({ map: studioTexture(), side: TH.BackSide, fog: false })
  );
  studio.layers.set(ENV_LAYER);
  scene.add(studio);

  var cubeRT = new TH.WebGLCubeRenderTarget(128, {
    format: TH.RGBFormat,
    generateMipmaps: true,
    minFilter: TH.LinearMipmapLinearFilter,
    encoding: TH.sRGBEncoding
  });
  var cubeCam = new TH.CubeCamera(0.5, 60, cubeRT);
  cubeCam.children.forEach(function (cam) { cam.layers.enable(ENV_LAYER); });
  scene.add(cubeCam);

  /* ---------- geometría de la pastilla ---------- */
  var R = 0.5, L = 0.62, SEG = 10;

  function halfProfile(up) {
    var pts = [new TH.Vector2(0.0001, 0)];
    pts.push(new TH.Vector2(R, 0));
    pts.push(new TH.Vector2(R, L));
    for (var i = 1; i <= SEG; i++) {
      var t = (i / SEG) * Math.PI / 2;
      pts.push(new TH.Vector2(R * Math.cos(t), L + R * Math.sin(t)));
    }
    if (!up) { for (var j = 0; j < pts.length; j++) pts[j].y *= -1; pts.reverse(); }
    return pts;
  }

  var geoTop = new TH.LatheGeometry(halfProfile(true), 26);
  var geoBot = new TH.LatheGeometry(halfProfile(false), 26);

  var matTop = new TH.MeshStandardMaterial({ color: COL.pink, roughness: 0.34, metalness: 0.06 });
  var matBot = new TH.MeshStandardMaterial({ color: COL.bone, roughness: 0.52, metalness: 0.02 });

  var isSmall = window.innerWidth < 760;
  var COUNT = reduced ? 10 : (isSmall ? 16 : 30);

  var meshTop = new TH.InstancedMesh(geoTop, matTop, COUNT);
  var meshBot = new TH.InstancedMesh(geoBot, matBot, COUNT);
  meshTop.frustumCulled = false;
  meshBot.frustumCulled = false;
  scene.add(meshTop, meshBot);

  /* ---------- estado de cada pastilla ---------- */
  var dummy = new TH.Object3D();
  var spin = new TH.Quaternion();
  var pills = [];
  var bounds = { x: 9, y: 5, z: 3.4 };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  for (var i = 0; i < COUNT; i++) {
    var fx = rnd(-0.94, 0.94), fy = rnd(-0.9, 0.9), fz = rnd(-0.9, 0.9);
    pills.push({
      home: new TH.Vector3(fx, fy, fz),
      pos: new TH.Vector3(fx * bounds.x, fy * bounds.y, fz * bounds.z),
      vel: new TH.Vector3(rnd(-0.5, 0.5), rnd(-0.4, 0.4), rnd(-0.2, 0.2)),
      quat: new TH.Quaternion().setFromEuler(new TH.Euler(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28))),
      axis: new TH.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(),
      spin: rnd(0.25, 1.1),
      scale: rnd(0.72, 1.25)
    });
  }

  /* ---------- el logotipo cromado ---------- */
  var LOGO_Z = -2.2;
  var logo = new TH.Group();
  logo.position.z = LOGO_Z;
  logo.visible = false;
  scene.add(logo);

  var logoBox = { x: 0, y: 0, z: 0.9 };   // media caja, para apartar las pastillas
  var logoTilt = { x: 0, y: 0 };

  var chrome = new TH.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.07,
    envMap: cubeRT.texture,
    envMapIntensity: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.05
  });

  fetch('assets/fonts/anton-3d.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var font = new TH.FontLoader().parse(data);
      var opts = {
        font: font, size: 1, height: 0.26, curveSegments: 6,
        bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.028, bevelOffset: 0, bevelSegments: 3
      };

      var caps = 0;
      ['PERKY', 'MAFIA'].forEach(function (word, row) {
        var g = new TH.TextGeometry(word, opts);
        g.computeBoundingBox();
        caps = Math.max(caps, g.boundingBox.max.y - g.boundingBox.min.y);
        g.center();
        var m = new TH.Mesh(g, chrome);
        m.userData.row = row;
        logo.add(m);
      });

      // las dos lineas, apretadas como en un cartel
      var lh = caps * 1.03;
      logo.children.forEach(function (m) {
        m.position.y = m.userData.row === 0 ? lh / 2 : -lh / 2;
        m.position.x = m.userData.row === 0 ? 0 : caps * 0.06;
      });

      logo.visible = true;
      hero.classList.add('has-3d-logo');
      fitLogo();
    })
    .catch(function () { /* sin logotipo 3D se queda el titulo de siempre */ });

  var logoSize = new TH.Vector3();

  function fitLogo() {
    if (!logo.children.length) return;

    if (logoSize.lengthSq() === 0) {
      var rot = logo.rotation.clone();
      var sc = logo.scale.clone();
      logo.rotation.set(0, 0, 0);
      logo.scale.setScalar(1);
      logo.updateMatrixWorld(true);
      new TH.Box3().setFromObject(logo).getSize(logoSize);
      logo.rotation.copy(rot);
      logo.scale.copy(sc);
    }

    var vh = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * (camera.position.z - LOGO_Z);
    var vw = vh * camera.aspect;
    var narrow = camera.aspect < 1;
    var s = Math.min(
      (vw * (narrow ? 0.88 : 0.70)) / logoSize.x,
      (vh * (narrow ? 0.42 : 0.56)) / logoSize.y
    );
    logo.scale.setScalar(s);

    logoBox.x = (logoSize.x * s) / 2 + 0.3;
    logoBox.y = (logoSize.y * s) / 2 + 0.3;
    logoBox.z = (logoSize.z * s) / 2 + 0.5;

    clearTheLogo();
  }

  /* Las pastillas viven alrededor del logotipo, no encima: al que le toque un
     sitio dentro de las letras se le manda al borde. Si las lanzas siguen
     cruzando por delante, que es la gracia. */
  function clearTheLogo() {
    var rx = logoBox.x * 1.05, ry = logoBox.y * 1.25;
    for (var i = 0; i < pills.length; i++) {
      var p = pills[i];
      var hx = p.home.x * bounds.x, hy = p.home.y * bounds.y;
      var q = (hx * hx) / (rx * rx) + (hy * hy) / (ry * ry);
      if (q >= 1) continue;
      var a = (q < 0.0001) ? Math.random() * 6.283 : Math.atan2(hy / ry, hx / rx);
      var out = 1 + Math.random() * 0.4;
      p.home.x = Math.max(-0.98, Math.min(0.98, (Math.cos(a) * rx * out) / bounds.x));
      p.home.y = Math.max(-0.98, Math.min(0.98, (Math.sin(a) * ry * out) / bounds.y));
    }
  }

  /* ---------- puntero ---------- */
  var pointer = new TH.Vector3(0, 0, 0);
  var pointerPrev = new TH.Vector3(0, 0, 0);
  var pointerVel = new TH.Vector3(0, 0, 0);
  var pointerNorm = { x: 0, y: 0 };
  var pointerIn = false, dragging = false;

  function toWorld(clientX, clientY, out) {
    var r = canvas.getBoundingClientRect();
    var nx = ((clientX - r.left) / r.width) * 2 - 1;
    var ny = -((clientY - r.top) / r.height) * 2 + 1;
    pointerNorm.x = nx; pointerNorm.y = ny;
    var h = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    out.set(nx * (h * camera.aspect) / 2, ny * h / 2, 0);
  }

  hero.addEventListener('pointermove', function (e) {
    pointerPrev.copy(pointer);
    toWorld(e.clientX, e.clientY, pointer);
    pointerVel.subVectors(pointer, pointerPrev);
    pointerIn = true;
  });

  hero.addEventListener('pointerleave', function () {
    pointerIn = false; dragging = false;
    pointerNorm.x = 0; pointerNorm.y = 0;
    hero.classList.remove('is-dragging');
  });

  hero.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a,button')) return;
    dragging = true;
    hero.classList.add('is-dragging');
    toWorld(e.clientX, e.clientY, pointer);
    pointerPrev.copy(pointer);
    pointerIn = true;
    burst(pointer);
  });

  window.addEventListener('pointerup', function () {
    dragging = false;
    hero.classList.remove('is-dragging');
  });

  var flash = 0;
  function burst(at) {
    flash = 1;
    for (var i = 0; i < pills.length; i++) {
      var p = pills[i];
      var dx = p.pos.x - at.x, dy = p.pos.y - at.y, dz = p.pos.z - at.z;
      var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      if (d > 8) continue;
      var f = (1 - d / 8) * 9;
      p.vel.x += (dx / d) * f;
      p.vel.y += (dy / d) * f;
      p.vel.z += (dz / d) * f * 0.4;
      p.spin += 1.6;
    }
  }

  /* ---------- bucle ---------- */
  var clock = new TH.Clock();
  var running = true, visible = true, raf = 0, frame = 0;
  var envEvery = isSmall ? 0 : 4, envDone = false;

  function resize() {
    var w = hero.clientWidth || window.innerWidth;
    var h = hero.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    var vh = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    bounds.x = Math.max(4.5, (vh * camera.aspect) / 2 - R);
    bounds.y = Math.max(3.2, vh / 2 - R);
    fitLogo();
  }

  function step() {
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    for (var i = 0; i < pills.length; i++) {
      var p = pills[i];

      if (pointerIn) {
        var dx = p.pos.x - pointer.x, dy = p.pos.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 16) {
          var d = Math.sqrt(d2) || 0.001;
          var f = (1 - d / 4) * (dragging ? 26 : 11) * dt;
          p.vel.x += (dx / d) * f;
          p.vel.y += (dy / d) * f;
          if (dragging) {
            p.vel.x += pointerVel.x * 2.2;
            p.vel.y += pointerVel.y * 2.2;
          }
          p.spin += f * 0.5;
        }
      }

      p.vel.x += (p.home.x * bounds.x - p.pos.x) * 0.5 * dt;
      p.vel.y += (p.home.y * bounds.y - p.pos.y) * 0.5 * dt;
      p.vel.z += (p.home.z * bounds.z - p.pos.z) * 0.7 * dt;

      p.vel.multiplyScalar(1 - 0.75 * dt);
      p.spin += (0.5 - p.spin) * 0.5 * dt;

      p.pos.addScaledVector(p.vel, dt);

      // ninguna pastilla se queda clavada dentro de las letras
      if (logo.visible &&
          Math.abs(p.pos.x) < logoBox.x &&
          Math.abs(p.pos.y) < logoBox.y &&
          Math.abs(p.pos.z - LOGO_Z) < logoBox.z) {
        var side = p.pos.z > LOGO_Z ? 1 : -1;
        p.pos.z = LOGO_Z + side * logoBox.z;
        p.vel.z = side * Math.abs(p.vel.z) + side * 0.4;
      }

      if (p.pos.x > bounds.x) { p.pos.x = bounds.x; p.vel.x = -Math.abs(p.vel.x) * 0.7; }
      if (p.pos.x < -bounds.x) { p.pos.x = -bounds.x; p.vel.x = Math.abs(p.vel.x) * 0.7; }
      if (p.pos.y > bounds.y) { p.pos.y = bounds.y; p.vel.y = -Math.abs(p.vel.y) * 0.7; }
      if (p.pos.y < -bounds.y) { p.pos.y = -bounds.y; p.vel.y = Math.abs(p.vel.y) * 0.7; }
      if (p.pos.z > bounds.z) { p.pos.z = bounds.z; p.vel.z = -Math.abs(p.vel.z) * 0.7; }
      if (p.pos.z < -bounds.z) { p.pos.z = -bounds.z; p.vel.z = Math.abs(p.vel.z) * 0.7; }

      spin.setFromAxisAngle(p.axis, p.spin * dt);
      p.quat.multiply(spin);

      dummy.position.copy(p.pos);
      dummy.quaternion.copy(p.quat);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshTop.setMatrixAt(i, dummy.matrix);
      meshBot.setMatrixAt(i, dummy.matrix);
    }

    meshTop.instanceMatrix.needsUpdate = true;
    meshBot.instanceMatrix.needsUpdate = true;

    pointerVel.multiplyScalar(0.82);

    if (flash > 0) {
      flash = Math.max(0, flash - dt * 2.2);
      acidLight.intensity = 1.1 + flash * 5;
      pinkLight.intensity = 1.5 + flash * 3;
    }

    // el logotipo se mece solo y se gira hacia el puntero
    if (logo.visible) {
      var wantY = pointerNorm.x * 0.4 + (reduced ? 0 : Math.sin(t * 0.28) * 0.13);
      var wantX = -pointerNorm.y * 0.22 + (reduced ? 0 : Math.sin(t * 0.21) * 0.05);
      logoTilt.y += (wantY - logoTilt.y) * Math.min(1, dt * 2.4);
      logoTilt.x += (wantX - logoTilt.x) * Math.min(1, dt * 2.4);
      logo.rotation.y = logoTilt.y;
      logo.rotation.x = logoTilt.x;

      // los reflejos: en pantalla grande se refrescan cada cuatro fotogramas,
      // en el movil se calculan una vez y se dejan quietos
      if (envEvery > 0 ? (frame % envEvery === 0) : !envDone) {
        envDone = true;
        logo.visible = false;
        cubeCam.update(renderer, scene);
        logo.visible = true;
      }
    }

    frame++;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(step);
  }

  function play() { if (!raf && running && visible) { clock.getDelta(); raf = requestAnimationFrame(step); } }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  window.addEventListener('resize', function () { resize(); });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    running ? play() : pause();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? play() : pause();
    }, { threshold: 0.02 }).observe(hero);
  }

  resize();
  play();
})();
