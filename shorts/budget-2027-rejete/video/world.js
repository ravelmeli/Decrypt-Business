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
      const barUpd = (b, h, t, t0) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; };
      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      function docMk(p, x, z, col = "#f7f1e6", o) { const g = grp(p, x, 0, z); const m = mat(col, o || { roughness: 0.5 }); put(g, rb(3.4, 4.4, 0.25, col, 0.1, m), 0, 0, 0); [1.0, 1.8, 2.6, 3.4].forEach((ly) => put(g, rb(2.6, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.15)); return g; }
      function parl(p, x, z, col = "#e6dccb", ghost = false) { const g = grp(p, x, 0, z); const mm = (c, r = 0.5) => ghost ? mat(c, { roughness: r, transparent: true, opacity: 0.3 }) : mat(c, { roughness: r }); put(g, rb(6.4, 0.5, 3.6, col, 0.1, mm(col)), 0, 0, 0); for (let i = 0; i < 5; i++) { const c = cyl(0.3, 0.3, 2.6, col, 14, mm(col)); c.position.set(-2.3 + i * 1.15, 1.8, 0); g.add(c); } put(g, rb(6.0, 0.45, 2.6, col, 0.08, mm(col)), 0, 3.1, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.5, 4), mm(P.gold, 0.4)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.6); rf.position.y = 4.4; rf.castShadow = true; g.add(rf); return g; }
      function gavel(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(0.45, 3.6, 0.45, "#7b4a22", 0.1, mat("#7b4a22", { roughness: 0.5 })), 0, 0, 0); put(g, rb(2.6, 1.2, 1.2, "#7b4a22", 0.15, mat("#7b4a22", { roughness: 0.4 })), 0, 3.6, 0); put(g, rb(2.7, 0.3, 1.3, P.gold, 0.05, GOLD()), 0, 3.6, 0); put(g, rb(2.7, 0.3, 1.3, P.gold, 0.05, GOLD()), 0, 4.5, 0); return g; }

      /* 1 · vote : 458 deputies against, none in favour */
      const hVt = grp(PL.vote); const arc = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 13; i++) { const a = -1.15 + i * (2.3 / 12); const rad = 5.2 + r * 1.5; const pp = person(hVt, P.red, 1.0); pp.position.set(Math.sin(a) * rad, 0, -Math.cos(a) * rad + 1.6); arc.push(pp); } const bxV = rb(2.4, 1.6, 1.8, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })); bxV.position.set(0, 0, 3.0); hVt.add(bxV); const slV = rb(1.4, 0.12, 0.2, "#10181b", 0.02, mat("#10181b")); slV.position.set(0, 1.6, 3.0); hVt.add(slV);
      ANCH.vt_arc = () => V(0, 3.6, -3.0); ANCH.vt_box = () => V(0, 2.8, 3.0); wrapAnch(["vt_arc", "vt_box"], PL.vote); lampAt(hVt, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("vote", hVt, t); arc.forEach((pp, i) => { const k = pop(t, TT.vo_on + (i % 13) * 0.05 + Math.floor(i / 13) * 0.2, 0.4); pp.scale.setScalar(Math.max(0.001, k)); pp.visible = k > 0.01; }); bxV.scale.setScalar(pop(t, TT.bx_on, 0.5)); slV.scale.setScalar(pop(t, TT.bx_on, 0.5)); });

      /* 2 · recettes : revenue part rejected, spending part never examined */
      const hRc = grp(PL.recettes); const dR = docMk(hRc, -3.6, 0, "#f7f1e6"); const dD = docMk(hRc, 3.8, 0, "#c9d6e3", { roughness: 0.5, transparent: true, opacity: 0.32 }); const xR = crossX(hRc, 5.0); xR.position.set(-3.6, 4.6, 0.4);
      ANCH.rc_a = () => V(-3.6, 6.2, 0); ANCH.rc_b = () => V(3.8, 5.6, 0); wrapAnch(["rc_a", "rc_b"], PL.recettes); lampAt(hRc, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("recettes", hRc, t); dR.scale.setScalar(pop(t, TT.re_on, 0.6)); const x = pop(t, TT.rej_on, 0.5); xR.scale.setScalar(x); xR.visible = x > 0.01; const k = pop(t, TT.dep_on, 0.6); dD.scale.setScalar(Math.max(0.001, k)); dD.visible = k > 0.01; });

      /* 3 · senat : the government's initial text goes to the Senate */
      const hSe = grp(PL.senat); const dS = docMk(hSe, -4.4, 0, "#f7f1e6"); const sc2 = [0, 1, 2].map((i) => { const l = rb(2.6, 0.1, 0.06, P.red, 0.01, mat(P.red)); l.position.set(-4.4 + (i - 1) * 0.2, 1.2 + i * 0.9, 0.17); l.rotation.z = 0.25 * (i - 1); hSe.add(l); return l; }); const sbS = parl(hSe, 3.6, 0, "#e6dccb"); const flS = flow(hSe, 4, 0.3);
      ANCH.se_doc = () => V(-4.4, 5.6, 0); ANCH.se_sen = () => V(3.6, 6.8, 0); wrapAnch(["se_doc", "se_sen"], PL.senat); lampAt(hSe, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("senat", hSe, t); dS.scale.setScalar(pop(t, TT.se_on, 0.6)); sc2.forEach((l, i) => { const k = pop(t, TT.tr_on + i * 0.15, 0.4); l.scale.setScalar(Math.max(0.001, k)); l.visible = k > 0.01; }); sbS.scale.setScalar(pop(t, TT.sn_on, 0.6)); flowUpd(flS, t, TT.sn_on + 0.3, 1e9, [-4.4, 3.0, 0], [3.6, 2.4, 0], 0.4); });

      /* 4 · cible : deficit 5.4 % expected in 2026, 5 % targeted in 2027 */
      const hCb = grp(PL.cible); const b26 = barMk(hCb, -3.6, 0, 2.8, P.gold), b27 = barMk(hCb, 3.6, 0, 2.8, P.green);
      ANCH.cb_26 = () => V(-3.6, 8.8, 0); ANCH.cb_27 = () => V(3.6, 8.2, 0); wrapAnch(["cb_26", "cb_27"], PL.cible); lampAt(hCb, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("cible", hCb, t); barUpd(b27, 7.5, t, TT.b27_on); barUpd(b26, 8.1, t, TT.b26_on); });

      /* 5 · virtuel : the amended text would have meant 5.9 % (20.7 billion more), a figure the left disputes */
      const hVr = grp(PL.virtuel); const bv1 = barMk(hVr, -4.4, 0, 2.6, P.green), bv2 = barMk(hVr, 0.4, 0, 2.6, P.red, { roughness: 0.3, transparent: true, opacity: 0.45 }); const ctV = coinTowerMk(hVr, 5.0, 0, 10); ctV.g.scale.setScalar(1.2);
      ANCH.vr_a = () => V(-4.4, 8.4, 0); ANCH.vr_b = () => V(0.4, 9.6, 0); ANCH.vr_c = () => V(5.0, 3.6, 0); wrapAnch(["vr_a", "vr_b", "vr_c"], PL.virtuel); lampAt(hVr, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("virtuel", hVr, t); barUpd(bv1, 7.5, t, TT.vr_on); barUpd(bv2, 8.85, t, TT.v59_on); bv2.material.opacity = 0.35 + 0.12 * Math.sin(t * 3); coinTowerUpd(ctV, t, TT.mi_on, 0.08); });

      /* 6 · navette : the two chambers must try to agree */
      const hNv = grp(PL.navette); const pa = parl(hNv, -4.2, 0, "#e6dccb"); const pb = parl(hNv, 4.2, 0, "#cfd6dd"); pa.scale.setScalar(0.7); pb.scale.setScalar(0.7); const f1 = flow(hNv, 4, 0.28), f2 = flow(hNv, 4, 0.28);
      ANCH.nv_a = () => V(-4.2, 5.6, 0); ANCH.nv_b = () => V(4.2, 5.6, 0); wrapAnch(["nv_a", "nv_b"], PL.navette); lampAt(hNv, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("navette", hNv, t); pa.scale.setScalar(0.7 * pop(t, TT.na_on, 0.5)); pb.scale.setScalar(0.7 * pop(t, TT.na_on + 0.2, 0.5)); flowUpd(f1, t, TT.na2_on, 1e9, [-4.2, 3.2, 0.6], [4.2, 3.2, 0.6], 0.4); flowUpd(f2, t, TT.na2_on + 0.4, 1e9, [4.2, 2.4, -0.6], [-4.2, 2.4, -0.6], 0.4); });

      /* 7 · article : the 49.3 and the risk of a censure motion */
      const hAr = grp(PL.article); const gvA = gavel(hAr, -3.6, 0); const dA = docMk(hAr, 3.6, 0, "#f7f1e6"); const mcA = docMk(hAr, 3.6, -3.4, "#f4c7c3"); mcA.scale.setScalar(0.7); const xA = crossX(hAr, 3.0); xA.position.set(3.6, 4.0, -3.2);
      ANCH.ar_g = () => V(-3.6, 6.4, 0); ANCH.ar_c = () => V(3.6, 5.8, -3.4); wrapAnch(["ar_g", "ar_c"], PL.article); lampAt(hAr, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("article", hAr, t); gvA.scale.setScalar(pop(t, TT.g_on, 0.5)); gvA.rotation.z = -0.5 * Math.max(0, Math.sin(t * 4)) * pop(t, TT.g_on + 0.4, 0.3); dA.scale.setScalar(pop(t, TT.ar_on, 0.5)); const k = pop(t, TT.ce_on, 0.5); mcA.scale.setScalar(0.7 * Math.max(0.001, k)); mcA.visible = k > 0.01; const x = pop(t, TT.ce_on + 0.2, 0.5); xA.scale.setScalar(x); xA.visible = x > 0.01; });

      /* 8 · delai : 70 days expire on 17 December, then an ordinance */
      const hDl = grp(PL.delai); const calD = grp(hDl, -3.4, 0, 0); put(calD, rb(4.2, 4.4, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calD, rb(4.2, 1.0, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 3.4, 0); const ckD = clockObj(hDl, 0.8); ckD.g.position.set(3.2, 3.2, -1.0); const orD = docMk(hDl, 3.4, 1.6, "#f7f1e6"); orD.scale.setScalar(0.8); put(orD, rb(2.4, 0.5, 0.1, P.red, 0.05, mat(P.red)), 0, 0.5, 0.2);
      ANCH.dl_cal = () => V(-3.4, 5.8, 0); ANCH.dl_ord = () => V(3.4, 4.6, 1.6); wrapAnch(["dl_cal", "dl_ord"], PL.delai); lampAt(hDl, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("delai", hDl, t); calD.scale.setScalar(pop(t, TT.de_on, 0.6)); ckD.g.scale.setScalar(0.8 * pop(t, TT.cal_on - 0.8, 0.5)); ckD.h1.rotation.z = -t * 0.8; ckD.h2.rotation.z = -t * 2.4; orD.scale.setScalar(0.8 * pop(t, TT.or_on, 0.5)); });

      /* 9 · douziemes : without a budget, one twelfth of last year's budget each month */
      const hDz = grp(PL.douziemes); const pdz = pieMake(hDz, [[1 / 12, P.gold, { roughness: 0.25 }], [11 / 12, "#7b8794", { roughness: 0.4 }]], 3.6, 0.4); pdz.g.position.set(-1.6, 0, 0); const ctz = coinTowerMk(hDz, 5.0, 0, 6);
      ANCH.dz_p = () => V(-1.6, 3.6, 0); ANCH.dz_c = () => V(5.0, 2.6, 0); wrapAnch(["dz_p", "dz_c"], PL.douziemes); lampAt(hDz, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("douziemes", hDz, t); pdz.g.visible = t >= TT.do_on - 0.05; pdz.g.scale.setScalar(pop(t, TT.do_on, 0.7)); coinTowerUpd(ctz, t, TT.un_on, 0.12); });

      /* 10 · inconnu : the Senate vote is not known */
      const hIn = grp(PL.inconnu); const gp = parl(hIn, 0, 0, "#cfd6dd", true); const ckI = clockObj(hIn, 0.8); ckI.g.position.set(0, 7.4, 0);
      ANCH.in_s = () => V(0, 8.6, 0); wrapAnch(["in_s"], PL.inconnu); lampAt(hIn, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("inconnu", hIn, t); const k = pop(t, TT.in_on, 0.6); gp.scale.setScalar(Math.max(0.001, k)); gp.visible = k > 0.01; ckI.g.scale.setScalar(0.8 * pop(t, TT.in_on + 0.4, 0.5)); ckI.h1.rotation.z = -t * 0.8; ckI.h2.rotation.z = -t * 2.4; });

      /* 11 · retenez : the State keeps running, spending decisions become uncertain */
      const hRt = grp(PL.retenez); const ofR = office(hRt, 4.6, 4.6, 3.4, "#3b4a6b", 1); ofR.position.set(-3.8, 0, 0); const prR = [P.sky, P.pink, P.violet].map((c, i) => person(hRt, c, 1.2)); prR.forEach((pp, i) => pp.position.set(2.2 + i * 1.4, 0, 1.0)); const fwR = flow(hRt, 4, 0.3); const ghR = grp(hRt, 5.6, 0, -2.4); const gR = []; for (let k = 0; k < 7; k++) { const c = cyl(1.0, 1.0, 0.14, P.gold, 24, mat(P.gold, { roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.3 })); c.position.y = 0.1 + k * 0.17; ghR.add(c); gR.push(c); }
      ANCH.rt_off = () => V(-3.8, 6.2, 0); ANCH.rt_gh = () => V(5.6, 2.8, -2.4); wrapAnch(["rt_off", "rt_gh"], PL.retenez); lampAt(hRt, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("retenez", hRt, t); ofR.scale.setScalar(pop(t, TT.rt_on, 0.6)); prR.forEach((pp, i) => pp.scale.setScalar(1.2 * pop(t, TT.rt_on + 0.3 + i * 0.12, 0.4))); flowUpd(fwR, t, TT.st_on, 1e9, [-3.8, 3.0, 0], [3.0, 1.8, 1.0], 0.4); const k = pop(t, TT.inc_on, 0.6); ghR.scale.setScalar(Math.max(0.001, k)); ghR.visible = k > 0.01; gR.forEach((c, i) => { c.material.opacity = 0.22 + 0.12 * Math.sin(t * 3 + i * 0.5); }); });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
