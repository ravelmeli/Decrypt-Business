
      const K = (k) => (TT[k] !== undefined ? TT[k] : 1e6);
      const place = (n) => PL[n];
      /* 1 · ecole : the school, pupils in the yard, the question mark */
      const h1 = grp(PL.ecole); { const sc = school(h1, { w: 13, h: 5, d: 6 }); sc.position.set(0, 0, -6); }
      const yard = []; for (let i = 0; i < 10; i++) { const k = kid(h1, i, 0.55); k.g.position.set(-5 + i * 1.1, 0, 0.8 + (i % 3) * 0.7); k.g.rotation.y = 0.2 * (i % 3 - 1); yard.push(k); }
      const tch = adult(h1, "#4db8ff", 3); tch.g.position.set(6, 0, 1.6);
      const qm = questionMark(h1, 1.0); qm.position.set(-9, 0, -1);
      ANCH.sc_top = () => V(0, 8.5, -6); ANCH.sc_mid = () => V(0, 3.2, -3); ANCH.sc_side = () => V(7, 3, -5); ANCH.sc_q = () => V(-9, 6, -1); wrapAnch(["sc_top", "sc_mid", "sc_side", "sc_q"], PL.ecole); lampAt(h1, 0, 11, 6, 50);
      upd((t) => { showHero("ecole", h1, t); yard.forEach((k, i) => { k.legL.rotation.x = Math.sin(t * 3 + i) * 0.1; k.armR.rotation.z = Math.sin(t * 2.4 + i) * 0.35; k.g.position.y = Math.abs(Math.sin(t * 3 + i * 1.3)) * 0.05; }); const q = pop(t, K("q_on"), 0.6); qm.scale.setScalar(q); qm.position.y = Math.sin(t * 1.8) * 0.3; qm.rotation.y = Math.sin(t * 0.9) * 0.35; });

      /* 2 · contrats : left a lone free school paid by families, right a public-funded school network + the State */
      const h2 = grp(PL.contrats); { const a = school(h2, { w: 8, h: 4, d: 5, col: "#ffe9b8", roof: "#a8662a", s: 1 }); a.position.set(-8.5, 0, -2); }
      const gv = govt(h2, 0.95); gv.position.set(6, 0, -8);
      { const b = school(h2, { w: 8, h: 4, d: 5, col: "#cfe8f5", roof: "#2a5a9a", flag: P.blue }); b.position.set(8.5, 0, 0.5); }
      const famC = []; for (let i = 0; i < 4; i++) { const f = adult(h2, SHIRT[i], i, 0.8); f.g.position.set(-14, 0, 2.5 + i * 0.7); famC.push(f); const c = coinStack(f.g, 3, 0.35); c.g.position.set(0.5, 1.2, 0); c.g.scale.setScalar(0.8); f.coin = c.g; }
      const minis = []; for (let i = 0; i < 28; i++) { const m = school(h2, { w: 2.2, h: 1.0, d: 1.4, col: "#cfe8f5", roof: "#2a5a9a" }); m.scale.setScalar(0.7); m.position.set(1.5 + (i % 7) * 2.4, 0, 4.2 + Math.floor(i / 7) * 1.7); minis.push(m); }
      const lone = []; for (let i = 0; i < 4; i++) { const m = school(h2, { w: 2.2, h: 1.0, d: 1.4, col: "#ffe9b8", roof: "#a8662a" }); m.scale.setScalar(0.7); m.position.set(-15 + i * 2.4, 0, 8.2); lone.push(m); }
      const fl2 = flow(h2, [6, 3, -4.5], [8.5, 3, -0.8], P.blue, 4);
      ANCH.ct_hc = () => V(-8.5, 7, -2); ANCH.ct_sc = () => V(8.5, 7, 0.5); ANCH.ct_state = () => V(6, 10.5, -8); ANCH.ct_minis = () => V(8.0, 2.6, 6.6); ANCH.ct_lone = () => V(-11.6, 2.4, 8.2); wrapAnch(["ct_hc", "ct_sc", "ct_state", "ct_minis", "ct_lone"], PL.contrats); lampAt(h2, 0, 12, 6, 50);
      upd((t) => { showHero("contrats", h2, t); famC.forEach((f, i) => { const k = prog(t, K("fam_on") + i * 0.25, 2.2); f.g.position.x = -14 + k * 6.0; walk(f, t, 7 * (k > 0 && k < 1 ? 1 : 0)); f.coin.visible = k < 0.98; f.g.visible = t >= K("fam_on") - 0.02; }); gv.visible = t >= K("state_on") - 1.5; gv.scale.setScalar(0.95 * pop(t, K("state_on"), 0.7)); fl2.upd(t, K("flow_on"));
        minis.forEach((m, i) => { const k = pop(t, K("n7500") + i * 0.04, 0.35); m.scale.setScalar(0.7 * k); m.visible = k > 0.01; }); lone.forEach((m, i) => { const k = pop(t, i < 2 ? K("lone_on") : K("dbl_on") + (i - 2) * 0.2, 0.4); m.scale.setScalar(0.7 * k); m.visible = k > 0.01; }); });

      /* 3 · depenses : four cost blocks, salaries tower dwarfs the rest */
      const h3 = grp(PL.depenses); const blk = []; const defs = [["#e8483c", 2.2, "people"], ["#4db8ff", 1.8, "house"], ["#ffd84a", 1.4, "bulb"], ["#43e0a6", 1.2, "books"]];
      defs.forEach(([c, hh, kind], i) => { const g = grp(h3, -10.5 + i * 7, 0, 0); pedestal(g, 2.6); const b = rb(3.4, 1, 3.4, c, 0.2, mat(c, { roughness: 0.4 })); b.position.y = 0.5; g.add(b); const top = grp(g, 0, 0, 0);
        if (kind === "people") { for (let k = 0; k < 4; k++) { const w = adult(top, SHIRT[k], k, 0.7); w.g.position.set(-1.2 + k * 0.8, 0.5, 0.5); } }
        if (kind === "house") { const s_ = school(top, { w: 2.6, h: 1.6, d: 2, col: "#cfe8f5", roof: "#2a5a9a", s: 0.8 }); s_.position.set(0, 0.5, 0); }
        if (kind === "bulb") { const bl = sph(0.8, P.gold, 16, emis(P.gold, 1.6)); bl.position.set(0, 1.6, 0); top.add(bl); put(top, cyl(0.35, 0.35, 0.7, P.gray, 12, mat("#c8d2d6", { roughness: 0.3, metalness: 0.9 })), 0, 0.85, 0); }
        if (kind === "books") { const e = prop("book_encyclopedia_set_01", 1.4, top); e.position.set(0, 0.5, 0); const bn = prop("binder_notebook", 0.3, top); bn.position.set(1.4, 0.5, 0.4); }
        blk.push({ g, b, top, hh }); });
      ANCH.dp0 = () => V(-10.5, 5, 0); ANCH.dp1 = () => V(-3.5, 4.2, 0); ANCH.dp2 = () => V(3.5, 3.4, 0); ANCH.dp3 = () => V(10.5, 3.2, 0); ANCH.dp_top = () => V(-10.5, 11, 0); wrapAnch(["dp0", "dp1", "dp2", "dp3", "dp_top"], PL.depenses); lampAt(h3, 0, 12, 6, 50);
      upd((t) => { showHero("depenses", h3, t); blk.forEach((o, i) => { const k = pop(t, K("b" + (i + 1)), 0.55); o.g.visible = k > 0.01; o.g.scale.setScalar(Math.min(1.05, k)); const big = i === 0 ? prog(t, K("big"), 0.9) : 0; const tall = 1 + (i === 0 ? 5.0 * eOut(big) : 0); o.b.scale.y = tall; o.top.position.y = (tall - 1) * 1.0; }); });

      /* 4 · salaires : the salary tower, a 20-pupil class and a 30-pupil class cost nearly the same */
      const h4 = grp(PL.salaires); const sTow = coinStack(h4, 22, 1.5); sTow.g.position.set(-11, 0, -1); const oTow = coinStack(h4, 6, 1.0, "#4db8ff"); oTow.g.position.set(-7.5, 0, 2.4);
      const cl20 = classroom(h4, 4, 5, -2.0, -3.2, 1.25); const cl30 = classroom(h4, 5, 6, 7.2, -4.0, 1.25);
      const t20 = adult(h4, "#e8483c", 5, 0.95); t20.g.position.set(-2.0, 0, -4.4); const t30 = adult(h4, "#e8483c", 6, 0.95); t30.g.position.set(7.2, 0, -5.2); const t30b = adult(h4, "#43e0a6", 7, 0.95); t30b.g.position.set(7.2 + 4.2, 0, -5.2); t30b.g.visible = false;
      const chS = prop("treasure_chest", 1.6, h4); chS.position.set(-2.0, 0, 5.4); const flS = flow(h4, [-9.5, 3, 0.5], [-2.0, 2, 5.4], P.gold, 4);
      const stateS = govt(h4, 0.45); stateS.position.set(9.6, 0, 6.2); const flT = flow(h4, [9.6, 3, 6.2], [7.2, 3, -3.4], P.blue, 4);
      ANCH.sa_tower = () => V(-11, 6.6, -1); ANCH.sa_rest = () => V(-7.5, 2.6, 2.4); ANCH.sa_c20 = () => V(-2.0, 3.4, -1); ANCH.sa_c30 = () => V(7.2, 3.4, -1); ANCH.sa_school = () => V(-2.0, 2.2, 5.4); ANCH.sa_state = () => V(9.6, 4.2, 6.2); wrapAnch(["sa_tower", "sa_rest", "sa_c20", "sa_c30", "sa_school", "sa_state"], PL.salaires); lampAt(h4, 0, 12, 4, 50);
      upd((t) => { showHero("salaires", h4, t); sTow.cs.forEach((c, k) => { const p0 = prog(t, K("tow_on") + k * 0.05, 0.3); c.visible = p0 > 0; c.position.y = 0.08 + k * 0.17 + (1 - bounce(p0)) * 3; }); oTow.cs.forEach((c, k) => { const p0 = prog(t, K("tow_on") + 0.4 + k * 0.05, 0.3); c.visible = p0 > 0; c.position.y = 0.08 + k * 0.17 + (1 - bounce(p0)) * 3; });
        cl20.g.visible = t >= K("c20") - 0.02; cl30.g.visible = t >= K("c30") - 0.02; cl20.items.forEach((o, i) => { const k = pop(t, K("c20") + i * 0.06, 0.35); o.d.scale.setScalar(k); o.k.g.scale.setScalar(0.46 * k); }); cl30.items.forEach((o, i) => { const k = pop(t, K("c30") + i * 0.05, 0.35); o.d.scale.setScalar(k); o.k.g.scale.setScalar(0.46 * k); });
        t20.g.visible = t >= K("c20") - 0.02; t30.g.visible = t >= K("c30") - 0.02; chS.visible = t >= K("hc_pay") - 0.02; chS.scale.setScalar(pop(t, K("hc_pay"), 0.5)); flS.upd(t, K("hc_pay") + 0.3); stateS.visible = t >= K("st_pay") - 0.02; stateS.scale.setScalar(0.45 * pop(t, K("st_pay"), 0.6)); flT.upd(t, K("st_pay") + 0.4); });

      /* 5 · horscontrat : a lone school, fees chest, break-even gauge, the slow start (costs vs enrolment) */
      const h5 = grp(PL.horscontrat); { const s5 = school(h5, { w: 9, h: 4.4, d: 5, col: "#ffe9b8", roof: "#a8662a" }); s5.position.set(-2, 0, -7.5); }
      const chest = prop("treasure_chest", 2.0, h5); chest.position.set(-9, 0, 1.5); const fams = []; for (let i = 0; i < 4; i++) { const f = adult(h5, SHIRT[(i + 2) % 8], i + 1, 0.8); f.g.position.set(-14, 0, 3 + i * 0.7); fams.push(f); }
      const th = thermo(h5, 6.5); th.g.position.set(-3.6, 0, 3.0); const marker = rb(1.6, 0.14, 0.7, P.red, 0.04, emis(P.red, 0.9)); marker.position.set(-3.6, 0.5 + 0.55 * 6.5 * 0.55, 3.0); h5.add(marker);
      const inv = []; for (let i = 0; i < 12; i++) { const b = bundle(h5, 2.6 + (i % 4) * 1.15, 0.2 + Math.floor(i / 4) * 0.34, 2.2); inv.push(b); }
      const costBar = rb(1.6, 6.0, 1.6, P.red, 0.1, mat(P.red, { roughness: 0.4 })); costBar.position.set(7.6, 0, 1.4); h5.add(costBar); const enrBar = rb(1.6, 6.0, 1.6, P.blue, 0.1, mat(P.blue, { roughness: 0.4 })); enrBar.position.set(10.0, 0, 1.4); h5.add(enrBar);
      ANCH.hc_chest = () => V(-9, 3.2, 1.5); ANCH.hc_gauge = () => V(-3.6, 7.4, 3); ANCH.hc_inv = () => V(4.2, 2.2, 2.2); ANCH.hc_cost = () => V(7.6, 6.8, 1.4); ANCH.hc_enr = () => V(10, 3.0, 1.4); ANCH.hc_school = () => V(-2, 8.6, -7.5); wrapAnch(["hc_chest", "hc_gauge", "hc_inv", "hc_cost", "hc_enr", "hc_school"], PL.horscontrat); lampAt(h5, 0, 12, 5, 50);
      upd((t) => { showHero("horscontrat", h5, t); chest.visible = t >= K("fees_on") - 0.02; chest.scale.setScalar(pop(t, K("fees_on"), 0.5)); fams.forEach((f, i) => { const k = prog(t, K("fees_on") + 0.2 + i * 0.4, 2.2); f.g.position.x = -14 + k * 3.6; walk(f, t, 7 * (k > 0 && k < 1 ? 1 : 0)); f.g.visible = t >= K("fees_on") - 0.02 && k < 0.98; });
        const g_ = pop(t, K("gauge_on"), 0.5); th.g.visible = t >= K("gauge_on") - 0.02; th.g.scale.setScalar(g_); const fillK = eOut(prog(t, K("gauge_on") + 0.4, 3.2)) * 0.55 + eOut(prog(t, K("thr_on"), 1.6)) * 0.45; th.fill.scale.y = Math.max(0.02, fillK); th.fill.position.y = 0.25; marker.visible = t >= K("thr_on") - 0.02; marker.scale.setScalar(pop(t, K("thr_on"), 0.4));
        inv.forEach((b, i) => { const k = pop(t, K("inv_on") + i * 0.12, 0.35); b.visible = k > 0.01; b.scale.setScalar(k); }); const c1 = eOut(prog(t, K("cost_on"), 0.5)); costBar.scale.y = Math.max(0.001, c1); costBar.visible = c1 > 0.01; const e1 = prog(t, K("enrol_on"), 4.0); enrBar.scale.y = Math.max(0.001, 0.12 + 0.88 * Math.pow(e1, 2.2) * (e1 > 0 ? 1 : 0)) * (t >= K("cost_on") ? 1 : 0.001); enrBar.visible = t >= K("cost_on"); });
