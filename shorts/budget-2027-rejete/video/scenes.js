      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const barUpd = (b, h, t, t0) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; };
      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      function docMk(p, x, z, col = "#f7f1e6", o) { const g = grp(p, x, 0, z); const m = mat(col, o || { roughness: 0.5 }); put(g, rb(3.4, 4.4, 0.25, col, 0.1, m), 0, 0, 0); [1.0, 1.8, 2.6, 3.4].forEach((ly) => put(g, rb(2.6, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.15)); return g; }
      function parl(p, x, z, col = "#e6dccb", ghost = false) { const g = grp(p, x, 0, z); const mm = (c, r = 0.5) => ghost ? mat(c, { roughness: r, transparent: true, opacity: 0.3 }) : mat(c, { roughness: r }); put(g, rb(6.4, 0.5, 3.6, col, 0.1, mm(col)), 0, 0, 0); for (let i = 0; i < 5; i++) { const c = cyl(0.3, 0.3, 2.6, col, 14, mm(col)); c.position.set(-2.3 + i * 1.15, 1.8, 0); g.add(c); } put(g, rb(6.0, 0.45, 2.6, col, 0.08, mm(col)), 0, 3.1, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.5, 4), mm(P.gold, 0.4)); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.6); rf.position.y = 4.4; rf.castShadow = true; g.add(rf); return g; }
      function gavel(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(0.45, 3.6, 0.45, "#7b4a22", 0.1, mat("#7b4a22", { roughness: 0.5 })), 0, 0, 0); put(g, rb(2.6, 1.2, 1.2, "#7b4a22", 0.15, mat("#7b4a22", { roughness: 0.4 })), 0, 3.6, 0); put(g, rb(2.7, 0.3, 1.3, P.gold, 0.05, GOLD()), 0, 3.6, 0); put(g, rb(2.7, 0.3, 1.3, P.gold, 0.05, GOLD()), 0, 4.5, 0); return g; }

      /* 1 · vote : 458 deputies against, none in favour */
      const hVt = grp(PL.vote); const arc = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 13; i++) { const a = -1.15 + i * (2.3 / 12); const rad = 5.2 + r * 1.5; const pp = person(hVt, P.red, 1.0); pp.position.set(Math.sin(a) * rad, 0, -Math.cos(a) * rad + 1.6); arc.push(pp); } const bxV = rb(2.4, 1.6, 1.8, "#9fb3c8", 0.12, mat("#9fb3c8", { roughness: 0.3, metalness: 0.5 })); bxV.position.set(0, 0, 3.0); hVt.add(bxV); const slV = rb(1.4, 0.12, 0.2, "#10181b", 0.02, mat("#10181b")); slV.position.set(0, 1.6, 3.0); hVt.add(slV);
      ANCH.vt_arc = () => V(0, 3.6, -3.0); ANCH.vt_box = () => V(0, 2.8, 3.0); wrapAnch(["vt_arc", "vt_box"], PL.vote); lampAt(hVt, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("vote", hVt, t); arc.forEach((pp, i) => { const k = pop(t, TT.vo_on + (i % 13) * 0.05 + Math.floor(i / 13) * 0.2, 0.4); pp.scale.setScalar(Math.max(0.001, k)); pp.visible = k > 0.01; }); bxV.scale.setScalar(pop(t, TT.bx_on, 0.5)); slV.scale.setScalar(pop(t, TT.bx_on, 0.5)); });

      /* 2 · recettes : revenue part rejected, spending part never examined */
      const hRc = grp(PL.recettes); const dR = docMk(hRc, -3.6, 0, "#f7f1e6"); const dD = docMk(hRc, 3.8, 0, "#c9d6e3", { roughness: 0.5, transparent: true, opacity: 0.32 }); const xR = crossX(hRc, 5.0); xR.position.set(-3.6, 4.6, 0.4);
      ANCH.rc_a = () => V(-3.6, 6.2, 0); ANCH.rc_b = () => V(3.8, 5.6, 0); wrapAnch(["rc_a", "rc_b"], PL.recettes); lampAt(hRc, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("recettes", hRc, t); dR.scale.setScalar(pop(t, TT.re_on, 0.6)); const x = pop(t, TT.rej_on, 0.5); xR.scale.setScalar(x); xR.visible = x > 0.01; const k = pop(t, TT.dep_on, 0.6); dD.scale.setScalar(Math.max(0.001, k)); dD.visible = k > 0.01; });

      /* 3 · senat : the government's initial text goes to the Senate */
      const hSe = grp(PL.senat); const dS = docMk(hSe, -4.4, 0, "#f7f1e6"); const sc2 = [0, 1, 2].map((i) => { const l = rb(2.6, 0.1, 0.06, P.red, 0.01, mat(P.red)); l.position.set(-4.4 + (i - 1) * 0.2, 1.2 + i * 0.9, 0.17); l.rotation.z = 0.25 * (i - 1); hSe.add(l); return l; }); const sbS = parl(hSe, 3.6, 0, "#e6dccb"); const flS = flow(hSe, 4, 0.3);
      ANCH.se_doc = () => V(-4.4, 5.6, 0); ANCH.se_sen = () => V(3.6, 6.8, 0); wrapAnch(["se_doc", "se_sen"], PL.senat); lampAt(hSe, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("senat", hSe, t); dS.scale.setScalar(pop(t, TT.se_on, 0.6)); sc2.forEach((l, i) => { const k = pop(t, TT.tr_on + i * 0.15, 0.4); l.scale.setScalar(Math.max(0.001, k)); l.visible = k > 0.01; }); sbS.scale.setScalar(pop(t, TT.sn_on, 0.6)); flowUpd(flS, t, TT.sn_on + 0.3, 1e9, [-4.4, 3.0, 0], [3.6, 2.4, 0], 0.4); });

      /* 4 · cible : deficit 5.4 % expected in 2026, 5 % targeted in 2027 */
      const hCb = grp(PL.cible); const b26 = barMk(hCb, -3.6, 0, 2.8, P.gold), b27 = barMk(hCb, 3.6, 0, 2.8, P.green);
      ANCH.cb_26 = () => V(-3.6, 8.8, 0); ANCH.cb_27 = () => V(3.6, 8.2, 0); wrapAnch(["cb_26", "cb_27"], PL.cible); lampAt(hCb, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("cible", hCb, t); barUpd(b27, 7.5, t, TT.b27_on); barUpd(b26, 8.1, t, TT.b26_on); });

      /* 5 · virtuel : the amended text would have meant 5.9 % (20.7 billion more), a figure the left disputes */
      const hVr = grp(PL.virtuel); const bv1 = barMk(hVr, -4.4, 0, 2.6, P.green), bv2 = barMk(hVr, 0.4, 0, 2.6, P.red, { roughness: 0.3, transparent: true, opacity: 0.45 }); const ctV = coinTowerMk(hVr, 5.0, 0, 10); ctV.g.scale.setScalar(1.2);
      ANCH.vr_a = () => V(-4.4, 8.4, 0); ANCH.vr_b = () => V(0.4, 9.6, 0); ANCH.vr_c = () => V(5.0, 3.6, 0); wrapAnch(["vr_a", "vr_b", "vr_c"], PL.virtuel); lampAt(hVr, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("virtuel", hVr, t); barUpd(bv1, 7.5, t, TT.vr_on); barUpd(bv2, 8.85, t, TT.v59_on); bv2.material.opacity = 0.35 + 0.12 * Math.sin(t * 3); coinTowerUpd(ctV, t, TT.mi_on, 0.08); });

      /* 6 · navette : the two chambers must try to agree */
      const hNv = grp(PL.navette); const pa = parl(hNv, -4.2, 0, "#e6dccb"); const pb = parl(hNv, 4.2, 0, "#cfd6dd"); pa.scale.setScalar(0.7); pb.scale.setScalar(0.7); const f1 = flow(hNv, 4, 0.28), f2 = flow(hNv, 4, 0.28);
      ANCH.nv_a = () => V(-4.2, 5.6, 0); ANCH.nv_b = () => V(4.2, 5.6, 0); wrapAnch(["nv_a", "nv_b"], PL.navette); lampAt(hNv, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("navette", hNv, t); pa.scale.setScalar(0.7 * pop(t, TT.na_on, 0.5)); pb.scale.setScalar(0.7 * pop(t, TT.na_on + 0.2, 0.5)); flowUpd(f1, t, TT.na2_on, 1e9, [-4.2, 3.2, 0.6], [4.2, 3.2, 0.6], 0.4); flowUpd(f2, t, TT.na2_on + 0.4, 1e9, [4.2, 2.4, -0.6], [-4.2, 2.4, -0.6], 0.4); });

      /* 7 · article : the 49.3 and the risk of a censure motion */
      const hAr = grp(PL.article); const gvA = gavel(hAr, -3.6, 0); const dA = docMk(hAr, 3.6, 0, "#f7f1e6"); const mcA = docMk(hAr, 3.6, -3.4, "#f4c7c3"); mcA.scale.setScalar(0.7); const xA = crossX(hAr, 3.0); xA.position.set(3.6, 4.0, -3.2);
      ANCH.ar_g = () => V(-3.6, 6.4, 0); ANCH.ar_c = () => V(3.6, 5.8, -3.4); wrapAnch(["ar_g", "ar_c"], PL.article); lampAt(hAr, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("article", hAr, t); gvA.scale.setScalar(pop(t, TT.g_on, 0.5)); gvA.rotation.z = -0.5 * Math.max(0, Math.sin(t * 4)) * pop(t, TT.g_on + 0.4, 0.3); dA.scale.setScalar(pop(t, TT.ar_on, 0.5)); const k = pop(t, TT.ce_on, 0.5); mcA.scale.setScalar(0.7 * Math.max(0.001, k)); mcA.visible = k > 0.01; const x = pop(t, TT.ce_on + 0.2, 0.5); xA.scale.setScalar(x); xA.visible = x > 0.01; });

      /* 8 · delai : 70 days expire on 17 December, then an ordinance */
      const hDl = grp(PL.delai); const calD = grp(hDl, -3.4, 0, 0); put(calD, rb(4.2, 4.4, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calD, rb(4.2, 1.0, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 3.4, 0); const ckD = clockObj(hDl, 0.8); ckD.g.position.set(3.2, 3.2, -1.0); const orD = docMk(hDl, 3.4, 1.6, "#f7f1e6"); orD.scale.setScalar(0.8); put(orD, rb(2.4, 0.5, 0.1, P.red, 0.05, mat(P.red)), 0, 0.5, 0.2);
      ANCH.dl_cal = () => V(-3.4, 5.8, 0); ANCH.dl_ord = () => V(3.4, 4.6, 1.6); wrapAnch(["dl_cal", "dl_ord"], PL.delai); lampAt(hDl, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("delai", hDl, t); calD.scale.setScalar(pop(t, TT.de_on, 0.6)); ckD.g.scale.setScalar(0.8 * pop(t, TT.cal_on - 0.8, 0.5)); ckD.h1.rotation.z = -t * 0.8; ckD.h2.rotation.z = -t * 2.4; orD.scale.setScalar(0.8 * pop(t, TT.or_on, 0.5)); });

      /* 9 · douziemes : without a budget, one twelfth of last year's budget each month */
      const hDz = grp(PL.douziemes); const pdz = pieMake(hDz, [[1 / 12, P.gold, { roughness: 0.25 }], [11 / 12, "#7b8794", { roughness: 0.4 }]], 3.6, 0.4); pdz.g.position.set(-1.6, 0, 0); const ctz = coinTowerMk(hDz, 5.0, 0, 6);
      ANCH.dz_p = () => V(-1.6, 3.6, 0); ANCH.dz_c = () => V(5.0, 2.6, 0); wrapAnch(["dz_p", "dz_c"], PL.douziemes); lampAt(hDz, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("douziemes", hDz, t); pdz.g.visible = t >= TT.do_on - 0.05; pdz.g.scale.setScalar(pop(t, TT.do_on, 0.7)); coinTowerUpd(ctz, t, TT.un_on, 0.12); });

      /* 10 · inconnu : the Senate vote is not known */
      const hIn = grp(PL.inconnu); const gp = parl(hIn, 0, 0, "#cfd6dd", true); const ckI = clockObj(hIn, 0.8); ckI.g.position.set(0, 7.4, 0);
      ANCH.in_s = () => V(0, 8.6, 0); wrapAnch(["in_s"], PL.inconnu); lampAt(hIn, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("inconnu", hIn, t); const k = pop(t, TT.in_on, 0.6); gp.scale.setScalar(Math.max(0.001, k)); gp.visible = k > 0.01; ckI.g.scale.setScalar(0.8 * pop(t, TT.in_on + 0.4, 0.5)); ckI.h1.rotation.z = -t * 0.8; ckI.h2.rotation.z = -t * 2.4; });

      /* 11 · retenez : the State keeps running, spending decisions become uncertain */
      const hRt = grp(PL.retenez); const ofR = office(hRt, 4.6, 4.6, 3.4, "#3b4a6b", 1); ofR.position.set(-3.8, 0, 0); const prR = [P.sky, P.pink, P.violet].map((c, i) => person(hRt, c, 1.2)); prR.forEach((pp, i) => pp.position.set(2.2 + i * 1.4, 0, 1.0)); const fwR = flow(hRt, 4, 0.3); const ghR = grp(hRt, 5.6, 0, -2.4); const gR = []; for (let k = 0; k < 7; k++) { const c = cyl(1.0, 1.0, 0.14, P.gold, 24, mat(P.gold, { roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.3 })); c.position.y = 0.1 + k * 0.17; ghR.add(c); gR.push(c); }
      ANCH.rt_off = () => V(-3.8, 6.2, 0); ANCH.rt_gh = () => V(5.6, 2.8, -2.4); wrapAnch(["rt_off", "rt_gh"], PL.retenez); lampAt(hRt, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("retenez", hRt, t); ofR.scale.setScalar(pop(t, TT.rt_on, 0.6)); prR.forEach((pp, i) => pp.scale.setScalar(1.2 * pop(t, TT.rt_on + 0.3 + i * 0.12, 0.4))); flowUpd(fwR, t, TT.st_on, 1e9, [-3.8, 3.0, 0], [3.0, 1.8, 1.0], 0.4); const k = pop(t, TT.inc_on, 0.6); ghR.scale.setScalar(Math.max(0.001, k)); ghR.visible = k > 0.01; gR.forEach((c, i) => { c.material.opacity = 0.22 + 0.12 * Math.sin(t * 3 + i * 0.5); }); });

