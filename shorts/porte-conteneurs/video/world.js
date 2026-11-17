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
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughnessMap: fR, normalMap: fN, normalScale: new THREE.Vector2(0.6, 0.6), color: "#1d4a68", roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.set(B.ringC[0], -0.02, B.ringC[1]); floor.receiveShadow = true; scene.add(floor);

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

      /* ---- container ship (custom): bow at +x, bridge at the stern (-x), stacks of coloured containers ---- */
      const CC = ["#e24b3b", "#2f7fd0", "#f2b632", "#3aa66b", "#e9e2cc", "#8a5ad0", "#ff8a3d", "#2fb8c4"];
      function ship(p, s = 1, o = {}) { const nx = o.nx || 7, nz = o.nz || 3, ny = o.ny || 3; const g = grp(p); g.scale.setScalar(s); const rr = rng(o.seed || 5);
        const Wd = nz * 0.55 + 0.5, L = nx * 1.25 + 6.4, x0 = -L / 2 + 3.6;
        const sh = new THREE.Shape(); sh.moveTo(-L / 2, -Wd / 2); sh.lineTo(L / 2 - 3, -Wd / 2); sh.lineTo(L / 2, 0); sh.lineTo(L / 2 - 3, Wd / 2); sh.lineTo(-L / 2, Wd / 2); sh.lineTo(-L / 2, -Wd / 2);
        const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }), mat(o.hull || "#c0392b", { roughness: 0.45, metalness: 0.2 })); hull.rotation.x = -Math.PI / 2; hull.castShadow = true; hull.receiveShadow = true; g.add(hull);
        put(g, rb(L - 0.2, 0.12, Wd - 0.1, "#cfd6dc", 0.03, mat("#cfd6dc", { roughness: 0.6 })), 0, 1.5, 0);
        put(g, rb(2.0, 2.8, Wd * 0.92, "#f4f4ee", 0.1, mat("#f4f4ee", { roughness: 0.35 })), -L / 2 + 1.5, 1.55, 0); put(g, rb(2.04, 0.5, Wd * 0.94, "#2a3f5f", 0.05, mat("#223350", { roughness: 0.15, metalness: 0.4 })), -L / 2 + 1.5, 3.2, 0); put(g, cyl(0.35, 0.4, 1.3, "#e24b3b", 12, mat("#e24b3b")), -L / 2 + 0.9, 4.3, 0);
        const boxes = []; let n = 0; for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) for (let iy = 0; iy < ny; iy++) { if (iy > 0 && rr() < 0.12) continue; const col = CC[Math.floor(rr() * CC.length)]; const b = rb(1.15, 0.52, 0.5, col, 0.03, mat(col, { roughness: 0.55, metalness: 0.15 })); b.position.set(x0 + ix * 1.25, 1.6 + iy * 0.55, (iz - (nz - 1) / 2) * 0.56); g.add(b); boxes.push(b); }
        return { g, hull, boxes, L, Wd }; }
      const setHull = (sp, hex) => { sp.hull.material = mat(hex, { roughness: 0.4, metalness: 0.25 }); };
      const popBoxes = (sp, t, t0, per = 0.012) => sp.boxes.forEach((b, i) => { const k = pop(t, t0 + i * per, 0.3); b.scale.setScalar(k); b.visible = k > 0.01; });
      const coinTowerMk = (p, x, z, n = 16) => { const g = grp(p, x, 0, z); const cs = []; for (let k = 0; k < n; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); g.add(c); cs.push(c); } return { g, cs }; };
      const coinTowerUpd = (tw, t, t0) => tw.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * 0.07, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; });
      const mkWave = (p, n = 21) => { const g = grp(p); const pil = []; for (let k = 0; k < n; k++) { const col = k % 2 ? "#2f7fd0" : "#4db8ff"; const b = rb(0.7, 1, 2.2, col, 0.12, mat(col, { roughness: 0.3, metalness: 0.15 })); b.position.set(-10 + k * (20 / (n - 1)), 0, 0); g.add(b); pil.push(b); } const H = (x, t) => 2.6 + 2.0 * Math.sin(x * 0.5 - t * 1.6); return { g, pil, H }; };
      const waveUpd = (wv, t, t0) => wv.pil.forEach((b) => { const k = pop(t, t0, 0.6); const h = Math.max(0.05, wv.H(b.position.x, t)) * k; b.scale.y = h; b.visible = k > 0.01; });
      const shieldMk = (p, x, z) => { const shG = grp(p, x, 0, z); const sh = new THREE.Shape(); sh.moveTo(0, 2.6); sh.bezierCurveTo(1.4, 2.6, 1.8, 2.2, 1.8, 1.4); sh.bezierCurveTo(1.8, 0.4, 0.9, 0.1, 0, -0.4); sh.bezierCurveTo(-0.9, 0.1, -1.8, 0.4, -1.8, 1.4); sh.bezierCurveTo(-1.8, 2.2, -1.4, 2.6, 0, 2.6); const gm = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2, curveSegments: 18 }); const m = new THREE.Mesh(gm, mat(P.blue, { roughness: 0.25, metalness: 0.5 })); m.castShadow = true; m.position.set(0, 1.0, 0); shG.add(m); const ck = rb(0.35, 1.3, 0.3, P.white, 0.08, mat("#fff", { roughness: 0.3 })); ck.position.set(0.55, 1.35, 0.7); ck.rotation.z = -0.75; shG.add(ck); const ck2 = rb(0.35, 0.7, 0.3, P.white, 0.08, mat("#fff", { roughness: 0.3 })); ck2.position.set(-0.45, 1.5, 0.7); ck2.rotation.z = 0.75; shG.add(ck2); return shG; };
      const fuelMk = (p, x, z) => { const fuG = grp(p, x, 0, z); put(fuG, rb(1.9, 2.4, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.4 })), 0, 0, 0); put(fuG, cyl(0.25, 0.25, 0.5, P.gray, 12, mat("#cfd6dc", { roughness: 0.3, metalness: 0.8 })), -0.5, 2.4, 0); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 8, 18, Math.PI), mat(P.red, { roughness: 0.4 })); hd.position.set(0.5, 2.4, 0); fuG.add(hd); put(fuG, rb(1.1, 0.5, 0.05, P.white, 0.02, mat("#fff", { roughness: 0.5 })), 0, 1.0, 0.47); return fuG; };
      const arrowDown = (p, x, y, z) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0.9, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(P.red, { roughness: 0.35 })); hd.rotation.x = Math.PI; hd.rotation.y = Math.PI / 4; hd.position.y = 0.5; hd.castShadow = true; a.add(hd); return a; };
      const SEA = (c) => c;

      /* 1 · navire : a ~270 M$ giant ship, a tower of coins */
      const hN = grp(PL.navire); const shN = ship(hN, 0.82, { nx: 7, nz: 3, ny: 3, seed: 11 }); shN.g.position.set(0, 0, -2.6); shN.g.rotation.y = 0.35;
      const ctN = coinTowerMk(hN, 0.6, 5.0, 16);
      ANCH.nv_ship = () => V(0, 6.2, -2.6); ANCH.nv_coin = () => V(0.6, 4.6, 5.0); wrapAnch(["nv_ship", "nv_coin"], PL.navire); lampAt(hN, 0, 12, 4, 40);
      upd((t) => { showHero("navire", hN, t); const k = pop(t, TT.ship_on, 0.8); shN.g.scale.setScalar(0.82 * k); shN.g.position.y = Math.sin(t * 1.3) * 0.12; popBoxes(shN, t, TT.cont_on, 0.03); coinTowerUpd(ctN, t, TT.coin_on); });

      /* 2 · flotte : a few ships owned (amber hull), the rest chartered (blue hull) */
      const hF = grp(PL.flotte); const fleet = []; for (let i = 0; i < 8; i++) { const sp = ship(hF, 0.5, { nx: 3, nz: 2, ny: 2, seed: 20 + i, hull: "#7b8794" }); sp.g.position.set((i % 2 - 0.5) * 7.4, 0, -6.6 + Math.floor(i / 2) * 4.4); fleet.push(sp); }
      ANCH.fl_own = () => V(-3.7, 3.4, -6.0); ANCH.fl_rent = () => V(3.7, 3.4, 4.8); wrapAnch(["fl_own", "fl_rent"], PL.flotte); lampAt(hF, 0, 12, 2, 40);
      upd((t) => { showHero("flotte", hF, t); fleet.forEach((sp, i) => { sp.g.scale.setScalar(0.5 * pop(t, TT.fleet_on + i * 0.1, 0.4)); const own = [0, 3, 4].includes(i); if (own && t >= TT.own_on) setHull(sp, "#ffb347"); else if (!own && t >= TT.rent_on + i * 0.08) setHull(sp, "#4db8ff"); }); });

      /* 3 · cycle : a wave of pillars with a ship riding it; debt = a coin tower */
      const hY = grp(PL.cycle); const wvY = mkWave(hY); wvY.g.position.set(0, 0, -3.0); const shY = ship(hY, 0.5, { nx: 3, nz: 2, ny: 2, seed: 31 }); const ctY = coinTowerMk(hY, 7.0, 4.4, 16);
      ANCH.cy_wave = () => V(0, 8.6, -3.0); ANCH.cy_debt = () => V(7.0, 4.4, 4.4); wrapAnch(["cy_wave", "cy_debt"], PL.cycle); lampAt(hY, 0, 12, 4, 40);
      upd((t) => { showHero("cycle", hY, t); waveUpd(wvY, t, TT.cyc_on); const x = Math.sin(t * 0.5) * 2.2; shY.g.scale.setScalar(0.5 * pop(t, TT.cyc_on + 0.4, 0.5)); shY.g.position.set(x, wvY.H(x, t), -3.0); shY.g.rotation.z = Math.atan(1.0 * Math.cos(x * 0.5 - t * 1.6)) * 0.5; coinTowerUpd(ctY, t, TT.debt_on); });

      /* 4 · opex : crew, insurance, maintenance, a clock for "per day" */
      const hO = grp(PL.opex); const shO = ship(hO, 0.6, { nx: 3, nz: 2, ny: 2, seed: 41 }); shO.g.position.set(0, 0, -4.2); shO.g.rotation.y = 0.2;
      const crewO = []; for (let i = 0; i < 3; i++) { const w = worker(hO, P.orange, 1.15); w.g.position.set(-5.4 + i * 1.5, 0, 3.0); crewO.push(w); }
      const shieldO = shieldMk(hO, 4.8, 3.4); const wrO = prop("adjustable_wrench", 3.2, hO); wrO.position.set(0.4, 0.4, 5.6); wrO.rotation.y = 0.6; const clkO = clockObj(hO, 1.0); clkO.g.position.set(0, 9.6, -4.2);
      ANCH.op_crew = () => V(-3.9, 3.6, 3.0); ANCH.op_shield = () => V(4.8, 4.0, 3.4); ANCH.op_wrench = () => V(0.4, 2.4, 5.6); ANCH.op_clock = () => V(0, 12.6, -4.2); wrapAnch(["op_crew", "op_shield", "op_wrench", "op_clock"], PL.opex); lampAt(hO, 0, 12, 4, 40);
      upd((t) => { showHero("opex", hO, t); shO.g.scale.setScalar(0.6 * pop(t, TT.ops_on, 0.6)); crewO.forEach((w, i) => { w.g.scale.setScalar(1.15 * pop(t, TT.crew_on + i * 0.1, 0.4)); w.armR.rotation.z = Math.sin(t * 3 + i) * 0.25; });
        shieldO.scale.setScalar(pop(t, TT.ass_on, 0.5)); shieldO.rotation.y = Math.sin(t * 1.3) * 0.5; wrO.scale.setScalar(pop(t, TT.ent_on, 0.5)); wrO.rotation.y = 0.6 + t * 0.9;
        clkO.g.scale.setScalar(pop(t, TT.day_on, 0.5)); clkO.h2.rotation.z = -(t - TT.day_on) * 4.5; clkO.h1.rotation.z = -(t - TT.day_on) * 0.4; });

      /* 5 · carburant : about a third of the cost per container */
      const hU = grp(PL.carburant); const pieU = pieMake(hU, [[0.333, "#ff6b5e", { roughness: 0.25 }], [0.667, "#2f9ad8", { roughness: 0.25 }]], 4.2, 0.4); pieU.g.position.set(0, 0, -1.4); const fuU = fuelMk(hU, 6.6, 3.8); const shU = ship(hU, 0.5, { nx: 3, nz: 2, ny: 2, seed: 51 }); shU.g.position.set(-5.2, 0, 4.0);
      ANCH.fu_pie = () => V(Math.sin(pieU.sl[0].mid) * 3.0, 2.8, -1.4 + Math.cos(pieU.sl[0].mid) * 3.0); ANCH.fu_can = () => V(6.6, 3.2, 3.8); wrapAnch(["fu_pie", "fu_can"], PL.carburant); lampAt(hU, 0, 10, 3, 32);
      upd((t) => { showHero("carburant", hU, t); pieU.sl.forEach((s_, i) => { const t0 = i ? TT.pie_blue : TT.fuel_on; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 1.0 * Math.min(1, prog(t, TT.third_on, 0.6)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); }); fuU.scale.setScalar(pop(t, TT.fuel_on, 0.5)); fuU.rotation.y = t * 0.8; shU.g.scale.setScalar(0.5 * pop(t, TT.pie_blue + 0.1, 0.5)); });

      /* 6 · port : the ship waits at the quay, the crane is still, costs keep burning */
      const hQ = grp(PL.port); put(hQ, rb(17, 0.7, 5.2, "#3a4660", 0.1, mat("#3a4660", { roughness: 0.8 })), 0, 0, 4.6); const shQ = ship(hQ, 0.7, { nx: 5, nz: 3, ny: 3, seed: 61 }); shQ.g.position.set(0, 0, -2.4);
      const crane = grp(hQ, 0, 0, 0); { const cm = mat("#f2b632", { roughness: 0.4 }); put(crane, rb(0.6, 9, 0.6, "#f2b632", 0.05, cm), -3.2, 0, 1.4); put(crane, rb(0.6, 9, 0.6, "#f2b632", 0.05, cm), 3.2, 0, 1.4); put(crane, rb(7.0, 0.7, 0.7, "#f2b632", 0.05, cm), 0, 9, 1.4); put(crane, rb(0.7, 0.7, 11, "#f2b632", 0.05, cm), 0, 9.6, -2.4); }
      const clkQ = clockObj(hQ, 0.9); clkQ.g.position.set(7.4, 7.8, -2.0); const dropQ = []; for (let k = 0; k < 14; k++) { const c = coinM(0.4); c.visible = false; hQ.add(c); dropQ.push(c); }
      ANCH.po_ship = () => V(0, 5.4, -2.4); ANCH.po_clock = () => V(7.4, 11.0, -2.0); wrapAnch(["po_ship", "po_clock"], PL.port); lampAt(hQ, 0, 13, 5, 40);
      upd((t) => { showHero("port", hQ, t); shQ.g.scale.setScalar(0.7 * pop(t, TT.port_on, 0.7)); shQ.g.position.y = Math.sin(t * 1.0) * 0.06; crane.scale.setScalar(pop(t, TT.port_on + 0.2, 0.6)); clkQ.g.scale.setScalar(0.9 * pop(t, TT.cost_on, 0.5)); clkQ.h2.rotation.z = -(t - TT.cost_on) * 5; clkQ.h1.rotation.z = -(t - TT.cost_on) * 0.4;
        dropQ.forEach((c, k) => { const u = (((t - TT.cost_on) * 0.6 + k / 14) % 1 + 1) % 1; c.visible = t >= TT.cost_on; c.position.set(-5 + (k % 5) * 2.4, 6.6 - u * 6.2, 4.0 + ((k * 3) % 3) * 0.8); c.rotation.x = t * 5; }); });

      /* 7 · fret : freight index x2.5, the owner cashes in */
      const hR = grp(PL.fret); const bar23 = rb(3.0, 1, 3.0, P.blue, 0.2, mat("#3f8fd0", { roughness: 0.3, metalness: 0.2 })); put(hR, bar23, -3.4, 0, -3.0); const bar24 = rb(3.0, 1, 3.0, P.gold, 0.2, mat(P.gold, { roughness: 0.3, metalness: 0.4 })); put(hR, bar24, 3.4, 0, -3.0);
      const shR = ship(hR, 0.5, { nx: 3, nz: 2, ny: 2, seed: 71 }); shR.g.position.set(0, 0, 5.4); const rainR = []; for (let k = 0; k < 14; k++) { const c = coinM(0.45); c.visible = false; hR.add(c); rainR.push(c); }
      ANCH.fr_b23 = () => V(-3.4, 3.6, -3.0); ANCH.fr_b24 = () => V(3.4, 8.6, -3.0); ANCH.fr_ship = () => V(0, 4.2, 5.4); wrapAnch(["fr_b23", "fr_b24", "fr_ship"], PL.fret); lampAt(hR, 0, 12, 5, 40, "#ffe0b0");
      upd((t) => { showHero("fret", hR, t); const a = pop(t, TT.frt_on, 0.7); bar23.scale.y = 3.0 * a; bar24.scale.y = Math.max(0.001, 7.5 * pop(t, TT.b24_on, 0.8)); bar24.visible = t >= TT.b24_on - 0.02; shR.g.scale.setScalar(0.5 * pop(t, TT.gain_on - 0.4, 0.5));
        rainR.forEach((c, k) => { const u = (((t - TT.gain_on) * 0.7 + k / 14) % 1 + 1) % 1; c.visible = t >= TT.gain_on; c.position.set(-1.6 + (k % 5) * 0.8, 8.0 - u * 6.0, 5.4 + ((k % 3) - 1) * 0.5); c.rotation.x = t * 6; }); });

      /* 8 · commandes : hundreds of new ships ordered */
      const hD = grp(PL.commandes); const newShips = []; for (let i = 0; i < 12; i++) { const sp = ship(hD, 0.42, { nx: 3, nz: 2, ny: 2, seed: 80 + i, hull: "#34c3a0" }); sp.g.position.set((i % 3 - 1) * 5.3, 0, -7.0 + Math.floor(i / 3) * 4.0); newShips.push(sp); }
      ANCH.or_row = () => V(0, 3.6, -7.0); ANCH.or_row2 = () => V(0, 3.6, 3.4); wrapAnch(["or_row", "or_row2"], PL.commandes); lampAt(hD, 0, 12, 2, 40);
      upd((t) => { showHero("commandes", hD, t); newShips.forEach((sp, i) => { const t0 = TT.ord_on + i * 0.5; const p0 = prog(t, t0, 0.5); sp.g.visible = p0 > 0; sp.g.scale.setScalar(0.42); sp.g.position.y = (1 - bounce(p0)) * 6; }); });

      /* 9 · surcapacite : too many ships, rates and value fall */
      const hZ = grp(PL.surcap); const jam = []; for (let i = 0; i < 6; i++) { const sp = ship(hZ, 0.5, { nx: 3, nz: 2, ny: 2, seed: 90 + i, hull: "#7b8794" }); sp.g.position.set((i % 2 - 0.5) * 7.0, 0, -6.0 + Math.floor(i / 2) * 3.8); jam.push(sp); }
      const arZ = arrowDown(hZ, 0, 9.0, -1.0); const ctZ = coinTowerMk(hZ, 7.4, 4.8, 12);
      ANCH.sc_arrow = () => V(0, 12.4, -1.0); ANCH.sc_val = () => V(7.4, 3.6, 4.8); wrapAnch(["sc_arrow", "sc_val"], PL.surcap); lampAt(hZ, 0, 12, 4, 34, "#cfe0ff");
      upd((t) => { showHero("surcap", hZ, t); jam.forEach((sp, i) => { sp.g.scale.setScalar(0.5 * pop(t, TT.over_on + i * 0.18, 0.4)); }); const a = pop(t, TT.rate_on, 0.5); arZ.scale.setScalar(a); arZ.position.y = 9.0 + 0.4 * Math.sin(t * 4) - (a > 0.5 ? 0.6 : 0);
        ctZ.cs.forEach((c, k) => { const p0 = prog(t, TT.over_on + 0.5 + k * 0.05, 0.3); const gone = t >= TT.val_on + (11 - k) * 0.12; c.visible = p0 > 0 && !gone; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 10 · verdict : a heavy asset financed by debt, riding the cycle */
      const hV = grp(PL.verdict); const wvV = mkWave(hV); wvV.g.position.set(0, 0, -3.2); const shV = ship(hV, 0.5, { nx: 3, nz: 2, ny: 2, seed: 101 });
      const wtV = grp(hV, -6.4, 0, 3.6); put(wtV, cyl(1.3, 2.2, 2.4, "#4a5262", 6, mat("#4a5262", { roughness: 0.4, metalness: 0.8 })), 0, 1.2, 0); put(wtV, cyl(0.9, 1.3, 0.6, "#5b6577", 6, mat("#5b6577", { roughness: 0.4, metalness: 0.8 })), 0, 2.7, 0); const ctV = coinTowerMk(hV, 6.6, 3.8, 14);
      ANCH.vd_wave = () => V(0, 8.8, -3.2); ANCH.vd_weight = () => V(-6.4, 4.6, 3.6); ANCH.vd_debt = () => V(6.6, 4.2, 3.8); wrapAnch(["vd_wave", "vd_weight", "vd_debt"], PL.verdict); lampAt(hV, 0, 12, 4, 40);
      upd((t) => { showHero("verdict", hV, t); waveUpd(wvV, t, TT.ver_on); const x = Math.sin(t * 0.45 + 1) * 2.4; shV.g.scale.setScalar(0.5 * pop(t, TT.ver_on + 0.4, 0.5)); shV.g.position.set(x, wvV.H(x, t), -3.2); shV.g.rotation.z = Math.atan(Math.cos(x * 0.5 - t * 1.6)) * 0.5; wtV.scale.setScalar(pop(t, TT.heavy_on, 0.5)); coinTowerUpd(ctV, t, TT.dette_on); });

      /* 11 · cta : a comment bubble and a subscribe button (glossy) */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
