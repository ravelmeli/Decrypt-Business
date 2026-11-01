      /* =====================================================================
         WORLD : « eau et béton » (deep blue, cyan water, electric yellow, concrete cream). One continuous journey, one hero subject per idea.
         ===================================================================== */
      const rn = rng(23);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n, i) => { PL[n] = grp(scene, 0, 0, -B.spacing * i); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });

      /* floor, path of lights, far mountains and pylons */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#0a2036", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#0f2c47", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.gold, P.blue, P.sky][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(8 + rn() * 8, 12 + rn() * 14, 6), sil); c.position.set(-64 + i * 15 + rn() * 4, 6, -140 - rn() * 14); backdrop.add(c); }
      for (let i = 0; i < 5; i++) { const g = grp(backdrop, -40 + i * 20, 0, -110); put(g, rb(0.5, 12, 0.5, "#16405f", 0.1, sil), 0, 0, 0); put(g, rb(5, 0.35, 0.35, "#16405f", 0.05, sil), 0, 9, 0); put(g, rb(3.4, 0.3, 0.3, "#16405f", 0.05, sil), 0, 6.5, 0); }
      const pathDots = []; for (let i = 0; i < 100; i++) { const m = sph(0.15, P.blue, 6, emis(P.blue, 0.9)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const rings = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#12395a", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis(P.blue, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders ---- */
      function person(p, hex, opt = {}) { const g = grp(p); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(hex)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, "#ffe2cc", 10); h.position.y = 1.78; g.add(h);
        if (opt.hat) { const hh = new THREE.Mesh(new THREE.SphereGeometry(0.33, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(opt.hat)); hh.position.y = 1.9; hh.castShadow = true; g.add(hh); }
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, hex, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        const o = { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; if (opt.scale) g.scale.setScalar(opt.scale); return o; }
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      /* gravity dam: trapezoid profile extruded along x, with a reservoir behind (z<0), gates, a power house and a bolt */
      function damMesh(p, hex = P.cream) { const g = grp(p); const sh = new THREE.Shape(); sh.moveTo(-3.6, 0); sh.lineTo(3.6, 0); sh.lineTo(0.9, 8); sh.lineTo(-0.9, 8); sh.lineTo(-3.6, 0);
        const geo = new THREE.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); geo.translate(0, 0, -7); const wall = new THREE.Mesh(geo, M(hex)); wall.rotation.y = -Math.PI / 2; wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
        const water = rb(15, 7.2, 12, P.blue, 0.2, new THREE.MeshStandardMaterial({ color: P.blue, transparent: true, opacity: 0.55, roughness: 0.3 })); water.position.set(0, 0, -7.4); water.castShadow = false; g.add(water);
        const gates = []; for (let i = 0; i < 5; i++) { const gt = rb(1.6, 1.0, 0.9, P.navy, 0.08); gt.position.set(-5.6 + i * 2.8, 8, 0); g.add(gt); gates.push(gt); }
        const house = rb(4.2, 2.2, 3, P.gray, 0.12); house.position.set(5.2, 0, 3.4); g.add(house); const bolt = rb(0.6, 0.6, 0.2, P.gold, 0.05, emis(P.gold, 1.4)); bolt.position.set(5.2, 2.5, 5.0); g.add(bolt);
        const fall = rb(1.2, 7, 0.4, P.sky, 0.1, new THREE.MeshStandardMaterial({ color: P.sky, transparent: true, opacity: 0.7, emissive: P.sky, emissiveIntensity: 0.3 })); fall.position.set(0, 0.4, 2.2); fall.castShadow = false; g.add(fall);
        return { g, wall, water, gates, fall }; }
      function boltShape(p, s = 1, hex = P.gold) { const sh = new THREE.Shape(); sh.moveTo(0.3, 2); sh.lineTo(-0.9, -0.1); sh.lineTo(-0.1, -0.1); sh.lineTo(-0.5, -2); sh.lineTo(0.9, 0.3); sh.lineTo(0.1, 0.3); sh.lineTo(0.3, 2);
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false }), emis(hex, 1.3)); m.scale.setScalar(s); const g = grp(p); m.position.z = -0.25; g.add(m); return g; }
      function miniDam(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); const sh = new THREE.Shape(); sh.moveTo(-0.9, 0); sh.lineTo(0.9, 0); sh.lineTo(0.25, 1.6); sh.lineTo(-0.25, 1.6); sh.lineTo(-0.9, 0);
        const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false }); geo.translate(0, 0, -1.2); const w = new THREE.Mesh(geo, M(hex)); w.rotation.y = -Math.PI / 2; w.castShadow = true; g.add(w); return { g, w }; }
      function stateBuilding(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(9, 0.6, 5, P.cream, 0.1), 0, 0, 0); put(g, rb(8, 0.4, 4, P.cream, 0.08), 0, 0.6, 0);
        for (let i = 0; i < 5; i++) put(g, cyl(0.45, 0.45, 4.2, P.white, 10), -3.2 + i * 1.6, 1.0, 1.2).position.y = 3.1; put(g, rb(8.4, 0.7, 3.6, P.cream, 0.08), 0, 5.2, 0.6);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(4.9, 1.9, 3), M(P.cream)); roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.75); roof.position.set(0, 6.5, 0.6); roof.castShadow = true; g.add(roof);
        const pole = put(g, cyl(0.07, 0.07, 3.0, P.gray, 6), 0, 7.2, 0.6); const flag = rb(1.9, 1.2, 0.08, P.blue, 0.03); put(g, flag, 1.0, 8.2, 0.6); [P.white, P.red].forEach((c, i) => put(g, rb(0.6, 1.2, 0.1, c, 0.02), 1.3 + (i ? 0.6 : 0), 8.2, 0.6)); return { g, flag }; }
      function keyObj(p, s = 1) { const g = grp(p); g.scale.setScalar(s); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.18, 6, 16), emis(P.gold, 1.2)); g.add(ring); put(g, rb(0.25, 1.8, 0.25, P.gold, 0.05, emis(P.gold, 1.0)), 0, -2.2, 0); put(g, rb(0.7, 0.25, 0.25, P.gold, 0.05, emis(P.gold, 1.0)), 0.3, -2.0, 0); return g; }
      function hourglass(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, cyl(2.4, 2.4, 0.4, P.brown, 20), 0, 0, 0); put(g, cyl(2.4, 2.4, 0.4, P.brown, 20), 0, 7.4, 0);
        const glassM = new THREE.MeshStandardMaterial({ color: P.sky, transparent: true, opacity: 0.35, roughness: 0.2 }); const c1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.4, 16), glassM); c1.position.y = 5.4; c1.rotation.x = Math.PI; g.add(c1); const c2 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.4, 16), glassM); c2.position.y = 2.1; g.add(c2);
        const sandTop = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.0, 16), M(P.gold)); sandTop.position.y = 5.5; sandTop.rotation.x = Math.PI; g.add(sandTop); const sandBot = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.6, 16), M(P.gold)); sandBot.position.y = 1.9; g.add(sandBot); return { g, sandTop, sandBot }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 24), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 6, 40), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 12) => { const g = grp(p); const a = rb(0.6, len, 0.6, P.red, 0.1), b = rb(0.6, len, 0.6, P.red, 0.1); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };

      /* 1 · dam : it produces 12 % of the electricity (3 houses out of 25 lit) */
      const hD = grp(PL.dam); const dm = damMesh(hD); dm.g.position.set(0, 0, -4); const bolt1 = boltShape(hD, 1.6); bolt1.position.set(0, 13.5, -4);
      const hs = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const g = grp(hD, -5.4 + c * 2.7, 0, 5.0 + r * 1.9); const b = rb(1.5, 1.1, 1.2, P.cream, 0.1); g.add(b); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.8, 4), M(P.red)); rf.rotation.y = Math.PI / 4; rf.position.y = 1.5; rf.castShadow = true; g.add(rf); const wn = rb(0.5, 0.5, 0.1, P.gold, 0.03, emis(P.gold, 0.0)); wn.position.set(0, 0.35, 0.62); wn.castShadow = false; g.add(wn); hs.push({ g, wn }); }
      ANCH.dam_top = () => V(0, 10.4, -4); ANCH.dam_grid = () => V(0, 3.6, 8); wrapAnch(["dam_top", "dam_grid"], PL.dam);
      upd((t) => { showHero("dam", hD, t); bolt1.rotation.y = Math.sin(t * 1.4) * 0.5; bolt1.position.y = 13.5 + Math.sin(t * 2) * 0.3; dm.fall.scale.y = 0.9 + 0.1 * Math.sin(t * 9); hs.forEach((h, i) => { const on = i < 3 && t >= TT.lit_on + i * 0.18; h.wn.material.emissiveIntensity = on ? 1.6 : 0.0; h.wn.material.color.set(on ? P.gold : "#27415c"); }); });

      /* 2 · etat : the State owns it, the operator holds the contract (75 years) */
      const hE = grp(PL.etat); const st = stateBuilding(hE, 0.85); st.g.position.set(-5.8, 0, -3); const dm2 = damMesh(hE); dm2.g.scale.setScalar(0.5); dm2.g.position.set(4.6, 0, -4.4);
      const oper = person(hE, P.orange, { hat: P.gold, scale: 1.5 }); oper.g.position.set(1.2, 0, 5); oper.g.rotation.y = 0.2;
      const key2 = keyObj(hE, 0.9); const contract = rb(3.2, 2.2, 0.3, P.cream, 0.08); put(hE, contract, 1.2, 6.2, 5); for (let i = 0; i < 4; i++) put(contract, rb(2.2, 0.14, 0.1, P.navy, 0.03), 0, 0.5 + i * 0.4, 0.18);
      const hg = hourglass(hE, 0.55); hg.g.position.set(-1.4, 0, 6);
      ANCH.et_state = () => V(-5.8, 10.4, -3); ANCH.et_oper = () => V(1.2, 4.6, 5); ANCH.et_dam = () => V(4.6, 4.8, -4.4); ANCH.et_hg = () => V(-1.4, 5.0, 6); wrapAnch(["et_state", "et_oper", "et_dam", "et_hg"], PL.etat);
      upd((t) => { showHero("etat", hE, t); const s1 = Math.max(0.001, eOutBack(prog(t, TT.state_on, 0.6))); st.g.scale.setScalar(0.85 * s1); st.g.visible = s1 > 0.01; st.flag.rotation.y = Math.sin(t * 3) * 0.2;
        const k = eInOut(prog(t, TT.key_move, 0.9)); key2.position.set(lerp(-5.8, 1.2, k), 8.4 - 3.0 * k + Math.sin(t * 3) * 0.25, lerp(-1, 4.2, k)); key2.rotation.y = t * 1.5; key2.visible = t >= TT.state_on + 0.4;
        const cs = Math.max(0.001, eOutBack(prog(t, TT.key_move + 0.5, 0.5))); contract.scale.setScalar(cs); contract.visible = cs > 0.01; contract.position.y = 6.2 + Math.sin(t * 2) * 0.15;
        const hs_ = Math.max(0.001, eOutBack(prog(t, TT.h75, 0.5))); hg.g.scale.setScalar(0.55 * hs_); hg.g.visible = hs_ > 0.01; hg.sandTop.scale.y = Math.max(0.05, 1 - 0.4 * clamp((t - TT.h75) / 6)); oper.armR.rotation.z = Math.sin(t * 2) * 0.2; });

      /* 3 · share : ten dams, 7 for EDF, the rest mostly Engie */
      const hSh = grp(PL.share); const dmini = []; const OWN = [P.blue, P.blue, P.blue, P.blue, P.blue, P.blue, P.blue, P.orange, P.orange, P.gray];
      for (let i = 0; i < 10; i++) { const d = miniDam(hSh, OWN[i], 1.5); d.g.position.set(-5.4 + (i % 5) * 2.7, 0, i < 5 ? -3.5 : 3.0); dmini.push(d); }
      ANCH.sh_edf = () => V(-1.6, 4.4, -3.5); ANCH.sh_engie = () => V(2.7, 4.4, 3.0); wrapAnch(["sh_edf", "sh_engie"], PL.share);
      upd((t) => { showHero("share", hSh, t); dmini.forEach((d, i) => { const t0 = i < 7 ? TT.edf_on + i * 0.1 : i < 9 ? TT.engie_on + (i - 7) * 0.12 : TT.reste_on; d.g.scale.setScalar(Math.max(0.001, eOutBack(prog(t, t0, 0.4))) * 1.5); }); });

      /* 4 · concurrence : the concession ends, bidders raise paddles around the dam */
      const hC = grp(PL.concurrence); const podium = rb(3.6, 2.4, 2.4, P.brown, 0.12); put(hC, podium, 0, 0, 0); const dm4 = miniDam(hC, P.cream, 1.2); dm4.g.position.set(0, 2.5, 0); const gav = grp(hC, 2.6, 3.0, 0); put(gav, rb(0.35, 2.0, 0.35, P.brown, 0.05), 0, -1.4, 0); put(gav, rb(1.6, 0.8, 0.8, P.brown, 0.08), 0, 0.2, 0);
      const bid = [[P.blue, -5.2, 5], [P.orange, 0.2, 7.2], [P.pink, 5.2, 5]].map(([c, x, z], i) => { const v = person(hC, c, { scale: 1.4 }); v.g.position.set(x, 0, z); v.g.rotation.y = Math.PI + (x < 0 ? -0.3 : x > 0 ? 0.3 : 0); const pad = rb(1.3, 1.3, 0.12, c, 0.06); v.armR.add(pad); pad.position.set(0, -1.1, 0.1); return v; });
      ANCH.conc = () => V(0, 6.8, 0); wrapAnch(["conc"], PL.concurrence);
      upd((t) => { showHero("concurrence", hC, t); dm4.g.rotation.y = t * 0.8; bid.forEach((v, i) => { const up = eOutBack(prog(t, TT.bid_on + i * 0.35, 0.4)); v.armR.rotation.z = -2.6 * up + Math.sin(t * 5 + i) * 0.1 * up; v.g.scale.setScalar(1.4); }); gav.rotation.z = -0.9 * (1 - bounce(prog(t, TT.gavel, 0.35))) ; gav.visible = t >= TT.gavel - 0.6; });

      /* 5 · echues : 38 expired concessions out of 40 turn red */
      const hX = grp(PL.echues); const grid = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) { const d = miniDam(hX, P.blue, 0.8); d.g.position.set(-4.9 + c * 1.4, 0, -4.2 + r * 2.2); grid.push(d); }
      ANCH.ech = () => V(0, 4.0, 0); wrapAnch(["ech"], PL.echues);
      upd((t) => { showHero("echues", hX, t); grid.forEach((d, i) => { const red = i < 38 && t >= TT.ech_on + i * 0.05; d.w.material = M(red ? P.red : P.blue); d.g.position.y = red ? Math.sin(t * 5 + i) * 0.04 : 0; }); });

      /* 6 · invest : a half-built dam, a still crane, the operator hesitates */
      const hI = grp(PL.invest); const dm6 = damMesh(hI); dm6.g.scale.set(0.7, 0.55, 0.7); dm6.g.position.set(-1.5, 0, -4);
      const crane = grp(hI, 6.2, 0, -1); { put(crane, rb(0.9, 11, 0.9, P.gray, 0.08), 0, 0, 0); put(crane, rb(8, 0.45, 0.45, P.gray, 0.05), -2.8, 11, 0); put(crane, rb(1.6, 0.9, 1.0, P.orange, 0.06), 0.4, 11.5, 0); }
      const op6 = person(hI, P.orange, { hat: P.gold, scale: 1.6 }); op6.g.position.set(-5.2, 0, 5);
      const coins6 = []; for (let k = 0; k < 8; k++) { const c = coinM(0.7); hI.add(c); coins6.push(c); }
      const key6 = keyObj(hI, 1.0); const stOff = stateBuilding(hI, 0.45); stOff.g.position.set(8.2, 0, 7.5);
      ANCH.inv_dam = () => V(-1.5, 6.4, -4); ANCH.inv_op = () => V(-5.2, 5.4, 5); wrapAnch(["inv_dam", "inv_op"], PL.invest);
      upd((t) => { showHero("invest", hI, t); const a0 = HW.invest[0][0]; coins6.forEach((c, k) => { const loop = (((t - a0) * 0.35 + k / 8) % 1); const stopped = t >= TT.diff_on; const u = stopped ? Math.min(loop, 0.18) : loop; c.position.set(lerp(-4.4, -1.5, u), 2.4 + Math.sin(u * Math.PI) * 2.0, lerp(4.6, -3.0, u)); c.rotation.x = t * 4; c.visible = t >= TT.invest_on; });
        const kk = eInOut(prog(t, TT.lose_on, 1.0)); key6.position.set(lerp(-3.2, 7.4, kk), 6.0 + Math.sin(t * 3) * 0.2 + kk * 1.5, lerp(3.0, 7.0, kk)); key6.rotation.y = t * 1.4; key6.visible = t >= TT.lose_on - 0.5; });

      /* 7 · redevance : 40 % of a theoretical profit goes back to the State */
      const hR = grp(PL.redevance); const pie = grp(hR, -3.6, 0.1, 1); const sl = [];
      [[0.6, P.gold], [0.4, P.red]].reduce((ang, [f, col]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 1.4, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; pie.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, 0.2);
      put(pie, cyl(4.3, 4.4, 0.3, P.cream, 40), 0, -0.05, 0); const stR = stateBuilding(hR, 0.6); stR.g.position.set(6.2, 0, -3);
      const flowC = []; for (let k = 0; k < 8; k++) { const c = coinM(0.45); c.visible = false; hR.add(c); flowC.push(c); }
      ANCH.red_gold = () => V(-3.6 + Math.sin(sl[0].mid) * 2.6, 2.6, 1 + Math.cos(sl[0].mid) * 2.6); ANCH.red_red = () => V(-3.6 + Math.sin(sl[1].mid) * 4.2, 2.4, 1 + Math.cos(sl[1].mid) * 4.2); ANCH.red_state = () => V(6.2, 9.2, -3); wrapAnch(["red_gold", "red_red", "red_state"], PL.redevance);
      upd((t) => { showHero("redevance", hR, t); pie.rotation.y = 0; const out = 1.4 * eOutBack(prog(t, TT.red_on, 0.7)); sl[1].m.position.set(Math.sin(sl[1].mid) * out, 0.7, Math.cos(sl[1].mid) * out); const a0 = TT.red_on + 0.6;
        flowC.forEach((c, k) => { const u = (((t - a0) * 0.5 + k / 8) % 1 + 1) % 1; c.visible = t > a0; c.position.set(lerp(-3.6 + Math.sin(sl[1].mid) * 2.4, 6.2, u), 1.5 + Math.sin(u * Math.PI) * 3.4, lerp(1 + Math.cos(sl[1].mid) * 2.4, -2, u)); c.rotation.x = t * 5; }); });

      /* 8 · step : pump water up when electricity is cheap, release it when it is dear */
      const hS = grp(PL.step); const upper = cyl(4.2, 4.2, 0.8, P.blue, 28, new THREE.MeshStandardMaterial({ color: P.blue, roughness: 0.3, emissive: P.blue, emissiveIntensity: 0.25 })); put(hS, upper, -4.2, 5.4, -4); put(hS, cyl(4.8, 5.2, 5.4, P.cream, 28), -4.2, 0, -4);
      const lower = cyl(4.4, 4.4, 0.5, P.blue, 28, new THREE.MeshStandardMaterial({ color: P.blue, roughness: 0.3, emissive: P.blue, emissiveIntensity: 0.25 })); put(hS, lower, 4.6, 0, 1.6); const ph = rb(3.2, 2.4, 2.6, P.gray, 0.12); put(hS, ph, 0.2, 0, -1); const phB = rb(0.7, 0.7, 0.2, P.gold, 0.05, emis(P.gold, 1.4)); put(hS, phB, 0.2, 2.8, 0.45);
      const pipeA = new THREE.Vector3(-3.0, 5.4, -3.2), pipeB = new THREE.Vector3(3.6, 0.4, 1.0); { const len = pipeA.distanceTo(pipeB); const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, len, 10), M(P.gray)); pipe.position.copy(pipeA).add(pipeB).multiplyScalar(0.5); pipe.lookAt(pipeB); pipe.rotateX(Math.PI / 2); pipe.castShadow = true; hS.add(pipe); }
      const drops = []; for (let k = 0; k < 14; k++) { const d = sph(0.32, P.sky, 8, emis(P.sky, 0.9)); d.castShadow = false; hS.add(d); drops.push(d); }
      const brd = grp(hS, 0, 0, 7.5); put(brd, rb(9, 0.25, 3, P.navy, 0.08), 0, -0.2, 0); const barLo = rb(1.8, 1.4, 1.8, P.green, 0.1), barHi = rb(1.8, 4.4, 1.8, P.red, 0.1); put(brd, barLo, -2.4, 0, 0); put(brd, barHi, 2.4, 0, 0); const gapA = grp(brd, 0, 0, 0); put(gapA, rb(0.4, 3.2, 0.4, P.gold, 0.08), 0, 1.6, 0); put(gapA, rb(5.6, 0.12, 0.12, P.gold, 0.03), 0, 4.5, 0);
      ANCH.st_up = () => V(-4.2, 7.8, -4); ANCH.st_low = () => V(4.6, 2.6, 1.6); ANCH.st_lo = () => V(-2.4, 2.8, 7.5); ANCH.st_hi = () => V(2.4, 5.8, 7.5); ANCH.st_gap = () => V(0, 6.0, 7.5); wrapAnch(["st_up", "st_low", "st_lo", "st_hi", "st_gap"], PL.step);
      upd((t) => { showHero("step", hS, t); const a0 = TT.pump_on;
        drops.forEach((d, k) => { const phs = (((t - a0) * 0.45 + k / 14) % 1 + 1) % 1; const up = t < TT.turb_on; const u = up ? phs : 1 - phs; d.visible = t >= a0; d.position.set(lerp(3.6, -3.0, u), lerp(0.8, 5.8, u) + Math.sin(u * Math.PI) * 0.6, lerp(1.0, -3.2, u)); d.material.emissiveIntensity = up ? 0.9 : 1.5; });
        upper.position.y = 5.4 + 0.5 * (t < TT.turb_on ? clamp((t - a0) / 4) : 1 - clamp((t - TT.turb_on) / 4)); const s1 = Math.max(0.001, eOutBack(prog(t, TT.cheap_on, 0.5))), s2 = Math.max(0.001, eOutBack(prog(t, TT.dear_on, 0.5))); barLo.scale.y = s1; barHi.scale.y = s2; gapA.scale.y = Math.max(0.001, eOutBack(prog(t, TT.gap_on, 0.5))); gapA.visible = t >= TT.gap_on - 0.02; phB.rotation.y = t * 2; });

      /* 9 · souplesse : a spring under a dam, the flexibility is the value */
      const hF = grp(PL.souplesse); put(hF, cyl(5.0, 5.2, 0.6, P.navy, 28), 0, 0, 0); const rings9 = []; for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.38, 8, 24), M(P.green)); r.rotation.x = Math.PI / 2; r.castShadow = true; hF.add(r); rings9.push(r); }
      const top9 = miniDam(hF, P.cream, 1.6); const bolt9 = boltShape(hF, 1.2); ANCH.soup = () => V(0, 12, 0); wrapAnch(["soup"], PL.souplesse);
      upd((t) => { showHero("souplesse", hF, t); const a = 1 - 0.55 * Math.max(0, Math.sin((t - TT.soup) * 4.5)) * Math.exp(-(t - TT.soup) * 0.35) * (t >= TT.soup ? 1 : 0); const sp = 1.0 * a; rings9.forEach((r, i) => { r.position.y = 0.9 + i * sp; r.rotation.z = Math.sin(t * 2 + i) * 0.05; }); const topY = 0.9 + 9 * sp + 0.2; top9.g.position.set(0, topY, 0); top9.g.rotation.y = t * 0.6; bolt9.position.set(0, topY + 4.2, 0); bolt9.rotation.y = Math.sin(t * 1.6) * 0.5; });

      /* 10 · droit : not only electricity (bolt crossed), a time-limited right of use (hourglass + key) */
      const hDr = grp(PL.droit); const bolt10 = boltShape(hDr, 2.6); bolt10.position.set(-1, 6.5, 0); const crossB = cross(hDr, 14); crossB.position.set(-1, 13.5, 2);
      const hg10 = hourglass(hDr, 1.2); hg10.g.position.set(-3.8, 0, 0); const key10 = keyObj(hDr, 1.7); key10.position.set(4.2, 7.0, 1); const st10 = stateBuilding(hDr, 0.55); st10.g.position.set(5.6, 0, -6);
      ANCH.dr_bolt = () => V(-1, 11.5, 0); ANCH.dr_key = () => V(4.2, 9.8, 1); ANCH.dr_hg = () => V(-3.8, 11.5, 0); wrapAnch(["dr_bolt", "dr_key", "dr_hg"], PL.droit);
      upd((t) => { showHero("droit", hDr, t); const cr = t >= TT.cross_on && t < TT.droit_on; crossB.visible = cr; crossB.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1); const bs = t < TT.droit_on ? 1 : 1 - eOut(prog(t, TT.droit_on, 0.4)); bolt10.visible = bs > 0.02; bolt10.scale.setScalar(Math.max(0.001, bs)); bolt10.rotation.y = Math.sin(t * 1.5) * 0.4;
        const ks = Math.max(0.001, eOutBack(prog(t, TT.droit_on, 0.6))); key10.scale.setScalar(1.7 * ks); key10.visible = ks > 0.01; key10.rotation.y = t * 1.2; key10.position.y = 7.0 + Math.sin(t * 2) * 0.3;
        const hk = Math.max(0.001, eOutBack(prog(t, TT.droit_on + 0.2, 0.6))); hg10.g.scale.setScalar(1.2 * hk); hg10.g.visible = hk > 0.01; hg10.sandTop.scale.y = Math.max(0.05, 1 - 0.9 * clamp((t - TT.droit_on) / 4.5)); hg10.sandBot.scale.y = 0.3 + 0.7 * clamp((t - TT.droit_on) / 4.5); const so = Math.max(0.001, eOutBack(prog(t, TT.droit_on + 0.5, 0.6))); st10.g.scale.setScalar(0.55 * so); st10.g.visible = so > 0.01; });

      /* 11 · cta : a comment bubble and a subscribe button */
      const hCt = grp(PL.cta); pedestal(hCt, 8); const bub = grp(hCt, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(P.cream)); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 8); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hCt, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), M(P.white)); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta);
      upd((t) => { showHero("cta", hCt, t); const b = Math.max(0.001, eOutBack(prog(t, TT.bubble_on, 0.6))); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = Math.max(0.001, eOutBack(prog(t, TT.button_on, 0.6))); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
