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
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughnessMap: fR, normalMap: fN, normalScale: new THREE.Vector2(0.6, 0.6), color: "#2c3850", roughness: 0.75, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(B.ringC[0], -0.02, B.ringC[1]); floor.receiveShadow = true; scene.add(floor);

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

      /* ---- moving truck (custom): hollow cargo box open at the back (-x), cab at +x ---- */
      function truck(p, hex = "#f2ede2", s = 1) { const g = grp(p); g.scale.setScalar(s);
        const cm = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38, metalness: 0.2 });
        const add = (w, h, d, x, y, z, m_, r = 0.08) => { const o = rb(w, h, d, "#fff", r, m_ || cm); o.position.set(x, y, z); g.add(o); return o; };
        add(6.4, 0.3, 3.2, 0, 0.9, 0, mat("#2a3347", { roughness: 0.6 }));
        add(6.4, 2.8, 0.2, 0, 1.2, -1.5); add(6.4, 2.8, 0.2, 0, 1.2, 1.5); add(0.2, 2.8, 3.2, 3.1, 1.2, 0); add(6.4, 0.2, 3.2, 0, 4.0, 0);
        const st = mat(P.orange, { roughness: 0.35 }); add(6.42, 0.55, 0.24, 0, 2.3, -1.5, st, 0.02); add(6.42, 0.55, 0.24, 0, 2.3, 1.5, st, 0.02);
        add(2.3, 2.7, 3.0, 4.5, 0.9, 0, mat("#e9e4d8", { roughness: 0.35, metalness: 0.2 }), 0.25);
        add(0.1, 1.1, 2.6, 5.62, 2.2, 0, mat("#9fc6e6", { roughness: 0.05, metalness: 0.3 }), 0.05);
        add(0.3, 0.35, 3.1, 5.5, 0.95, 0, mat("#1c2433", { roughness: 0.4, metalness: 0.5 }), 0.05);
        const wheels = []; [[-1.7, 0.05], [-0.1, 0.05], [4.6, 0.05]].forEach(([x]) => [-1.55, 1.55].forEach((z) => { const wg = grp(g, x, 0.8, z); const tr = cyl(0.8, 0.8, 0.55, "#101418", 20, mat("#12161c", { roughness: 0.9 })); tr.rotation.x = Math.PI / 2; wg.add(tr); const hb = cyl(0.42, 0.42, 0.6, "#cfd6dc", 14, mat("#cfd6dc", { roughness: 0.3, metalness: 0.9 })); hb.rotation.x = Math.PI / 2; wg.add(hb); wheels.push(wg); }));
        return { g, cm, wheels }; }
      const boxAt = (p, h, x, y, z, ry = 0) => { const b = prop("cardboard_box_01", h, p); b.position.set(x, y, z); b.rotation.y = ry; return b; };
      const bobT = (o, t, a = 0.18, f = 2.2, ph = 0) => { o.position.y = (o.userData.y0 ?? (o.userData.y0 = o.position.y)) + Math.sin(t * f + ph) * a; };

      /* 1 · equipe : 10 000 movers (a crowd of orange vests) behind a truck, a 1.5 billion coin tower */
      const hE = grp(PL.equipe); const trE = truck(hE, "#f2ede2", 0.9); trE.g.position.set(-1.5, 0, -10); trE.g.rotation.y = Math.PI / 2 - 0.25;
      const crowd = []; for (let i = 0; i < 40; i++) { const w = worker(hE, P.orange, 0.8); w.g.position.set(-5.0 + (i % 10) * 1.1, 0, -1.8 + Math.floor(i / 10) * 1.1); crowd.push(w); }
      const carried = []; for (let i = 0; i < 40; i += 3) { const b = boxAt(hE, 0.7, 0, 0, 0); carried.push([i, b]); }
      const coinTower = grp(hE, 7.4, 0, 2.6); const mcs = []; for (let k = 0; k < 16; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); coinTower.add(c); mcs.push(c); }
      ANCH.eq_crowd = () => V(0, 3.6, 0.5); ANCH.eq_coin = () => V(7.4, 4.2, 2.6); wrapAnch(["eq_crowd", "eq_coin"], PL.equipe); lampAt(hE, 0, 12, 2, 40);
      upd((t) => { showHero("equipe", hE, t); crowd.forEach((w, i) => { w.g.scale.setScalar(0.8 * pop(t, TT.figs_on + i * 0.04, 0.35)); w.armR.rotation.z = Math.sin(t * 3 + i) * 0.3; });
        carried.forEach(([i, b]) => { const w = crowd[i]; b.position.set(w.g.position.x, 2.15 * 0.8 * pop(t, TT.figs_on + i * 0.04, 0.35), w.g.position.z); b.scale.setScalar(pop(t, TT.figs_on + i * 0.04 + 0.1, 0.35)); });
        mcs.forEach((c, k) => { const p0 = prog(t, TT.coin_on - 1.2 + k * 0.07, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 2 · camion : movers carry a sofa, a cabinet, an armchair and boxes into the truck; a big clock = hours of work sold */
      const hT = grp(PL.camion); const TX = 3.4, TZ = -4.2, TR = Math.PI / 2 - 0.35; const trT = truck(hT, "#f2ede2", 1.0); trT.g.position.set(TX, 0, TZ); trT.g.rotation.y = TR;
      const BACK = [TX - 3.7 * Math.cos(TR), TZ + 3.7 * Math.sin(TR)];
      boxAt(trT.g, 1.5, -2.2, 1.2, 0.5, 0.2); boxAt(trT.g, 1.3, -1.0, 1.2, -0.6, -0.3); boxAt(trT.g, 1.6, 0.4, 1.2, 0.3, 0.1); boxAt(trT.g, 1.2, 1.5, 1.2, -0.7, 0.5); boxAt(trT.g, 1.2, 2.3, 1.2, 0.6, 0.0);
      const pileItems = []; { const defs = [["sofa_02", 1.7], ["modern_wooden_cabinet", 2.4], ["modern_arm_chair_01", 1.6], ["cardboard_box_01", 1.2], ["cardboard_box_01", 1.0], ["vintage_suitcase", 1.0]]; defs.forEach(([n, h], i) => { const it = prop(n, h, hT); it.position.set(-8.2 + (i % 3) * 2.4, 0, 3.0 + Math.floor(i / 3) * 2.2); it.rotation.y = 0.5 - i * 0.4; pileItems.push(it); }); }
      const carriers = []; for (let i = 0; i < 4; i++) { const w = worker(hT, P.orange, 1.15); const it = cloneProp(i); carriers.push({ w, it }); }
      function cloneProp(i) { const n = ["cardboard_box_01", "modern_arm_chair_01", "cardboard_box_01", "vintage_suitcase"][i]; const o = prop(n, [1.1, 1.5, 0.9, 0.9][i], hT); return o; }
      const clkT = clockObj(hT, 1.2); clkT.g.position.set(-8.4, 9.4, -2.4);
      ANCH.tr_truck = () => V(TX, 6.2, TZ); ANCH.tr_crew = () => V(-2.0, 3.8, 1.2); ANCH.tr_clock = () => V(-8.4, 12.2, -2.4); wrapAnch(["tr_truck", "tr_crew", "tr_clock"], PL.camion); lampAt(hT, 0, 12, 4, 40);
      upd((t) => { showHero("camion", hT, t); const k = pop(t, TT.truck_on, 0.7); trT.g.scale.setScalar(k); pileItems.forEach((it, i) => { it.scale.setScalar(pop(t, TT.truck_on + i * 0.07, 0.4)); });
        clkT.g.scale.setScalar(1.2 * pop(t, TT.hours_on, 0.5)); clkT.h2.rotation.z = -(t - TT.hours_on) * 4.0; clkT.h1.rotation.z = -(t - TT.hours_on) * 0.35;
        carriers.forEach(({ w, it }, i) => { const on = pop(t, TT.crew_on + i * 0.12, 0.4); w.g.scale.setScalar(1.15 * on); const u = (((t - TT.crew_on) * 0.28 + i / 4) % 1 + 1) % 1; const out = u < 0.5; const f = out ? u / 0.5 : (u - 0.5) / 0.5; const x0 = -6.0, z0 = 3.4 + (i % 2) * 0.8, x1 = BACK[0] - 0.4, z1 = BACK[1] + 1.2 - i * 0.4;
          const px = out ? lerp(x0, x1, f) : lerp(x1, x0, f), pz = out ? lerp(z0, z1, f) : lerp(z1, z0, f); w.g.position.set(px, 0, pz); w.g.rotation.y = Math.atan2((out ? x1 - x0 : x0 - x1), (out ? z1 - z0 : z0 - z1)); walk(w, t * 1.2 + i, 8); w.armL.rotation.x = out ? -1.2 : 0; w.armR.rotation.x = out ? -1.2 : 0;
          it.visible = out && on > 0.5; it.position.set(px, 2.2, pz); it.scale.setScalar(1); }); });

      /* 3 · mo : wages are the first cost, they never stop; idle movers keep getting paid */
      const hM = grp(PL.mo); const stk = grp(hM, 0, 0, -1.5); const bundles = []; for (let k = 0; k < 18; k++) { const b = rb(5.0, 0.5, 3.0, "#3c8c58", 0.06, mat("#3c8c58", { roughness: 0.7 })); b.position.set(0, k * 0.5, 0); stk.add(b); bundles.push(b); const bd = rb(5.05, 0.18, 1.0, "#e9e2cc", 0.02, mat("#e9e2cc", { roughness: 0.8 })); bd.position.set(0, k * 0.5 + 0.17, 0); stk.add(bd); bd.castShadow = false; }
      const regM = prop("CashRegister_01", 2.2, hM); regM.position.set(6.4, 0, -2.0); regM.rotation.y = -0.6; const clkM = clockObj(hM, 1.0); clkM.g.position.set(-6.4, 8.2, -2);
      const idle = []; for (let i = 0; i < 4; i++) { const w = worker(hM, P.orange, 1.35); w.g.position.set(-4.6 + i * 2.6, 0, 4.6); idle.push(w); const bx = boxAt(hM, 0.9, -4.6 + i * 2.6 + 0.9, 0, 3.6, 0.3 * i); }
      const billsM = []; for (let k = 0; k < 10; k++) { const b = rb(1.6, 0.06, 0.9, "#3c8c58", 0.02, mat("#4aa66a", { roughness: 0.7 })); b.castShadow = false; hM.add(b); billsM.push(b); }
      ANCH.mo_stack = () => V(0, 10.2, -1.5); ANCH.mo_idle = () => V(-1.5, 5.4, 4.6); wrapAnch(["mo_stack", "mo_idle"], PL.mo); lampAt(hM, 0, 13, 5, 36);
      upd((t) => { showHero("mo", hM, t); bundles.forEach((b, k) => { const kk = pop(t, TT.mo_on + k * 0.04, 0.4); b.scale.y = kk; b.visible = kk > 0.01; }); stk.rotation.y = Math.sin(t * 0.8) * 0.25; regM.scale.setScalar(pop(t, TT.mo_on + 0.5, 0.5)); clkM.g.scale.setScalar(pop(t, TT.mo_on + 0.3, 0.5)); clkM.h2.rotation.z = -(t - TT.mo_on) * 5.0; clkM.h1.rotation.z = -(t - TT.mo_on) * 0.4;
        idle.forEach((w, i) => { w.g.scale.setScalar(1.35 * pop(t, TT.idle_on + i * 0.1, 0.45)); w.armR.rotation.z = Math.sin(t * 1.4 + i) * 0.1; w.body.material = mat(t >= TT.idle_on ? P.gray : P.orange, { roughness: 0.55 }); });
        billsM.forEach((b, k) => { const u = (((t - TT.pay_on) * 0.45 + k / 10) % 1 + 1) % 1; const tgt = idle[k % 4].g.position; b.visible = t > TT.pay_on; b.position.set(lerp(0, tgt.x, u), 7.0 - u * 5.0 + Math.sin(u * 3.14) * 1.4, lerp(-1.5, tgt.z, u)); b.rotation.set(u * 5, u * 4, 0); }); });

      /* 4 · vehicule : purchase / insurance / fuel / maintenance around a truck, coins burn even when it stands still */
      const hV = grp(PL.vehicule); const trV = truck(hV, "#f2ede2", 0.95); trV.g.position.set(0.4, 0, -2.6); trV.g.rotation.y = Math.PI / 2 - 0.5;
      const keyG = grp(hV, -4.8, 0, 3.6); { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 12, 28), GOLD()); rg.castShadow = true; rg.position.y = 3.8; keyG.add(rg); put(keyG, rb(0.4, 2.8, 0.4, P.gold, 0.12, GOLD()), 0, 0.2, 0); put(keyG, rb(0.9, 0.38, 0.38, P.gold, 0.06, GOLD()), 0.5, 0.5, 0); put(keyG, rb(0.7, 0.38, 0.38, P.gold, 0.06, GOLD()), 0.4, 1.1, 0); }
      const shG = grp(hV, 4.8, 0, 3.4); { const sh = new THREE.Shape(); sh.moveTo(0, 2.6); sh.bezierCurveTo(1.4, 2.6, 1.8, 2.2, 1.8, 1.4); sh.bezierCurveTo(1.8, 0.4, 0.9, 0.1, 0, -0.4); sh.bezierCurveTo(-0.9, 0.1, -1.8, 0.4, -1.8, 1.4); sh.bezierCurveTo(-1.8, 2.2, -1.4, 2.6, 0, 2.6); const gm = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2, curveSegments: 18 }); const m = new THREE.Mesh(gm, mat(P.blue, { roughness: 0.25, metalness: 0.5 })); m.castShadow = true; m.position.set(0, 1.0, 0); shG.add(m); const ck = rb(0.35, 1.3, 0.3, P.white, 0.08, mat("#fff", { roughness: 0.3 })); ck.position.set(0.55, 1.35, 0.7); ck.rotation.z = -0.75; shG.add(ck); const ck2 = rb(0.35, 0.7, 0.3, P.white, 0.08, mat("#fff", { roughness: 0.3 })); ck2.position.set(-0.45, 1.5, 0.7); ck2.rotation.z = 0.75; shG.add(ck2); }
      const fuG = grp(hV, 2.4, 0, 6.2); { put(fuG, rb(1.9, 2.4, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.4 })), 0, 0, 0); put(fuG, cyl(0.25, 0.25, 0.5, P.gray, 12, mat("#cfd6dc", { roughness: 0.3, metalness: 0.8 })), -0.5, 2.4, 0); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 8, 18, Math.PI), mat(P.red, { roughness: 0.4 })); hd.position.set(0.5, 2.4, 0); fuG.add(hd); put(fuG, rb(1.1, 0.5, 0.05, P.white, 0.02, mat("#fff", { roughness: 0.5 })), 0, 1.0, 0.47); }
      const wrG = prop("adjustable_wrench", 3.2, hV); wrG.position.set(-2.4, 0.4, 6.0); wrG.rotation.set(0, 0.6, 0);
      const drops = []; for (let k = 0; k < 14; k++) { const c = coinM(0.4); c.visible = false; hV.add(c); drops.push(c); }
      ANCH.ve_key = () => V(-4.8, 5.2, 3.6); ANCH.ve_shield = () => V(4.8, 4.0, 3.4); ANCH.ve_fuel = () => V(2.4, 3.2, 6.2); ANCH.ve_wrench = () => V(-2.4, 2.2, 6.0); ANCH.ve_truck = () => V(0.4, 6.0, -2.6); wrapAnch(["ve_key", "ve_shield", "ve_fuel", "ve_wrench", "ve_truck"], PL.vehicule); lampAt(hV, 0, 12, 4, 40);
      upd((t) => { showHero("vehicule", hV, t); trV.g.scale.setScalar(0.95 * pop(t, TT.veh_on, 0.6)); keyG.scale.setScalar(pop(t, TT.ach_on, 0.5)); shG.scale.setScalar(pop(t, TT.ass_on, 0.5)); fuG.scale.setScalar(pop(t, TT.car_on, 0.5)); wrG.scale.setScalar(3.2 * 0 + pop(t, TT.ent_on, 0.5)); keyG.rotation.y = t * 1.2; shG.rotation.y = Math.sin(t * 1.3) * 0.5; wrG.rotation.y = 0.6 + t * 0.9;
        drops.forEach((c, k) => { const u = (((t - TT.burn_on) * 0.6 + k / 14) % 1 + 1) % 1; c.visible = t >= TT.burn_on; c.position.set(-2.4 + (k % 5) * 1.6, 3.4 - u * 3.9, -2.6 + ((k * 3) % 4) - 1.5); c.rotation.x = t * 5; }); });

      /* 5 · saison : a calendar board, weekends and month-ends lit up, summer sun; the rest of the time the crews wait */
      const hS = grp(PL.saison); const calS = grp(hS, 0, 0, -2.0); put(calS, rb(11.4, 7.6, 0.6, "#f2ede2", 0.15, mat("#f2ede2", { roughness: 0.4 })), 0, 0, 0); put(calS, rb(11.8, 0.7, 0.9, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, 7.6, 0);
      const cS = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const cell = rb(1.3, 1.0, 0.25, "#ccd3dc", 0.08, new THREE.MeshStandardMaterial({ color: "#ccd3dc", roughness: 0.5 })); cell.position.set(-4.5 + c * 1.5, 0.5 + r * 1.3, 0.4); calS.add(cell); cS.push({ cell, c, r }); }
      const sunS = sph(1.6, P.gold, 24, emis(P.gold, 1.6)); sunS.castShadow = false; hS.add(sunS); const idleS = []; for (let i = 0; i < 6; i++) { const w = worker(hS, P.gray, 1.25); w.g.position.set(-6.0 + i * 2.4, 0, 4.4); idleS.push(w); }
      ANCH.sa_sun = () => V(-6.2, 11.4, -2); ANCH.sa_cal = () => V(0, 9.6, -2); ANCH.sa_idle = () => V(0, 4.0, 4.4); wrapAnch(["sa_sun", "sa_cal", "sa_idle"], PL.saison); lampAt(hS, 0, 12, 4, 40, "#ffe0b0");
      upd((t) => { showHero("saison", hS, t); calS.scale.setScalar(pop(t, TT.cal_on, 0.6)); const su = pop(t, TT.sum_on, 0.6); sunS.scale.setScalar(su); sunS.position.set(-6.2, 9.0 + Math.sin(t * 2) * 0.2, -2); sunS.visible = su > 0.01;
        cS.forEach(({ cell, c, r }) => { const we = c >= 5 && t >= TT.we_on, eom = r === 4 && t >= TT.eom_on; const hot = we || eom; cell.material.color.set(hot ? P.orange : "#ccd3dc"); cell.material.emissive.set(hot ? P.orange : "#000000"); cell.material.emissiveIntensity = hot ? 0.45 + 0.2 * Math.sin(t * 5 + c) : 0; cell.scale.z = hot ? 1.8 : 1; });
        idleS.forEach((w, i) => { w.g.scale.setScalar(1.25 * pop(t, TT.idle5_on + i * 0.1, 0.4)); w.armR.rotation.z = Math.sin(t * 1.2 + i) * 0.08; }); });

      /* 6 · demande : fewer people move house (6.95 -> 5.9 million), fixed costs stay the same */
      const hD = grp(PL.demande); const b13 = rb(3.6, 9.0, 3.2, P.blue, 0.2, mat("#3f8fd0", { roughness: 0.3, metalness: 0.2 })); put(hD, b13, -4.2, 0, 0); const b23 = rb(3.6, 7.65, 3.2, P.orange, 0.2, mat(P.orange, { roughness: 0.3, metalness: 0.2 })); put(hD, b23, 0.6, 0, 0);
      const fx = []; for (let k = 0; k < 3; k++) { const f = rb(2.8, 1.5, 2.8, P.red, 0.15, mat(P.red, { roughness: 0.35 })); put(hD, f, 6.0, k * 1.55, 0); fx.push(f); }
      const arD = grp(hD, 0.6, 9.2, 0); { put(arD, rb(0.9, 2.8, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0.9, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(P.red, { roughness: 0.35 })); hd.rotation.x = Math.PI; hd.rotation.y = Math.PI / 4; hd.position.y = 0.5; hd.castShadow = true; arD.add(hd); }
      const ppl = []; for (let i = 0; i < 5; i++) { const w = worker(hD, P.gray, 0.9); w.g.position.set(-5.6 + i * 0.5, 9.0, 0.2 + (i % 2) * 0.5); ppl.push(w); }
      ANCH.de_b13 = () => V(-4.2, 9.6, 0); ANCH.de_b23 = () => V(0.6, 8.4, 0); ANCH.de_fix = () => V(6.0, 5.2, 0); ANCH.de_arrow = () => V(0.6, 12.8, 0); wrapAnch(["de_b13", "de_b23", "de_fix", "de_arrow"], PL.demande); lampAt(hD, 0, 12, 5, 36);
      upd((t) => { showHero("demande", hD, t); b23.scale.y = Math.max(0.001, pop(t, TT.b23_on, 0.7)); b13.scale.y = Math.max(0.001, pop(t, TT.b13_on, 0.7)); fx.forEach((f, k) => { f.scale.setScalar(Math.max(0.001, pop(t, TT.fix_on + k * 0.15, 0.4))); }); const a = pop(t, TT.dn_on, 0.5); arD.scale.setScalar(a); arD.position.y = 9.2 + 0.4 * Math.sin(t * 4) - (a > 0.5 ? 0.6 : 0); ppl.forEach((w) => { w.g.visible = false; }); });

      /* 7 · petites : ten small trucks, seven of them are very small companies (amber) */
      const hP = grp(PL.petites); const smalls = []; for (let i = 0; i < 10; i++) { const tr = truck(hP, "#cdd6e0", 0.52); tr.g.position.set(-6.0 + (i % 5) * 3.0, 0, -2.4 + Math.floor(i / 5) * 4.6); tr.g.rotation.y = Math.PI / 2 - 0.2; smalls.push(tr); }
      ANCH.pt_row = () => V(0, 3.4, 0); ANCH.pt_seven = () => V(-3.0, 3.0, -2.4); wrapAnch(["pt_row", "pt_seven"], PL.petites); lampAt(hP, 0, 11, 3, 36);
      upd((t) => { showHero("petites", hP, t); smalls.forEach((tr, i) => { tr.g.scale.setScalar(0.52 * pop(t, TT.pt_on + i * 0.06, 0.4)); const sel = i < 7 && t >= TT.seven_on + i * 0.07; tr.cm.color.set(sel ? P.orange : "#cdd6e0"); }); });

      /* 8 · marge : a very thin slice of the pie stays as net margin */
      const hG = grp(PL.marge); const pie2 = pieMake(hG, [[0.05, "#ffb347", { roughness: 0.2, metalness: 0.8 }], [0.95, "#2f9ad8", { roughness: 0.25, metalness: 0.1 }]], 4.6, 0.4);
      const regG = prop("CashRegister_01", 2.4, hG); regG.position.set(-7.0, 0, -3.0); regG.rotation.y = 0.5; const cbG = prop("clipboard", 0.12, hG); cbG.position.set(7.0, 0.05, -2.0); cbG.rotation.y = -0.5;
      ANCH.mg_pie = () => V(Math.sin(pie2.sl[0].mid) * 3.2, 2.8, Math.cos(pie2.sl[0].mid) * 3.2); wrapAnch(["mg_pie"], PL.marge); lampAt(hG, 0, 9, 3, 30);
      upd((t) => { showHero("marge", hG, t); pie2.sl.forEach((s_, i) => { const t0 = i ? TT.pie_blue : TT.pie_on; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 1.0 * Math.min(1, prog(t, TT.pie_on, 0.6)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); }); regG.scale.setScalar(pop(t, TT.pie_blue, 0.5)); cbG.scale.setScalar(pop(t, TT.pie_blue + 0.1, 0.5)); });

      /* 9 · risque : a low quote, a breakdown, a rainy day, and the month turns red */
      const hR = grp(PL.risque); const cbR = prop("clipboard", 0.12, hR); cbR.position.set(-6.4, 0.05, 2.6); cbR.rotation.y = 0.5; const lowTag = grp(hR, -6.4, 4.8, 3.4); put(lowTag, rb(2.4, 1.2, 0.3, P.green, 0.3, mat(P.green, { roughness: 0.3 })), 0, -0.6, 0);
      const trR = truck(hR, "#f2ede2", 0.9); trR.g.position.set(1.6, 0, -2.6); trR.g.rotation.y = Math.PI / 2 - 0.45; const sgR = prop("WetFloorSign_01", 3.0, hR); sgR.position.set(-0.8, 0, 3.4); sgR.rotation.y = 0.4;
      const smoke = []; for (let k = 0; k < 8; k++) { const s_ = sph(0.7, "#5a6272", 10, mat("#5a6272", { roughness: 1 })); s_.castShadow = false; s_.visible = false; hR.add(s_); smoke.push(s_); }
      const cloud = grp(hR, 0.6, 11.5, -1.0); [[-2.4, 0, 1.4], [-0.6, 0.6, 1.9], [1.4, 0.3, 1.7], [3.0, -0.1, 1.2], [0.4, -0.4, 1.5]].forEach(([x, y, r]) => { const c = sph(r, "#8e9cb0", 14, mat("#8e9cb0", { roughness: 0.9 })); c.position.set(x, y, 0); cloud.add(c); });
      const rain = []; for (let k = 0; k < 40; k++) { const d = cyl(0.07, 0.07, 0.8, P.blue, 6, emis(P.blue, 0.8)); d.castShadow = false; d.visible = false; hR.add(d); rain.push(d); }
      const redRing = new THREE.Mesh(new THREE.TorusGeometry(13, 0.3, 10, 72), emis(P.red, 1.4)); redRing.rotation.x = Math.PI / 2; redRing.position.y = 0.2; hR.add(redRing); const redDisc = new THREE.Mesh(new THREE.CircleGeometry(13, 56), new THREE.MeshStandardMaterial({ color: P.red, transparent: true, opacity: 0, roughness: 0.9 })); redDisc.rotation.x = -Math.PI / 2; redDisc.position.y = 0.05; hR.add(redDisc);
      ANCH.rk_quote = () => V(-6.4, 6.2, 3.0); ANCH.rk_truck = () => V(1.6, 5.4, -2.6); ANCH.rk_rain = () => V(0.6, 10.0, -1.0); ANCH.rk_red = () => V(0, 1.4, 8.0); wrapAnch(["rk_quote", "rk_truck", "rk_rain", "rk_red"], PL.risque); lampAt(hR, 0, 12, 4, 34, "#cfe0ff");
      upd((t) => { showHero("risque", hR, t); cbR.scale.setScalar(pop(t, TT.quote_on, 0.5)); lowTag.scale.setScalar(pop(t, TT.quote_on + 0.15, 0.5)); lowTag.position.y = 4.8 + Math.sin(t * 3) * 0.15; trR.g.scale.setScalar(0.9 * pop(t, TT.quote_on - 0.4, 0.6)); sgR.scale.setScalar(pop(t, TT.fail_on, 0.5));
        const br = t >= TT.fail_on; trR.g.rotation.z = br ? 0.07 + 0.01 * Math.sin(t * 9) : 0; trR.wheels[1].visible = !br; smoke.forEach((s_, k) => { const u = (((t - TT.fail_on) * 0.35 + k / 8) % 1 + 1) % 1; s_.visible = br; s_.position.set(1.0 + Math.sin(k * 2.0) * 0.5, 4.2 + u * 5, -2.6 + Math.cos(k) * 0.5); s_.scale.setScalar(0.4 + u * 1.5); });
        const cl = pop(t, TT.rain_on, 0.6); cloud.scale.setScalar(cl); cloud.visible = cl > 0.01; rain.forEach((d, k) => { const u = (((t - TT.rain_on) * 1.3 + k * 0.137) % 1 + 1) % 1; d.visible = t >= TT.rain_on; d.position.set(-3.6 + (k % 10) * 0.85 + 0.6, 10.2 - u * 10.0, -2.4 + Math.floor(k / 10) * 1.4); });
        const rd = t >= TT.red_on; redRing.scale.setScalar(rd ? 1 : 0.001); redDisc.material.opacity = rd ? 0.28 + 0.1 * Math.sin(t * 6) : 0; });

      /* 10 · calendrier : the mover sells a calendar: filled slots earn, empty slots burn money */
      const hK = grp(PL.calendrier); const calK = grp(hK, 0, 0, -1.0); put(calK, rb(12.2, 8.2, 0.6, "#f2ede2", 0.15, mat("#f2ede2", { roughness: 0.4 })), 0, 0, 0); put(calK, rb(12.6, 0.7, 0.9, P.orange, 0.1, mat(P.orange, { roughness: 0.35 })), 0, 8.2, 0);
      const EMPTY = new Set([3, 9, 12, 17, 20, 26, 31]); const cK = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const i = r * 7 + c; if (i > 33) continue; const cell = rb(1.4, 1.1, 0.25, "#ccd3dc", 0.08, new THREE.MeshStandardMaterial({ color: "#ccd3dc", roughness: 0.5 })); cell.position.set(-4.8 + c * 1.6, 0.6 + r * 1.4, 0.4); calK.add(cell); cK.push({ cell, i }); }
      const lostC = []; for (let k = 0; k < 7; k++) { const c = coinM(0.4); c.visible = false; hK.add(c); lostC.push(c); }
      const potK = prop("potted_plant_01", 2.8, hK); potK.position.set(8.4, 0, 2.6); const crK = prop("wooden_crate_01", 1.6, hK); crK.position.set(-8.2, 0, 3.0);
      ANCH.ca_cal = () => V(0, 9.6, -1); ANCH.ca_empty = () => V(-3.2, 5.0, -0.2); wrapAnch(["ca_cal", "ca_empty"], PL.calendrier); lampAt(hK, 0, 12, 6, 40);
      upd((t) => { showHero("calendrier", hK, t); calK.scale.setScalar(pop(t, TT.cal2_on, 0.6)); cK.forEach(({ cell, i }) => { const empty = EMPTY.has(i); const filled = !empty && t >= TT.fill_on + i * 0.075; const red = empty && t >= TT.void_on; const col = red ? P.red : filled ? P.orange : "#ccd3dc"; cell.material.color.set(col); cell.material.emissive.set(red ? P.red : filled ? P.orange : "#000000"); cell.material.emissiveIntensity = red ? 0.6 + 0.4 * Math.sin(t * 7 + i) : filled ? 0.25 : 0; cell.scale.z = filled || red ? 1.7 : 1; });
        lostC.forEach((c, k) => { const ix = [...EMPTY][k]; const col = ix % 7, row = Math.floor(ix / 7); const u = (((t - TT.rent_on) * 0.55 + k * 0.17) % 1 + 1) % 1; c.visible = t >= TT.rent_on; c.position.set(-4.8 + col * 1.6, 0.6 + row * 1.4 + 1.0 - u * 6.0, 0.9); c.rotation.x = t * 5; c.material = GOLD(); }); });

      /* 11 · cta : a comment bubble and a subscribe button (glossy) */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
