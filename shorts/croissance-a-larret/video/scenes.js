      const arrowUp = (p, x, y, z, col = P.green) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, col, 0.18, mat(col, { roughness: 0.35 })), 0, 0, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(col, { roughness: 0.35 })); hd.rotation.y = Math.PI / 4; hd.position.y = 3.6; hd.castShadow = true; a.add(hd); return a; };
      const barMk = (p, x, z, w, col) => { const b = rb(w, 1, w, col, 0.12, mat(col, { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      function cart(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(2.4, 1.0, 1.6, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0.7, 0); put(g, rb(0.2, 1.4, 0.2, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), -1.3, 0.9, 0); [-0.8, 0.8].forEach((wx) => { const w = cyl(0.3, 0.3, 0.2, "#10181b", 14, mat("#10181b", { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.3, 0.9); g.add(w); const w2 = w.clone(); w2.position.z = -0.9; g.add(w2); }); return g; }
      function container(p, x, y, z, col) { const g = grp(p, x, y, z); put(g, rb(3.2, 1.5, 1.5, col, 0.08, mat(col, { roughness: 0.45, metalness: 0.2 })), 0, 0, 0); for (let i = 0; i < 6; i++) put(g, rb(0.08, 1.4, 1.52, "#0b1220", 0.01, mat("#0b1220")), -1.4 + i * 0.56, 0.05, 0); return g; }
      const stopSign = (p, x, z) => { const g = grp(p, x, 0, z); put(g, rb(0.25, 4.0, 0.25, "#9fb3c8", 0.05, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })), 0, 0, 0); const o = cyl(1.7, 1.7, 0.3, P.red, 8, mat(P.red, { roughness: 0.3 })); o.rotation.x = Math.PI / 2; o.rotation.y = Math.PI / 8; o.position.set(0, 5.0, 0); g.add(o); put(g, rb(2.0, 0.4, 0.12, P.white, 0.04), 0, 4.8, 0.2); return g; };

      /* 1 · hook : three quarters, almost no movement */
      const hH = grp(PL.hook); const flH = rb(15, 0.3, 8, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flH.position.set(0, 0, 0); hH.add(flH);
      const q1 = barMk(hH, -4.4, 0, 2.4, P.red), q2 = barMk(hH, 0, 0, 2.4, P.gold), q3 = barMk(hH, 4.4, 0, 2.4, P.red); const lnH = rb(14, 0.12, 0.3, P.white, 0.04, emis(P.white, 0.8)); lnH.position.set(0, 0.32, 1.8); hH.add(lnH);
      ANCH.hk_q1 = () => V(-4.4, 2.4, 0); ANCH.hk_q2 = () => V(0, 2.0, 0); ANCH.hk_q3 = () => V(4.4, 2.4, 0); wrapAnch(["hk_q1", "hk_q2", "hk_q3"], PL.hook); lampAt(hH, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("hook", hH, t); flH.scale.setScalar(pop(t, 0.1, 0.5)); [[q1, 1.3, TT.q1_on], [q2, 0.3, TT.q2_on], [q3, 0.8, TT.q3_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.5); b.scale.y = Math.max(0.001, h * 1.4 * k); b.visible = k > 0.01; }); lnH.scale.x = pop(t, TT.q3_on + 0.3, 0.6); });

      /* 2 · pib : a quarter of production (coin tower) that shrinks a little */
      const hP = grp(PL.pib); const ofP = office(hP, 4.2, 4.6, 3.4, "#3b4a6b", 1); ofP.position.set(-4.4, 0, -1.0); const ctP = coinTowerMk(hP, 3.8, 0, 14); const adP = arrowDown(hP, 3.8, 6.4, 0);
      ANCH.pb_tower = () => V(3.8, 4.2, 0); ANCH.pb_office = () => V(-4.4, 5.4, -1.0); wrapAnch(["pb_tower", "pb_office"], PL.pib); lampAt(hP, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("pib", hP, t); ofP.scale.setScalar(pop(t, TT.pib_on, 0.6)); coinTowerUpd(ctP, t, TT.tw_on, 0.08); ctP.cs.forEach((c, k) => { if (k >= 12 && t > TT.fall_on) c.visible = false; }); const a = pop(t, TT.fall_on, 0.5); adP.scale.setScalar(a); adP.visible = a > 0.01; adP.position.y = 6.4 + Math.sin(t * 3) * 0.25; });

      /* 3 · conso : households keep spending (+0.4 %) */
      const hK = grp(PL.conso); const prK = [P.sky, P.pink, P.violet, P.green].map((c, i) => person(hK, c, 1.15)); prK.forEach((pp, i) => pp.position.set(-5 + i * 1.7, 0, 1.2)); const ctK = cart(hK, 3.8, 0.4, 1.4); const auK = arrowUp(hK, 0.6, 1.2, -2.6); const flK = flow(hK, 4, 0.3);
      ANCH.cs_hh = () => V(-3.4, 3.4, 1.2); ANCH.cs_cart = () => V(3.8, 3.4, 0.4); wrapAnch(["cs_hh", "cs_cart"], PL.conso); lampAt(hK, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("conso", hK, t); prK.forEach((pp, i) => { const k = pop(t, TT.cons_on + i * 0.12, 0.45); pp.scale.setScalar(1.15 * k); pp.position.y = Math.max(0, Math.sin(t * 3 + i)) * 0.15; }); ctK.scale.setScalar(1.4 * pop(t, TT.cart_on, 0.5)); const a = pop(t, TT.up_on, 0.6); auK.scale.setScalar(a); auK.visible = a > 0.01; flowUpd(flK, t, TT.cart_on + 0.2, 1e9, [-3.4, 2.6, 1.2], [3.8, 2.0, 0.4], 0.45); });

      /* 4 · export : containers and a van, exports fall by 0.6 point */
      const hX2 = grp(PL.export); const cn1 = container(hX2, -3.6, 0, -1.2, "#e0643a"), cn2 = container(hX2, -3.6, 1.55, -1.2, "#3b8ad6"), cn3 = container(hX2, -3.6, 0, 1.0, "#43a98a"); const vnX = van(hX2, "#e8e2d2", 1.2); vnX.position.set(3.6, 0, 1.2); const adX = arrowDown(hX2, 3.6, 6.0, -0.8);
      ANCH.ex_cont = () => V(-3.6, 3.6, -0.2); ANCH.ex_van = () => V(3.6, 3.4, 1.2); wrapAnch(["ex_cont", "ex_van"], PL.export); lampAt(hX2, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("export", hX2, t); [cn1, cn2, cn3].forEach((c, i) => c.scale.setScalar(pop(t, TT.exp_on + i * 0.15, 0.5))); vnX.scale.setScalar(1.2 * pop(t, TT.exp_on + 0.5, 0.5)); vnX.position.x = 3.6 + Math.sin(t * 1.6) * 0.5; const a = pop(t, TT.expdown_on, 0.5); adX.scale.setScalar(a); adX.visible = a > 0.01; adX.position.y = 6.0 + Math.sin(t * 3) * 0.25; });

      /* 5 · voisins : France lags behind Germany (+0.2 %) and Spain (+0.6 %) */
      const hN = grp(PL.voisins); const flN = rb(15, 0.3, 8, "#1b2a44", 0.1, mat("#1b2a44", { roughness: 0.4, metalness: 0.3 })); flN.position.set(0, 0, 0); hN.add(flN); const bFR = barMk(hN, -4.6, 0, 2.4, P.red), bDE = barMk(hN, 0, 0, 2.4, P.gold), bES = barMk(hN, 4.6, 0, 2.4, P.green);
      ANCH.nb_fr = () => V(-4.6, 2.2, 0); ANCH.nb_de = () => V(0, 4.0, 0); ANCH.nb_es = () => V(4.6, 7.6, 0); wrapAnch(["nb_fr", "nb_de", "nb_es"], PL.voisins); lampAt(hN, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("voisins", hN, t); flN.scale.setScalar(pop(t, TT.nb_on, 0.5)); [[bFR, 0.6, TT.nb_on + 0.1], [bDE, 2.2, TT.de_on], [bES, 6.2, TT.es_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); });

      /* 6 · recession : the textbook definition needs two falls in a row; France had a flat quarter in between */
      const hQ = grp(PL.recession); const tile = (p, x, z, col) => { const b = rb(2.6, 0.5, 2.6, col, 0.12, mat(col, { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const dfA = tile(hQ, -1.6, -3.4, P.red), dfB = tile(hQ, 1.6, -3.4, P.red), frA = tile(hQ, -3.6, 3.0, P.red), frB = tile(hQ, 0, 3.0, P.gold), frC = tile(hQ, 3.6, 3.0, P.red); const xQ = cross(hQ, 4.0); xQ.position.set(0, 6.0, 3.0);
      ANCH.rc_def = () => V(0, 2.2, -3.4); ANCH.rc_fr = () => V(0, 2.4, 3.0); wrapAnch(["rc_def", "rc_fr"], PL.recession); lampAt(hQ, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("recession", hQ, t); [[dfA, TT.def_on], [dfB, TT.def_on + 0.3], [frA, TT.fr_on], [frB, TT.flat_on], [frC, TT.fr_on + 0.4]].forEach(([b, t0]) => { const k = pop(t, t0, 0.5); b.scale.setScalar(k); b.visible = k > 0.01; }); const x = pop(t, TT.flat_on + 0.5, 0.5); xQ.scale.setScalar(x); xQ.visible = x > 0.01; });

      /* 7 · ministre : a lectern and a stop sign */
      const hM = grp(PL.ministre); const pdM = put(hM, rb(2.6, 2.0, 1.6, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4 })), -3.4, 0, 0); const pmM = person(hM, P.sky, 1.4); pmM.position.set(-3.4, 2.0, -0.3); const ssM = stopSign(hM, 3.6, 0);
      ANCH.mn_pers = () => V(-3.4, 5.6, 0); ANCH.mn_stop = () => V(3.6, 8.0, 0); wrapAnch(["mn_pers", "mn_stop"], PL.ministre); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("ministre", hM, t); const k = pop(t, TT.min_on, 0.5); pdM.scale.setScalar(k); pmM.scale.setScalar(1.4 * k); const s = pop(t, TT.stop_on, 0.6); ssM.scale.setScalar(s); ssM.visible = s > 0.01; ssM.rotation.z = Math.sin(t * 3) * 0.03 * s; });

      /* 8 · menage : what zero growth means for wages, jobs and public revenue */
      const hY = grp(PL.menage); const ctY = coinTowerMk(hY, -5.0, 0, 8); const prY = [P.sky, P.pink, P.violet].map((c, i) => person(hY, c, 1.1)); prY.forEach((pp, i) => pp.position.set(-1.0 + i * 1.3, 0, 0)); const ofY = office(hY, 3.6, 4.2, 3.0, "#3b4a6b", 1); ofY.position.set(5.0, 0, -0.4); const adY = [arrowDown(hY, -5.0, 6.0, 0), arrowDown(hY, 0.3, 4.4, 0), arrowDown(hY, 5.0, 7.4, -0.4)]; adY.forEach((a) => a.scale.setScalar(0.6));
      ANCH.my_sal = () => V(-5.0, 4.0, 0); ANCH.my_emb = () => V(0.3, 3.2, 0); ANCH.my_etat = () => V(5.0, 5.6, -0.4); wrapAnch(["my_sal", "my_emb", "my_etat"], PL.menage); lampAt(hY, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("menage", hY, t); coinTowerUpd(ctY, t, TT.m_on, 0.08); prY.forEach((pp, i) => { const k = pop(t, TT.m_on + 0.4 + i * 0.12, 0.45); pp.scale.setScalar(1.1 * k); }); ofY.scale.setScalar(pop(t, TT.m_on + 0.7, 0.6)); [TT.sal_on + 0.7, TT.emb_on + 0.6, TT.etat_on + 0.5].forEach((t0, i) => { const a = pop(t, t0, 0.5); adY[i].scale.setScalar(0.6 * a); adY[i].visible = a > 0.01; }); });

      /* 9 · estim : first estimates, to be revised on 27 November */
      const hS = grp(PL.estim); const calS = grp(hS, -3.2, 0, 0); put(calS, rb(4.4, 4.6, 0.5, "#f7f1e6", 0.16, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calS, rb(4.4, 1.0, 0.55, P.red, 0.16, mat(P.red, { roughness: 0.35 })), 0, 3.6, 0); [-1.3, 1.3].forEach((rx) => put(calS, rb(0.2, 0.7, 0.3, "#1b2a44", 0.05), rx, 4.4, 0));
      const shS = [0, 1, 2].map((i) => { const s = rb(3.2, 0.12, 4.2, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })); s.position.set(3.8, i * 0.14, 0.2); s.rotation.y = (i - 1) * 0.18; hS.add(s); return s; }); const pnS = cyl(0.14, 0.14, 2.6, P.gold, 8, mat(P.gold, { roughness: 0.3 })); pnS.rotation.z = Math.PI / 2.6; pnS.position.set(4.2, 0.9, 0.2); hS.add(pnS);
      ANCH.es_cal = () => V(-3.2, 5.6, 0); ANCH.es_sh = () => V(3.8, 1.8, 0.2); wrapAnch(["es_cal", "es_sh"], PL.estim); lampAt(hS, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("estim", hS, t); calS.scale.setScalar(pop(t, TT.est_on, 0.6)); shS.forEach((s, i) => { s.scale.setScalar(pop(t, TT.rev_on + i * 0.1, 0.5)); }); pnS.visible = t >= TT.rev_on; pnS.position.x = 4.2 + Math.sin(t * 4) * 0.3; });

      /* 10 · verdict : every point counts, one coin above the flat stack */
      const hV = grp(PL.verdict); pedestal(hV, 6); const ctV = coinTowerMk(hV, 0, 0, 9); ctV.g.scale.setScalar(1.8); const cnV = coinM(1.6); cnV.rotation.x = Math.PI / 2; cnV.material = emis(P.gold, 1.2); hV.add(cnV);
      ANCH.vr_top = () => V(0, 8.4, 0); wrapAnch(["vr_top"], PL.verdict); lampAt(hV, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("verdict", hV, t); coinTowerUpd(ctV, t, TT.ver_on, 0.06); const k = pop(t, TT.pt_on, 0.6); cnV.scale.setScalar(Math.max(0.001, k)); cnV.visible = k > 0.01; cnV.position.set(0, 4.8 + Math.sin(t * 2.5) * 0.35, 0); cnV.rotation.z = t * 1.5; });

