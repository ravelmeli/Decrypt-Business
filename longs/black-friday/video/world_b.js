      const K = (k) => (TT[k] !== undefined ? TT[k] : 1e6);
      const crew = (p, n, x0, z0, dx = 1.3, vest = P.gold) => Array.from({ length: n }, (_, i) => { const w = worker(p, vest, 0.8); w.g.position.set(x0 + i * dx, 0, z0); return w; });
      /* 1 · ship : a cruise liner at sea, 2 billion in coins */
      const h1 = grp(PL.ship); sea(h1, 14.5); const sh1 = ship(h1, { L: 15, s: 0.95 }); sh1.position.set(-1.5, 0, -2);
      const c1 = coinStack(h1, 24, 1.5); c1.g.position.set(10.2, 0, 5.0);
      ANCH.sh_ship = () => V(-1.5, 10.0, -2); ANCH.sh_coin = () => V(10.2, 6.2, 5); wrapAnch(["sh_ship", "sh_coin"], PL.ship); lampAt(h1, 0, 13, 6, 55);
      upd((t) => { showHero("ship", h1, t); bobShip(sh1, t); dropStack(c1, t, K("coin_on"), 0.05, 4); });

      /* 2 · marche : fleet of minis, huge order tower, passenger bar */
      const h2 = grp(PL.marche); sea(h2, 14.5); const minis = []; for (let i = 0; i < 9; i++) { const m = ship(h2, { L: 13, s: 0.36, hull: ["#1f3f66", "#7a2e4a", "#2d6a4f"][i % 3] }); m.position.set(-9 + (i % 3) * 5.2, 0, -9 + Math.floor(i / 3) * 4.2); minis.push(m); }
      const tw2 = coinStack(h2, 30, 1.6); tw2.g.position.set(10.5, 0, 3.5); const pb2 = barC(h2, 3.0, 2.6, 2.6, P.green); pb2.position.z = 5.5;
      ANCH.mk_fleet = () => V(-4, 5.2, -6); ANCH.mk_tower = () => V(10.5, 7.6, 3.5); ANCH.mk_pax = () => V(3, 8.6, 5.5); wrapAnch(["mk_fleet", "mk_tower", "mk_pax"], PL.marche); lampAt(h2, 0, 12, 4, 50);
      upd((t) => { showHero("marche", h2, t); minis.forEach((m, i) => { popO(m, t, K("fleet_on") + i * 0.12, 0.4, 1); bobShip(m, t, 0.08, i); }); dropStack(tw2, t, K("tower_on"), 0.04, 4); const k = eOut(prog(t, K("pax_on"), 0.9)); pb2.visible = k > 0.01; pb2.scale.y = Math.max(0.001, 7.5 * k); });

      /* 3 · cout : what a cup really costs (beans bowl, extras cup, total cup) */
      const h3 = grp(PL.cout); sea(h3, 14.5); const bw3 = prop("wooden_bowl_01", 3.4, h3); bw3.position.set(-8, 0, -4.5); const cI = cupB(h3, { s: 0.9 }); cI.position.set(-0.5, 0, -5); const cM = cupB(h3, { s: 1.15, col: "#ffe9c4" }); cM.position.set(7.5, 0, -4.5);
      const sw = coinStack(h3, 3, 1.2); sw.g.position.set(-8.5, 0, 2.5); const si = coinStack(h3, 4, 1.2); si.g.position.set(-0.5, 0, 2.5); const sm = coinStack(h3, 8, 1.2); sm.g.position.set(8.0, 0, 2.5); const cb3 = propM("clipboard", 3.4, h3); cb3.position.set(3.6, 0, 6.2); cb3.rotation.y = -0.2;
      ANCH.ct_wish = () => V(-8, 5.0, -4.5); ANCH.ct_icon = () => V(-0.5, 4.6, -5); ANCH.ct_msc = () => V(7.5, 5.2, -4.5); ANCH.ct_avg = () => V(3.6, 4.2, 6.2); wrapAnch(["ct_wish", "ct_icon", "ct_msc", "ct_avg"], PL.cout); lampAt(h3, 0, 13, 4, 55);
      upd((t) => { showHero("cout", h3, t); popO(bw3, t, K("wish_on"), 0.5); popO(cI, t, K("icon_on"), 0.5); popO(cM, t, K("msc_on"), 0.5); popO(cb3, t, K("avg_on"), 0.5); dropStack(sw, t, K("wish_on") + 0.2, 0.08, 3); dropStack(si, t, K("icon_on") + 0.2, 0.08, 3); dropStack(sm, t, K("msc_on") + 0.2, 0.06, 3); });

      /* 4 · affret -> prix : price of the cup, VAT slice, cash register */
      const h4 = grp(PL.affret); sea(h4, 14.5); const cp4 = cupB(h4, { s: 1.5 }); cp4.position.set(-6.5, 0, -4.0); const pie4 = pieMake(h4, [[0.1, P.red], [0.9, P.green]], 3.0, 0.3); pie4.g.position.set(6.5, 0, -3.5); const cr4 = prop("CashRegister_01", 2.6, h4); cr4.position.set(-1.0, 0, 4.6);
      ANCH.af_tc = () => V(-6.5, 6.4, -4); ANCH.af_bb = () => V(6.5, 4.2, -3.5); ANCH.af_crew = () => V(-1.0, 4.6, 4.6); wrapAnch(["af_tc", "af_bb", "af_crew"], PL.affret); lampAt(h4, 0, 13, 5, 55);
      upd((t) => { showHero("affret", h4, t); popO(cp4, t, K("tc_on"), 0.5, 1); popO(pie4.g, t, K("bb_on"), 0.6); popO(cr4, t, K("crew_b"), 0.5); });

      /* 5 · loyer -> marge brute : 227 c HT vs 25 c matter vs 202 c margin + blended margin pie */
      const h5 = grp(PL.loyer); const U5 = 0.025; const b5h = barC(h5, -7.0, 2.8, 2.8, "#4db8ff"), b5m = barC(h5, -2.5, 2.8, 2.8, "#ff6b5e"), b5g = barC(h5, 2.0, 2.8, 2.8, "#43e0a6"); const plate5 = rb(15, 0.2, 5.4, "#7a4f2e", 0.08, mat("#7a4f2e", { roughness: 0.6 })); plate5.position.set(-2.5, 0, 0); h5.add(plate5); const pie5 = pieMake(h5, [[0.7, P.green], [0.3, P.red]], 2.6, 0.3); pie5.g.position.set(9.2, 0, 3.0);
      ANCH.ly_cal = () => V(-7, 7.4, 0); ANCH.ly_coin = () => V(-2.5, 3.0, 0); ANCH.ly_floor = () => V(2.0, 7.0, 0); ANCH.ly_pie = () => V(9.2, 4.0, 3.0); wrapAnch(["ly_cal", "ly_coin", "ly_floor", "ly_pie"], PL.loyer); lampAt(h5, 0, 13, 5, 55);
      upd((t) => { showHero("loyer", h5, t); const g_ = (b, v, k0) => { const k = eOut(prog(t, k0, 0.9)); b.visible = k > 0.01; b.scale.y = Math.max(0.001, v * U5 * k); }; g_(b5h, 227, K("cal_on")); g_(b5m, 25, K("coin5_on")); g_(b5g, 202, K("floor_on")); popO(pie5.g, t, K("pie5_on"), 0.6); });

      /* 6 · couts -> grains : arabica record vs June 2026 + share of beans in a cup */
      const h6 = grp(PL.couts); const U6 = 0.016; const b6s = barC(h6, -6.5, 3.2, 3.2, "#ff9a4a"), b6f = barC(h6, -1.5, 3.2, 3.2, "#4db8ff");
      const plate6 = rb(14, 0.2, 6.2, "#7a4f2e", 0.08, mat("#7a4f2e", { roughness: 0.6 })); plate6.position.set(-4, 0, 0); h6.add(plate6); const bw6 = prop("wooden_bowl_01", 3.2, h6); bw6.position.set(3.2, 0.2, 4.6); const pie6 = pieMake(h6, [[0.06, "#5a3318"], [0.94, "#d9c3a3"]], 2.4, 0.3); pie6.g.position.set(9.2, 0, 0.5);
      ANCH.cs_sal = () => V(-6.5, 8.4, 0); ANCH.cs_fuel = () => V(-1.5, 5.4, 0); ANCH.cs_pie = () => V(9.2, 3.6, 0.5); ANCH.cs_food = () => V(3.2, 3.4, 4.6); wrapAnch(["cs_sal", "cs_fuel", "cs_pie", "cs_food"], PL.couts); lampAt(h6, 0, 13, 6, 55);
      upd((t) => { showHero("couts", h6, t); const g_ = (b, v, k0) => { const k = eOut(prog(t, k0, 0.9)); b.visible = k > 0.01; b.scale.y = Math.max(0.001, v * U6 * k); }; g_(b6s, 442, K("sal6")); g_(b6f, 250, K("fuel6")); popO(bw6, t, K("food6"), 0.45); popO(pie6.g, t, K("pie6_on"), 0.6); });

      /* 7 · equipe : crew line-up, fuel barrels, ports, a ship behind */
      const h7 = grp(PL.equipe); sea(h7, 14.5); const s7 = ship(h7, { L: 14, s: 0.7 }); s7.position.set(-1.5, 0, -7.5); const cr7 = crew(h7, 7, -7.5, 0.5, 1.5, "#ffffff"); const bar7 = [0, 1, 2].map((i) => { const b = prop("wine_barrel_01", 1.7, h7); b.position.set(9.0 + i * 1.5, 0, 3.4 - i * 0.8); return b; }); const cr7b = prop("wooden_crate_01", 1.2, h7); cr7b.position.set(9.4, 0, -1.0); const cr7c = prop("wooden_crate_01", 1.2, h7); cr7c.position.set(11.2, 0, -1.6); const cb7 = prop("cardboard_box_01", 1.2, h7); cb7.position.set(10.2, 1.2, -1.2);
      ANCH.eq_crew = () => V(-1.5, 4.0, 0.5); ANCH.eq_fuel = () => V(10.4, 3.6, 3.0); ANCH.eq_food = () => V(10.2, 3.6, -1.2); ANCH.eq_ship = () => V(-1.5, 9.6, -7.5); wrapAnch(["eq_crew", "eq_fuel", "eq_food", "eq_ship"], PL.equipe); lampAt(h7, 0, 13, 5, 55);
      upd((t) => { showHero("equipe", h7, t); bobShip(s7, t, 0.1); cr7.forEach((w, i) => { popO(w.g, t, K("crew7_on") + i * 0.18, 0.35, 0.8); w.armR.rotation.x = -0.5 + Math.sin(t * 2 + i) * 0.25; }); bar7.forEach((b, i) => popO(b, t, K("fuel7_on") + i * 0.2, 0.4)); popO(cr7b, t, K("food7_on"), 0.4); popO(cr7c, t, K("food7_on") + 0.15, 0.4); popO(cb7, t, K("food7_on") + 0.3, 0.4); });

      /* 8 · recettes : ticket coins + on-board spending + occupancy 105 % gauge */
      const h8 = grp(PL.recettes); const tk8 = coinStack(h8, 12, 1.4, "#4db8ff"); tk8.g.position.set(-8.5, 0, 2.2); const ob8 = coinStack(h8, 8, 1.4); ob8.g.position.set(-4.5, 0, 2.2);
      const dr8 = prop("wine_bottles_01", 1.7, h8); dr8.position.set(-1.0, 0, 3.0); const cr8 = prop("CashRegister_01", 1.8, h8); cr8.position.set(1.4, 0, 3.0); const tkt8 = rb(2.4, 0.14, 3.0, "#ffffff", 0.05, mat("#ffffff", { roughness: 0.7 })); tkt8.position.set(-8.5, 0, -3.4); h8.add(tkt8);
      const g8 = rb(2.6, 1, 2.6, P.green, 0.1, mat(P.green, { roughness: 0.35 })); g8.position.set(8.0, 0, -1.0); h8.add(g8); const g8r = rb(4.2, 0.12, 3.8, P.red, 0.04, emis(P.red, 0.9)); g8r.position.set(8.0, 5.0, -1.0); h8.add(g8r);
      ANCH.rc_tk = () => V(-8.5, 5.6, 2.2); ANCH.rc_ob = () => V(-4.5, 4.4, 2.2); ANCH.rc_gauge = () => V(8, 6.8, -1); ANCH.rc_rc = () => V(1.4, 3.6, 3); wrapAnch(["rc_tk", "rc_ob", "rc_gauge", "rc_rc"], PL.recettes); lampAt(h8, 0, 13, 6, 55);
      upd((t) => { showHero("recettes", h8, t); dropStack(tk8, t, K("tk_on"), 0.05, 3); popO(tkt8, t, K("tk_on") - 0.2, 0.5); dropStack(ob8, t, K("ob_on"), 0.05, 3); popO(dr8, t, K("ob_on") + 0.1, 0.45); popO(cr8, t, K("ob_on") + 0.3, 0.45); const k = eOut(prog(t, K("gauge_on"), 1.0)); g8.visible = k > 0.01; g8.scale.y = Math.max(0.001, 5.25 * k); g8r.visible = k > 0.01; });
