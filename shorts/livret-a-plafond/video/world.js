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
      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      function cart(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(2.4, 1.0, 1.6, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0.7, 0); put(g, rb(0.2, 1.4, 0.2, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), -1.3, 0.9, 0); [-0.8, 0.8].forEach((wx) => { const w = cyl(0.3, 0.3, 0.2, "#10181b", 14, mat("#10181b", { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.3, 0.9); g.add(w); const w2 = w.clone(); w2.position.z = -0.9; g.add(w2); }); return g; }
      function safe(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(4.0, 3.6, 3.2, "#2a3a55", 0.18, mat("#2a3a55", { roughness: 0.3, metalness: 0.6 })), 0, 0, 0); put(g, rb(3.2, 2.8, 0.2, "#3b4f73", 0.1, mat("#3b4f73", { roughness: 0.3, metalness: 0.6 })), 0, 0.4, 1.62); const d = cyl(0.7, 0.7, 0.25, P.gold, 24, GOLD()); d.rotation.x = Math.PI / 2; d.position.set(0, 1.8, 1.82); g.add(d); put(g, rb(0.2, 1.2, 0.2, P.gold, 0.05, GOLD()), 0, 1.2, 1.9); return g; }
      function nuke(p, x, z) { const g = grp(p, x, 0, z); const tw = cyl(1.8, 2.8, 6.4, "#cfd6dd", 20, mat("#cfd6dd", { roughness: 0.5 })); tw.position.y = 3.2; g.add(tw); const puffs = [0, 1, 2].map((i) => { const s = sph(1.0 - i * 0.15, "#ffffff", 12, mat("#ffffff", { roughness: 0.9 })); s.position.set(0, 7.4 + i * 1.2, 0); g.add(s); return s; }); put(g, rb(2.4, 2.0, 2.4, "#6b7480", 0.12, mat("#6b7480", { roughness: 0.4 })), 3.6, 0, 0.4); return { g, puffs }; }
      function school(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(4.4, 2.6, 3.2, "#e0b84a", 0.1, mat("#e0b84a", { roughness: 0.5 })), 0, 0, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.4, 4), mat(P.red, { roughness: 0.4 })); rf.rotation.y = Math.PI / 4; rf.position.y = 3.3; rf.castShadow = true; g.add(rf); [-1.4, 0, 1.4].forEach((wx) => put(g, rb(0.8, 1.0, 0.1, P.sky, 0.03, new THREE.MeshStandardMaterial({ color: "#bfe6f0", emissive: P.sky, emissiveIntensity: 0.5 })), wx, 1.0, 1.63)); put(g, rb(0.12, 2.2, 0.12, "#9fb3c8", 0.02), 2.4, 2.6, 0); return g; }

      /* 1 · livret : a savings book and a growing stack of coins */
      const hL = grp(PL.livret); const bkL = grp(hL, -3.4, 0, 0); put(bkL, rb(3.6, 0.7, 4.6, "#2a6fd6", 0.14, mat("#2a6fd6", { roughness: 0.35 })), 0, 0, 0); put(bkL, rb(2.2, 0.72, 1.4, "#ffffff", 0.06, mat("#ffffff", { roughness: 0.4 })), 0, 0, 0.6); put(bkL, rb(0.5, 0.74, 0.5, P.gold, 0.06, GOLD()), 0, 0, -1.2);
      const ctL = coinTowerMk(hL, 3.4, 0, 12); const flL = flow(hL, 4, 0.3);
      ANCH.lv_book = () => V(-3.4, 2.6, 0); ANCH.lv_tower = () => V(3.4, 4.2, 0); wrapAnch(["lv_book", "lv_tower"], PL.livret); lampAt(hL, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("livret", hL, t); bkL.scale.setScalar(pop(t, TT.bk_on, 0.6)); coinTowerUpd(ctL, t, TT.ct_on, 0.1); flowUpd(flL, t, TT.ct_on + 0.4, 1e9, [-3.4, 1.2, 0], [3.4, 3.4, 0], 0.4); });

      /* 2 · nouveau : the ceiling today (22 950), then 25 000 to 30 000 */
      const hN = grp(PL.nouveau); const b1 = barMk(hN, -4.6, 1.6, 2.6, P.gold), b2 = barMk(hN, 0, 1.6, 2.6, P.blue), b3 = barMk(hN, 4.6, 1.6, 2.6, P.green);
      const calN = grp(hN, 0, 0, -6.4); calN.scale.setScalar(0.85); put(calN, rb(3.6, 3.6, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calN, rb(3.6, 0.9, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 2.8, 0);
      ANCH.nv_b1 = () => V(-4.6, 5.4, 1.6); ANCH.nv_b2 = () => V(0, 5.8, 1.6); ANCH.nv_b3 = () => V(4.6, 6.8, 1.6); ANCH.nv_cal = () => V(0, 4.2, -6.4); wrapAnch(["nv_b1", "nv_b2", "nv_b3", "nv_cal"], PL.nouveau); lampAt(hN, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("nouveau", hN, t); [[b1, 4.59, TT.b1_on], [b2, 5.0, TT.b2_on], [b3, 6.0, TT.b3_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); calN.scale.setScalar(0.85 * pop(t, TT.cal_on, 0.6)); });

      /* 3 · avantage : a safe that is tax free */
      const hA = grp(PL.avantage); const sfA = safe(hA, -3.4, 0); const dcA = grp(hA, 4.0, 0, 0.4); put(dcA, rb(3.0, 0.15, 3.8, "#f7f1e6", 0.04, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); put(dcA, rb(2.0, 0.17, 0.2, "#9fb3c8", 0.02), 0, 0, -1.0); put(dcA, rb(2.0, 0.17, 0.2, "#9fb3c8", 0.02), 0, 0, -0.4); const xA = crossX(hA, 5.0); xA.position.set(4.0, 3.2, 0.4); const flA = flow(hA, 4, 0.3);
      ANCH.av_safe = () => V(-3.4, 4.4, 0); ANCH.av_doc = () => V(4.0, 6.4, 0.4); wrapAnch(["av_safe", "av_doc"], PL.avantage); lampAt(hA, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("avantage", hA, t); sfA.scale.setScalar(pop(t, TT.av_on, 0.6)); dcA.scale.setScalar(pop(t, TT.tax_on - 0.4, 0.5)); const x = pop(t, TT.tax_on, 0.5); xA.scale.setScalar(x); xA.visible = x > 0.01; flowUpd(flA, t, TT.av_on + 0.6, 1e9, [-7.5, 4.0, 0.5], [-3.4, 2.4, 1.0], 0.4); });

      /* 4 · plafonnes : 20 savers, 3 of them (about 15 %) already at the ceiling */
      const hQ = grp(PL.plafonnes); const prQ = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const i = r * 5 + c; const gold = i === 2 || i === 7 || i === 12; const pp = person(hQ, gold ? P.gold : P.sky, 1.3); pp.position.set(-4.4 + c * 2.2, 0, -3.2 + r * 2.2); prQ.push({ pp, gold }); }
      ANCH.pl_gold = () => V(-0.0, 3.6, -3.2); ANCH.pl_all = () => V(0, 4.6, 1.0); wrapAnch(["pl_gold", "pl_all"], PL.plafonnes); lampAt(hQ, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("plafonnes", hQ, t); prQ.forEach((o, i) => { const k = pop(t, TT.pl_on + i * 0.05, 0.4); const hi = o.gold ? 1 + 0.35 * pop(t, TT.gold_on, 0.5) : 1; o.pp.scale.setScalar(1.3 * k * hi); o.pp.position.y = o.gold ? Math.max(0, Math.sin(t * 4 + i)) * 0.25 * pop(t, TT.gold_on, 0.5) : 0; }); });

      /* 5 · moitie : 3 savers hold as much as 17 others */
      const hM = grp(PL.moitie); const ctM1 = coinTowerMk(hM, -3.6, 0, 14), ctM2 = coinTowerMk(hM, 3.6, 0, 15); ctM1.g.scale.setScalar(1.5); ctM2.g.scale.setScalar(1.5); const gl = [0, 1, 2].map((i) => { const pp = person(hM, P.gold, 1.1); pp.position.set(-5.3 + i * 1.5, 0, 3.4); return pp; }); const sk = []; for (let i = 0; i < 17; i++) { const pp = person(hM, P.sky, 0.8); pp.position.set(1.2 + (i % 6) * 1.1, 0, 3.0 + Math.floor(i / 6) * 1.1); sk.push(pp); }
      ANCH.mo_l = () => V(-3.6, 6.4, 0); ANCH.mo_r = () => V(3.6, 6.4, 0); wrapAnch(["mo_l", "mo_r"], PL.moitie); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("moitie", hM, t); gl.forEach((g, i) => g.scale.setScalar(1.1 * pop(t, TT.mo_on + i * 0.1, 0.4))); sk.forEach((g, i) => g.scale.setScalar(0.8 * pop(t, TT.mo_on + 0.3 + i * 0.03, 0.4))); coinTowerUpd(ctM1, t, TT.ht_on, 0.07); coinTowerUpd(ctM2, t, TT.ht_on + 0.2, 0.07); });

      /* 6 · etat : savings are funnelled to a nuclear plant and a school */
      const hE = grp(PL.etat); const prE = [P.sky, P.pink, P.violet].map((c, i) => { const pp = person(hE, c, 1.2); pp.position.set(-6.0, 0, -2.0 + i * 2.0); return pp; }); const nkE = nuke(hE, 1.6, -2.2); const scE = school(hE, 3.2, 3.2); const fwE = [0, 1].map(() => flow(hE, 4, 0.3));
      ANCH.et_pers = () => V(-6.0, 3.6, 0); ANCH.et_nuc = () => V(1.6, 9.4, -2.2); ANCH.et_sch = () => V(3.2, 5.6, 3.2); wrapAnch(["et_pers", "et_nuc", "et_sch"], PL.etat); lampAt(hE, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("etat", hE, t); prE.forEach((pp, i) => pp.scale.setScalar(1.2 * pop(t, TT.et_on + i * 0.12, 0.45))); nkE.g.scale.setScalar(pop(t, TT.nuc_on, 0.6)); nkE.puffs.forEach((s, i) => { s.position.y = 7.4 + i * 1.2 + Math.sin(t * 1.5 + i) * 0.2; }); scE.scale.setScalar(pop(t, TT.eco_on, 0.6)); flowUpd(fwE[0], t, TT.fl_on, 1e9, [-6.0, 2.2, 0], [1.6, 5.0, -2.2], 0.4); flowUpd(fwE[1], t, TT.eco_on + 0.3, 1e9, [-6.0, 2.2, 0], [3.2, 2.4, 3.2], 0.4); });

      /* 7 · cout : a tax-free product costs the public purse */
      const hC2 = grp(PL.cout); const ofC = office(hC2, 4.4, 4.8, 3.4, "#3b4a6b", 1); ofC.position.set(-3.4, 0, -0.4); const adC = arrowDown(hC2, -3.4, 7.8, -0.4); const dcC = grp(hC2, 4.0, 0, 0.8); put(dcC, rb(3.0, 0.15, 3.8, "#f7f1e6", 0.04, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); const xC = crossX(hC2, 5.0); xC.position.set(4.0, 3.2, 0.8); const flC = flow(hC2, 5, 0.3);
      ANCH.co_off = () => V(-3.4, 6.2, -0.4); ANCH.co_doc = () => V(4.0, 6.6, 0.8); wrapAnch(["co_off", "co_doc"], PL.cout); lampAt(hC2, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("cout", hC2, t); ofC.scale.setScalar(pop(t, TT.co_on, 0.6)); dcC.scale.setScalar(pop(t, TT.tax2_on, 0.5)); const x = pop(t, TT.tax2_on + 0.2, 0.5); xC.scale.setScalar(x); xC.visible = x > 0.01; const a = pop(t, TT.cost_on, 0.5); adC.scale.setScalar(a); adC.visible = a > 0.01; adC.position.y = 7.8 + Math.sin(t * 3) * 0.25; flowUpd(flC, t, TT.cost_on + 0.2, 1e9, [-3.4, 2.4, -0.4], [4.4, 0.4, 3.2], 0.4); });

      /* 8 · conso : the savings stack grows while the shopping cart shrinks */
      const hK = grp(PL.conso); const ctK = coinTowerMk(hK, -3.8, 0, 12); ctK.g.scale.setScalar(1.4); const cgK = cart(hK, 3.8, 0.2, 1.5);
      ANCH.cs_tower = () => V(-3.8, 5.0, 0); ANCH.cs_cart = () => V(3.8, 3.6, 0.2); wrapAnch(["cs_tower", "cs_cart"], PL.conso); lampAt(hK, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("conso", hK, t); coinTowerUpd(ctK, t, TT.sav_on, 0.12); const sh = 1 - 0.5 * eInOut(prog(t, TT.cons_dn, 1.0)); cgK.scale.setScalar(1.5 * pop(t, TT.cn_on, 0.5) * sh); });

      /* 9 · taux : 1.70 % today, a possible rise (not announced) */
      const hT = grp(PL.taux); const flT = rb(13, 0.3, 7, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flT.position.set(0, 0, 0); hT.add(flT); const bT1 = barMk(hT, -3.0, 0, 2.6, P.gold), bT2 = barMk(hT, 3.0, 0, 2.6, P.green, { roughness: 0.3, transparent: true, opacity: 0.35 });
      ANCH.tx_now = () => V(-3.0, 4.6, 0); ANCH.tx_gh = () => V(3.0, 6.6, 0); wrapAnch(["tx_now", "tx_gh"], PL.taux); lampAt(hT, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("taux", hT, t); flT.scale.setScalar(pop(t, TT.tx_on - 0.3, 0.5)); const k1 = pop(t, TT.tx_on, 0.6); bT1.scale.y = Math.max(0.001, 3.74 * k1); bT1.visible = k1 > 0.01; const k2 = pop(t, TT.gh_on, 0.6); bT2.scale.y = Math.max(0.001, 5.5 * k2); bT2.visible = k2 > 0.01; bT2.material.opacity = 0.3 + 0.12 * Math.sin(t * 4); });

      /* 10 · retenez : more room to save, the same rate */
      const hR = grp(PL.retenez); const trR = rb(8.0, 0.3, 5.0, "#e6dccb", 0.1, mat("#e6dccb", { roughness: 0.4 })); trR.position.set(-2.0, 0, 0); hR.add(trR); const coR = []; for (let i = 0; i < 15; i++) { const c = coinM(0.55); c.position.set(-5.0 + (i % 5) * 1.5, 0.3 + 0.08, -1.4 + Math.floor(i / 5) * 1.4); hR.add(c); coR.push(c); } const bR = barMk(hR, 5.2, 0, 2.2, P.gold);
      ANCH.rt_tray = () => V(-2.0, 3.0, 0); ANCH.rt_bar = () => V(5.2, 5.0, 0); wrapAnch(["rt_tray", "rt_bar"], PL.retenez); lampAt(hR, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("retenez", hR, t); trR.scale.setScalar(pop(t, TT.rt_on, 0.6)); coR.forEach((c, i) => { const k = pop(t, TT.place_on + i * 0.08, 0.4); c.scale.setScalar(Math.max(0.001, k)); c.visible = k > 0.01; }); const k = pop(t, TT.same_on, 0.6); bR.scale.y = Math.max(0.001, 3.74 * k); bR.visible = k > 0.01; });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
