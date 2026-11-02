      /* =====================================================================
         WORLD : « propre et net » (deep teal, mint, soap white, bucket yellow). One continuous journey, one hero subject per idea.
         ===================================================================== */
      const rn = rng(67);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n, i) => { PL[n] = grp(scene, 0, 0, -B.spacing * i); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });
      const pop = (t, t0, d = 0.45) => Math.max(0.001, eOutBack(prog(t, t0, d)));

      /* floor, path, mint bokeh, far offices with lit windows */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#0a2a2e", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#0f3a40", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.green, P.gold, P.sky][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 10; i++) { const w = 8 + rn() * 6, h = 10 + rn() * 14; const b = rb(w, h, 8, "#0f3a40", 0.2, sil); b.position.set(-66 + i * 14 + rn() * 4, 0, -140 - rn() * 14); backdrop.add(b); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { if (rn() > 0.55) continue; const wn = rb(1.2, 1.0, 0.2, P.gold, 0.05, emis(P.gold, 0.5)); wn.castShadow = false; wn.position.set(b.position.x + (c - 1) * 2.6, 2 + r * 2.8, b.position.z + 4.1); backdrop.add(wn); } }
      const pathDots = []; for (let i = 0; i < 100; i++) { const m = sph(0.15, P.green, 6, emis(P.green, 0.9)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const rings = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#12474d", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis(P.green, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders ---- */
      function worker(p, vest = P.gold, s = 1) { const g = grp(p); g.scale.setScalar(s); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(vest)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, "#ffe2cc", 10); h.position.y = 1.78; g.add(h); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(P.white)); cap.position.y = 1.9; g.add(cap);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, vest, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        return { g, body: b, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      function bucketMop(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, cyl(0.9, 0.7, 1.3, P.gold, 14), 0, 0, 0); const h = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 6, 14, Math.PI), M(P.gray)); h.position.y = 1.3; g.add(h); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 14), M(P.sky)); w.position.y = 1.28; g.add(w);
        const mop = grp(g, 1.6, 0, 0); put(mop, cyl(0.07, 0.07, 3.4, P.brown, 6), 0, 0.2, 0); const hd = rb(1.0, 0.25, 0.35, P.sky, 0.08); put(mop, hd, 0, 0, 0); mop.rotation.z = -0.25; return g; }
      function office(p, w, h, d, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(w, h, d, hex, 0.15), 0, 0, 0); const cols = Math.max(2, Math.round(w / 1.5)), rows = Math.max(2, Math.round(h / 1.8)); for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const wn = rb(0.8, 0.8, 0.1, P.sky, 0.04, emis(P.sky, 0.55)); wn.castShadow = false; wn.position.set((c - (cols - 1) / 2) * (w / cols), 0.8 + r * (h - 1.2) / rows, d / 2 + 0.02); g.add(wn); } return g; }
      function van(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.6, 1.4, 1.3, hex, 0.15), 0, 0.4, 0); put(g, rb(1.0, 1.0, 1.2, P.sky, 0.12), 1.6, 0.4, 0); [[-0.8], [0.8], [1.8]].forEach(([x]) => { const w = cyl(0.35, 0.35, 1.4, P.navy, 10); w.rotation.x = Math.PI / 2; w.position.set(x, 0.35, 0); g.add(w); }); return g; }
      function pieMake(p, parts, r = 4.2, ang0 = 0.3) { const g = grp(p); const sl = []; parts.reduce((ang, [f, col]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; g.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, ang0); put(g, cyl(r + 0.3, r + 0.4, 0.3, P.cream, 40), 0, -0.05, 0); return { g, sl }; }
      function clockObj(p, s = 1) { const g = grp(p); g.scale.setScalar(s); const rim = cyl(2.6, 2.6, 0.5, P.gold, 32); rim.rotation.x = Math.PI / 2; g.add(rim); const face = cyl(2.3, 2.3, 0.3, P.cream, 32); face.rotation.x = Math.PI / 2; face.position.z = 0.3; g.add(face);
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const tk = rb(0.12, i % 3 ? 0.3 : 0.5, 0.12, P.navy, 0.03); tk.position.set(Math.sin(a) * 1.9, Math.cos(a) * 1.9 - 0.2, 0.5); tk.rotation.z = -a; g.add(tk); }
        const h1 = grp(g, 0, 0, 0.55), h2 = grp(g, 0, 0, 0.62); put(h1, rb(0.18, 1.3, 0.1, P.navy, 0.04), 0, 0, 0); put(h2, rb(0.12, 1.9, 0.1, P.red, 0.03), 0, 0, 0); return { g, h1, h2 }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 24), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 6, 40), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 8) => { const g = grp(p); const a = rb(0.5, len, 0.5, P.red, 0.1), b = rb(0.5, len, 0.5, P.red, 0.1); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };

      /* 1 · marche : offices, 600 000 people (a crowd of vests), 15 000 small companies (vans) */
      const hM = grp(PL.marche); [[-6.4, 6.6, P.cream], [-2.2, 9.0, P.sky], [2.0, 7.4, P.cream], [6.2, 10.0, P.gray]].forEach(([x, h, c], i) => { const o = office(hM, 3.4, h, 3.0, c, 1); o.position.set(x, 0, -7); });
      const crowd = []; for (let i = 0; i < 40; i++) { const w = worker(hM, P.gold, 0.8); w.g.position.set(-5.0 + (i % 10) * 1.1, 0, -2.2 + Math.floor(i / 10) * 1.1); crowd.push(w); }
      const vans = []; for (let i = 0; i < 12; i++) { const v = van(hM, [P.green, P.blue, P.orange][i % 3], 0.8); v.position.set(-5.6 + (i % 6) * 2.2, 0, 4.2 + Math.floor(i / 6) * 2.0); vans.push(v); }
      const coinTower = grp(hM, 7.0, 0, 3.0); const mcs = []; for (let k = 0; k < 14; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); coinTower.add(c); mcs.push(c); }
      ANCH.mc_crowd = () => V(0, 3.6, 0.5); ANCH.mc_vans = () => V(0, 3.2, 5.2); ANCH.mc_coin = () => V(7.0, 4.2, 3.0); wrapAnch(["mc_crowd", "mc_vans", "mc_coin"], PL.marche);
      upd((t) => { showHero("marche", hM, t); crowd.forEach((w, i) => { w.g.scale.setScalar(0.8 * pop(t, TT.figs_on + i * 0.04, 0.35)); w.armR.rotation.z = Math.sin(t * 3 + i) * 0.3; }); vans.forEach((v, i) => { v.scale.setScalar(0.8 * pop(t, TT.vans_on + i * 0.06, 0.4)); }); mcs.forEach((c, k) => { const p0 = prog(t, TT.coin_on + k * 0.05, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; }); });

      /* 2 · marge : a thin 10 % slice of the pie is what stays after wages */
      const hG = grp(PL.marge); const pie2 = pieMake(hG, [[0.1, P.gold], [0.9, P.blue]], 4.6, 0.4);
      ANCH.mg_pie = () => V(Math.sin(pie2.sl[0].mid) * 3.2, 2.8, Math.cos(pie2.sl[0].mid) * 3.2); wrapAnch(["mg_pie"], PL.marge);
      upd((t) => { showHero("marge", hG, t); pie2.sl.forEach((s_, i) => { const t0 = i ? TT.pie_blue : TT.pie_on; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 1.0 * Math.min(1, prog(t, TT.pie_on, 0.6)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); }); });

      /* 3 · capital : a worker with a bucket and a mop owns almost nothing; 11 000 against 76 000 euros per employee */
      const hCa = grp(PL.capital); const w3 = worker(hCa, P.gold, 1.8); w3.g.position.set(-5.2, 0, 2); const bm = bucketMop(hCa, 1.5); bm.position.set(-2.6, 0, 3.4);
      const cLo = cyl(1.3, 1.3, 1.1, P.gold, 20), cHi = cyl(1.3, 1.3, 7.6, P.blue, 20); put(hCa, cLo, 2.2, 0.55, 0); put(hCa, cHi, 6.0, 3.8, 0);
      ANCH.cp_fig = () => V(-5.2, 5.6, 2); ANCH.cp_small = () => V(2.2, 2.8, 0); ANCH.cp_big = () => V(6.0, 8.8, 0); wrapAnch(["cp_fig", "cp_small", "cp_big"], PL.capital);
      upd((t) => { showHero("capital", hCa, t); const a0 = HW.capital[0][0]; w3.g.scale.setScalar(1.8 * pop(t, TT.fig_on, 0.5)); w3.armR.rotation.z = Math.sin(t * 2.2) * 0.4; bm.scale.setScalar(1.5 * pop(t, TT.fig_on + 0.3, 0.5)); const a = pop(t, TT.k11, 0.6), b = pop(t, TT.k76, 0.9); cLo.scale.y = a; cLo.position.y = 0.55 * a; cHi.scale.y = b; cHi.position.y = 3.8 * b; });

      /* 4 · salaires : most of the value added goes to wages */
      const hS = grp(PL.salaires); const stk = grp(hS, 0, 0, 0); const sg1 = rb(5.0, 9.0, 3.0, P.red, 0.2), sg2 = rb(5.0, 1.0, 3.0, P.gold, 0.2, emis(P.gold, 0.35)); put(stk, sg1, 0, 0, 0); put(stk, sg2, 0, 9.05, 0);
      const bills = []; for (let k = 0; k < 10; k++) { const b = rb(1.6, 0.06, 0.9, P.green, 0.02); b.castShadow = false; hS.add(b); bills.push(b); }
      ANCH.sl_bar = () => V(0, 11.6, 0); ANCH.sl_wage = () => V(-4.0, 5.0, 1.6); wrapAnch(["sl_bar", "sl_wage"], PL.salaires);
      upd((t) => { showHero("salaires", hS, t); const a = pop(t, TT.sal_on, 0.8); sg1.scale.y = a; sg2.scale.y = pop(t, TT.va_on, 0.5); sg2.position.y = 9.05 * a; stk.rotation.y = Math.sin(t * 0.8) * 0.3;
        bills.forEach((b, k) => { const u = (((t - TT.sal_on) * 0.4 + k / 10) % 1 + 1) % 1; b.visible = t > TT.sal_on + 0.3; b.position.set(lerp(-1.0, -6.0, u), 7.0 - u * 6.0 + Math.sin(u * 6.28) * 0.4, 2.0); b.rotation.set(u * 6, u * 4, 0); }); });

      /* 5 · tp : 25 workers, 11 of them (44 %) shown as half-size part-time hours */
      const hT = grp(PL.tp); const g5 = []; for (let i = 0; i < 25; i++) { const w = worker(hT, i < 11 ? P.orange : P.gold, 1.1); w.g.position.set(-5.6 + (i % 5) * 2.8, 0, -4.4 + Math.floor(i / 5) * 2.2); g5.push(w); }
      ANCH.tp_grid = () => V(0, 4.6, 0); wrapAnch(["tp_grid"], PL.tp);
      upd((t) => { showHero("tp", hT, t); g5.forEach((w, i) => { const base = pop(t, HW.tp[0][0] + 0.1 + i * 0.03, 0.4); const part = i < 11 && t >= TT.tp_on + i * 0.06; const k = part ? 0.6 + 0.4 * (1 - eOut(prog(t, TT.tp_on + i * 0.06, 0.5))) : 1; w.g.scale.set(1.1 * base, 1.1 * base * k, 1.1 * base); w.body.material = M(part ? P.orange : P.gold); }); });

      /* 6 · aube : the working day starts at 6 o'clock, a sun rises, 31 % of the cleaners already walk */
      const hA = grp(PL.aube); const clkA = clockObj(hA, 1.3); clkA.g.position.set(-3.8, 8.6, -2); clkA.h1.rotation.z = Math.PI; clkA.h2.rotation.z = Math.PI;
      const sunB = sph(2.4, P.gold, 16, emis(P.gold, 1.6)); hA.add(sunB); const hill = rb(18, 1.2, 4, "#0f3a40", 0.3); put(hA, hill, 0, 0, -6);
      const wk = []; for (let i = 0; i < 10; i++) { const w = worker(hA, i < 3 ? P.gold : P.gray, 1.3); w.g.position.set(-7 + i * 1.5, 0, 3); wk.push(w); }
      ANCH.au_clock = () => V(-3.8, 12.6, -2); ANCH.au_sun = () => V(5.0, 9.4, -4); ANCH.au_crowd = () => V(0, 4.0, 3); wrapAnch(["au_clock", "au_sun", "au_crowd"], PL.aube);
      upd((t) => { showHero("aube", hA, t); const u = eInOut(clamp((t - TT.sun_on) / 3.0)); sunB.position.set(5.0, lerp(0.2, 8.4, u), -4); clkA.g.scale.setScalar(1.3 * pop(t, TT.h6, 0.5)); wk.forEach((w, i) => { const base = pop(t, TT.sun_on + 0.2 + i * 0.05, 0.4); w.g.scale.setScalar(1.3 * base); const act = i < 3 && t >= TT.share31; w.body.material = M(act ? P.gold : P.gray); walk(w, t * 1.1 + i, act ? 7 : 0); }); });

      /* 7 · ao : three bids, the lowest price wins */
      const hO = grp(PL.ao); const bars = [[-5.0, 5.4, P.red], [0, 3.2, P.green], [5.0, 4.4, P.blue]].map(([x, h, c]) => { const b = rb(3.0, h, 3.0, c, 0.2); put(hO, b, x, 0, 0); const env = rb(2.2, 0.3, 1.5, P.cream, 0.05); put(hO, env, x, h + 0.3, 0); const tr = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.8, 3), M(P.red)); tr.rotation.x = Math.PI / 2; tr.position.set(x, h + 0.9, 0.8); tr.visible = false; hO.add(tr); return { b, env, h, x }; });
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), emis(P.gold, 1.4)); star.position.set(0, 6.0, 0); hO.add(star);
      ANCH.ao_win = () => V(0, 7.8, 0); ANCH.ao_row = () => V(0, 6.2, 0); wrapAnch(["ao_win", "ao_row"], PL.ao);
      upd((t) => { showHero("ao", hO, t); bars.forEach(({ b, env, h, x }, i) => { const k = pop(t, TT.env_on + i * 0.35, 0.6); b.scale.y = k; env.position.y = h * k + 0.3; env.scale.setScalar(k); }); const s = pop(t, TT.win_on, 0.5); star.scale.setScalar(s); star.visible = s > 0.01; star.rotation.y = t * 2; star.position.y = 4.6 + Math.sin(t * 3) * 0.2; });

      /* 8 · reprise : the contract changes hands, the team stays */
      const hR = grp(PL.reprise); const oA = office(hR, 4.2, 5.4, 3.0, P.blue, 1); oA.position.set(-6.4, 0, -3); const oB = office(hR, 4.2, 5.4, 3.0, P.orange, 1); oB.position.set(6.4, 0, -3);
      const team = []; for (let i = 0; i < 5; i++) { const w = worker(hR, P.gold, 1.4); w.g.position.set(-3.0 + i * 1.5, 0, 3.2); team.push(w); }
      const paper = rb(2.6, 0.2, 3.4, P.cream, 0.06); hR.add(paper); for (let i = 0; i < 4; i++) { const ln = rb(1.8, 0.06, 0.12, P.navy, 0.02); ln.position.set(0, 0.14, -1.0 + i * 0.6); paper.add(ln); }
      ANCH.rp_a = () => V(-6.4, 7.2, -3); ANCH.rp_b = () => V(6.4, 7.2, -3); ANCH.rp_team = () => V(0, 4.6, 3.2); wrapAnch(["rp_a", "rp_b", "rp_team"], PL.reprise);
      upd((t) => { showHero("reprise", hR, t); const u = eInOut(prog(t, TT.move_on, 1.2)); paper.position.set(lerp(-5.0, 5.0, u), 4.6 + Math.sin(u * Math.PI) * 1.6, lerp(-1.0, -1.0, u)); paper.rotation.y = u * 6.28; paper.scale.setScalar(pop(t, TT.ct_on, 0.5));
        team.forEach((w, i) => { w.g.scale.setScalar(1.4 * pop(t, TT.ct_on + i * 0.1, 0.4)); const stay = t >= TT.stay_on; w.body.material = M(stay ? P.green : P.gold); w.armR.rotation.z = stay ? Math.sin(t * 4 + i) * 0.5 - 1.6 : 0; }); });

      /* 9 · planning : a weekly planning board is filled hour by hour, the margin is played here */
      const hP = grp(PL.planning); const board = grp(hP, 0, 0, 0); put(board, rb(10.4, 8.6, 0.6, P.navy, 0.2), 0, 0, 0); put(board, rb(10.8, 0.5, 0.8, P.gold, 0.1), 0, 8.6, 0);
      const cells = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) { const cc = [P.green, P.blue, P.gold, P.pink][(r * 2 + c) % 4]; const cell = rb(1.6, 1.0, 0.3, cc, 0.1); cell.position.set(-4.0 + c * 2.0, 0.6 + r * 1.3, 0.4); board.add(cell); cells.push(cell); }
      const person10 = worker(hP, P.gold, 1.6); person10.g.position.set(6.6, 0, 3.2);
      ANCH.pl_board = () => V(0, 10.4, 0); wrapAnch(["pl_board"], PL.planning);
      upd((t) => { showHero("planning", hP, t); board.scale.setScalar(pop(t, TT.board_on, 0.6)); cells.forEach((c, i) => { const t0 = TT.fill_on + i * 0.07; const k = pop(t, t0, 0.35); c.scale.set(k, k, 1); c.visible = t >= t0 - 0.02; }); person10.armR.rotation.z = Math.sin(t * 3) * 0.6 - 1.2; });

      /* 10 · heures : square metres crossed out, hours of work that fill minute by minute */
      const hH = grp(PL.heures); const tiles = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const tl = rb(1.3, 0.2, 1.3, (r + c) % 2 ? P.cream : P.sky, 0.04); tl.position.set(-4.0 + c * 1.5, 0, 4.2 + r * 1.5 - 1.0); hH.add(tl); tiles.push(tl); }
      const crossH = cross(hH, 10); crossH.position.set(0, 10.5, 7.5); const clkH = clockObj(hH, 1.4); clkH.g.position.set(0, 7.4, -2); const dropC = []; for (let k = 0; k < 12; k++) { const c = coinM(0.45); c.visible = false; hH.add(c); dropC.push(c); }
      const wH = worker(hH, P.gold, 1.7); wH.g.position.set(-6.0, 0, -1); const bm2 = bucketMop(hH, 1.4); bm2.position.set(-3.4, 0, 0.4);
      ANCH.ht_floor = () => V(0, 3.2, 6.2); ANCH.ht_clock = () => V(0, 11.6, -2); wrapAnch(["ht_floor", "ht_clock"], PL.heures);
      upd((t) => { showHero("heures", hH, t); const cr = t >= TT.cross_on && t < TT.clock_on; crossH.visible = cr; crossH.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1); tiles.forEach((tl, i) => { tl.scale.setScalar(pop(t, HW.heures[0][0] + 0.1 + i * 0.03, 0.3)); });
        const ks = pop(t, TT.clock_on, 0.5); clkH.g.scale.setScalar(1.4 * ks); clkH.g.visible = ks > 0.01; clkH.h2.rotation.z = -(t - TT.clock_on) * 6.0; clkH.h1.rotation.z = -(t - TT.clock_on) * 0.5; wH.armR.rotation.z = Math.sin(t * 3) * 0.5;
        dropC.forEach((c, k) => { const u = (((t - TT.min_on) * 0.7 + k / 12) % 1 + 1) % 1; c.visible = t >= TT.min_on; c.position.set(lerp(-1.5, 2.5, (k % 4) / 3), 7.0 - u * 6.5, -2 + (k % 3)); c.rotation.x = t * 5; }); });

      /* 11 · cta : a comment bubble and a subscribe button */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(P.cream)); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 8); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), M(P.white)); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
