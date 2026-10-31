      /* =====================================================================
         WORLD v3 : ONE continuous journey. Every idea has its own hero subject on its own stage,
         the stages sit one after another along a path, and the camera glides from one to the next (no cuts).
         ===================================================================== */
      const rn = rng(7);
      const HW = B.heroes, TT = B.times;
      const PLACE_Z = {}; B.order.forEach((n, i) => { PLACE_Z[n] = -B.spacing * i; });
      const PL = {}; B.order.forEach((n) => { PL[n] = grp(scene, 0, 0, PLACE_Z[n]); });
      /* hero visibility: it grows in while the camera is still gliding towards it and leaves while the camera glides away */
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });
      const on = (t, a, d = 0.35) => popS(t, a, d);

      /* backdrop (follows the camera so the park silhouettes never get left behind) + a huge dark floor with a glowing path */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#150a42", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#1d0f52", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 50; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.gold, P.pink, P.blue][i % 3]; const m = sph(0.3 + rn() * 0.3, c, 6, emis(c, 1.2)); m.position.set(Math.cos(a) * r, 3 + rn() * 18, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      { const fw = new THREE.Mesh(new THREE.TorusGeometry(12, 0.3, 6, 40), sil); fw.position.set(-30, 13, -80); backdrop.add(fw); const fw2 = fw.clone(); fw2.scale.setScalar(0.7); fw2.position.set(34, 10, -90); backdrop.add(fw2);
        const arc = new THREE.Mesh(new THREE.TorusGeometry(10, 0.4, 6, 30, Math.PI), sil); arc.position.set(8, 0, -85); backdrop.add(arc); const arc2 = arc.clone(); arc2.position.set(24, 0, -95); arc2.scale.set(1.2, 1.5, 1); backdrop.add(arc2);
        [-14, 2, 44].forEach((x, i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(7 + i, 12 + i * 2, 8), sil); c.position.set(x, 6, -95 - i * 5); backdrop.add(c); }); }
      const pathDots = []; for (let i = 0; i < 120; i++) { const m = sph(0.16, P.blue, 6, emis(P.blue, 1.0)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const stageDisc = (name) => { const g = grp(PL[name]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#2a1470", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis("#2fc4ff", 1.0)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; };
      const rings = B.order.map((n) => stageDisc(n));
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.7 + 0.6 * Math.sin(t * 2 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.6 * Math.sin(t * 3 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.2; });
        backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* --- builders --- */
      function person(p, hex) { const g = grp(p, 0, 0, 0); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(hex)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, "#ffe2cc", 10); h.position.y = 1.78; g.add(h);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, hex, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        return { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      function burger(p, s) { const g = grp(p); g.scale.setScalar(s); put(g, cyl(1.0, 1.0, 0.3, "#f3c27c", 14), 0, 0.15, 0); put(g, cyl(1.12, 1.12, 0.1, P.green, 14), 0, 0.35, 0); put(g, cyl(1.0, 1.0, 0.12, P.red, 14), 0, 0.46, 0); put(g, cyl(1.04, 1.04, 0.3, "#8a5a44", 14), 0, 0.72, 0);
        const top = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M("#f3c27c")); top.scale.y = 0.75; top.position.y = 0.87; top.castShadow = true; g.add(top); return g; }
      function cup(p, s) { const g = grp(p); g.scale.setScalar(s); put(g, cyl(0.95, 0.72, 2.2, P.white, 14), 0, 1.1, 0); put(g, cyl(0.98, 0.98, 0.5, P.red, 14), 0, 1.5, 0); put(g, cyl(1.0, 1.0, 0.14, P.white, 14), 0, 2.28, 0); put(g, rb(0.18, 1.5, 0.18, P.red, 0.04), 0.3, 2.3, 0).rotation.z = -0.25; return g; }
      function teddy(p, s) { const g = grp(p); g.scale.setScalar(s); const b = sph(1.2, P.brown, 12); b.position.y = 1.4; g.add(b); const h = sph(0.9, P.brown, 12); h.position.y = 3.1; g.add(h); [-0.62, 0.62].forEach((sx) => { const e = sph(0.32, P.brown, 8); e.position.set(sx, 3.8, 0); g.add(e); const a = sph(0.4, P.brown, 8); a.position.set(sx * 1.9, 1.6, 0.2); g.add(a); const l = sph(0.45, P.brown, 8); l.position.set(sx * 1.1, 0.4, 0.5); g.add(l); });
        const sn = sph(0.35, "#f3c27c", 8); sn.position.set(0, 2.95, 0.8); g.add(sn); put(g, rb(1.2, 0.3, 0.2, P.red, 0.05), 0, 2.2, 0.9); return g; }
      function camera3(p, s) { const g = grp(p); g.scale.setScalar(s); put(g, rb(3, 1.9, 1.4, P.navy, 0.15), 0, 0.2, 0); const l = cyl(0.8, 0.8, 0.9, P.gray, 16); l.rotation.x = Math.PI / 2; l.position.set(0, 1.1, 1.0); g.add(l); put(g, rb(0.9, 0.35, 0.5, P.gold, 0.06), -0.9, 2.1, 0); const fl = sph(0.28, P.white, 8, emis("#fff7d0", 1.4)); fl.position.set(0.9, 1.8, 0.7); g.add(fl); return g; }
      function ticketMesh(p, s) { const g = grp(p); g.scale.setScalar(s); put(g, rb(7, 3.6, 0.4, P.gold, 0.12), 0, -1.8, 0); [-3.5, 3.5].forEach((x) => put(g, cyl(0.7, 0.7, 0.5, P.dark, 14), x, 0, 0).rotation.x = Math.PI / 2); for (let i = 0; i < 7; i++) put(g, rb(0.14, 0.34, 0.5, P.dark, 0.03), 2.2, -3.1 + i * 0.5, 0);
        put(g, rb(2.8, 0.34, 0.5, P.navy, 0.06), -0.9, -1.2, 0); put(g, rb(2.0, 0.26, 0.5, P.navy, 0.06), -1.3, -2.0, 0); const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), M(P.red)); st.position.set(2.3, -1.0, 0.3); g.add(st); return g; }
      function register(p, s) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.8, 1.1, 2.0, P.blue, 0.12)); const scr = put(g, rb(1.8, 0.9, 0.16, P.navy, 0.06), 0, 1.55, -0.4); scr.rotation.x = -0.4; put(scr, rb(1.5, 0.55, 0.06, P.green, 0.04), 0, 0.17, 0.09); put(g, rb(2.4, 0.24, 1.5, P.white, 0.07), 0, 1.1, 0.1); put(g, rb(1.3, 0.16, 0.7, P.gold, 0.05), 0, 1.34, 0.6); return g; }
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      function gateArch(p, s) { const g = grp(p); g.scale.setScalar(s); [-7, 7].forEach((x) => put(g, rb(1.4, 8, 1.4, P.gold, 0.1), x, 0, 0)); put(g, rb(16, 1.8, 1.6, P.gold, 0.1), 0, 8, 0); put(g, rb(12.4, 1.2, 0.3, P.navy, 0.06), 0, 8.3, 0.9);
        for (let i = 0; i < 14; i++) { const l = sph(0.17, [P.pink, P.blue, P.gold][i % 3], 6, emis([P.pink, P.blue, P.gold][i % 3], 1.3)); l.position.set(-6.5 + i, 7.7, 1.0); g.add(l); } return g; }
      const pedestal = (p) => { const g = grp(p); put(g, cyl(3.0, 3.2, 0.5, P.violet, 24), 0, 0.25, 0); const r = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.07, 6, 40), emis(P.pink, 1.2)); r.rotation.x = Math.PI / 2; r.position.y = 0.52; g.add(r); return g; };

      /* 1 · ticket + entrance gate */
      const hTicket = grp(PL.ticket); const gate1 = gateArch(hTicket, 1); gate1.position.set(0, 0, -9); const tk = ticketMesh(hTicket, 1); tk.position.set(0, 5.4, 0);
      ANCH.gate = () => V(0, 10.5, -9); ANCH.ticket = () => V(0, 5.4, 0); wrapAnch(["gate", "ticket"], PL.ticket);
      upd((t) => { showHero("ticket", hTicket, t); tk.rotation.y = Math.sin(t * 1.4) * 0.6; tk.position.y = 5.4 + Math.sin(t * 2) * 0.25; });

      /* 2 · pie chart 55 / 45 */
      const hPie = grp(PL.pie); const pie = grp(hPie, 0, 0.1, 0); const slices = [];
      [[0.55, P.gold], [0.45, P.blue]].reduce((ang, [f, col]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.6, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.8; pie.add(m); slices.push({ m, mid: ang + len / 2 }); return ang + len; }, 0.4);
      put(pie, cyl(4.9, 5.0, 0.3, P.cream, 40), 0, -0.05, 0); const pt = ticketMesh(slices[0].m, 0.35); pt.position.set(Math.sin(slices[0].mid) * 2.6, 1.9, Math.cos(slices[0].mid) * 2.6); pt.rotation.x = -Math.PI / 2 + 0.2;
      const tmpV = new THREE.Vector3();
      ANCH.pie_gold = () => { tmpV.set(Math.sin(slices[0].mid) * 3.3, 2.2, Math.cos(slices[0].mid) * 3.3); return PL.pie.localToWorld(pie.localToWorld(tmpV.clone()).sub(PL.pie.position)); };
      ANCH.pie_cyan = () => { tmpV.set(Math.sin(slices[1].mid) * 3.3, 2.2, Math.cos(slices[1].mid) * 3.3); return PL.pie.localToWorld(pie.localToWorld(tmpV.clone()).sub(PL.pie.position)); };
      upd((t) => { showHero("pie", hPie, t); pie.rotation.y = t * 0.25; const out = 1.1 * eOutBack(prog(t, TT.pie_out, 0.7)); slices[0].m.position.set(Math.sin(slices[0].mid) * out, 0.8, Math.cos(slices[0].mid) * out); });

      /* 3 · four items on a turntable, each one appears exactly on its word */
      const hItems = grp(PL.items); pedestal(hItems); const itemObj = { burger: burger(hItems, 1.5), cup: cup(hItems, 1.15), teddy: teddy(hItems, 0.95), camera: camera3(hItems, 1.1) };
      Object.values(itemObj).forEach((o) => { o.position.y = 0.5; });
      ANCH.item = () => V(0, 5.6, 0); wrapAnch(["item"], PL.items);
      upd((t) => { const baseS = heroVis("items", t); hItems.visible = baseS > 0.01; Object.entries(itemObj).forEach(([k, o]) => { const w = (HW["item_" + k] || [])[0]; const s = w ? (t >= w[0] && t < w[1] ? 0.4 + 0.6 * popS(t, w[0], 0.3) : 0) : 0; o.visible = s > 0.01; o.scale.setScalar(Math.max(s, 0.001) * (k === "burger" ? 1.5 : k === "cup" ? 1.15 : k === "teddy" ? 0.95 : 1.1)); o.rotation.y = t * 1.5; }); });

      /* 4 · the margin: a coin stack grows next to a green arrow */
      const hCoins = grp(PL.coins); const stack = []; for (let k = 0; k < 16; k++) { const c = coinM(1.5); c.position.y = 0.1 + k * 0.17; c.rotation.y = k * 0.5; hCoins.add(c); stack.push(c); }
      const arrow = grp(hCoins, 5.5, 0, 0); put(arrow, rb(1.2, 4.5, 1.2, P.green, 0.12), 0, 0, 0); const ah = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.2, 4), M(P.green)); ah.position.y = 5.6; ah.rotation.y = Math.PI / 4; ah.castShadow = true; arrow.add(ah);
      ANCH.coins = () => V(0, 4.6, 0); wrapAnch(["coins"], PL.coins);
      upd((t) => { showHero("coins", hCoins, t); const a0 = HW.coins[0][0]; stack.forEach((c, k) => { const p0 = prog(t, a0 + 0.1 + k * 0.1, 0.4); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 5; }); arrow.position.y = Math.sin(t * 3) * 0.3; });

      /* 5 · teddy bear (the price panel carries the numbers) */
      const hTeddy = grp(PL.teddy); pedestal(hTeddy); const bigTeddy = teddy(hTeddy, 1.4); bigTeddy.position.y = 0.5; ANCH.teddy = () => V(0, 7.6, 0); wrapAnch(["teddy"], PL.teddy);
      upd((t) => { showHero("teddy", hTeddy, t); bigTeddy.rotation.y = Math.sin(t * 1.2) * 0.6; });

      /* 6 · bar chart: billet / restauration / boutiques (bars rise on the words) */
      const hBars = grp(PL.bars); const barDefs = [[-4.2, 5.7, P.gold, "ticket", "bar1"], [0, 2.1, P.blue, "burger", "bar2"], [4.2, 0.9, P.green, "teddy", "bar3"]]; const bars = [];
      barDefs.forEach(([x, h, col, ic, key]) => { const g = grp(hBars, x, 0, 0); const b = rb(2.7, h, 2.7, col, 0.15); g.add(b); const icon = ic === "ticket" ? ticketMesh(g, 0.32) : ic === "burger" ? burger(g, 0.8) : teddy(g, 0.42); icon.position.y = h + (ic === "ticket" ? 1.2 : 0.7); bars.push({ g, b, h, icon, key }); });
      put(hBars, rb(13, 0.3, 4, P.navy, 0.08), 0, -0.3, 0); ANCH.bar_gold = () => V(-4.2, 8.4, 0); ANCH.bar_cyan = () => V(0, 4.9, 0); ANCH.bar_pink = () => V(4.2, 3.2, 0); wrapAnch(["bar_gold", "bar_cyan", "bar_pink"], PL.bars);
      upd((t) => { showHero("bars", hBars, t); bars.forEach(({ b, icon, key }) => { const p = eOutBack(prog(t, TT[key], 0.6)); b.scale.y = Math.max(p, 0.001); icon.visible = p > 0.3; icon.rotation.y = t * 1.2; }); });

      /* 7 · a visitor walks in, coins flow into the register */
      const hVis = grp(PL.visitor); const reg7 = register(hVis, 2.6); reg7.position.set(6.5, 0, 0); reg7.rotation.y = -0.5; const vis = [person(hVis, P.pink), person(hVis, P.blue), person(hVis, P.orange)];
      const flow = []; for (let k = 0; k < 14; k++) { const c = coinM(0.4); c.visible = false; hVis.add(c); flow.push(c); }
      ANCH.visitor = () => V(vis[0].g.position.x, 3.4, vis[0].g.position.z); wrapAnch(["visitor"], PL.visitor);
      upd((t) => { showHero("visitor", hVis, t); const t0 = HW.visitor[0][0];
        vis.forEach((v, i) => { const u = (((t - t0) * 0.16 + i * 0.33) % 1); v.g.position.set(lerp(-11, 1.5, u), 0, lerp(5, 0.5, u) + i * 1.2); v.g.rotation.y = Math.PI / 2 + 0.3; walk(v, t * 1.2 + i, 7); });
        flow.forEach((c, k) => { const u = (((t - t0) * 0.5 + k / 14) % 1); const v0 = vis[k % 3].g.position; c.visible = t > t0 + 0.6; c.position.set(lerp(v0.x, 6.5, u), 2 + Math.sin(u * Math.PI) * 4.5, lerp(v0.z, 0, u)); c.rotation.x = t * 5; }); });

      /* 8 · loop: a green arrow around a gate, visitors leave and come back */
      const hLoop = grp(PL.loop); const gate8 = gateArch(hLoop, 0.8); gate8.position.set(0, 0, -4); const loopArrow = grp(hLoop, 0, 5, 3);
      { const tor = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.45, 6, 28, 4.8), M(P.green)); tor.castShadow = true; loopArrow.add(tor); const head = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.9, 8), M(P.green)); head.position.set(4.6, 0, 0); head.rotation.z = -Math.PI / 2; loopArrow.add(head); }
      const lv = [0, 1, 2, 3].map((i) => person(hLoop, [P.pink, P.blue, P.orange, P.gold][i])); ANCH.loop = () => V(0, 11, 3); wrapAnch(["loop"], PL.loop);
      upd((t) => { showHero("loop", hLoop, t); loopArrow.rotation.z = -t * 0.9; lv.forEach((v, i) => { const u = (t * 0.22 + i * 0.25) % 1; v.g.position.set(Math.sin(u * 6.283) * 8, 0, 4 + Math.cos(u * 6.283) * 4); v.g.rotation.y = -u * 6.283 + Math.PI; walk(v, t + i, 7); }); });

      /* rides (coaster + crane). One builder, three instances: building/running, night, finale */
      const curve = new THREE.CatmullRomCurve3([V(-9, 2, -3), V(-4, 7, -5), V(1, 9.5, -2), V(7, 5, 2), V(9, 3, 7), V(3, 8, 8), V(-3, 4, 6), V(-8, 8, 3), V(-10, 3, 0)], true, "catmullrom", 0.4);
      function buildRide(place, withCrane) { const g = grp(place); const NSEG = 22, segs = []; const cmat = M(P.gold);
        for (let i = 0; i < NSEG; i++) { const pts = []; for (let j = 0; j <= 6; j++) pts.push(curve.getPoint(((i + j / 6) / NSEG) % 1)); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.24, 5, false), cmat); m.castShadow = true; g.add(m); segs.push(m);
          const mid = curve.getPoint(((i + 0.5) / NSEG) % 1); const sp = cyl(0.12, 0.16, mid.y, P.pink, 5); sp.position.set(mid.x, mid.y / 2, mid.z); g.add(sp); segs.push(sp); }
        const carts = []; for (let i = 0; i < 4; i++) { const c = grp(g); put(c, rb(1.4, 0.6, 1.1, P.pink, 0.1), 0, -0.1, 0); put(c, rb(1.2, 0.3, 0.9, P.white, 0.05), 0, 0.35, 0); [-0.3, 0.3].forEach((x) => put(c, sph(0.22, "#ffe2cc", 6), x, 0.75, 0)); carts.push(c); }
        let crane = null; if (withCrane) { crane = grp(g, -13, 0, -3); const mm = M(P.gold), mb = M("#fff3c9"); const sec = []; for (let k = 0; k < 8; k++) { const s_ = grp(crane, 0, k * 1.3, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => put(s_, rb(0.15, 1.3, 0.15, P.gold, 0.03, mm), sx * 0.55, 0, sz * 0.55)); [-1, 1].forEach((sz) => put(s_, rb(1.2, 0.09, 0.09, P.white, 0.02, mb), 0, 0.65, sz * 0.55)); sec.push(s_); }
          const top = grp(crane, 0, 10.4, 0); put(top, rb(1.6, 0.45, 1.6, P.gold, 0.06, mm)); put(top, rb(10, 0.22, 0.22, P.gold, 0.04, mm), 3.6, 0.55, 0); put(top, rb(2.6, 0.55, 0.8, P.gray, 0.05), -2.4, 0.2, 0); put(top, rb(0.8, 0.65, 0.65, P.white, 0.06), 0.3, 0.5, 0.8); crane.userData = { sec, top }; }
        const lit = []; for (let i = 0; i < 14; i++) { const l = sph(0.18, P.gold, 6, emis(P.gold, 0.4)); l.position.copy(curve.getPoint(i / 14)).add(V(0, 0.6, 0)); g.add(l); lit.push(l); }
        return { g, segs, carts, crane, lit }; }
      function updRide(R, t, mode, tb) { const building = mode === "build" && t < TT.ride_run; const night = mode === "night";
        if (R.crane) { R.crane.visible = building || mode === "build"; R.crane.userData.sec.forEach((s_, k) => { s_.visible = !building || t > tb + 0.12 * k; }); }
        R.segs.forEach((m, i) => { m.visible = !building || t > tb + 0.5 + Math.floor(i / 2) * 0.28; });
        const run = !building && !night; R.carts.forEach((c, i) => { c.visible = !building; const u = (((t * (run ? 0.07 : 0.0)) + i * 0.03) % 1 + 1) % 1; const p = curve.getPoint(u), q = curve.getPoint((u + 0.004) % 1); c.position.copy(p).add(V(0, 0.55, 0)); c.lookAt(q.x, q.y + 0.55, q.z); });
        R.lit.forEach((l, i) => { l.material.emissiveIntensity = night ? 0.1 : 0.4 + 0.7 * Math.sin(t * 5 + i); }); }
      const rideA = buildRide(PL.ride, true); ANCH.crane = () => V(-13, 13, -3); ANCH.coaster = () => V(0, 11.5, 0); wrapAnch(["crane", "coaster"], PL.ride);
      upd((t) => { showHero("ride", rideA.g, t); updRide(rideA, t, "build", HW.ride[0][0] + 0.2); });

      /* calendar: 12 month blocks (summer tall), a sun, then a cloud and rain. Two instances (L10-11 and the rain line) */
      function buildCalendar(place) { const g = grp(place); const MH = [0.9, 0.9, 1.1, 1.5, 2.4, 4.6, 5.8, 5.4, 2.8, 1.1, 0.9, 0.9]; const blocks = [];
        for (let i = 0; i < 12; i++) { const hot = i >= 5 && i <= 8; const b = rb(1.2, MH[i], 2.2, hot ? P.gold : P.blue, 0.08); put(g, b, -7.7 + i * 1.4, 0, 0); blocks.push({ b, hot, i }); if (i === 8) { b.scale.x = 0.5; b.position.x -= 0.3; } }
        put(g, rb(18, 0.4, 4, P.navy, 0.1), 0, -0.4, 0); const sunC = sph(1.3, P.gold, 14, emis(P.gold, 1.6)); sunC.position.set(1.8, 10, -1); g.add(sunC);
        const cloud = grp(g, 1.8, 9.5, 1); [[0, 0, 0, 2.6], [2.8, -0.3, 0.4, 2.0], [-2.9, -0.2, 0.2, 2.1], [1.0, 0.9, -0.4, 1.9]].forEach(([x, y, z, r]) => { const m = sph(r, "#6a63a8", 10); m.position.set(x, y, z); cloud.add(m); });
        const rain = []; for (let i = 0; i < 100; i++) { const r = rb(0.06, 0.9, 0.06, "#9fc0ff", 0.01); r.castShadow = false; r.userData = { x: -2 + rn() * 8, z: -2 + rn() * 4, ph: rn() * 11 }; g.add(r); rain.push(r); }
        return { g, blocks, sunC, cloud, rain }; }
      const calA = buildCalendar(PL.cal1); ANCH.cal_mid = () => V(0, 6.8, 0); ANCH.cal_summer = () => V(0.9, 7.6, 0); wrapAnch(["cal_mid", "cal_summer"], PL.cal1);
      upd((t) => { showHero("cal1", calA.g, t); const a0 = HW.cal1[0][0]; calA.blocks.forEach(({ b, hot, i }) => { b.scale.y = Math.max(eOutBack(prog(t, a0 - 0.7 + i * 0.07, 0.5)), 0.001); b.material = M(hot && t > TT.hot_on ? P.gold : hot ? "#c9a227" : P.blue); }); calA.sunC.visible = true; calA.cloud.visible = false; calA.rain.forEach((r) => { r.visible = false; }); });

      /* night: the ride stays lit but idle, fixed costs vs empty tills */
      const hNight = grp(PL.night); const rideN = buildRide(hNight, false); rideN.g.scale.setScalar(0.8); rideN.g.position.set(0, 0, -8); const regN = register(hNight, 2.0); regN.position.set(7, 0, 8); const costBar = rb(2.4, 6.2, 2.4, P.red, 0.15); put(hNight, costBar, -5.5, 0, 6); const revBar = rb(2.4, 1.1, 2.4, P.green, 0.15); put(hNight, revBar, -1.5, 0, 6);
      const moon = sph(1.6, "#fff3d6", 14, emis("#fff3d6", 1.2)); moon.position.set(-8, 12, -6); hNight.add(moon); ANCH.night_cost = () => V(-5.5, 7.4, 6); ANCH.night_reg = () => V(7, 4.2, 8); wrapAnch(["night_cost", "night_reg"], PL.night);
      upd((t) => { showHero("night", hNight, t); updRide(rideN, t, "night", 0); const a0 = HW.night[0][0]; costBar.scale.y = Math.max(0.001, popS(t, a0 + 0.4, 0.8)); revBar.scale.y = Math.max(0.001, popS(t, a0 + 1.2, 0.6)); });

      /* rain on the calendar (second instance) */
      const calB = buildCalendar(PL.cal2);
      upd((t) => { showHero("cal2", calB.g, t); const a0 = HW.cal2[0][0]; const rainOn = t >= TT.rain_on; calB.blocks.forEach(({ b, hot, i }) => { b.scale.y = Math.max(1, 0.001); b.material = M(hot ? (rainOn ? "#8f93b8" : P.gold) : P.blue); });
        calB.sunC.visible = !rainOn; calB.cloud.visible = rainOn; calB.rain.forEach((r) => { r.visible = rainOn; if (rainOn) r.position.set(r.userData.x, 9.5 - (((t - TT.rain_on) * 10 + r.userData.ph) % 9.5), r.userData.z); }); });

      /* balance: fewer visitors on the left, a bigger coin stack on the right */
      const hBal = grp(PL.balance); put(hBal, rb(1.2, 7.5, 1.2, P.gray, 0.1), 0, 0, 0); put(hBal, rb(5, 0.5, 3, P.navy, 0.1), 0, -0.3, 0); const beam = grp(hBal, 0, 7.6, 0); put(beam, rb(13, 0.4, 0.5, P.violet, 0.1), 0, -0.2, 0);
      const panL = grp(beam, -6, 0, 0), panR = grp(beam, 6, 0, 0); [panL, panR].forEach((p) => { put(p, rb(0.1, 3.6, 0.1, P.gray, 0.02), 0, -3.6, 0); put(p, rb(3.6, 0.25, 3.0, P.cream, 0.08), 0, -3.8, 0); });
      const balVis = [person(panL, P.pink), person(panL, P.blue)]; balVis[0].g.position.set(-0.6, -3.65, 0); balVis[1].g.position.set(0.7, -3.65, 0); balVis.forEach((v) => v.g.scale.setScalar(0.8));
      const balCoins = []; for (let k = 0; k < 10; k++) { const c = coinM(0.9); c.position.set(0, -3.6 + k * 0.17, 0); panR.add(c); balCoins.push(c); }
      upd((t) => { showHero("balance", hBal, t); const tilt = -0.22 * eOutBack(prog(t, TT.tilt, 1.0)); beam.rotation.z = tilt; panL.rotation.z = -tilt; panR.rotation.z = -tilt; balCoins.forEach((c, k) => { c.visible = t > TT.tilt - 0.8 + k * 0.1; }); });

      /* finale: the ride is crossed out, then a whole day (sun arc + ticket), then the crowd */
      const hFinal = grp(PL.final); const rideF = buildRide(hFinal, false); rideF.g.position.set(0, 0, -6);
      const crossA = rb(0.45, 11, 0.45, P.red, 0.1), crossB = rb(0.45, 11, 0.45, P.red, 0.1); put(hFinal, crossA, 0, 0, 3).rotation.z = 0.7; put(hFinal, crossB, 0, 0, 3).rotation.z = -0.7;
      const sunF = sph(1.8, P.gold, 14, emis(P.gold, 1.6)); hFinal.add(sunF); const tkF = ticketMesh(hFinal, 0.5); tkF.position.set(0, 12.5, -2);
      const crowd = [0, 1, 2, 3, 4, 5].map((i) => person(hFinal, [P.pink, P.blue, P.orange, P.gold, P.green, P.violet][i]));
      upd((t) => { showHero("final", hFinal, t); updRide(rideF, t, "run", 0); const s1 = TT.cross_on, s2 = TT.day_on, s3 = TT.crowd_on; const cr = t >= s1 && t < s2; crossA.visible = crossB.visible = cr; crossA.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, s1, 0.3) : 1); crossB.scale.copy(crossA.scale);
        const u = clamp((t - s2) / (s3 - s2)); sunF.position.set(lerp(-12, 12, u), 4 + Math.sin(u * Math.PI) * 11, -8); sunF.visible = t >= s2 - 0.05; tkF.visible = t >= s2 + 0.2; tkF.rotation.y = t * 1.2;
        crowd.forEach((v, i) => { const k = clamp((t - s3) / 2.4); v.g.position.set(-10 + i * 4, 0, lerp(14, 6, k) + (i % 2) * 1.2); v.g.rotation.y = Math.PI; v.g.visible = t >= s3 - 0.05; walk(v, t * 1.1 + i, 7); }); });
