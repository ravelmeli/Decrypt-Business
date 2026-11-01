      /* =====================================================================
         WORLD : « soirée d'hiver douce » (teal, amber, cream, terracotta). One continuous journey, one hero subject per idea.
         ===================================================================== */
      const rn = rng(11);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n, i) => { PL[n] = grp(scene, 0, 0, -B.spacing * i); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });

      /* floor, path, warm bokeh lamps, silhouettes of far buildings */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#0f2a33", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#16353f", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 46; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.gold, P.orange, P.sky][i % 3]; const m = sph(0.3 + rn() * 0.28, c, 6, emis(c, 1.1)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 9; i++) { const w = 6 + rn() * 6, h = 6 + rn() * 9; const b = rb(w, h, 6, "#16353f", 0.2, sil); b.position.set(-60 + i * 14 + rn() * 4, 0, -140 - rn() * 14); backdrop.add(b); for (let k = 0; k < 5; k++) { const wn = rb(0.9, 1.2, 0.2, P.gold, 0.05, emis(P.gold, rn() > 0.5 ? 0.5 : 0.1)); wn.castShadow = false; wn.position.set(b.position.x + (rn() - 0.5) * (w - 2), 1.5 + rn() * (h - 3), b.position.z + 3.1); backdrop.add(wn); } }
      const pathDots = []; for (let i = 0; i < 100; i++) { const m = sph(0.15, P.gold, 6, emis(P.gold, 0.9)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const rings = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#1b3d49", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis(P.gold, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders ---- */
      const COATS = { priv: P.red, pub: P.blue };
      function person(p, hex, opt = {}) { const g = grp(p); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(hex)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, opt.skin || "#ffe2cc", 10); h.position.y = 1.78; g.add(h);
        if (opt.hair) { const hr = sph(0.3, opt.hair, 8); hr.scale.y = 0.6; hr.position.y = 1.95; g.add(hr); }
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, hex, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        const o = { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; if (opt.scale) g.scale.setScalar(opt.scale); return o; }
      const ghostify = (g) => g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.22; o.castShadow = false; } });
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      function house(p, w, h, d, hex, roof = P.red) { const g = grp(p); put(g, rb(w, h, d, hex, 0.12), 0, 0, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.45, 4), M(roof)); r.rotation.y = Math.PI / 4; r.position.y = h + h * 0.22; r.castShadow = true; g.add(r);
        const cols = Math.max(1, Math.round(w / 1.6)), rows = Math.max(1, Math.round(h / 2.2)); const wins = [];
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const wn = rb(0.7, 0.9, 0.12, P.gold, 0.04, emis(P.gold, 0.9)); wn.castShadow = false; wn.position.set((i - (cols - 1) / 2) * (w / cols), 0.8 + j * (h - 1.4) / Math.max(1, rows), d / 2 + 0.02); g.add(wn); wins.push(wn); }
        put(g, rb(0.9, 1.4, 0.14, P.brown, 0.05), 0, 0, d / 2 + 0.03); return { g, wins }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 24), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 6, 40), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const crossMark = (p, s, hex) => { const g = grp(p); g.scale.setScalar(s); put(g, rb(0.5, 1.6, 0.3, hex, 0.06), 0, -0.8, 0); put(g, rb(1.6, 0.5, 0.3, hex, 0.06), 0, -0.25, 0); return g; };

      /* 1 · prix : two columns, private (2 700) taller than public (1 900) */
      const hP = grp(PL.prix); const colPriv = grp(hP, -5, 0, 0), colPub = grp(hP, 5, 0, 0);
      const bPriv = rb(4.2, 8.2, 4.2, P.red, 0.2); colPriv.add(bPriv); const bPub = rb(4.2, 5.7, 4.2, P.blue, 0.2); colPub.add(bPub);
      const hsPriv = house(colPriv, 2.2, 1.4, 2.2, P.cream); hsPriv.g.position.y = 8.3; const hsPub = house(colPub, 2.2, 1.4, 2.2, P.cream); hsPub.g.position.y = 5.8;
      const gapArrow = grp(hP, 0, 0, 0); put(gapArrow, rb(0.5, 2.0, 0.5, P.green, 0.1), 0, 5.9, 0); const ah = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.2, 4), M(P.green)); ah.rotation.x = Math.PI; ah.position.y = 5.5; ah.castShadow = true; gapArrow.add(ah); put(gapArrow, rb(10.2, 0.14, 0.14, P.green, 0.03), 0, 8.4, 0);
      ANCH.col_priv = () => V(-5, 11.2, 0); ANCH.col_pub = () => V(5, 8.2, 0); ANCH.gap = () => V(0, 7.2, 0); wrapAnch(["col_priv", "col_pub", "gap"], PL.prix);
      upd((t) => { showHero("prix", hP, t); const a = Math.max(0.001, eOutBack(prog(t, TT.bar_priv, 0.7))), b = Math.max(0.001, eOutBack(prog(t, TT.bar_pub, 0.7))); bPriv.scale.y = a; bPub.scale.y = b; hsPriv.g.visible = a > 0.5; hsPub.g.visible = b > 0.5; hsPriv.g.position.y = 0.1 + 8.2 * a; hsPub.g.position.y = 0.1 + 5.7 * b;
        const g = prog(t, TT.gap_on, 0.5); gapArrow.visible = g > 0.01; gapArrow.scale.set(1, Math.max(0.001, eOutBack(g)), 1); gapArrow.position.y = 0; colPriv.rotation.y = Math.sin(t * 0.8) * 0.15; colPub.rotation.y = -Math.sin(t * 0.8) * 0.15; });

      /* 2 · staff : public has 10 carers, private 6 (4 ghosts) */
      const hS = grp(PL.staff); const rowPub = [], rowPriv = [];
      for (let i = 0; i < 10; i++) { const v = person(hS, P.blue, { hair: i % 3 ? "#e8e1d4" : "#6b4a3a" }); v.g.position.set(-6.75 + i * 1.5, 0, -3.5); v.g.userData.s = 1.2; rowPub.push(v); }
      for (let i = 0; i < 10; i++) { const v = person(hS, P.red, { hair: i % 4 ? "#3b2a22" : "#e8e1d4" }); v.g.position.set(-6.75 + i * 1.5, 0, 3.5); v.g.userData.s = 1.2; if (i >= 6) ghostify(v.g); rowPriv.push(v); }
      ANCH.staff_pub = () => V(0, 4.4, -3.5); ANCH.staff_priv = () => V(0, 4.4, 3.5); wrapAnch(["staff_pub", "staff_priv"], PL.staff);
      upd((t) => { showHero("staff", hS, t); [rowPub, rowPriv].forEach((row, ri) => row.forEach((v, i) => { const t0 = (ri ? TT.staff_priv : TT.staff_pub) + i * 0.07; const s = Math.max(0.001, eOutBack(prog(t, t0, 0.35))); v.g.scale.setScalar(s * 1.2); v.g.rotation.y = ri ? Math.PI : 0; v.armR.rotation.z = Math.sin(t * 2 + i) * 0.1;
        if (ri && i >= 6) v.g.visible = t >= TT.staff_ghost; })); });

      /* 3 · facture : three stacked blocks. soins = Assurance maladie, hébergement = famille */
      const hB = grp(PL.facture); const bHeb = rb(8, 6.4, 5, P.gold, 0.2), bDep = rb(8, 3.0, 5, P.blue, 0.2), bSoin = rb(8, 3.0, 5, P.green, 0.2);
      hB.add(bHeb, bDep, bSoin); bHeb.position.set(0, 0, 0); bDep.position.set(0, 6.5, 0); bSoin.position.set(0, 9.6, 0);
      const cross3 = crossMark(bSoin, 1.0, P.white); cross3.position.set(0, 2.55, 2.58); cross3.rotation.x = 0;
      const fam = [person(hB, P.orange, { scale: 1.1 }), person(hB, P.pink, { scale: 1.1 }), person(hB, P.sky, { scale: 0.7 })]; fam[0].g.position.set(5.4, 0, 1); fam[1].g.position.set(6.6, 0, 1.2); fam[2].g.position.set(6.0, 0, 2.4);
      ANCH.fac_heb = () => V(-3, 3.2, 2.6); ANCH.fac_dep = () => V(-3, 8, 2.6); ANCH.fac_soin = () => V(-3, 11.2, 2.6); ANCH.fac_fam = () => V(6, 4.6, 1); wrapAnch(["fac_heb", "fac_dep", "fac_soin", "fac_fam"], PL.facture);
      upd((t) => { showHero("facture", hB, t); const s1 = Math.max(0.001, eOutBack(prog(t, TT.heb, 0.5))), s2 = Math.max(0.001, eOutBack(prog(t, TT.dep, 0.5))), s3 = Math.max(0.001, eOutBack(prog(t, TT.soin, 0.5)));
        bHeb.scale.set(1, s1, 1); bDep.visible = t >= TT.dep - 0.02; bDep.scale.set(1, s2, 1); bDep.position.y = 6.5 * s1; bSoin.visible = t >= TT.soin - 0.02; bSoin.scale.set(1, s3, 1); bSoin.position.y = 6.5 * s1 + 3.1 * s2;
        cross3.visible = t >= TT.am; bSoin.material = M(t >= TT.am ? "#a7d994" : P.green); fam.forEach((v, i) => { const k = Math.max(0.001, eOutBack(prog(t, TT.famille + i * 0.12, 0.4))); v.g.scale.setScalar(k * (i < 2 ? 1.1 : 0.7)); }); });

      /* 4 · murs : the building belongs to someone else; rent and day price climb */
      const hM = grp(PL.murs); const hs4 = house(hM, 7, 5, 5, P.cream, P.orange); hs4.g.position.set(-3.6, 0.5, 0); put(hM, cyl(5.6, 5.8, 0.5, P.navy, 28), -3.6, 0, 0);
      const owner = person(hM, P.navy, { hair: "#cfcfcf" }); owner.g.position.set(3.6, 0, 3.5); owner.g.scale.setScalar(1.6); const brief = put(owner.armR, rb(0.8, 0.6, 0.3, P.brown, 0.06), 0, -1.0, 0.2); brief.castShadow = true;
      const keyG = grp(hM, 3.6, 6.2, 3.5); { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.18, 6, 16), emis(P.gold, 1.2)); keyG.add(ring); put(keyG, rb(0.25, 1.8, 0.25, P.gold, 0.05, emis(P.gold, 1.0)), 0, -2.2, 0); put(keyG, rb(0.7, 0.25, 0.25, P.gold, 0.05, emis(P.gold, 1.0)), 0.3, -2.0, 0); }
      const rent = []; for (let k = 0; k < 14; k++) { const c = coinM(1.0); c.position.set(0, 0.1 + k * 0.17, 0); rent.push(c); }
      const rentG = grp(hM, 0.8, 0, -3); rent.forEach((c) => rentG.add(c)); const priceBlk = rb(2.6, 1, 2.6, P.red, 0.15); put(hM, priceBlk, 5.6, 0, -3);
      ANCH.mur_house = () => V(-3.6, 9.2, 0); ANCH.mur_owner = () => V(3.6, 9.4, 3.5); ANCH.mur_rent = () => V(0.8, 4.6, -3); ANCH.mur_price = () => V(5.6, 6.4, -3); wrapAnch(["mur_house", "mur_owner", "mur_rent", "mur_price"], PL.murs);
      upd((t) => { showHero("murs", hM, t); const o = Math.max(0.001, eOutBack(prog(t, TT.owner, 0.5))); owner.g.scale.setScalar(1.6 * o); keyG.visible = o > 0.4; keyG.rotation.y = t * 1.6; keyG.position.y = 6.2 + Math.sin(t * 2) * 0.25;
        rent.forEach((c, k) => { const p0 = prog(t, TT.rent_on + k * 0.09, 0.35); c.visible = p0 > 0; c.position.y = 0.1 + k * 0.17 + (1 - bounce(p0)) * 4; });
        const pp = prog(t, TT.price_on, 0.9); priceBlk.scale.y = Math.max(0.001, 1 + 4.5 * eOut(pp)); priceBlk.visible = t >= TT.price_on - 0.3; });

      /* 5 · groupes : 10 small houses in 2011, 5 large buildings today */
      const hG = grp(PL.groupes); const smalls = [], bigs = []; const BIGC = [P.red, P.blue, P.orange, P.green, P.pink];
      for (let i = 0; i < 10; i++) { const hs = house(hG, 1.3, 1.2, 1.3, P.gray, P.navy); hs.g.position.set(-6.75 + i * 1.5, 0, -6); smalls.push(hs.g); }
      for (let i = 0; i < 5; i++) { const hs = house(hG, 2.6, 5.5 + (i % 2) * 1.3, 2.6, BIGC[i], P.cream); hs.g.position.set(-6.6 + i * 3.3, 0, 4); bigs.push(hs.g); }
      ANCH.grp_big = () => V(0, 10.5, 4); ANCH.grp_small = () => V(0, 3.6, -6); wrapAnch(["grp_big", "grp_small"], PL.groupes);
      upd((t) => { showHero("groupes", hG, t); bigs.forEach((g, i) => { const s = Math.max(0.001, eOutBack(prog(t, TT.cinq + i * 0.14, 0.45))); g.scale.setScalar(s); }); smalls.forEach((g, i) => { const s = Math.max(0.001, eOutBack(prog(t, TT.dix + i * 0.06, 0.35))); g.scale.setScalar(s); }); });

      /* 6 · renta : a podium facing a hearing, a gauge filling to 5 then 7 % */
      const hR = grp(PL.renta); const pod = rb(3.4, 2.2, 2.2, P.brown, 0.12); put(hR, pod, -4.4, 0, 3); const spk = person(hR, P.navy, { hair: "#cfcfcf", scale: 1.4 }); spk.g.position.set(-4.4, 2.2, 3); spk.g.rotation.y = 0.2;
      for (let i = 0; i < 7; i++) { const v = person(hR, P.gray, { hair: i % 2 ? "#3b2a22" : "#8a8a8a", scale: 1.0 }); const a = -0.9 + i * 0.3; v.g.position.set(-2 + Math.sin(a) * 6, 0, -3 - Math.cos(a) * 3); v.g.rotation.y = Math.PI + a * 0.4; }
      const tube = rb(2.2, 12, 2.2, "#24505c", 0.2); put(hR, tube, 5.8, 0, 0); tube.material = M("#24505c", { transparent: true, opacity: 0.55 }); const fill = rb(1.6, 12, 1.6, P.gold, 0.15); put(hR, fill, 5.8, 0.2, 0);
      [5, 7].forEach((v) => { const m = rb(3.4, 0.14, 0.14, P.white, 0.03); put(hR, m, 5.8, 0.2 + v * 1.45, 1.2); });
      ANCH.gauge = () => V(5.8, 12.6, 0); ANCH.podium = () => V(-4.4, 6.2, 3); wrapAnch(["gauge", "podium"], PL.renta);
      upd((t) => { showHero("renta", hR, t); const lv = t < TT.g5 ? 0 : t < TT.g7 ? 5 * eOut(prog(t, TT.g5, 0.9)) : 5 + 2 * eOut(prog(t, TT.g7, 0.9)); fill.scale.y = Math.max(0.001, lv / 8.0 * 0.0 + (lv * 1.45) / 12); fill.visible = lv > 0.02; spk.armR.rotation.z = Math.sin(t * 3) * 0.4; });

      /* 7 · deficit : ten public houses, six turn dark red */
      const hD = grp(PL.deficit); const dh = [];
      for (let i = 0; i < 10; i++) { const hs = house(hD, 2.5, 3.0, 2.5, P.blue, P.cream); hs.g.position.set(-6.4 + (i % 5) * 3.2, 0, i < 5 ? -4.5 : 4.5); dh.push(hs); }
      ANCH.def_row = () => V(0, 7.2, 4.5); wrapAnch(["def_row"], PL.deficit);
      upd((t) => { showHero("deficit", hD, t); dh.forEach((h, i) => { const on = i < 6 && t >= TT.def_on + i * 0.22; const col = on ? P.red : P.blue; h.g.children[0].material = M(col); h.wins.forEach((w) => { w.material.emissiveIntensity = on ? 0.05 : 0.9; }); const bob = on ? Math.sin(t * 6 + i) * 0.05 : 0; h.g.position.y = bob; }); });

      /* 8 · levier : the easiest lever is staff, the carers on the platform shrink */
      const hL = grp(PL.levier); put(hL, rb(2.0, 4.2, 2.0, P.navy, 0.15), -3.5, 0, 0); const arm8 = grp(hL, -3.5, 4.2, 0); put(arm8, rb(8, 0.55, 0.55, P.gold, 0.1), 4, -0.27, 0); const knob = sph(0.95, P.red, 12); knob.position.set(8.2, 0, 0); arm8.add(knob);
      put(hL, rb(6.4, 0.6, 4.6, P.navy, 0.1), 3.4, 0, -4); const crew = []; for (let i = 0; i < 6; i++) { const v = person(hL, P.blue, { hair: i % 2 ? "#e8e1d4" : "#6b4a3a", scale: 1.3 }); v.g.userData.s = 1.3; v.g.position.set(1.4 + (i % 3) * 2.0, 0.6, -5.2 + Math.floor(i / 3) * 2.4); crew.push(v); }
      ANCH.lever = () => V(3.4, 6.8, -4); wrapAnch(["lever"], PL.levier);
      upd((t) => { showHero("levier", hL, t); arm8.rotation.z = -0.8 * eInOut(prog(t, TT.lever, 0.7)) + 0.3 * (1 - eOut(prog(t, TT.lever - 1.0, 0.8))); crew.forEach((v, i) => { const gone = i >= 4 ? 1 - eOut(prog(t, TT.crew_off + (i - 4) * 0.2, 0.4)) : 1; v.g.scale.setScalar(Math.max(0.001, gone) * 1.3); v.g.visible = gone > 0.01; }); });

      /* 9 · lit : a bed, then crossed out */
      const hBed = grp(PL.lit); { const g = grp(hBed, 0, 0, 0); put(g, rb(10, 1.2, 5.6, P.brown, 0.15), 0, 0.5, 0); put(g, rb(9.4, 0.9, 5.0, P.cream, 0.2), 0, 1.5, 0); put(g, rb(5.2, 0.7, 5.1, P.blue, 0.2), 1.9, 2.1, 0); put(g, rb(2.4, 0.6, 3.6, P.white, 0.25), -3.4, 2.3, 0); put(g, rb(0.7, 5, 5.8, P.brown, 0.1), -5.2, 0, 0); put(g, rb(0.5, 3, 5.6, P.brown, 0.1), 5.1, 0, 0); }
      const lamp = grp(hBed, -8, 0, -2); put(lamp, cyl(0.2, 0.2, 5, P.gray, 6), 0, 2.5, 0); const sh = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.6, 12, 1, true), emis("#ffe3a8", 1.0)); sh.position.y = 5.2; lamp.add(sh);
      const bX1 = rb(0.6, 14, 0.6, P.red, 0.1), bX2 = rb(0.6, 14, 0.6, P.red, 0.1); put(hBed, bX1, 0, 0, 4).rotation.z = 0.8; put(hBed, bX2, 0, 0, 4).rotation.z = -0.8; ANCH.bed = () => V(0, 6.2, 0); wrapAnch(["bed"], PL.lit);
      upd((t) => { showHero("lit", hBed, t); const c = t >= TT.cross_on; bX1.visible = bX2.visible = c; const k = c ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1; bX1.scale.setScalar(k); bX2.scale.setScalar(k); });

      /* 10 · temps : a clock, a carer, a resident, then the ledger */
      const hT = grp(PL.temps); const clock = grp(hT, 0, 9, -1); { put(clock, cyl(5.2, 5.2, 0.8, P.amber || P.gold, 36), 0, 0, 0).rotation.x = Math.PI / 2; const face = cyl(4.6, 4.6, 0.3, P.cream, 36); face.rotation.x = Math.PI / 2; face.position.z = 0.45; clock.add(face);
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const tk = rb(0.2, i % 3 ? 0.5 : 0.9, 0.2, P.navy, 0.04); tk.position.set(Math.sin(a) * 4.0, Math.cos(a) * 4.0 - (i % 3 ? 0.25 : 0.45), 0.7); tk.rotation.z = -a; clock.add(tk); } }
      const hand1 = grp(clock, 0, 0, 0.8), hand2 = grp(clock, 0, 0, 0.9); put(hand1, rb(0.34, 3.0, 0.2, P.navy, 0.06), 0, 0, 0); put(hand2, rb(0.22, 4.0, 0.2, P.red, 0.05), 0, 0, 0);
      const carer = person(hT, P.blue, { hair: "#6b4a3a", scale: 1.5 }); carer.g.position.set(-4.6, 0, 4); const res = person(hT, P.sky, { hair: "#e8e1d4", scale: 1.15 }); res.g.position.set(-1.6, 0.9, 4); put(hT, rb(2.2, 0.9, 2.2, P.brown, 0.1), -1.6, 0, 4);
      const ledger = rb(4.2, 7, 1.4, P.navy, 0.15); put(hT, ledger, 5.8, 0, 3); const lrows = []; for (let i = 0; i < 5; i++) { const r = rb(3.0, 0.3, 0.2, P.gold, 0.05, emis(P.gold, 0.7)); r.position.set(5.8, 1.0 + i * 1.2, 3.8); r.castShadow = false; hT.add(r); lrows.push(r); }
      ANCH.clock = () => V(0, 15, -1); ANCH.ledger = () => V(5.8, 8.4, 3); wrapAnch(["clock", "ledger"], PL.temps);
      upd((t) => { showHero("temps", hT, t); const sp = t - HW.temps[0][0]; hand1.rotation.z = -sp * 0.6; hand2.rotation.z = -sp * 3.6; carer.armR.rotation.z = Math.sin(t * 2) * 0.25; const lk = Math.max(0.001, eOutBack(prog(t, TT.bilan, 0.6))); ledger.scale.y = lk; lrows.forEach((r, i) => { r.visible = t >= TT.bilan + 0.2 + i * 0.12; }); });

      /* 11 · cta : a comment bubble and a subscribe button */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(P.cream)); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 8); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), M(P.white)); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta);
      upd((t) => { showHero("cta", hC, t); const b = Math.max(0.001, eOutBack(prog(t, TT.bubble_on, 0.6))); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = Math.max(0.001, eOutBack(prog(t, TT.button_on, 0.6))); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
