      const barMk = (p, x, z, w, col, o) => { const b = rb(w, 1, w, col, 0.12, mat(col, o || { roughness: 0.3 })); b.position.set(x, 0, z); p.add(b); return b; };
      const crossX = (p, len = 6) => { const g = grp(p); [0.785, -0.785].forEach((a) => { const q = grp(g); q.rotation.z = a; put(q, rb(0.5, len, 0.5, P.red, 0.1, mat(P.red, { roughness: 0.35 })), 0, -len / 2, 0); }); return g; };
      function ghostPerson(p, x, z, s = 1, op = 0.3) { const g = grp(p, x, 0, z); g.scale.setScalar(s); const m = mat("#ffffff", { roughness: 0.6, transparent: true, opacity: op }); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), m); b.position.y = 0.75; g.add(b); const h = sph(0.24, "#ffffff", 12, m); h.position.y = 1.5; g.add(h); return g; }
      function treadmill(p, x, z) { const g = grp(p, x, 0, z); put(g, rb(2.0, 0.4, 4.0, "#2a2f45", 0.1, mat("#2a2f45", { roughness: 0.4, metalness: 0.4 })), 0, 0, 0); put(g, rb(1.5, 0.12, 3.5, "#10131f", 0.03, mat("#10131f", { roughness: 0.7 })), 0, 0.4, 0); put(g, rb(0.14, 2.0, 0.14, "#9fb3c8", 0.03, mat("#9fb3c8", { roughness: 0.3, metalness: 0.6 })), -0.8, 0.4, -1.7); put(g, rb(0.14, 2.0, 0.14, "#9fb3c8", 0.03, mat("#9fb3c8", { roughness: 0.3, metalness: 0.6 })), 0.8, 0.4, -1.7); put(g, rb(1.8, 0.8, 0.3, "#0b0d18", 0.05, mat("#0b0d18", { roughness: 0.4 })), 0, 2.0, -1.7); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.2 })); sc.position.set(0, 2.4, -1.52); g.add(sc); return g; }
      function sheet(p, x, z, flag) { const g = grp(p, x, 0, z); put(g, rb(1.1, 0.1, 1.4, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); const f = rb(1.1, 0.14, 0.4, P.red, 0.03, mat(P.red, { roughness: 0.35 })); f.position.set(0, 0, -0.5); f.visible = false; g.add(f); return { g, f }; }
      const NPC = [P.sky, P.pink, P.violet, P.green, P.orange];

      /* 1 · salle : a gym that cannot hold all its members at once */
      const hSa = grp(PL.salle); const bdS = office(hSa, 6.4, 4.4, 4.0, "#3b4a6b", 1); bdS.position.set(0, 0, -3.6); const awS = rb(6.8, 0.5, 1.2, P.gold, 0.1, mat(P.gold, { roughness: 0.35 })); awS.position.set(0, 3.2, -1.2); hSa.add(awS); const crS = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const pp = person(hSa, NPC[(r + c) % 5], 1.05); pp.position.set(-4.8 + c * 1.6, 0, 1.6 + r * 1.5); crS.push(pp); }
      ANCH.sa_b = () => V(0, 6.0, -3.6); ANCH.sa_c = () => V(0, 2.6, 3.4); wrapAnch(["sa_b", "sa_c"], PL.salle); lampAt(hSa, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("salle", hSa, t); bdS.scale.setScalar(pop(t, TT.sl_on, 0.6)); awS.scale.setScalar(pop(t, TT.sl_on + 0.2, 0.5)); crS.forEach((pp, i) => { const k = pop(t, TT.cr_on + i * 0.05, 0.4); pp.scale.setScalar(1.05 * k); }); });

      /* 2 · prix : 40 EUR on average, 29 EUR at the cheapest network of the survey */
      const hPr = grp(PL.prix); const bp1 = barMk(hPr, -3.6, 0, 2.8, P.gold), bp2 = barMk(hPr, 3.6, 0, 2.8, P.green);
      ANCH.pr_a = () => V(-3.6, 5.2, 0); ANCH.pr_b = () => V(3.6, 4.1, 0); wrapAnch(["pr_a", "pr_b"], PL.prix); lampAt(hPr, 0, 13, 4, 42, "#c8ffe6");
      upd((t) => { showHero("prix", hPr, t); [[bp1, 4.0, TT.pr_on], [bp2, 2.9, TT.b29_on]].forEach(([b, h, t0]) => { const k = pop(t, t0, 0.6); b.scale.y = Math.max(0.001, h * k); b.visible = k > 0.01; }); });

      /* 3 · club : about 2 900 memberships in one club */
      const hCl = grp(PL.club); const bdC = office(hCl, 5.6, 4.0, 3.6, "#3b4a6b", 1); bdC.position.set(0, 0, -4.4); const crC = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) { const pp = person(hCl, NPC[(r * 3 + c) % 5], 0.62); pp.position.set(-5.4 + c * 1.2, 0, 0.2 + r * 1.0); crC.push(pp); }
      ANCH.cl_b = () => V(0, 5.8, -4.4); ANCH.cl_c = () => V(0, 3.0, 2.0); wrapAnch(["cl_b", "cl_c"], PL.club); lampAt(hCl, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("club", hCl, t); bdC.scale.setScalar(pop(t, TT.cl_on, 0.6)); crC.forEach((pp, i) => { const k = pop(t, TT.cw_on - 0.3 + i * 0.03, 0.35); pp.scale.setScalar(0.62 * k); }); });

      /* 4 · calcul : a rough order of magnitude of about one million EUR a year per club */
      const hCa = grp(PL.calcul); const clcK = grp(hCa, -3.4, 0, 0); put(clcK, rb(3.8, 5.4, 0.9, "#2a2f45", 0.2, mat("#2a2f45", { roughness: 0.4, metalness: 0.4 })), 0, 0, 0); const scK = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.0), new THREE.MeshStandardMaterial({ color: P.green, emissive: P.green, emissiveIntensity: 1.1 })); scK.position.set(0, 4.3, 0.47); clcK.add(scK); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) put(clcK, rb(0.8, 0.5, 0.2, P.cream, 0.05, mat("#e6dccb", { roughness: 0.4 })), -1.0 + c * 1.0, 0.5 + r * 0.7, 0.47);
      const ctCa = coinTowerMk(hCa, 4.0, 0, 22); ctCa.g.scale.setScalar(1.2);
      ANCH.ca_t = () => V(4.0, 6.2, 0); ANCH.ca_c = () => V(-3.4, 6.6, 0); wrapAnch(["ca_t", "ca_c"], PL.calcul); lampAt(hCa, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("calcul", hCa, t); clcK.scale.setScalar(pop(t, TT.ca_on, 0.6)); coinTowerUpd(ctCa, t, TT.ml_on, 0.07); });

      /* 5 · plateau : nobody trains 2 900 at a time, only a small share is present */
      const hPl = grp(PL.plateau); const trs = []; [[-3.8, -2.0], [0, -2.0], [3.8, -2.0], [-3.8, 2.4], [0, 2.4], [3.8, 2.4]].forEach(([x, z]) => trs.push(treadmill(hPl, x, z))); const pr1 = person(hPl, P.green, 1.15); pr1.position.set(-3.8, 0.5, -1.4); const pr2 = person(hPl, P.pink, 1.15); pr2.position.set(3.8, 0.5, 3.0); const gsP = []; for (let i = 0; i < 14; i++) gsP.push(ghostPerson(hPl, -6.2 + (i % 7) * 2.05, -6.4 - Math.floor(i / 7) * 1.3, 1.1, 0.32));
      ANCH.pl_m = () => V(0, 4.2, 0); ANCH.pl_g = () => V(0, 3.4, -6.8); wrapAnch(["pl_m", "pl_g"], PL.plateau); lampAt(hPl, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("plateau", hPl, t); trs.forEach((m, i) => m.scale.setScalar(pop(t, TT.pl_on + i * 0.1, 0.5))); pr1.scale.setScalar(1.15 * pop(t, TT.gh_on, 0.5)); pr2.scale.setScalar(1.15 * pop(t, TT.gh_on + 0.2, 0.5)); gsP.forEach((g, i) => { const k = pop(t, TT.gh_on + 0.2 + i * 0.05, 0.4); g.scale.setScalar(1.1 * Math.max(0.001, k)); g.visible = k > 0.01; }); });

      /* 6 · fantomes : 5 % of this survey's members are ghost members, and the sample is not representative */
      const hFa = grp(PL.fantomes); const prF = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const i = r * 5 + c; const pp = i === 7 ? ghostPerson(hFa, 0, 0, 1.4, 0.35) : person(hFa, P.sky, 1.4); pp.position.set(-4.4 + c * 2.2, 0, -2.6 + r * 2.0); prF.push(pp); }
      const cbF = grp(hFa, 0, 0, -7.4); put(cbF, rb(3.6, 4.4, 0.25, "#cfa56a", 0.1, mat("#cfa56a", { roughness: 0.6 })), 0, 0, 0); put(cbF, rb(3.0, 3.8, 0.1, "#f7f1e6", 0.03, mat("#f7f1e6", { roughness: 0.5 })), 0, 0.3, 0.17); [1.0, 1.9, 2.8].forEach((ly) => put(cbF, rb(2.4, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.24));
      ANCH.fa_g = () => V(-0.0, 3.4, -0.6); ANCH.fa_cb = () => V(0, 5.6, -7.4); wrapAnch(["fa_g", "fa_cb"], PL.fantomes); lampAt(hFa, 0, 13, 4, 42, "#bfe8ff");
      upd((t) => { showHero("fantomes", hFa, t); prF.forEach((pp, i) => { const k = pop(t, TT.fa_on + i * 0.04, 0.4); const s0 = i === 7 ? 1.4 * pop(t, TT.ghost_on - 0.3, 0.5) : 1.4 * k; pp.scale.setScalar(Math.max(0.001, s0)); pp.visible = s0 > 0.01; }); cbF.scale.setScalar(pop(t, TT.cb_on, 0.6)); });

      /* 7 · sanschiffre : no reliable figure on members who never come */
      const hNs = grp(PL.sanschiffre); const bnS = [[-4.0, 3.0], [0, 5.0], [4.0, 4.0]].map(([x, h]) => { const b = barMk(hNs, x, 0, 2.6, "#c9d6e3", { roughness: 0.3, transparent: true, opacity: 0.32 }); b.userData.h = h; return b; }); const xNs = crossX(hNs, 6.0); xNs.position.set(0, 7.0, 0.5);
      ANCH.ns_b = () => V(0, 6.0, 0); wrapAnch(["ns_b"], PL.sanschiffre); lampAt(hNs, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("sanschiffre", hNs, t); bnS.forEach((b, i) => { const k = pop(t, TT.ns_on + i * 0.15, 0.6); b.scale.y = Math.max(0.001, b.userData.h * k); b.visible = k > 0.01; b.material.opacity = 0.28 + 0.1 * Math.sin(t * 3 + i); }); const x = pop(t, TT.x_on, 0.5); xNs.scale.setScalar(x); xNs.visible = x > 0.01; });

      /* 8 · dgccrf : controls found at least one anomaly in over 70 % of the gyms checked; 46 % of contracts had unfair clauses */
      const hDg = grp(PL.dgccrf); const shs = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const o = sheet(hDg, -6.0 + c * 1.5, -1.4 + r * 2.0, true); shs.push(o); }
      const pDg = pieMake(hDg, [[0.46, P.red, { roughness: 0.3 }], [0.54, "#7b8794", { roughness: 0.4 }]], 2.6, 0.4); pDg.g.position.set(4.6, 0, 0.6);
      ANCH.dg_s = () => V(-3.8, 2.6, -0.4); ANCH.dg_p = () => V(4.6, 3.4, 0.6); wrapAnch(["dg_s", "dg_p"], PL.dgccrf); lampAt(hDg, 0, 13, 4, 42, "#ffd9a0");
      upd((t) => { showHero("dgccrf", hDg, t); shs.forEach((o, i) => { const k = pop(t, TT.dg_on + i * 0.06, 0.4); o.g.scale.setScalar(k); const fl = i < 7 && t >= TT.flag_on + i * 0.12; o.f.visible = fl; }); pDg.g.visible = t >= TT.pie_on - 0.05; pDg.g.scale.setScalar(pop(t, TT.pie_on, 0.7)); });

      /* 9 · contrat : check the length, the renewal and the cancellation before signing */
      const hCt = grp(PL.contrat); const docT = grp(hCt, -2.6, 0, 0); put(docT, rb(4.4, 5.6, 0.3, "#f7f1e6", 0.1, mat("#f7f1e6", { roughness: 0.5 })), 0, 0, 0); [1.0, 1.8, 2.6, 3.4, 4.2].forEach((ly) => put(docT, rb(3.2, 0.12, 0.05, "#9fb3c8", 0.01), 0, ly, 0.17)); put(docT, rb(1.6, 0.1, 0.05, P.red, 0.01, mat(P.red)), 0.6, 0.45, 0.17); const pnT = cyl(0.12, 0.12, 2.4, P.gold, 8, mat(P.gold, { roughness: 0.3 })); pnT.rotation.z = Math.PI / 3; pnT.position.set(1.0, 1.0, 0.5); docT.add(pnT); const ckT = clockObj(hCt, 0.9); ckT.g.position.set(4.2, 3.0, 0);
      ANCH.ct_d = () => V(-2.6, 6.4, 0); ANCH.ct_k = () => V(4.2, 5.6, 0); wrapAnch(["ct_d", "ct_k"], PL.contrat); lampAt(hCt, 0, 13, 4, 42, "#bfd0ff");
      upd((t) => { showHero("contrat", hCt, t); docT.scale.setScalar(pop(t, TT.ct_on, 0.6)); ckT.g.scale.setScalar(0.9 * pop(t, TT.clk_on, 0.5)); ckT.h1.rotation.z = -t * 0.8; ckT.h2.rotation.z = -t * 2.4; pnT.position.x = 1.0 + Math.sin(t * 3) * 0.2; });

