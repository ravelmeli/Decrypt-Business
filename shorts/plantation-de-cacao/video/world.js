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
      function pod(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); const b = sph(1.0, "#e0872a", 16, mat("#e0872a", { roughness: 0.5 })); b.scale.set(1, 1.5, 1); b.position.y = 1.5; g.add(b); for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 6, 20), mat("#b8641a", { roughness: 0.6 })); r.rotation.y = i * 0.52; r.scale.set(1, 1.5, 1); r.position.y = 1.5; g.add(r); } put(g, cyl(0.12, 0.18, 0.5, "#6b4a1e", 8, mat("#6b4a1e", { roughness: 0.8 })), 0, 2.9, 0); return g; }
      function choco(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(5.2, 6.6, 0.7, "#5a3a24", 0.12, mat("#5a3a24", { roughness: 0.4 })), 0, 0, 0); [-0.87, 0.87].forEach((lx) => put(g, rb(0.1, 6.6, 0.05, "#3b2415", 0.01, mat("#3b2415")), lx, 0, 0.37)); [1.65, 3.3, 4.95].forEach((ly) => put(g, rb(5.2, 0.1, 0.05, "#3b2415", 0.01, mat("#3b2415")), 0, ly, 0.37)); put(g, rb(1.6, 1.0, 0.08, P.gold, 0.05, GOLD()), 1.6, 5.4, 0.4); return g; }
      function stackCol(p, x, z, segs, w, k) { const g = grp(p, x, 0, z); let y = 0; const out = segs.map(([h, col]) => { const b = rb(w, h * k, w, col, 0.08, mat(col, { roughness: 0.3 })); b.position.y = y; g.add(b); const o = { b, y0: y, h: h * k }; y += h * k; return o; }); return { g, out, top: y }; }
      const stackUpd = (o, t, t0) => { const k = pop(t, t0, 0.5); o.b.scale.y = Math.max(0.001, k); o.b.visible = k > 0.01; };

      /* 1 · tablette : chocolate is a big business, the farmer gets one coin */
      const hT = grp(PL.tablette); const chT = choco(hT, -5.0, 0, 1); const ctT = coinTowerMk(hT, 0.4, 0, 22); ctT.g.scale.setScalar(1.1); const pdT = pod(hT, 5.2, 0, 1.2); const cnT = coinM(0.7); cnT.position.set(5.2, 0.15, 2.4); hT.add(cnT);
      ANCH.tb_tow = () => V(0.4, 5.6, 0); ANCH.tb_pod = () => V(5.2, 5.6, 0); wrapAnch(["tb_tow", "tb_pod"], PL.tablette); lampAt(hT, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("tablette", hT, t); chT.scale.setScalar(pop(t, TT.bar_on, 0.6)); coinTowerUpd(ctT, t, TT.tow_on, 0.06); pdT.scale.setScalar(1.2 * pop(t, TT.pod_on, 0.5)); const k = pop(t, TT.coin_on, 0.5); cnT.scale.setScalar(Math.max(0.001, k)); cnT.visible = k > 0.01; });

      /* 2 · part : about 11 % (dark) and 7 % (milk) go to the farmer */
      const hP = grp(PL.part); const p1 = pieMake(hP, [[0.11, P.gold, { roughness: 0.25 }], [0.89, "#5a3a24", { roughness: 0.4 }]], 3.3, 0.4); p1.g.position.set(-4.3, 0, 0); const p2 = pieMake(hP, [[0.07, P.gold, { roughness: 0.25 }], [0.93, "#c9a27a", { roughness: 0.4 }]], 3.3, 0.4); p2.g.position.set(4.3, 0, 0);
      ANCH.pt_p1 = () => V(-4.3, 3.6, 0); ANCH.pt_p2 = () => V(4.3, 3.6, 0); wrapAnch(["pt_p1", "pt_p2"], PL.part); lampAt(hP, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("part", hP, t); p1.g.visible = t >= TT.pie1_on - 0.05; p1.g.scale.setScalar(pop(t, TT.pie1_on, 0.7)); p2.g.visible = t >= TT.pie2_on - 0.05; p2.g.scale.setScalar(pop(t, TT.pie2_on, 0.7)); });

      /* 3 · kilo : one kilo of dark chocolate, 9.32 EUR, stacked by link of the chain */
      const hK = grp(PL.kilo); const skK = stackCol(hK, 0, 0, [[1.05, P.gold], [0.68, P.orange], [0.54, P.violet], [3.45, P.blue], [3.44, P.red], [0.16, P.gray]], 3.2, 0.72);
      ANCH.sg_cu = () => V(2.2, 0.9, 0); ANCH.sg_fa = () => V(2.2, 3.6, 0); ANCH.sg_di = () => V(2.2, 6.0, 0); wrapAnch(["sg_cu", "sg_fa", "sg_di"], PL.kilo); lampAt(hK, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("kilo", hK, t); const ts = [TT.cu_on, TT.cu_on + 0.3, TT.cu_on + 0.6, TT.fa_on, TT.di_on, TT.di_on + 0.4]; skK.out.forEach((o, i) => stackUpd(o, t, ts[i])); });

      /* 4 · marques : brands and retailers take about 70 % of the value and 90 % of the margins */
      const hM = grp(PL.marques); const sv = stackCol(hM, -3.4, 0, [[3, P.gold], [7, P.red]], 3.0, 0.7), sm = stackCol(hM, 3.4, 0, [[1, P.gold], [9, P.red]], 3.0, 0.7);
      ANCH.mq_val = () => V(-3.4, 8.0, 0); ANCH.mq_mar = () => V(3.4, 8.0, 0); wrapAnch(["mq_val", "mq_mar"], PL.marques); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("marques", hM, t); stackUpd(sv.out[0], t, TT.mq_on); stackUpd(sv.out[1], t, TT.va_on - 0.3); stackUpd(sm.out[0], t, TT.mq_on + 0.3); stackUpd(sm.out[1], t, TT.ma_on - 0.3); });

      /* 5 · pays : less than 19 % of the value stays in the producing countries */
      const hY = grp(PL.pays); const pyY = pieMake(hY, [[0.186, P.gold, { roughness: 0.25 }], [0.814, "#7b8794", { roughness: 0.4 }]], 3.6, 0.4); pyY.g.position.set(-2.4, 0, 0); const pdY = pod(hY, 4.8, 0, 1.3);
      ANCH.py_pie = () => V(-2.4, 3.8, 0); ANCH.py_pod = () => V(4.8, 5.4, 0); wrapAnch(["py_pie", "py_pod"], PL.pays); lampAt(hY, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("pays", hY, t); pdY.scale.setScalar(1.3 * pop(t, TT.pa_on, 0.5)); pyY.g.visible = t >= TT.pi_on - 0.05; pyY.g.scale.setScalar(pop(t, TT.pi_on, 0.7)); });

      /* 6 · twist : the world price falls, the value kept by brands and retailers keeps growing */
      const hW = grp(PL.twist); const ctL = coinTowerMk(hW, -4.4, 0, 14); ctL.g.scale.setScalar(1.4); const ctR = coinTowerMk(hW, 4.4, 0, 16); ctR.g.scale.setScalar(1.4); const adL = arrowDown(hW, -4.4, 8.6, 0), auR = arrowUp(hW, 4.4, 6.6, 0);
      ANCH.tw_l = () => V(-4.4, 10.6, 0); ANCH.tw_r = () => V(4.4, 9.6, 0); wrapAnch(["tw_l", "tw_r"], PL.twist); lampAt(hW, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("twist", hW, t); coinTowerUpd(ctL, t, TT.tw_on, 0.07); ctL.cs.forEach((c, k) => { if (k >= 9 && t > TT.drop_on) c.visible = false; }); coinTowerUpd(ctR, t, TT.tw_on + 0.3, 0.05); ctR.cs.forEach((c, k) => { if (k >= 11) { const p0 = prog(t, TT.up2_on + (k - 11) * 0.18, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; } });
        const a = pop(t, TT.drop_on, 0.5); adL.scale.setScalar(a); adL.visible = a > 0.01; adL.position.y = 8.6 + Math.sin(t * 3) * 0.25; const b = pop(t, TT.up2_on, 0.5); auR.scale.setScalar(b); auR.visible = b > 0.01; auR.position.y = 6.6 + Math.sin(t * 3) * 0.25; });

      /* 7 · cours : about 12 000 USD per tonne, then about 5 000; Cote d'Ivoire's farmgate price */
      const hCo = grp(PL.cours); const bc1 = barMk(hCo, -5.2, 0, 2.2, P.gold), bc2 = barMk(hCo, -1.8, 0, 2.2, P.red); const skC = rb(2.4, 2.6, 1.6, "#b8916a", 0.4, mat("#b8916a", { roughness: 0.9 })); skC.position.set(3.0, 0, 0); hCo.add(skC); const ctC = coinTowerMk(hCo, 6.0, 0, 9); const adC = arrowDown(hCo, -3.5, 6.8, 0); adC.scale.setScalar(0.7);
      ANCH.cr_b1 = () => V(-5.2, 6.8, 0); ANCH.cr_b2 = () => V(-1.8, 4.2, 0); ANCH.cr_sk = () => V(3.8, 4.4, 0); wrapAnch(["cr_b1", "cr_b2", "cr_sk"], PL.cours); lampAt(hCo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("cours", hCo, t); [[bc1, 6.0, TT.c12_on], [bc2, 2.5, TT.c5_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); const a = pop(t, TT.c5_on, 0.5); adC.scale.setScalar(0.7 * a); adC.visible = a > 0.01; const s = pop(t, TT.civ_on, 0.5); skC.scale.setScalar(s); coinTowerUpd(ctC, t, TT.civ_on + 0.3, 0.1); });

      /* 8 · revenu : a higher price does not tell what a farmer earns */
      const hR = grp(PL.revenu); const frR = person(hR, P.green, 1.7); frR.position.set(-3.6, 0, 0); const pdR = [0, 1, 2].map((i) => pod(hR, -0.6 + i * 1.5, 2.6 - i * 0.4, 0.55)); const ghR = grp(hR, 4.4, 0, 0); const gR = []; for (let k = 0; k < 9; k++) { const c = cyl(1.2, 1.2, 0.14, P.gold, 24, mat(P.gold, { roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.3 })); c.position.y = 0.1 + k * 0.17; ghR.add(c); gR.push(c); }
      ANCH.rv_gh = () => V(4.4, 3.2, 0); ANCH.rv_fr = () => V(-3.6, 4.4, 0); wrapAnch(["rv_gh", "rv_fr"], PL.revenu); lampAt(hR, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("revenu", hR, t); frR.scale.setScalar(1.7 * pop(t, TT.rv_on, 0.5)); pdR.forEach((p, i) => p.scale.setScalar(0.55 * pop(t, TT.rv_on + 0.3 + i * 0.15, 0.4))); const k = pop(t, TT.gh2_on, 0.6); ghR.scale.setScalar(Math.max(0.001, k)); ghR.visible = k > 0.01; gR.forEach((c, i) => { c.material.opacity = 0.22 + 0.12 * Math.sin(t * 3 + i * 0.5); }); });

      /* 9 · retenez : the cocoa weighs far less than manufacturing, brand and distribution */
      const hB = grp(PL.retenez); const baB = rb(1.4, 2.2, 1.4, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4 })); hB.add(baB); const bmB = grp(hB, 0, 2.4, 0); put(bmB, rb(11, 0.35, 1.2, "#cfd6dd", 0.1, mat("#cfd6dd", { roughness: 0.3, metalness: 0.5 })), 0, -0.17, 0); const pdB = pod(bmB, -4.4, 0, 0.7); pdB.position.y = 0.2; const hvB = grp(bmB, 4.0, 0.2, 0); [["#2a6fd6", 0], ["#e8483c", 1.2], ["#9fb3c8", 2.4]].forEach(([c, y]) => put(hvB, rb(2.6, 1.1, 2.4, c, 0.1, mat(c, { roughness: 0.35 })), 0, y, 0));
      ANCH.sc_l = () => V(-4.4, 5.6, 0); ANCH.sc_r = () => V(4.0, 4.6, 0); wrapAnch(["sc_l", "sc_r"], PL.retenez); lampAt(hB, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("retenez", hB, t); baB.scale.setScalar(pop(t, TT.sc_on, 0.5)); bmB.scale.setScalar(pop(t, TT.sc_on, 0.5)); bmB.rotation.z = -0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); pdB.rotation.z = 0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); hvB.rotation.z = 0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
