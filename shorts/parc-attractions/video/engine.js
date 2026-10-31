      import * as THREE from "three";
      import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
      const B = window.BEATS, T = B.times;
      const W = 1080, H = 1920;
      const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
      const prog = (t, a, d) => clamp((t - a) / d);
      const eOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
      const eOut = (x) => 1 - Math.pow(1 - x, 3);
      const eInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
      const bounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
      const lerp = (a, b, k) => a + (b - a) * k;
      const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const hex2 = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
      const V = (x, y, z) => new THREE.Vector3(x, y, z);
      const P = { gold: "#ffc93c", red: "#ff5a5f", blue: "#4f8cff", green: "#35d07f", cream: "#f4ecd8", navy: "#1a2160", white: "#ffffff", gray: "#8f95c8", dark: "#0f1546", orange: "#ff9a3c", brown: "#c98a4b", sky: "#9fd0ff" };

      /* ---------- renderer, camera, lights ---------- */
      const glCanvas = document.getElementById("gl");
      const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
      renderer.setPixelRatio(1.5); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const fxgCtx = document.getElementById("fxg").getContext("2d");
      const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0d1440, 70, 190);
      const cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 500);
      const hemi = new THREE.HemisphereLight(0xaec4ff, 0x141a45, 1.0); scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff0d0, 2.2); sun.position.set(-22, 36, 20); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
      Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 140 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3; scene.add(sun); scene.add(sun.target);
      const rim = new THREE.DirectionalLight(0x4f8cff, 0.7); rim.position.set(26, 14, -30); scene.add(rim);

      const matCache = {};
      const M = (hex, o = {}) => { const k = hex + JSON.stringify(o); return (matCache[k] = matCache[k] || new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.85, metalness: 0, flatShading: true }, o))); };
      const geoCache = {};
      function rb(w, h, d, hex, r = 0.05, mat) {
        r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001); const k = [w, h, d, r].join("|");
        if (!geoCache[k]) { const g = new RoundedBoxGeometry(w, h, d, 2, r); g.translate(0, h / 2, 0); geoCache[k] = g; }
        const m = new THREE.Mesh(geoCache[k], mat || M(hex)); m.castShadow = true; m.receiveShadow = true; return m;
      }
      const put = (p, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); p.add(o); return o; };
      const grp = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); (p || scene).add(g); return g; };
      const cyl = (rt, rb_, h, hex, seg = 10, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb_, h, seg), mat || M(hex)); m.castShadow = true; m.receiveShadow = true; return m; };
      const sph = (r, hex, seg = 10, mat) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat || M(hex)); m.castShadow = true; m.receiveShadow = true; return m; };
      const emis = (hex, k = 1.4) => new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: k, roughness: 0.5 });

      const popS = (t, t0, d = 0.5) => eOutBack(prog(t, t0, d));
      function show(o, t, t0, t1 = null, d = 0.5) { const s = popS(t, t0, d) * (t1 == null ? 1 : 1 - eOut(prog(t, t1, 0.3))); o.visible = s > 0.002; o.scale.setScalar(Math.max(s, 0.0001)); return s; }
      function grow(o, t, t0, t1 = null, d = 0.5) { const s = popS(t, t0, d) * (t1 == null ? 1 : 1 - eOut(prog(t, t1, 0.3))); o.visible = s > 0.002; o.scale.set(1, Math.max(s, 0.0001), 1); return s; }
      const U = []; const upd = (f) => U.push(f);
      const ANCH = {};

      /* ---------- DOM overlay engine ---------- */
      const $ = (id) => document.getElementById(id);
      const mkEl = (cls, html, parent) => { const d = document.createElement("div"); d.className = cls; if (html != null) d.innerHTML = html; parent.appendChild(d); return d; };
      const pvw = new THREE.Vector3();
      function toScreen(v) { pvw.copy(v).project(cam); return [(pvw.x * 0.5 + 0.5) * W, (-pvw.y * 0.5 + 0.5) * H, pvw.z]; }
      const anchorXY = (a) => { if (a.startsWith("screen:")) { const [x, y] = a.slice(7).split(",").map(Number); return [x, y, 0, true]; } const o = ANCH[a]; const v = typeof o === "function" ? o() : o; const [x, y, z] = toScreen(v); return [x, y, z, false]; };
      const noteEls = B.notes.map((n) => ({ n, el: mkEl("note " + n.kind, n.text, $("notes")), lead: mkEl("lead " + n.kind, "", $("leads")) }));
      const kwEls = B.kws.map((k) => ({ k, el: mkEl("kw " + k.color, k.text, $("kws")) }));
      const stampEls = B.stamps.map((s) => ({ s, el: mkEl("stamp " + s.kind, s.text, $("stamps")) }));
      const PANELS = {
        p1: `<h4>Répartition des dépenses</h4><div class="stack"><i class="seg gold" data-w="55"><b>BILLET 55 %</b></i><i class="seg blue" data-w="45"><b>LE RESTE 45 %</b></i></div><p class="sub">repas · boissons · souvenirs · photos</p>`,
        p2: `<h4>Un souvenir vendu 100</h4><div class="row"><span class="lab">PRIX DE VENTE</span><i class="bar gold" data-w="100"></i><span class="val">100</span></div><div class="row"><span class="lab">COÛT</span><i class="bar red" data-w="18"></i><span class="val">≈ 18</span></div><p class="sub">forte marge sur chaque article</p>`,
        p3: `<h4>En France <em>(étude citée)</em></h4><div class="row"><span class="lab">BILLET</span><i class="bar gold" data-w="57"></i><span class="val">57 %</span></div><div class="row"><span class="lab">RESTAURATION</span><i class="bar blue" data-w="21"></i><span class="val">21 %</span></div><div class="row"><span class="lab">BOUTIQUES</span><i class="bar green" data-w="9"></i><span class="val">9 %</span></div>`,
        p4: `<h4>La règle 10 / 20 / 60</h4><div class="trio"><div class="orb gold" data-i="0"><b>10 %</b><span>du chiffre d'affaires investi par an</span></div><div class="orb blue" data-i="1"><b>20 %</b><span>de l'offre renouvelée</span></div><div class="orb green" data-i="2"><b>60 %</b><span>de visiteurs qui reviennent</span></div></div>`,
        p5: `<h4>L'année d'un parc</h4><div class="months">${"JFMAMJJASOND".split("").map((m, i) => `<i class="mo ${i >= 5 && i <= 8 ? "hot" : ""}" data-i="${i}"><b>${m}</b></i>`).join("")}</div><div class="big85"><b>85 %</b> de l'activité en <b>3,5 mois</b></div>`,
        p6: `<h4>Dépense par visiteur</h4><div class="duo"><div class="arrow red" data-i="0"><b>↓</b><span>FRÉQUENTATION<br>inégale</span></div><div class="arrow green" data-i="1"><b>↑</b><span>DÉPENSE<br>par visiteur</span></div></div><p class="sub">la dépense peut compenser</p>`,
      };
      const panelEls = B.panels.map((p) => { const el = mkEl("panel", PANELS[p.id], $("panels")); el.style.top = p.y + "px"; return { p, el, items: [...el.querySelectorAll("[data-w],[data-i]")] }; });
      const capEl = $("cap"), progEl = $("prog").firstElementChild, flashEl = $("flash"), brandEl = $("brandend"), rootEl = $("root"), vigEl = $("vig");
      const capGroups = []; { let cur = [], len = 0; const Ws = window.WORDS;
        Ws.forEach((w, i) => { cur.push(w); len += w[0].length + 1; const end = /[.,?!:]$/.test(w[0]); if (cur.length >= 4 || (cur.length >= 3 && len > 22) || (end && cur.length >= 2) || i === Ws.length - 1) { capGroups.push(cur); cur = []; len = 0; } });
        if (cur.length) capGroups.push(cur); }
      let capIdx = -2;
