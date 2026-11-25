      /* =====================================================================
         WORLD : a moving-company yard, real CC0 models (Poly Haven) + custom-built pieces, PBR lighting.
         Places sit on a ring, so the last camera glide goes back to the first shot (the Short loops).
         ===================================================================== */
      const rn = rng(67);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n) => { PL[n] = grp(scene, B.pos[n][0], 0, B.pos[n][1]); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });
      const pop = (t, t0, d = 0.45) => Math.max(0.001, eOutBack(prog(t, t0, d)));

      /* textures (Poly Haven CC0): polished office tiles for the floor */
      const texL = new THREE.TextureLoader(); const loadTex = async (u, srgb) => { const t_ = await texL.loadAsync(u); t_.wrapS = t_.wrapT = THREE.RepeatWrapping; if (srgb) t_.colorSpace = THREE.SRGBColorSpace; t_.anisotropy = 4; return t_; };
      const [fR, fN] = await Promise.all([loadTex("assets/tex/smooth_concrete_floor_rough.jpg"), loadTex("assets/tex/smooth_concrete_floor_nor.jpg")]);
      [fR, fN].forEach((t_) => t_.repeat.set(70, 70));
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughnessMap: fR, normalMap: fN, normalScale: new THREE.Vector2(0.6, 0.6), color: "#4d535b", roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.set(B.ringC[0], -0.02, B.ringC[1]); floor.receiveShadow = true; scene.add(floor);

      /* far skyline behind a glass wall, mint bokeh, a ring of soft floor lights per place */
      const backdrop = grp(scene); const sil = M("#1b2a44", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.green, P.gold, P.sky][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 12; i++) { const w = 8 + rn() * 6, h = 10 + rn() * 18; const b = rb(w, h, 8, "#1b2a44", 0.2, sil); b.position.set(-80 + i * 14 + rn() * 4, 0, -190 - rn() * 20); backdrop.add(b); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) { if (rn() > 0.55) continue; const wn = rb(1.2, 1.0, 0.2, P.gold, 0.05, emis(P.gold, 0.5)); wn.castShadow = false; wn.position.set(b.position.x + (c - 1) * 2.6, 2 + r * 2.8, b.position.z + 4.1); backdrop.add(wn); } }
      const rugs = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#202c44", roughness: 0.95, metalness: 0 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.012; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 8, 72), emis(P.green, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); rugs.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders (custom, PBR) ---- */
      const mat = (hex, o = {}) => M(hex, Object.assign({ roughness: 0.6, metalness: 0.05 }, o));
      function worker(p, vest = P.orange, s = 1) { const g = grp(p); g.scale.setScalar(s);
        const uni = mat("#2a3f5f", { roughness: 0.85 }), skin = mat("#f0c9a8", { roughness: 0.7 });
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 6, 14), uni); torso.position.y = 1.18; torso.castShadow = true; g.add(torso);
        const vs = new THREE.Mesh(new THREE.CapsuleGeometry(0.335, 0.5, 6, 14), mat(vest, { roughness: 0.55 })); vs.position.y = 1.2; vs.scale.set(1, 1, 0.78); vs.castShadow = true; g.add(vs);
        [0.98, 1.22].forEach((y) => { const st = rb(0.7, 0.07, 0.5, "#dfe6e8", 0.02, mat("#dfe6e8", { roughness: 0.25, metalness: 0.7 })); st.position.set(0, y, 0); st.scale.set(1, 1, 0.8); g.add(st); });
        const head = sph(0.24, "#f0c9a8", 14, skin); head.position.y = 1.85; g.add(head); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat("#ffffff", { roughness: 0.5 })); cap.position.y = 1.9; cap.castShadow = true; g.add(cap); put(g, rb(0.3, 0.04, 0.22, "#ffffff", 0.02), 0, 1.92, 0.22);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.55, 0); put(q, rb(0.15, 0.55, 0.15, "#2a3f5f", 0.07, uni), 0, -0.55, 0); const gl = sph(0.1, "#f2c230", 8, mat("#f2c230", { roughness: 0.8 })); gl.position.y = -0.58; q.add(gl); return q; };
        const leg = (sx) => { const l = grp(g, sx * 0.15, 0.78, 0); put(l, rb(0.2, 0.78, 0.2, "#1f2c44", 0.08, mat("#1f2c44", { roughness: 0.9 })), 0, -0.78, 0); put(l, rb(0.22, 0.1, 0.32, "#10181b", 0.04, mat("#10181b", { roughness: 0.6 })), 0, -0.78, 0.04); return l; };
        return { g, body: vs, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      const GOLD = () => mat("#e6b422", { roughness: 0.28, metalness: 0.95 });
      const coinM = (r = 0.5) => { const m = cyl(r, r, 0.14, P.gold, 24, GOLD()); return m; };
      function office(p, w, h, d, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(w, h, d, hex, 0.12, mat(hex, { roughness: 0.35, metalness: 0.25 })), 0, 0, 0); const cols = Math.max(2, Math.round(w / 1.5)), rows = Math.max(2, Math.round(h / 1.8)); for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const wn = rb(0.8, 0.9, 0.08, P.sky, 0.03, new THREE.MeshStandardMaterial({ color: "#bfe6f0", emissive: P.sky, emissiveIntensity: 0.55, roughness: 0.1, metalness: 0.2 })); wn.castShadow = false; wn.position.set((c - (cols - 1) / 2) * (w / cols), 0.8 + r * (h - 1.2) / rows, d / 2 + 0.02); g.add(wn); } return g; }
      function van(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.6, 1.5, 1.4, hex, 0.2, mat(hex, { roughness: 0.25, metalness: 0.4 })), 0, 0.4, 0); put(g, rb(1.0, 1.0, 1.3, "#bfe6f0", 0.15, mat("#9fd0e0", { roughness: 0.05, metalness: 0.3 })), 1.6, 0.4, 0); [[-0.8], [0.8], [1.8]].forEach(([x]) => { const w = cyl(0.38, 0.38, 1.5, P.navy, 18, mat("#101820", { roughness: 0.9 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, 0); g.add(w); const hub = cyl(0.2, 0.2, 1.55, P.gray, 12, mat("#c8d2d6", { roughness: 0.3, metalness: 0.9 })); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.38, 0); g.add(hub); }); return g; }
      function pieMake(p, parts, r = 4.2, ang0 = 0.3) { const g = grp(p); const sl = []; parts.reduce((ang, [f, col, o]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 48, 1, false, ang, len), mat(col, o || { roughness: 0.3 })); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; g.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, ang0); put(g, cyl(r + 0.3, r + 0.4, 0.3, P.cream, 48, mat("#f7f1e6", { roughness: 0.3 })), 0, -0.05, 0); return { g, sl }; }
      function clockObj(p, s = 1) { const g = grp(p); g.scale.setScalar(s); const rim = cyl(2.6, 2.6, 0.5, P.gold, 40, GOLD()); rim.rotation.x = Math.PI / 2; g.add(rim); const face = cyl(2.3, 2.3, 0.3, P.cream, 40, mat("#f6fbf9", { roughness: 0.35 })); face.rotation.x = Math.PI / 2; face.position.z = 0.3; g.add(face);
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const tk = rb(0.12, i % 3 ? 0.3 : 0.5, 0.12, P.navy, 0.03); tk.position.set(Math.sin(a) * 1.9, Math.cos(a) * 1.9 - 0.2, 0.5); tk.rotation.z = -a; g.add(tk); }
        const h1 = grp(g, 0, 0, 0.55), h2 = grp(g, 0, 0, 0.62); put(h1, rb(0.18, 1.3, 0.1, P.navy, 0.04), 0, 0, 0); put(h2, rb(0.12, 1.9, 0.1, P.red, 0.03), 0, 0, 0); return { g, h1, h2 }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 32, mat("#1b2a44", { roughness: 0.4 })), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 8, 48), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 8) => { const g = grp(p); const a = rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), b = rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };
      const lampAt = (p, x, y, z, k = 14, col = "#fff4dc") => { const l = new THREE.PointLight(col, k, 26, 1.6); l.position.set(x, y, z); p.add(l); return l; };

      const coinTowerMk = (p, x, z, n = 16) => { const g = grp(p, x, 0, z); const cs = []; for (let k = 0; k < n; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); g.add(c); cs.push(c); } return { g, cs }; };
      const coinTowerUpd = (tw, t, t0, st = 0.07) => tw.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * st, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; });
      const mkWave = (p, n = 21) => { const g = grp(p); const pil = []; for (let k = 0; k < n; k++) { const col = k % 2 ? "#6b7480" : "#8e99a6"; const b = rb(0.7, 1, 2.2, col, 0.12, mat(col, { roughness: 0.3, metalness: 0.15 })); b.position.set(-10 + k * (20 / (n - 1)), 0, 0); g.add(b); pil.push(b); } const H = (x, t) => 2.6 + 2.0 * Math.sin(x * 0.5 - t * 1.6); return { g, pil, H }; };
      const waveUpd = (wv, t, t0) => wv.pil.forEach((b) => { const k = pop(t, t0, 0.6); const h = Math.max(0.05, wv.H(b.position.x, t)) * k; b.scale.y = h; b.visible = k > 0.01; });
      const arrowDown = (p, x, y, z) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0.9, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(P.red, { roughness: 0.35 })); hd.rotation.x = Math.PI; hd.rotation.y = Math.PI / 4; hd.position.y = 0.5; hd.castShadow = true; a.add(hd); return a; };
      const flow = (p, n = 4, r = 0.32) => { const a = []; for (let k = 0; k < n; k++) { const c = coinM(r); c.visible = false; p.add(c); a.push(c); } return a; };
      const flowUpd = (a, t, t0, t1, f, to, sp = 0.5) => a.forEach((c, k) => { const u = (((t - t0) * sp + k / a.length) % 1 + 1) % 1; c.visible = t >= t0 && t < t1; c.position.set(f[0] + (to[0] - f[0]) * u, f[1] + (to[1] - f[1]) * u + Math.sin(u * Math.PI) * 1.6, f[2] + (to[2] - f[2]) * u); c.rotation.x = t * 5; });
      function person(p, col = P.sky, s = 1) { const g = grp(p); g.scale.setScalar(s); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), mat(col, { roughness: 0.6 })); b.position.y = 0.75; b.castShadow = true; g.add(b); const h = sph(0.24, "#f0c9a8", 12, mat("#f0c9a8", { roughness: 0.7 })); h.position.y = 1.5; g.add(h); return g; }
      const arrowUp = (p, x, y, z, col = P.green) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, col, 0.18, mat(col, { roughness: 0.35 })), 0, 0, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(col, { roughness: 0.35 })); hd.rotation.y = Math.PI / 4; hd.position.y = 3.6; hd.castShadow = true; a.add(hd); return a; };
      const barMk = (p, x, z, w, col) => { const b = rb(w, 1, w, col, 0.12, mat(col, { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      function cart(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(2.4, 1.0, 1.6, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0.7, 0); put(g, rb(0.2, 1.4, 0.2, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), -1.3, 0.9, 0); [-0.8, 0.8].forEach((wx) => { const w = cyl(0.3, 0.3, 0.2, "#10181b", 14, mat("#10181b", { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.3, 0.9); g.add(w); const w2 = w.clone(); w2.position.z = -0.9; g.add(w2); }); return g; }
      function container(p, x, y, z, col) { const g = grp(p, x, y, z); put(g, rb(3.2, 1.5, 1.5, col, 0.08, mat(col, { roughness: 0.45, metalness: 0.2 })), 0, 0, 0); for (let i = 0; i < 6; i++) put(g, rb(0.08, 1.4, 1.52, "#0b1220", 0.01, mat("#0b1220")), -1.4 + i * 0.56, 0.05, 0); return g; }
      const stopSign = (p, x, z) => { const g = grp(p, x, 0, z); put(g, rb(0.25, 4.0, 0.25, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0, 0); const o = cyl(1.7, 1.7, 0.3, P.red, 8, mat(P.red, { roughness: 0.3 })); o.rotation.x = Math.PI / 2; o.rotation.y = Math.PI / 8; o.position.set(0, 5.0, 0); g.add(o); put(g, rb(2.0, 0.4, 0.12, P.white, 0.04), 0, 4.8, 0.2); return g; };

      /* 1 · hook : three quarters, almost no movement */
      const hH = grp(PL.hook); const flH = rb(15, 0.3, 8, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flH.position.set(0, 0, 0); hH.add(flH);
      const q1 = barMk(hH, -4.4, 0, 2.4, P.red), q2 = barMk(hH, 0, 0, 2.4, P.gold), q3 = barMk(hH, 4.4, 0, 2.4, P.red); const lnH = rb(14, 0.12, 0.3, P.white, 0.04, emis(P.white, 0.8)); lnH.position.set(0, 0.32, 1.8); hH.add(lnH);
      ANCH.hk_q1 = () => V(-4.4, 2.4, 0); ANCH.hk_q2 = () => V(0, 2.0, 0); ANCH.hk_q3 = () => V(4.4, 2.4, 0); wrapAnch(["hk_q1", "hk_q2", "hk_q3"], PL.hook); lampAt(hH, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("hook", hH, t); flH.scale.setScalar(pop(t, 0.1, 0.5)); [[q1, 1.3, TT.q1_on], [q2, 0.3, TT.q2_on], [q3, 0.8, TT.q3_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.5); b.scale.y = Math.max(0.001, h * 1.4 * k); b.visible = k > 0.01; }); lnH.scale.x = pop(t, TT.q3_on + 0.3, 0.6); });

      /* 2 · pib : a quarter of production (coin tower) that shrinks a little */
      const hP = grp(PL.pib); const ofP = office(hP, 4.2, 4.6, 3.4, "#3b4a6b", 1); ofP.position.set(-4.4, 0, -1.0); const ctP = coinTowerMk(hP, 3.8, 0, 14); const adP = arrowDown(hP, 3.8, 6.4, 0);
      ANCH.pb_tower = () => V(3.8, 4.2, 0); ANCH.pb_office = () => V(-4.4, 5.4, -1.0); wrapAnch(["pb_tower", "pb_office"], PL.pib); lampAt(hP, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("pib", hP, t); ofP.scale.setScalar(pop(t, TT.pib_on, 0.6)); coinTowerUpd(ctP, t, TT.tw_on, 0.08); ctP.cs.forEach((c, k) => { if (k >= 12 && t > TT.fall_on) c.visible = false; }); const a = pop(t, TT.fall_on, 0.5); adP.scale.setScalar(a); adP.visible = a > 0.01; adP.position.y = 6.4 + Math.sin(t * 3) * 0.25; });

      /* 3 · conso : households keep spending (+0.4 %) */
      const hK = grp(PL.conso); const prK = [P.sky, P.pink, P.violet, P.green].map((c, i) => person(hK, c, 1.15)); prK.forEach((pp, i) => pp.position.set(-5 + i * 1.7, 0, 1.2)); const ctK = cart(hK, 3.8, 0.4, 1.4); const auK = arrowUp(hK, 0.6, 1.2, -2.6); const flK = flow(hK, 4, 0.3);
      ANCH.cs_hh = () => V(-3.4, 3.4, 1.2); ANCH.cs_cart = () => V(3.8, 3.4, 0.4); wrapAnch(["cs_hh", "cs_cart"], PL.conso); lampAt(hK, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("conso", hK, t); prK.forEach((pp, i) => { const k = pop(t, TT.cons_on + i * 0.12, 0.45); pp.scale.setScalar(1.15 * k); pp.position.y = Math.max(0, Math.sin(t * 3 + i)) * 0.15; }); ctK.scale.setScalar(1.4 * pop(t, TT.cart_on, 0.5)); const a = pop(t, TT.up_on, 0.6); auK.scale.setScalar(a); auK.visible = a > 0.01; flowUpd(flK, t, TT.cart_on + 0.2, 1e9, [-3.4, 2.6, 1.2], [3.8, 2.0, 0.4], 0.45); });

      /* 4 · export : containers and a van, exports fall by 0.6 point */
      const hX2 = grp(PL.export); const cn1 = container(hX2, -3.6, 0, -1.2, "#e0643a"), cn2 = container(hX2, -3.6, 1.55, -1.2, "#3b8ad6"), cn3 = container(hX2, -3.6, 0, 1.0, "#43a98a"); const vnX = van(hX2, "#e8e2d2", 1.2); vnX.position.set(3.6, 0, 1.2); const adX = arrowDown(hX2, 3.6, 6.0, -0.8);
      ANCH.ex_cont = () => V(-3.6, 3.6, -0.2); ANCH.ex_van = () => V(3.6, 3.4, 1.2); wrapAnch(["ex_cont", "ex_van"], PL.export); lampAt(hX2, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("export", hX2, t); [cn1, cn2, cn3].forEach((c, i) => c.scale.setScalar(pop(t, TT.exp_on + i * 0.15, 0.5))); vnX.scale.setScalar(1.2 * pop(t, TT.exp_on + 0.5, 0.5)); vnX.position.x = 3.6 + Math.sin(t * 1.6) * 0.5; const a = pop(t, TT.expdown_on, 0.5); adX.scale.setScalar(a); adX.visible = a > 0.01; adX.position.y = 6.0 + Math.sin(t * 3) * 0.25; });

      /* 5 · voisins : France lags behind Germany (+0.2 %) and Spain (+0.6 %) */
      const hN = grp(PL.voisins); const flN = rb(15, 0.3, 8, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flN.position.set(0, 0, 0); hN.add(flN); const bFR = barMk(hN, -4.6, 0, 2.4, P.red), bDE = barMk(hN, 0, 0, 2.4, P.gold), bES = barMk(hN, 4.6, 0, 2.4, P.green);
      ANCH.nb_fr = () => V(-4.6, 2.2, 0); ANCH.nb_de = () => V(0, 4.0, 0); ANCH.nb_es = () => V(4.6, 7.6, 0); wrapAnch(["nb_fr", "nb_de", "nb_es"], PL.voisins); lampAt(hN, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("voisins", hN, t); flN.scale.setScalar(pop(t, TT.nb_on, 0.5)); [[bFR, 0.6, TT.nb_on + 0.1], [bDE, 2.2, TT.de_on], [bES, 6.2, TT.es_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); });

      /* 6 · recession : the textbook definition needs two falls in a row; France had a flat quarter in between */
      const hQ = grp(PL.recession); const tile = (p, x, z, col) => { const b = rb(2.6, 0.5, 2.6, col, 0.12, mat(col, { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const dfA = tile(hQ, -1.6, -3.4, P.red), dfB = tile(hQ, 1.6, -3.4, P.red), frA = tile(hQ, -3.6, 3.0, P.red), frB = tile(hQ, 0, 3.0, P.gold), frC = tile(hQ, 3.6, 3.0, P.red); const xQ = cross(hQ, 4.0); xQ.position.set(0, 6.0, 3.0);
      ANCH.rc_def = () => V(0, 2.2, -3.4); ANCH.rc_fr = () => V(0, 2.4, 3.0); wrapAnch(["rc_def", "rc_fr"], PL.recession); lampAt(hQ, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("recession", hQ, t); [[dfA, TT.def_on], [dfB, TT.def_on + 0.3], [frA, TT.fr_on], [frB, TT.flat_on], [frC, TT.fr_on + 0.4]].forEach(([b, t0]) => { const k = pop(t, t0, 0.5); b.scale.setScalar(k); b.visible = k > 0.01; }); const x = pop(t, TT.flat_on + 0.5, 0.5); xQ.scale.setScalar(x); xQ.visible = x > 0.01; });

      /* 7 · ministre : a lectern and a stop sign */
      const hM = grp(PL.ministre); const pdM = put(hM, rb(2.6, 2.0, 1.6, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4 })), -3.4, 0, 0); const pmM = person(hM, P.sky, 1.4); pmM.position.set(-3.4, 2.0, -0.3); const ssM = stopSign(hM, 3.6, 0);
      ANCH.mn_pers = () => V(-3.4, 5.6, 0); ANCH.mn_stop = () => V(3.6, 8.0, 0); wrapAnch(["mn_pers", "mn_stop"], PL.ministre); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("ministre", hM, t); const k = pop(t, TT.min_on, 0.5); pdM.scale.setScalar(k); pmM.scale.setScalar(1.4 * k); const s = pop(t, TT.stop_on, 0.6); ssM.scale.setScalar(s); ssM.visible = s > 0.01; ssM.rotation.z = Math.sin(t * 3) * 0.03 * s; });

      /* 8 · menage : what zero growth means for wages, jobs and public revenue */
      const hY = grp(PL.menage); const ctY = coinTowerMk(hY, -5.0, 0, 8); const prY = [P.sky, P.pink, P.violet].map((c, i) => person(hY, c, 1.1)); prY.forEach((pp, i) => pp.position.set(-1.0 + i * 1.3, 0, 0)); const ofY = office(hY, 3.6, 4.2, 3.0, "#3b4a6b", 1); ofY.position.set(5.0, 0, -0.4); const adY = [arrowDown(hY, -5.0, 6.0, 0), arrowDown(hY, 0.3, 4.4, 0), arrowDown(hY, 5.0, 7.4, -0.4)]; adY.forEach((a) => a.scale.setScalar(0.6));
      ANCH.my_sal = () => V(-5.0, 4.0, 0); ANCH.my_emb = () => V(0.3, 3.2, 0); ANCH.my_etat = () => V(5.0, 5.6, -0.4); wrapAnch(["my_sal", "my_emb", "my_etat"], PL.menage); lampAt(hY, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("menage", hY, t); coinTowerUpd(ctY, t, TT.m_on, 0.08); prY.forEach((pp, i) => { const k = pop(t, TT.m_on + 0.4 + i * 0.12, 0.45); pp.scale.setScalar(1.1 * k); }); ofY.scale.setScalar(pop(t, TT.m_on + 0.7, 0.6)); [TT.sal_on + 0.7, TT.emb_on + 0.6, TT.etat_on + 0.5].forEach((t0, i) => { const a = pop(t, t0, 0.5); adY[i].scale.setScalar(0.6 * a); adY[i].visible = a > 0.01; }); });

      /* 9 · estim : first estimates, to be revised on 27 November */
      const hS = grp(PL.estim); const calS = grp(hS, -3.2, 0, 0); put(calS, rb(4.4, 4.6, 0.5, "#f7f1e6", 0.16, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calS, rb(4.4, 1.0, 0.55, P.red, 0.16, mat(P.red, { roughness: 0.35 })), 0, 3.6, 0); [-1.3, 1.3].forEach((rx) => put(calS, rb(0.2, 0.7, 0.3, "#1b2a44", 0.05), rx, 4.4, 0));
      const shS = [0, 1, 2].map((i) => { const s = rb(3.2, 0.12, 4.2, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })); s.position.set(3.8, i * 0.14, 0.2); s.rotation.y = (i - 1) * 0.18; hS.add(s); return s; }); const pnS = cyl(0.14, 0.14, 2.6, P.gold, 8, mat(P.gold, { roughness: 0.3 })); pnS.rotation.z = Math.PI / 2.6; pnS.position.set(4.2, 0.9, 0.2); hS.add(pnS);
      ANCH.es_cal = () => V(-3.2, 5.6, 0); ANCH.es_sh = () => V(3.8, 1.8, 0.2); wrapAnch(["es_cal", "es_sh"], PL.estim); lampAt(hS, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("estim", hS, t); calS.scale.setScalar(pop(t, TT.est_on, 0.6)); shS.forEach((s, i) => { s.scale.setScalar(pop(t, TT.rev_on + i * 0.1, 0.5)); }); pnS.visible = t >= TT.rev_on; pnS.position.x = 4.2 + Math.sin(t * 4) * 0.3; });

      /* 10 · verdict : every point counts, one coin above the flat stack */
      const hV = grp(PL.verdict); pedestal(hV, 6); const ctV = coinTowerMk(hV, 0, 0, 9); ctV.g.scale.setScalar(1.8); const cnV = coinM(1.6); cnV.rotation.x = Math.PI / 2; cnV.material = emis(P.gold, 1.2); hV.add(cnV);
      ANCH.vr_top = () => V(0, 8.4, 0); wrapAnch(["vr_top"], PL.verdict); lampAt(hV, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("verdict", hV, t); coinTowerUpd(ctV, t, TT.ver_on, 0.06); const k = pop(t, TT.pt_on, 0.6); cnV.scale.setScalar(Math.max(0.001, k)); cnV.visible = k > 0.01; cnV.position.set(0, 4.8 + Math.sin(t * 2.5) * 0.35, 0); cnV.rotation.z = t * 1.5; });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
