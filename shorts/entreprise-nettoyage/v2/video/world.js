      /* =====================================================================
         WORLD v2 : an open-plan office floor, real CC0 models (Poly Haven) + custom-built pieces, PBR lighting.
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
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughnessMap: fR, normalMap: fN, normalScale: new THREE.Vector2(0.6, 0.6), color: "#1b4a54", roughness: 0.75, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(B.ringC[0], -0.02, B.ringC[1]); floor.receiveShadow = true; scene.add(floor);

      /* far skyline behind a glass wall, mint bokeh, a ring of soft floor lights per place */
      const backdrop = grp(scene); const sil = M("#0f3a40", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.green, P.gold, P.sky][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 12; i++) { const w = 8 + rn() * 6, h = 10 + rn() * 18; const b = rb(w, h, 8, "#0f3a40", 0.2, sil); b.position.set(-80 + i * 14 + rn() * 4, 0, -190 - rn() * 20); backdrop.add(b); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) { if (rn() > 0.55) continue; const wn = rb(1.2, 1.0, 0.2, P.gold, 0.05, emis(P.gold, 0.5)); wn.castShadow = false; wn.position.set(b.position.x + (c - 1) * 2.6, 2 + r * 2.8, b.position.z + 4.1); backdrop.add(wn); } }
      const rugs = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#0f3d45", roughness: 0.95, metalness: 0 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.012; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 8, 72), emis(P.green, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); rugs.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders (custom, PBR) ---- */
      const mat = (hex, o = {}) => M(hex, Object.assign({ roughness: 0.6, metalness: 0.05 }, o));
      function worker(p, vest = P.gold, s = 1) { const g = grp(p); g.scale.setScalar(s);
        const uni = mat("#1d3a46", { roughness: 0.85 }), skin = mat("#f0c9a8", { roughness: 0.7 });
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 6, 14), uni); torso.position.y = 1.18; torso.castShadow = true; g.add(torso);
        const vs = new THREE.Mesh(new THREE.CapsuleGeometry(0.335, 0.5, 6, 14), mat(vest, { roughness: 0.55 })); vs.position.y = 1.2; vs.scale.set(1, 1, 0.78); vs.castShadow = true; g.add(vs);
        [0.98, 1.22].forEach((y) => { const st = rb(0.7, 0.07, 0.5, "#dfe6e8", 0.02, mat("#dfe6e8", { roughness: 0.25, metalness: 0.7 })); st.position.set(0, y, 0); st.scale.set(1, 1, 0.8); g.add(st); });
        const head = sph(0.24, "#f0c9a8", 14, skin); head.position.y = 1.85; g.add(head); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat("#ffffff", { roughness: 0.5 })); cap.position.y = 1.9; cap.castShadow = true; g.add(cap); put(g, rb(0.3, 0.04, 0.22, "#ffffff", 0.02), 0, 1.92, 0.22);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.55, 0); put(q, rb(0.15, 0.55, 0.15, "#1d3a46", 0.07, uni), 0, -0.55, 0); const gl = sph(0.1, "#f2c230", 8, mat("#f2c230", { roughness: 0.8 })); gl.position.y = -0.58; q.add(gl); return q; };
        const leg = (sx) => { const l = grp(g, sx * 0.15, 0.78, 0); put(l, rb(0.2, 0.78, 0.2, "#16303a", 0.08, mat("#16303a", { roughness: 0.9 })), 0, -0.78, 0); put(l, rb(0.22, 0.1, 0.32, "#10181b", 0.04, mat("#10181b", { roughness: 0.6 })), 0, -0.78, 0.04); return l; };
        return { g, body: vs, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      const GOLD = () => mat("#e6b422", { roughness: 0.28, metalness: 0.95 });
      const coinM = (r = 0.5) => { const m = cyl(r, r, 0.14, P.gold, 24, GOLD()); return m; };
      function office(p, w, h, d, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(w, h, d, hex, 0.12, mat(hex, { roughness: 0.35, metalness: 0.25 })), 0, 0, 0); const cols = Math.max(2, Math.round(w / 1.5)), rows = Math.max(2, Math.round(h / 1.8)); for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const wn = rb(0.8, 0.9, 0.08, P.sky, 0.03, new THREE.MeshStandardMaterial({ color: "#bfe6f0", emissive: P.sky, emissiveIntensity: 0.55, roughness: 0.1, metalness: 0.2 })); wn.castShadow = false; wn.position.set((c - (cols - 1) / 2) * (w / cols), 0.8 + r * (h - 1.2) / rows, d / 2 + 0.02); g.add(wn); } return g; }
      function van(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.6, 1.5, 1.4, hex, 0.2, mat(hex, { roughness: 0.25, metalness: 0.4 })), 0, 0.4, 0); put(g, rb(1.0, 1.0, 1.3, "#bfe6f0", 0.15, mat("#9fd0e0", { roughness: 0.05, metalness: 0.3 })), 1.6, 0.4, 0); [[-0.8], [0.8], [1.8]].forEach(([x]) => { const w = cyl(0.38, 0.38, 1.5, P.navy, 18, mat("#101820", { roughness: 0.9 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, 0); g.add(w); const hub = cyl(0.2, 0.2, 1.55, P.gray, 12, mat("#c8d2d6", { roughness: 0.3, metalness: 0.9 })); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.38, 0); g.add(hub); }); return g; }
      function pieMake(p, parts, r = 4.2, ang0 = 0.3) { const g = grp(p); const sl = []; parts.reduce((ang, [f, col, o]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 48, 1, false, ang, len), mat(col, o || { roughness: 0.3 })); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; g.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, ang0); put(g, cyl(r + 0.3, r + 0.4, 0.3, P.cream, 48, mat("#f2fbf7", { roughness: 0.3 })), 0, -0.05, 0); return { g, sl }; }
      function clockObj(p, s = 1) { const g = grp(p); g.scale.setScalar(s); const rim = cyl(2.6, 2.6, 0.5, P.gold, 40, GOLD()); rim.rotation.x = Math.PI / 2; g.add(rim); const face = cyl(2.3, 2.3, 0.3, P.cream, 40, mat("#f6fbf9", { roughness: 0.35 })); face.rotation.x = Math.PI / 2; face.position.z = 0.3; g.add(face);
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const tk = rb(0.12, i % 3 ? 0.3 : 0.5, 0.12, P.navy, 0.03); tk.position.set(Math.sin(a) * 1.9, Math.cos(a) * 1.9 - 0.2, 0.5); tk.rotation.z = -a; g.add(tk); }
        const h1 = grp(g, 0, 0, 0.55), h2 = grp(g, 0, 0, 0.62); put(h1, rb(0.18, 1.3, 0.1, P.navy, 0.04), 0, 0, 0); put(h2, rb(0.12, 1.9, 0.1, P.red, 0.03), 0, 0, 0); return { g, h1, h2 }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 32, mat("#0f3a3f", { roughness: 0.4 })), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 8, 48), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 8) => { const g = grp(p); const a = rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), b = rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };
      const lampAt = (p, x, y, z, k = 14, col = "#fff4dc") => { const l = new THREE.PointLight(col, k, 26, 1.6); l.position.set(x, y, z); p.add(l); return l; };

      /* 1 · marche : a real open-plan office (desks, laptops, chairs), 600 000 people (a crowd of vests), 15 000 small companies (vans), the 21 Md€ coin tower */
      const hM = grp(PL.marche); [[-6.4, 6.6, '#5c8a96'], [-2.2, 9.0, '#4a7a88'], [2.0, 7.4, '#6a98a4'], [6.2, 10.0, '#3f6e7c']].forEach(([x, h, c]) => { const o = office(hM, 3.4, h, 3.0, c, 1); o.position.set(x, 0, -9); });
      [-6.2, -2.2, 1.8, 5.8].forEach((x) => { const d = prop("metal_office_desk", 1.9, hM); d.position.set(x, 0, -5.6); const lp = prop("classic_laptop", 0.3, d); lp.position.set(0, 1.18, 0.05); const ch = prop("modern_arm_chair_01", 1.8, hM); ch.position.set(x + 0.3, 0, -3.9); ch.rotation.y = Math.PI * 0.9; });
      const crowd = []; for (let i = 0; i < 40; i++) { const w = worker(hM, P.gold, 0.8); w.g.position.set(-5.0 + (i % 10) * 1.1, 0, -1.8 + Math.floor(i / 10) * 1.1); crowd.push(w); }
      const vans = []; for (let i = 0; i < 12; i++) { const v = van(hM, [P.green, P.blue, P.orange][i % 3], 0.8); v.position.set(-5.6 + (i % 6) * 2.2, 0, 4.6 + Math.floor(i / 6) * 2.0); vans.push(v); }
      const coinTower = grp(hM, 7.4, 0, 2.6); const mcs = []; for (let k = 0; k < 16; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); coinTower.add(c); mcs.push(c); }
      ANCH.mc_crowd = () => V(0, 3.6, 0.5); ANCH.mc_vans = () => V(0, 3.2, 5.6); ANCH.mc_coin = () => V(7.4, 4.2, 2.6); wrapAnch(["mc_crowd", "mc_vans", "mc_coin"], PL.marche); lampAt(hM, 0, 12, 2, 40);
      upd((t) => { showHero("marche", hM, t); crowd.forEach((w, i) => { w.g.scale.setScalar(0.8 * pop(t, TT.figs_on + i * 0.04, 0.35)); w.armR.rotation.z = Math.sin(t * 3 + i) * 0.3; }); vans.forEach((v, i) => { v.scale.setScalar(0.8 * pop(t, TT.vans_on + i * 0.06, 0.4)); }); mcs.forEach((c, k) => { const p0 = prog(t, TT.coin_on - 1.2 + k * 0.07, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 2 · marge : a thin 10 % slice of the pie is what stays after wages, a laptop and notepads behind */
      const hG = grp(PL.marge); const pie2 = pieMake(hG, [[0.1, "#ffd84a", { roughness: 0.2, metalness: 0.8 }], [0.9, "#2f9ad8", { roughness: 0.25, metalness: 0.1 }]], 4.6, 0.4);
      const dskG = prop("metal_office_desk", 2.0, hG); dskG.position.set(-1.0, 0, -8); const lpG = prop("classic_laptop", 0.32, dskG); lpG.position.set(0, 1.26, 0.05); const npG = prop("office_notepads", 0.2, dskG); npG.position.set(0.9, 1.26, 0.2);
      ANCH.mg_pie = () => V(Math.sin(pie2.sl[0].mid) * 3.2, 2.8, Math.cos(pie2.sl[0].mid) * 3.2); wrapAnch(["mg_pie"], PL.marge); lampAt(hG, 0, 9, 3, 30);
      upd((t) => { showHero("marge", hG, t); pie2.sl.forEach((s_, i) => { const t0 = i ? TT.pie_blue : TT.pie_on; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 1.0 * Math.min(1, prog(t, TT.pie_on, 0.6)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); }); });

      /* 3 · capital : a worker with a real bucket, broom and bottle owns almost nothing; 11 000 against 76 000 euros per employee (a tower of equipment) */
      const hCa = grp(PL.capital); const w3 = worker(hCa, P.gold, 1.8); w3.g.position.set(-5.4, 0, 2.2);
      const small = grp(hCa, 2.0, 0, 1.5); const bk = prop("wooden_bucket_01", 1.6, small); bk.position.set(-0.7, 0, 0); const br = prop("plastic_broom", 4.2, small); br.position.set(0.6, 0, 0.2); br.rotation.z = -0.12; const bt = prop("multi_cleaner_bottle", 1.2, small); bt.position.set(1.3, 0, 0.5); const dp = prop("dustpan", 0.4, small); dp.position.set(0.0, 0, 1.0);
      const tower = grp(hCa, 6.6, 0, 0); const tw = []; { const items = [["cardboard_box_01", 2.0], ["cardboard_box_01", 2.0], ["industrial_storage_cart", 2.2], ["cardboard_box_01", 2.0], ["plastic_crate_01", 1.4], ["Television_01", 1.7], ["classic_laptop", 0.3], ["CashRegister_01", 1.1]]; let y = 0; items.forEach(([n, h], i) => { const m = prop(n, h, tower); m.position.set((i % 2 ? 0.15 : -0.15), y, 0); y += h * (n === "classic_laptop" ? 1.0 : 0.98); tw.push({ m, y0: y }); }); }
      ANCH.cp_fig = () => V(-5.4, 5.6, 2.2); ANCH.cp_small = () => V(2.0, 4.0, 1.5); ANCH.cp_big = () => V(6.6, 13.4, 0); wrapAnch(["cp_fig", "cp_small", "cp_big"], PL.capital); lampAt(hCa, 0, 11, 4, 36);
      upd((t) => { showHero("capital", hCa, t); w3.g.scale.setScalar(1.8 * pop(t, TT.fig_on, 0.5)); w3.armR.rotation.z = Math.sin(t * 2.2) * 0.4; small.scale.setScalar(pop(t, TT.k11 - 0.3, 0.5)); tw.forEach(({ m }, i) => { const k = pop(t, TT.k76 - 0.3 + i * 0.12, 0.45); m.scale.setScalar(k); }); });

      /* 4 · salaires : most of the value added goes to wages (a thick stack of banknote bundles, a thin gold bar on top), a real cash register */
      const hS = grp(PL.salaires); const stk = grp(hS, 0, 0, 0); const bundles = []; for (let k = 0; k < 18; k++) { const b = rb(5.0, 0.5, 3.0, "#3c8c58", 0.06, mat("#3c8c58", { roughness: 0.7 })); b.position.set(0, k * 0.5, 0); stk.add(b); bundles.push(b); const bd = rb(5.05, 0.18, 1.0, "#e9e2cc", 0.02, mat("#e9e2cc", { roughness: 0.8 })); bd.position.set(0, k * 0.5 + 0.17, 0); stk.add(bd); bd.castShadow = false; }
      const gold = rb(5.0, 1.0, 3.0, P.gold, 0.1, GOLD()); gold.position.y = 9.05; stk.add(gold); const reg = prop("CashRegister_01", 2.2, hS); reg.position.set(6.2, 0, 2.4); reg.rotation.y = -0.6;
      const bills = []; for (let k = 0; k < 10; k++) { const b = rb(1.6, 0.06, 0.9, "#3c8c58", 0.02, mat("#4aa66a", { roughness: 0.7 })); b.castShadow = false; hS.add(b); bills.push(b); }
      ANCH.sl_bar = () => V(0, 11.6, 0); wrapAnch(["sl_bar"], PL.salaires); lampAt(hS, 0, 13, 5, 36);
      upd((t) => { showHero("salaires", hS, t); const a = pop(t, TT.sal_on, 0.8); bundles.forEach((b, k) => { const kk = pop(t, TT.sal_on + k * 0.03, 0.4); b.scale.y = kk; b.visible = kk > 0.01; }); stk.children.forEach((c, i) => { if (i % 2) c.visible = true; }); gold.scale.y = pop(t, TT.va_on, 0.5); stk.rotation.y = Math.sin(t * 0.8) * 0.3; reg.scale.setScalar(pop(t, TT.sal_on + 0.5, 0.5));
        bills.forEach((b, k) => { const u = (((t - TT.sal_on) * 0.4 + k / 10) % 1 + 1) % 1; b.visible = t > TT.sal_on + 0.3; b.position.set(lerp(-1.0, -6.0, u), 7.0 - u * 6.0 + Math.sin(u * 6.28) * 0.4, 2.0); b.rotation.set(u * 6, u * 4, 0); }); });

      /* 5 · tp : 25 workers, 11 of them (44 %) are part-time and each gets a real wall clock showing half a day */
      const hT = grp(PL.tp); const g5 = []; for (let i = 0; i < 25; i++) { const w = worker(hT, i < 11 ? P.orange : P.gold, 1.1); w.g.position.set(-5.6 + (i % 5) * 2.8, 0, -4.4 + Math.floor(i / 5) * 2.2); g5.push(w); }
      ANCH.tp_grid = () => V(0, 4.6, 0); wrapAnch(["tp_grid"], PL.tp); lampAt(hT, 0, 12, 2, 36);
      upd((t) => { showHero("tp", hT, t); g5.forEach((w, i) => { const base = pop(t, HW.tp[0][0] + 0.1 + i * 0.03, 0.4); const part = i < 11 && t >= TT.tp_on + i * 0.06; const k = part ? 0.6 + 0.4 * (1 - eOut(prog(t, TT.tp_on + i * 0.06, 0.5))) : 1; w.g.scale.set(1.1 * base, 1.1 * base * k, 1.1 * base); w.body.material = mat(part ? P.orange : P.gold, { roughness: 0.55 }); }); });

      /* 6 · aube : the working day starts at 6 o'clock, a sun rises behind a glass wall, 31 % of the cleaners already walk */
      const hA = grp(PL.aube); const clkA = clockObj(hA, 1.3); clkA.g.position.set(-3.8, 8.6, -2); clkA.h1.rotation.z = Math.PI; clkA.h2.rotation.z = Math.PI;
      const sunB = sph(2.4, P.gold, 24, emis(P.gold, 1.8)); hA.add(sunB); sunB.castShadow = false; const glass = rb(18, 9, 0.2, "#8fd8e8", 0.05, new THREE.MeshStandardMaterial({ color: "#8fd8e8", transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2 })); glass.castShadow = false; put(hA, glass, 0, 0, -3); [-9, -3, 3, 9].forEach((x) => put(hA, rb(0.35, 9, 0.35, "#1c3a40", 0.04, mat("#1c3a40", { roughness: 0.4, metalness: 0.5 })), x, 0, -3));
      const wk = []; for (let i = 0; i < 10; i++) { const w = worker(hA, i < 3 ? P.gold : P.gray, 1.3); w.g.position.set(-7 + i * 1.5, 0, 3); wk.push(w); }
      ANCH.au_clock = () => V(-3.8, 12.6, -2); ANCH.au_sun = () => V(5.0, 9.4, -4); ANCH.au_crowd = () => V(0, 4.0, 3); wrapAnch(["au_clock", "au_sun", "au_crowd"], PL.aube); lampAt(hA, 0, 10, 6, 30, "#ffd6a0");
      upd((t) => { showHero("aube", hA, t); const u = eInOut(clamp((t - TT.sun_on) / 3.0)); sunB.position.set(5.0, lerp(0.2, 8.4, u), -9); clkA.g.scale.setScalar(1.3 * pop(t, TT.h6, 0.5)); wk.forEach((w, i) => { const base = pop(t, TT.sun_on + 0.2 + i * 0.05, 0.4); w.g.scale.setScalar(1.3 * base); const act = i < 3 && t >= TT.share31; w.body.material = mat(act ? P.gold : P.gray, { roughness: 0.55 }); walk(w, t * 1.1 + i, act ? 7 : 0); }); });

      /* 7 · ao : three bids on real clipboards and desks, the lowest price wins */
      const hO = grp(PL.ao); const bars = [[-5.0, 5.4, P.red], [0, 3.2, P.green], [5.0, 4.4, P.blue]].map(([x, h, c]) => { const b = rb(3.0, h, 3.0, c, 0.15, mat(c, { roughness: 0.3, metalness: 0.2 })); put(hO, b, x, 0, 0); const cb = prop("clipboard", 0.2, hO); cb.position.set(x, h + 0.02, 0); const bigcb = cb; return { b, cb, h, x }; });
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), new THREE.MeshStandardMaterial({ color: "#ffd84a", emissive: "#ffd84a", emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.9 })); star.position.set(0, 6.0, 0); hO.add(star);
      const dk = prop("metal_office_desk", 2.0, hO); dk.position.set(0, 0, -7.5);
      ANCH.ao_win = () => V(0, 7.8, 0); ANCH.ao_row = () => V(0, 6.2, 0); wrapAnch(["ao_win", "ao_row"], PL.ao); lampAt(hO, 0, 12, 4, 36);
      upd((t) => { showHero("ao", hO, t); bars.forEach(({ b, cb, h, x }, i) => { const k = pop(t, TT.env_on + i * 0.35, 0.6); b.scale.y = k; cb.position.y = h * k + 0.02; cb.scale.setScalar(Math.max(0.001, k) * 1.0); cb.rotation.y = (i - 1) * 0.3; }); const s = pop(t, TT.win_on, 0.5); star.scale.setScalar(s); star.visible = s > 0.01; star.rotation.y = t * 2; star.position.y = 4.6 + Math.sin(t * 3) * 0.2; });

      /* 8 · reprise : the contract changes hands, the team stays */
      const hR = grp(PL.reprise); const oA = office(hR, 4.2, 5.4, 3.0, P.blue, 1); oA.position.set(-6.4, 0, -3); const oB = office(hR, 4.2, 5.4, 3.0, P.orange, 1); oB.position.set(6.4, 0, -3);
      const team = []; for (let i = 0; i < 5; i++) { const w = worker(hR, P.gold, 1.4); w.g.position.set(-3.0 + i * 1.5, 0, 3.2); team.push(w); }
      const paper = grp(hR, 0, 0, 0); { put(paper, rb(2.6, 0.12, 3.4, "#f8fbfa", 0.04, mat("#f8fbfa", { roughness: 0.6 })), 0, 0, 0); for (let i = 0; i < 4; i++) { const ln = rb(1.8, 0.04, 0.1, P.navy, 0.01); ln.position.set(0, 0.1, -1.0 + i * 0.6); paper.add(ln); } }
      const cbR = prop("clipboard", 0.2, hR); cbR.position.set(0, 0, 6.0); cbR.scale.setScalar(2.0);
      ANCH.rp_a = () => V(-6.4, 7.2, -3); ANCH.rp_b = () => V(6.4, 7.2, -3); ANCH.rp_team = () => V(0, 4.6, 3.2); wrapAnch(["rp_a", "rp_b", "rp_team"], PL.reprise); lampAt(hR, 0, 12, 4, 36);
      upd((t) => { showHero("reprise", hR, t); const u = eInOut(prog(t, TT.move_on, 1.2)); paper.position.set(lerp(-5.0, 5.0, u), 4.6 + Math.sin(u * Math.PI) * 1.6, -1.0); paper.rotation.y = u * 6.28; paper.scale.setScalar(pop(t, TT.ct_on, 0.5));
        team.forEach((w, i) => { w.g.scale.setScalar(1.4 * pop(t, TT.ct_on + i * 0.1, 0.4)); const stay = t >= TT.stay_on; w.body.material = mat(stay ? P.green : P.gold, { roughness: 0.55 }); w.armR.rotation.z = stay ? Math.sin(t * 4 + i) * 0.5 - 1.6 : 0; }); });

      /* 9 · planning : a weekly planning board filled hour by hour, real notepads and stationery on a desk */
      const hP = grp(PL.planning); const board = grp(hP, 0, 0, 0); put(board, rb(10.4, 8.6, 0.6, P.navy, 0.15, mat("#e9f2f0", { roughness: 0.3 })), 0, 0, 0); put(board, rb(10.8, 0.5, 0.8, P.gold, 0.08, GOLD()), 0, 8.6, 0);
      const cells = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) { const cc = [P.green, P.blue, P.gold, P.pink][(r * 2 + c) % 4]; const cell = rb(1.6, 1.0, 0.3, cc, 0.08, mat(cc, { roughness: 0.5 })); cell.position.set(-4.0 + c * 2.0, 0.6 + r * 1.3, 0.4); board.add(cell); cells.push(cell); }
      const person10 = worker(hP, P.gold, 1.6); person10.g.position.set(6.6, 0, 3.2); const dsk9 = prop("metal_office_desk", 1.9, hP); dsk9.position.set(-5.6, 0, 6.0); const st9 = prop("stationery_supplies", 0.5, dsk9); st9.position.set(-0.3, 1.18, 0.1); const np9 = prop("office_notepads", 0.2, dsk9); np9.position.set(0.6, 1.18, 0.2);
      ANCH.pl_board = () => V(0, 10.4, 0); wrapAnch(["pl_board"], PL.planning); lampAt(hP, 0, 12, 6, 36);
      upd((t) => { showHero("planning", hP, t); board.scale.setScalar(pop(t, TT.board_on, 0.6)); cells.forEach((c, i) => { const t0 = TT.fill_on + i * 0.07; const k = pop(t, t0, 0.35); c.scale.set(k, k, 1); c.visible = t >= t0 - 0.02; }); person10.armR.rotation.z = Math.sin(t * 3) * 0.6 - 1.2; });

      /* 10 · heures : square metres crossed out (tiled floor + a real wet floor sign), hours of work that fill minute by minute */
      const hH = grp(PL.heures); const tiles = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const tl = rb(1.3, 0.2, 1.3, (r + c) % 2 ? P.cream : P.sky, 0.04, mat((r + c) % 2 ? "#f2fbf7" : "#c9f0ea", { roughness: 0.2 })); tl.position.set(-4.0 + c * 1.5, 0, 4.2 + r * 1.5 - 1.0); hH.add(tl); tiles.push(tl); }
      const crossH = cross(hH, 10); crossH.position.set(0, 10.5, 7.5); const clkH = clockObj(hH, 1.4); clkH.g.position.set(0, 7.4, -2); const dropC = []; for (let k = 0; k < 12; k++) { const c = coinM(0.45); c.visible = false; hH.add(c); dropC.push(c); }
      const wH = worker(hH, P.gold, 1.7); wH.g.position.set(-6.0, 0, -1); const bkH = prop("wooden_bucket_01", 1.6, hH); bkH.position.set(-3.6, 0, 0.6); const sgH = prop("WetFloorSign_01", 3.4, hH); sgH.position.set(3.4, 0, 3.0); sgH.rotation.y = -0.5; const brH = prop("plastic_broom", 4.4, hH); brH.position.set(-4.4, 0, 1.4); brH.rotation.z = 0.2; const botH = prop("multi_cleaner_5_litre", 1.4, hH); botH.position.set(-2.4, 0, 1.2); const cartH = prop("industrial_storage_cart", 2.2, hH); cartH.position.set(6.6, 0, -1.4); cartH.rotation.y = -0.4;
      ANCH.ht_floor = () => V(0, 3.2, 6.2); ANCH.ht_clock = () => V(0, 11.6, -2); wrapAnch(["ht_floor", "ht_clock"], PL.heures); lampAt(hH, 0, 12, 4, 36);
      upd((t) => { showHero("heures", hH, t); const cr = t >= TT.cross_on && t < TT.clock_on; crossH.visible = cr; crossH.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1); tiles.forEach((tl, i) => { tl.scale.setScalar(pop(t, HW.heures[0][0] + 0.1 + i * 0.03, 0.3)); });
        const ks = pop(t, TT.clock_on, 0.5); clkH.g.scale.setScalar(1.4 * ks); clkH.g.visible = ks > 0.01; clkH.h2.rotation.z = -(t - TT.clock_on) * 6.0; clkH.h1.rotation.z = -(t - TT.clock_on) * 0.5; wH.armR.rotation.z = Math.sin(t * 3) * 0.5;
        dropC.forEach((c, k) => { const u = (((t - TT.min_on) * 0.7 + k / 12) % 1 + 1) % 1; c.visible = t >= TT.min_on; c.position.set(lerp(-1.5, 2.5, (k % 4) / 3), 7.0 - u * 6.5, -2 + (k % 3)); c.rotation.x = t * 5; }); });

      /* 11 · cta : a comment bubble and a subscribe button (glossy) */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#0f3a3f", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
