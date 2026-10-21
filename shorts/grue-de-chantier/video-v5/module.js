      import * as THREE from "three";
      import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
      const T = window.T;
      const W = 1080, H = 1920;
      const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
      const prog = (t, a, d) => clamp((t - a) / d);
      const eOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
      const eOut = (x) => 1 - Math.pow(1 - x, 3);
      const eInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
      const bounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
      const lerp = (a, b, k) => a + (b - a) * k;
      const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      const hex2 = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

      const glCanvas = document.getElementById("gl");
      const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
      renderer.setPixelRatio(1.5); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const fxbCtx = document.getElementById("fxb").getContext("2d"), fxgCtx = document.getElementById("fxg").getContext("2d");
      const scene = new THREE.Scene();
      const VW = 15, VH = (VW * H) / W;
      const cam = new THREE.OrthographicCamera(-VW / 2, VW / 2, VH / 2, -VH / 2, -200, 300);
      const hemi = new THREE.HemisphereLight(0xffffff, 0xcfc4f5, 1.25); scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff6ee, 2.1);
      sun.position.set(-12, 22, 9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
      Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
      sun.shadow.bias = -0.0006; sun.shadow.radius = 5; sun.shadow.normalBias = 0.02;
      scene.add(sun);

      const matCache = {};
      const M = (hex) => (matCache[hex] = matCache[hex] || new THREE.MeshStandardMaterial({ color: hex, roughness: 0.78, metalness: 0 }));
      const geoCache = {};
      function rbox(w, h, d, hex, r = 0.06, mat) {
        r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
        const k = [w, h, d, r].join("|");
        if (!geoCache[k]) { const g = new RoundedBoxGeometry(w, h, d, 2, r); g.translate(0, h / 2, 0); geoCache[k] = g; }
        const m = new THREE.Mesh(geoCache[k], mat || M(hex)); m.castShadow = true; m.receiveShadow = true; return m;
      }
      const put = (parent, o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); parent.add(o); return o; };
      const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); (parent || scene).add(g); return g; };
      const cyl = (rt, rb, h, hex, seg = 16, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat || M(hex)); m.castShadow = true; m.receiveShadow = true; return m; };
      const P = { lav: "#efeafd", white: "#f6f4ff", mint: "#9fe3c8", peach: "#ffc7b2", sky: "#b7d7ff", lilac: "#c9b8f7", yellow: "#ffd66b", navy: "#2f2e7a", coral: "#ff8a8f", green: "#6fd6a0", gray: "#d3d1e0", gold: "#ffd35c", deep: "#a894ee", asphalt: "#8f88c8", asphalt2: "#9a93d2" };
      const TOP = 0.28;
      const V = (x, y, z) => new THREE.Vector3(x, y, z);

      const popS = (t, t0, d = 0.5) => eOutBack(prog(t, t0, d));
      function appear(o, t, t0, t1, mode = "pop", d = 0.5) {
        const s = popS(t, t0, d) * (1 - eOut(prog(t, t1 ?? 9999, 0.35)));
        o.visible = s > 0.002;
        if (mode === "pop") o.scale.setScalar(Math.max(s, 0.0001)); else o.scale.set(1, Math.max(s, 0.0001), 1);
        return s;
      }

      /* ---------- generic builders (all take a parent so each diorama owns its props) ---------- */
      function mkStage() { const g = grp(scene); g.visible = false; return g; }
      function floor(g, n, size, colorAt, slab = P.lilac, deep = P.deep) {
        const s = size / n; put(g, rbox(size + 0.4, 0.5, size + 0.4, slab, 0.1), 0, -0.5, 0); put(g, rbox(size, 0.7, size, deep, 0.1), 0, -1.2, 0);
        const tiles = [];
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const hex = colorAt(i, j); if (!hex) continue; const x = (i - (n - 1) / 2) * s, z = (j - (n - 1) / 2) * s;
          tiles.push({ o: put(g, rbox(s - 0.04, 0.28, s - 0.04, hex, 0.05), x, 0, z), k: Math.hypot(i - (n - 1) / 2, j - (n - 1) / 2) }); }
        return tiles;
      }
      const tilesIn = (tiles, t, ts) => tiles.forEach(({ o, k }) => { const p = prog(t, ts + k * 0.06, 0.45); o.visible = p > 0; o.position.y = (1 - bounce(p)) * 3; });
      const checker = (a, b) => (i, j) => ((i + j) % 2 ? a : b);
      function tree(p, x, z, sc = 1) {
        const g = grp(p, x, TOP, z); put(g, rbox(0.14, 0.4 * sc, 0.14, "#e0b89a", 0.04));
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.42 * sc, 0.9 * sc, 8), M(P.mint)); c1.position.y = 0.75 * sc; c1.castShadow = true; g.add(c1);
        const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.3 * sc, 0.7 * sc, 8), M("#82d9b6")); c2.position.y = 1.2 * sc; c2.castShadow = true; g.add(c2); return g;
      }
      function house(p, x, z, wall, roofc) {
        const g = grp(p, x, TOP, z); put(g, rbox(0.9, 0.6, 0.8, wall, 0.07));
        const r = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.5, 4), M(roofc)); r.position.y = 0.85; r.rotation.y = Math.PI / 4; r.castShadow = true; g.add(r);
        put(g, rbox(0.2, 0.3, 0.05, "#7fa6ff", 0.02), 0.2, 0.1, 0.41); return g;
      }
      const cone = (p, x, z) => { const g = grp(p, x, TOP, z); const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 10), M(P.peach)); c.position.y = 0.25; c.castShadow = true; g.add(c); put(g, rbox(0.46, 0.06, 0.46, P.white, 0.02)); return g; };
      const lampMats = [];
      function lamp(p, x, z) {
        const g = grp(p, x, TOP, z); put(g, cyl(0.04, 0.05, 1.3, P.gray), 0, 0.65, 0);
        const lm = new THREE.MeshStandardMaterial({ color: "#fff3c9", emissive: "#ffd98a", emissiveIntensity: 0, roughness: 0.5 }); lampMats.push(lm);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), lm); bulb.position.y = 1.4; g.add(bulb); return g;
      }
      function car(p, hex) {
        const g = grp(p, 0, TOP, 0);
        put(g, rbox(0.5, 0.2, 1.0, hex, 0.07), 0, 0.08, 0); put(g, rbox(0.42, 0.2, 0.48, P.white, 0.07), 0, 0.28, -0.06); put(g, rbox(0.34, 0.1, 0.05, "#4b4a9a", 0.02), 0, 0.33, 0.2);
        for (const [x, z] of [[-0.26, -0.3], [0.26, -0.3], [-0.26, 0.3], [0.26, 0.3]]) { const w = cyl(0.1, 0.1, 0.08, P.navy, 12); w.rotation.z = Math.PI / 2; w.position.set(x, 0.1, z); g.add(w); }
        return g;
      }
      function mixer(p) {
        const g = grp(p, 0, TOP, 0);
        put(g, rbox(0.7, 0.18, 1.9, P.gray, 0.05), 0, 0.12, 0); put(g, rbox(0.66, 0.5, 0.55, P.yellow, 0.08), 0, 0.28, 0.65); put(g, rbox(0.5, 0.2, 0.05, "#4b4a9a", 0.02), 0, 0.55, 0.93);
        const drum = grp(g, 0, 0.7, -0.25); drum.rotation.x = -0.25; const body = cyl(0.36, 0.36, 1.1, P.peach, 16); body.rotation.x = Math.PI / 2; drum.add(body);
        const sp = grp(drum, 0, 0, 0); put(sp, rbox(0.1, 0.06, 1.0, "#ffffff", 0.02), 0, 0.34, 0); g.userData.sp = sp;
        for (const z of [-0.65, 0.2, 0.7]) for (const x of [-0.36, 0.36]) { const w = cyl(0.14, 0.14, 0.1, P.navy, 12); w.rotation.z = Math.PI / 2; w.position.set(x, 0.14, z); g.add(w); }
        return g;
      }
      function person(p, hex, hat = true) {
        const g = grp(p, 0, TOP, 0);
        const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 6, 12), M(hex)); b.position.y = 0.72; b.castShadow = true; g.add(b);
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), M("#ffe2cc")); h.position.y = 1.25; h.castShadow = true; g.add(h);
        if (hat) { const ht = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M("#ffd23f")); ht.position.y = 1.29; ht.castShadow = true; g.add(ht); }
        const arm = (sx) => { const q = grp(g, sx * 0.26, 1.0, 0); put(q, rbox(0.09, 0.38, 0.09, hex, 0.03), 0, -0.38, 0); return q; };
        const leg = (sx) => put(g, rbox(0.11, 0.42, 0.11, P.navy, 0.04), sx * 0.1, 0, 0);
        return { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) };
      }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      function coinStack(p, n, x, z) {
        const g = grp(p, x, TOP, z); const arr = [];
        for (let k = 0; k < n; k++) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 28), M(P.gold)); c.castShadow = true; c.receiveShadow = true;
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 8, 28), M("#f2b73a")); rim.rotation.x = Math.PI / 2; rim.position.y = 0.081; c.add(rim);
          c.position.y = 0.08 + k * 0.17; c.rotation.y = k * 0.5; g.add(c); arr.push(c);
        } return { g, arr };
      }
      function updCoins(cs, t, t0, step, t1) {
        cs.arr.forEach((c, k) => {
          const p = prog(t, t0 + k * step, 0.5); const rest = 0.08 + k * 0.17;
          c.visible = p > 0 && !(t1 != null && t > t1 + 0.4); c.position.y = rest + (1 - bounce(p)) * 5.5;
          const out = t1 != null ? eOut(prog(t, t1, 0.35)) : 0; c.scale.setScalar(Math.max(1 - out, 0.001));
        });
      }
      function buildCrane(p, x, z, s, C, y = TOP) {
        const g = grp(p, x, y, z); g.scale.setScalar(s);
        const mats = [];
        const cm = (hex) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75 }); mats.push({ m, base: new THREE.Color(hex) }); return m; };
        const mBody = cm(C.body), mBrace = cm(C.brace), mCab = cm(C.cab), mWeight = cm(C.weight), mBase = cm(P.gray);
        const base = put(g, rbox(1.9, 0.35, 1.9, null, 0.08, mBase));
        const secs = [];
        for (let k = 0; k < 7; k++) {
          const sg = grp(g, 0, 0.35 + k, 0);
          for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(sg, rbox(0.12, 1, 0.12, null, 0.03, mBody), sx * 0.4, 0, sz * 0.4);
          for (const sz of [-1, 1]) put(sg, rbox(0.9, 0.07, 0.07, null, 0.02, mBrace), 0, 0, sz * 0.4);
          for (const sx of [-1, 1]) put(sg, rbox(0.07, 0.07, 0.9, null, 0.02, mBrace), sx * 0.4, 0, 0);
          for (const sz of [-1, 1]) { const d = put(sg, rbox(0.06, 1.2, 0.06, null, 0.02, mBrace), 0, 0, sz * 0.4); d.rotation.z = 0.62 * (sz > 0 ? 1 : -1); }
          secs.push(sg);
        }
        const platform = put(g, rbox(1.1, 0.3, 1.1, null, 0.08, mBody), 0, 7.35, 0);
        const cab = put(g, rbox(0.75, 0.62, 0.62, null, 0.1, mCab), 0.3, 7.65, 0.62);
        put(cab, rbox(0.4, 0.28, 0.05, "#4b4a9a", 0.02), 0.2, 0.2, 0.32);
        const apex = grp(g, 0, 7.65, 0);
        put(apex, rbox(0.3, 1.3, 0.3, null, 0.06, mBody)); put(apex, rbox(0.22, 0.22, 0.22, "#ff8a8f", 0.08), 0, 1.3, 0);
        const jib = grp(g, 0, 7.65, 0); const JL = 7.2;
        for (const sz of [-1, 1]) put(jib, rbox(JL, 0.1, 0.1, null, 0.03, mBody), 0.4 + JL / 2, 0, sz * 0.26);
        put(jib, rbox(JL, 0.1, 0.1, null, 0.03, mBody), 0.4 + JL / 2, 0.9, 0);
        for (let k = 0; k < 14; k++) { const d = put(jib, rbox(0.06, 1.0, 0.06, null, 0.02, mBrace), 0.55 + k * 0.5, 0.0, 0); d.rotation.z = (k % 2 ? 1 : -1) * 0.5; }
        put(jib, rbox(0.14, 1.0, 0.14, null, 0.04, mBody), 0.6 + JL - 0.5, 0, 0);
        const cj = grp(g, 0, 7.65, 0);
        for (const sz of [-1, 1]) put(cj, rbox(2.6, 0.1, 0.1, null, 0.03, mBody), -1.4, 0, sz * 0.26);
        put(cj, rbox(2.6, 0.1, 0.1, null, 0.03, mBody), -1.4, 0.5, 0);
        const weights = [0, 1, 2].map((i) => put(cj, rbox(0.7, 0.55, 0.7, null, 0.07, mWeight), -1.7 - i * 0.7, -0.6, 0));
        const trolley = grp(jib, 3.5, 0, 0);
        put(trolley, rbox(0.5, 0.18, 0.5, null, 0.05, mBody), 0, -0.2, 0);
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), M("#8a88b8")); cable.geometry.translate(0, -0.5, 0); cable.position.set(0, -0.2, 0); trolley.add(cable);
        const hook = grp(trolley, 0, -2, 0); put(hook, rbox(0.3, 0.3, 0.3, "#ff8a8f", 0.08), 0, -0.3, 0);
        const load = put(hook, rbox(1.2, 0.7, 1.2, P.sky, 0.1), 0, -1.05, 0); load.visible = false;
        put(load, rbox(1.25, 0.12, 1.25, P.lilac, 0.04), 0, 0.58, 0);
        return { g, mats, base, secs, platform, cab, apex, jib, cj, weights, trolley, cable, hook, load };
      }
      function updCrane(c, t, t0) {
        appear(c.base, t, t0, null, "pop", 0.4);
        c.secs.forEach((sg, k) => appear(sg, t, t0 + 0.3 + k * 0.14, null, "y", 0.35));
        appear(c.platform, t, t0 + 1.4, null, "pop", 0.35); appear(c.cab, t, t0 + 1.55, null, "pop", 0.35); appear(c.apex, t, t0 + 1.5, null, "y", 0.4);
        const pj = prog(t, t0 + 1.6, 0.7); c.jib.visible = pj > 0; c.jib.scale.set(Math.max(eOut(pj), 0.001), 1, 1); c.cj.visible = pj > 0; c.cj.scale.set(Math.max(eOut(pj), 0.001), 1, 1);
        c.weights.forEach((w, i) => { const p = prog(t, t0 + 2.1 + i * 0.15, 0.4); w.visible = p > 0; w.scale.setScalar(Math.max(eOutBack(p), 0.001)); });
        c.trolley.visible = popS(t, t0 + 2.4, 0.4) > 0.002;
      }
      const hook = (c, x, len, load) => { c.trolley.position.x = x; c.cable.scale.y = len; c.hook.position.y = -0.2 - len; c.load.visible = !!load; };
      const CR = { body: P.yellow, brace: "#fff3c9", cab: P.white, weight: P.gray };
      const CRm = { body: "#4cc490", brace: "#c9f0de", cab: P.peach, weight: P.lilac };
      const winMat = new THREE.MeshStandardMaterial({ color: "#8fb6ff", emissive: "#ffd98a", emissiveIntensity: 0, roughness: 0.4 });
      function building(p, x, z, w, d, h, hex, floorsN, wm = winMat) {
        const g = grp(p, x, TOP, z); put(g, rbox(w, h, d, hex, 0.08));
        const fh = h / floorsN;
        for (let f = 0; f < floorsN; f++) for (let k = 0; k < Math.max(1, Math.round(w / 0.6)); k++) {
          const wx = (k - (Math.max(1, Math.round(w / 0.6)) - 1) / 2) * 0.55; put(g, rbox(0.3, fh * 0.45, 0.05, null, 0.02, wm), wx, f * fh + fh * 0.28, d / 2 + 0.01);
        }
        for (let f = 0; f < floorsN; f++) for (let k = 0; k < Math.max(1, Math.round(d / 0.6)); k++) {
          const wz = (k - (Math.max(1, Math.round(d / 0.6)) - 1) / 2) * 0.55; put(g, rbox(0.05, fh * 0.45, 0.3, null, 0.02, wm), w / 2 + 0.01, f * fh + fh * 0.28, wz);
        }
        put(g, rbox(w + 0.1, 0.1, d + 0.1, P.white, 0.03), 0, h, 0); return g;
      }

      /* ---------- DOM cards ---------- */
      const cardsRoot = document.getElementById("cards");
      const cards = [];
      const card = (html, cls, anchor, t0, t1, count) => { const d = document.createElement("div"); d.className = "card " + cls; d.innerHTML = html; cardsRoot.appendChild(d); cards.push({ d, anchor, t0, t1, count, spans: count ? [d.querySelector(".a"), d.querySelector(".b")] : null }); return d; };
      const zz = ["Z", "Z", "z"].map((c, i) => { const d = document.createElement("div"); d.className = "zz"; d.textContent = c; d.style.fontSize = 64 - i * 14 + "px"; cardsRoot.appendChild(d); return d; });
      const sparks = [0, 1, 2, 3].map(() => { const d = document.createElement("div"); d.className = "zz"; d.textContent = "✦"; d.setAttribute("data-layout-allow-overlap", ""); d.style.color = "#a86a00"; cardsRoot.appendChild(d); return d; });
      const pvw = new THREE.Vector3();
      const toScreen = (v) => { pvw.copy(v).project(cam); return [(pvw.x * 0.5 + 0.5) * W, (-pvw.y * 0.5 + 0.5) * H]; };

      /* =====================================================================
         DIORAMAS  (each idea of the voice-over gets its own little world)
         ===================================================================== */
      const scenes = [];
      const defScene = (t0, t1, g, update) => scenes.push({ t0, t1, g, update });
      const rn = rng(5);

      /* 1 · SHOWROOM (0 – 7.9) : the new crane on a podium, price tag, coins */
      const s1 = mkStage(); const s1t = floor(s1, 9, 9, checker("#f6f4ff", "#ece8fc"));
      const glassM = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.16, roughness: 0.1, depthWrite: false });
      const gw = [put(s1, rbox(9.0, 3.8, 0.1, null, 0.03, glassM), 0, TOP, -4.45), put(s1, rbox(0.1, 3.8, 9.0, null, 0.03, glassM), -4.45, TOP, 0)];
      gw.forEach((g_) => { g_.castShadow = false; });
      const frameM = M(P.lilac);
      [[-4.45, -4.45], [4.45, -4.45], [-4.45, 4.45]].forEach(([x, z]) => put(s1, rbox(0.14, 3.9, 0.14, null, 0.04, frameM), x, TOP, z));
      put(s1, rbox(9.0, 0.14, 0.14, null, 0.04, frameM), 0, TOP + 3.8, -4.45); put(s1, rbox(0.14, 0.14, 9.0, null, 0.04, frameM), -4.45, TOP + 3.8, 0);
      const pod = put(s1, cyl(1.9, 2.0, 0.5, P.white, 40), 0, TOP + 0.25, 0); const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.05, 8, 48), M(P.gold)); ringM.rotation.x = Math.PI / 2; ringM.position.y = TOP + 0.52; s1.add(ringM);
      const cr1 = buildCrane(s1, 0, 0, 0.62, CR, TOP + 0.5);
      const beamM = new THREE.MeshBasicMaterial({ color: "#fff4d6", transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending });
      const beam1 = new THREE.Mesh(new THREE.ConeGeometry(2.1, 7.2, 28, 1, true), beamM); beam1.position.set(0, TOP + 4.1, 0); s1.add(beam1);
      const coins1 = coinStack(s1, T.coins1.n, 2.8, 2.3);
      const s1props = [tree(s1, -3.6, 3.4, 0.8), tree(s1, 3.6, -3.2, 0.8), lamp(s1, 3.4, 3.4), lamp(s1, -3.4, 3.4)];
      const planters = [put(s1, rbox(0.9, 0.5, 0.9, P.peach, 0.1), -3.3, TOP, -3.2), put(s1, rbox(0.9, 0.5, 0.9, P.sky, 0.1), 3.3, TOP, 3.4)];
      const flag1 = grp(s1, 3.3, TOP, -3.3); put(flag1, rbox(0.1, 3.0, 0.1, P.gray, 0.03)); put(flag1, rbox(1.1, 0.7, 0.06, P.coral, 0.03), 0.6, 2.3, 0);
      card('<small>Grue neuve</small><b><span class="a">0</span> – <span class="b">0</span> €+</b>', "gold", { get: () => V(2.8, 3.4, 2.3) }, T.cards[0], T.coins1.out, [[0, 200000], [1, 500000]]);
      defScene(0, 7.9, s1, (t) => {
        tilesIn(s1t, t, 0); updCrane(cr1, t, T.crane1);
        hook(cr1, 3.5 + Math.sin(prog(t, 3.0, 4) * Math.PI * 2) * 0.9, 2.2, 0);
        updCoins(coins1, t, T.coins1.t0, T.coins1.step, T.coins1.out);
        appear(pod, t, 0.2, null, "pop", 0.4); appear(ringM, t, 0.3, null, "pop", 0.4); beamM.opacity = 0.09 * prog(t, 1.5, 1.0);
        [...s1props, ...planters, flag1].forEach((o, i) => appear(o, t, 2.4 + i * 0.15, null, "pop", 0.4));
      });

      /* 2 · STREET (7.9 – 11.4) : the entrepreneur walks away from the crane shop */
      const s2 = mkStage(); const s2t = floor(s2, 9, 9, (i, j) => (i === 4 || j === 4 ? ((i + j) % 2 ? P.asphalt : P.asphalt2) : (i + j) % 2 ? "#d3efe3" : "#c6eadb"));
      const shop = grp(s2, -2.6, TOP, -2.6);
      put(shop, rbox(3.0, 1.7, 2.4, P.white, 0.1)); put(shop, rbox(3.0, 1.3, 2.4, P.peach, 0.1), 0, 1.7, 0); put(shop, rbox(3.2, 0.14, 2.6, P.coral, 0.05), 0, 3.0, 0);
      for (let k = 0; k < 6; k++) put(shop, rbox(0.52, 0.12, 0.8, k % 2 ? P.white : P.coral, 0.04), -1.3 + k * 0.52, 1.35, 1.55);
      put(shop, rbox(0.7, 1.1, 0.08, P.sky, 0.03), 0.9, 0, 1.21); put(shop, rbox(1.2, 0.9, 0.08, "#8fb6ff", 0.03), -0.7, 0.4, 1.21);
      const shopCrane = buildCrane(shop, 0, 0, 0.2, CR, 3.14);
      const s2man = person(s2, P.sky, false); const s2case = put(s2man.g, rbox(0.34, 0.26, 0.1, P.peach, 0.04), 0.34, 0.35, 0);
      const s2car = car(s2, P.coral); const s2car2 = car(s2, P.mint);
      const s2props = [tree(s2, 3.2, -3.2), tree(s2, -3.4, 3.2, 1.1), tree(s2, 3.5, 3.2), lamp(s2, 0.8, -1.2), lamp(s2, -0.8, 1.4), house(s2, 3.2, -1.6, P.sky, P.lilac)];
      card("<b>?</b>", "sm", { get: () => V(s2man.g.position.x, 2.2, s2man.g.position.z) }, T.cards[1], T.man[1]);
      defScene(7.9, 11.4, s2, (t) => {
        tilesIn(s2t, t, 7.9); appear(shop, t, 8.0, null, "pop", 0.5); updCrane(shopCrane, t, -20);
        s2props.forEach((o, i) => appear(o, t, 8.1 + i * 0.08, null, "pop", 0.4));
        const p = prog(t, 8.4, 2.7); const L = [[-1.8, -1.2], [-1.8, 0.0], [0.0, 0.0], [0.0, 4.2]]; const seg = [1.2, 1.8, 4.2]; const tot = 7.2; let d = p * tot, i = 0;
        while (i < 2 && d > seg[i]) { d -= seg[i]; i++; } const a = L[i], b = L[i + 1], f = d / seg[i];
        s2man.g.position.set(lerp(a[0], b[0], f), TOP + Math.abs(Math.sin(t * 9)) * 0.05, lerp(a[1], b[1], f)); s2man.g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); walk(s2man, t, 9);
        s2man.g.scale.setScalar(Math.max(popS(t, 8.3, 0.3) * (1 - eOut(prog(t, 11.0, 0.35))), 0.001));
        s2car.position.set(0.0, TOP, lerp(-4.6, 4.6, ((t - 8.0) * 0.5) % 1)); s2car.rotation.y = 0; s2car2.position.set(lerp(4.6, -4.6, ((t - 8.6) * 0.45) % 1), TOP, 0); s2car2.rotation.y = -Math.PI / 2;
      });

      /* 3 · ICEBERG (11.4 – 15.0) : the price is the tip, the real cost is underneath */
      const s3 = mkStage();
      const seaTop = grp(s3);
      const seaM = new THREE.MeshStandardMaterial({ color: "#8cc2ff", transparent: true, opacity: 0.38, roughness: 0.2, depthWrite: false });
      const sea = put(s3, rbox(9.0, 3.6, 9.0, null, 0.1, seaM), 0, -3.3, 0); sea.renderOrder = 5; sea.castShadow = false;
      put(s3, rbox(9.2, 0.6, 9.2, "#5b7fe0", 0.1), 0, -3.9, 0);
      const ice = grp(s3, 0, 0.34, 0);
      put(ice, rbox(3.2, 0.7, 3.0, P.white, 0.15)); put(ice, rbox(2.4, 0.7, 2.2, "#ebe7fb", 0.15), 0.1, 0.7, 0); put(ice, rbox(1.5, 0.7, 1.4, P.white, 0.12), 0.1, 1.4, 0);
      const iceCrane = buildCrane(ice, 0.1, 0, 0.3, CR, 2.1);
      const costA = rbox(2.6, 2.6, 2.6, P.coral, 0.15); put(s3, costA, -1.9, -3.0, 0.9);
      const costB = rbox(2.2, 2.2, 2.2, P.sky, 0.15); put(s3, costB, 2.0, -3.0, 1.2);
      const costC = rbox(2.0, 2.0, 2.0, P.lilac, 0.15); put(s3, costC, 0.2, -3.0, -2.0);
      const clk = grp(s3, 0.2, -0.95, -2.0); const face = cyl(0.8, 0.8, 0.1, "#ffffff", 32); clk.add(face); const hand = put(clk, rbox(0.08, 0.06, 0.6, P.navy, 0.02), 0, 0.08, 0.28); const hand2 = put(clk, rbox(0.06, 0.06, 0.42, P.coral, 0.02), 0, 0.1, 0.2);
      const chunks = [[-3.6, 3.2], [3.6, -3.0], [-3.4, -3.4]].map(([x, z], i) => put(s3, rbox(0.9, 0.4, 0.8, P.white, 0.12), x, 0.34, z));
      card('<small>Prix ≠ coût</small><b>La partie visible</b>', "sm", { get: () => V(0.1, 4.6, 0) }, T.cards[2], 14.8);
      card('<small>Dette</small><b>PRÊT</b>', "coral sm", { get: () => V(-1.9, -0.2, 0.9) }, T.cards[3], 14.8);
      card('<small>Coût</small><b>INTÉRÊTS</b>', "sm", { get: () => V(2.0, -0.4, 1.2) }, T.cards[4], 14.8);
      card('<small>Coût</small><b>TEMPS</b>', "sm", { get: () => V(0.2, -0.4, -2.0) }, T.cards[5], 14.8);
      defScene(11.4, 15.0, s3, (t) => {
        appear(seaTop, t, 11.4, null, "pop", 0.4); appear(sea, t, 11.45, null, "pop", 0.5); updCrane(iceCrane, t, 11.6); hook(iceCrane, 3.5, 2.2, 0);
        appear(ice, t, 11.5, null, "pop", 0.5);
        [costA, costB, costC].forEach((o, i) => appear(o, t, T.cost[i], null, "pop", 0.5)); clk.visible = costC.visible; clk.scale.setScalar(Math.max(popS(t, T.cost[2] + 0.3, 0.4), 0.001)); hand.rotation.y = -t * 5; hand2.rotation.y = -t * 0.8;
        chunks.forEach((c, i) => { appear(c, t, 11.9 + i * 0.15, null, "pop", 0.4); c.position.y = 0.34 + Math.sin(t * 1.4 + i * 2) * 0.05; });
      });

      /* 4 · NIGHT SITE (15.0 – 19.0) : the crane sleeps, the clock and the debt keep running */
      const s4 = mkStage(); const s4t = floor(s4, 9, 9, checker("#3b3a78", "#34336c"), "#2a2960", "#211f52");
      const cr4 = buildCrane(s4, -1.6, -1.6, 0.85, { body: "#8d8ca8", brace: "#b5b4c9", cab: "#6e6d90", weight: "#7a7996" }, TOP);
      const beacon = new THREE.MeshStandardMaterial({ color: "#ff8a8f", emissive: "#ff5566", emissiveIntensity: 1.6 }); const bc = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), beacon); bc.position.set(-1.6, TOP + 0.85 * 8.95, -1.6); s4.add(bc);
      const nCabin = grp(s4, 2.6, TOP, -2.8); put(nCabin, rbox(1.8, 1.0, 1.2, P.white, 0.08)); put(nCabin, rbox(1.95, 0.18, 1.35, P.sky, 0.05), 0, 1.0, 0);
      put(nCabin, rbox(0.5, 0.45, 0.06, null, 0.02, winMat), -0.45, 0.35, 0.62); put(nCabin, rbox(0.5, 0.45, 0.06, null, 0.02, winMat), 0.45, 0.35, 0.62);
      const bigClock = grp(s4, 0.9, TOP, 2.2); put(bigClock, rbox(2.6, 0.3, 2.6, P.lilac, 0.1)); const cf = cyl(1.1, 1.1, 0.12, "#ffffff", 40); cf.position.set(0, 0.36, 0); bigClock.add(cf);
      const ch1 = put(bigClock, rbox(0.1, 0.08, 0.95, P.navy, 0.03), 0, 0.46, 0), ch2 = put(bigClock, rbox(0.08, 0.08, 0.65, P.coral, 0.03), 0, 0.48, 0);
      const meter4 = rbox(1.0, 1, 1.0, P.coral, 0.1); put(s4, meter4, 3.3, TOP, 1.0);
      const moonM = new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#fff0c2", emissiveIntensity: 1.2 }); const moon = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 18), moonM); moon.position.set(5.5, 11, -6); s4.add(moon);
      const starM = new THREE.MeshBasicMaterial({ color: "#fff6d8" }); const stars = []; for (let i = 0; i < 26; i++) { const sm = new THREE.Mesh(new THREE.SphereGeometry(0.06 + rn() * 0.05, 6, 4), starM); sm.position.set(-8 + rn() * 14, 8 + rn() * 7, -9 + rn() * 3); s4.add(sm); stars.push(sm); }
      const s4lamps = [lamp(s4, -3.5, 3.4), lamp(s4, 3.4, 3.4), lamp(s4, -3.4, -0.5)];
      const s4trees = [tree(s4, -3.5, 1.5), tree(s4, 3.6, -0.4, 0.9)];
      card('<small>Pendant ce temps</small><b>ça coûte</b>', "coral sm", { get: () => V(3.3, 2.6, 1.0) }, T.cards[6], 18.7);
      defScene(15.0, 19.0, s4, (t) => {
        tilesIn(s4t, t, 15.0); updCrane(cr4, t, -20); hook(cr4, 3.5 + Math.sin((t - 15) * 1.4) * 0.12, 2.2, 0);
        appear(nCabin, t, 15.3, null, "pop", 0.4); appear(bigClock, t, 15.4, null, "pop", 0.5); appear(meter4, t, T.meter, null, "pop", 0.4); meter4.scale.y = Math.max(0.2, (1 + 3.6 * prog(t, 16.0, 2.4)) * Math.max(popS(t, T.meter, 0.4), 0.001));
        ch1.rotation.y = -(t - 15) * 6; ch2.rotation.y = -(t - 15) * 0.9; appear(moon, t, 15.2, null, "pop", 0.6); stars.forEach((s_, i) => { s_.visible = t > 15.3 + i * 0.03 && (Math.sin(t * 3 + i) > -0.6); });
        [...s4lamps, ...s4trees].forEach((o, i) => appear(o, t, 15.5 + i * 0.12, null, "pop", 0.4));
        zz.forEach((d, i) => { const p = prog(t, 15.4 + i * 0.5, 1.2); const o = (t >= 15.4 && t < 18.5) ? Math.sin(p * Math.PI) : 0; const [sx, sy] = toScreen(V(-1.6 + 3.6 + i * 0.35, TOP + 7.4 + p * 1.2 + i * 0.5, -1.6)); d.style.opacity = o; d.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%)`; });
      });

      /* 5 · CALENDAR + BANK (19.0 – 25.9) : weeks bleed red, the loan chain keeps pulling */
      const s5 = mkStage(); const s5t = floor(s5, 9, 9, checker("#f6f4ff", "#ece8fc"));
      const cal = grp(s5, -0.6, TOP, 1.2); put(cal, rbox(6.4, 0.3, 4.2, P.white, 0.1)); put(cal, rbox(6.4, 0.34, 0.8, P.coral, 0.08), 0, 0, -1.7);
      for (let k = 0; k < 7; k++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 14), M(P.gray)); rg.position.set(-2.7 + k * 0.9, 0.5, -1.8); rg.rotation.y = Math.PI / 2; cal.add(rg); }
      const weeks = []; for (let i = 0; i < 8; i++) { const m = new THREE.MeshStandardMaterial({ color: P.white, roughness: 0.75 }); const w = rbox(1.35, 0.3, 1.1, null, 0.08, m); put(cal, w, -2.35 + (i % 4) * 1.55, 0.3, -0.6 + Math.floor(i / 4) * 1.35); weeks.push({ w, m }); }
      const bank = grp(s5, 2.6, TOP, -2.6); put(bank, rbox(3.2, 0.25, 2.6, P.white, 0.06)); put(bank, rbox(2.8, 0.25, 2.2, P.gray, 0.06), 0, 0.25, 0);
      for (let k = 0; k < 4; k++) put(bank, cyl(0.17, 0.17, 1.7, P.white, 16), -1.05 + k * 0.7, 1.35, 0.5);
      put(bank, rbox(2.8, 0.25, 2.2, P.white, 0.06), 0, 2.2, 0); const ped = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.8, 4), M(P.lilac)); ped.rotation.y = Math.PI / 4; ped.scale.set(1, 1, 0.55); ped.position.set(0, 2.85, 0.1); ped.castShadow = true; bank.add(ped);
      const emblem = cyl(0.3, 0.3, 0.08, P.gold, 24); emblem.rotation.x = Math.PI / 2; emblem.position.set(0, 2.85, 0.65); bank.add(emblem);
      const links5 = []; for (let k = 0; k < T.chain[2]; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 14), M("#8a88b8")); l.castShadow = true; s5.add(l); const f = (k + 0.5) / T.chain[2]; l.position.set(lerp(1.8, 0.6, f), TOP + 0.3, lerp(-1.6, 0.0, f)); l.rotation.set(k % 2 ? Math.PI / 2 : 0, -0.7 + (k % 2 ? 0 : Math.PI / 2), 0, "YXZ"); links5.push(l); }
      const hg5 = grp(s5, -3.4, TOP, -2.4);
      put(hg5, rbox(1.0, 0.12, 1.0, P.white, 0.04)); put(hg5, rbox(1.0, 0.12, 1.0, P.white, 0.04), 0, 1.78, 0);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(hg5, rbox(0.07, 1.7, 0.07, P.lilac, 0.02), sx * 0.42, 0.1, sz * 0.42);
      const glassM2 = new THREE.MeshStandardMaterial({ color: "#dfeaff", transparent: true, opacity: 0.35, roughness: 0.2 });
      const gT = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.7, 20), glassM2); gT.rotation.x = Math.PI; gT.position.set(0, 1.35, 0); hg5.add(gT);
      const gB = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.7, 20), glassM2); gB.position.set(0, 0.55, 0); hg5.add(gB);
      const sT = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 20), M(P.coral)); sT.rotation.x = Math.PI; sT.position.set(0, 1.38, 0); hg5.add(sT);
      const sB = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 20), M(P.coral)); sB.position.set(0, 0.52, 0); hg5.add(sB);
      const s5trees = [tree(s5, 3.5, 3.4), tree(s5, -3.6, 3.4, 1.1), tree(s5, -3.6, 0.2, 0.9)];
      const whiteC = new THREE.Color(P.white), coralC = new THREE.Color(P.coral), mintC = new THREE.Color(P.green), colC = new THREE.Color();
      card('<small>Semaines perdues</small><b>▮▮▮▮▮▮▮▮</b>', "coral sm", { get: () => V(-0.6, 2.2, 1.2) }, T.cards[7], 25.4);
      card('<small>Prêt</small><b>toujours là</b>', "sm", { get: () => V(2.6, 4.6, -2.6) }, T.cards[8], 25.4);
      defScene(19.0, 25.9, s5, (t) => {
        tilesIn(s5t, t, 19.0); appear(cal, t, 19.1, null, "pop", 0.5); appear(bank, t, T.loan, null, "pop", 0.5); appear(hg5, t, T.hourglass, null, "pop", 0.5);
        weeks.forEach(({ w, m }, i) => { appear(w, t, T.weeksIn + i * 0.12, null, "y", 0.35); const red = prog(t, T.weeksRed + i * 0.3, 0.25); m.color.copy(whiteC).lerp(coralC, red); });
        links5.forEach((l, k) => appear(l, t, T.chain[0] + k * T.chain[1], null, "pop", 0.3));
        const L = prog(t, T.weeksRed, 2.4); sT.scale.setScalar(Math.max(1 - L, 0.001)); sB.scale.setScalar(Math.max(L, 0.001));
        s5trees.forEach((o, i) => appear(o, t, 19.4 + i * 0.12, null, "pop", 0.4)); bank.scale.multiplyScalar(1 + 0.02 * Math.sin((t - 20.6) * 6.5));
      });

      /* 6 · CLIENT vs BALANCE SHEET (25.9 – 32.6) : shiny crane on the left, ledger + debt on the right */
      const s6 = mkStage(); const s6t = floor(s6, 9, 9, (i, j) => (i < 4 ? ((i + j) % 2 ? "#fff8e6" : "#fdf0cf") : i === 4 ? P.gold : (i + j) % 2 ? "#d9d6ea" : "#cfcce2"));
      put(s6, rbox(0.14, 1.6, 9.0, "#8f88c8", 0.04), 0, TOP, 0);
      const pod6 = put(s6, cyl(1.5, 1.6, 0.45, P.white, 40), -2.3, TOP + 0.22, 0.2); const cr6 = buildCrane(s6, -2.3, 0.2, 0.42, CR, TOP + 0.45);
      const beam6M = new THREE.MeshBasicMaterial({ color: "#fff1c4", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const beam6 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 6.5, 28, 1, true), beam6M); beam6.position.set(-2.3, TOP + 3.8, 0.2); s6.add(beam6);
      const desk = grp(s6, 2.2, TOP, 1.0); put(desk, rbox(3.6, 0.18, 1.7, "#c9b8f7", 0.06), 0, 1.0, 0); for (const [x, z] of [[-1.6, -0.7], [1.6, -0.7], [-1.6, 0.7], [1.6, 0.7]]) put(desk, rbox(0.14, 1.0, 0.14, P.lilac, 0.04), x, 0, z);
      put(desk, rbox(0.9, 0.12, 0.7, P.white, 0.04), -1.0, 1.18, 0.1); put(desk, rbox(0.9, 0.12, 0.7, "#ffe3e3", 0.04), -0.1, 1.18, 0.1); put(desk, rbox(0.5, 0.18, 0.7, P.navy, 0.05), 1.2, 1.18, 0.2);
      const debt6 = []; for (let k = 0; k < 6; k++) { const b = rbox(1.2, 0.46, 1.2, k % 2 ? P.coral : "#ff9fa3", 0.08); put(s6, b, 2.6, TOP + k * 0.5, -2.2); debt6.push(b); }
      const bal6 = grp(s6, 2.2, TOP + 1.2, 1.0); bal6.scale.setScalar(0.55);
      put(bal6, rbox(0.9, 0.15, 0.9, P.gray, 0.05)); put(bal6, rbox(0.18, 2.3, 0.18, P.gray, 0.05), 0, 0.1, 0);
      const beamB = grp(bal6, 0, 2.4, 0); put(beamB, rbox(3.4, 0.14, 0.14, P.lilac, 0.04), 0, -0.07, 0);
      const pL = grp(beamB, -1.6, 0, 0), pR = grp(beamB, 1.6, 0, 0);
      for (const q of [pL, pR]) { put(q, rbox(0.04, 1.0, 0.04, P.gray, 0.01), 0, -1.0, 0); put(q, rbox(1.2, 0.08, 1.2, P.white, 0.03), 0, -1.08, 0); }
      for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 20), M(P.gold)); c.position.set(0, -0.99 + i * 0.11, 0); c.castShadow = true; pL.add(c); }
      put(pR, rbox(0.9, 0.9, 0.9, P.coral, 0.08), 0, -1.0, 0);
      const s6props = [tree(s6, -3.6, -3.4, 0.9), tree(s6, -3.6, 3.4, 0.8), lamp(s6, 3.5, 3.5), lamp(s6, -3.5, 3.5)];
      card('<small>Vu par le client</small><b>De l’acier</b>', "gold sm", { get: () => V(-2.3, 4.6, 0.2) }, T.cards[9], 28.0);
      card('<small>Vu par le bilan</small><b>Une dette</b>', "coral sm", { get: () => V(2.6, 4.8, -2.2) }, T.cards[10], 32.4);
      defScene(25.9, 32.6, s6, (t) => {
        tilesIn(s6t, t, 25.9); appear(pod6, t, 26.0, null, "pop", 0.4); updCrane(cr6, t, -20); hook(cr6, 3.5, 2.2, 0); beam6M.opacity = 0.1 * prog(t, 26.2, 0.8);
        appear(desk, t, 26.2, null, "pop", 0.5); debt6.forEach((b, k) => appear(b, t, T.debt.t0 + k * T.debt.step, null, "pop", 0.35)); appear(bal6, t, T.balance - 0.2, null, "pop", 0.5);
        const tilt = -0.3 * eOutBack(prog(t, T.balance + 1.6, 1.0)); beamB.rotation.z = tilt; pL.rotation.z = -tilt; pR.rotation.z = -tilt;
        s6props.forEach((o, i) => appear(o, t, 26.3 + i * 0.12, null, "pop", 0.4));
        sparks.forEach((d, i) => { const p = prog(t, 26.3 + i * 0.5, 0.5); const o = (t >= 26.3 && t < 28.2) ? p * (0.6 + 0.4 * Math.sin(t * 8 + i)) : 0; const [sx, sy] = toScreen(V(-3.4 + i * 0.9, TOP + 2.2 + (i % 2) * 1.8, 0.8)); d.style.opacity = o; d.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%)`; });
      });

      /* 7 · USED-MACHINE LOT (32.6 – 36.0) : "la parade" : the used crane arrives on a truck */
      const s7 = mkStage(); const s7t = floor(s7, 9, 9, checker("#ece6d8", "#e2dac9"), "#d9cfb9", "#bfb298");
      for (let k = -4; k <= 4; k++) { put(s7, rbox(0.1, 0.7, 0.1, P.white, 0.03), k, TOP, -4.4); put(s7, rbox(0.1, 0.7, 0.1, P.white, 0.03), -4.4, TOP, k); } put(s7, rbox(9, 0.08, 0.08, P.white, 0.02), 0, TOP + 0.5, -4.4); put(s7, rbox(0.08, 0.08, 9, P.white, 0.02), -4.4, TOP + 0.5, 0);
      const truck = grp(s7, 0, TOP, 0); put(truck, rbox(3.8, 0.22, 1.5, P.gray, 0.06), 0, 0.3, 0); put(truck, rbox(1.0, 0.8, 1.4, P.coral, 0.1), 2.3, 0.3, 0); put(truck, rbox(0.1, 0.35, 1.0, "#4b4a9a", 0.03), 2.84, 0.8, 0);
      for (const x of [-1.2, 0.2, 1.8]) for (const z of [-0.8, 0.8]) { const w = cyl(0.3, 0.3, 0.2, P.navy, 14); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); truck.add(w); }
      const cr7 = buildCrane(truck, -0.4, 0, 0.5, CRm, 0.52);
      const exc = grp(s7, -2.6, TOP, 2.3); put(exc, rbox(1.6, 0.25, 0.9, P.gray, 0.08), 0, 0, 0); put(exc, rbox(1.1, 0.5, 0.9, P.yellow, 0.1), 0, 0.25, 0); put(exc, rbox(0.6, 0.5, 0.7, P.white, 0.1), 0.2, 0.75, 0);
      const arm1 = grp(exc, 0.55, 0.7, 0); arm1.rotation.z = 0.8; put(arm1, rbox(1.3, 0.15, 0.2, P.yellow, 0.05), 0.65, 0, 0); const arm2 = grp(arm1, 1.3, 0, 0); arm2.rotation.z = -1.4; put(arm2, rbox(0.9, 0.13, 0.18, P.yellow, 0.05), 0.45, 0, 0); put(arm2, rbox(0.4, 0.3, 0.4, P.gray, 0.06), 0.9, -0.2, 0);
      const tires = grp(s7, 3.3, TOP, 2.8); for (let k = 0; k < 3; k++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.14, 10, 20), M(P.navy)); tr.rotation.x = Math.PI / 2; tr.position.y = 0.15 + k * 0.28; tr.castShadow = true; tires.add(tr); }
      const sign7 = grp(s7, -3.0, TOP, -3.0); put(sign7, rbox(0.14, 2.2, 0.14, P.gray, 0.04)); put(sign7, rbox(2.2, 0.9, 0.14, P.mint, 0.06), 0, 2.2, 0);
      const s7props = [tree(s7, 3.6, -3.0, 0.9), cone(s7, 1.2, 3.2), cone(s7, 1.8, 3.4), mixer(s7)];
      s7props[3].position.set(-0.8, TOP, 3.2); s7props[3].rotation.y = 0.4;
      card('<small>Parade</small><b>OCCASION</b>', "mint", { get: () => V(-3.0, 3.9, -3.0) }, T.cards[11], 35.6);
      defScene(32.6, 36.0, s7, (t) => {
        tilesIn(s7t, t, 32.6); const p = eOut(prog(t, 32.9, 1.4)); truck.position.set(lerp(8.5, 0.6, p), TOP, 0.2); updCrane(cr7, t, 33.6);
        appear(exc, t, 33.0, null, "pop", 0.5); appear(sign7, t, 33.1, null, "pop", 0.5); appear(tires, t, 33.2, null, "pop", 0.4); s7props.forEach((o, i) => appear(o, t, 33.2 + i * 0.1, null, "pop", 0.4));
        arm1.rotation.z = 0.8 + Math.sin(t * 1.2) * 0.1; hook(cr7, 3.5, 2.2, 0);
      });

      /* 8 · PODIUM (36.0 – 42.2) : two price ranges under the spotlights */
      const s8 = mkStage(); const s8t = floor(s8, 9, 9, checker("#d6cdf7", "#cbc0f2"), "#a999e6", "#8a78d6");
      const back8 = put(s8, rbox(9.0, 4.4, 0.2, "#b8a8f0", 0.08), 0, TOP, -4.5); const bg8 = put(s8, rbox(0.2, 4.4, 9.0, "#c4b6f4", 0.08), -4.5, TOP, 0);
      const cur = [put(s8, rbox(1.2, 4.4, 0.5, P.coral, 0.1), -3.3, TOP, -4.0), put(s8, rbox(1.2, 4.4, 0.5, P.coral, 0.1), 3.3, TOP, -4.0)];
      const base8 = [put(s8, cyl(1.3, 1.4, 0.5, P.white, 36), -1.9, TOP + 0.25, 0.4), put(s8, cyl(1.3, 1.4, 0.5, P.white, 36), 1.9, TOP + 0.25, 0.4)];
      const poleA = rbox(0.22, 1.9, 0.22, P.gray, 0.05), poleB = rbox(0.22, 0.7, 0.22, P.gray, 0.05); put(s8, poleA, -1.9, TOP + 0.5, 0.4); put(s8, poleB, 1.9, TOP + 0.5, 0.4);
      const barNew = rbox(1.4, 3.0, 1.4, P.gold, 0.12); put(s8, barNew, -1.9, TOP + 2.0, 0.4); const barUsed = rbox(1.4, 2.2, 1.4, P.mint, 0.12); put(s8, barUsed, 1.9, TOP + 0.9, 0.4);
      const spot = (x, col) => { const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const c = new THREE.Mesh(new THREE.ConeGeometry(1.9, 8, 28, 1, true), m); c.position.set(x, TOP + 4.5, 0.4); s8.add(c); return m; };
      const spA = spot(-1.9, "#fff0c4"), spB = spot(1.9, "#d4ffe9");
      const s8props = [tree(s8, -3.8, 3.4, 0.9), tree(s8, 3.8, 3.4, 0.9)];
      card('<small>Neuf</small><b><span class="a">0</span> – <span class="b">0</span> €+</b>', "gold sm", { get: () => V(-1.9, 5.8, 0.4) }, T.cards[12], 42.0, [[0, 200000], [1, 500000]]);
      card('<small>Occasion</small><b><span class="a">0</span> – <span class="b">0</span> €</b>', "mint sm", { get: () => V(1.9, 3.8, 0.4) }, T.cards[13], 42.0, [[0, 80000], [1, 300000]]);
      defScene(36.0, 42.2, s8, (t) => {
        tilesIn(s8t, t, 36.0); [back8, bg8, ...cur].forEach((o, i) => appear(o, t, 36.1 + i * 0.08, null, "y", 0.45)); base8.forEach((o, i) => appear(o, t, 36.3 + i * 0.1, null, "pop", 0.4));
        appear(poleA, t, T.bars[0], null, "y", 0.4); appear(poleB, t, T.bars[0], null, "y", 0.4); appear(barNew, t, T.bars[1], null, "pop", 0.6); appear(barUsed, t, T.bars[2], null, "pop", 0.6);
        spA.opacity = 0.1 * prog(t, 36.8, 0.8); spB.opacity = 0.1 * prog(t, 37.6, 0.8); s8props.forEach((o, i) => appear(o, t, 36.4 + i * 0.1, null, "pop", 0.4));
      });

      /* 9 · CROSSROADS (42.2 – 47.0) : rent, or buy used : two roads, two green checks */
      const s9 = mkStage(); const s9t = floor(s9, 9, 9, (i, j) => ((j === 4 && i >= 0) || (i === 4 && j >= 4)) ? ((i + j) % 2 ? P.asphalt : P.asphalt2) : (i + j) % 2 ? "#c6eadb" : "#d3efe3");
      const gate = (x, z, col) => { const g = grp(s9, x, TOP, z); put(g, rbox(0.3, 2.2, 0.3, col, 0.06), -0.9, 0, 0); put(g, rbox(0.3, 2.2, 0.3, col, 0.06), 0.9, 0, 0); put(g, rbox(2.1, 0.35, 0.35, col, 0.06), 0, 2.1, 0); return g; };
      const gateL = gate(-3.9, 0, P.sky); gateL.rotation.y = Math.PI / 2; const gateR = gate(3.9, 0, P.mint); gateR.rotation.y = Math.PI / 2;
      const post = grp(s9, 0.0, TOP, 0.0); put(post, rbox(0.16, 2.2, 0.16, P.gray, 0.04)); const arL = put(post, rbox(1.6, 0.5, 0.1, P.sky, 0.05), -0.9, 1.4, 0), arR = put(post, rbox(1.6, 0.5, 0.1, P.mint, 0.05), 0.9, 1.0, 0);
      const pCars = [car(s9, P.sky), car(s9, P.mint), car(s9, P.coral), car(s9, "#ffe08a")];
      const s9props = [tree(s9, -2.4, -2.6), tree(s9, 2.6, -2.6, 1.1), tree(s9, -2.6, 2.8), tree(s9, 3.2, 2.8, 0.9), lamp(s9, 0.9, 2.2), lamp(s9, -0.9, 3.4), house(s9, 0.0, -3.1, P.peach, P.coral)];
      card('<small>Option 1</small><b>LOUER ✓</b>', "sm", { get: () => V(-3.9, 3.4, 0) }, T.cards[14], 46.6);
      card('<small>Option 2</small><b>OCCASION ✓</b>', "mint sm", { get: () => V(3.9, 3.4, 0) }, T.cards[15], 46.6);
      defScene(42.2, 47.0, s9, (t) => {
        tilesIn(s9t, t, 42.2); appear(post, t, T.pads[0], null, "pop", 0.5); appear(gateL, t, T.pads[0] + 0.2, null, "pop", 0.5); appear(gateR, t, T.pads[1] + 0.2, null, "pop", 0.5);
        s9props.forEach((o, i) => appear(o, t, 42.6 + i * 0.1, null, "pop", 0.4));
        const run = (c, k, delay, dir) => { const u = ((((t - 43.0 - delay) * 0.32) % 1) + 1) % 1; appear(c, t, 43.0, null, "pop", 0.3); if (u < 0.5) { c.position.set(0, TOP, lerp(4.6, 0, u * 2)); c.rotation.y = Math.PI; } else { const q = (u - 0.5) * 2; c.position.set(dir * lerp(0, 3.9, q), TOP, 0); c.rotation.y = dir * Math.PI / 2; } };
        run(pCars[0], 0, 0, -1); run(pCars[1], 1, 1.4, 1); run(pCars[2], 2, 2.8, -1); run(pCars[3], 3, 0.7, 1);
      });

      /* 10 · ACTIVE SITE (47.0 – 50.6) : the crane works, the building rises */
      const s10 = mkStage(); const s10t = floor(s10, 9, 9, (i, j) => (i + j) % 2 ? "#efe4cf" : "#e8dcc2");
      const cr10 = buildCrane(s10, -2.2, -2.2, 1, CR);
      const bld10 = grp(s10, 2.2, TOP, -1.4); const f10 = [], wm10 = [];
      for (let k = 0; k < 4; k++) { const f = grp(bld10, 0, k * 0.85, 0); put(f, rbox(1.7, 0.8, 1.7, k % 2 ? P.white : "#ebe7fb", 0.08)); const wm = new THREE.MeshStandardMaterial({ color: "#8fb6ff", emissive: "#ffd98a", emissiveIntensity: 0, roughness: 0.4 }); wm10.push(wm);
        for (const wx of [-0.45, 0.45]) { put(f, rbox(0.38, 0.4, 0.05, null, 0.02, wm), wx, 0.2, 0.86); put(f, rbox(0.05, 0.4, 0.38, null, 0.02, wm), 0.86, 0.2, wx); } f10.push(f); }
      const roof10 = put(bld10, rbox(1.9, 0.14, 1.9, P.coral, 0.05), 0, 3.4, 0);
      const wk10 = [person(s10, P.coral), person(s10, P.mint), person(s10, P.lilac)]; const mx10 = mixer(s10); const s10props = [cone(s10, 0.2, 1.2), cone(s10, 0.9, 1.0), cone(s10, -0.6, 1.6), tree(s10, 3.6, 3.4), tree(s10, -3.6, 3.4, 1.1)];
      card('<small>Au travail</small><b>Elle rapporte</b>', "mint sm", { get: () => V(2.2, 5.2, -1.4) }, T.cards[16], 50.4);
      defScene(47.0, 50.6, s10, (t) => {
        tilesIn(s10t, t, 47.0); updCrane(cr10, t, -20);
        const a = eInOut(prog(t, 47.2, 0.9)), b = eInOut(prog(t, 48.0, 0.7)), c = eInOut(prog(t, 49.4, 0.5));
        hook(cr10, lerp(3.5, 4.4, a), 2.2 + 3.6 * b - 3.6 * c, t < 48.7);
        f10.forEach((f, k) => appear(f, t, T.floors.t0 + k * T.floors.step - 0.5, null, "y", 0.4)); wm10.forEach((wm, k) => { wm.emissiveIntensity = prog(t, T.floors.t0 + k * T.floors.step, 0.2) * 0.7; }); appear(roof10, t, 50.0, null, "pop", 0.4);
        wk10.forEach((w, i) => { appear(w.g, t, 47.3 + i * 0.12, null, "pop", 0.4); const ph = i * 1.7; w.g.position.set(-0.6 + i * 1.0 + Math.sin(t * 0.8 + ph) * 0.5, TOP, 1.6 + Math.cos(t * 0.6 + ph) * 0.4); w.g.rotation.y = Math.cos(t * 0.8 + ph) > 0 ? Math.PI / 2 : -Math.PI / 2; walk(w, t, 7); });
        appear(mx10, t, 47.4, null, "pop", 0.4); mx10.position.set(-1.6, TOP, 3.4); mx10.rotation.y = Math.PI / 2; mx10.userData.sp.rotation.z = t * 4; s10props.forEach((o, i) => appear(o, t, 47.4 + i * 0.1, null, "pop", 0.4));
      });

      /* 11-12 · GOLDEN CITY (50.6 – 60.4) : coins rain on the skyline, then the title lands */
      const s11 = mkStage();
      const cityTiles = floor(s11, 9, 9, (i, j) => (i === 4 || j === 4 || i === 0 || j === 0 || i === 8 || j === 8) ? ((i + j) % 2 ? P.asphalt : P.asphalt2) : (i + j) % 2 ? "#d3efe3" : "#c6eadb");
      const cityWm = new THREE.MeshStandardMaterial({ color: "#8fb6ff", emissive: "#ffd98a", emissiveIntensity: 0, roughness: 0.4 });
      const blds = []; const bl = rng(9);
      [[-2.3, -2.3], [2.3, -2.3], [-2.3, 2.3], [2.3, 2.3], [-1.4, -1.0], [1.4, 1.2], [-1.2, 1.6], [1.5, -1.5]].forEach(([x, z], i) => { if (i < 4 && false) return; });
      const quad = [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]]; const colors = [P.white, P.peach, P.sky, P.lilac, P.mint, "#ffe9b8"];
      quad.forEach(([qx, qz], qi) => { for (let k = 0; k < 2; k++) { const w = 1.0 + bl() * 0.5, d = 1.0 + bl() * 0.4, h = 1.6 + bl() * 3.2; if (qi === 0 && k === 0) continue; blds.push(building(s11, qx + (k ? 0.7 : -0.7), qz + (k ? -0.5 : 0.6), w, d, h, colors[(qi * 2 + k) % colors.length], Math.max(2, Math.round(h / 0.75)), cityWm)); } });
      const cr11 = buildCrane(s11, -2.4, -2.4, 0.9, CR); const coins11 = coinStack(s11, T.coins2.n, 0.4, 0.4);
      const cars11 = [car(s11, P.coral), car(s11, P.sky), car(s11, "#ffe08a"), mixer(s11)];
      const lamps11 = [lamp(s11, 3.6, 3.6), lamp(s11, -3.6, 3.6), lamp(s11, 3.6, -3.6), lamp(s11, 0.6, 3.6)];
      const conf = []; const cr_ = rng(21); const CCOL = [P.coral, P.gold, P.mint, P.sky, P.lilac, P.peach];
      for (let i = 0; i < 70; i++) { const m = rbox(0.14, 0.14, 0.05, CCOL[i % 6], 0.02); m.castShadow = false; m.visible = false; scene.add(m); const a = cr_() * Math.PI * 2, sp = 3.5 + cr_() * 4; conf.push({ m, v: [Math.cos(a) * sp * 0.6, 4 + cr_() * 5, Math.sin(a) * sp * 0.6], spin: [cr_() * 8, cr_() * 8, cr_() * 8] }); }
      const BO = [0.4, TOP + 3.6, 0.4];
      const rain = []; const rr2 = rng(33);
      for (let k = 0; k < T.rain[2]; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 20), M(P.gold)); c.castShadow = true; c.visible = false; scene.add(c); rain.push({ c, x: -3 + rr2() * 6, z: -3 + rr2() * 6, k, sp: 2 + rr2() * 5 }); }
      const tcv = document.createElement("canvas"); tcv.width = 2048; tcv.height = 560;
      const titleTex = new THREE.CanvasTexture(tcv); titleTex.colorSpace = THREE.SRGBColorSpace; titleTex.anisotropy = 4;
      function drawTitle() { const c = tcv.getContext("2d"); c.clearRect(0, 0, tcv.width, tcv.height); c.textAlign = "center"; c.textBaseline = "middle"; c.font = "900 210px DecryptInter, Inter, sans-serif"; c.fillStyle = "#2f2e7a"; c.fillText("DECRYPT", 1024, 170); c.fillStyle = "#c98a00"; c.fillText("BUSINESS", 1024, 380); c.fillStyle = "#7b5cf0"; c.fillRect(300, 505, 1448, 14); titleTex.needsUpdate = true; }
      drawTitle(); document.fonts.load("900 100px DecryptInter").then(() => { drawTitle(); renderAt(window.__hfThreeTime || 0); });
      const plaque = grp(s11, 6.6, 0, 6.6); put(plaque, rbox(9.6, 0.4, 3.4, P.white, 0.12), 0, -0.2, 0);
      const tp = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 2.46), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true })); tp.rotation.x = -Math.PI / 2; tp.position.set(0, 0.215, 0); plaque.add(tp);
      card('<small>Gardée occupée</small><b>Rentable</b>', "mint sm", { get: () => V(0.4, 3.4, 0.4) }, T.cards[17], 55.6);
      defScene(50.6, 61, s11, (t) => {
        tilesIn(cityTiles, t, 50.6); blds.forEach((b, i) => appear(b, t, 50.7 + i * 0.1, null, "y", 0.5)); updCrane(cr11, t, -20);
        hook(cr11, t > 50.7 ? 4.0 - 1.2 * eInOut(prog(t, 50.7, 1.2)) + 1.2 * eInOut(prog(t, 52.0, 1.2)) - 1.2 * eInOut(prog(t, 53.3, 1.2)) : 3.5, 2.2, 0);
        updCoins(coins11, t, T.coins2.t0, T.coins2.step, null); lamps11.forEach((o, i) => appear(o, t, 50.9 + i * 0.1, null, "pop", 0.4));
        cars11.forEach((c, i) => { appear(c, t, 51.0 + i * 0.1, null, "pop", 0.3); const L = 8, s = ((t - 50) * 2.0 + i * 8) % 32, seg = Math.floor(s / L) % 4, u = s % L;
          const pts = [[-4 + u, -4, Math.PI / 2], [4, -4 + u, 0], [4 - u, 4, -Math.PI / 2], [-4, 4 - u, Math.PI]]; c.position.set(pts[seg][0], TOP, pts[seg][1]); c.rotation.y = pts[seg][2]; if (c.userData.sp) c.userData.sp.rotation.z = t * 4; });
        const pp = prog(t, T.plaque, 0.8); plaque.visible = pp > 0; plaque.position.y = lerp(-4, 0, eOutBack(pp)); plaque.scale.setScalar(Math.max(0.2 + 0.8 * eOut(pp), 0.001));
        const d = t - T.burst; conf.forEach(({ m, v, spin }) => { if (d < 0 || d > 2.2) { m.visible = false; return; } m.visible = true; m.position.set(BO[0] + v[0] * d, BO[1] + v[1] * d - 4.5 * d * d, BO[2] + v[2] * d); m.rotation.set(spin[0] * d, spin[1] * d, spin[2] * d); m.scale.setScalar(Math.max(1 - 0.8 * prog(d, 1.4, 0.8), 0.001)); });
        rain.forEach(({ c, x, z, k, sp }) => { const dd = t - (T.rain[0] + k * T.rain[1]); if (dd < 0 || dd > 1.3) { c.visible = false; return; } c.visible = true; const f = Math.min(dd / 0.8, 1); const by = dd > 0.8 ? Math.abs(Math.sin((dd - 0.8) * 9)) * 0.35 * Math.max(1 - (dd - 0.8) / 0.5, 0) : 0; c.position.set(x, lerp(13, TOP + 0.1, f * f) + by, z); c.rotation.set(dd * sp, 0, dd * sp * 0.5); c.scale.setScalar(Math.max(1 - prog(dd, 1.0, 0.3), 0.001)); });
      });

      /* ---------- ambient sky: clouds + floating islets (always on, give continuity) ---------- */
      const clouds = [];
      [[-9, 5, -8, 1], [8, 6, -9, 1.2], [-3, 8, -11, 0.9], [11, 4, -4, 1.0]].forEach(([x, y, z, sc], i) => {
        const g = grp(scene, x, y, z); [[0, 0, 0, 1], [0.9, -0.1, 0.2, 0.75], [-0.9, -0.15, 0, 0.7]].forEach(([dx, dy, dz, r]) => {
          const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 })); m.position.set(dx, dy, dz); g.add(m);
        }); g.scale.setScalar(sc); clouds.push({ g, x, i });
      });
      const islets = [[-3, -1.2, 7.2, 1.3], [6.6, -0.6, -2.4, 1.1]].map(([x, y, z, sc], i) => {
        const g = grp(scene, x, y, z); g.scale.setScalar(sc);
        put(g, rbox(2.4, 0.5, 2.4, P.deep, 0.1), 0, -0.65, 0); put(g, rbox(2.4, 0.3, 2.4, i ? "#d3efe3" : P.white, 0.06), 0, -0.15, 0);
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), M(P.mint)); c.position.set(0.3, 0.55, 0.2); c.castShadow = true; g.add(c); return { g, y, i };
      });

      /* ---------- camera: each diorama has its own framing ---------- */
      const shots = [
        [0, 1.9, [0, 3.0, 0, 1.9], [0, 2.4, 0, 1.0], "io"],
        [1.9, 3.9, [0, 2.4, 0, 1.0], [0.3, 2.4, 0.3, 1.06], "l"],
        [3.9, 5.7, [2.8, 1.3, 2.3, 2.05], [2.8, 1.5, 2.3, 1.85], "l"],
        [5.7, 7.9, [2.8, 1.9, 2.3, 1.7], [1.4, 2.3, 1.2, 1.2], "io"],
        [7.9, 11.4, [-0.5, 1.8, 0.2, 1.1], [0.8, 1.8, 1.8, 1.2], "l"],
        [11.4, 15.0, [0, 0.0, 0, 1.0], [0, -0.3, 0.2, 1.12], "l"],
        [15.0, 19.0, [0, 3.2, 0, 1.0], [0.2, 3.0, 0.2, 1.12], "l"],
        [19.0, 25.9, [0, 1.8, 0, 1.1], [0, 2.0, 0, 1.22], "l"],
        [25.9, 28.2, [-2.3, 3.2, 0.2, 1.2], [-2.3, 3.6, 0.2, 1.3], "l"],
        [28.2, 32.6, [2.4, 2.2, -0.4, 1.2], [2.3, 2.5, -0.2, 1.3], "l"],
        [32.6, 36.0, [0, 2.0, 0, 1.0], [0.2, 2.2, 0.2, 1.12], "l"],
        [36.0, 42.2, [0, 2.4, 0, 1.05], [0, 2.7, 0.2, 1.18], "l"],
        [42.2, 47.0, [0, 1.8, 0.5, 1.05], [0, 1.8, 0.6, 1.2], "l"],
        [47.0, 50.6, [0, 3.4, 0, 1.0], [0.4, 3.6, -0.4, 1.12], "l"],
        [50.6, 55.9, [0, 2.4, 0, 1.0], [0, 2.6, 0.4, 0.95], "l"],
        [55.9, 60.4, [0, 2.6, 0.4, 0.95], [1.5, 1.2, 1.5, 0.8], "io"],
      ];
      function camAt(t) {
        let s = shots[shots.length - 1]; for (const sh of shots) if (t < sh[1]) { s = sh; break; }
        const p = prog(t, s[0], s[1] - s[0]); const k = s[4] === "io" ? eInOut(p) : p * p * (3 - 2 * p) * 0.6 + p * 0.4;
        const v = s[2].map((q, i) => lerp(q, s[3][i], k));
        if (T.cuts.some((c) => Math.abs(c - s[0]) < 0.01)) v[3] *= 1 + 0.12 * (1 - eOut(prog(t, s[0], 0.3)));
        return v;
      }
      const dirv = new THREE.Vector3(1, 1, 1).normalize();
      const rootEl = document.getElementById("root"), grainEl = document.getElementById("grain");
      const hlfadeEl = document.getElementById("hlfade"), flashEl = document.getElementById("flash");
      /* mood keys: [start, blend, sky[3], sun, sunIntensity, hemiGround, hemiIntensity] */
      const KEYS = [
        [-9, 0.1, ["#fdeee6", "#e7d3f3", "#c3a9ea"], "#ffe9d6", 2.0, "#e0c8f2", 1.25],
        [7.0, 1.2, ["#efeafd", "#d8cff7", "#b9a8f0"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [10.2, 1.2, ["#e1ecfb", "#bdd4f2", "#93b6e8"], "#f4f8ff", 2.0, "#b8cdf0", 1.25],
        [14.3, 0.7, ["#2a2a5e", "#38347a", "#4c3f95"], "#a9b8ff", 1.0, "#4a4399", 0.85],
        [18.4, 0.6, ["#efeafd", "#d8cff7", "#b9a8f0"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [31.4, 1.2, ["#e6f7f6", "#cdeee6", "#acdcf2"], "#fffdf2", 2.2, "#c2e8e0", 1.25],
        [45.8, 1.2, ["#eaf7ee", "#d3f0e2", "#b3e2f0"], "#fffbea", 2.25, "#c6ead8", 1.25],
        [50.8, 5.2, ["#ffeedd", "#f9cdbf", "#c9a2e8"], "#ffc98a", 2.5, "#f2b6c4", 1.15],
      ];
      const rgbs = (c) => `rgb(${c.map(Math.round).join(",")})`;
      const hxs = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
      function moodAt(t) {
        let sky = KEYS[0][2].map(hex2), sun = hex2(KEYS[0][3]), hg = hex2(KEYS[0][5]), sunI = KEYS[0][4], hemiI = KEYS[0][6];
        for (let i = 1; i < KEYS.length; i++) {
          const k = eInOut(prog(t, KEYS[i][0], KEYS[i][1]));
          sky = sky.map((c, j) => c.map((v, q) => lerp(v, hex2(KEYS[i][2][j])[q], k)));
          sun = sun.map((v, q) => lerp(v, hex2(KEYS[i][3])[q], k)); hg = hg.map((v, q) => lerp(v, hex2(KEYS[i][5])[q], k)); sunI = lerp(sunI, KEYS[i][4], k); hemiI = lerp(hemiI, KEYS[i][6], k);
        }
        return { sky: sky.map(rgbs), top: sky[0].map(Math.round).join(","), sun: hxs(sun), hg: hxs(hg), sunI, hemiI };
      }

      function renderAt(t) {
        /* diorama visibility: exactly one world at a time, hard cuts + punch-in (see camera) */
        zz.forEach((d) => { d.style.opacity = 0; }); sparks.forEach((d) => { d.style.opacity = 0; });
        scenes.forEach((s) => { const on = t >= s.t0 - 0.001 && t < s.t1; s.g.visible = on; if (on) s.update(t); });
        clouds.forEach(({ g, x, i }) => { g.position.x = ((x + t * (0.25 + i * 0.05) + 14) % 28) - 14; });
        islets.forEach(({ g, y, i }) => { g.position.y = y + Math.sin(t * 0.8 + i * 2) * 0.25; });
        const golden = prog(t, 50.8, 5.2), night = prog(t, 14.3, 0.7) * (1 - prog(t, 18.4, 0.6));
        lampMats.forEach((lm) => { lm.emissiveIntensity = Math.max(golden * 1.6, night * 1.6); }); winMat.emissiveIntensity = Math.max(night * 1.2, golden * 1.2); cityWm.emissiveIntensity = golden * 1.4;
        flashEl.style.opacity = Math.max(0.35 * (1 - prog(t, 0, 0.3)), t >= T.burst ? 0.55 * (1 - prog(t, T.burst, 0.4)) : 0, t >= T.plaque ? 0.45 * (1 - prog(t, T.plaque, 0.4)) : 0, prog(t, T.loopFlash, 0.65)).toFixed(3);
        rootEl.classList.toggle("night", night > 0.5);
        const md = moodAt(t);
        sun.color.set(md.sun); sun.intensity = md.sunI + 0.4 * golden; sun.position.set(-12 - 4 * golden, 22 - 10 * golden, 9 + 2 * golden);
        hemi.groundColor.set(md.hg); hemi.intensity = md.hemiI;
        rootEl.style.background = `linear-gradient(180deg, ${md.sky[0]} 0%, ${md.sky[1]} 45%, ${md.sky[2]} 100%)`;
        hlfadeEl.style.background = `linear-gradient(180deg, rgba(${md.top},.9) 0%, rgba(${md.top},.62) 55%, rgba(${md.top},0) 100%)`;
        const [cx, cy, cz, zoom] = camAt(t);
        cam.zoom = zoom; cam.updateProjectionMatrix(); cam.position.set(cx, cy, cz).addScaledVector(dirv, 80); cam.lookAt(cx, cy, cz); cam.updateMatrixWorld();
        for (const c of cards) {
          const s = eOutBack(prog(t, c.t0, 0.45)) * (1 - eOut(prog(t, c.t1, 0.3)));
          if (s <= 0.01) { c.d.style.opacity = 0; continue; }
          if (c.count) { const e = eOut(prog(t, c.t0 + 0.15, 0.9)); c.count.forEach(([idx, v]) => { c.spans[idx].textContent = fmt(v * e); }); }
          const [sx, sy] = toScreen(c.anchor.get()); const hw = (c.d.offsetWidth || 300) / 2 + 24; const cxp = Math.min(W - hw, Math.max(hw, sx));
          c.d.style.opacity = Math.min(1, s * 1.5); c.d.style.transform = `translate(${cxp}px,${sy}px) translate(-50%,-100%) scale(${s})`;
        }
        (window.CAPTOK || []).forEach((cp) => { if (t < cp.a - 0.1 || t > cp.b + 0.3) return; let act = -1; cp.starts.forEach((s, k) => { if (t >= s) act = k; });
          const grp_ = cp.groupOf[Math.max(act, 0)];
          cp.spans.forEach((sp, k) => { const on = k === act; sp.style.display = cp.groupOf[k] === grp_ ? "inline-block" : "none"; sp.style.opacity = k <= act ? 1 : 0.6; sp.style.color = night > 0.5 ? (on ? "#ffd66b" : "#ffffff") : (on ? "#5b3fd0" : "#2f2e7a"); }); });
        grainEl.style.backgroundPosition = `${(Math.round(t * 30) % 7) * 37}px ${(Math.round(t * 30) % 5) * 53}px`;
        renderer.render(scene, cam);
        fxbCtx.clearRect(0, 0, 540, 960); fxbCtx.drawImage(glCanvas, 0, 0, 540, 960);
        fxgCtx.clearRect(0, 0, 270, 480); fxgCtx.drawImage(glCanvas, 0, 0, 270, 480);
      }
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
      document.fonts.ready.then(() => renderAt(window.__hfThreeTime || 0));
      renderAt(window.__hfThreeTime || 0);
