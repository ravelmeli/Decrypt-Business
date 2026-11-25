      const arrowUp = (p, x, y, z, col = P.green) => { const a = grp(p, x, y, z); put(a, rb(0.9, 2.8, 0.9, col, 0.18, mat(col, { roughness: 0.35 })), 0, 0, 0); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), mat(col, { roughness: 0.35 })); hd.rotation.y = Math.PI / 4; hd.position.y = 3.6; hd.castShadow = true; a.add(hd); return a; };
      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      function pod(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); const b = sph(1.0, "#e0872a", 16, mat("#e0872a", { roughness: 0.5 })); b.scale.set(1, 1.5, 1); b.position.y = 1.5; g.add(b); for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 6, 20), mat("#b8641a", { roughness: 0.6 })); r.rotation.y = i * 0.52; r.scale.set(1, 1.5, 1); r.position.y = 1.5; g.add(r); } put(g, cyl(0.12, 0.18, 0.5, "#6b4a1e", 8, mat("#6b4a1e", { roughness: 0.8 })), 0, 2.9, 0); return g; }
      function choco(p, x, z, s = 1) { const g = grp(p, x, 0, z); g.scale.setScalar(s); put(g, rb(5.2, 6.6, 0.7, "#5a3a24", 0.12, mat("#5a3a24", { roughness: 0.4 })), 0, 0, 0); [-0.87, 0.87].forEach((lx) => put(g, rb(0.1, 6.6, 0.05, "#3b2415", 0.01, mat("#3b2415")), lx, 0, 0.37)); [1.65, 3.3, 4.95].forEach((ly) => put(g, rb(5.2, 0.1, 0.05, "#3b2415", 0.01, mat("#3b2415")), 0, ly, 0.37)); put(g, rb(1.6, 1.0, 0.08, P.gold, 0.05, GOLD()), 1.6, 5.4, 0.4); return g; }
      function stackCol(p, x, z, segs, w, k) { const g = grp(p, x, 0, z); let y = 0; const out = segs.map(([h, col]) => { const b = rb(w, h * k, w, col, 0.08, mat(col, { roughness: 0.3 })); b.position.y = y; g.add(b); const o = { b, y0: y, h: h * k }; y += h * k; return o; }); return { g, out, top: y }; }
      const stackUpd = (o, t, t0) => { const k = pop(t, t0, 0.5); o.b.scale.y = Math.max(0.001, k); o.b.visible = k > 0.01; };

      /* 1 · tablette : chocolate is a big business, the farmer gets one coin */
      const hT = grp(PL.tablette); const chT = choco(hT, -5.0, 0, 1); const ctT = coinTowerMk(hT, 0.4, 0, 22); ctT.g.scale.setScalar(1.1); const pdT = pod(hT, 5.2, 0, 1.2); const cnT = coinM(0.7); cnT.position.set(5.2, 0.15, 2.4); hT.add(cnT);
      ANCH.tb_tow = () => V(0.4, 5.6, 0); ANCH.tb_pod = () => V(5.2, 5.6, 0); wrapAnch(["tb_tow", "tb_pod"], PL.tablette); lampAt(hT, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("tablette", hT, t); chT.scale.setScalar(pop(t, TT.bar_on, 0.6)); coinTowerUpd(ctT, t, TT.tow_on, 0.06); pdT.scale.setScalar(1.2 * pop(t, TT.pod_on, 0.5)); const k = pop(t, TT.coin_on, 0.5); cnT.scale.setScalar(Math.max(0.001, k)); cnT.visible = k > 0.01; });

      /* 2 · part : about 11 % (dark) and 7 % (milk) go to the farmer */
      const hP = grp(PL.part); const p1 = pieMake(hP, [[0.11, P.gold, { roughness: 0.25 }], [0.89, "#5a3a24", { roughness: 0.4 }]], 3.3, 0.4); p1.g.position.set(-4.3, 0, 0); const p2 = pieMake(hP, [[0.07, P.gold, { roughness: 0.25 }], [0.93, "#c9a27a", { roughness: 0.4 }]], 3.3, 0.4); p2.g.position.set(4.3, 0, 0);
      ANCH.pt_p1 = () => V(-4.3, 3.6, 0); ANCH.pt_p2 = () => V(4.3, 3.6, 0); wrapAnch(["pt_p1", "pt_p2"], PL.part); lampAt(hP, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("part", hP, t); p1.g.visible = t >= TT.pie1_on - 0.05; p1.g.scale.setScalar(pop(t, TT.pie1_on, 0.7)); p2.g.visible = t >= TT.pie2_on - 0.05; p2.g.scale.setScalar(pop(t, TT.pie2_on, 0.7)); });

      /* 3 · kilo : one kilo of dark chocolate, 9.32 EUR, stacked by link of the chain */
      const hK = grp(PL.kilo); const skK = stackCol(hK, 0, 0, [[1.05, P.gold], [0.68, P.orange], [0.54, P.violet], [3.45, P.blue], [3.44, P.red], [0.16, P.gray]], 3.2, 0.72);
      ANCH.sg_cu = () => V(2.2, 0.9, 0); ANCH.sg_fa = () => V(2.2, 3.6, 0); ANCH.sg_di = () => V(2.2, 6.0, 0); wrapAnch(["sg_cu", "sg_fa", "sg_di"], PL.kilo); lampAt(hK, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("kilo", hK, t); const ts = [TT.cu_on, TT.cu_on + 0.3, TT.cu_on + 0.6, TT.fa_on, TT.di_on, TT.di_on + 0.4]; skK.out.forEach((o, i) => stackUpd(o, t, ts[i])); });

      /* 4 · marques : brands and retailers take about 70 % of the value and 90 % of the margins */
      const hM = grp(PL.marques); const sv = stackCol(hM, -3.4, 0, [[3, P.gold], [7, P.red]], 3.0, 0.7), sm = stackCol(hM, 3.4, 0, [[1, P.gold], [9, P.red]], 3.0, 0.7);
      ANCH.mq_val = () => V(-3.4, 8.0, 0); ANCH.mq_mar = () => V(3.4, 8.0, 0); wrapAnch(["mq_val", "mq_mar"], PL.marques); lampAt(hM, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("marques", hM, t); stackUpd(sv.out[0], t, TT.mq_on); stackUpd(sv.out[1], t, TT.va_on - 0.3); stackUpd(sm.out[0], t, TT.mq_on + 0.3); stackUpd(sm.out[1], t, TT.ma_on - 0.3); });

      /* 5 · pays : less than 19 % of the value stays in the producing countries */
      const hY = grp(PL.pays); const pyY = pieMake(hY, [[0.186, P.gold, { roughness: 0.25 }], [0.814, "#7b8794", { roughness: 0.4 }]], 3.6, 0.4); pyY.g.position.set(-2.4, 0, 0); const pdY = pod(hY, 4.8, 0, 1.3);
      ANCH.py_pie = () => V(-2.4, 3.8, 0); ANCH.py_pod = () => V(4.8, 5.4, 0); wrapAnch(["py_pie", "py_pod"], PL.pays); lampAt(hY, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("pays", hY, t); pdY.scale.setScalar(1.3 * pop(t, TT.pa_on, 0.5)); pyY.g.visible = t >= TT.pi_on - 0.05; pyY.g.scale.setScalar(pop(t, TT.pi_on, 0.7)); });

      /* 6 · twist : the world price falls, the value kept by brands and retailers keeps growing */
      const hW = grp(PL.twist); const ctL = coinTowerMk(hW, -4.4, 0, 14); ctL.g.scale.setScalar(1.4); const ctR = coinTowerMk(hW, 4.4, 0, 16); ctR.g.scale.setScalar(1.4); const adL = arrowDown(hW, -4.4, 8.6, 0), auR = arrowUp(hW, 4.4, 6.6, 0);
      ANCH.tw_l = () => V(-4.4, 10.6, 0); ANCH.tw_r = () => V(4.4, 9.6, 0); wrapAnch(["tw_l", "tw_r"], PL.twist); lampAt(hW, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("twist", hW, t); coinTowerUpd(ctL, t, TT.tw_on, 0.07); ctL.cs.forEach((c, k) => { if (k >= 9 && t > TT.drop_on) c.visible = false; }); coinTowerUpd(ctR, t, TT.tw_on + 0.3, 0.05); ctR.cs.forEach((c, k) => { if (k >= 11) { const p0 = prog(t, TT.up2_on + (k - 11) * 0.18, 0.3); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; } });
        const a = pop(t, TT.drop_on, 0.5); adL.scale.setScalar(a); adL.visible = a > 0.01; adL.position.y = 8.6 + Math.sin(t * 3) * 0.25; const b = pop(t, TT.up2_on, 0.5); auR.scale.setScalar(b); auR.visible = b > 0.01; auR.position.y = 6.6 + Math.sin(t * 3) * 0.25; });

      /* 7 · cours : about 12 000 USD per tonne, then about 5 000; Cote d'Ivoire's farmgate price */
      const hCo = grp(PL.cours); const bc1 = barMk(hCo, -5.2, 0, 2.2, P.gold), bc2 = barMk(hCo, -1.8, 0, 2.2, P.red); const skC = rb(2.4, 2.6, 1.6, "#b8916a", 0.4, mat("#b8916a", { roughness: 0.9 })); skC.position.set(3.0, 0, 0); hCo.add(skC); const ctC = coinTowerMk(hCo, 6.0, 0, 9); const adC = arrowDown(hCo, -3.5, 6.8, 0); adC.scale.setScalar(0.7);
      ANCH.cr_b1 = () => V(-5.2, 6.8, 0); ANCH.cr_b2 = () => V(-1.8, 4.2, 0); ANCH.cr_sk = () => V(3.8, 4.4, 0); wrapAnch(["cr_b1", "cr_b2", "cr_sk"], PL.cours); lampAt(hCo, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("cours", hCo, t); [[bc1, 6.0, TT.c12_on], [bc2, 2.5, TT.c5_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); const a = pop(t, TT.c5_on, 0.5); adC.scale.setScalar(0.7 * a); adC.visible = a > 0.01; const s = pop(t, TT.civ_on, 0.5); skC.scale.setScalar(s); coinTowerUpd(ctC, t, TT.civ_on + 0.3, 0.1); });

      /* 8 · revenu : a higher price does not tell what a farmer earns */
      const hR = grp(PL.revenu); const frR = person(hR, P.green, 1.7); frR.position.set(-3.6, 0, 0); const pdR = [0, 1, 2].map((i) => pod(hR, -0.6 + i * 1.5, 2.6 - i * 0.4, 0.55)); const ghR = grp(hR, 4.4, 0, 0); const gR = []; for (let k = 0; k < 9; k++) { const c = cyl(1.2, 1.2, 0.14, P.gold, 24, mat(P.gold, { roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.3 })); c.position.y = 0.1 + k * 0.17; ghR.add(c); gR.push(c); }
      ANCH.rv_gh = () => V(4.4, 3.2, 0); ANCH.rv_fr = () => V(-3.6, 4.4, 0); wrapAnch(["rv_gh", "rv_fr"], PL.revenu); lampAt(hR, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("revenu", hR, t); frR.scale.setScalar(1.7 * pop(t, TT.rv_on, 0.5)); pdR.forEach((p, i) => p.scale.setScalar(0.55 * pop(t, TT.rv_on + 0.3 + i * 0.15, 0.4))); const k = pop(t, TT.gh2_on, 0.6); ghR.scale.setScalar(Math.max(0.001, k)); ghR.visible = k > 0.01; gR.forEach((c, i) => { c.material.opacity = 0.22 + 0.12 * Math.sin(t * 3 + i * 0.5); }); });

      /* 9 · retenez : the cocoa weighs far less than manufacturing, brand and distribution */
      const hB = grp(PL.retenez); const baB = rb(1.4, 2.2, 1.4, "#3b4a6b", 0.12, mat("#3b4a6b", { roughness: 0.4 })); hB.add(baB); const bmB = grp(hB, 0, 2.4, 0); put(bmB, rb(11, 0.35, 1.2, "#cfd6dd", 0.1, mat("#cfd6dd", { roughness: 0.3, metalness: 0.5 })), 0, -0.17, 0); const pdB = pod(bmB, -4.4, 0, 0.7); pdB.position.y = 0.2; const hvB = grp(bmB, 4.0, 0.2, 0); [["#2a6fd6", 0], ["#e8483c", 1.2], ["#9fb3c8", 2.4]].forEach(([c, y]) => put(hvB, rb(2.6, 1.1, 2.4, c, 0.1, mat(c, { roughness: 0.35 })), 0, y, 0));
      ANCH.sc_l = () => V(-4.4, 5.6, 0); ANCH.sc_r = () => V(4.0, 4.6, 0); wrapAnch(["sc_l", "sc_r"], PL.retenez); lampAt(hB, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("retenez", hB, t); baB.scale.setScalar(pop(t, TT.sc_on, 0.5)); bmB.scale.setScalar(pop(t, TT.sc_on, 0.5)); bmB.rotation.z = -0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); pdB.rotation.z = 0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); hvB.rotation.z = 0.22 * eInOut(prog(t, TT.sc_on + 0.4, 0.9)); });

