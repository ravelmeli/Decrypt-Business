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
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughnessMap: fR, normalMap: fN, normalScale: new THREE.Vector2(0.6, 0.6), color: "#5a3d22", roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.set(B.ringC[0], -0.02, B.ringC[1]); floor.receiveShadow = true; scene.add(floor);

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

      /* ---- brewery builders (custom PBR) ---- */
      const BEER = "#e8a321", FOAM = "#fff7e0", STEEL = "#c3ccd2";
      const steel = () => mat(STEEL, { roughness: 0.22, metalness: 0.92 });
      function tank(p, x, z, h = 5, r = 1.4) { const g = grp(p, x, 0, z);
        for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; put(g, cyl(0.13, 0.13, 0.9, STEEL, 8, steel()), Math.sin(a) * r * 0.75, 0.45, Math.cos(a) * r * 0.75); }
        put(g, cyl(r, r, h, STEEL, 28, steel()), 0, 0.9 + h / 2, 0); put(g, cyl(0.02, r, r * 0.7, STEEL, 28, steel()), 0, 0.9 + h + r * 0.35, 0); put(g, cyl(r, 0.1, r * 0.5, STEEL, 28, steel()), 0, 0.9 - r * 0.25 + 0.2, 0).visible = false;
        const bd = new THREE.Mesh(new THREE.TorusGeometry(r + 0.03, 0.07, 8, 32), mat(P.gold, { roughness: 0.3, metalness: 0.8 })); bd.rotation.x = Math.PI / 2; bd.position.y = 0.9 + h * 0.5; g.add(bd);
        put(g, cyl(0.28, 0.28, 0.18, P.gold, 12, mat("#b8862a", { roughness: 0.4, metalness: 0.7 })), 0, 0.9 + h + r * 0.75, 0); return g; }
      function mug(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s);
        put(g, cyl(1.25, 1.05, 2.8, BEER, 28, mat(BEER, { roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.92, emissive: "#a8620a", emissiveIntensity: 0.55 })), 0, 1.4, 0);
        for (let i = 0; i < 6; i++) { const a = i * 1.047; put(g, sph(0.52, FOAM, 12, mat(FOAM, { roughness: 0.95 })), Math.sin(a) * 0.7, 2.95 + (i % 2) * 0.15, Math.cos(a) * 0.7); } put(g, sph(0.6, FOAM, 12, mat(FOAM, { roughness: 0.95 })), 0, 3.15, 0);
        const hd = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.18, 10, 24), mat("#d7dde0", { roughness: 0.15, metalness: 0.5 })); hd.position.set(1.55, 1.5, 0); hd.castShadow = true; g.add(hd); return g; }
      function bottle(p, x, z, col = "#7a4a14", s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); const gm = mat(col, { roughness: 0.12, metalness: 0.1, emissive: col, emissiveIntensity: 0.15 });
        put(g, cyl(0.32, 0.32, 1.1, col, 14, gm), 0, 0.55, 0); put(g, cyl(0.12, 0.32, 0.4, col, 14, gm), 0, 1.3, 0); put(g, cyl(0.12, 0.12, 0.45, col, 12, gm), 0, 1.75, 0); put(g, cyl(0.15, 0.15, 0.1, P.gold, 12, mat(P.gold, { roughness: 0.3, metalness: 0.8 })), 0, 2.0, 0); put(g, rb(0.5, 0.45, 0.04, P.cream, 0.02, mat("#f5ecd0", { roughness: 0.5 })), 0, 0.55, 0.32); return g; }
      function house(p, x, z, col = "#c8a574", s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(1.8, 1.3, 1.5, col, 0.1, mat(col, { roughness: 0.7 })), 0, 0, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.9, 4), mat("#9a3b2a", { roughness: 0.6 })); rf.rotation.y = Math.PI / 4; rf.position.y = 1.7; rf.castShadow = true; g.add(rf); put(g, cyl(0.16, 0.16, 0.8, "#6a5a4a", 8), 0.5, 1.4, 0.2); return g; }
      function govt(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(7.2, 0.5, 4.0, "#d9d4c4", 0.06, mat("#d9d4c4", { roughness: 0.5 })), 0, 0, 0); put(g, rb(6.6, 0.4, 3.4, "#e5e0d0", 0.06, mat("#e5e0d0", { roughness: 0.5 })), 0, 0.5, 0);
        for (let i = 0; i < 5; i++) put(g, cyl(0.28, 0.28, 3.0, "#f1ede0", 14, mat("#f1ede0", { roughness: 0.4 })), -2.6 + i * 1.3, 0.9, 0.2); put(g, rb(6.8, 0.4, 3.0, "#e5e0d0", 0.06, mat("#e5e0d0", { roughness: 0.5 })), 0, 3.9, 0.1);
        const pd = new THREE.Mesh(new THREE.ConeGeometry(3.7, 1.3, 3), mat("#d9d4c4", { roughness: 0.5 })); pd.rotation.y = Math.PI / 2; pd.scale.set(1, 1, 0.5); pd.position.y = 5.2; pd.castShadow = true; g.add(pd); return g; }
      const crate = (p, x, y, z, col = "#8a6a3a") => { const g = grp(p, x, y, z); put(g, rb(1.5, 0.8, 1.0, col, 0.06, mat(col, { roughness: 0.8 })), 0, 0, 0); for (let i = 0; i < 3; i++) put(g, cyl(0.17, 0.17, 0.3, "#7a4a14", 8, mat("#7a4a14", { roughness: 0.2 })), -0.45 + i * 0.45, 0.8, 0); return g; };
      const coinTowerMk = (p, x, z, n = 16) => { const g = grp(p, x, 0, z); const cs = []; for (let k = 0; k < n; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); g.add(c); cs.push(c); } return { g, cs }; };
      const coinTowerUpd = (tw, t, t0) => tw.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * 0.07, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; });
      const mkWave = (p, n = 21) => { const g = grp(p); const pil = []; for (let k = 0; k < n; k++) { const col = k % 2 ? "#d98a1c" : "#ffb347"; const b = rb(0.7, 1, 2.2, col, 0.12, mat(col, { roughness: 0.3, metalness: 0.15 })); b.position.set(-10 + k * (20 / (n - 1)), 0, 0); g.add(b); pil.push(b); } const H = (x, t) => 2.6 + 2.0 * Math.sin(x * 0.5 - t * 1.6); return { g, pil, H }; };
      const waveUpd = (wv, t, t0) => wv.pil.forEach((b) => { const k = pop(t, t0, 0.6); const h = Math.max(0.05, wv.H(b.position.x, t)) * k; b.scale.y = h; b.visible = k > 0.01; });
      const arrowDown = (p, x, y, z) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0.9, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(P.red, { roughness: 0.35 })); hd.rotation.x = Math.PI; hd.rotation.y = Math.PI / 4; hd.position.y = 0.5; hd.castShadow = true; a.add(hd); return a; };
      const coinFlow = (arr, t, t0, from, to, n, rise = 3) => arr.forEach((c, k) => { const u = (((t - t0) * 0.55 + k / n) % 1 + 1) % 1; c.visible = t >= t0; c.position.set(lerp(from[0], to[0], u), lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * rise, lerp(from[2], to[2], u)); c.rotation.x = t * 6; });

      /* 1 · brasserie : brewing tanks and a giant glass */
      const hB = grp(PL.brasserie); const tkB = [tank(hB, -5.2, -4.4, 6, 1.6), tank(hB, -1.4, -5.4, 7.5, 1.9), tank(hB, 3.2, -4.6, 5.5, 1.5)]; const mgB = mug(hB, 1.8, 3.6, 1.6); mgB.rotation.y = -0.4;
      ANCH.br_tank = () => V(-1.4, 9.6, -5.4); ANCH.br_mug = () => V(1.8, 7.0, 3.6); wrapAnch(["br_tank", "br_mug"], PL.brasserie); lampAt(hB, 0, 12, 3, 44, "#ffe0b0");
      upd((t) => { showHero("brasserie", hB, t); tkB.forEach((k, i) => { k.scale.setScalar(pop(t, TT.tank_on + i * 0.18, 0.6)); }); mgB.scale.setScalar(1.6 * pop(t, TT.mug_on, 0.7)); mgB.position.y = Math.sin(t * 1.2) * 0.08; });

      /* 2 · invest : small craft setup vs a giant industrial site */
      const hI = grp(PL.invest); const smI = [tank(hI, -8.0, -2.0, 3.0, 0.9), tank(hI, -5.6, -2.0, 3.0, 0.9)]; const ctS = coinTowerMk(hI, -6.8, 3.4, 3); ctS.g.scale.setScalar(0.8);
      const bgI = [0, 1, 2, 3, 4].map((i) => tank(hI, 2.2 + (i % 3) * 3.4, -5.2 + Math.floor(i / 3) * 4.6, 7.5 - (i % 2), 1.5)); const ctB = coinTowerMk(hI, 6.6, 5.4, 18);
      ANCH.in_small = () => V(-6.8, 6.0, -2.0); ANCH.in_big = () => V(5.6, 10.0, -4.0); ANCH.in_coin = () => V(6.6, 4.4, 5.4); wrapAnch(["in_small", "in_big", "in_coin"], PL.invest); lampAt(hI, 0, 13, 2, 44, "#ffe0b0");
      upd((t) => { showHero("invest", hI, t); smI.forEach((k, i) => k.scale.setScalar(pop(t, TT.small_on + i * 0.15, 0.5))); coinTowerUpd(ctS, t, TT.small_on + 0.4); bgI.forEach((k, i) => k.scale.setScalar(pop(t, TT.big_on + i * 0.16, 0.5))); coinTowerUpd(ctB, t, TT.bigcoin_on); });

      /* 3 · materiel : tanks, bottling line, fixed costs to recoup */
      const hM = grp(PL.materiel); const tkM = [tank(hM, -6.0, -5.2, 6.5, 1.6), tank(hM, -1.8, -5.6, 6.5, 1.6)]; put(hM, rb(14.5, 0.5, 2.0, "#3a4150", 0.1, mat("#3a4150", { roughness: 0.55, metalness: 0.6 })), 0, 0.5, 1.2);
      const botM = []; for (let k = 0; k < 12; k++) { const b = bottle(hM, 0, 1.2, k % 3 ? "#7a4a14" : "#2f7a3a", 0.8); b.visible = false; botM.push(b); } const ctM = coinTowerMk(hM, 6.6, -3.4, 18);
      ANCH.ma_tank = () => V(-3.9, 9.4, -5.4); ANCH.ma_belt = () => V(0, 3.4, 1.2); ANCH.ma_fix = () => V(6.6, 4.8, -3.4); wrapAnch(["ma_tank", "ma_belt", "ma_fix"], PL.materiel); lampAt(hM, 0, 12, 4, 44, "#ffe0b0");
      upd((t) => { showHero("materiel", hM, t); tkM.forEach((k, i) => k.scale.setScalar(pop(t, TT.mat_on + i * 0.2, 0.6))); coinTowerUpd(ctM, t, TT.fix_on);
        botM.forEach((b, k) => { const u = (((t - TT.belt_on) * 0.14 + k / 12) % 1 + 1) % 1; const show = t >= TT.belt_on + k * 0.18 && (t < TT.run_on ? k < 4 : t < TT.spread_on ? k < 8 : true); b.visible = show; b.position.set(-6.5 + u * 13, 0.95, 1.2); }); });

      /* 4 · taxes : a glass, coins flowing to the state (accises + TVA), small breweries get a lower rate */
      const hT = grp(PL.taxes); const mgT = mug(hT, -4.4, 2.6, 1.3); const gvT = govt(hT, 3.2, -4.2, 1.0); const flT = []; for (let k = 0; k < 12; k++) { const c = coinM(0.38); c.visible = false; hT.add(c); flT.push(c); }
      const smH = house(hT, 7.2, 5.2, "#d9b38a", 1.1); const tagT = grp(hT, 7.2, 4.6, 5.2); put(tagT, rb(2.6, 1.0, 0.2, P.green, 0.2, mat(P.green, { roughness: 0.3 })), 0, 0, 0); put(tagT, rb(1.6, 0.18, 0.1, P.white, 0.04), 0, 0.42, 0.14);
      ANCH.tx_mug = () => V(-4.4, 5.6, 2.6); ANCH.tx_gov = () => V(3.2, 7.4, -4.2); ANCH.tx_small = () => V(7.2, 6.8, 5.2); wrapAnch(["tx_mug", "tx_gov", "tx_small"], PL.taxes); lampAt(hT, 0, 12, 3, 44, "#fff0d0");
      upd((t) => { showHero("taxes", hT, t); mgT.scale.setScalar(1.3 * pop(t, TT.glass_on, 0.6)); gvT.scale.setScalar(pop(t, TT.gov_on, 0.7)); coinFlow(flT, t, TT.stream_on, [-4.0, 2.4, 2.6], [2.4, 3.6, -3.0], 12, 3.2); smH.scale.setScalar(1.1 * pop(t, TT.low_on, 0.5)); tagT.scale.setScalar(pop(t, TT.low_on + 0.2, 0.5)); });

      /* 5 · marche : 2 500 breweries, craft = 2-3x the price but ~10 % of the volume */
      const hK = grp(PL.marche); const hs = []; for (let i = 0; i < 28; i++) { const cols = ["#c8a574", "#d9b38a", "#b8916a", "#e0c9a6"]; const h_ = house(hK, -8.4 + (i % 7) * 2.8, -7.4 + Math.floor(i / 7) * 2.6, cols[i % 4], 0.85); hs.push(h_); }
      const pieK = pieMake(hK, [[0.1, "#ffb347", { roughness: 0.25 }], [0.9, "#7b8794", { roughness: 0.4 }]], 3.2, 0.4); pieK.g.position.set(-4.4, 0, 4.2); const ctK1 = coinTowerMk(hK, 3.4, 4.4, 5), ctK2 = coinTowerMk(hK, 7.0, 4.4, 2);
      ANCH.mk_houses = () => V(0, 4.6, -6.0); ANCH.mk_pie = () => V(-4.4, 3.4, 4.2); ANCH.mk_coin = () => V(3.4, 3.4, 4.4); ANCH.mk_coin2 = () => V(7.0, 2.4, 4.4); wrapAnch(["mk_houses", "mk_pie", "mk_coin", "mk_coin2"], PL.marche); lampAt(hK, 0, 13, 3, 44, "#ffe0b0");
      upd((t) => { showHero("marche", hK, t); hs.forEach((h_, i) => { h_.scale.setScalar(0.85 * pop(t, TT.house_on + i * 0.06, 0.35)); }); coinTowerUpd(ctK1, t, TT.price_on); coinTowerUpd(ctK2, t, TT.price_on + 0.3);
        pieK.g.visible = t >= TT.pie_on - 0.05; pieK.sl.forEach((s_, i) => { const t0 = TT.pie_on + i * 0.3; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; }); });

      /* 6 · recul : the market falls, shelves are crowded */
      const hD = grp(PL.recul); const b22 = rb(3.0, 1, 3.0, P.gold, 0.2, mat(P.gold, { roughness: 0.3, metalness: 0.4 })); put(hD, b22, -3.6, 0, -3.4); const b24 = rb(3.0, 1, 3.0, P.red, 0.2, mat("#e0584a", { roughness: 0.3, metalness: 0.2 })); put(hD, b24, 3.6, 0, -3.4);
      const arD = arrowDown(hD, 0, 9.4, -3.4); put(hD, rb(14, 1.4, 2.2, "#6b4a2a", 0.15, mat("#6b4a2a", { roughness: 0.6 })), 0, 0, 5.0); const shD = []; for (let i = 0; i < 9; i++) { const cols = ["#7a4a14", "#2f7a3a", "#a83a2a", "#c89a2a", "#2f5aa0"]; const b = bottle(hD, -5.6 + i * 1.4, 5.0, cols[i % 5], 0.9); b.position.y = 1.4; shD.push(b); }
      ANCH.rc_22 = () => V(-3.6, 3.8, -3.4); ANCH.rc_24 = () => V(3.6, 3.4, -3.4); ANCH.rc_shelf = () => V(0, 4.6, 5.0); wrapAnch(["rc_22", "rc_24", "rc_shelf"], PL.recul); lampAt(hD, 0, 12, 4, 40, "#ffe0b0");
      upd((t) => { showHero("recul", hD, t); b22.scale.y = 3.2 * pop(t, TT.d22_on, 0.7); b24.scale.y = Math.max(0.001, 2.95 * pop(t, TT.d24_on, 0.8)); b24.visible = t >= TT.d24_on - 0.02; const a = pop(t, TT.d24_on + 0.3, 0.5); arD.scale.setScalar(a); arD.position.y = 9.4 + Math.sin(t * 4) * 0.3;
        shD.forEach((b, i) => { b.scale.setScalar(0.9 * pop(t, TT.shelf_on + i * 0.12, 0.35)); b.rotation.y = Math.sin(t * 1.5 + i) * 0.25; }); });

      /* 7 · marque : a brand people ask for keeps the tanks running; without it, stock sleeps */
      const hQ = grp(PL.marque); pedestal(hQ, 3.4).position.set(-4.0, 0, -1.0); const brQ = bottle(hQ, -4.0, -1.0, "#7a4a14", 2.2); brQ.position.y = 0.6; const crQ = grp(hQ, -4.0, 8.0, -1.0); { const m = mat(P.gold, { roughness: 0.2, metalness: 0.95 }); put(crQ, rb(2.4, 0.5, 0.5, P.gold, 0.1, m), 0, 0, 0); [-1, 0, 1].forEach((i) => put(crQ, cyl(0.04, 0.4, 0.9, P.gold, 4, m), i * 0.9, 0.4, 0)); }
      const tkQ = tank(hQ, 4.2, -5.6, 6, 1.5); const fansQ = []; for (let i = 0; i < 3; i++) { const w = worker(hQ, P.orange, 1.1); w.g.position.set(-6.8 + i * 1.8, 0, 4.4); w.g.rotation.y = -0.3; fansQ.push(w); }
      const stQ = grp(hQ, 5.6, 0, 3.4); const stk = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - r; c++) { const cr = crate(stQ, -1.6 + c * 1.6 + r * 0.8, r * 0.8, 0, "#6f6f78"); cr.visible = false; stk.push(cr); } const clkQ = clockObj(hQ, 0.8); clkQ.g.position.set(5.6, 7.4, 3.4);
      ANCH.mq_brand = () => V(-4.0, 9.2, -1.0); ANCH.mq_fans = () => V(-5.8, 3.8, 4.4); ANCH.mq_tank = () => V(4.2, 9.4, -5.6); ANCH.mq_stock = () => V(5.6, 4.0, 3.4); wrapAnch(["mq_brand", "mq_fans", "mq_tank", "mq_stock"], PL.marque); lampAt(hQ, 0, 13, 3, 46, "#ffe0b0");
      upd((t) => { showHero("marque", hQ, t); brQ.scale.setScalar(2.2 * pop(t, TT.brand_on, 0.7)); brQ.rotation.y = t * 0.8; crQ.scale.setScalar(pop(t, TT.pick_on, 0.5)); crQ.position.y = 8.0 + Math.sin(t * 2) * 0.2; fansQ.forEach((w, i) => { w.g.scale.setScalar(1.1 * pop(t, TT.pick_on + i * 0.12, 0.4)); w.armR.rotation.z = -2.4 + Math.sin(t * 5 + i) * 0.4; });
        tkQ.scale.setScalar(pop(t, TT.run_on2, 0.6)); tkQ.rotation.y = t * 0.5; stk.forEach((c, i) => { const k = pop(t, TT.idle_on + i * 0.18, 0.35); c.visible = k > 0.01; c.scale.setScalar(Math.max(k, 0.001)); }); clkQ.g.scale.setScalar(0.8 * pop(t, TT.idle_on + 0.2, 0.5)); clkQ.h2.rotation.z = -(t - TT.idle_on) * 4; clkQ.h1.rotation.z = -(t - TT.idle_on) * 0.35; });

      /* 8 · verdict : a brand + heavy fixed costs, riding a falling market */
      const hV = grp(PL.verdict); const wvV = mkWave(hV); wvV.g.position.set(0, 0, -3.2); const bV = bottle(hV, 0, 0, "#7a4a14", 1.2);
      const wtV = grp(hV, -6.4, 0, 3.6); put(wtV, cyl(1.3, 2.2, 2.4, "#4a5262", 6, mat("#4a5262", { roughness: 0.4, metalness: 0.8 })), 0, 1.2, 0); put(wtV, cyl(0.9, 1.3, 0.6, "#5b6577", 6, mat("#5b6577", { roughness: 0.4, metalness: 0.8 })), 0, 2.7, 0); const arV = arrowDown(hV, 6.6, 6.0, 3.6);
      ANCH.vd_wave = () => V(0, 8.8, -3.2); ANCH.vd_weight = () => V(-6.4, 4.6, 3.6); ANCH.vd_arrow = () => V(6.6, 9.4, 3.6); wrapAnch(["vd_wave", "vd_weight", "vd_arrow"], PL.verdict); lampAt(hV, 0, 12, 4, 44, "#ffe0b0");
      upd((t) => { showHero("verdict", hV, t); waveUpd(wvV, t, TT.ver_on); const x = Math.sin(t * 0.45 + 1) * 2.4; bV.scale.setScalar(1.2 * pop(t, TT.ver_on + 0.4, 0.5)); bV.position.set(x, wvV.H(x, t) + 0.1, -3.2); bV.rotation.z = Math.atan(Math.cos(x * 0.5 - t * 1.6)) * 0.4; wtV.scale.setScalar(pop(t, TT.heavy_on, 0.5)); const a = pop(t, TT.down_on, 0.5); arV.scale.setScalar(a); arV.position.y = 6.0 + Math.sin(t * 4) * 0.3; });

      /* 9 · cta : a comment bubble and a subscribe button (glossy) */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
