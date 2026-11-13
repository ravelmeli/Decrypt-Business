
      const K = (k) => (TT[k] !== undefined ? TT[k] : 1e6);
      /* 1 · resto : a full restaurant, diners, a waiter, 100 coins of which only 3 are kept */
      const h1 = grp(PL.resto); { const r1 = resto(h1, { w: 13, h: 4.4, d: 6 }); r1.position.set(0, 0, -7); }
      const ts1 = [tableSet(h1, -5, 3.2, 2, [0, 2]), tableSet(h1, 0, 4.2, 3, [1, 4]), tableSet(h1, 5, 3.2, 2, [3, 5])];
      const wt1 = waiter(h1, 2, 0.95); wt1.g.position.set(-2.6, 0, 1.6);
      const cr1 = prop("CashRegister_01", 1.8, h1); cr1.position.set(9, 0, 1.2); cr1.rotation.y = -0.5;
      const g1 = grid100(h1, -11.5, -1.5, 10, 0.78); g1.g.position.y = 0;
      ANCH.rs_top = () => V(0, 9.4, -7); ANCH.rs_mid = () => V(0, 3.4, -4); ANCH.rs_cash = () => V(9, 3.4, 1.2); ANCH.rs_grid = () => V(-11.5, 1.2, 1.7); wrapAnch(["rs_top", "rs_mid", "rs_cash", "rs_grid"], PL.resto); lampAt(h1, 0, 11, 6, 50);
      upd((t) => { showHero("resto", h1, t); wt1.g.position.x = -2.6 + Math.sin(t * 0.5) * 3.2; walk(wt1, t, 6); ts1.forEach((ts) => ts.items.forEach((it, i) => { if (it.w) { it.w.armR.rotation.x = -0.5 + Math.sin(t * 2 + i) * 0.25; } }));
        const gv = t >= K("grid_on") - 0.05 && t < K("grid_off"); g1.g.visible = gv; g1.cs.forEach((c, i) => { const k = pop(t, K("grid_on") + i * 0.012, 0.3); c.scale.setScalar(Math.max(0.001, k)); const gold = i < 3, hi = pop(t, K("gold3"), 0.5); c.material = gold && t >= K("gold3") ? mat(P.gold, { roughness: 0.28, metalness: 0.9, emissive: P.gold, emissiveIntensity: 0.6 }) : mat("#2c6a74", { roughness: 0.5, metalness: 0.2 }); if (gold && t >= K("gold3")) c.scale.setScalar(Math.max(0.001, k) * (1 + 0.5 * hi)); }); });

      /* 2 · marche : a huge field of restaurants, a giant coin tower, a razor-thin margin strip */
      const h2 = grp(PL.marche); const minis = []; for (let i = 0; i < 40; i++) { const m = resto(h2, { w: 4.2, h: 1.8, d: 2.6, s: 0.7 }); m.position.set(-13 + (i % 8) * 2.9, 0, -9 + Math.floor(i / 8) * 2.6); minis.push(m); }
      const tw2 = coinStack(h2, 34, 1.7); tw2.g.position.set(9, 0, 4); const thin2 = rb(3.6, 0.28, 3.6, P.gold, 0.08, GOLD()); thin2.position.set(2.5, 0, 5.4); h2.add(thin2);
      ANCH.mk_field = () => V(-2, 3.6, -6); ANCH.mk_tower = () => V(9, 7.6, 4); ANCH.mk_thin = () => V(2.5, 1.2, 5.4); wrapAnch(["mk_field", "mk_tower", "mk_thin"], PL.marche); lampAt(h2, 0, 12, 4, 50);
      upd((t) => { showHero("marche", h2, t); minis.forEach((m, i) => popO(m, t, K("mk_on") + i * 0.045, 0.35, 0.7)); dropStack(tw2, t, K("tower_on"), 0.04, 4); const tk = pop(t, K("thin_on"), 0.5); thin2.visible = tk > 0.01; thin2.scale.setScalar(tk); });

      /* 3 · addition : receipt 30 EUR TTC, 2 EUR leave to the State as VAT, 28 EUR remain */
      const h3 = grp(PL.addition); const cr3 = prop("CashRegister_01", 3.0, h3); cr3.position.set(-4, 0, -2); cr3.rotation.y = 0.4;
      const rec = rb(3.4, 0.14, 5.0, "#ffffff", 0.05, mat("#ffffff", { roughness: 0.7 })); rec.position.set(1.0, 0.0, 1.5); rec.rotation.y = -0.2; h3.add(rec); for (let i = 0; i < 5; i++) { const ln = rb(2.4 - (i % 2) * 0.7, 0.05, 0.14, "#9fb0b4", 0.02, mat("#9fb0b4")); ln.position.set(0, 0.16, -1.6 + i * 0.7); rec.add(ln); }
      const stT = coinStack(h3, 30, 1.3); stT.g.position.set(-10.5, 0, 3.0); const stH = coinStack(h3, 28, 1.3); stH.g.position.set(7.5, 0, 5.0); const gv3 = govt(h3, 0.55); gv3.position.set(10.5, 0, -6.5); const stV = coinStack(h3, 2, 1.1, P.red); stV.g.position.set(8.0, 0, -3.0); const fl3 = flow(h3, [-10.5, 4.0, 3.0], [9.8, 3.0, -4.6], P.red, 3);
      ANCH.ad_ttc = () => V(-10.5, 6.4, 3); ANCH.ad_gov = () => V(10.5, 6.0, -6.5); ANCH.ad_ht = () => V(7.5, 6.4, 5); ANCH.ad_reg = () => V(-4, 4.4, -2); wrapAnch(["ad_ttc", "ad_gov", "ad_ht", "ad_reg"], PL.addition); lampAt(h3, 0, 12, 5, 50);
      upd((t) => { showHero("addition", h3, t); const rk = pop(t, K("ttc_on") - 0.3, 0.6); rec.visible = rk > 0.01; rec.scale.setScalar(rk); dropStack(stT, t, K("ttc_on"), 0.04); gv3.visible = t >= K("tva_on") - 0.02; gv3.scale.setScalar(0.55 * pop(t, K("tva_on"), 0.7)); dropStack(stV, t, K("tva_on") + 0.3, 0.2); fl3.upd(t, K("tva_on") + 0.2); dropStack(stH, t, K("ht_on"), 0.04); });

      /* 4 · prix : ingredients (8) x3 = selling price (24) */
      const h4 = grp(PL.prix); const bowl = prop("wooden_bowl_01", 1.4, h4); bowl.position.set(-9, 0, 1.0);
      const fr4 = []; [["food_apple_01", -9.6, 1.5, 0.55], ["food_apple_01", -8.4, 1.0, 0.55], ["lemon", -9.0, 0.5, 0.5]].forEach(([nm, x, z, s]) => { const f = prop(nm, 0.7, h4); f.position.set(x, 1.1, z); fr4.push(f); }); const bun = prop("hamburger_buns", 0.9, h4); bun.position.set(-7.4, 0, 2.6);
      const st8 = coinStack(h4, 8, 1.2); st8.g.position.set(-3.6, 0, 3.0); const st24 = coinStack(h4, 24, 1.2); st24.g.position.set(5.5, 0, 3.0);
      const plt = prop("round_wooden_table_01", 1.4, h4); plt.position.set(10.5, 0, -2.5); const ds = platefood(h4, 10.5, 1.42, -2.5, 0.75); const bn2 = prop("hamburger_buns", 0.8, h4); bn2.position.set(10.5, 1.45, -2.5);
      const ar3 = [0, 1, 2].map((i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 4), mat(P.gold, { roughness: 0.3, metalness: 0.5 })); c.rotation.z = -Math.PI / 2; c.position.set(-1.2 + i * 1.3, 2.0 + 0.0, 3.0); h4.add(c); return c; });
      ANCH.pr_ing = () => V(-9, 3.2, 1.0); ANCH.pr_8 = () => V(-3.6, 3.4, 3); ANCH.pr_24 = () => V(5.5, 6.2, 3); ANCH.pr_plate = () => V(10.5, 3.6, -2.5); ANCH.pr_x3 = () => V(0.5, 4.2, 3); wrapAnch(["pr_ing", "pr_8", "pr_24", "pr_plate", "pr_x3"], PL.prix); lampAt(h4, 0, 12, 5, 50);
      upd((t) => { showHero("prix", h4, t); popO(bowl, t, K("ing_on"), 0.5); fr4.forEach((f, i) => popO(f, t, K("ing_on") + 0.2 + i * 0.15, 0.35)); popO(bun, t, K("ing_on") + 0.6, 0.35); dropStack(st8, t, K("c8_on"), 0.08);
        ar3.forEach((c, i) => popO(c, t, K("x3_on") + i * 0.2, 0.35)); dropStack(st24, t, K("c24_on"), 0.05); popO(plt, t, K("plate_on"), 0.5); popO(ds, t, K("plate_on") + 0.2, 0.4); popO(bn2, t, K("plate_on") + 0.3, 0.4); });

      /* 5 · matiere : crates of ingredients, a 34 % pie, inflation arrow */
      const h5 = grp(PL.matiere); const cr5 = [0, 1, 2].map((i) => { const c = prop("wooden_crate_01", 1.8, h5); c.position.set(-10 + i * 2.6, 0, 1.0); return c; }); const c5b = prop("wooden_crate_01", 1.8, h5); c5b.position.set(-8.7, 1.8, 1.0);
      const fr5 = []; for (let i = 0; i < 9; i++) { const f = prop(i % 3 ? "food_apple_01" : "lemon", 0.7, h5); f.position.set(-10.6 + (i % 5) * 1.3, 1.85 + (i > 4 ? 1.8 : 0), 1.0 + ((i % 2) - 0.5) * 0.4); fr5.push(f); }
      const bt5 = prop("wine_bottles_01", 1.8, h5); bt5.position.set(-2.0, 0, -1.5); const br5 = prop("wine_barrel_01", 2.2, h5); br5.position.set(0.6, 0, -2.0);
      const pie5 = pieMake(h5, [[0.34, P.green], [0.66, "#2a7a84"]], 3.8, 0.4); pie5.g.position.set(6.5, 0, 2.4); pie5.sl[0].m.position.y = 0.7;
      const up5 = arrowUp(h5, P.red, 1.0); up5.position.set(12.0, 0, -2.0);
      ANCH.mt_crates = () => V(-8.7, 5.0, 1.0); ANCH.mt_pie = () => V(6.5, 3.4, 2.4); ANCH.mt_up = () => V(12, 6.6, -2); ANCH.mt_bot = () => V(-0.8, 3.0, -2); wrapAnch(["mt_crates", "mt_pie", "mt_up", "mt_bot"], PL.matiere); lampAt(h5, 0, 12, 5, 50);
      upd((t) => { showHero("matiere", h5, t); cr5.forEach((c, i) => popO(c, t, K("mat_on") + i * 0.12, 0.4)); popO(c5b, t, K("mat_on") + 0.4, 0.4); fr5.forEach((f, i) => popO(f, t, K("mat_on") + 0.5 + i * 0.07, 0.3)); popO(bt5, t, K("mat_on") + 0.9, 0.4); popO(br5, t, K("mat_on") + 1.0, 0.4); const pk = pop(t, K("pie_on"), 0.6); pie5.g.visible = pk > 0.01; pie5.g.scale.setScalar(pk); pie5.sl[0].m.position.y = 0.7 + 0.5 * Math.max(0, Math.sin(clamp((t - K("pie_on") - 0.6) / 1.2) * Math.PI)); const uk = pop(t, K("infl_on"), 0.5); up5.visible = uk > 0.01; up5.scale.set(uk, uk * (1 + 0.5 * prog(t, K("infl_on"), 1.8)), uk); up5.position.y = Math.sin(t * 2.2) * 0.25; });

      /* 6 · salaires : a busy kitchen, a giant salary tower, locked-in staff */
      const h6 = grp(PL.salaires); const stv = prop("electric_stove", 2.2, h6); stv.position.set(-2, 0, -6); const pan6 = prop("brass_pan_01", 0.6, h6); pan6.position.set(-2.6, 2.2, -6);
      const chefs = [0, 1, 2].map((i) => { const c = chef(h6, i + 1, 1.0); c.g.position.set(-5.5 + i * 3.4, 0, -3.0); return c; }); const wts = [0, 1, 2].map((i) => { const w = waiter(h6, i + 3, 0.95); w.g.position.set(2 + i * 2.2, 0, 0.4); return w; });
      const tw6 = coinStack(h6, 26, 1.8, P.red); tw6.g.position.set(-11, 0, 1.0); const lock = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 8, 18, Math.PI * 1.4), mat("#8a8a90", { roughness: 0.3, metalness: 0.9 })); lock.position.set(-11, 5.6, 1.0); lock.castShadow = true; h6.add(lock);
      const q6 = questionMark(h6, 0.75); q6.position.set(10.5, 0, -2.0); const ch6 = prop("dining_chair_02", 1.6, h6); ch6.position.set(10.5, 0, 0.8);
      ANCH.sa_kitchen = () => V(-2, 5.4, -4.5); ANCH.sa_tower = () => V(-11, 7.4, 1); ANCH.sa_wait = () => V(4.4, 3.4, 0.4); ANCH.sa_q = () => V(10.5, 5.2, -2); ANCH.sa_lock = () => V(-11, 6.2, 1); wrapAnch(["sa_kitchen", "sa_tower", "sa_wait", "sa_q", "sa_lock"], PL.salaires); lampAt(h6, 0, 12, 4, 50);
      upd((t) => { showHero("salaires", h6, t); popO(stv, t, K("team_on"), 0.5); popO(pan6, t, K("team_on") + 0.3, 0.4); chefs.forEach((c, i) => { popO(c.g, t, K("team_on") + i * 0.25, 0.4, 1.0); c.armR.rotation.x = -0.9 + Math.sin(t * 5 + i) * 0.35; }); wts.forEach((w, i) => { popO(w.g, t, K("team_on") + 0.8 + i * 0.25, 0.4, 0.95); w.g.position.x = 2 + i * 2.2 + Math.sin(t * 0.7 + i) * 0.8; walk(w, t, 5); });
        dropStack(tw6, t, K("tow6_on"), 0.05); lock.visible = t >= K("fix_on") - 0.02; lock.scale.setScalar(pop(t, K("fix_on"), 0.5)); const qk = pop(t, K("rec_on"), 0.6); q6.visible = qk > 0.01; q6.scale.setScalar(0.75 * qk); q6.rotation.y = Math.sin(t * 0.9) * 0.4; ch6.visible = qk > 0.01; });

      /* 7 · loyer : a building, a calendar whose months drop coins in a chest, a flame (energy) */
      const h7 = grp(PL.loyer); { const r7 = resto(h7, { w: 10, h: 4.2, d: 5.4, col: "#efe3c4", aw: "#2a7ab0" }); r7.position.set(-5, 0, -6); }
      const cal7 = calendar(h7); cal7.g.position.set(6.5, 3.2, -4.0); const chest7 = prop("treasure_chest", 2.2, h7); chest7.position.set(6.5, 0, 1.2);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.7, 8), emis(P.orange, 1.6)); flame.position.set(-11.5, 1.0, 1.5); h7.add(flame); const bulb7 = sph(0.8, P.gold, 14, emis(P.gold, 1.7)); bulb7.position.set(-9.0, 2.0, 2.4); h7.add(bulb7);
      const chain7 = []; for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 8, 16), mat("#8a8a90", { roughness: 0.3, metalness: 0.9 })); l.position.set(-6.5 + i * 0.75, 0.5, 6.4); l.rotation.y = (i % 2) * Math.PI / 2; l.castShadow = true; h7.add(l); chain7.push(l); }
      const cn7 = []; for (let i = 0; i < 12; i++) { const c = cyl(0.4, 0.4, 0.12, P.gold, 16, GOLD()); c.rotation.x = Math.PI / 2; h7.add(c); cn7.push(c); }
      ANCH.lo_build = () => V(-5, 9.0, -6); ANCH.lo_cal = () => V(6.5, 7.8, -4); ANCH.lo_chest = () => V(6.5, 3.2, 1.2); ANCH.lo_energy = () => V(-10.2, 3.6, 2.0); ANCH.lo_fixed = () => V(-2.5, 2.2, 6.4); wrapAnch(["lo_build", "lo_cal", "lo_chest", "lo_energy", "lo_fixed"], PL.loyer); lampAt(h7, 0, 12, 5, 50);
      upd((t) => { showHero("loyer", h7, t); popO(cal7.g, t, K("rent_on"), 0.6); cal7.cells.forEach((c, i) => { c.material = mat(t >= K("rent_on") + 0.8 + i * 0.28 ? P.red : "#cfe8f5", { roughness: 0.5 }); }); popO(chest7, t, K("rent_on") + 0.3, 0.5);
        cn7.forEach((c, i) => { const f = ((t - (K("rent_on") + 0.8 + i * 0.28)) / 0.9); c.visible = f > 0 && f < 1; const u = clamp(f); c.position.set(-2.4 + 8.9 * u + (cal7.g.position.x - 6.5), 6.6 - 6.4 * u * u, -3.0 + 4.2 * u); }); popO(flame, t, K("energy_on"), 0.5); popO(bulb7, t, K("energy_on") + 0.2, 0.5); flame.scale.y = (0.8 + 0.3 * Math.sin(t * 14)) * flame.scale.x; chain7.forEach((l, i) => popO(l, t, K("fixed_on") + i * 0.1, 0.3)); });

      /* 8 · invest : a restaurant under construction, equipment arrives, a bank loan, a cash reserve */
      const h8 = grp(PL.invest); { const r8 = resto(h8, { w: 10, h: 4.0, d: 5.2, col: "#f3ead2" }); r8.position.set(-3, 0, -7); }
      const scaf = grp(h8, -3, 0, -3.8); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const bx = rb(2.6, 0.12, 0.5, "#c8d2d6", 0.02, mat("#c8d2d6", { roughness: 0.4, metalness: 0.7 })); bx.position.set(-3.9 + i * 2.6, 1.2 + j * 1.5, 0); scaf.add(bx); } [-5.2, -2.6, 0, 2.6, 5.2].forEach((x) => put(scaf, rb(0.12, 4.8, 0.12, "#c8d2d6", 0.02, mat("#c8d2d6", { roughness: 0.4, metalness: 0.7 })), x, 0, 0));
      const cr8 = crane(h8, 11); cr8.g.position.set(9, 0, -7);
      const eq = [["electric_stove", 2.0, -9.0, 2.0], ["CashRegister_01", 1.4, -5.8, 2.6], ["round_wooden_table_01", 1.3, -3.0, 2.4], ["dining_chair_02", 1.5, -1.2, 2.6], ["hanging_industrial_lamp", 1.6, 0.8, 2.6]].map(([nm, h, x, z]) => { const o = prop(nm, h, h8); o.position.set(x, 0, z); return o; });
      const bank8 = govt(h8, 0.5); bank8.position.set(9.5, 0, 3.0); const stB = coinStack(h8, 14, 1.2); stB.g.position.set(12.5, 0, 6.0); const ch8 = []; for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 8, 16), mat("#8a8a90", { roughness: 0.3, metalness: 0.9 })); l.position.set(5.2 + i * 0.7, 0.5, 6.8); l.rotation.y = (i % 2) * Math.PI / 2; h8.add(l); ch8.push(l); }
      const rsv = prop("treasure_chest", 2.0, h8); rsv.position.set(-12.5, 0, -1.0);
      ANCH.in_build = () => V(-3, 8.6, -7); ANCH.in_eq = () => V(-4, 3.6, 2.4); ANCH.in_bank = () => V(9.5, 6.2, 3); ANCH.in_chain = () => V(7.8, 2.4, 6.8); ANCH.in_res = () => V(-12.5, 3.4, -1); wrapAnch(["in_build", "in_eq", "in_bank", "in_chain", "in_res"], PL.invest); lampAt(h8, 0, 12, 6, 50);
      upd((t) => { showHero("invest", h8, t); scaf.visible = t >= K("inv_on") - 0.02; scaf.scale.setScalar(pop(t, K("inv_on"), 0.7)); cr8.g.visible = scaf.visible; cr8.g.scale.setScalar(pop(t, K("inv_on") - 0.2, 0.8)); cr8.jib.rotation.y = Math.sin(t * 0.5) * 0.25; cr8.blk.position.y = -5.8 + Math.sin(t * 1.2) * 1.0; eq.forEach((o, i) => popO(o, t, K("eq_on") + i * 0.45, 0.45)); bank8.visible = t >= K("loan_on") - 0.02; bank8.scale.setScalar(0.5 * pop(t, K("loan_on"), 0.7)); dropStack(stB, t, K("loan_on") + 0.3, 0.06); ch8.forEach((l, i) => popO(l, t, K("chain8_on") + i * 0.1, 0.3)); popO(rsv, t, K("res_on"), 0.5); });
