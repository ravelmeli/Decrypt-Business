      /* =====================================================================
         WORLD : the theme park (perspective camera, low-poly, flat colours)
         ===================================================================== */
      const rn = rng(11);
      /* ground with a painted grid, a main street and plazas */
      const gcv = document.createElement("canvas"); gcv.width = gcv.height = 2048; { const c = gcv.getContext("2d"); c.fillStyle = "#101748"; c.fillRect(0, 0, 2048, 2048);
        const px = 2048 / 140; c.strokeStyle = "rgba(120,150,255,0.10)"; c.lineWidth = 2; for (let i = 0; i <= 140; i += 4) { c.beginPath(); c.moveTo(i * px, 0); c.lineTo(i * px, 2048); c.stroke(); c.beginPath(); c.moveTo(0, i * px); c.lineTo(2048, i * px); c.stroke(); }
        c.fillStyle = "#1a2368"; c.fillRect((70 - 5) * px, (70 - 8) * px, 10 * px, 52 * px);   /* main street x -5..5, z -8..44 */
        c.fillStyle = "#1f2a78"; c.beginPath(); c.arc(70 * px, (70 - 3) * px, 9 * px, 0, 7); c.fill();
        c.fillStyle = "#162064"; c.fillRect((70 - 20) * px, (70 - 28) * px, 40 * px, 14 * px); /* ride plaza */
        c.strokeStyle = "rgba(255,201,60,0.35)"; c.setLineDash([22, 22]); c.lineWidth = 4; c.beginPath(); c.moveTo(70 * px, (70 - 8) * px); c.lineTo(70 * px, (70 + 44) * px); c.stroke(); }
      const gtex = new THREE.CanvasTexture(gcv); gtex.colorSpace = THREE.SRGBColorSpace; gtex.anisotropy = 8;
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ map: gtex, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 0); ground.receiveShadow = true; scene.add(ground);
      const calGround = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: "#121a52", roughness: 0.95 })); calGround.rotation.x = -Math.PI / 2; calGround.position.set(60, 0.02, 0); calGround.receiveShadow = true; scene.add(calGround);

      /* --- builders --- */
      function person(p, hex, hat = false) {
        const g = grp(p, 0, 0, 0);
        const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.6, 4, 8), M(hex)); b.position.y = 0.95; b.castShadow = true; g.add(b);
        const h = sph(0.24, "#ffe2cc", 10); h.position.y = 1.65; g.add(h);
        if (hat) { const ht = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(P.gold)); ht.position.y = 1.72; g.add(ht); }
        const arm = (sx) => { const q = grp(g, sx * 0.36, 1.35, 0); put(q, rb(0.12, 0.5, 0.12, hex, 0.04), 0, -0.5, 0); return q; };
        const leg = (sx) => put(g, rb(0.15, 0.6, 0.15, P.navy, 0.05), sx * 0.13, 0, 0);
        return { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) };
      }
      const walk = (w, t, sp = 8) => { w.legL.rotation.x = Math.sin(t * sp) * 0.6; w.legR.rotation.x = -Math.sin(t * sp) * 0.6; w.armL.rotation.x = -Math.sin(t * sp) * 0.5; w.armR.rotation.x = Math.sin(t * sp) * 0.5; };
      function burger(p, x, y, z, s) {
        const g = grp(p, x, y, z); g.scale.setScalar(s);
        put(g, cyl(1.0, 1.0, 0.3, "#f3c27c", 14), 0, 0.15, 0); put(g, cyl(1.1, 1.1, 0.1, P.green, 14), 0, 0.35, 0); put(g, cyl(1.0, 1.0, 0.12, P.red, 14), 0, 0.46, 0); put(g, cyl(1.04, 1.04, 0.3, "#8a5a44", 14), 0, 0.72, 0);
        const top = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M("#f3c27c")); top.scale.y = 0.75; top.position.y = 0.87; top.castShadow = true; g.add(top); return g;
      }
      function lights(p, n, r, y, hex = P.gold) { const out = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const b = sph(0.1, hex, 6, emis(hex, 1.2)); b.position.set(Math.cos(a) * r, y + Math.sin(a) * r * 0, Math.sin(a) * r); p.add(b); out.push(b); } return out; }
      function stall(x, z, col, kind, rot) {
        const g = grp(scene, x, 0, z); g.rotation.y = rot;
        put(g, rb(3.4, 1.8, 2.6, P.cream, 0.06)); put(g, rb(3.7, 0.22, 2.9, col, 0.05), 0, 1.8, 0);
        for (let i = 0; i < 6; i++) { const a = put(g, rb(0.62, 0.1, 1.3, i % 2 ? P.white : col, 0.03), -1.55 + i * 0.62, 2.3, 1.7); a.rotation.x = 0.45; }
        put(g, rb(3.0, 0.9, 0.12, P.navy, 0.03), 0, 0.5, 1.32);
        const icon = grp(g, 0, 2.15, -0.2);
        if (kind === "burger") burger(icon, 0, 0.1, 0, 0.8);
        if (kind === "drink") { put(icon, cyl(0.55, 0.4, 1.3, P.white, 12), 0, 0.65, 0); put(icon, cyl(0.58, 0.58, 0.3, P.red, 12), 0, 1.4, 0); put(icon, rb(0.12, 0.9, 0.12, P.red, 0.03), 0.15, 1.6, 0); }
        if (kind === "gift") { const b = sph(0.7, P.brown, 10); b.position.y = 0.7; icon.add(b); const h = sph(0.5, P.brown, 10); h.position.y = 1.6; icon.add(h); [-0.38, 0.38].forEach((sx) => { const e = sph(0.2, P.brown, 8); e.position.set(sx, 2.0, 0); icon.add(e); }); put(icon, rb(0.6, 0.18, 0.1, P.red, 0.03), 0, 1.1, 0.5); }
        if (kind === "photo") { put(icon, rb(1.5, 0.95, 0.9, P.navy, 0.08), 0, 0.2, 0); const l = cyl(0.4, 0.4, 0.5, P.gray, 14); l.rotation.x = Math.PI / 2; l.position.set(0, 0.7, 0.6); icon.add(l); put(icon, rb(0.4, 0.2, 0.3, P.gold, 0.04), -0.5, 1.15, 0); }
        g.userData.icon = icon; return g;
      }
      function register(p, x, z, s) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(2.6, 1.0, 1.8, P.blue, 0.1)); const scr = put(g, rb(1.7, 0.8, 0.14, P.navy, 0.05), 0, 1.45, -0.35); scr.rotation.x = -0.4; put(scr, rb(1.4, 0.5, 0.05, P.green, 0.03), 0, 0.15, 0.08);
        put(g, rb(2.2, 0.22, 1.4, P.white, 0.06), 0, 1.0, 0.1); put(g, rb(1.2, 0.14, 0.6, P.gold, 0.04), 0, 1.22, 0.55); return g; }
      function coinMesh(r = 0.4) { const c = cyl(r, r, 0.12, P.gold, 14); return c; }

      /* gate + ticket booth + queue */
      const gate = grp(scene, 0, 0, 14);
      [-5.6, 5.6].forEach((x) => put(gate, rb(1.3, 6.4, 1.3, P.gold, 0.08), x, 0, 0)); put(gate, rb(13, 1.6, 1.5, P.gold, 0.08), 0, 6.4, 0); put(gate, rb(10.4, 1.1, 0.3, P.navy, 0.06), 0, 6.65, 0.85);
      for (let i = 0; i < 9; i++) put(gate, rb(0.5, 0.3, 0.12, i % 2 ? P.red : P.white, 0.02), -4 + i * 1, 8.2, 0.8);
      const booth = grp(gate, -9.5, 0, 0.5); put(booth, rb(3.0, 3.4, 2.4, P.cream, 0.08)); put(booth, rb(3.4, 0.3, 2.8, P.red, 0.06), 0, 3.4, 0); put(booth, rb(1.8, 1.1, 0.1, P.blue, 0.04), 0, 1.5, 1.22);
      const turns = [-3, -1, 1, 3].map((x) => { const t_ = grp(gate, x, 0, 0); put(t_, rb(0.22, 1.2, 0.22, P.gray, 0.04), 0, 0, 0); put(t_, rb(1.2, 0.12, 0.12, P.red, 0.03), 0.5, 1.0, 0); return t_; });
      for (let i = -5; i <= 5; i++) { if (Math.abs(i) < 2) continue; put(gate, rb(0.14, 1.3, 0.14, P.gray, 0.03), i * 2.2 + (i > 0 ? 2.4 : -2.4), 0, 0); }
      ANCH.gate = () => V(0, 7.4, 14);
      const ticket = grp(scene, 0, 3.4, 10.5); put(ticket, rb(3.6, 1.9, 0.18, P.gold, 0.06), 0, -0.95, 0);
      [-1.8, 1.8].forEach((x) => put(ticket, cyl(0.36, 0.36, 0.2, P.dark, 12), x, 0, 0)); for (let i = 0; i < 6; i++) put(ticket, rb(0.12, 0.18, 0.2, P.dark, 0.02), 0.9, -0.5 + i * 0.3 - 0.8, 0.0);
      put(ticket, rb(1.5, 0.22, 0.2, P.navy, 0.04), -0.5, -0.7, 0); put(ticket, rb(1.1, 0.16, 0.2, P.navy, 0.04), -0.7, -1.1, 0); ANCH.ticket = () => V(0, 4.2, 10.5);
      const qP = []; for (let i = 0; i < 14; i++) { const q = person(scene, [P.red, P.blue, P.green, P.orange, P.gold, P.sky][i % 6]); q.g.rotation.y = Math.PI; qP.push(q); }
      upd((t) => { show(gate, t, 0.0, null, 0.7); show(ticket, t, T.ticket, T.stall_burger - 0.2, 0.5); ticket.rotation.y = Math.sin(t * 1.6) * 0.5; ticket.position.y = 3.4 + Math.sin(t * 2) * 0.15;
        qP.forEach((q, i) => { const ph = (t * 0.5 + i * 0.9) % 12.6; q.g.position.set((i % 3 - 1) * 1.8 + Math.sin(i) * 0.3, 0, 17 + ph); q.g.visible = t >= 0.2 + i * 0.05; walk(q, t * 0.6 + i, 6); }); });

      /* street stalls */
      const stalls = { burger: stall(-5.2, 7, P.red, "burger", Math.PI / 2), drink: stall(-5.2, 2, P.blue, "drink", Math.PI / 2), gift: stall(5.2, 7, P.gold, "gift", -Math.PI / 2), photo: stall(5.2, 2, P.green, "photo", -Math.PI / 2) };
      Object.entries(stalls).forEach(([k, g]) => { ANCH["stall_" + k] = () => V(g.position.x, 3.6, g.position.z); upd((t) => { show(g, t, T["stall_" + k] - 0.3, null, 0.5); g.userData.icon.rotation.y = t * 1.5; }); });
      for (let i = 0; i < 6; i++) { const z = 12 - i * 3.2; [-1, 1].forEach((sd) => { const l = grp(scene, sd * 8.6, 0, z); put(l, cyl(0.07, 0.09, 3.4, P.gray, 6), 0, 1.7, 0); put(l, sph(0.22, P.gold, 8, emis(P.gold, 1.0)), 0, 3.5, 0); }); }
      const trees = []; for (let i = 0; i < 18; i++) { const x = (i % 2 ? 1 : -1) * (12 + rn() * 12), z = 20 - rn() * 40; const g = grp(scene, x, 0, z); put(g, cyl(0.25, 0.3, 1.3, "#7a4b2a", 6), 0, 0.65, 0); const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 7), M("#1f7a58")); c1.position.y = 2.6; c1.castShadow = true; g.add(c1); const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 7), M("#2a9d6b")); c2.position.y = 3.9; c2.castShadow = true; g.add(c2); trees.push(g); }

      /* cash house : the margin */
      const cash = register(scene, 0, -3, 2.2); ANCH.cash = () => V(0, 4.4, -3);
      const coinsC = []; for (let k = 0; k < 10; k++) { const c = coinMesh(0.5); scene.add(c); coinsC.push(c); }
      upd((t) => { show(cash, t, T.cash - 0.2, null, 0.6); coinsC.forEach((c, k) => { const p0 = prog(t, T.cash + 0.2 + k * 0.1, 0.4); c.visible = p0 > 0 && t < T.cash + 2.6; c.position.set(5.5, 0.06 + k * 0.14 + (1 - bounce(p0)) * 4, -3); }); });

      /* teddy bear gift shop closeup helper (the gift stall icon) */
      ANCH.teddy = () => V(5.2, 3.7, 7);

      /* walkers + coins flowing to the cash house (gain per visitor) */
      const walkers = []; for (let i = 0; i < 12; i++) { const w_ = person(scene, [P.red, P.blue, P.green, P.orange, P.gold, P.sky][i % 6]); walkers.push(w_); }
      ANCH.walker0 = () => { const w_ = walkers[0].g.position; return V(w_.x, 2.6, w_.z); };
      const flowCoins = []; for (let k = 0; k < 16; k++) { const c = coinMesh(0.32); scene.add(c); flowCoins.push(c); }
      upd((t) => { walkers.forEach((w_, i) => { const u = ((t * 0.07 * (1 + (i % 3) * 0.2) + i * 0.083) % 1); const z = 18 - u * 26; const x = Math.sin(u * 6.28 + i) * 3.2; w_.g.position.set(x, 0, z); w_.g.rotation.y = Math.PI; w_.g.visible = t > 0.6; walk(w_, t + i, 7); });
        flowCoins.forEach((c, k) => { const on = t > T.flow && t < T.flow + 6.5; c.visible = on; if (!on) return; const u = (((t - T.flow) * 0.45 + k / 16) % 1); const w0 = walkers[k % 12].g.position; c.position.set(lerp(w0.x, 0, u), 1.5 + Math.sin(u * Math.PI) * 5, lerp(w0.z, -3, u)); c.rotation.set(t * 4, 0, 0); c.scale.setScalar(1 - 0.5 * u); }); });

      /* ride zone : coaster (built during the Futuroscope sentence), ferris wheel, carousel */
      const curve = new THREE.CatmullRomCurve3([V(-9, 2, -10), V(-4, 6.5, -9), V(1, 9, -12), V(6, 5, -15), V(9, 3, -20), V(4, 7.5, -24), V(-2, 4, -23), V(-8, 8, -19), V(-10, 3, -14)], true, "catmullrom", 0.4);
      const NSEG = 24, trackSegs = []; const cmat = M(P.gold);
      for (let i = 0; i < NSEG; i++) { const pts = []; for (let j = 0; j <= 6; j++) pts.push(curve.getPoint(((i + j / 6) / NSEG) % 1)); const cc = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(cc, 8, 0.22, 5, false), cmat); m.castShadow = true; scene.add(m); trackSegs.push(m);
        const mid = curve.getPoint(((i + 0.5) / NSEG) % 1); const sp = cyl(0.12, 0.16, mid.y, P.red, 5); sp.position.set(mid.x, mid.y / 2, mid.z); scene.add(sp); trackSegs.push(sp); }
      const carts = []; for (let i = 0; i < 4; i++) { const c = grp(scene); put(c, rb(1.3, 0.6, 1.0, P.red, 0.1), 0, -0.1, 0); put(c, rb(1.1, 0.3, 0.8, P.white, 0.05), 0, 0.35, 0); [-0.3, 0.3].forEach((x) => put(c, sph(0.2, "#ffe2cc", 6), x, 0.7, 0)); carts.push(c); }
      const crane = (() => { const g = grp(scene, -12, 0, -17); const mm = M(P.gold), mb = M("#fff3c9");
        const sec = []; for (let k = 0; k < 8; k++) { const s_ = grp(g, 0, k * 1.2, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => put(s_, rb(0.14, 1.2, 0.14, P.gold, 0.03, mm), sx * 0.5, 0, sz * 0.5)); [-1, 1].forEach((sz) => put(s_, rb(1.1, 0.08, 0.08, P.white, 0.02, mb), 0, 0.6, sz * 0.5)); sec.push(s_); }
        const top = grp(g, 0, 9.6, 0); put(top, rb(1.4, 0.4, 1.4, P.gold, 0.06, mm), 0, 0, 0); put(top, rb(9, 0.2, 0.2, P.gold, 0.04, mm), 3.2, 0.5, 0); put(top, rb(2.4, 0.5, 0.7, P.gray, 0.05), -2.2, 0.2, 0); put(top, rb(0.7, 0.6, 0.6, P.white, 0.06), 0.3, 0.45, 0.7);
        g.userData = { sec, top }; return g; })();
      ANCH.crane = () => V(-12, 11, -17); ANCH.coaster = () => V(1, 10.5, -12);
      const ferris = grp(scene, -15, 0, -6); { const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.14, 6, 28), M(P.gold)); ring.position.y = 6.2; ring.castShadow = true; ferris.add(ring);
        const wheel = grp(ferris, 0, 6.2, 0); const gon = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const sp = put(wheel, rb(10.4, 0.08, 0.08, P.white, 0.02), 0, 0, 0); sp.rotation.z = a; const gd = grp(wheel, Math.cos(a) * 5.2, Math.sin(a) * 5.2, 0); put(gd, rb(0.9, 0.8, 0.9, [P.red, P.blue, P.green, P.orange][i % 4], 0.08), 0, -0.9, 0); gon.push({ gd, a }); }
        [-1, 1].forEach((sd) => { const l = put(ferris, rb(0.3, 6.6, 0.3, P.blue, 0.05), 0, 0, sd * 0.9); l.rotation.z = 0.28; const l2 = put(ferris, rb(0.3, 6.6, 0.3, P.blue, 0.05), 0, 0, sd * 0.9); l2.rotation.z = -0.28; });
        ferris.userData = { wheel, gon, lights: lights(wheel, 24, 5.4, 0, P.gold) }; }
      ANCH.ferris = () => V(-15, 12, -6);
      const carousel = grp(scene, 15, 0, -6); { put(carousel, cyl(3.4, 3.6, 0.5, P.white, 20), 0, 0.25, 0); const spin = grp(carousel, 0, 0.5, 0); put(spin, cyl(0.3, 0.3, 3.6, P.gold, 8), 0, 1.8, 0); const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.6, 12), M(P.red)); roof.position.y = 4.4; roof.castShadow = true; carousel.add(roof);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const h = grp(spin, Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4); put(h, cyl(0.05, 0.05, 3.2, P.gold, 5), 0, 1.6, 0); put(h, rb(0.5, 0.7, 1.2, [P.white, P.orange, P.sky][i % 3], 0.1), 0, 0.9, 0); }
        carousel.userData = { spin, lights: lights(carousel, 16, 3.5, 3.6, P.gold) }; }
      upd((t) => {
        const tb = T.build, bt = clamp((t - tb) / 8.5); const rideOn = t > 0.3;
        crane.userData.sec.forEach((s_, k) => show(s_, t, tb + 0.15 * k, null, 0.4)); show(crane.userData.top, t, tb + 1.6, null, 0.5); crane.visible = t >= tb - 0.1;
        trackSegs.forEach((m, i) => { const idx = Math.floor(i / 2); const on = t > tb + 0.7 + idx * 0.22; m.visible = on; });
        const run = t > tb + 6.5;
        carts.forEach((c, i) => { c.visible = run; if (!run) return; const u = (((t - tb - 6.5) * 0.06 + i * 0.028) % 1 + 1) % 1; const p = curve.getPoint(u), q = curve.getPoint((u + 0.004) % 1); c.position.copy(p).add(V(0, 0.55, 0)); c.lookAt(q.x, q.y + 0.55, q.z); });
        ferris.userData.wheel.rotation.z = -t * 0.25; ferris.userData.gon.forEach(({ gd, a }) => { gd.position.set(Math.cos(a - t * 0.25) * 5.2, Math.sin(a - t * 0.25) * 5.2, 0); });
        carousel.userData.spin.rotation.y = t * 0.9; carousel.userData.spin.children.forEach((h, i) => { if (h.children.length > 1) h.children[1].position.y = 0.9 + Math.sin(t * 3 + i * 0.8) * 0.25; });
        show(ferris, t, 0.0, null, 0.01); show(carousel, t, 0.0, null, 0.01);
        const lit = prog(t, T.night - 0.2, 0.6) * (1 - prog(t, T.rain - 0.2, 0.6)) + prog(t, T.finale - 0.5, 2);
        ferris.userData.lights.forEach((l) => { l.material.emissiveIntensity = 0.2 + 1.2 * clamp(lit) * (0.7 + 0.3 * Math.sin(t * 6 + l.position.x)); }); carousel.userData.lights.forEach((l) => { l.material.emissiveIntensity = 0.2 + 1.2 * clamp(lit); });
      });

      /* calendar stage (far from the park, reached by a cut) */
      const cal = grp(scene, 60, 0, 0); const MH = [0.8, 0.8, 1.0, 1.4, 2.2, 4.4, 5.6, 5.2, 2.6, 1.0, 0.8, 0.8]; const calBlocks = [];
      for (let i = 0; i < 12; i++) { const hot = i >= 5 && i <= 8; const b = rb(1.1, MH[i], 1.7, hot ? P.gold : P.blue, 0.06); put(cal, b, -7.2 + i * 1.3, 0, 0); calBlocks.push(b); if (i === 8) b.scale.x = 0.5, b.position.x -= 0.25; }
      put(cal, rb(16, 0.3, 3, P.navy, 0.1), 0, -0.3, 0); const sunM = sph(1.1, P.gold, 14, emis(P.gold, 1.6)); sunM.position.set(2.5, 8, -3); cal.add(sunM);
      ANCH.cal_mid = () => V(60, 3.2, 0); ANCH.cal_summer = () => V(60.9, 6.4, 0);
      upd((t) => { calBlocks.forEach((b, i) => grow(b, t, T.calendar + i * 0.08, null, 0.5)); show(sunM, t, T.calendar + 1.2, null, 0.6); calGround.visible = cal.visible = t >= T.calendar - 0.2 && t < T.night; });

      /* rain cloud + rain over the gate */
      const cloud = grp(scene, 0, 15, 9); [[0, 0, 0, 3], [3.2, -0.4, 0.5, 2.4], [-3.4, -0.3, 0.3, 2.5], [1.2, 1, -0.5, 2.2]].forEach(([x, y, z, r]) => { const m = sph(r, "#5b6aa0", 10); m.position.set(x, y, z); cloud.add(m); });
      const rain = []; for (let i = 0; i < 110; i++) { const r = rb(0.05, 0.9, 0.05, "#9fc0ff", 0.01); r.castShadow = false; r.userData = { x: -14 + rn() * 28, z: -2 + rn() * 28, ph: rn() * 14 }; scene.add(r); rain.push(r); }
      upd((t) => { const on = t > T.rain && t < T.spend + 0.2; show(cloud, t, T.rain - 0.1, T.spend - 0.1, 0.6); rain.forEach((r) => { r.visible = on; if (!on) return; r.position.set(r.userData.x, 14 - (((t - T.rain) * 12 + r.userData.ph) % 14), r.userData.z); }); });

      /* brand arrow ("revenir") + spend arrows */
      const loopArrow = grp(scene, 0, 4, 19); { const tor = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.28, 6, 24, 4.6), M(P.green)); tor.castShadow = true; loopArrow.add(tor); const head = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 8), M(P.green)); head.position.set(2.6, 0, 0); head.rotation.z = -Math.PI / 2; loopArrow.add(head); }
      upd((t) => { const s7 = T.flow + 4.5; show(loopArrow, t, s7, s7 + 3.5, 0.5); loopArrow.rotation.z = -t * 0.8; });
      ANCH.exit = () => V(0, 6, 19);
