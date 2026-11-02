      /* =====================================================================
         WORLD : « laverie de nuit » (deep blue, soap white, neon yellow, mint). One continuous journey, one hero subject per idea.
         ===================================================================== */
      const rn = rng(53);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n, i) => { PL[n] = grp(scene, 0, 0, -B.spacing * i); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });
      const pop = (t, t0, d = 0.45) => Math.max(0.001, eOutBack(prog(t, t0, d)));

      /* floor, path, neon bokeh, far street silhouettes with glowing signs */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#0a1a30", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#10294a", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.gold, P.blue, P.green][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 10; i++) { const w = 9 + rn() * 7, h = 7 + rn() * 7; const b = rb(w, h, 8, "#10294a", 0.2, sil); b.position.set(-66 + i * 14 + rn() * 4, 0, -140 - rn() * 14); backdrop.add(b); const sg = rb(w * 0.6, 1.2, 0.3, i % 2 ? P.gold : P.blue, 0.1, emis(i % 2 ? P.gold : P.blue, 0.8)); sg.castShadow = false; sg.position.set(b.position.x, 3 + rn() * 2, b.position.z + 4.2); backdrop.add(sg); }
      const pathDots = []; for (let i = 0; i < 100; i++) { const m = sph(0.15, P.gold, 6, emis(P.gold, 0.9)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const rings = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#12304f", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis(P.blue, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders ---- */
      function person(p, hex, opt = {}) { const g = grp(p); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(hex)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, "#ffe2cc", 10); h.position.y = 1.78; g.add(h);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, hex, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        const o = { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; if (opt.scale) g.scale.setScalar(opt.scale); return o; }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      function washer(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(3.0, 3.6, 2.8, P.cream, 0.2), 0, 0, 0); put(g, rb(3.0, 0.6, 2.8, P.blue, 0.1), 0, 3.6, 0); put(g, rb(1.0, 0.3, 0.1, P.gold, 0.04, emis(P.gold, 0.8)), -0.8, 3.7, 1.4);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.2, 8, 24), M(P.gray)); ring.position.set(0, 1.7, 1.42); g.add(ring); const glass = cyl(0.9, 0.9, 0.2, P.blue, 24, new THREE.MeshStandardMaterial({ color: P.blue, transparent: true, opacity: 0.55, emissive: P.blue, emissiveIntensity: 0.5 })); glass.rotation.x = Math.PI / 2; glass.position.set(0, 1.7, 1.38); g.add(glass);
        const drum = grp(g, 0, 1.7, 1.2); [[0.4, 0.3, P.pink], [-0.4, -0.2, P.gold], [0.1, -0.5, P.green]].forEach(([x, y, c]) => { const cl = rb(0.5, 0.4, 0.3, c, 0.1); cl.position.set(x, y, 0); drum.add(cl); }); return { g, drum }; }
      function bolt(p, s = 1, hex = P.gold) { const sh = new THREE.Shape(); sh.moveTo(0.3, 2); sh.lineTo(-0.9, -0.1); sh.lineTo(-0.1, -0.1); sh.lineTo(-0.5, -2); sh.lineTo(0.9, 0.3); sh.lineTo(0.1, 0.3); sh.lineTo(0.3, 2); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false }), emis(hex, 1.3)); m.scale.setScalar(s); const g = grp(p); m.position.z = -0.25; g.add(m); return g; }
      function pieMake(p, parts, r = 4.2, ang0 = 0.3) { const g = grp(p); const sl = []; parts.reduce((ang, [f, col]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; g.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, ang0); put(g, cyl(r + 0.3, r + 0.4, 0.3, P.cream, 40), 0, -0.05, 0); return { g, sl }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 24), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 6, 40), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 8) => { const g = grp(p); const a = rb(0.5, len, 0.5, P.red, 0.1), b = rb(0.5, len, 0.5, P.red, 0.1); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };
      function shopFront(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.2, 1.9, 1.6, P.cream, 0.1), 0, 0, 0); put(g, rb(2.4, 0.4, 1.8, hex, 0.05, emis(hex, 0.7)), 0, 1.9, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.1, 6, 16), emis(P.blue, 0.9)); ring.position.set(0, 0.95, 0.82); g.add(ring); const gl = cyl(0.5, 0.5, 0.1, P.blue, 16, emis(P.blue, 0.6)); gl.rotation.x = Math.PI / 2; gl.position.set(0, 0.95, 0.8); gl.castShadow = false; g.add(gl); return g; }

      /* 1 · parc : many laundromats, and the market that adds up to 726 M€ */
      const hP = grp(PL.parc); const shops = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { const g = shopFront(hP, [P.gold, P.blue, P.green][(r + c) % 3], 0.8); g.position.set(-6.0 + c * 1.7, 0, -4.5 + r * 2.8); shops.push(g); }
      const coinTower = grp(hP, 0, 0, 7.2); const cts = []; for (let k = 0; k < 18; k++) { const c = coinM(1.5); c.position.set(0, 0.1 + k * 0.17, 0); coinTower.add(c); cts.push(c); }
      ANCH.pc_row = () => V(0, 3.4, -2); ANCH.pc_coin = () => V(0, 6.0, 7.2); wrapAnch(["pc_row", "pc_coin"], PL.parc);
      upd((t) => { showHero("parc", hP, t); shops.forEach((g, i) => { g.scale.setScalar(0.8 * pop(t, TT.shops_on + i * 0.07, 0.4)); }); cts.forEach((c, k) => { const p0 = prog(t, TT.coin_on + k * 0.05, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 2 · ca : revenue varies a lot, from 35 000 to 150 000 */
      const hC = grp(PL.ca); const bLow = rb(3.2, 3.4, 3.2, P.gold, 0.15), bHigh = rb(3.2, 9.0, 3.2, P.green, 0.15); put(hC, bLow, -4.0, 0, 0); put(hC, bHigh, 4.0, 0, 0); const wLow = washer(hC, 0.8), wHigh = washer(hC, 0.8);
      ANCH.ca_low = () => V(-4.0, 7.2, 0); ANCH.ca_high = () => V(4.0, 13.0, 0); wrapAnch(["ca_low", "ca_high"], PL.ca);
      upd((t) => { showHero("ca", hC, t); const a = pop(t, TT.bar35, 0.6), b = pop(t, TT.bar150, 0.8); bLow.scale.y = a; bHigh.scale.y = b; wLow.g.position.set(-4.0, 3.4 * a, 0); wLow.g.scale.setScalar(0.8 * a); wHigh.g.position.set(4.0, 9.0 * b, 0); wHigh.g.scale.setScalar(0.8 * b); wLow.g.rotation.y = Math.sin(t * 0.8) * 0.3; wHigh.g.rotation.y = -Math.sin(t * 0.8) * 0.3; });

      /* 3 · client : a customer with a laundry bag, 9,50 euros per visit, 1,8 times a week */
      const hCl = grp(PL.client); const cu = person(hCl, P.pink, { scale: 1.8 }); cu.g.position.set(-4.2, 0, 3); const bag = sph(1.0, P.brown, 10); bag.scale.set(1, 1.2, 0.9); bag.position.set(0, 1.0, 0.8); cu.g.add(bag);
      const wm = washer(hCl, 1.5); wm.g.position.set(3.6, 0, -2);
      const tag9 = grp(hCl, 0, 8.2, 0); put(tag9, rb(4.6, 1.8, 0.3, P.gold, 0.3, emis(P.gold, 0.6)), 0, -0.9, 0);
      const week = []; for (let i = 0; i < 7; i++) { const d = rb(1.1, 0.4, 1.1, P.navy, 0.1, emis(P.gold, 0.05)); put(hCl, d, -4.0 + i * 1.35, 0, 7.4); week.push(d); }
      ANCH.cl_cust = () => V(-4.2, 5.8, 3); ANCH.cl_tag = () => V(0, 10.4, 0); ANCH.cl_week = () => V(0, 2.2, 7.4); wrapAnch(["cl_cust", "cl_tag", "cl_week"], PL.client);
      upd((t) => { showHero("client", hCl, t); const a0 = HW.client[0][0]; const u = eInOut(clamp((t - a0) / 3.0)); cu.g.position.x = lerp(-6.2, -1.4, u); cu.g.rotation.y = Math.PI / 2 - 0.2; walk(cu, t * 1.1, 7); wm.drum.rotation.z = t * 3.0; const k = pop(t, TT.price_on, 0.5); tag9.scale.setScalar(k); tag9.visible = k > 0.01; tag9.position.y = 8.2 + Math.sin(t * 2) * 0.2;
        week.forEach((d, i) => { const on = t >= TT.week_on + i * 0.15 && i < 2; const half = i === 1; d.material.emissiveIntensity = on ? (half ? 0.8 : 1.6) : 0.05; d.material.color.set(on ? P.gold : P.navy); d.scale.y = on ? (half ? 1.8 : 2.8) : 1; d.position.y = on ? (half ? 0.4 : 0.7) : 0; }); });

      /* 4 · couts : rent and energy, rent capped at 30 % of revenue */
      const hCo = grp(PL.couts); const rent = grp(hCo, -4.4, 0, -1); put(rent, rb(5.0, 4.2, 4.0, P.red, 0.2), 0, 0, 0); const rr = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.2, 4), M(P.cream)); rr.rotation.y = Math.PI / 4; rr.position.y = 5.3; rr.castShadow = true; rent.add(rr); put(rent, rb(1.2, 2.0, 0.2, P.gold, 0.04), 0, 0, 2.02);
      const bl = bolt(hCo, 2.2); bl.position.set(4.6, 6.0, -1); const bar100 = rb(10, 0.8, 1.6, P.cream, 0.1); put(hCo, bar100, 0, 0, 6.6); const bar30 = rb(3.0, 1.0, 1.7, P.red, 0.1, emis(P.red, 0.4)); put(hCo, bar30, -3.5, 0, 6.6);
      ANCH.co_rent = () => V(-4.4, 8.6, -1); ANCH.co_bolt = () => V(4.6, 9.6, -1); ANCH.co_bar = () => V(-3.5, 2.8, 6.6); wrapAnch(["co_rent", "co_bolt", "co_bar"], PL.couts);
      upd((t) => { showHero("couts", hCo, t); rent.scale.setScalar(pop(t, TT.cv_rent, 0.5)); const bs = pop(t, TT.cv_bolt, 0.5); bl.scale.setScalar(bs); bl.rotation.y = Math.sin(t * 1.4) * 0.5; bl.position.y = 6.0 + Math.sin(t * 2) * 0.25; bar100.scale.x = pop(t, TT.p30_on - 0.4, 0.5); bar100.visible = t >= TT.p30_on - 0.45; bar30.scale.x = pop(t, TT.p30_on, 0.6); bar30.visible = t >= TT.p30_on - 0.02; bar30.position.x = -5 + 1.5 * bar30.scale.x; });

      /* 5 · energie : the monthly bill triples, then it becomes the weak point */
      const hE = grp(PL.energie); const eLo = rb(3.2, 2.7, 3.2, P.blue, 0.15), eHi = rb(3.2, 7.0, 3.2, P.red, 0.15); put(hE, eLo, -3.8, 0, 0); put(hE, eHi, 3.8, 0, 0); const bl2 = bolt(hE, 1.4); const bl3 = bolt(hE, 1.5); const warn = grp(hE, 3.8, 12.6, 0); { const tri = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.2, 3), emis(P.gold, 1.2)); tri.rotation.y = Math.PI; warn.add(tri); put(warn, rb(0.3, 1.2, 0.2, P.dark, 0.04), 0, -0.6, 1.0); put(warn, rb(0.3, 0.3, 0.2, P.dark, 0.04), 0, -1.35, 1.0); }
      ANCH.en_low = () => V(-3.8, 6.4, 0); ANCH.en_high = () => V(3.8, 11.0, 0); wrapAnch(["en_low", "en_high"], PL.energie);
      upd((t) => { showHero("energie", hE, t); const a = pop(t, TT.e800, 0.6), b = pop(t, TT.e2400, 0.9); eLo.scale.y = a; eHi.scale.y = b; bl2.position.set(-3.8, 2.7 * a + 2.0, 0); bl2.scale.setScalar(1.4 * a); bl3.position.set(3.8, 7.0 * b + 2.4, 0); bl3.scale.setScalar(1.5 * b); bl2.rotation.y = bl3.rotation.y = Math.sin(t * 1.4) * 0.5; const w = pop(t, TT.crack_on, 0.4); warn.scale.setScalar(w * (1 + 0.12 * Math.sin(t * 8))); warn.visible = w > 0.01; warn.position.y = 12.6 + Math.sin(t * 3) * 0.2; eHi.material = M(t >= TT.crack_on ? "#ff3340" : P.red); });

      /* 6 · marge : the gross margin sweeps from 20 to 35 % of revenue */
      const hM = grp(PL.marge); const pie6 = pieMake(hM, [[0.35, P.gold], [0.65, P.blue]], 4.4, 0.4); const sl35 = pie6.sl[0].m;
      ANCH.mg_pie = () => V(Math.sin(pie6.sl[0].mid) * 3.0, 2.8, Math.cos(pie6.sl[0].mid) * 3.0); wrapAnch(["mg_pie"], PL.marge);
      const mk = []; [0.2, 0.35].forEach((f) => { const a = 0.4 + f * Math.PI * 2; const m = rb(0.25, 0.25, 5.2, P.white, 0.04, emis(P.white, 0.8)); m.position.set(Math.sin(a) * 2.5, 1.6, Math.cos(a) * 2.5); m.rotation.y = a; hM.add(m); mk.push(m); });
      upd((t) => { showHero("marge", hM, t); const k = t < TT.m20 ? 0 : t < TT.m35 ? eInOut(prog(t, TT.m20, 0.7)) * 0.2 : 0.2 + 0.15 * eInOut(prog(t, TT.m35, 0.7)); const frac = Math.max(0.001, k / 0.35); sl35.scale.set(frac, 1, frac); sl35.visible = k > 0.002; mk[0].visible = t >= TT.m20 - 0.02; mk[1].visible = t >= TT.m35 - 0.02; });

      /* 7 · budget : machines to buy, a pile of money from 50 to 100 thousand */
      const hB = grp(PL.budget); const wms = []; for (let i = 0; i < 6; i++) { const w = washer(hB, 0.9); w.g.position.set(-6.0 + i * 2.4, 0, -4); wms.push(w); }
      const pile = grp(hB, 0, 0, 3.5); const pc = []; for (let k = 0; k < 24; k++) { const c = coinM(1.3); c.position.set((k % 3 - 1) * 0.4, 0.1 + k * 0.17, (k % 2) * 0.3); pile.add(c); pc.push(c); }
      ANCH.bu_pile = () => V(0, 5.8, 3.5); ANCH.bu_wm = () => V(0, 5.6, -4); wrapAnch(["bu_pile", "bu_wm"], PL.budget);
      upd((t) => { showHero("budget", hB, t); wms.forEach((w, i) => { w.g.scale.setScalar(0.9 * pop(t, HW.budget[0][0] + 0.2 + i * 0.1, 0.4)); w.drum.rotation.z = t * 3 + i; }); pc.forEach((c, k) => { const t0 = k < 12 ? TT.b50 + k * 0.05 : TT.b100 + (k - 12) * 0.05; const p0 = prog(t, t0, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 8 · roi : six stepping stones, three to six years to pay back */
      const hR = grp(PL.roi); const yrs = []; for (let i = 0; i < 6; i++) { const st = cyl(1.0, 1.1, 0.8 + i * 0.35, P.navy, 14); put(hR, st, -6.2 + i * 2.5, (0.8 + i * 0.35) / 2, 0); const cap = cyl(0.8, 0.8, 0.2, P.gold, 14, emis(P.gold, 0.05)); put(hR, cap, -6.2 + i * 2.5, 0.8 + i * 0.35 + 0.1, 0); yrs.push(cap); }
      const clk = grp(hR, 0, 9.0, -1); { const rim = cyl(2.6, 2.6, 0.5, P.gold, 32); rim.rotation.x = Math.PI / 2; clk.add(rim); const face = cyl(2.3, 2.3, 0.3, P.cream, 32); face.rotation.x = Math.PI / 2; face.position.z = 0.3; clk.add(face); const h1 = grp(clk, 0, 0, 0.55); put(h1, rb(0.16, 1.9, 0.1, P.red, 0.03), 0, 0, 0); clk.userData.h = h1; }
      ANCH.ro_row = () => V(0, 4.2, 0); ANCH.ro_clk = () => V(0, 12.6, -1); wrapAnch(["ro_row", "ro_clk"], PL.roi);
      upd((t) => { showHero("roi", hR, t); clk.userData.h.rotation.z = -(t - HW.roi[0][0]) * 1.4; clk.scale.setScalar(pop(t, HW.roi[0][0] + 0.3, 0.5)); yrs.forEach((c, i) => { const on = (i < 3 && t >= TT.y3 + i * 0.25) || (i >= 3 && t >= TT.y6 - 0.6 + (i - 3) * 0.25); c.material.emissiveIntensity = on ? 1.5 : 0.05; c.material.color.set(on ? P.gold : "#3a4a66"); }); });

      /* 9 · pin : the location, a low rent and a flow of passers-by */
      const hPn = grp(PL.pin); const sf = shopFront(hPn, P.gold, 2.0); sf.position.set(-3.4, 0, -2); const pin = grp(hPn, -3.4, 9.0, -2); { const cn = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.4, 16), M(P.red)); cn.rotation.x = Math.PI; cn.position.y = -1.7; cn.castShadow = true; pin.add(cn); const sp = sph(1.6, P.red, 14); sp.position.y = 0.2; pin.add(sp); const hole = sph(0.6, P.cream, 10); hole.position.set(0, 0.2, 1.3); pin.add(hole); }
      const street = rb(16, 0.1, 4.4, P.navy, 0.04); put(hPn, street, 0, 0, 6.2); const pass = [P.pink, P.blue, P.orange, P.green, P.violet, P.gold].map((c) => person(hPn, c, { scale: 1.3 }));
      const tagL = grp(hPn, 4.6, 5.4, -2); put(tagL, rb(3.4, 1.4, 0.3, P.green, 0.25, emis(P.green, 0.5)), 0, -0.7, 0);
      ANCH.pn_pin = () => V(-3.4, 12.6, -2); ANCH.pn_tag = () => V(4.6, 6.6, -2); ANCH.pn_flow = () => V(0, 3.4, 6.2); wrapAnch(["pn_pin", "pn_tag", "pn_flow"], PL.pin);
      upd((t) => { showHero("pin", hPn, t); const ps = pop(t, TT.pin_vis, 0.6); pin.scale.setScalar(ps); pin.position.y = 9.0 + Math.sin(t * 2.4) * 0.35 * ps; pin.rotation.y = t * 1.0; sf.scale.setScalar(2.0 * pop(t, HW.pin[0][0] + 0.2, 0.5)); const ts = pop(t, TT.low_on, 0.5); tagL.scale.setScalar(ts); tagL.visible = ts > 0.01;
        pass.forEach((v, i) => { const u = (((t - TT.flow_on) * 0.18 + i / 6) % 1 + 1) % 1; v.g.visible = t >= TT.flow_on - 0.02; v.g.position.set(lerp(-8, 8, u), 0, 6.2 + (i % 2 ? 0.8 : -0.8)); v.g.rotation.y = Math.PI / 2; walk(v, t + i, 7); }); });

      /* 10 · temps : not only washing (crossed), a machine rented by the minute in a well-placed room */
      const hT = grp(PL.temps); const wmT = washer(hT, 2.0); wmT.g.position.set(-2.6, 0, 0); const crossT = cross(hT, 11); crossT.position.set(-2.6, 11.5, 4);
      const clkT = grp(hT, 4.4, 7.0, 0); { const rim = cyl(2.0, 2.0, 0.4, P.gold, 32); rim.rotation.x = Math.PI / 2; clkT.add(rim); const face = cyl(1.75, 1.75, 0.3, P.cream, 32); face.rotation.x = Math.PI / 2; face.position.z = 0.3; clkT.add(face); const h1 = grp(clkT, 0, 0, 0.5); put(h1, rb(0.14, 1.5, 0.1, P.red, 0.03), 0, 0, 0); clkT.userData.h = h1; }
      const bubbles = []; for (let i = 0; i < 12; i++) { const b = sph(0.35 + (i % 3) * 0.12, P.sky, 8, new THREE.MeshStandardMaterial({ color: P.sky, transparent: true, opacity: 0.6, emissive: P.sky, emissiveIntensity: 0.3 })); b.castShadow = false; hT.add(b); bubbles.push(b); }
      const pinT = grp(hT, 4.4, 0, 6.0); { const cn = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.4, 14), M(P.green)); cn.rotation.x = Math.PI; cn.position.y = 1.2; cn.castShadow = true; pinT.add(cn); const sp = sph(1.1, P.green, 12); sp.position.y = 3.0; pinT.add(sp); }
      ANCH.tm_washer = () => V(-2.6, 8.0, 0); ANCH.tm_clock = () => V(4.4, 9.8, 0); ANCH.tm_pin = () => V(4.4, 5.6, 6.0); wrapAnch(["tm_washer", "tm_clock", "tm_pin"], PL.temps);
      upd((t) => { showHero("temps", hT, t); wmT.drum.rotation.z = t * 3.4; const cr = t >= TT.cross_on && t < TT.time_on; crossT.visible = cr; crossT.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1);
        const k = pop(t, TT.time_on, 0.5); clkT.scale.setScalar(k); clkT.visible = k > 0.01; clkT.userData.h.rotation.z = -(t - TT.time_on) * 3.2; const pk = pop(t, TT.place_on, 0.5); pinT.scale.setScalar(pk); pinT.position.y = Math.sin(t * 2.2) * 0.3 * pk;
        bubbles.forEach((b, i) => { const u = (((t - HW.temps[0][0]) * 0.25 + i / 12) % 1 + 1) % 1; b.position.set(-2.6 + Math.sin(i * 2.1 + t * 1.5) * 2.0, 3.5 + u * 8.0, 1.8 + Math.cos(i * 1.7) * 0.8); b.scale.setScalar(1 - 0.4 * u); }); });

      /* 11 · cta : a comment bubble and a subscribe button */
      const hCt = grp(PL.cta); pedestal(hCt, 8); const bub = grp(hCt, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(P.cream)); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 8); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hCt, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), M(P.white)); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta);
      upd((t) => { showHero("cta", hCt, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
