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

      /* 3 · cout : three ships, three coin stacks */
      const h3 = grp(PL.cout); sea(h3, 14.5); const wish = ship(h3, { L: 13, s: 0.55, hull: "#2d4a7a" }); wish.position.set(-8, 0, -5); const icon = ship(h3, { L: 16, s: 0.7 }); icon.position.set(1.5, 0, -6); const msc = ship(h3, { L: 15, s: 0.62, hull: "#143a5a", acc: "#e8b020" }); msc.position.set(7.5, 0, 5.5);
      const sw = coinStack(h3, 10, 1.2); sw.g.position.set(-9, 0, 2); const si = coinStack(h3, 20, 1.2); si.g.position.set(-1.5, 0, 2); const sm = coinStack(h3, 17, 1.2); sm.g.position.set(11.0, 0, -3); const sa = coinStack(h3, 11, 1.2, "#c8d2d6"); sa.g.position.set(4.2, 0, 6.5);
      ANCH.ct_wish = () => V(-8, 6.2, -5); ANCH.ct_icon = () => V(1.5, 8.2, -6); ANCH.ct_msc = () => V(7.5, 7.4, 5.5); ANCH.ct_avg = () => V(4.2, 3.6, 6.5); wrapAnch(["ct_wish", "ct_icon", "ct_msc", "ct_avg"], PL.cout); lampAt(h3, 0, 13, 4, 55);
      upd((t) => { showHero("cout", h3, t); popO(wish, t, K("wish_on"), 0.5); popO(icon, t, K("icon_on"), 0.5); popO(msc, t, K("msc_on"), 0.5); [wish, icon, msc].forEach((s_, i) => bobShip(s_, t, 0.1, i)); dropStack(sw, t, K("wish_on") + 0.2, 0.05, 3); dropStack(si, t, K("icon_on") + 0.2, 0.05, 3); dropStack(sm, t, K("msc_on") + 0.2, 0.05, 3); dropStack(sa, t, K("avg_on"), 0.05, 3); });

      /* 4 · affret : time charter (owner crews it) vs bareboat (empty hull) */
      const h4 = grp(PL.affret); sea(h4, 14.5); const sA = ship(h4, { L: 13, s: 0.62 }); sA.position.set(-6.5, 0, -5.5); const sB = ship(h4, { L: 13, s: 0.62, hull: "#3a3a5c" }); sB.position.set(6.0, 0, -5.5);
      const crA = crew(h4, 4, -9.0, 1.5); const crB = crew(h4, 4, 3.5, 1.5, 1.3, P.red); const cb4 = propM("clipboard", 3.4, h4); cb4.position.set(-0.4, 0, 3.4); cb4.rotation.y = -0.2;
      ANCH.af_tc = () => V(-6.5, 6.6, -5.5); ANCH.af_bb = () => V(6.0, 6.6, -5.5); ANCH.af_crew = () => V(-7, 3.4, 1.5); ANCH.af_empty = () => V(6, 3.4, 1.5); wrapAnch(["af_tc", "af_bb", "af_crew", "af_empty"], PL.affret); lampAt(h4, 0, 13, 5, 55);
      upd((t) => { showHero("affret", h4, t); popO(sA, t, K("tc_on"), 0.5); popO(sB, t, K("bb_on"), 0.5); popO(cb4, t, K("tc_on") - 0.3, 0.5); crA.forEach((w, i) => { popO(w.g, t, K("tc_on") + 0.4 + i * 0.15, 0.35, 0.8); walk(w, t, 0); }); crB.forEach((w, i) => { popO(w.g, t, K("crew_b") + i * 0.15, 0.35, 0.8); }); bobShip(sA, t, 0.1, 0); bobShip(sB, t, 0.1, 2); });

      /* 5 · loyer : calendar + a 180 000 EUR/day coin stack + clock */
      const h5 = grp(PL.loyer); const cal5 = calendar(h5); cal5.g.position.set(-8, 4.4, -3); cal5.g.scale.setScalar(1.15); const ck5 = clockObj(h5, 0.8); ck5.g.position.set(-1.0, 5.6, -5.5);
      const c5 = coinStack(h5, 18, 1.8); c5.g.position.set(8.5, 0, 1.5); const s5 = ship(h5, { L: 13, s: 0.5 }); s5.position.set(1.5, 0, 6.5);
      ANCH.ly_cal = () => V(-8, 8.4, -3); ANCH.ly_coin = () => V(8.5, 6.4, 1.5); ANCH.ly_floor = () => V(1.5, 3.8, 6.5); wrapAnch(["ly_cal", "ly_coin", "ly_floor"], PL.loyer); lampAt(h5, 0, 13, 5, 55);
      upd((t) => { showHero("loyer", h5, t); popO(cal5.g, t, K("cal_on"), 0.5, 1.15); cal5.cells.forEach((c, i) => { c.material = mat(t >= K("cal_on") + 1.0 + i * 0.12 ? P.red : "#cfe8f5", { roughness: 0.5 }); }); popO(ck5.g, t, K("cal_on") + 0.3, 0.5, 0.8); ck5.h2.rotation.z = -t * 0.9; ck5.h1.rotation.z = -t * 0.075; dropStack(c5, t, K("coin5_on"), 0.05, 4); popO(s5, t, K("floor_on"), 0.5); bobShip(s5, t, 0.1); });

      /* 6 · couts : three bars (salaires 1915, carburant 1384, nourriture 1124) + fuel barrel */
      const h6 = grp(PL.couts); const U6 = 0.0042; const b6s = barC(h6, -6.5, 3.2, 3.2, "#4db8ff"), b6f = barC(h6, -1.5, 3.2, 3.2, "#ff9a4a"), b6n = barC(h6, 3.5, 3.2, 3.2, "#43e0a6");
      const plate6 = rb(18, 0.2, 6.2, "#0f3d45", 0.08, mat("#0f3d45", { roughness: 0.6 })); plate6.position.set(-1.5, 0, 0); h6.add(plate6); const barrel = prop("wine_barrel_01", 2.4, h6); barrel.position.set(-1.5, 0.2, 4.6); const pie6 = pieMake(h6, [[0.115, "#ff9a4a"], [0.885, "#7aa7ad"]], 2.3, 0.3); pie6.g.position.set(9.2, 0, 1.5);
      ANCH.cs_sal = () => V(-6.5, 8.6, 0); ANCH.cs_fuel = () => V(-1.5, 6.6, 0); ANCH.cs_food = () => V(3.5, 5.6, 0); ANCH.cs_pie = () => V(9.2, 3.4, 1.5); wrapAnch(["cs_sal", "cs_fuel", "cs_food", "cs_pie"], PL.couts); lampAt(h6, 0, 13, 6, 55);
      upd((t) => { showHero("couts", h6, t); const g_ = (b, v, k0) => { const k = eOut(prog(t, k0, 0.9)); b.visible = k > 0.01; b.scale.y = Math.max(0.001, v * U6 * k); }; g_(b6s, 1915, K("sal6")); g_(b6f, 1384, K("fuel6")); g_(b6n, 1124, K("food6")); popO(barrel, t, K("fuel6"), 0.45); popO(pie6.g, t, K("pie6_on"), 0.6); });

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
