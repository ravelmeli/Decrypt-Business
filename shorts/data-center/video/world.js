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
      /* ---- esport builders (custom PBR) ---- */
      const SCR = ["#3dd6ff", "#ff5ea8", "#8f86ff", "#43e0a6", "#ffb347"], PCOL = [P.violet, P.pink, P.blue, P.green, P.orange];
      function gdesk(p, x, z, col, vest) { const g = grp(p, x, 0, z); put(g, rb(2.2, 0.15, 1.2, "#2a2f45", 0.05, mat("#2a2f45", { roughness: 0.4, metalness: 0.5 })), 0, 1.0, 0); [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].forEach(([a, b]) => put(g, rb(0.12, 1.0, 0.12, "#1a1d2c", 0.02), a, 0, b));
        put(g, rb(1.5, 0.95, 0.1, "#0b0d18", 0.03), 0, 1.15, 0.1); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.8), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6 })); sc.position.set(0, 1.62, 0.16); g.add(sc);
        const pl = worker(g, vest, 0.85); pl.g.position.set(0, 0, -1.1); return { g, pl, sc }; }
      function trophy(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(1.6, 0.5, 1.6, "#3b2f1f", 0.06), 0, 0, 0); put(g, cyl(0.3, 0.5, 1.0, P.gold, 16, GOLD()), 0, 1.0, 0); put(g, cyl(1.1, 0.55, 1.5, P.gold, 24, GOLD()), 0, 2.25, 0); [-1, 1].forEach((sx) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 16), GOLD()); h.position.set(sx * 1.2, 2.3, 0); g.add(h); }); return g; }
      function board(p, x, z, col, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(0.2, 2.6, 0.2, "#2a2f45", 0.03), 0, 0, 0); put(g, rb(3.0, 1.7, 0.18, col, 0.1, mat(col, { roughness: 0.3 })), 0, 2.4, 0); put(g, rb(1.2, 0.5, 0.06, P.white, 0.04), 0, 2.4, 0.13); return g; }
      function tvSet(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(5.0, 3.0, 0.3, "#10131f", 0.1, mat("#10131f", { roughness: 0.3 })), 0, 1.0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.5), new THREE.MeshStandardMaterial({ color: "#3dd6ff", emissive: "#2a9ad0", emissiveIntensity: 1.2 })); sc.position.set(0, 2.5, 0.17); g.add(sc); put(g, rb(1.2, 0.8, 0.8, "#10131f", 0.1), 0, 0, 0);
        const x1 = new THREE.Group(); [0.8, -0.8].forEach((r) => { const b = rb(0.35, 3.6, 0.12, P.red, 0.1, mat(P.red, { roughness: 0.35 })); b.position.y = -1.8; b.rotation.z = r; x1.add(b); }); x1.position.set(0, 2.5 + 0.0, 0.3); g.add(x1); return { g, x: x1 }; }
      function misc(p, kind, x, z) { const g = grp(p, x, 0, z);
        if (kind === "merch") { [0, 1, 2].forEach((i) => put(g, rb(1.8, 0.35, 1.3, [P.pink, P.blue, P.green][i], 0.08), 0, i * 0.4, 0)); }
        else if (kind === "cam") { put(g, rb(1.6, 1.0, 1.0, "#10131f", 0.1), 0, 1.2, 0); const l = cyl(0.4, 0.4, 0.7, "#2a2f45", 16, mat("#2a2f45", { roughness: 0.3, metalness: 0.6 })); l.rotation.x = Math.PI / 2; put(g, l, 0, 1.2, 0.8); put(g, cyl(0.06, 0.1, 1.2, "#10131f", 8), 0, 0.6, 0); const led = sph(0.12, P.red, 8, emis(P.red, 2)); led.position.set(0.5, 1.6, 0.52); g.add(led); }
        else if (kind === "pub") { put(g, rb(3.0, 2.6, 2.2, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4, metalness: 0.2 })), 0, 0, 0); const c = coinM(0.9); c.rotation.x = Math.PI / 2; c.position.set(0, 3.4, 0); g.add(c); }
        return g; }

      /* ---- data center builders ---- */
      function rack(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(1.2, 3.4, 1.2, "#141a2a", 0.06, mat("#141a2a", { roughness: 0.35, metalness: 0.5 })), 0, 0, 0); const lm = emis(P.green, 1.6); for (let i = 0; i < 7; i++) { const l = rb(0.8, 0.12, 0.05, P.green, 0.02, lm); l.position.set(0, 0.45 + i * 0.4, 0.63); g.add(l); } return { g, lm }; }
      function rackHall(p, rows, cols, x0, z0) { const a = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) a.push(rack(p, x0 + c * 2.0, z0 + r * 2.6)); return a; }
      const pylon = (p, x, z) => { const g = grp(p, x, 0, z); put(g, rb(0.5, 11, 0.5, "#6b7480", 0.05, mat("#6b7480", { roughness: 0.4, metalness: 0.6 })), 0, 0, 0); [4.8, 7.4, 9.8].forEach((y, i) => put(g, rb(4.6 - i * 0.9, 0.25, 0.25, "#6b7480", 0.04, mat("#6b7480", { roughness: 0.4, metalness: 0.6 })), 0, y, 0)); return g; };
      const fan = (p, x, y, z) => { const g = grp(p, x, y, z); [0, 1, 2].forEach((i) => { const b = rb(1.5, 0.08, 0.3, "#d0d6dd", 0.03, mat("#d0d6dd", { roughness: 0.3, metalness: 0.5 })); b.rotation.y = i * 2.094; b.position.set(Math.cos(i * 2.094) * 0.7, 0, -Math.sin(i * 2.094) * 0.7); g.add(b); }); return g; };

      /* 1 · dc : a hall of server racks */
      const hA = grp(PL.dc); const fl = rb(21, 0.3, 11, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); fl.position.set(0, 0, 0.6); hA.add(fl); const rkA = rackHall(hA, 3, 8, -7, -3.2); const lmA = rkA.map((r) => r.lm);
      ANCH.dc_hall = () => V(0, 5.2, 0); wrapAnch(["dc_hall"], PL.dc); lampAt(hA, 0, 13, 4, 40, "#bfe8ff");
      upd((t) => { showHero("dc", hA, t); rkA.forEach((r, i) => { r.g.scale.setScalar(pop(t, TT.dc_on + i * 0.04, 0.4)); r.lm.emissiveIntensity = 1.0 + 0.8 * Math.sin(t * 6 + i * 1.3); }); fl.scale.setScalar(pop(t, TT.dc_on, 0.5)); });

      /* 2 · conso : 1.5 % of world electricity, 415 TWh, nearly 945 in 2030 */
      const hO = grp(PL.conso); const pieO = pieMake(hO, [[0.015, P.gold, { roughness: 0.25 }], [0.985, "#7b8794", { roughness: 0.4 }]], 3.2, 0.4); pieO.g.position.set(-5.6, 0, 1.0); const b24 = rb(2.2, 1, 2.2, P.gold, 0.12, mat(P.gold, { roughness: 0.3 })), b30 = rb(2.2, 1, 2.2, P.red, 0.12, mat(P.red, { roughness: 0.3 })); b24.position.set(1.2, 0, 1.0); b30.position.set(5.2, 0, 1.0); hO.add(b24); hO.add(b30);
      ANCH.cn_pie = () => V(-5.6, 3.6, 1.0); ANCH.cn_b24 = () => V(1.2, 4.6, 1.0); ANCH.cn_b30 = () => V(5.2, 9.4, 1.0); wrapAnch(["cn_pie", "cn_b24", "cn_b30"], PL.conso); lampAt(hO, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("conso", hO, t); pieO.g.visible = t >= TT.pie_on - 0.05; pieO.g.scale.setScalar(pop(t, TT.pie_on, 0.7)); const k1 = pop(t, TT.b24_on, 0.6), k2 = pop(t, TT.b30_on, 0.7); b24.scale.y = Math.max(0.001, 3.7 * k1); b24.position.y = 0; b24.visible = k1 > 0.01; b30.scale.y = Math.max(0.001, 8.4 * k2); b30.visible = k2 > 0.01; });

      /* 3 · capex : the building, then the servers (about 2.3 times more) */
      const hX = grp(PL.capex); const shX = office(hX, 4.2, 4.0, 3.4, "#3b4a6b", 1); shX.position.set(0, 0, -5.6); const ctX1 = coinTowerMk(hX, -4.2, 0, 11), ctX2 = coinTowerMk(hX, 4.2, 0, 25); const mnX = [0, 1, 2, 3, 4, 5].map((i) => { const c = coinM(0.7); c.visible = false; hX.add(c); return c; });
      ANCH.cx_shell = () => V(-4.2, 3.6, 0); ANCH.cx_srv = () => V(4.2, 6.2, 0); ANCH.cx_mil = () => V(0, 7.4, -5.6); wrapAnch(["cx_shell", "cx_srv", "cx_mil"], PL.capex); lampAt(hX, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("capex", hX, t); shX.scale.setScalar(pop(t, TT.bld_on, 0.6)); mnX.forEach((c, i) => { const u = (((t - TT.bld_on) * 0.5 + i / 6) % 1 + 1) % 1; c.visible = t >= TT.bld_on && t < TT.shell_on; c.position.set(-6 + i * 2.4, 7.4 - u * 6.5, 2.0); c.rotation.x = t * 5; }); coinTowerUpd(ctX1, t, TT.shell_on, 0.12); coinTowerUpd(ctX2, t, TT.srv_on, 0.07); });

      /* 4 · elec : the power bill, cooling is 7 % (efficient) versus over 30 % */
      const hE = grp(PL.elec); const pyE = pylon(hE, -8.2, 0); const bdE1 = office(hE, 3.2, 3.6, 3.0, "#2f6b52", 1), bdE2 = office(hE, 3.2, 3.6, 3.0, "#6b2f3a", 1); bdE1.position.set(-2.4, 0, -2.4); bdE2.position.set(5.0, 0, -2.4); const fnE1 = fan(hE, -2.4, 4.0, -2.4), fnE2 = fan(hE, 5.0, 4.0, -2.4);
      const piE1 = pieMake(hE, [[0.07, "#5ad1ff", { roughness: 0.25 }], [0.93, "#7b8794", { roughness: 0.4 }]], 2.3, 0.4); piE1.g.position.set(-2.4, 0, 3.4); const piE2 = pieMake(hE, [[0.30, "#5ad1ff", { roughness: 0.25 }], [0.70, "#7b8794", { roughness: 0.4 }]], 2.3, 0.4); piE2.g.position.set(5.0, 0, 3.4); const fwE = [0, 1, 2, 3].map(() => flow(hE, 4, 0.3));
      ANCH.el_pylon = () => V(-8.2, 11.6, 0); ANCH.el_eff = () => V(-2.4, 5.4, 3.4); ANCH.el_bad = () => V(5.0, 5.4, 3.4); wrapAnch(["el_pylon", "el_eff", "el_bad"], PL.elec); lampAt(hE, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("elec", hE, t); pyE.scale.setScalar(pop(t, TT.elec_on, 0.6)); bdE1.scale.setScalar(pop(t, TT.cool_on, 0.5)); bdE2.scale.setScalar(pop(t, TT.cool_on + 0.2, 0.5)); [fnE1, fnE2].forEach((f, i) => { f.visible = t >= TT.cool_on; f.rotation.y = t * (6 + i * 4); });
        piE1.g.visible = t >= TT.p7_on - 0.05; piE1.g.scale.setScalar(pop(t, TT.p7_on, 0.7)); piE2.g.visible = t >= TT.p30_on - 0.05; piE2.g.scale.setScalar(pop(t, TT.p30_on, 0.7)); flowUpd(fwE[0], t, TT.elec_on + 0.6, 1e9, [-8.2, 9.6, 0], [-2.4, 4.0, -2.4], 0.45); flowUpd(fwE[1], t, TT.elec_on + 0.9, 1e9, [-8.2, 9.6, 0], [5.0, 4.0, -2.4], 0.45); });

      /* 5 · revenus : clients rent power and space, the hall must fill up */
      const hR = grp(PL.revenus); const flR = rb(15, 0.3, 8, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flR.position.set(0, 0, 1.6); hR.add(flR); const rkR = rackHall(hR, 3, 6, -5, -0.4); const clR = [P.pink, P.blue, P.violet].map((c, i) => board(hR, -5 + i * 5, -5.6, c, 1.0)); const fcR = [0, 1, 2].map(() => flow(hR, 3, 0.32));
      ANCH.rv_hall = () => V(0, 4.8, 1.2); ANCH.rv_cli = () => V(0, 6.4, -5.6); wrapAnch(["rv_hall", "rv_cli"], PL.revenus); lampAt(hR, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("revenus", hR, t); flR.scale.setScalar(pop(t, TT.rev_on, 0.5)); clR.forEach((b, i) => b.scale.setScalar(pop(t, TT.rent_on + i * 0.2, 0.5))); const step = Math.max(0.1, (TT.fill_on - TT.rent_on - 0.6) / rkR.length); rkR.forEach((r, i) => { const k = pop(t, TT.rent_on + 0.6 + i * step, 0.35); r.g.scale.setScalar(k); r.g.visible = k > 0.01; r.lm.emissiveIntensity = 1.0 + 0.8 * Math.sin(t * 6 + i); }); fcR.forEach((a, i) => flowUpd(a, t, TT.rent_on + 0.3 + i * 0.2, 1e9, [-5 + i * 5, 3.2, -5.6], [0, 2.4, 1.6], 0.4)); });

      /* 6 · verdict : a building that lasts years, machines that age fast */
      const hV3 = grp(PL.verdict); const ckA = clockObj(hV3, 1.5); ckA.g.position.set(-4.6, 4.6, 0); const ckB = clockObj(hV3, 0.8); ckB.g.position.set(4.6, 3.0, 0); const bdV = office(hV3, 4.0, 3.2, 2.8, "#3b4a6b", 1); bdV.position.set(-4.6, 0, -2.0); const rkV = rack(hV3, 4.6, -1.2);
      ANCH.vd_clockA = () => V(-4.6, 8.4, 0); ANCH.vd_clockB = () => V(4.6, 5.0, 0); wrapAnch(["vd_clockA", "vd_clockB"], PL.verdict); lampAt(hV3, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("verdict", hV3, t); bdV.scale.setScalar(pop(t, TT.ver_on, 0.6)); ckA.g.scale.setScalar(1.5 * pop(t, TT.clk_on, 0.5)); ckB.g.scale.setScalar(0.8 * pop(t, TT.mach_on, 0.5)); rkV.g.scale.setScalar(pop(t, TT.mach_on, 0.5)); ckA.h1.rotation.z = -t * 0.25; ckA.h2.rotation.z = -t * 0.6; ckB.h1.rotation.z = -t * 3.0; ckB.h2.rotation.z = -t * 7.2; rkV.lm.emissiveIntensity = 1.0 + 0.6 * Math.sin(t * 6); });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
