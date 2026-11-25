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
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      function ghostPerson(p, x, z, s = 1, op = 0.3) { const g = grp(p, x, 0, z); g.scale.setScalar(s); const m = mat("#ffffff", { roughness: 0.6, transparent: true, opacity: op }); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), m); b.position.y = 0.75; g.add(b); const h = sph(0.24, "#ffffff", 12, m); h.position.y = 1.5; g.add(h); return g; }
      function treadmill(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(2.0, 0.4, 4.0, "#2a2f45", 0.1, mat("#2a2f45", { roughness: 0.4, metalness: 0.4 })), 0, 0, 0); put(g, rb(1.5, 0.12, 3.5, "#10131f", 0.03, mat("#10131f", { roughness: 0.7 })), 0, 0.4, 0); put(g, rb(0.14, 2.0, 0.14, "#9fb3c8", 0.03, mat("#9fb3c8", { roughness: 0.3, metalness: 0.6 })), -0.8, 0.4, -1.7); put(g, rb(0.14, 2.0, 0.14, "#9fb3c8", 0.03, mat("#9fb3c8", { roughness: 0.3, metalness: 0.6 })), 0.8, 0.4, -1.7); put(g, rb(1.8, 0.8, 0.3, "#0b0d18", 0.05, mat("#0b0d18", { roughness: 0.4 })), 0, 2.0, -1.7); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.2 })); sc.position.set(0, 2.4, -1.52); g.add(sc); return g; }
      function sheet(p, x, z, flag) { const g = grp(p, x, 0, z); put(g, rb(1.1, 0.1, 1.4, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); const f = rb(1.1, 0.14, 0.4, P.red, 0.03, mat(P.red, { roughness: 0.35 })); f.position.set(0, 0, -0.5); f.visible = false; g.add(f); return { g, f }; }
      const NPC = [P.sky, P.pink, P.violet, P.green, P.orange];

      /* 1 · salle : a gym that cannot hold all its members at once */
      const hSa = grp(PL.salle); const bdS = office(hSa, 6.4, 4.4, 4.0, "#3b4a6b", 1); bdS.position.set(0, 0, -3.6); const awS = rb(6.8, 0.5, 1.2, P.gold, 0.1, mat(P.gold, { roughness: 0.35 })); awS.position.set(0, 3.2, -1.2); hSa.add(awS); const crS = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const pp = person(hSa, NPC[(r + c) % 5], 1.05); pp.position.set(-4.8 + c * 1.6, 0, 1.6 + r * 1.5); crS.push(pp); }
      ANCH.sa_b = () => V(0, 6.0, -3.6); ANCH.sa_c = () => V(0, 2.6, 3.4); wrapAnch(["sa_b", "sa_c"], PL.salle); lampAt(hSa, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("salle", hSa, t); bdS.scale.setScalar(pop(t, TT.sl_on, 0.6)); awS.scale.setScalar(pop(t, TT.sl_on + 0.2, 0.5)); crS.forEach((pp, i) => { const k = pop(t, TT.cr_on + i * 0.05, 0.4); pp.scale.setScalar(1.05 * k); }); });

      /* 2 · prix : 40 EUR on average, 29 EUR at the cheapest network of the survey */
      const hPr = grp(PL.prix); const bp1 = barMk(hPr, -3.6, 0, 2.8, P.gold), bp2 = barMk(hPr, 3.6, 0, 2.8, P.green);
      ANCH.pr_a = () => V(-3.6, 5.2, 0); ANCH.pr_b = () => V(3.6, 4.1, 0); wrapAnch(["pr_a", "pr_b"], PL.prix); lampAt(hPr, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("prix", hPr, t); [[bp1, 4.0, TT.pr_on], [bp2, 2.9, TT.b29_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); });

      /* 3 · club : about 2 900 memberships in one club */
      const hCl = grp(PL.club); const bdC = office(hCl, 5.6, 4.0, 3.6, "#3b4a6b", 1); bdC.position.set(0, 0, -4.4); const crC = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) { const pp = person(hCl, NPC[(r * 3 + c) % 5], 0.62); pp.position.set(-5.4 + c * 1.2, 0, 0.2 + r * 1.0); crC.push(pp); }
      ANCH.cl_b = () => V(0, 5.8, -4.4); ANCH.cl_c = () => V(0, 3.0, 2.0); wrapAnch(["cl_b", "cl_c"], PL.club); lampAt(hCl, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("club", hCl, t); bdC.scale.setScalar(pop(t, TT.cl_on, 0.6)); crC.forEach((pp, i) => { const k = pop(t, TT.cw_on - 0.3 + i * 0.03, 0.35); pp.scale.setScalar(0.62 * k); }); });

      /* 4 · calcul : a rough order of magnitude of about one million EUR a year per club */
      const hCa = grp(PL.calcul); const clcK = grp(hCa, -3.4, 0, 0); put(clcK, rb(3.8, 5.4, 0.9, "#2a2f45", 0.2, mat("#2a2f45", { roughness: 0.4, metalness: 0.4 })), 0, 0, 0); const scK = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.0), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.1 })); scK.position.set(0, 4.3, 0.47); clcK.add(scK); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) put(clcK, rb(0.8, 0.5, 0.2, P.cream, 0.05, mat("#e6dccb", { roughness: 0.4 })), -1.0 + c * 1.0, 0.5 + r * 0.7, 0.47);
      const ctCa = coinTowerMk(hCa, 4.0, 0, 22); ctCa.g.scale.setScalar(1.2);
      ANCH.ca_t = () => V(4.0, 6.2, 0); ANCH.ca_c = () => V(-3.4, 6.6, 0); wrapAnch(["ca_t", "ca_c"], PL.calcul); lampAt(hCa, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("calcul", hCa, t); clcK.scale.setScalar(pop(t, TT.ca_on, 0.6)); coinTowerUpd(ctCa, t, TT.ml_on, 0.07); });

      /* 5 · plateau : nobody trains 2 900 at a time, only a small share is present */
      const hPl = grp(PL.plateau); const trs = []; [[-3.8, -2.0], [0, -2.0], [3.8, -2.0], [-3.8, 2.4], [0, 2.4], [3.8, 2.4]].forEach(([x, z]) => trs.push(treadmill(hPl, x, z))); const pr1 = person(hPl, P.green, 1.15); pr1.position.set(-3.8, 0.5, -1.4); const pr2 = person(hPl, P.pink, 1.15); pr2.position.set(3.8, 0.5, 3.0); const gsP = []; for (let i = 0; i < 14; i++) gsP.push(ghostPerson(hPl, -6.2 + (i % 7) * 2.05, -6.4 - Math.floor(i / 7) * 1.3, 1.1, 0.32));
      ANCH.pl_m = () => V(0, 4.2, 0); ANCH.pl_g = () => V(0, 3.4, -6.8); wrapAnch(["pl_m", "pl_g"], PL.plateau); lampAt(hPl, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("plateau", hPl, t); trs.forEach((m, i) => m.scale.setScalar(pop(t, TT.pl_on + i * 0.1, 0.5))); pr1.scale.setScalar(1.15 * pop(t, TT.gh_on, 0.5)); pr2.scale.setScalar(1.15 * pop(t, TT.gh_on + 0.2, 0.5)); gsP.forEach((g, i) => { const k = pop(t, TT.gh_on + 0.2 + i * 0.05, 0.4); g.scale.setScalar(1.1 * Math.max(0.001, k)); g.visible = k > 0.01; }); });

      /* 6 · fantomes : 5 % of this survey's members are ghost members, and the sample is not representative */
      const hFa = grp(PL.fantomes); const prF = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const i = r * 5 + c; const pp = i === 7 ? ghostPerson(hFa, 0, 0, 1.4, 0.35) : person(hFa, P.sky, 1.4); pp.position.set(-4.4 + c * 2.2, 0, -2.6 + r * 2.0); prF.push(pp); }
      const cbF = grp(hFa, 0, 0, -7.4); put(cbF, rb(3.6, 4.4, 0.25, "#cfa56a", 0.1, mat("#cfa56a", { roughness: 0.6 })), 0, 0, 0); put(cbF, rb(3.0, 3.8, 0.1, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })), 0, 0.3, 0.17); [1.0, 1.9, 2.8].forEach((ly) => put(cbF, rb(2.4, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.24));
      ANCH.fa_g = () => V(-0.0, 3.4, -0.6); ANCH.fa_cb = () => V(0, 5.6, -7.4); wrapAnch(["fa_g", "fa_cb"], PL.fantomes); lampAt(hFa, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("fantomes", hFa, t); prF.forEach((pp, i) => { const k = pop(t, TT.fa_on + i * 0.04, 0.4); const s0 = i === 7 ? 1.4 * pop(t, TT.ghost_on - 0.3, 0.5) : 1.4 * k; pp.scale.setScalar(Math.max(0.001, s0)); pp.visible = s0 > 0.01; }); cbF.scale.setScalar(pop(t, TT.cb_on, 0.6)); });

      /* 7 · sanschiffre : no reliable figure on members who never come */
      const hNs = grp(PL.sanschiffre); const bnS = [[-4.0, 3.0], [0, 5.0], [4.0, 4.0]].map(([x, h]) => { const b = barMk(hNs, x, 0, 2.6, "#c9d6e3", { roughness: 0.3, transparent: true, opacity: 0.32 }); b.userData.h = h; return b; }); const xNs = crossX(hNs, 6.0); xNs.position.set(0, 7.0, 0.5);
      ANCH.ns_b = () => V(0, 6.0, 0); wrapAnch(["ns_b"], PL.sanschiffre); lampAt(hNs, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("sanschiffre", hNs, t); bnS.forEach((b, i) => { const k = pop(t, TT.ns_on + i * 0.15, 0.6); b.scale.y = Math.max(0.001, b.userData.h * k); b.visible = k > 0.01; b.material.opacity = 0.28 + 0.1 * Math.sin(t * 3 + i); }); const x = pop(t, TT.x_on, 0.5); xNs.scale.setScalar(x); xNs.visible = x > 0.01; });

      /* 8 · dgccrf : controls found at least one anomaly in over 70 % of the gyms checked; 46 % of contracts had unfair clauses */
      const hDg = grp(PL.dgccrf); const shs = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const o = sheet(hDg, -6.0 + c * 1.5, -1.4 + r * 2.0, true); shs.push(o); }
      const pDg = pieMake(hDg, [[0.46, P.red, { roughness: 0.3 }], [0.54, "#7b8794", { roughness: 0.4 }]], 2.6, 0.4); pDg.g.position.set(4.6, 0, 0.6);
      ANCH.dg_s = () => V(-3.8, 2.6, -0.4); ANCH.dg_p = () => V(4.6, 3.4, 0.6); wrapAnch(["dg_s", "dg_p"], PL.dgccrf); lampAt(hDg, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("dgccrf", hDg, t); shs.forEach((o, i) => { const k = pop(t, TT.dg_on + i * 0.06, 0.4); o.g.scale.setScalar(k); const fl = i < 7 && t >= TT.flag_on + i * 0.12; o.f.visible = fl; }); pDg.g.visible = t >= TT.pie_on - 0.05; pDg.g.scale.setScalar(pop(t, TT.pie_on, 0.7)); });

      /* 9 · contrat : check the length, the renewal and the cancellation before signing */
      const hCt = grp(PL.contrat); const docT = grp(hCt, -2.6, 0, 0); put(docT, rb(4.4, 5.6, 0.3, "#f7f1e6", 0.1, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); [1.0, 1.8, 2.6, 3.4, 4.2].forEach((ly) => put(docT, rb(3.2, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.17)); put(docT, rb(1.6, 0.1, 0.05, P.red, 0.01, mat(P.red)), 0.6, 0.45, 0.17); const pnT = cyl(0.12, 0.12, 2.4, P.gold, 8, mat(P.gold, { roughness: 0.3 })); pnT.rotation.z = Math.PI / 3; pnT.position.set(1.0, 1.0, 0.5); docT.add(pnT); const ckT = clockObj(hCt, 0.9); ckT.g.position.set(4.2, 3.0, 0);
      ANCH.ct_d = () => V(-2.6, 6.4, 0); ANCH.ct_k = () => V(4.2, 5.6, 0); wrapAnch(["ct_d", "ct_k"], PL.contrat); lampAt(hCt, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("contrat", hCt, t); docT.scale.setScalar(pop(t, TT.ct_on, 0.6)); ckT.g.scale.setScalar(0.9 * pop(t, TT.clk_on, 0.5)); ckT.h1.rotation.z = -t * 0.8; ckT.h2.rotation.z = -t * 2.4; pnT.position.x = 1.0 + Math.sin(t * 3) * 0.2; });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
