      /* =====================================================================
         WORLD v2 : one clean hero subject per idea on a night stage (reference style)
         ===================================================================== */
      const rn = rng(7);
      const HW = B.heroes;
      const winOn = (name, t, pad = 0.0) => (HW[name] || []).some(([a, b]) => t >= a - pad && t < b + 0.3);
      function heroShow(name, obj, t, d = 0.5) { let s = 0; for (const [a, b] of HW[name] || []) { if (t < a - 0.001 || t > b + 0.3) continue; s = Math.max(s, 0.55 + 0.45 * popS(t, a, Math.min(d, 0.3))); } obj.visible = s > 0.002; obj.scale.setScalar(Math.max(s, 0.0001)); return s; }
      const heroAny = (names, obj, t) => { let s = 0; names.forEach((n) => { for (const [a, b] of HW[n] || []) { if (t < a - 0.001 || t > b + 0.3) continue; s = Math.max(s, 0.55 + 0.45 * popS(t, a, 0.28)); } }); obj.visible = s > 0.002; obj.scale.setScalar(Math.max(s, 0.0001)); return s; };

      /* stage: radial-lit disc, glowing ring, bokeh lights, dark ride silhouettes far behind */
      const gcv = document.createElement("canvas"); gcv.width = gcv.height = 1024; { const c = gcv.getContext("2d"); const g = c.createRadialGradient(512, 512, 40, 512, 512, 512); g.addColorStop(0, "#3d2199"); g.addColorStop(0.45, "#241060"); g.addColorStop(1, "#120833"); c.fillStyle = g; c.fillRect(0, 0, 1024, 1024);
        c.strokeStyle = "rgba(160,140,255,0.13)"; c.lineWidth = 3; for (let r = 80; r < 512; r += 70) { c.beginPath(); c.arc(512, 512, r, 0, 7); c.stroke(); } for (let a = 0; a < 24; a++) { c.beginPath(); c.moveTo(512, 512); c.lineTo(512 + Math.cos(a / 24 * 6.283) * 512, 512 + Math.sin(a / 24 * 6.283) * 512); c.stroke(); } }
      const gtex = new THREE.CanvasTexture(gcv); gtex.colorSpace = THREE.SRGBColorSpace;
      const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ map: gtex, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
      const ringGlow = new THREE.Mesh(new THREE.TorusGeometry(12.5, 0.12, 6, 72), emis("#2fc4ff", 1.1)); ringGlow.rotation.x = Math.PI / 2; ringGlow.position.y = 0.05; scene.add(ringGlow);
      const bok = []; for (let i = 0; i < 46; i++) { const a = rn() * 6.283, r = 38 + rn() * 14; const m = sph(0.28 + rn() * 0.3, [P.gold, P.pink, P.blue][i % 3], 6, emis([P.gold, P.pink, P.blue][i % 3], 1.2)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -Math.abs(Math.sin(a)) * r - 8); m.castShadow = false; scene.add(m); bok.push(m); }
      const sil = M("#1d0f52", { roughness: 1 });
      { const fw = new THREE.Mesh(new THREE.TorusGeometry(11, 0.3, 6, 40), sil); fw.position.set(-26, 12, -46); scene.add(fw); const fw2 = fw.clone(); fw2.scale.setScalar(0.7); fw2.position.set(30, 9, -52); scene.add(fw2);
        const arc = new THREE.Mesh(new THREE.TorusGeometry(9, 0.35, 6, 30, Math.PI), sil); arc.position.set(6, 0, -50); scene.add(arc); const arc2 = arc.clone(); arc2.position.set(18, 0, -54); arc2.scale.set(1.2, 1.5, 1); scene.add(arc2);
        [-12, 0, 40].forEach((x, i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(6 + i, 10 + i * 2, 8), sil); c.position.set(x, 5, -55 - i * 4); scene.add(c); }); }
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.7 + 0.6 * Math.sin(t * 2 + i); }); ringGlow.rotation.z = t * 0.2; });

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

      /* 1 · ticket + entrance gate */
      const hTicket = grp(scene); const gate1 = gateArch(hTicket, 1); gate1.position.set(0, 0, -9); const tk = ticketMesh(hTicket, 1); tk.position.set(0, 5.4, 0);
      ANCH.gate = () => V(0, 10.5, -9); ANCH.ticket = () => V(0, 5.4, 0);
      upd((t) => { heroShow("ticket", hTicket, t); tk.rotation.y = Math.sin(t * 1.4) * 0.6; tk.position.y = 5.4 + Math.sin(t * 2) * 0.25; });

      /* 2 · pie chart 55 / 45 */
      const hPie = grp(scene, 0, 0, 0); const pie = grp(hPie, 0, 0.1, 0); const slices = [];
      [[0.55, P.gold], [0.45, P.blue]].reduce((ang, [f, col], i) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.6, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.8; pie.add(m); slices.push({ m, mid: ang + len / 2 }); return ang + len; }, 0.4);
      put(pie, cyl(4.9, 5.0, 0.3, P.cream, 40), 0, -0.05, 0); const pt = ticketMesh(slices[0].m, 0.35); pt.position.set(Math.sin(slices[0].mid) * 2.6, 1.9, Math.cos(slices[0].mid) * 2.6); pt.rotation.x = -Math.PI / 2 + 0.2;
      const tmpV = new THREE.Vector3();
      ANCH.pie_gold = () => { tmpV.set(Math.sin(slices[0].mid) * 3.3, 2.2, Math.cos(slices[0].mid) * 3.3); return pie.localToWorld(tmpV.clone()); }; ANCH.pie_cyan = () => { tmpV.set(Math.sin(slices[1].mid) * 3.3, 2.2, Math.cos(slices[1].mid) * 3.3); return pie.localToWorld(tmpV.clone()); };
      upd((t) => { const s = heroShow("pie", hPie, t); pie.rotation.y = t * 0.25; const out = 1.1 * eOutBack(prog(t, HW.pie[0][0] + 1.6, 0.7)); slices[0].m.position.set(Math.sin(slices[0].mid) * out, 0.8, Math.cos(slices[0].mid) * out); });

      /* 3 · four items on a turntable (one at a time) */
      const pedestal = (p) => { const g = grp(p); put(g, cyl(3.0, 3.2, 0.5, P.violet, 24), 0, 0.25, 0); const r = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.07, 6, 40), emis(P.pink, 1.2)); r.rotation.x = Math.PI / 2; r.position.y = 0.52; g.add(r); return g; };
      const items = { burger: burger, cup: cup, teddy: teddy, camera: camera3 }; const itemG = {};
      Object.entries(items).forEach(([k, fn]) => { const g = grp(scene); pedestal(g); const o = fn(g, k === "burger" ? 1.5 : k === "cup" ? 1.15 : k === "teddy" ? 0.95 : 1.1); o.position.y = 0.5; itemG[k] = { g, o }; });
      ANCH.item = () => V(0, 5.6, 0);
      upd((t) => { Object.entries(itemG).forEach(([k, { g, o }]) => { heroShow("item_" + k, g, t, 0.35); o.rotation.y = t * 1.5; }); });

      /* 4 · coin stack grows (the margin) */
      const hCoins = grp(scene); const stack = []; for (let k = 0; k < 16; k++) { const c = coinM(1.5); c.position.y = 0.1 + k * 0.17; c.rotation.y = k * 0.5; hCoins.add(c); stack.push(c); }
      const arrow = grp(hCoins, 5.5, 0, 0); put(arrow, rb(1.2, 4.5, 1.2, P.green, 0.12), 0, 0, 0); const ah = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.2, 4), M(P.green)); ah.position.y = 5.6; ah.rotation.y = Math.PI / 4; ah.castShadow = true; arrow.add(ah);
      ANCH.coins = () => V(0, 4.6, 0);
      upd((t) => { heroShow("coins", hCoins, t, 0.3); stack.forEach((c, k) => { const p0 = prog(t, (HW.coins[0][0]) + 0.1 + k * 0.1, 0.4); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 5; }); arrow.position.y = Math.sin(t * 3) * 0.3; });

      /* 5 · teddy bear + price (panel p2 carries the numbers) */
      const hTeddy = grp(scene); pedestal(hTeddy); const bigTeddy = teddy(hTeddy, 1.4); bigTeddy.position.y = 0.5; ANCH.teddy = () => V(0, 7.6, 0);
      upd((t) => { heroShow("teddy", hTeddy, t); bigTeddy.rotation.y = Math.sin(t * 1.2) * 0.6; });

      /* 6 · bar chart (billet / restauration / boutiques) */
      const hBars = grp(scene); const barDefs = [[-4.2, 5.7, P.gold, "ticket"], [0, 2.1, P.blue, "burger"], [4.2, 0.9, P.green, "teddy"]]; const bars = [];
      barDefs.forEach(([x, h, col, ic], i) => { const g = grp(hBars, x, 0, 0); const b = rb(2.7, h, 2.7, col, 0.15); g.add(b); const icon = ic === "ticket" ? ticketMesh(g, 0.32) : ic === "burger" ? burger(g, 0.8) : teddy(g, 0.42); icon.position.y = h + (ic === "ticket" ? 1.2 : 0.7); bars.push({ g, b, h, icon }); });
      put(hBars, rb(13, 0.3, 4, P.navy, 0.08), 0, -0.3, 0); ANCH.bar_gold = () => V(-4.2, 8.4, 0); ANCH.bar_cyan = () => V(0, 4.9, 0); ANCH.bar_pink = () => V(4.2, 3.2, 0);
      upd((t) => { heroShow("bars", hBars, t, 0.3); bars.forEach(({ g, b, h, icon }, i) => { const p = eOutBack(prog(t, HW.bars[0][0] + 0.3 + i * 1.4, 0.7)); b.scale.y = Math.max(p, 0.001); icon.visible = p > 0.3; icon.rotation.y = t * 1.2; }); });

      /* 7 · a visitor walks in, coins flow to the register */
      const hVis = grp(scene); const reg7 = register(hVis, 2.6); reg7.position.set(6.5, 0, 0); reg7.rotation.y = -0.5; const vis = [person(hVis, P.pink), person(hVis, P.blue), person(hVis, P.orange)];
      const flow = []; for (let k = 0; k < 14; k++) { const c = coinM(0.4); c.visible = false; hVis.add(c); flow.push(c); }
      ANCH.visitor = () => V(vis[0].g.position.x, 3.4, vis[0].g.position.z); ANCH.register = () => V(6.5, 6, 0);
      upd((t) => { heroShow("visitor", hVis, t, 0.3); const t0 = HW.visitor[0][0];
        vis.forEach((v, i) => { const u = (((t - t0) * 0.16 + i * 0.33) % 1); v.g.position.set(lerp(-11, 1.5, u), 0, lerp(5, 0.5, u) + i * 1.2); v.g.rotation.y = Math.PI / 2 + 0.3; walk(v, t * 1.2 + i, 7); });
        flow.forEach((c, k) => { const u = (((t - t0) * 0.5 + k / 14) % 1); const v0 = vis[k % 3].g.position; c.visible = t > t0 + 0.6; c.position.set(lerp(v0.x, 6.5, u), 2 + Math.sin(u * Math.PI) * 4.5, lerp(v0.z, 0, u)); c.rotation.x = t * 5; }); });

      /* 8 · loop: green arrow around a gate, visitors leave and come back */
      const hLoop = grp(scene); const gate8 = gateArch(hLoop, 0.8); gate8.position.set(0, 0, -4); const loopArrow = grp(hLoop, 0, 5, 3);
      { const tor = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.45, 6, 28, 4.8), M(P.green)); tor.castShadow = true; loopArrow.add(tor); const head = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.9, 8), M(P.green)); head.position.set(4.6, 0, 0); head.rotation.z = -Math.PI / 2; loopArrow.add(head); }
      const lv = [0, 1, 2, 3].map((i) => person(hLoop, [P.pink, P.blue, P.orange, P.gold][i])); ANCH.loop = () => V(0, 11, 3);
      upd((t) => { heroShow("loop", hLoop, t, 0.4); loopArrow.rotation.z = -t * 0.9; lv.forEach((v, i) => { const u = (t * 0.22 + i * 0.25) % 1; v.g.position.set(Math.sin(u * 6.283) * 8, 0, 4 + Math.cos(u * 6.283) * 4); v.g.rotation.y = -u * 6.283 + Math.PI; walk(v, t + i, 7); }); });

      /* 9 · the ride (built during the Futuroscope sentence, then running); crane callback */
      const curve = new THREE.CatmullRomCurve3([V(-9, 2, -3), V(-4, 7, -5), V(1, 9.5, -2), V(7, 5, 2), V(9, 3, 7), V(3, 8, 8), V(-3, 4, 6), V(-8, 8, 3), V(-10, 3, 0)], true, "catmullrom", 0.4);
      const hRide = grp(scene); const NSEG = 22, trackSegs = []; const cmat = M(P.gold);
      for (let i = 0; i < NSEG; i++) { const pts = []; for (let j = 0; j <= 6; j++) pts.push(curve.getPoint(((i + j / 6) / NSEG) % 1)); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.24, 5, false), cmat); m.castShadow = true; hRide.add(m); trackSegs.push(m);
        const mid = curve.getPoint(((i + 0.5) / NSEG) % 1); const sp = cyl(0.12, 0.16, mid.y, P.pink, 5); sp.position.set(mid.x, mid.y / 2, mid.z); hRide.add(sp); trackSegs.push(sp); }
      const carts = []; for (let i = 0; i < 4; i++) { const c = grp(hRide); put(c, rb(1.4, 0.6, 1.1, P.pink, 0.1), 0, -0.1, 0); put(c, rb(1.2, 0.3, 0.9, P.white, 0.05), 0, 0.35, 0); [-0.3, 0.3].forEach((x) => put(c, sph(0.22, "#ffe2cc", 6), x, 0.75, 0)); carts.push(c); }
      const crane = (() => { const g = grp(hRide, -13, 0, -3); const mm = M(P.gold), mb = M("#fff3c9"); const sec = []; for (let k = 0; k < 8; k++) { const s_ = grp(g, 0, k * 1.3, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => put(s_, rb(0.15, 1.3, 0.15, P.gold, 0.03, mm), sx * 0.55, 0, sz * 0.55)); [-1, 1].forEach((sz) => put(s_, rb(1.2, 0.09, 0.09, P.white, 0.02, mb), 0, 0.65, sz * 0.55)); sec.push(s_); }
        const top = grp(g, 0, 10.4, 0); put(top, rb(1.6, 0.45, 1.6, P.gold, 0.06, mm)); put(top, rb(10, 0.22, 0.22, P.gold, 0.04, mm), 3.6, 0.55, 0); put(top, rb(2.6, 0.55, 0.8, P.gray, 0.05), -2.4, 0.2, 0); put(top, rb(0.8, 0.65, 0.65, P.white, 0.06), 0.3, 0.5, 0.8); g.userData = { sec, top }; return g; })();
      ANCH.crane = () => V(-13, 13, -3); ANCH.coaster = () => V(0, 11.5, 0);
      const carLit = []; for (let i = 0; i < 14; i++) { const l = sph(0.18, P.gold, 6, emis(P.gold, 0.4)); const p = curve.getPoint(i / 14); l.position.copy(p).add(V(0, 0.6, 0)); hRide.add(l); carLit.push(l); }
      upd((t) => { const names = ["coaster_build", "coaster", "night", "final"]; const sc = heroAny(names, hRide, t); const tb = HW.coaster_build[0][0]; const building = t < (HW.coaster[0][0]); const night = winOn("night", t);
        crane.userData.sec.forEach((s_, k) => { s_.visible = !building || t > tb + 0.12 * k; }); crane.visible = building || winOn("coaster", t) ? true : false;
        trackSegs.forEach((m, i) => { m.visible = !building || t > tb + 0.5 + Math.floor(i / 2) * 0.28; });
        const run = !building && !night; carts.forEach((c, i) => { c.visible = !building; const u = (((t * (run ? 0.07 : 0.0)) + i * 0.03) % 1 + 1) % 1; const p = curve.getPoint(u), q = curve.getPoint((u + 0.004) % 1); c.position.copy(p).add(V(0, 0.55, 0)); c.lookAt(q.x, q.y + 0.55, q.z); });
        carLit.forEach((l, i) => { l.material.emissiveIntensity = (night ? 0.1 : 0.4 + 0.7 * Math.sin(t * 5 + i)); }); });

      /* 10 · calendar: 12 month blocks, summer tall; sun, then cloud + rain */
      const hCal = grp(scene); const MH = [0.9, 0.9, 1.1, 1.5, 2.4, 4.6, 5.8, 5.4, 2.8, 1.1, 0.9, 0.9]; const calB = [];
      for (let i = 0; i < 12; i++) { const hot = i >= 5 && i <= 8; const b = rb(1.2, MH[i], 2.2, hot ? P.gold : P.blue, 0.08); put(hCal, b, -7.7 + i * 1.4, 0, 0); calB.push({ b, hot }); if (i === 8) { b.scale.x = 0.5; b.position.x -= 0.3; } }
      put(hCal, rb(18, 0.4, 4, P.navy, 0.1), 0, -0.4, 0); const sunC = sph(1.3, P.gold, 14, emis(P.gold, 1.6)); sunC.position.set(1.8, 10, -1); hCal.add(sunC);
      const cloud = grp(hCal, 1.8, 9.5, 1); [[0, 0, 0, 2.6], [2.8, -0.3, 0.4, 2.0], [-2.9, -0.2, 0.2, 2.1], [1.0, 0.9, -0.4, 1.9]].forEach(([x, y, z, r]) => { const m = sph(r, "#6a63a8", 10); m.position.set(x, y, z); cloud.add(m); });
      const rain = []; for (let i = 0; i < 100; i++) { const r = rb(0.06, 0.9, 0.06, "#9fc0ff", 0.01); r.castShadow = false; r.userData = { x: -2 + rn() * 8, z: -2 + rn() * 4, ph: rn() * 11 }; hCal.add(r); rain.push(r); }
      ANCH.cal_mid = () => V(0, 6.8, 0); ANCH.cal_summer = () => V(0.9, 7.6, 0);
      upd((t) => { heroShow("calendar", hCal, t, 0.4); const rainOn = t > T.rain - 0.1 && winOn("calendar", t);
        calB.forEach(({ b, hot }, i) => { const p = eOutBack(prog(t, HW.calendar[0][0] + 0.2 + i * 0.07, 0.5)); b.scale.y = Math.max(p, 0.001); if (hot) b.material = M(rainOn ? "#8f93b8" : P.gold); });
        sunC.visible = !rainOn; cloud.visible = rainOn; rain.forEach((r) => { r.visible = rainOn; if (rainOn) r.position.set(r.userData.x, 9.5 - (((t - T.rain) * 10 + r.userData.ph) % 9.5), r.userData.z); }); });

      /* 11 · night: costs stay, tills stay empty */
      const hNight = grp(scene); const regN = register(hNight, 3.0); regN.position.set(4.5, 0, 0); const costBar = rb(2.4, 6.2, 2.4, P.red, 0.15); put(hNight, costBar, -5.5, 0, 0); const revBar = rb(2.4, 1.1, 2.4, P.green, 0.15); put(hNight, revBar, -1.5, 0, 0);
      put(hNight, rb(18, 0.3, 5, P.navy, 0.08), 0, -0.3, 0); ANCH.night_cost = () => V(-5.5, 7.4, 0); ANCH.night_reg = () => V(4.5, 5.4, 0);
      const moon = sph(1.6, "#fff3d6", 14, emis("#fff3d6", 1.2)); moon.position.set(-8, 12, -6); hNight.add(moon);
      upd((t) => { heroShow("night", hNight, t, 0.4); costBar.scale.y = Math.max(0.001, popS(t, HW.night[0][0] + 0.4, 0.8)); revBar.scale.y = Math.max(0.001, popS(t, HW.night[0][0] + 1.2, 0.6)); });

      /* 12 · balance: fewer visitors on the left, a bigger coin stack on the right */
      const hBal = grp(scene); put(hBal, rb(1.2, 7.5, 1.2, P.gray, 0.1), 0, 0, 0); put(hBal, rb(5, 0.5, 3, P.navy, 0.1), 0, -0.3, 0); const beam = grp(hBal, 0, 7.6, 0); put(beam, rb(13, 0.4, 0.5, P.violet, 0.1), 0, -0.2, 0);
      const panL = grp(beam, -6, 0, 0), panR = grp(beam, 6, 0, 0); [panL, panR].forEach((p) => { put(p, rb(0.1, 3.6, 0.1, P.gray, 0.02), 0, -3.6, 0); put(p, rb(3.6, 0.25, 3.0, P.cream, 0.08), 0, -3.8, 0); });
      const balVis = [person(panL, P.pink), person(panL, P.blue)]; balVis[0].g.position.set(-0.6, -3.65, 0); balVis[1].g.position.set(0.7, -3.65, 0); balVis.forEach((v) => v.g.scale.setScalar(0.8));
      const balCoins = []; for (let k = 0; k < 10; k++) { const c = coinM(0.9); c.position.set(0, -3.6 + k * 0.17, 0); panR.add(c); balCoins.push(c); }
      upd((t) => { heroShow("balance", hBal, t, 0.4); const tilt = -0.22 * eOutBack(prog(t, HW.balance[0][0] + 2.2, 1.0)); beam.rotation.z = tilt; panL.rotation.z = -tilt; panR.rotation.z = -tilt; balCoins.forEach((c, k) => { c.visible = t > HW.balance[0][0] + 1.4 + k * 0.1; }); });

      /* 13 · finale: crossed-out ride, then a whole day (sun arc + ticket), then the brand */
      const hFinal = grp(scene); const crossA = rb(0.6, 14, 0.6, P.red, 0.1), crossB = rb(0.6, 14, 0.6, P.red, 0.1); put(hFinal, crossA, 0, 0, 5).rotation.z = 0.78; put(hFinal, crossB, 0, 0, 5).rotation.z = -0.78; crossA.position.set(0, 0, 6); crossB.position.set(0, 0, 6);
      const dayArc = grp(hFinal); const sunF = sph(1.8, P.gold, 14, emis(P.gold, 1.6)); dayArc.add(sunF); const tkF = ticketMesh(dayArc, 0.5); tkF.position.set(0, 12.5, 2);
      const crowd = [0, 1, 2, 3, 4, 5].map((i) => person(hFinal, [P.pink, P.blue, P.orange, P.gold, P.green, P.violet][i]));
      upd((t) => { heroShow("final", hFinal, t, 0.5); const c1 = t < T.s18; crossA.visible = crossB.visible = c1 && t > T.finale + 0.3; const u = clamp((t - T.s18) / (T.s19 - T.s18)); sunF.position.set(lerp(-12, 12, u), 4 + Math.sin(u * Math.PI) * 11, -6); sunF.visible = t >= T.s18 - 0.1; tkF.visible = t >= T.s18 + 0.3; tkF.rotation.y = t * 1.2;
        crowd.forEach((v, i) => { const k = clamp((t - T.s19) / 2.2); v.g.position.set(-10 + i * 4 - (1 - k) * 0, 0, lerp(12, 4, k) + (i % 2) * 1.2); v.g.rotation.y = Math.PI; v.g.visible = t >= T.s19 - 0.1; walk(v, t * 1.1 + i, 7); }); });
