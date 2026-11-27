      const arrowUp = (p, x, y, z, col = P.green) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, col, 0.18, mat(col, { roughness: 0.35 })), 0, 0, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(col, { roughness: 0.35 })); hd.rotation.y = Math.PI / 4; hd.position.y = 3.6; hd.castShadow = true; a.add(hd); return a; };
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const barUpd = (b, h, t, t0) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; };
      const flame = (p, x, y, z, s = 1) => { const g = grp(p, x, y, z); g.scale.setScalar(s); const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 12), emis(P.orange, 1.4)); c1.position.y = 1.3; g.add(c1); const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 12), emis(P.gold, 1.6)); c2.position.y = 0.8; g.add(c2); return g; };
      function pump(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(1.9, 4.2, 1.5, P.red, 0.18, mat(P.red, { roughness: 0.35 })), 0, 0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.2 })); sc.position.set(0, 3.2, 0.77); g.add(sc); const hs = cyl(0.14, 0.14, 2.4, "#10181b", 8, mat("#10181b", { roughness: 0.6 })); hs.rotation.z = Math.PI / 2; hs.position.set(1.3, 1.6, 0); g.add(hs); return g; }

      /* 1 · thermo : inflation 3.4 %, driven by energy */
      const hTh = grp(PL.thermo); const tbT = cyl(0.55, 0.55, 8.4, "#e8f2f7", 18, mat("#e8f2f7", { roughness: 0.2, transparent: true, opacity: 0.45 })); tbT.position.set(-1.8, 4.6, 0); hTh.add(tbT); const bbT = sph(1.1, P.red, 18, mat(P.red, { roughness: 0.3 })); bbT.position.set(-1.8, 0.6, 0); hTh.add(bbT); const flT = rb(0.5, 1, 0.5, P.red, 0.2, mat(P.red, { roughness: 0.3 })); flT.position.set(-1.8, 0.6, 0); hTh.add(flT); [0, 1, 2, 3, 4, 5, 6].forEach((i) => put(hTh, rb(0.9, 0.08, 0.1, "#9fb3c8", 0.01), -0.7, 1.4 + i * 1.0, 0)); const fmT = flame(hTh, 4.4, 0, 0, 1.2);
      ANCH.th_t = () => V(-1.8, 9.6, 0); ANCH.th_f = () => V(4.4, 4.2, 0); wrapAnch(["th_t", "th_f"], PL.thermo); lampAt(hTh, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("thermo", hTh, t); const k = pop(t, TT.th_on, 0.6); bbT.scale.setScalar(Math.max(0.001, k)); bbT.visible = k > 0.01; tbT.scale.set(1, Math.max(0.001, k), 1); tbT.visible = k > 0.01; const f = eInOut(prog(t, TT.th_on + 0.3, 1.2)); flT.scale.y = Math.max(0.001, 6.8 * f); flT.visible = f > 0.01; const s = pop(t, TT.fl_on, 0.5); fmT.scale.setScalar(1.2 * s); fmT.visible = s > 0.01; fmT.rotation.y = t * 1.5; });

      /* 2 · mois : September 3.1 %, October 3.4 % */
      const hMo = grp(PL.mois); const bm1 = barMk(hMo, -3.6, 0, 2.8, P.gold), bm2 = barMk(hMo, 3.6, 0, 2.8, P.red);
      ANCH.mo_a = () => V(-3.6, 6.4, 0); ANCH.mo_b = () => V(3.6, 7.0, 0); wrapAnch(["mo_a", "mo_b"], PL.mois); lampAt(hMo, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("mois", hMo, t); barUpd(bm2, 6.1, t, TT.b_oct); barUpd(bm1, 5.6, t, TT.b_sep); });

      /* 3 · energie : energy +21.3 % then +24.1 % */
      const hEn = grp(PL.energie); const be1 = barMk(hEn, -3.6, 0, 2.8, P.gold), be2 = barMk(hEn, 3.6, 0, 2.8, P.red); const fe = flame(hEn, 3.6, 7.0, 0, 0.9);
      ANCH.en_a = () => V(-3.6, 6.4, 0); ANCH.en_b = () => V(3.6, 10.2, 0); wrapAnch(["en_a", "en_b"], PL.energie); lampAt(hEn, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("energie", hEn, t); barUpd(be2, 6.0, t, TT.e_oct); barUpd(be1, 5.3, t, TT.e_sep); const s = pop(t, TT.e_oct + 0.4, 0.5); fe.scale.setScalar(0.9 * s); fe.visible = s > 0.01; fe.rotation.y = t * 1.5; });

      /* 4 · detail : oil +38.5 %, gas +27.1 %, electricity +2.7 % */
      const hDe = grp(PL.detail); const bp = barMk(hDe, -4.8, 0, 2.4, "#2a2f45", { roughness: 0.3, metalness: 0.4 }), bg = barMk(hDe, 0, 0, 2.4, P.orange), bl = barMk(hDe, 4.8, 0, 2.4, P.green);
      ANCH.de_p = () => V(-4.8, 7.4, 0); ANCH.de_g = () => V(0, 5.4, 0); ANCH.de_e = () => V(4.8, 1.8, 0); wrapAnch(["de_p", "de_g", "de_e"], PL.detail); lampAt(hDe, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("detail", hDe, t); barUpd(bp, 6.5, t, TT.pe_on); barUpd(bg, 4.6, t, TT.ga_on); barUpd(bl, 0.5, t, TT.el_on); });

      /* 5 · poids : energy is 7.6 % of the basket, about 1.8 points of the 3.4 */
      const hPo = grp(PL.poids); const pyP = pieMake(hPo, [[0.076, P.gold, { roughness: 0.25 }], [0.924, "#7b8794", { roughness: 0.4 }]], 3.2, 0.4); pyP.g.position.set(-4.2, 0, 0); const cgP = grp(hPo, 4.2, 0, 0); const sgA = rb(2.8, 1, 2.8, "#7b8794", 0.1, mat("#7b8794", { roughness: 0.35 })), sgB = rb(2.8, 1, 2.8, P.red, 0.1, mat(P.red, { roughness: 0.3 })); cgP.add(sgA); cgP.add(sgB);
      ANCH.po_pie = () => V(-4.2, 3.6, 0); ANCH.po_col = () => V(4.2, 6.4, 0); wrapAnch(["po_pie", "po_col"], PL.poids); lampAt(hPo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("poids", hPo, t); pyP.g.visible = t >= TT.po_on - 0.05; pyP.g.scale.setScalar(pop(t, TT.po_on, 0.7)); const k1 = pop(t, TT.col_on, 0.6), k2 = pop(t, TT.col_on + 0.3, 0.6); sgA.scale.y = Math.max(0.001, 2.5 * k1); sgA.visible = k1 > 0.01; sgB.position.y = 2.5 * k1; sgB.scale.y = Math.max(0.001, 2.94 * k2); sgB.visible = k2 > 0.01; });

      /* 6 · calme : food +1.2 %, services +2.6 %, manufactured goods -0.2 % */
      const hCa = grp(PL.calme); const bf = barMk(hCa, -5.0, 0, 2.4, P.green), bs = barMk(hCa, -0.2, 0, 2.4, P.blue), bmn = barMk(hCa, 4.6, 0, 2.4, P.red);
      ANCH.ca_f = () => V(-5.0, 3.4, 0); ANCH.ca_s = () => V(-0.2, 5.6, 0); ANCH.ca_m = () => V(4.6, 1.8, 0); wrapAnch(["ca_f", "ca_s", "ca_m"], PL.calme); lampAt(hCa, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("calme", hCa, t); barUpd(bf, 1.9, t, TT.fo_on); barUpd(bs, 4.2, t, TT.sv_on); barUpd(bmn, 0.4, t, TT.mf_on); });

      /* 7 · sousjacente : headline 3.4 % against core 1.7 % */
      const hSo = grp(PL.sousjacente); const bh = barMk(hSo, -3.6, 0, 2.8, P.red), bc = barMk(hSo, 3.6, 0, 2.8, P.green);
      ANCH.so_h = () => V(-3.6, 6.8, 0); ANCH.so_c = () => V(3.6, 4.0, 0); wrapAnch(["so_h", "so_c"], PL.sousjacente); lampAt(hSo, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("sousjacente", hSo, t); barUpd(bh, 5.4, t, TT.so_on); barUpd(bc, 2.7, t, TT.sj_on); });

      /* 8 · vous : fuel, gas and the energy bill */
      const hVo = grp(PL.vous); const pmV = pump(hVo, -3.6, 0); const vnV = van(hVo, "#e8e2d2", 1.2); vnV.position.set(3.8, 0, 1.0); const fwV = flow(hVo, 4, 0.3); const fgV = flame(hVo, 3.8, 3.6, -1.6, 0.8);
      ANCH.vo_pump = () => V(-3.6, 5.2, 0); ANCH.vo_bill = () => V(3.8, 6.0, 0); wrapAnch(["vo_pump", "vo_bill"], PL.vous); lampAt(hVo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("vous", hVo, t); pmV.scale.setScalar(pop(t, TT.pu_on, 0.5)); vnV.scale.setScalar(1.2 * pop(t, TT.pu_on + 0.2, 0.5)); const s = pop(t, TT.gz_on, 0.5); fgV.scale.setScalar(0.8 * s); fgV.visible = s > 0.01; fgV.rotation.y = t * 1.5; flowUpd(fwV, t, TT.fa_on, 1e9, [3.8, 2.4, 1.0], [-3.6, 3.0, 0], 0.45); });

      /* 9 · calendrier : the November estimate is published on 27 November */
      const hCl = grp(PL.calendrier); const calC = grp(hCl, -2.6, 0, 0); put(calC, rb(4.4, 4.6, 0.45, "#f7f1e6", 0.14, mat("#f7f1e6", { roughness: 0.4 })), 0, 0, 0); put(calC, rb(4.4, 1.0, 0.5, P.red, 0.14, mat(P.red, { roughness: 0.35 })), 0, 3.6, 0); [-1.3, 1.3].forEach((rx) => put(calC, rb(0.2, 0.7, 0.3, "#1b2a44", 0.05), rx, 4.4, 0)); const ckC = clockObj(hCl, 0.9); ckC.g.position.set(4.2, 3.0, 0);
      ANCH.cl_cal = () => V(-2.6, 6.2, 0); ANCH.cl_ck = () => V(4.2, 5.6, 0); wrapAnch(["cl_cal", "cl_ck"], PL.calendrier); lampAt(hCl, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("calendrier", hCl, t); calC.scale.setScalar(pop(t, TT.cl_on, 0.6)); ckC.g.scale.setScalar(0.9 * pop(t, TT.ck_on, 0.5)); ckC.h1.rotation.z = -t * 0.8; ckC.h2.rotation.z = -t * 2.4; });

      /* 10 · retenez : huge gaps between products */
      const hRe = grp(PL.retenez); const hts = [6.2, 4.3, 0.45, 0.2, 0.15], cls = [P.orange, "#2a6fd6", P.green, P.gold, P.red]; const brs = hts.map((h, i) => barMk(hRe, -5.4 + i * 2.7, 0, 1.8, cls[i]));
      ANCH.re_all = () => V(0, 7.6, 0); wrapAnch(["re_all"], PL.retenez); lampAt(hRe, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("retenez", hRe, t); brs.forEach((b, i) => barUpd(b, hts[i], t, TT.re_on + i * 0.12)); });

