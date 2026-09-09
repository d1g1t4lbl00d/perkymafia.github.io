/* ==========================================================
   PERKY MAFIA — hero 3D
   Nube de pastillas en gravedad cero. El puntero las empuja,
   el click las revienta. three.js r128, sin dependencias extra.
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

  var scene = new TH.Scene();
  scene.fog = new TH.Fog(COL.ink, 16, 34);

  var camera = new TH.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  scene.add(new TH.HemisphereLight(0xffffff, 0x101010, 0.55));

  var keyLight = new TH.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(4, 7, 9);
  scene.add(keyLight);

  var pinkLight = new TH.PointLight(COL.pink, 1.5, 44);
  pinkLight.position.set(-9, 4, 7);
  scene.add(pinkLight);

  var acidLight = new TH.PointLight(COL.acid, 1.1, 44);
  acidLight.position.set(10, -5, 6);
  scene.add(acidLight);

  /* ---------- geometría de la pastilla ---------- */
  // Perfil de media cápsula: lado recto + casquete. Se tornea (lathe) sobre Y.
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
  var axis = new TH.Vector3();
  var pills = [];

  var bounds = { x: 9, y: 5, z: 3.4 };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  for (var i = 0; i < COUNT; i++) {
    // cada pastilla tiene su sitio en la nube, en fracción de pantalla,
    // así vuelve a repartirse sola después de un empujón o un cambio de tamaño
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

  /* ---------- puntero ---------- */
  var pointer = new TH.Vector3(0, 0, 0);
  var pointerPrev = new TH.Vector3(0, 0, 0);
  var pointerVel = new TH.Vector3(0, 0, 0);
  var pointerIn = false, dragging = false;

  function toWorld(clientX, clientY, out) {
    var r = canvas.getBoundingClientRect();
    var nx = ((clientX - r.left) / r.width) * 2 - 1;
    var ny = -((clientY - r.top) / r.height) * 2 + 1;
    var h = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    out.set(nx * (h * camera.aspect) / 2, ny * h / 2, 0);
  }


  hero.addEventListener('pointermove', function (e) {
    pointerPrev.copy(pointer);
    toWorld(e.clientX, e.clientY, pointer);
    pointerVel.subVectors(pointer, pointerPrev);
    pointerIn = true;
  });

  hero.addEventListener('pointerleave', function () { pointerIn = false; dragging = false; hero.classList.remove('is-dragging'); });

  hero.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a,button')) return;
    dragging = true;
    hero.classList.add('is-dragging');
    toWorld(e.clientX, e.clientY, pointer);
    pointerPrev.copy(pointer);
    pointerIn = true;
    burst(pointer);
  });

  window.addEventListener('pointerup', function () { dragging = false; hero.classList.remove('is-dragging'); });

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
  var running = true, visible = true, raf = 0;

  function resize() {
    var w = hero.clientWidth || window.innerWidth;
    var h = hero.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    var vh = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    bounds.x = Math.max(4.5, (vh * camera.aspect) / 2 - R);
    bounds.y = Math.max(3.2, vh / 2 - R);
  }

  function step() {
    var dt = Math.min(clock.getDelta(), 0.05);

    for (var i = 0; i < pills.length; i++) {
      var p = pills[i];

      // el puntero empuja y arrastra
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

      // muelle flojo hacia su sitio: la nube se recompone sola
      p.vel.x += (p.home.x * bounds.x - p.pos.x) * 0.5 * dt;
      p.vel.y += (p.home.y * bounds.y - p.pos.y) * 0.5 * dt;
      p.vel.z += (p.home.z * bounds.z - p.pos.z) * 0.7 * dt;

      p.vel.multiplyScalar(1 - 0.75 * dt);
      p.spin += (0.5 - p.spin) * 0.5 * dt;

      p.pos.addScaledVector(p.vel, dt);

      // rebote contra los bordes de la pantalla
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
