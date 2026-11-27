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
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const barUpd = (b, h, t, t0) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; };
      const flame = (p, x, y, z, s = 1) => { const g = grp(p, x, y, z); g.scale.setScalar(s); const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 12), emis(P.orange, 1.4)); c1.position.y = 1.3; g.add(c1); const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 12), emis(P.gold, 1.6)); c2.position.y = 0.8; g.add(c2); return g; };
      function pump(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(1.9, 4.2, 1.5, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.2 })); sc.position.set(0, 3.2, 0.77); g.add(sc); const hs = cyl(0.14, 0.14, 2.4, "#10181b", 8, mat("#10181b", { roughness: 0.6 })); hs.rotation.z = Math.PI / 2; hs.position.set(1.3, 1.6, 0); g.add(hs); return g; }

      /* 1 · thermo : inflation 3.4 %, driven by energy */
      const hTh = grp(PL.thermo); const tbT = cyl(0.55, 0.55, 8.4, "#e8f2f7", 18, mat("#e8f2f7", { roughness: 0.2, transparent: true, opacity: 0.45 })); tbT.position.set(-1.8, 4.6, 0); hTh.add(tbT); const bbT = sph(1.1, P.red, 18, mat(P.red, { roughness: 0.3 })); bbT.position.set(-1.8, 0.6, 0); hTh.add(bbT); const flT = rb(0.5, 1, 0.5, P.red, 0.2, mat(P.red, { roughness: 0.3 })); flT.position.set(-1.8, 0.6, 0); hTh.add(flT); [0, 1, 2, 3, 4, 5, 6].forEach((i) => put(hTh, rb(0.9, 0.08, 0.1, "#9fb3c8", 0.01), -0.7, 1.4 + i * 1.0, 0)); const fmT = flame(hTh, 4.4, 0, 0, 1.2);
      ANCH.th_t = () => V(-1.8, 9.6, 0); ANCH.th_f = () => V(4.4, 4.2, 0); wrapAnch(["th_t", "th_f"], PL.thermo); lampAt(hTh, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("thermo", hTh, t); const k = pop(t, TT.th_on, 0.6); bbT.scale.setScalar(Math.max(0.001, k)); bbT.visible = k > 0.01; tbT.scale.set(1, Math.max(0.001, k), 1); tbT.visible = k > 0.01; const f = eInOut(prog(t, TT.th_on + 0.3, 1.2)); flT.scale.y = Math.max(0.001, 6.8 * f); flT.visible = f > 0.01; const s = pop(t, TT.fl_on, 0.5); fmT.scale.setScalar(1.2 * s); fmT.visible = s > 0.01; fmT.rotation.y = t * 1.5; });

      /* 2 · mois : September 3.1 %, October 3.4 % */
      const hMo = grp(PL.mois); const bm1 = barMk(hMo, -3.6, 0, 2.8, P.gold), bm2 = barMk(hMo, 3.6, 0, 2.8, P.red);
      ANCH.mo_a = () => V(-3.6, 6.4, 0); ANCH.mo_b = () => V(3.6, 7.0, 0); wrapAnch(["mo_a", "mo_b"], PL.mois); lampAt(hMo, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("mois", hMo, t); barUpd(bm2, 6.1, t, TT.b_oct); barUpd(bm1, 5.6, t, TT.b_sep); });

      /* 3 · energie : energy +21.3 % then +24.1 % */
      const hEn = grp(PL.energie); const be1 = barMk(hEn, -3.6, 0, 2.8, P.gold), be2 = barMk(hEn, 3.6, 0, 2.8, P.red); const fe = flame(hEn, 3.6, 7.0, 0, 0.9);
      ANCH.en_a = () => V(-3.6, 6.4, 0); ANCH.en_b = () => V(3.6, 10.2, 0); wrapAnch(["en_a", "en_b"], PL.energie); lampAt(hEn, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("energie", hEn, t); barUpd(be2, 6.0, t, TT.e_oct); barUpd(be1, 5.3, t, TT.e_sep); const s = pop(t, TT.e_oct + 0.4, 0.5); fe.scale.setScalar(0.9 * s); fe.visible = s > 0.01; fe.rotation.y = t * 1.5; });

      /* 4 · detail : oil +38.5 %, gas +27.1 %, electricity +2.7 % */
      const hDe = grp(PL.detail); const bp = barMk(hDe, -4.8, 0, 2.4, "#2a2f45", { roughness: 0.3, metalness: 0.4 }), bg = barMk(hDe, 0, 0, 2.4, P.orange), bl = barMk(hDe, 4.8, 0, 2.4, P.green);
      ANCH.de_p = () => V(-4.8, 7.4, 0); ANCH.de_g = () => V(0, 5.4, 0); ANCH.de_e = () => V(4.8, 1.8, 0); wrapAnch(["de_p", "de_g", "de_e"], PL.detail); lampAt(hDe, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("detail", hDe, t); barUpd(bp, 6.5, t, TT.pe_on); barUpd(bg, 4.6, t, TT.ga_on); barUpd(bl, 0.5, t, TT.el_on); });

      /* 5 · poids : energy is 7.6 % of the basket, about 1.8 points of the 3.4 */
      const hPo = grp(PL.poids); const pyP = pieMake(hPo, [[0.076, P.gold, { roughness: 0.25 }], [0.924, "#7b8794", { roughness: 0.4 }]], 3.2, 0.4); pyP.g.position.set(-4.2, 0, 0); const cgP = grp(hPo, 4.2, 0, 0); const sgA = rb(2.8, 1, 2.8, "#7b8794", 0.1, mat("#7b8794", { roughness: 0.35 })), sgB = rb(2.8, 1, 2.8, P.red, 0.1, mat(P.red, { roughness: 0.3 })); cgP.add(sgA); cgP.add(sgB);
      ANCH.po_pie = () => V(-4.2, 3.6, 0); ANCH.po_col = () => V(4.2, 6.4, 0); wrapAnch(["po_pie", "po_col"], PL.poids); lampAt(hPo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("poids", hPo, t); pyP.g.visible = t >= TT.po_on - 0.05; pyP.g.scale.setScalar(pop(t, TT.po_on, 0.7)); const k1 = pop(t, TT.col_on, 0.6), k2 = pop(t, TT.col_on + 0.3, 0.6); sgA.scale.y = Math.max(0.001, 2.5 * k1); sgA.visible = k1 > 0.01; sgB.position.y = 2.5 * k1; sgB.scale.y = Math.max(0.001, 2.94 * k2); sgB.visible = k2 > 0.01; });

      /* 6 · calme : food +1.2 %, services +2.6 %, manufactured goods -0.2 % */
      const hCa = grp(PL.calme); const bf = barMk(hCa, -5.0, 0, 2.4, P.green), bs = barMk(hCa, -0.2, 0, 2.4, P.blue), bmn = barMk(hCa, 4.6, 0, 2.4, P.red);
      ANCH.ca_f = () => V(-5.0, 3.4, 0); ANCH.ca_s = () => V(-0.2, 5.6, 0); ANCH.ca_m = () => V(4.6, 1.8, 0); wrapAnch(["ca_f", "ca_s", "ca_m"], PL.calme); lampAt(hCa, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("calme", hCa, t); barUpd(bf, 1.9, t, TT.fo_on); barUpd(bs, 4.2, t, TT.sv_on); barUpd(bmn, 0.4, t, TT.mf_on); });

      /* 7 · sousjacente : headline 3.4 % against core 1.7 % */
      const hSo = grp(PL.sousjacente); const bh = barMk(hSo, -3.6, 0, 2.8, P.red), bc = barMk(hSo, 3.6, 0, 2.8, P.green);
      ANCH.so_h = () => V(-3.6, 6.8, 0); ANCH.so_c = () => V(3.6, 4.0, 0); wrapAnch(["so_h", "so_c"], PL.sousjacente); lampAt(hSo, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("sousjacente", hSo, t); barUpd(bh, 5.4, t, TT.so_on); barUpd(bc, 2.7, t, TT.sj_on); });

      /* 8 · vous : fuel, gas and the energy bill */
      const hVo = grp(PL.vous); const pmV = pump(hVo, -3.6, 0); const vnV = van(hVo, "#e8e2d2", 1.2); vnV.position.set(3.8, 0, 1.0); const fwV = flow(hVo, 4, 0.3); const fgV = flame(hVo, 3.8, 3.6, -1.6, 0.8);
      ANCH.vo_pump = () => V(-3.6, 5.2, 0); ANCH.vo_bill = () => V(3.8, 6.0, 0); wrapAnch(["vo_pump", "vo_bill"], PL.vous); lampAt(hVo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("vous", hVo, t); pmV.scale.setScalar(pop(t, TT.pu_on, 0.5)); vnV.scale.setScalar(1.2 * pop(t, TT.pu_on + 0.2, 0.5)); const s = pop(t, TT.gz_on, 0.5); fgV.scale.setScalar(0.8 * s); fgV.visible = s > 0.01; fgV.rotation.y = t * 1.5; flowUpd(fwV, t, TT.fa_on, 1e9, [3.8, 2.4, 1.0], [-3.6, 3.0, 0], 0.45); });

      /* 9 · calendrier : the November estimate is published on 27 November */
      const hCl = grp(PL.calendrier); const calC = grp(hCl, -2.6, 0, 0); put(calC, rb(4.4, 4.6, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calC, rb(4.4, 1.0, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 3.6, 0); [-1.3, 1.3].forEach((rx) => put(calC, rb(0.2, 0.7, 0.3, "#1b2a44", 0.05), rx, 4.4, 0)); const ckC = clockObj(hCl, 0.9); ckC.g.position.set(4.2, 3.0, 0);
      ANCH.cl_cal = () => V(-2.6, 6.2, 0); ANCH.cl_ck = () => V(4.2, 5.6, 0); wrapAnch(["cl_cal", "cl_ck"], PL.calendrier); lampAt(hCl, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("calendrier", hCl, t); calC.scale.setScalar(pop(t, TT.cl_on, 0.6)); ckC.g.scale.setScalar(0.9 * pop(t, TT.ck_on, 0.5)); ckC.h1.rotation.z = -t * 0.8; ckC.h2.rotation.z = -t * 2.4; });

      /* 10 · retenez : huge gaps between products */
      const hRe = grp(PL.retenez); const hts = [6.2, 4.3, 0.45, 0.2, 0.15], cls = [P.orange, "#2a6fd6", P.green, P.gold, P.red]; const brs = hts.map((h, i) => barMk(hRe, -5.4 + i * 2.7, 0, 1.8, cls[i]));
      ANCH.re_all = () => V(0, 7.6, 0); wrapAnch(["re_all"], PL.retenez); lampAt(hRe, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("retenez", hRe, t); brs.forEach((b, i) => barUpd(b, hts[i], t, TT.re_on + i * 0.12)); });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
