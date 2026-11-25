      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      function cart(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(2.4, 1.0, 1.6, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0.7, 0); put(g, rb(0.2, 1.4, 0.2, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), -1.3, 0.9, 0); [-0.8, 0.8].forEach((wx) => { const w = cyl(0.3, 0.3, 0.2, "#10181b", 14, mat("#10181b", { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.3, 0.9); g.add(w); const w2 = w.clone(); w2.position.z = -0.9; g.add(w2); }); return g; }
      function safe(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(4.0, 3.6, 3.2, "#2a3a55", 0.18, mat("#2a3a55", { roughness: 0.3, metalness: 0.6 })), 0, 0, 0); put(g, rb(3.2, 2.8, 0.2, "#3b4f73", 0.1, mat("#3b4f73", { roughness: 0.3, metalness: 0.6 })), 0, 0.4, 1.62); const d = cyl(0.7, 0.7, 0.25, P.gold, 24, GOLD()); d.rotation.x = Math.PI / 2; d.position.set(0, 1.8, 1.82); g.add(d); put(g, rb(0.2, 1.2, 0.2, P.gold, 0.05, GOLD()), 0, 1.2, 1.9); return g; }
      function nuke(p, x, z) { const g = grp(p, x, 0, z); const tw = cyl(1.8, 2.8, 6.4, "#cfd6dd", 20, mat("#cfd6dd", { roughness: 0.5 })); tw.position.y = 3.2; g.add(tw); const puffs = [0, 1, 2].map((i) => { const s = sph(1.0 - i * 0.15, "#ffffff", 12, mat("#ffffff", { roughness: 0.9 })); s.position.set(0, 7.4 + i * 1.2, 0); g.add(s); return s; }); put(g, rb(2.4, 2.0, 2.4, "#6b7480", 0.12, mat("#6b7480", { roughness: 0.4 })), 3.6, 0, 0.4); return { g, puffs }; }
      function school(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(4.4, 2.6, 3.2, "#e0b84a", 0.1, mat("#e0b84a", { roughness: 0.5 })), 0, 0, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.4, 4), mat(P.red, { roughness: 0.4 })); rf.rotation.y = Math.PI / 4; rf.position.y = 3.3; rf.castShadow = true; g.add(rf); [-1.4, 0, 1.4].forEach((wx) => put(g, rb(0.8, 1.0, 0.1, P.sky, 0.03, new THREE.MeshStandardMaterial({ color: "#bfe6f0", emissive: P.sky, emissiveIntensity: 0.5 })), wx, 1.0, 1.63)); put(g, rb(0.12, 2.2, 0.12, "#9fb3c8", 0.02), 2.4, 2.6, 0); return g; }

      /* 1 · livret : a savings book and a growing stack of coins */
      const hL = grp(PL.livret); const bkL = grp(hL, -3.4, 0, 0); put(bkL, rb(3.6, 0.7, 4.6, "#2a6fd6", 0.14, mat("#2a6fd6", { roughness: 0.35 })), 0, 0, 0); put(bkL, rb(2.2, 0.72, 1.4, "#ffffff", 0.06, mat("#ffffff", { roughness: 0.4 })), 0, 0, 0.6); put(bkL, rb(0.5, 0.74, 0.5, P.gold, 0.06, GOLD()), 0, 0, -1.2);
      const ctL = coinTowerMk(hL, 3.4, 0, 12); const flL = flow(hL, 4, 0.3);
      ANCH.lv_book = () => V(-3.4, 2.6, 0); ANCH.lv_tower = () => V(3.4, 4.2, 0); wrapAnch(["lv_book", "lv_tower"], PL.livret); lampAt(hL, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("livret", hL, t); bkL.scale.setScalar(pop(t, TT.bk_on, 0.6)); coinTowerUpd(ctL, t, TT.ct_on, 0.1); flowUpd(flL, t, TT.ct_on + 0.4, 1e9, [-3.4, 1.2, 0], [3.4, 3.4, 0], 0.4); });

      /* 2 · nouveau : the ceiling today (22 950), then 25 000 to 30 000 */
      const hN = grp(PL.nouveau); const b1 = barMk(hN, -4.6, 1.6, 2.6, P.gold), b2 = barMk(hN, 0, 1.6, 2.6, P.blue), b3 = barMk(hN, 4.6, 1.6, 2.6, P.green);
      const calN = grp(hN, 0, 0, -6.4); calN.scale.setScalar(0.85); put(calN, rb(3.6, 3.6, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calN, rb(3.6, 0.9, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 2.8, 0);
      ANCH.nv_b1 = () => V(-4.6, 5.4, 1.6); ANCH.nv_b2 = () => V(0, 5.8, 1.6); ANCH.nv_b3 = () => V(4.6, 6.8, 1.6); ANCH.nv_cal = () => V(0, 4.2, -6.4); wrapAnch(["nv_b1", "nv_b2", "nv_b3", "nv_cal"], PL.nouveau); lampAt(hN, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("nouveau", hN, t); [[b1, 4.59, TT.b1_on], [b2, 5.0, TT.b2_on], [b3, 6.0, TT.b3_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); calN.scale.setScalar(0.85 * pop(t, TT.cal_on, 0.6)); });

      /* 3 · avantage : a safe that is tax free */
      const hA = grp(PL.avantage); const sfA = safe(hA, -3.4, 0); const dcA = grp(hA, 4.0, 0, 0.4); put(dcA, rb(3.0, 0.15, 3.8, "#f7f1e6", 0.04, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); put(dcA, rb(2.0, 0.17, 0.2, "#9fb3c8", 0.02), 0, 0, -1.0); put(dcA, rb(2.0, 0.17, 0.2, "#9fb3c8", 0.02), 0, 0, -0.4); const xA = crossX(hA, 5.0); xA.position.set(4.0, 3.2, 0.4); const flA = flow(hA, 4, 0.3);
      ANCH.av_safe = () => V(-3.4, 4.4, 0); ANCH.av_doc = () => V(4.0, 6.4, 0.4); wrapAnch(["av_safe", "av_doc"], PL.avantage); lampAt(hA, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("avantage", hA, t); sfA.scale.setScalar(pop(t, TT.av_on, 0.6)); dcA.scale.setScalar(pop(t, TT.tax_on - 0.4, 0.5)); const x = pop(t, TT.tax_on, 0.5); xA.scale.setScalar(x); xA.visible = x > 0.01; flowUpd(flA, t, TT.av_on + 0.6, 1e9, [-7.5, 4.0, 0.5], [-3.4, 2.4, 1.0], 0.4); });

      /* 4 · plafonnes : 20 savers, 3 of them (about 15 %) already at the ceiling */
      const hQ = grp(PL.plafonnes); const prQ = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const i = r * 5 + c; const gold = i === 2 || i === 7 || i === 12; const pp = person(hQ, gold ? P.gold : P.sky, 1.3); pp.position.set(-4.4 + c * 2.2, 0, -3.2 + r * 2.2); prQ.push({ pp, gold }); }
      ANCH.pl_gold = () => V(-0.0, 3.6, -3.2); ANCH.pl_all = () => V(0, 4.6, 1.0); wrapAnch(["pl_gold", "pl_all"], PL.plafonnes); lampAt(hQ, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("plafonnes", hQ, t); prQ.forEach((o, i) => { const k = pop(t, TT.pl_on + i * 0.05, 0.4); const hi = o.gold ? 1 + 0.35 * pop(t, TT.gold_on, 0.5) : 1; o.pp.scale.setScalar(1.3 * k * hi); o.pp.position.y = o.gold ? Math.max(0, Math.sin(t * 4 + i)) * 0.25 * pop(t, TT.gold_on, 0.5) : 0; }); });

      /* 5 · moitie : 3 savers hold as much as 17 others */
      const hM = grp(PL.moitie); const ctM1 = coinTowerMk(hM, -3.6, 0, 14), ctM2 = coinTowerMk(hM, 3.6, 0, 15); ctM1.g.scale.setScalar(1.5); ctM2.g.scale.setScalar(1.5); const gl = [0, 1, 2].map((i) => { const pp = person(hM, P.gold, 1.1); pp.position.set(-5.3 + i * 1.5, 0, 3.4); return pp; }); const sk = []; for (let i = 0; i < 17; i++) { const pp = person(hM, P.sky, 0.8); pp.position.set(1.2 + (i % 6) * 1.1, 0, 3.0 + Math.floor(i / 6) * 1.1); sk.push(pp); }
      ANCH.mo_l = () => V(-3.6, 6.4, 0); ANCH.mo_r = () => V(3.6, 6.4, 0); wrapAnch(["mo_l", "mo_r"], PL.moitie); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("moitie", hM, t); gl.forEach((g, i) => g.scale.setScalar(1.1 * pop(t, TT.mo_on + i * 0.1, 0.4))); sk.forEach((g, i) => g.scale.setScalar(0.8 * pop(t, TT.mo_on + 0.3 + i * 0.03, 0.4))); coinTowerUpd(ctM1, t, TT.ht_on, 0.07); coinTowerUpd(ctM2, t, TT.ht_on + 0.2, 0.07); });

      /* 6 · etat : savings are funnelled to a nuclear plant and a school */
      const hE = grp(PL.etat); const prE = [P.sky, P.pink, P.violet].map((c, i) => { const pp = person(hE, c, 1.2); pp.position.set(-6.0, 0, -2.0 + i * 2.0); return pp; }); const nkE = nuke(hE, 1.6, -2.2); const scE = school(hE, 3.2, 3.2); const fwE = [0, 1].map(() => flow(hE, 4, 0.3));
      ANCH.et_pers = () => V(-6.0, 3.6, 0); ANCH.et_nuc = () => V(1.6, 9.4, -2.2); ANCH.et_sch = () => V(3.2, 5.6, 3.2); wrapAnch(["et_pers", "et_nuc", "et_sch"], PL.etat); lampAt(hE, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("etat", hE, t); prE.forEach((pp, i) => pp.scale.setScalar(1.2 * pop(t, TT.et_on + i * 0.12, 0.45))); nkE.g.scale.setScalar(pop(t, TT.nuc_on, 0.6)); nkE.puffs.forEach((s, i) => { s.position.y = 7.4 + i * 1.2 + Math.sin(t * 1.5 + i) * 0.2; }); scE.scale.setScalar(pop(t, TT.eco_on, 0.6)); flowUpd(fwE[0], t, TT.fl_on, 1e9, [-6.0, 2.2, 0], [1.6, 5.0, -2.2], 0.4); flowUpd(fwE[1], t, TT.eco_on + 0.3, 1e9, [-6.0, 2.2, 0], [3.2, 2.4, 3.2], 0.4); });

      /* 7 · cout : a tax-free product costs the public purse */
      const hC2 = grp(PL.cout); const ofC = office(hC2, 4.4, 4.8, 3.4, "#3b4a6b", 1); ofC.position.set(-3.4, 0, -0.4); const adC = arrowDown(hC2, -3.4, 7.8, -0.4); const dcC = grp(hC2, 4.0, 0, 0.8); put(dcC, rb(3.0, 0.15, 3.8, "#f7f1e6", 0.04, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); const xC = crossX(hC2, 5.0); xC.position.set(4.0, 3.2, 0.8); const flC = flow(hC2, 5, 0.3);
      ANCH.co_off = () => V(-3.4, 6.2, -0.4); ANCH.co_doc = () => V(4.0, 6.6, 0.8); wrapAnch(["co_off", "co_doc"], PL.cout); lampAt(hC2, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("cout", hC2, t); ofC.scale.setScalar(pop(t, TT.co_on, 0.6)); dcC.scale.setScalar(pop(t, TT.tax2_on, 0.5)); const x = pop(t, TT.tax2_on + 0.2, 0.5); xC.scale.setScalar(x); xC.visible = x > 0.01; const a = pop(t, TT.cost_on, 0.5); adC.scale.setScalar(a); adC.visible = a > 0.01; adC.position.y = 7.8 + Math.sin(t * 3) * 0.25; flowUpd(flC, t, TT.cost_on + 0.2, 1e9, [-3.4, 2.4, -0.4], [4.4, 0.4, 3.2], 0.4); });

      /* 8 · conso : the savings stack grows while the shopping cart shrinks */
      const hK = grp(PL.conso); const ctK = coinTowerMk(hK, -3.8, 0, 12); ctK.g.scale.setScalar(1.4); const cgK = cart(hK, 3.8, 0.2, 1.5);
      ANCH.cs_tower = () => V(-3.8, 5.0, 0); ANCH.cs_cart = () => V(3.8, 3.6, 0.2); wrapAnch(["cs_tower", "cs_cart"], PL.conso); lampAt(hK, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("conso", hK, t); coinTowerUpd(ctK, t, TT.sav_on, 0.12); const sh = 1 - 0.5 * eInOut(prog(t, TT.cons_dn, 1.0)); cgK.scale.setScalar(1.5 * pop(t, TT.cn_on, 0.5) * sh); });

      /* 9 · taux : 1.70 % today, a possible rise (not announced) */
      const hT = grp(PL.taux); const flT = rb(13, 0.3, 7, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flT.position.set(0, 0, 0); hT.add(flT); const bT1 = barMk(hT, -3.0, 0, 2.6, P.gold), bT2 = barMk(hT, 3.0, 0, 2.6, P.green, { roughness: 0.3, transparent: true, opacity: 0.35 });
      ANCH.tx_now = () => V(-3.0, 4.6, 0); ANCH.tx_gh = () => V(3.0, 6.6, 0); wrapAnch(["tx_now", "tx_gh"], PL.taux); lampAt(hT, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("taux", hT, t); flT.scale.setScalar(pop(t, TT.tx_on - 0.3, 0.5)); const k1 = pop(t, TT.tx_on, 0.6); bT1.scale.y = Math.max(0.001, 3.74 * k1); bT1.visible = k1 > 0.01; const k2 = pop(t, TT.gh_on, 0.6); bT2.scale.y = Math.max(0.001, 5.5 * k2); bT2.visible = k2 > 0.01; bT2.material.opacity = 0.3 + 0.12 * Math.sin(t * 4); });

      /* 10 · retenez : more room to save, the same rate */
      const hR = grp(PL.retenez); const trR = rb(8.0, 0.3, 5.0, "#e6dccb", 0.1, mat("#e6dccb", { roughness: 0.4 })); trR.position.set(-2.0, 0, 0); hR.add(trR); const coR = []; for (let i = 0; i < 15; i++) { const c = coinM(0.55); c.position.set(-5.0 + (i % 5) * 1.5, 0.3 + 0.08, -1.4 + Math.floor(i / 5) * 1.4); hR.add(c); coR.push(c); } const bR = barMk(hR, 5.2, 0, 2.2, P.gold);
      ANCH.rt_tray = () => V(-2.0, 3.0, 0); ANCH.rt_bar = () => V(5.2, 5.0, 0); wrapAnch(["rt_tray", "rt_bar"], PL.retenez); lampAt(hR, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("retenez", hR, t); trR.scale.setScalar(pop(t, TT.rt_on, 0.6)); coR.forEach((c, i) => { const k = pop(t, TT.place_on + i * 0.08, 0.4); c.scale.setScalar(Math.max(0.001, k)); c.visible = k > 0.01; }); const k = pop(t, TT.same_on, 0.6); bR.scale.y = Math.max(0.001, 3.74 * k); bR.visible = k > 0.01; });

