      /* =====================================================================
         WORLD : « carton et néon » (indigo night, kraft parcels, hot pink, amber). One continuous journey, one hero subject per idea.
         ===================================================================== */
      const rn = rng(31);
      const HW = B.heroes, TT = B.times;
      const PL = {}; B.order.forEach((n, i) => { PL[n] = grp(scene, 0, 0, -B.spacing * i); });
      function heroVis(name, t) { let s = 0; for (const [a, b] of HW[name] || []) { const i = eInOut(prog(t, a - 1.4, 0.8)), o = eInOut(prog(t, b + 0.5, 0.8)); s = Math.max(s, i * (1 - o)); } return s; }
      function showHero(name, obj, t) { const s = heroVis(name, t); obj.visible = s > 0.01; obj.scale.setScalar(0.5 + 0.5 * s); return s; }
      const wrapAnch = (names, place) => names.forEach((n) => { const f = ANCH[n]; ANCH[n] = () => place.localToWorld(f()); });
      const pop = (t, t0, d = 0.45) => Math.max(0.001, eOutBack(prog(t, t0, d)));

      /* floor, path, bokeh, far warehouses with lit windows */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, B.spacing * (B.order.length + 3)), new THREE.MeshStandardMaterial({ color: "#150f36", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -B.spacing * (B.order.length - 1) / 2); floor.receiveShadow = true; scene.add(floor);
      const backdrop = grp(scene); const sil = M("#1c1448", { roughness: 1 }); const bok = [];
      for (let i = 0; i < 40; i++) { const a = rn() * 6.283, r = 40 + rn() * 22; const c = [P.pink, P.gold, P.blue][i % 3]; const m = sph(0.28 + rn() * 0.26, c, 6, emis(c, 1.0)); m.position.set(Math.cos(a) * r, 3 + rn() * 16, -30 - Math.abs(Math.sin(a)) * r); m.castShadow = false; backdrop.add(m); bok.push(m); }
      for (let i = 0; i < 9; i++) { const w = 10 + rn() * 8, h = 6 + rn() * 6; const b = rb(w, h, 8, "#1c1448", 0.2, sil); b.position.set(-64 + i * 15 + rn() * 4, 0, -140 - rn() * 14); backdrop.add(b); for (let k = 0; k < 4; k++) { const wn = rb(1.4, 0.9, 0.2, P.pink, 0.05, emis(P.pink, rn() > 0.5 ? 0.5 : 0.1)); wn.castShadow = false; wn.position.set(b.position.x + (rn() - 0.5) * (w - 3), 1.5 + rn() * (h - 3), b.position.z + 4.1); backdrop.add(wn); } }
      const pathDots = []; for (let i = 0; i < 100; i++) { const m = sph(0.15, P.pink, 6, emis(P.pink, 0.9)); m.position.set((i % 2 ? 1 : -1) * 15.5, 0.2, -i * 6); m.castShadow = false; scene.add(m); pathDots.push(m); }
      const rings = B.order.map((n) => { const g = grp(PL[n]); const d = new THREE.Mesh(new THREE.CircleGeometry(15, 56), new THREE.MeshStandardMaterial({ color: "#241a56", roughness: 0.95 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; d.receiveShadow = true; g.add(d);
        const r = new THREE.Mesh(new THREE.TorusGeometry(15, 0.14, 6, 72), emis(P.pink, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = 0.06; g.add(r); return r; });
      upd((t) => { bok.forEach((m, i) => { m.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 1.6 + i); }); pathDots.forEach((m, i) => { m.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.5); }); rings.forEach((r) => { r.rotation.z = t * 0.15; }); backdrop.position.set(camA.x * 0.9, 0, camA.z); });

      /* ---- builders ---- */
      function person(p, hex, opt = {}) { const g = grp(p); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), M(hex)); b.position.y = 1.0; b.castShadow = true; g.add(b); const h = sph(0.28, "#ffe2cc", 10); h.position.y = 1.78; g.add(h);
        const arm = (sx) => { const q = grp(g, sx * 0.4, 1.45, 0); put(q, rb(0.14, 0.55, 0.14, hex, 0.05), 0, -0.55, 0); return q; }; const leg = (sx) => put(g, rb(0.17, 0.65, 0.17, P.navy, 0.05), sx * 0.15, 0, 0);
        const o = { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; if (opt.scale) g.scale.setScalar(opt.scale); return o; }
      const coinM = (r = 0.5) => cyl(r, r, 0.14, P.gold, 14);
      function parcel(p, s = 1, hex = P.brown) { const g = grp(p); g.scale.setScalar(s); put(g, rb(1.5, 1.2, 1.2, hex, 0.1), 0, 0, 0); put(g, rb(0.4, 0.06, 1.24, P.cream, 0.02), 0, 1.2, 0); put(g, rb(1.54, 0.06, 0.2, P.cream, 0.02), 0, 0.6, 0.55).rotation.x = 0; return g; }
      function cart(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(3.6, 0.2, 2.2, P.gray, 0.05), 0, 0.8, 0); [[-1.7, 0], [1.7, 0]].forEach(([x]) => put(g, rb(0.14, 1.5, 2.2, P.gray, 0.04), x, 0.8, 0)); [[-1.1], [0], [1.1]].forEach(([x]) => put(g, rb(0.1, 1.4, 2.2, P.gray, 0.03), x, 0.9, 0)); put(g, rb(3.6, 0.14, 0.14, P.gray, 0.03), 0, 2.2, 1.0); put(g, rb(3.6, 0.14, 0.14, P.gray, 0.03), 0, 2.2, -1.0);
        put(g, rb(0.14, 0.14, 2.2, P.gray, 0.03), -1.8, 2.2, 0); put(g, rb(0.14, 0.14, 2.2, P.gray, 0.03), 1.8, 2.2, 0); [[-1.4, 0.8], [1.4, 0.8], [-1.4, -0.8], [1.4, -0.8]].forEach(([x, z]) => { const w = cyl(0.32, 0.32, 0.2, P.navy, 10); w.rotation.z = Math.PI / 2; w.position.set(x, 0.32, z); g.add(w); }); const hd = put(g, rb(0.14, 1.2, 0.14, P.pink, 0.03), 2.0, 2.0, 0); hd.rotation.z = -0.5; return g; }
      function pieMake(p, parts, r = 4.2, ang0 = 0.3) { const g = grp(p); const sl = []; parts.reduce((ang, [f, col]) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 40, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.7; g.add(m); sl.push({ m, mid: ang + len / 2 }); return ang + len; }, ang0); put(g, cyl(r + 0.3, r + 0.4, 0.3, P.cream, 40), 0, -0.05, 0); return { g, sl }; }
      const pedestal = (p, r = 3) => { const g = grp(p); put(g, cyl(r, r + 0.2, 0.5, P.navy, 24), 0, 0.25, 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.07, 6, 40), emis(P.gold, 1.1)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.52; g.add(ring); return g; };
      const cross = (p, len = 8) => { const g = grp(p); const a = rb(0.5, len, 0.5, P.red, 0.1), b = rb(0.5, len, 0.5, P.red, 0.1); put(g, a, 0, -len / 2, 0).rotation.z = 0.8; put(g, b, 0, -len / 2, 0).rotation.z = -0.8; return g; };
      function mall(p, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(7, 4.4, 4.4, P.cream, 0.15), 0, 0, 0); for (let i = 0; i < 7; i++) put(g, rb(1.0, 0.5, 5.0, i % 2 ? P.white : P.pink, 0.04), -3 + i * 1.0, 4.4, 0.4); put(g, rb(7.4, 0.5, 5.2, P.violet, 0.06), 0, 4.9, 0.4); put(g, rb(2.2, 2.4, 0.2, P.navy, 0.06), 0, 0, 2.25); [-2.3, 2.3].forEach((x) => put(g, rb(1.6, 1.4, 0.2, P.sky, 0.05, emis(P.sky, 0.5)), x, 1.4, 2.25)); return g; }
      function stall(p, hex, s = 1) { const g = grp(p); g.scale.setScalar(s); put(g, rb(2.4, 1.2, 1.6, P.cream, 0.1), 0, 0, 0); put(g, rb(2.8, 0.3, 2.0, hex, 0.05), 0, 2.3, 0.1); put(g, rb(0.14, 1.2, 0.14, P.gray, 0.02), -1.2, 1.2, 0.8); put(g, rb(0.14, 1.2, 0.14, P.gray, 0.02), 1.2, 1.2, 0.8); put(g, rb(1.2, 0.5, 0.8, hex, 0.06), 0, 1.2, 0); return g; }

      /* 1 · marche : a pyramid of parcels, a spinning coin ring on top, a cart */
      const hM = grp(PL.marche); const pyr = []; [[4, 0], [3, 1], [2, 2], [1, 3]].forEach(([n, row]) => { for (let i = 0; i < n; i++) { const g = parcel(hM, 1.4, row % 2 ? P.orange : P.brown); g.position.set((i - (n - 1) / 2) * 2.1, row * 1.7, -2); pyr.push({ g, row }); } });
      const coinTop = grp(hM, 0, 8.2, -2); { const r = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.4, 8, 24), emis(P.gold, 1.3)); coinTop.add(r); put(coinTop, rb(0.5, 1.8, 0.4, P.gold, 0.06, emis(P.gold, 1.2)), 0, -0.9, 0); }
      const cart1 = cart(hM, 1.1); cart1.position.set(0, 0, 5.4);
      ANCH.mk_top = () => V(0, 11.2, -2); ANCH.mk_cart = () => V(4.2, 3.6, 5.4); wrapAnch(["mk_top", "mk_cart"], PL.marche);
      upd((t) => { showHero("marche", hM, t); pyr.forEach(({ g, row }, i) => { g.scale.setScalar(1.4 * pop(t, TT.tower_on + row * 0.28 + (i % 3) * 0.05)); }); coinTop.rotation.y = t * 1.6; coinTop.position.y = 8.2 + Math.sin(t * 2) * 0.25; coinTop.visible = t >= TT.tower_on + 1.0; coinTop.scale.setScalar(pop(t, TT.tower_on + 1.0, 0.5)); });

      /* 2 · panier : thousands of small orders pass on a belt, one small basket */
      const hP = grp(PL.panier); put(hP, rb(15, 0.5, 3.4, P.navy, 0.1), 0, 0, -4); const belt = []; for (let k = 0; k < 14; k++) { const g = parcel(hP, 0.7, k % 2 ? P.orange : P.brown); belt.push(g); }
      const bas = cart(hP, 1.0); bas.position.set(0, 0, 4.5); const items = [0, 1, 2].map((i) => { const g = parcel(bas, 0.5, [P.pink, P.blue, P.green][i]); g.position.set(-1 + i * 1.0, 1.0, 0); return g; });
      const tag = grp(hP, 0, 6.2, 4.5); put(tag, rb(3.2, 1.3, 0.3, P.gold, 0.2, emis(P.gold, 0.6)), 0, -0.65, 0); const hole = sph(0.16, P.navy, 6); hole.position.set(-1.3, -0.1, 0.2); tag.add(hole);
      ANCH.pn_belt = () => V(0, 3.0, -4); ANCH.pn_tag = () => V(0, 7.6, 4.5); wrapAnch(["pn_belt", "pn_tag"], PL.panier);
      upd((t) => { showHero("panier", hP, t); const a0 = HW.panier[0][0]; belt.forEach((g, k) => { const u = (((t - a0) * 0.12 + k / 14) % 1 + 1) % 1; g.position.set(-7 + u * 14, 0.5, -4); g.rotation.y = 0; }); const s = pop(t, TT.basket_on, 0.5); bas.scale.setScalar(s); items.forEach((g, i) => { g.visible = t >= TT.basket_on + 0.2 + i * 0.15; }); const ts = pop(t, TT.tag62, 0.45); tag.scale.setScalar(ts); tag.visible = ts > 0.01; tag.position.y = 6.2 + Math.sin(t * 2.2) * 0.2; });

      /* 3 · partage : the 62 euros are split between site, parcel and advertising */
      const hS = grp(PL.partage); const pie3 = pieMake(hS, [[0.28, P.blue], [0.3, P.brown], [0.27, P.pink], [0.15, P.gold]], 4.4, 0.4);
      const mid = (i) => pie3.sl[i].mid; ANCH.pa_site = () => V(Math.sin(mid(0)) * 3, 2.6, Math.cos(mid(0)) * 3); ANCH.pa_colis = () => V(Math.sin(mid(1)) * 3, 2.6, Math.cos(mid(1)) * 3); ANCH.pa_pub = () => V(Math.sin(mid(2)) * 3, 2.6, Math.cos(mid(2)) * 3); ANCH.pa_marge = () => V(Math.sin(mid(3)) * 3.6, 2.6, Math.cos(mid(3)) * 3.6); wrapAnch(["pa_site", "pa_colis", "pa_pub", "pa_marge"], PL.partage);
      upd((t) => { showHero("partage", hS, t); pie3.g.rotation.y = 0; [TT.sl_site, TT.sl_colis, TT.sl_pub, TT.sl_marge].forEach((t0, i) => { const m = pie3.sl[i].m; const s = pop(t, t0, 0.5); m.scale.set(s, 1, s); m.visible = t >= t0 - 0.02; const out = i === 3 ? 0.2 * Math.sin(t * 3) : 0.5 * Math.min(1, prog(t, t0, 0.5)); m.position.set(Math.sin(pie3.sl[i].mid) * out, 0.7, Math.cos(pie3.sl[i].mid) * out); }); });

      /* 4 · visiteurs : 100 visitors, only 2 or 3 buy */
      const hV = grp(PL.visiteurs); const crowd = []; for (let i = 0; i < 100; i++) { const x = -3.8 + (i % 10) * 0.85, z = -4.5 + Math.floor(i / 10) * 0.85; const g = grp(hV, x, 0, z); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 3, 6), M(P.gray)); b.position.y = 0.6; b.castShadow = true; g.add(b); const h = sph(0.18, "#ffe2cc", 6); h.position.y = 1.15; g.add(h); crowd.push({ g, b }); }
      const BUYERS = [14, 47, 83]; const door = grp(hV, 0, 0, 6.8); put(door, rb(0.5, 4.2, 0.5, P.gold, 0.1, emis(P.gold, 0.6)), -2.2, 0, 0); put(door, rb(0.5, 4.2, 0.5, P.gold, 0.1, emis(P.gold, 0.6)), 2.2, 0, 0); put(door, rb(4.9, 0.5, 0.5, P.gold, 0.1, emis(P.gold, 0.6)), 0, 4.2, 0); const cartV = cart(door, 0.9); cartV.position.set(0, 0, 0);
      ANCH.vi_crowd = () => V(0, 2.4, -0.5); ANCH.vi_door = () => V(0, 5.8, 6.8); wrapAnch(["vi_crowd", "vi_door"], PL.visiteurs);
      upd((t) => { showHero("visiteurs", hV, t); crowd.forEach(({ g, b }, i) => { const bi = BUYERS.indexOf(i); const on = bi >= 0 && t >= TT.buy_on + bi * 0.4; const u = on ? eInOut(prog(t, TT.buy_on + bi * 0.4, 1.4)) : 0; const x0 = -3.8 + (i % 10) * 0.85, z0 = -4.5 + Math.floor(i / 10) * 0.85; g.position.set(lerp(x0, (bi - 1) * 1.2, u), on ? Math.abs(Math.sin(t * 6 + i)) * 0.15 : 0, lerp(z0, 6.2, u)); b.material = M(on ? P.gold : P.gray); g.scale.setScalar(on ? 1.5 : 1); }); });

      /* 5 · pub : a megaphone fed with coins, two ad screens, then the cost of a customer x6 */
      const hA = grp(PL.pub); const mega = grp(hA, 0, 4.6, -1); { const cn = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.2, 18, 1, true), M(P.pink, { side: THREE.DoubleSide })); cn.rotation.z = -Math.PI / 2; cn.position.x = 1.8; cn.castShadow = true; mega.add(cn); put(mega, cyl(0.9, 0.9, 1.6, P.navy, 14), -1.4, 0, 0).rotation.z = Math.PI / 2; put(mega, rb(0.5, 1.6, 0.5, P.navy, 0.08), -0.4, -2.0, 0); }
      const scrG = rb(3.4, 2.4, 0.3, P.blue, 0.15, emis(P.blue, 0.5)); put(hA, scrG, -5.6, 3.2, 2); const scrM = rb(3.4, 2.4, 0.3, P.violet, 0.15, emis(P.violet, 0.5)); put(hA, scrM, 5.6, 3.2, 2);
      const adCoins = []; for (let k = 0; k < 10; k++) { const c = coinM(0.5); hA.add(c); adCoins.push(c); }
      const stSmall = cyl(1.4, 1.4, 1.2, P.gold, 20); put(hA, stSmall, -3.2, 0.6, 6); const stBig = cyl(1.4, 1.4, 7.2, P.red, 20); put(hA, stBig, 3.2, 3.6, 6);
      ANCH.pub_mega = () => V(0, 8.8, -1); ANCH.pub_g = () => V(-5.6, 6.2, 2); ANCH.pub_m = () => V(5.6, 6.2, 2); ANCH.pub_small = () => V(-3.2, 3.2, 6); ANCH.pub_big = () => V(3.2, 8.6, 6); wrapAnch(["pub_mega", "pub_g", "pub_m", "pub_small", "pub_big"], PL.pub);
      upd((t) => { showHero("pub", hA, t); const ms = pop(t, TT.mega_on, 0.5); mega.scale.setScalar(ms); mega.rotation.y = Math.sin(t * 1.2) * 0.25; scrG.scale.setScalar(pop(t, TT.google_on, 0.4)); scrM.scale.setScalar(pop(t, TT.meta_on, 0.4));
        adCoins.forEach((c, k) => { const u = (((t - TT.mega_on) * 0.6 + k / 10) % 1 + 1) % 1; c.visible = t > TT.mega_on + 0.3; c.position.set(lerp(-6, 2, u), 1.0 + Math.sin(u * Math.PI) * 3.8, lerp(4, -1, u)); c.rotation.x = t * 5; });
        stSmall.scale.y = pop(t, TT.six_on, 0.5); stSmall.position.y = 0.6 * stSmall.scale.y; stBig.scale.y = pop(t, TT.six_on + 0.3, 0.9); stBig.position.y = 3.6 * stBig.scale.y; stSmall.visible = stBig.visible = t >= TT.six_on - 0.02; });

      /* 6 · meta70 : a brand puts 70 % of its acquisition budget in one ad network */
      const hB = grp(PL.meta70); const pie6 = pieMake(hB, [[0.7, P.pink], [0.3, P.gray]], 4.2, 0.4); pie6.g.position.set(-2.2, 0, 1);
      const bag = grp(hB, 5.0, 0, 1); put(bag, rb(2.8, 3.2, 1.4, P.brown, 0.2), 0, 0, 0); const hand = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 18, Math.PI), M(P.cream)); hand.position.set(0, 3.2, 0); bag.add(hand); put(bag, rb(1.0, 0.5, 0.15, P.cream, 0.04), 0, 1.4, 0.75);
      ANCH.mt_pie = () => V(-2.2 + Math.sin(pie6.sl[0].mid) * 3, 2.8, 1 + Math.cos(pie6.sl[0].mid) * 3); ANCH.mt_bag = () => V(5.0, 5.4, 1); wrapAnch(["mt_pie", "mt_bag"], PL.meta70);
      upd((t) => { showHero("meta70", hB, t); pie6.sl.forEach((s_, i) => { const t0 = i ? TT.pie70_on + 0.3 : TT.pie70_on; const k = pop(t, t0, 0.6); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 0.7 * Math.min(1, prog(t, t0, 0.6)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); }); const bs = pop(t, TT.bag_on, 0.5); bag.scale.setScalar(bs); bag.rotation.y = Math.sin(t * 1.2) * 0.3; });

      /* 7 · retours : a quarter of the parcels come back, each leg paid */
      const hR = grp(PL.retours); const grid = []; for (let i = 0; i < 25; i++) { const g = parcel(hR, 0.9, i % 2 ? P.orange : P.brown); g.position.set(-1.0 + (i % 5) * 1.6 - 1.6, 0, -3 + Math.floor(i / 5) * 1.6); grid.push(g); }
      const RET = [3, 7, 11, 16, 20, 24]; const shelf = grp(hR, -6.4, 0, -4); { [0, 1.6, 3.2].forEach((y) => put(shelf, rb(3.6, 0.2, 1.8, P.violet, 0.04), 0, y + 0.1, 0)); put(shelf, rb(0.2, 3.6, 1.8, P.violet, 0.04), -1.8, 0, 0); put(shelf, rb(0.2, 3.6, 1.8, P.violet, 0.04), 1.8, 0, 0); }
      const shelved = RET.map((_, i) => { const g = parcel(shelf, 0.6, P.orange); g.position.set(-1.0 + (i % 3) * 1.0, (Math.floor(i / 3) * 1.6) + 0.3, 0); g.visible = false; return g; });
      const legC1 = coinM(0.9), legC2 = coinM(0.9); hR.add(legC1, legC2);
      ANCH.re_grid = () => V(0, 4.0, -0.5); ANCH.re_shelf = () => V(-6.4, 5.4, -4); ANCH.re_legs = () => V(0, 7.0, 3); wrapAnch(["re_grid", "re_shelf", "re_legs"], PL.retours);
      upd((t) => { showHero("retours", hR, t); grid.forEach((g, i) => { const ri = RET.indexOf(i); const x0 = -1.0 + (i % 5) * 1.6 - 1.6, z0 = -3 + Math.floor(i / 5) * 1.6; g.scale.setScalar(0.9 * pop(t, HW.retours[0][0] + 0.1 + (i % 7) * 0.05, 0.4)); if (ri >= 0) { const u = eInOut(prog(t, TT.ret_on + ri * 0.2, 1.3)); g.position.set(lerp(x0, -6.4 + (-1.0 + (ri % 3) * 1.0), u), Math.sin(u * Math.PI) * 3.4 + u * (Math.floor(ri / 3) * 1.6 + 0.3), lerp(z0, -4, u)); g.rotation.y = u * 6.283; g.visible = u < 0.96; shelved[ri].visible = u >= 0.96; } });
        const c1 = pop(t, TT.leg_on, 0.4), c2 = pop(t, TT.twice_on, 0.4); legC1.scale.setScalar(c1); legC2.scale.setScalar(c2); legC1.position.set(-2.4, 6.4 + Math.sin(t * 2) * 0.2, 3); legC2.position.set(2.4, 6.4 + Math.sin(t * 2 + 1) * 0.2, 3); legC1.rotation.x = Math.PI / 2; legC2.rotation.x = Math.PI / 2; legC1.rotation.z = t * 2; legC2.rotation.z = t * 2; });

      /* 8 · marketplace : a mall holding 32 % of product sales, taking a commission that depends on the category */
      const hMk = grp(PL.marketplace); const mal = mall(hMk, 0.85); mal.position.set(-3.2, 0, -3.5); const stalls = [stall(hMk, P.blue, 0.85), stall(hMk, P.green, 0.85), stall(hMk, P.orange, 0.85)]; stalls.forEach((s_, i) => s_.position.set(2.8 + i * 0.0, 0, -5.8 + i * 3.6));
      const pie9 = pieMake(hMk, [[0.32, P.violet], [0.68, P.gray]], 2.2, 0.4); pie9.g.position.set(-4.8, 0, 5.4);
      const skim = [1.0, 1.8, 0.6].map((h, i) => { const b = rb(0.9, h, 0.9, P.red, 0.1); put(hMk, b, 0.4 + 0.0, 0.0, -5.8 + i * 3.6).position.x = 0.8; return { b, h }; });
      const flowM = []; for (let k = 0; k < 9; k++) { const c = coinM(0.4); c.visible = false; hMk.add(c); flowM.push(c); }
      ANCH.mp_mall = () => V(-3.2, 5.8, -3.5); ANCH.mp_pie = () => V(-4.8, 3.6, 5.4); ANCH.mp_skim = () => V(0.8, 3.4, -2.2); wrapAnch(["mp_mall", "mp_pie", "mp_skim"], PL.marketplace);
      upd((t) => { showHero("marketplace", hMk, t); const ms = pop(t, TT.mall_on, 0.5); mal.scale.setScalar(0.85 * ms); stalls.forEach((s_, i) => s_.scale.setScalar(0.85 * pop(t, TT.mall_on + 0.2 + i * 0.15, 0.4)));
        pie9.sl.forEach((s_, i) => { const t0 = TT.pie32 + i * 0.2; const k = pop(t, t0, 0.5); s_.m.scale.set(k, 1, k); s_.m.visible = t >= t0 - 0.02; const out = i === 0 ? 0.5 * Math.min(1, prog(t, t0, 0.5)) : 0; s_.m.position.set(Math.sin(s_.mid) * out, 0.7, Math.cos(s_.mid) * out); });
        skim.forEach(({ b, h }, i) => { b.scale.y = pop(t, TT.cat_on + i * 0.35, 0.5); b.visible = t >= TT.cat_on + i * 0.35 - 0.02; });
        flowM.forEach((c, k) => { const u = (((t - TT.skim_on) * 0.5 + k / 9) % 1 + 1) % 1; const si = k % 3; c.visible = t > TT.skim_on; c.position.set(lerp(2.8, -3.2, u), 1.6 + Math.sin(u * Math.PI) * 2.6, lerp(-5.8 + si * 3.6, -3.5, u)); c.rotation.x = t * 5; }); });

      /* 9 · relation : the buyer is linked to the marketplace, the seller's thread is cut */
      const hRel = grp(PL.relation); const buyer = person(hRel, P.pink, { scale: 1.6 }); buyer.g.position.set(0, 0, 3); const seller = person(hRel, P.orange, { scale: 1.6 }); seller.g.position.set(-5.8, 0, -1); const wh = stall(hRel, P.orange, 0.9); wh.position.set(-5.8, 0, -4); const mal2 = mall(hRel, 0.6); mal2.position.set(4.8, 0, -3);
      const linkOn = [], linkOff = []; for (let k = 0; k < 9; k++) { const s_ = sph(0.22, P.gold, 8, emis(P.gold, 1.4)); s_.castShadow = false; hRel.add(s_); linkOn.push(s_); } for (let k = 0; k < 6; k++) { const s_ = sph(0.2, P.gray, 8); s_.castShadow = false; hRel.add(s_); linkOff.push(s_); }
      ANCH.rl_buyer = () => V(0, 5.6, 3); ANCH.rl_mall = () => V(4.8, 6.4, -3); ANCH.rl_seller = () => V(-5.8, 5.4, -1); wrapAnch(["rl_buyer", "rl_mall", "rl_seller"], PL.relation);
      upd((t) => { showHero("relation", hRel, t); buyer.g.scale.setScalar(1.6); buyer.armR.rotation.z = Math.sin(t * 2) * 0.2; seller.armL.rotation.z = Math.sin(t * 2.5) * 0.4 + 0.5;
        linkOn.forEach((s_, k) => { const u = k / 8; const on = t >= TT.line_on + k * 0.08; s_.visible = on; s_.scale.setScalar(on ? 1 + 0.4 * Math.max(0, Math.sin(t * 5 - k)) : 0.01); s_.position.set(lerp(0.4, 4.8, u), 1.8 + Math.sin(u * Math.PI) * 1.6, lerp(3, -3, u)); });
        linkOff.forEach((s_, k) => { const u = k / 5; const fall = 1 - eOut(prog(t, TT.line_on + 0.4 + k * 0.1, 1.2)); s_.visible = t >= HW.relation[0][0] + 0.2; s_.position.set(lerp(-5.2, -0.4, u) + (u > 0.45 ? 0.4 * (1 - fall) : 0), 1.8 * (u > 0.45 ? fall : 1) + 0.15 + Math.sin(u * Math.PI) * 0.8 * fall, lerp(-1, 3, u)); }); });

      /* 10 · achete : not only products (parcel crossed), customers are bought and must come back */
      const hAc = grp(PL.achete); const bigP = parcel(hAc, 3.6, P.brown); bigP.position.set(0, 0, 0); const crossA = cross(hAc, 9); crossA.position.set(0, 7.5, 3.4);
      const cust = [P.pink, P.blue, P.green].map((c, i) => { const v = person(hAc, c, { scale: 1.5 }); v.g.position.set(-4.2 + i * 4.2, 0, 3); const tg = grp(v.g, 0, 4.4, 0); put(tg, rb(1.7, 0.8, 0.2, P.gold, 0.14, emis(P.gold, 0.6)), 0, -0.4, 0); return { v, tg }; });
      const loopA = grp(hAc, 0, 2.6, 3); { const tor = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.28, 6, 36, 4.9), M(P.green)); tor.rotation.x = Math.PI / 2; loopA.add(tor); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 8), M(P.green)); hd.position.set(5.8, 0, 0); hd.rotation.x = Math.PI / 2; hd.rotation.z = -Math.PI / 2; loopA.add(hd); }
      ANCH.ac_box = () => V(0, 9.0, 0); ANCH.ac_cust = () => V(0, 8.2, 3); wrapAnch(["ac_box", "ac_cust"], PL.achete);
      upd((t) => { showHero("achete", hAc, t); const cr = t >= TT.cross_on && t < TT.buy_on2; crossA.visible = cr; crossA.scale.setScalar(cr ? 0.4 + 0.6 * popS(t, TT.cross_on, 0.3) : 1); const bs = t < TT.buy_on2 ? 1 : 1 - eOut(prog(t, TT.buy_on2, 0.4)); bigP.visible = bs > 0.02; bigP.scale.setScalar(Math.max(0.001, 3.6 * bs));
        cust.forEach(({ v, tg }, i) => { const k = pop(t, TT.buy_on2 + i * 0.2, 0.5); v.g.scale.setScalar(1.5 * k); v.g.visible = k > 0.01 && t >= TT.buy_on2 - 0.02; tg.rotation.y = t * 1.5; v.g.position.y = Math.sin(t * 2 + i) * 0.1; });
        const lp = pop(t, TT.back_on, 0.5); loopA.visible = t >= TT.back_on - 0.02; loopA.scale.setScalar(lp); loopA.rotation.y = -t * 0.9; });

      /* 11 · cta : a comment bubble and a subscribe button */
      const hC = grp(PL.cta); pedestal(hC, 8); const bub = grp(hC, -2.8, 9.0, 0); { put(bub, rb(5.6, 3.8, 1.2, P.cream, 0.5), 0, -3.8, 0); const tail = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(P.cream)); tail.rotation.z = Math.PI; tail.position.set(-1.4, -4.1, 0); tail.castShadow = true; bub.add(tail); }
      const dots = [0, 1, 2].map((i) => { const d = sph(0.5, P.navy, 8); d.position.set(-1.3 + i * 1.3, -1.9, 0.7); bub.add(d); return d; });
      const btn = grp(hC, 3.0, 3.4, 3); { put(btn, rb(4.4, 2.2, 1.2, P.red, 0.6), 0, -1.1, 0); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 3), M(P.white)); tri.rotation.z = -Math.PI / 2; tri.position.set(-1.4, -1.1, 0.7); btn.add(tri); put(btn, rb(2.2, 0.3, 0.2, P.white, 0.05), 0.8, -1.1, 0.7); }
      ANCH.bubble = () => V(-2.8, 10.2, 0); ANCH.button = () => V(3.0, 5.6, 3); wrapAnch(["bubble", "button"], PL.cta);
      upd((t) => { showHero("cta", hC, t); const b = pop(t, TT.bubble_on, 0.6); bub.scale.setScalar(b); bub.position.y = 9.0 + Math.sin(t * 2) * 0.2; dots.forEach((d, i) => { d.scale.setScalar(0.6 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 0.9))); });
        const s = pop(t, TT.button_on, 0.6); const press = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - TT.press) / 0.35) * Math.PI)); btn.scale.setScalar(s * press); btn.rotation.z = Math.sin(t * 2.4) * 0.05; });
