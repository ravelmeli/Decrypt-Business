      const coinTowerMk = (p, x, z, n = 16) => { const g = grp(p, x, 0, z); const cs = []; for (let k = 0; k < n; k++) { const c = coinM(1.2); c.position.set(0, 0.1 + k * 0.17, 0); g.add(c); cs.push(c); } return { g, cs }; };
      const coinTowerUpd = (tw, t, t0, st = 0.07) => tw.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * st, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; });
      const mkWave = (p, n = 21) => { const g = grp(p); const pil = []; for (let k = 0; k < n; k++) { const col = k % 2 ? "#6b7480" : "#8e99a6"; const b = rb(0.7, 1, 2.2, col, 0.12, mat(col, { roughness: 0.3, metalness: 0.15 })); b.position.set(-10 + k * (20 / (n - 1)), 0, 0); g.add(b); pil.push(b); } const H = (x, t) => 2.6 + 2.0 * Math.sin(x * 0.5 - t * 1.6); return { g, pil, H }; };
      const waveUpd = (wv, t, t0) => wv.pil.forEach((b) => { const k = pop(t, t0, 0.6); const h = Math.max(0.05, wv.H(b.position.x, t)) * k; b.scale.y = h; b.visible = k > 0.01; });
      const arrowDown = (p, x, y, z) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0.9, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(P.red, { roughness: 0.35 })); hd.rotation.x = Math.PI; hd.rotation.y = Math.PI / 4; hd.position.y = 0.5; hd.castShadow = true; a.add(hd); return a; };
      const flow = (p, n = 4, r = 0.32) => { const a = []; for (let k = 0; k < n; k++) { const c = coinM(r); c.visible = false; p.add(c); a.push(c); } return a; };
      const flowUpd = (a, t, t0, t1, f, to, sp = 0.5) => a.forEach((c, k) => { const u = (((t - t0) * sp + k / a.length) % 1 + 1) % 1; c.visible = t >= t0 && t < t1; c.position.set(f[0] + (to[0] - f[0]) * u, f[1] + (to[1] - f[1]) * u + Math.sin(u * Math.PI) * 1.6, f[2] + (to[2] - f[2]) * u); c.rotation.x = t * 5; });
      function person(p, col = P.sky, s = 1) { const g = grp(p); g.scale.setScalar(s); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), mat(col, { roughness: 0.6 })); b.position.y = 0.75; b.castShadow = true; g.add(b); const h = sph(0.24, "#f0c9a8", 12, mat("#f0c9a8", { roughness: 0.7 })); h.position.y = 1.5; g.add(h); return g; }
      /* ---- esport builders (custom PBR) ---- */
      const SCR = ["#3dd6ff", "#ff5ea8", "#8f86ff", "#43e0a6", "#ffb347"], PCOL = [P.violet, P.pink, P.blue, P.green, P.orange];
      function gdesk(p, x, z, col, vest) { const g = grp(p, x, 0, z); put(g, rb(2.2, 0.15, 1.2, "#2a2f45", 0.05, mat("#2a2f45", { roughness: 0.4, metalness: 0.5 })), 0, 1.0, 0); [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].forEach(([a, b]) => put(g, rb(0.12, 1.0, 0.12, "#1a1d2c", 0.02), a, 0, b));
        put(g, rb(1.5, 0.95, 0.1, "#0b0d18", 0.03), 0, 1.15, 0.1); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.8), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6 })); sc.position.set(0, 1.62, 0.16); g.add(sc);
        const pl = worker(g, vest, 0.85); pl.g.position.set(0, 0, -1.1); return { g, pl, sc }; }
      function trophy(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(1.6, 0.5, 1.6, "#3b2f1f", 0.06), 0, 0, 0); put(g, cyl(0.3, 0.5, 1.0, P.gold, 16, GOLD()), 0, 1.0, 0); put(g, cyl(1.1, 0.55, 1.5, P.gold, 24, GOLD()), 0, 2.25, 0); [-1, 1].forEach((sx) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 16), GOLD()); h.position.set(sx * 1.2, 2.3, 0); g.add(h); }); return g; }
      function board(p, x, z, col, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(0.2, 2.6, 0.2, "#2a2f45", 0.03), 0, 0, 0); put(g, rb(3.0, 1.7, 0.18, col, 0.1, mat(col, { roughness: 0.3 })), 0, 2.4, 0); put(g, rb(1.2, 0.5, 0.06, P.white, 0.04), 0, 2.4, 0.13); return g; }
      function tvSet(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(5.0, 3.0, 0.3, "#10131f", 0.1, mat("#10131f", { roughness: 0.3 })), 0, 1.0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.5), new THREE.MeshStandardMaterial({ color: "#3dd6ff", emissive: "#2a9ad0", emissiveIntensity: 1.2 })); sc.position.set(0, 2.5, 0.17); g.add(sc); put(g, rb(1.2, 0.8, 0.8, "#10131f", 0.1), 0, 0, 0);
        const x1 = new THREE.Group(); [0.8, -0.8].forEach((r) => { const b = rb(0.35, 3.6, 0.12, P.red, 0.1, mat(P.red, { roughness: 0.35 })); b.position.y = -1.8; b.rotation.z = r; x1.add(b); }); x1.position.set(0, 2.5 + 0.0, 0.3); g.add(x1); return { g, x: x1 }; }
      function misc(p, kind, x, z) { const g = grp(p, x, 0, z);
        if (kind === "merch") { [0, 1, 2].forEach((i) => put(g, rb(1.8, 0.35, 1.3, [P.pink, P.blue, P.green][i], 0.08), 0, i * 0.4, 0)); }
        else if (kind === "cam") { put(g, rb(1.6, 1.0, 1.0, "#10131f", 0.1), 0, 1.2, 0); const l = cyl(0.4, 0.4, 0.7, "#2a2f45", 16, mat("#2a2f45", { roughness: 0.3, metalness: 0.6 })); l.rotation.x = Math.PI / 2; put(g, l, 0, 1.2, 0.8); put(g, cyl(0.06, 0.1, 1.2, "#10131f", 8), 0, 0.6, 0); const led = sph(0.12, P.red, 8, emis(P.red, 2)); led.position.set(0.5, 1.6, 0.52); g.add(led); }
        else if (kind === "pub") { put(g, rb(3.0, 2.6, 2.2, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4, metalness: 0.2 })), 0, 0, 0); const c = coinM(0.9); c.rotation.x = Math.PI / 2; c.position.set(0, 3.4, 0); g.add(c); }
        return g; }

      /* 1 · arene : five players at their screens, a TV with no broadcast rights */
      const hA = grp(PL.arene); const dsA = [0, 1, 2, 3, 4].map((i) => gdesk(hA, -5.6 + i * 2.8, 0.4 - Math.abs(i - 2) * 0.5, SCR[i], PCOL[i])); const trA = trophy(hA, 0.7); trA.position.set(-7.2, 0, -4.6); const tvA = tvSet(hA, 4.8, -5.2, 0.9);
      ANCH.ar_team = () => V(0, 5.4, -0.6); ANCH.ar_tv = () => V(4.8, 5.4, -5.2); wrapAnch(["ar_team", "ar_tv"], PL.arene); lampAt(hA, 0, 13, 4, 40, "#c8b8ff");
      upd((t) => { showHero("arene", hA, t); dsA.forEach((d, i) => { d.g.scale.setScalar(pop(t, TT.team_on + i * 0.12, 0.5)); d.sc.material.emissiveIntensity = 1.3 + 0.5 * Math.sin(t * 7 + i); d.pl.armL.rotation.x = -0.9 + Math.sin(t * 9 + i) * 0.25; d.pl.armR.rotation.x = -0.9 + Math.cos(t * 8 + i) * 0.25; }); trA.scale.setScalar(0.7 * pop(t, TT.team_on + 0.4, 0.5)); tvA.g.scale.setScalar(0.9 * pop(t, TT.team_on + 0.3, 0.5)); const xk = pop(t, TT.tv_on, 0.4); tvA.x.scale.setScalar(xk); tvA.x.visible = xk > 0.01; });

      /* 2 · sponso : sponsoring is almost all of the revenue (pies), and sponsors can leave */
      const hS = grp(PL.sponso); const pieA = pieMake(hS, [[0.9, P.gold, { roughness: 0.25 }], [0.1, "#7b8794", { roughness: 0.4 }]], 3.0, 0.4); pieA.g.position.set(-4.4, 0, 3.6); const pieB = pieMake(hS, [[0.63, P.gold, { roughness: 0.25 }], [0.37, "#7b8794", { roughness: 0.4 }]], 2.6, 0.4); pieB.g.position.set(4.4, 0, 3.6);
      const bdS = [P.pink, P.blue, P.green, P.violet].map((c, i) => ({ g: board(hS, -6 + i * 4, -4.2, c), x0: -6 + i * 4 }));
      ANCH.sp_pieA = () => V(-4.4, 3.6, 3.6); ANCH.sp_pieB = () => V(4.4, 3.4, 3.6); ANCH.sp_boards = () => V(0, 6.6, -4.2); wrapAnch(["sp_pieA", "sp_pieB", "sp_boards"], PL.sponso); lampAt(hS, 0, 13, 4, 42, "#c8b8ff");
      upd((t) => { showHero("sponso", hS, t); pieA.g.visible = t >= TT.pieA_on - 0.05; pieA.g.scale.setScalar(pop(t, TT.pieA_on, 0.7)); pieB.g.visible = t >= TT.pieB_on - 0.05; pieB.g.scale.setScalar(pop(t, TT.pieB_on, 0.7));
        bdS.forEach((b, i) => { const lv = prog(t, TT.leave_on + i * 0.18, 0.6); b.g.visible = t >= TT.boards_on - 0.05 && lv < 0.99; b.g.scale.setScalar(pop(t, TT.boards_on + i * 0.15, 0.5) * (1 - lv)); b.g.position.x = b.x0 + lv * 7; }); });

      /* 3 · depenses : salaries leave the organisation for the players; prize money goes to the players too */
      const hD = grp(PL.depenses); const orgD = office(hD, 3.2, 4.2, 3.0, "#3b4a6b", 1); orgD.position.set(-6.0, 0, -1.0); const plD = [P.pink, P.blue, P.green].map((c, i) => { const w_ = worker(hD, c, 1.0); w_.g.position.set(4.6, 0, -3.0 + i * 3.0); return w_; }); const trD = trophy(hD, 0.8); trD.position.set(0, 0, 4.6);
      const fD = [0, 1, 2].map(() => flow(hD, 4)), fP = [0, 1, 2].map(() => flow(hD, 4));
      ANCH.dp_players = () => V(4.6, 4.2, 0); ANCH.dp_org = () => V(-6.0, 6.0, -1.0); ANCH.dp_trophy = () => V(0, 5.4, 4.6); wrapAnch(["dp_players", "dp_org", "dp_trophy"], PL.depenses); lampAt(hD, 0, 13, 3, 42, "#c8b8ff");
      upd((t) => { showHero("depenses", hD, t); orgD.scale.setScalar(pop(t, TT.pay_on, 0.6)); plD.forEach((w_, i) => { w_.g.scale.setScalar(pop(t, TT.pay_on + 0.2 + i * 0.15, 0.5)); walk(w_, t, 0); }); trD.scale.setScalar(0.8 * pop(t, TT.prize_on, 0.6));
        fD.forEach((a, i) => flowUpd(a, t, TT.cost_on, TT.prize_on - 0.2, [-4.4, 3.2, -1.0], [4.4, 2.6, -3.0 + i * 3.0], 0.45)); fP.forEach((a, i) => flowUpd(a, t, TT.prize_on + 0.3, 1e9, [0, 3.6, 4.6], [4.4, 2.6, -3.0 + i * 3.0], 0.45)); });

      /* 4 · ligue : the entry ticket, 10 M$ */
      const hL = grp(PL.ligue); const gtL = grp(hL, 0, 0, 0); put(gtL, rb(0.6, 5.4, 0.6, "#2a2f45", 0.1), -3.4, 0, 0); put(gtL, rb(0.6, 5.4, 0.6, "#2a2f45", 0.1), 3.4, 0, 0); put(gtL, rb(7.4, 0.7, 0.7, P.violet, 0.15, mat(P.violet, { roughness: 0.3 })), 0, 5.4, 0); const tkL = grp(hL, 0, 3.0, 0.6); put(tkL, rb(2.8, 1.5, 0.12, P.gold, 0.15, GOLD()), 0, -0.75, 0); put(tkL, rb(1.6, 0.3, 0.06, P.navy, 0.04), 0, -0.5, 0.09); const ctL = coinTowerMk(hL, -6.4, 3.0, 30);
      ANCH.li_gate = () => V(0, 6.8, 0); ANCH.li_coin = () => V(-6.4, 7.0, 3.0); wrapAnch(["li_gate", "li_coin"], PL.ligue); lampAt(hL, 0, 13, 4, 42, "#c8b8ff");
      upd((t) => { showHero("ligue", hL, t); gtL.scale.setScalar(pop(t, TT.gate_on, 0.6)); const k = pop(t, TT.ticket_on, 0.5); tkL.scale.setScalar(k); tkL.rotation.z = Math.sin(t * 1.6) * 0.06; coinTowerUpd(ctL, t, TT.fee_on, 0.05); });

      /* 5 · pertes : profitability not demonstrated, many teams lose money */
      const hP = grp(PL.pertes); const brP = [4.0, 3.4, 2.8, 2.2, 1.6, 1.0].map((h, i) => { const b = rb(1.3, h, 1.3, P.red, 0.12, mat(P.red, { roughness: 0.35 })); b.position.set(-6 + i * 2.4, 0, 0); hP.add(b); return b; }); const arP = arrowDown(hP, 5.6, 8.2, 0); const dropP = []; for (let k = 0; k < 10; k++) { const c = coinM(0.4); c.visible = false; hP.add(c); dropP.push(c); }
      ANCH.pe_bars = () => V(-2, 6.0, 0); ANCH.pe_arrow = () => V(5.6, 11.4, 0); wrapAnch(["pe_bars", "pe_arrow"], PL.pertes); lampAt(hP, 0, 13, 4, 40, "#ffb0b0");
      upd((t) => { showHero("pertes", hP, t); brP.forEach((b, i) => { const k = pop(t, TT.bars_on + i * 0.15, 0.5); b.scale.set(1, k, 1); b.visible = k > 0.01; }); const a = pop(t, TT.loss_on, 0.5); arP.scale.setScalar(a); arP.position.y = 8.2 + Math.sin(t * 4) * 0.3;
        dropP.forEach((c, k) => { const u = (((t - TT.loss_on) * 0.6 + k / 10) % 1 + 1) % 1; c.visible = t >= TT.loss_on; c.position.set(-5 + (k % 5) * 2.4, 6.6 - u * 6.2, 2.4 + (k % 2) * 1.0); c.rotation.x = t * 5; }); });

      /* 6 · valo : valuation about 13x revenue */
      const hV2 = grp(PL.valo); const ctBig = coinTowerMk(hV2, -4.2, 0, 39), ctSm = coinTowerMk(hV2, 4.2, 0, 3);
      ANCH.va_big = () => V(-4.2, 9.2, 0); ANCH.va_small = () => V(4.2, 3.4, 0); wrapAnch(["va_big", "va_small"], PL.valo); lampAt(hV2, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("valo", hV2, t); coinTowerUpd(ctBig, t, TT.val_on, 0.06); coinTowerUpd(ctSm, t, TT.rev_on, 0.12); });

      /* 7 · diversif : merch, content, sponsors, publisher revenue */
      const hDv = grp(PL.diversif); const orgV = office(hDv, 3.0, 3.6, 2.8, "#3b4a6b", 1); orgV.position.set(0, 0, -1.5); const mgV = misc(hDv, "merch", -6.5, 1.5), cmV = misc(hDv, "cam", 6.5, 1.5), pbV = misc(hDv, "pub", 3.4, 5.0), bdV = board(hDv, -3.4, 5.0, P.pink);
      const fV = [0, 1, 2, 3].map(() => flow(hDv, 3, 0.3)); const SRC = [[-6.5, 2.0, 1.5], [6.5, 2.0, 1.5], [-3.4, 2.6, 5.0], [3.4, 3.0, 5.0]];
      ANCH.dv_merch = () => V(-6.5, 3.4, 1.5); ANCH.dv_cam = () => V(6.5, 3.8, 1.5); ANCH.dv_spon = () => V(-3.4, 6.0, 5.0); ANCH.dv_edit = () => V(3.4, 5.8, 5.0); wrapAnch(["dv_merch", "dv_cam", "dv_spon", "dv_edit"], PL.diversif); lampAt(hDv, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("diversif", hDv, t); orgV.scale.setScalar(pop(t, TT.div_on, 0.6)); mgV.scale.setScalar(pop(t, TT.merch_on, 0.5)); cmV.scale.setScalar(pop(t, TT.cont_on, 0.5)); bdV.scale.setScalar(pop(t, TT.spon_on, 0.5)); pbV.scale.setScalar(pop(t, TT.edit_on, 0.5));
        [TT.merch_on, TT.cont_on, TT.spon_on, TT.edit_on].forEach((t0, i) => flowUpd(fV[i], t, t0 + 0.4, 1e9, SRC[i], [0, 3.0, -1.5], 0.4)); });

      /* 8 · verdict : an audience on a fragile revenue wave, costs that never pause */
      const hW = grp(PL.verdict); const wvV = mkWave(hW); wvV.g.position.set(0, 0, -3.4); const crV = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const p_ = person(hW, [P.pink, P.blue, P.green, P.violet, P.orange][(r + c) % 5], 0.8); p_.position.set(-6.4 + c * 1.5, 0, 1.2 + r * 1.5); p_.visible = false; crV.push(p_); }
      const bdW = [board(hW, -8, -7.5, P.pink, 0.8), board(hW, 8, -7.5, P.blue, 0.8)]; const ctW = coinTowerMk(hW, 8.2, 3.4, 14);
      ANCH.vd_crowd = () => V(-1.4, 4.6, 2.6); ANCH.vd_wave = () => V(0, 8.8, -3.4); ANCH.vd_coin = () => V(8.2, 4.2, 3.4); ANCH.vd_brand = () => V(8, 6.0, -7.5); wrapAnch(["vd_crowd", "vd_wave", "vd_coin", "vd_brand"], PL.verdict); lampAt(hW, 0, 13, 4, 42, "#c8b8ff");
      upd((t) => { showHero("verdict", hW, t); crV.forEach((p_, i) => { const k = pop(t, TT.aud_on + i * 0.05, 0.4); p_.visible = k > 0.01 && t >= TT.aud_on - 0.05; p_.scale.setScalar(0.8 * k); p_.position.y = Math.max(0, Math.sin(t * 3 + i)) * 0.25; }); bdW.forEach((b, i) => b.scale.setScalar(0.8 * pop(t, TT.brand_on + i * 0.2, 0.5))); waveUpd(wvV, t, TT.ver_on + 0.2); coinTowerUpd(ctW, t, TT.cost2_on, 0.1); });

      /* 9 · cta */
      /* 10 · cta */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5, mat("#f4f7f6", { roughness: 0.18 })), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), mat("#f4f7f6", { roughness: 0.18 })); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 14, mat("#1b2a44", { roughness: 0.3 })); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6, mat("#e8483c", { roughness: 0.18 })), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), mat("#ffffff", { roughness: 0.3 })); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta); lampAt(hC, 0, 12, 6, 36);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
