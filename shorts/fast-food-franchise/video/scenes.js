      /* =====================================================================
         DIORAMAS : "L'économie d'un fast-food en franchise" (13 mondes, un par idée)
         ===================================================================== */
      const scenes = [];
      const decorProps = (g) => { const a = [tree(g, -3.9, -3.8), tree(g, 3.9, 3.8, 0.9), tree(g, 3.9, -3.8, 1.1), lamp(g, 3.7, -3.0), lamp(g, -3.8, 3.7)]; return (t, t0) => a.forEach((o, i) => appear(o, t, t0 + i * 0.1, null, "pop", 0.4)); };
      const defScene = (t0, t1, g, update) => { let u = update; if (!g.userData.noDecor) { const d = decorProps(g); u = (t) => { update(t); d(t, t0 + 0.5); }; } scenes.push({ t0, t1, g, update: u }); };
      const rn = rng(5);
      const RED = "#ff7b7b", REDD = "#e9565b", YEL = "#ffd66b", BUN = "#f3c27c", GRN = "#7fd69a";
      const glassM = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.22, roughness: 0.1, depthWrite: false });

      /* --- local builders --- */
      function belt(p, pts, w = 0.7, hex = "#a9a6c4") {
        const g = grp(p);
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = rbox(w, 0.1, len + w * 0.5, hex, 0.04);
          put(g, m, (a[0] + b[0]) / 2, TOP, (a[1] + b[1]) / 2); m.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); }
        return g;
      }
      function flowCoins(p, pts, n, hex = P.gold, y = TOP + 0.2) {
        const arr = []; const segs = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])); const total = segs.reduce((a, b) => a + b, 0);
        for (let k = 0; k < n; k++) { const c = cyl(0.2, 0.2, 0.07, hex, 14); c.visible = false; p.add(c); arr.push(c); }
        return { arr, update(t, t0, speed, on = true) { arr.forEach((c, k) => { if (!on || t < t0) { c.visible = false; return; } const u = ((((t - t0) * speed + k / n) % 1) + 1) % 1; let d = u * total, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
          const a = pts[i], b = pts[i + 1], f = d / segs[i]; c.position.set(lerp(a[0], b[0], f), y + Math.abs(Math.sin(u * 40)) * 0.04, lerp(a[1], b[1], f)); c.rotation.y = t * 3 + k; c.visible = true; }); } };
      }
      function burger(p, x, z, s) {
        const g = grp(p, x, TOP, z); g.scale.setScalar(s); const L = [];
        const add = (m, y) => { m.position.y = y; g.add(m); L.push(m); return m; };
        add(cyl(1.0, 1.0, 0.3, BUN, 32), 0.15); add(cyl(1.1, 1.1, 0.1, GRN, 32), 0.35); add(cyl(1.0, 1.0, 0.12, RED, 32), 0.46);
        const ch = add(rbox(2.0, 0.05, 2.0, YEL, 0.02), 0.52); ch.rotation.y = Math.PI / 4; add(cyl(1.04, 1.04, 0.3, "#8a5a44", 32), 0.72);
        const top = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(BUN)); top.scale.y = 0.75; top.castShadow = true; add(top, 0.87);
        for (let i = 0; i < 9; i++) { const sd = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), M("#fff4d6")); sd.scale.set(1, 0.5, 1.4); const a = i * 2.4, r = 0.25 + (i % 3) * 0.22; sd.position.set(Math.cos(a) * r, 1.6 - r * 0.35, Math.sin(a) * r); sd.rotation.y = a; sd.castShadow = false; g.add(sd); }
        g.userData.layers = L; return g;
      }
      function restaurant(p, x, z, s = 1) {
        const outer = grp(p, x, TOP, z); const g = grp(outer, 0, 0, 0); g.scale.setScalar(s);
        put(g, rbox(3.6, 1.7, 2.6, P.white, 0.1)); put(g, rbox(3.9, 0.35, 2.9, RED, 0.08), 0, 1.7, 0);
        const glass = put(g, rbox(2.8, 1.0, 0.08, null, 0.03, glassM), -0.2, 0.3, 1.32); glass.castShadow = false;
        for (let k = 0; k < 7; k++) put(g, rbox(0.42, 0.12, 0.8, k % 2 ? P.white : RED, 0.04), -1.5 + k * 0.5, 1.4, 1.65);
        put(g, rbox(0.7, 1.2, 0.08, "#8fb6ff", 0.03), 1.25, 0, 1.31); put(g, rbox(0.12, 0.7, 0.9, "#8fb6ff", 0.03), 1.83, 0.3, -0.2);
        put(g, cyl(0.08, 0.08, 3.4, P.gray, 10), -2.4, 1.7, 1.4); put(g, rbox(1.5, 0.9, 0.16, YEL, 0.06), -2.4, 3.1, 1.4);
        const mb = burger(g, -2.4, 0, 0.3); mb.parent.remove(mb); mb.position.set(-2.4, 3.6, 1.5); g.add(mb); mb.scale.setScalar(0.34);
        return outer;
      }
      function bills(p, x, z, n) { const g = grp(p, x, TOP, z); const a = []; for (let k = 0; k < n; k++) { const b = rbox(1.5, 0.1, 0.8, k % 2 ? "#9fe3c8" : "#b7edd5", 0.03); put(g, b, 0, k * 0.11, 0); b.rotation.y = (k % 3 - 1) * 0.08; a.push(b); } return { g, arr: a }; }
      function crate(p, x, z, hex, topc) { const g = grp(p, x, TOP, z); put(g, rbox(1.0, 0.6, 1.0, "#e2b98a", 0.05)); for (let i = 0; i < 4; i++) { const s_ = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), M(topc)); s_.position.set(-0.25 + (i % 2) * 0.5, 0.7, -0.25 + Math.floor(i / 2) * 0.5); s_.castShadow = true; g.add(s_); } return g; }
      function hq(p, x, z) { const g = grp(p, x, TOP, z); put(g, rbox(2.6, 0.3, 2.6, P.white, 0.06)); put(g, rbox(2.2, 3.6, 2.2, "#c9b8f7", 0.1), 0, 0.3, 0); const wm = new THREE.MeshStandardMaterial({ color: "#8fb6ff", roughness: 0.3 });
        for (let f = 0; f < 6; f++) { put(g, rbox(1.7, 0.28, 0.05, null, 0.02, wm), 0, 0.7 + f * 0.55, 1.11); put(g, rbox(0.05, 0.28, 1.7, null, 0.02, wm), 1.11, 0.7 + f * 0.55, 0); }
        put(g, rbox(2.4, 0.15, 2.4, YEL, 0.05), 0, 3.9, 0); put(g, cyl(0.7, 0.7, 0.1, P.gold, 24), 0, 4.1, 0); return g; }
      function register(p, x, z, s = 1) { const outer = grp(p, x, TOP, z); const g = grp(outer, 0, 0, 0); g.scale.setScalar(s); put(g, rbox(2.0, 0.8, 1.4, P.lilac, 0.1)); put(g, rbox(1.3, 0.55, 0.12, "#2f2e7a", 0.04), 0, 1.25, -0.2).rotation.x = -0.35;
        put(g, rbox(1.7, 0.2, 1.1, P.white, 0.06), 0, 0.8, 0.1); put(g, rbox(0.9, 0.12, 0.5, P.mint, 0.04), 0, 1.0, 0.45); return outer; }
      const fadeAll = (arr, t, t0, d = 0.4) => arr.forEach((o, i) => appear(o, t, t0 + i * 0.08, null, "pop", d));
      const mk = (parent) => (o) => (parent.add(o), o);

      /* A · 0 – 4.8 : 100 € of burgers, only 5–10 € stay */
      const sA = mkStage(); sA.userData.noDecor = true; const sAt = floor(sA, 9, 9, checker("#fff4d6", "#ffeabf"), "#ffd9a8", "#f0b66e");
      const bgr = burger(sA, 1.2, -0.6, 1.5); const cA = coinStack(sA, 10, -2.9, 1.8);
      const cAfly = []; cA.arr.forEach((c, k) => { if (k > 0) cAfly.push(c); });
      const aProps = [tree(sA, -3.6, -3.4), tree(sA, 3.8, 3.4, 0.9), lamp(sA, 3.4, -3.4), lamp(sA, -3.6, 3.6)];
      card('<small>Ventes</small><b>100 €</b>', "gold", { get: () => V(-2.9, 3.4, 1.8) }, 0.3, 2.3);
      card('<small>Il en reste</small><b>5 à 10 €</b>', "mint", { get: () => V(-2.9, 1.6, 1.8) }, 3.1, 4.8);
      defScene(0, 4.8, sA, (t) => {
        tilesIn(sAt, t, 0); bgr.userData.layers.forEach((m, i) => { const p = prog(t, 0.2 + i * 0.1, 0.5); m.visible = p > 0; m.position.y = [0.15, 0.35, 0.46, 0.52, 0.72, 0.87][i] + (1 - bounce(p)) * 5; });
        bgr.children.forEach((m) => { if (m.geometry && m.geometry.type === "SphereGeometry" && m.geometry.parameters.radius < 0.1) m.visible = prog(t, 1.0, 0.3) > 0; });
        cA.arr.forEach((c, k) => { const p0 = prog(t, 0.3 + k * 0.08, 0.4); let vis = p0 > 0; let y = 0.08 + k * 0.17 + (1 - bounce(p0)) * 4, x = 0, z = 0, sc = 1;
          if (k > 0) { const f = prog(t, 2.3 + (k - 1) * 0.1, 0.9); if (f > 0) { const e = eInOut(f); x = e * 7.5; z = -e * 5.0; y += Math.sin(e * Math.PI) * 2.2 + e * 2.5; sc = 1 - prog(f, 0.8, 0.2); } }
          c.visible = vis && sc > 0.01; c.position.set(x, y, z); c.scale.setScalar(Math.max(sc, 0.001)); });
        aProps.forEach((o, i) => appear(o, t, 0.9 + i * 0.12, null, "pop", 0.4));
      });

      /* B · 4.8 – 8.5 : packed restaurant, queue on the sidewalk */
      const sB = mkStage(); sB.userData.noDecor = true; const sBt = floor(sB, 9, 9, (i, j) => (j >= 6 ? "#9a93d2" : j === 5 ? "#e9e4f8" : (i + j) % 2 ? "#f6f4ff" : "#ece8fc"));
      const rB = restaurant(sB, -1.4, -2.0); const queue = []; const qCol = [P.sky, P.coral, P.mint, P.lilac, P.peach, "#ffe08a", P.sky, P.coral, P.mint, P.lilac, P.peach, "#ffe08a"];
      for (let i = 0; i < 12; i++) queue.push(person(sB, qCol[i], false));
      const carsB = [car(sB, P.coral), car(sB, P.sky), car(sB, "#ffe08a")];
      const bProps = [tree(sB, -3.8, -3.6), tree(sB, 3.8, -3.6, 1.1), lamp(sB, 3.4, 0.6), lamp(sB, -3.6, 0.6)];
      defScene(4.8, 8.5, sB, (t) => {
        tilesIn(sBt, t, 4.8); appear(rB, t, 4.9, null, "pop", 0.6); bProps.forEach((o, i) => appear(o, t, 5.2 + i * 0.1, null, "pop", 0.4));
        queue.forEach((q, i) => { appear(q.g, t, 5.2 + i * 0.1, null, "pop", 0.3); q.g.position.set(1.9 + i * 0.62 - 0.1 * Math.min(t - 4.8, 3), TOP, 0.9); q.g.rotation.y = -Math.PI / 2; q.armR.rotation.x = Math.sin(t * 3 + i) * 0.1; });
        carsB.forEach((c, i) => { appear(c, t, 5.4 + i * 0.2, null, "pop", 0.3); c.position.set(-4.2 + i * 1.7 + Math.min(t - 5.4, 1.5) * 0.2, TOP, 3.4); c.rotation.y = -Math.PI / 2 + 0.0; c.rotation.y = Math.PI / 2; });
      });

      /* C · 8.5 – 13.96 : the pie chart, the net margin is the thin slice */
      const sC = mkStage(); sC.userData.noDecor = false; const sCt = floor(sC, 9, 9, checker("#f6f4ff", "#ece8fc"));
      const pieDefs = [["Matières", 0.30, "#ff7b7b"], ["Équipes", 0.32, "#6fa8ff"], ["Loyer", 0.13, "#a98af0"], ["Marque", 0.09, "#ffc93c"], ["Autres", 0.09, "#c4c1d8"], ["Marge", 0.07, "#3fcf8e"]];
      const pie = grp(sC, 0, TOP + 0.05, 0); const slices = []; let ang = 0;
      pieDefs.forEach(([n, f, col], i) => { const len = f * Math.PI * 2; const m = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.9, 48, 1, false, ang, len), M(col)); m.castShadow = true; m.receiveShadow = true; m.position.y = 0.45; pie.add(m); slices.push({ m, mid: ang + len / 2, i }); ang += len; });
      const pieBase = put(sC, cyl(3.3, 3.4, 0.2, P.white, 48), 0, TOP + 0.0, 0);
      card('<small>Marge nette</small><b><span class="a">0</span> à <span class="b">0</span> %</b>', "mint", { get: () => V(Math.sin(slices[5].mid) * 3.9, 2.4, Math.cos(slices[5].mid) * 3.9) }, 9.6, 13.7, [[0, 5], [1, 10]]);
      card('<small>Le reste</small><b>des charges</b>', "sm", { get: () => V(-1.5, 2.2, -1.5) }, 10.4, 13.2);
      defScene(8.5, 13.96, sC, (t) => {
        tilesIn(sCt, t, 8.5); appear(pieBase, t, 8.6, null, "pop", 0.5);
        slices.forEach(({ m, mid, i }) => { const s = popS(t, 8.9 + i * 0.18, 0.5); m.visible = s > 0.002; m.scale.set(1, Math.max(s, 0.001), 1); const out = i === 5 ? 0.9 * eOutBack(prog(t, 10.2, 0.6)) : 0; m.position.set(Math.sin(mid) * out, 0.45, Math.cos(mid) * out); });
        pie.rotation.y = Math.sin(t * 0.6) * 0.05;
      });

      /* D · 13.96 – 23.8 : follow the money → entrance gate, entry fee, personal contribution */
      const sD = mkStage(); const sDt = floor(sD, 9, 9, checker("#e6f1fb", "#d8e8f8"), "#a8c8f0", "#7fa5e0");
      const miniR = restaurant(sD, -2.8, -2.8, 0.55);
      const trail = [[-1.6, -1.2], [-0.6, -0.2], [0.8, 0.4], [1.8, 1.4]]; const beltD = belt(sD, trail, 0.8); const flowD = flowCoins(sD, trail, 8);
      const booth = grp(sD, 2.9, TOP, 1.8); put(booth, rbox(1.6, 1.6, 1.4, P.white, 0.1)); put(booth, rbox(1.9, 0.25, 1.7, RED, 0.06), 0, 1.6, 0); put(booth, rbox(1.2, 0.5, 0.1, "#8fb6ff", 0.03), 0, 0.7, 0.72);
      const arm = grp(sD, 1.5, TOP + 0.8, 3.0); put(arm, rbox(0.12, 0.12, 2.4, RED, 0.04), 0, 0, 0.0); put(arm, rbox(0.2, 0.8, 0.2, P.gray, 0.05), 0, -0.8, -1.2);
      const bl = bills(sD, -1.6, 2.5, 8); const vault = grp(sD, 0.6, TOP, 2.9); put(vault, rbox(1.9, 1.7, 1.6, "#b9b6cf", 0.12)); const door = cyl(0.6, 0.6, 0.12, P.gray, 28); door.rotation.x = Math.PI / 2; door.position.set(0, 0.9, 0.84); vault.add(door); put(vault, rbox(0.12, 0.5, 0.1, P.navy, 0.03), 0, 0.65, 0.92);
      const cV = coinStack(sD, 12, 0.6, 1.2); cV.g.scale.setScalar(0.8);
      card('<small>Droit d’entrée</small><b><span class="a">0</span> €</b>', "gold", { get: () => V(-1.6, 2.4, 2.5) }, 17.4, 23.4, [[0, 45000]]);
      card('<small>Apport personnel</small><b>au moins <span class="a">0</span> €</b>', "coral sm", { get: () => V(1.6, 5.4, 2.9) }, 20.2, 23.6, [[0, 190000]]);
      card('<small>Suivre l’argent</small><b>→ vers l’entrée</b>', "sm", { get: () => V(0, 1.8, 0) }, 14.3, 16.2);
      defScene(13.96, 23.8, sD, (t) => {
        tilesIn(sDt, t, 13.96); appear(miniR, t, 14.0, null, "pop", 0.5); appear(beltD, t, 14.3, null, "y", 0.4); flowD.update(t, 14.6, 0.28, t < 23.5);
        appear(booth, t, 16.3, null, "pop", 0.5); appear(arm, t, 16.5, null, "pop", 0.4); arm.rotation.z = -prog(t, 17.6, 0.6) * 1.1;
        fadeAll(bl.arr, t, 17.2, 0.25); bl.g.visible = t > 17.1; appear(vault, t, 20.0, null, "pop", 0.5); updCoins(cV, t, 20.4, 0.12, null); cV.g.visible = t > 20.3;
      });

      /* E · 23.8 – 28.6 : the brand takes its cut first */
      const sE = mkStage(); const sEt = floor(sE, 9, 9, checker("#efe6fb", "#e4d8f6"), "#c0a6ec", "#9a7edc");
      const rE = restaurant(sE, -2.6, 1.2, 0.8); const hqE = hq(sE, 2.8, -2.2);
      const pathE = [[-0.5, 1.6], [1.0, 1.6], [1.0, -0.4], [2.8, -0.4]]; const beltE = belt(sE, pathE, 0.8); const flowE = flowCoins(sE, pathE, 10);
      const valve = grp(sE, 1.0, TOP, 0.6); put(valve, cyl(0.3, 0.3, 0.9, P.gray, 16), 0, 0.45, 0); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 8, 20), M(RED)); wheel.position.y = 1.0; wheel.rotation.x = Math.PI / 2; valve.add(wheel);
      card('<small>Avant même les salaires</small><b>la marque se sert</b>', "coral sm", { get: () => V(1.0, 2.6, 0.6) }, 24.4, 28.4);
      defScene(23.8, 28.95, sE, (t) => {
        tilesIn(sEt, t, 23.8); appear(rE, t, 23.9, null, "pop", 0.5); appear(hqE, t, 24.0, null, "y", 0.6); appear(beltE, t, 24.3, null, "y", 0.4); appear(valve, t, 24.4, null, "pop", 0.4);
        flowE.update(t, 24.7, 0.3, true); wheel.rotation.z = t * 2;
      });

      /* F · 28.95 – 36.1 : royalty 5 % + marketing 4 %+ */
      const sF = mkStage(); const sFt = floor(sF, 9, 9, checker("#efe6fb", "#e4d8f6"), "#c0a6ec", "#9a7edc");
      const hqF = hq(sF, 0.0, -2.6); const pathF1 = [[-3.4, 1.2], [-1.0, 1.2], [-1.0, -1.3]]; const pathF2 = [[3.4, 1.2], [1.0, 1.2], [1.0, -1.3]];
      const bF1 = belt(sF, pathF1, 0.8, P.gold), bF2 = belt(sF, pathF2, 0.8, P.coral); const fl1 = flowCoins(sF, pathF1, 8, P.gold), fl2 = flowCoins(sF, pathF2, 8, "#ffb3b8");
      const meg = grp(sF, 3.4, TOP, 2.3); put(meg, rbox(0.5, 0.6, 0.5, P.coral, 0.08)); const mc = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 16), M(YEL)); mc.rotation.z = Math.PI / 2; mc.position.set(0.55, 0.45, 0); mc.castShadow = true; meg.add(mc);
      const resF = restaurant(sF, -3.4, 2.3, 0.45);
      card('<small>Redevance</small><b><span class="a">0</span> %</b>', "gold", { get: () => V(-2.4, 2.8, 1.2) }, 29.6, 36.0, [[0, 5]]);
      card('<small>Marketing</small><b>plus de <span class="a">0</span> %</b>', "coral sm", { get: () => V(2.4, 2.8, 1.2) }, 31.6, 36.0, [[0, 4]]);
      card('<small>Chiffres officiels</small><b>McDonald’s UK</b>', "sm", { get: () => V(0, 5.9, -2.6) }, 29.2, 32.6);
      defScene(28.95, 36.1, sF, (t) => {
        tilesIn(sFt, t, 28.95); appear(hqF, t, 29.0, null, "y", 0.6); appear(resF, t, 29.1, null, "pop", 0.4); appear(bF1, t, 29.6, null, "y", 0.4); appear(bF2, t, 31.6, null, "y", 0.4); appear(meg, t, 31.5, null, "pop", 0.4);
        fl1.update(t, 30.0, 0.3, true); fl2.update(t, 32.0, 0.3, t > 31.8);
      });

      /* G · 36.1 – 40.55 : rent 8–18 %, fixed for 20 years */
      const sG = mkStage(); const sGt = floor(sG, 9, 9, checker("#e9ecf9", "#dde2f4"), "#aab6e6", "#8294d6");
      const landlord = grp(sG, -2.2, TOP, -2.4); put(landlord, rbox(3.2, 2.6, 2.2, "#c9d0ee", 0.1)); put(landlord, rbox(3.4, 0.2, 2.4, P.navy, 0.05), 0, 2.6, 0); for (let f = 0; f < 3; f++) for (let k = 0; k < 3; k++) put(landlord, rbox(0.4, 0.5, 0.05, "#8fb6ff", 0.02), -1.0 + k * 1.0, 0.3 + f * 0.8, 1.11);
      const resG = restaurant(sG, 2.6, 0.2, 0.7);
      const cal20 = []; for (let i = 0; i < 20; i++) { const m = new THREE.MeshStandardMaterial({ color: P.white, roughness: 0.75 }); const b = rbox(0.62, 0.3, 0.62, null, 0.06, m); put(sG, b, -3.1 + (i % 10) * 0.7, TOP, 2.0 + Math.floor(i / 10) * 0.75); cal20.push({ b, m }); }
      const lock = grp(sG, -3.3, TOP, 0.4); put(lock, rbox(1.0, 0.8, 0.5, P.gold, 0.1)); const sh = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 8, 16, Math.PI), M(P.gray)); sh.position.set(0, 0.8, 0); lock.add(sh);
      card('<small>Loyer</small><b><span class="a">0</span> à <span class="b">0</span> % des ventes</b>', "sm", { get: () => V(-2.2, 4.4, -2.4) }, 36.6, 40.4, [[0, 8], [1, 18]]);
      card('<small>Fixé pour</small><b>20 ans</b>', "coral sm", { get: () => V(0, 1.6, 2.4) }, 38.0, 40.4);
      defScene(36.1, 40.55, sG, (t) => {
        tilesIn(sGt, t, 36.1); appear(landlord, t, 36.2, null, "y", 0.6); appear(resG, t, 36.4, null, "pop", 0.5); appear(lock, t, 38.6, null, "pop", 0.4);
        cal20.forEach(({ b, m }, i) => { appear(b, t, 37.6 + i * 0.05, null, "y", 0.3); m.color.copy(whiteC).lerp(lavC, prog(t, 37.8 + i * 0.05, 0.2)); });
      });

      /* H · 40.55 – 46.85 : ingredients + staff */
      const sH = mkStage(); const sHt = floor(sH, 9, 9, checker("#eaf7ee", "#dff1e6"), "#a9e0c4", "#7fcba5");
      const crates = [crate(sH, -3.3, -1.0, RED, RED), crate(sH, -3.3, 0.2, GRN, GRN), crate(sH, -2.1, -0.4, BUN, YEL), crate(sH, -3.3, 1.4, RED, RED)];
      const staff = [person(sH, P.coral, false), person(sH, P.sky, false), person(sH, P.lilac, false), person(sH, P.peach, false)];
      const barI = rbox(1.3, 3.0, 1.3, RED, 0.12); put(sH, barI, -1.0, TOP, 3.0); const barS = rbox(1.3, 3.2, 1.3, P.sky, 0.12); put(sH, barS, 2.6, TOP, 3.0);
      const stove = grp(sH, 2.4, TOP, -2.4); put(stove, rbox(2.6, 0.9, 1.2, P.gray, 0.08)); for (let k = 0; k < 3; k++) put(stove, cyl(0.28, 0.28, 0.05, "#5a5878", 16), -0.8 + k * 0.8, 0.92, 0);
      card('<small>Ingrédients</small><b>environ <span class="a">0</span> %</b>', "coral sm", { get: () => V(-1.0, 3.7, 3.0) }, 41.2, 46.6, [[0, 30]]);
      card('<small>Équipes</small><b><span class="a">0</span> à <span class="b">0</span> %</b>', "sm", { get: () => V(2.6, 4.0, 3.0) }, 43.2, 46.6, [[0, 30], [1, 35]]);
      defScene(40.55, 46.85, sH, (t) => {
        tilesIn(sHt, t, 40.55); crates.forEach((c, i) => appear(c, t, 40.7 + i * 0.1, null, "pop", 0.4)); appear(stove, t, 41.0, null, "pop", 0.5);
        staff.forEach((s_, i) => { appear(s_.g, t, 41.8 + i * 0.15, null, "pop", 0.4); s_.g.position.set(1.0 + i * 0.7, TOP, -0.4 + Math.sin(t * 1.5 + i) * 0.4); s_.g.rotation.y = Math.PI / 2; walk(s_, t, 6); });
        appear(barI, t, 41.2, null, "y", 0.8); barI.scale.y = Math.max(0.001, 0.8 * popS(t, 41.2, 0.8)); appear(barS, t, 43.2, null, "y", 0.8); barS.scale.y = Math.max(0.001, 1.0 * popS(t, 43.2, 0.8));
      });

      /* I · 46.85 – 49.5 : the sum, only a few euros out of 100 remain */
      const sI = mkStage(); const sIt = floor(sI, 9, 9, checker("#f6f4ff", "#ece8fc"));
      const calc = grp(sI, 0, TOP, -1.2); put(calc, rbox(3.4, 0.5, 4.2, P.lilac, 0.15)); put(calc, rbox(2.9, 0.12, 0.9, "#2f2e7a", 0.04), 0, 0.5, -1.5);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) put(calc, rbox(0.7, 0.14, 0.6, (r + c) % 3 ? P.white : P.coral, 0.05), -0.9 + c * 0.9, 0.5, -0.5 + r * 0.7);
      const cI = coinStack(sI, 10, 2.9, 2.4); cI.g.scale.setScalar(0.9);
      const coinsOut = []; for (let i = 0; i < 9; i++) coinsOut.push(cI.arr[i + 1]);
      card('<small>Il reste</small><b>quelques euros</b>', "mint", { get: () => V(2.9, 3.0, 2.4) }, 47.5, 49.4);
      card('<small>Sur 100 €</small><b>l’addition</b>', "sm", { get: () => V(0, 2.2, -1.2) }, 46.95, 48.2);
      defScene(46.85, 49.5, sI, (t) => {
        tilesIn(sIt, t, 46.85); appear(calc, t, 46.95, null, "pop", 0.5);
        cI.arr.forEach((c, k) => { const p0 = prog(t, 47.1 + k * 0.05, 0.3); const gone = k > 0 ? prog(t, 47.9 + (k - 1) * 0.1, 0.35) : 0; c.visible = p0 > 0 && gone < 1; c.position.set(0, 0.08 + k * 0.17 + (1 - bounce(p0)) * 3, 0); c.position.x = gone * 3; c.position.y += gone * 2; c.scale.setScalar(Math.max(1 - gone, 0.001)); });
      });

      /* J · 49.5 – 54.4 : the brand skims a percentage on every sale */
      const sJ = mkStage(); const sJt = floor(sJ, 9, 9, checker("#f1e4f7", "#e6d4f0"), "#c9a6e6", "#a07ecf");
      const regJ = register(sJ, -1.2, 1.4, 1.1); const hqJ = hq(sJ, 2.8, -2.6); const pathJ = [[-0.3, 1.0], [1.8, 1.0], [1.8, -1.0], [2.8, -1.0]]; const beltJ = belt(sJ, pathJ, 0.7, P.gold); const flowJ = flowCoins(sJ, pathJ, 9);
      const custs = [person(sJ, P.sky, false), person(sJ, P.mint, false), person(sJ, P.peach, false)];
      card('<small>Un pourcentage</small><b>sur chaque vente</b>', "gold sm", { get: () => V(0.8, 3.0, 1.2) }, 50.0, 54.2);
      defScene(49.5, 54.4, sJ, (t) => {
        tilesIn(sJt, t, 49.5); appear(regJ, t, 49.6, null, "pop", 0.5); appear(hqJ, t, 49.7, null, "y", 0.6); appear(beltJ, t, 50.2, null, "y", 0.4); flowJ.update(t, 50.6, 0.5, true);
        custs.forEach((c, i) => { appear(c.g, t, 49.9 + i * 0.1, null, "pop", 0.3); c.g.position.set(-3.2 + i * 0.8 + ((t * 0.4) % 1) * 0.6, TOP, 1.4); c.g.rotation.y = Math.PI / 2; walk(c, t, 5); });
      });

      /* K · 54.4 – 58.8 : the risk stays with the franchisee (heavy boulders on his side of the seesaw) */
      const sK = mkStage(); const sKt = floor(sK, 9, 9, checker("#ffe9d6", "#ffdfc4"), "#f5b9a1", "#e898a8");
      const resK = restaurant(sK, -1.0, -2.6, 0.9);
      const sunK = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 18), new THREE.MeshStandardMaterial({ color: "#ffe9b0", emissive: "#ffd27a", emissiveIntensity: 1.2 })); sunK.position.set(4.2, 3.5, -5.5); sK.add(sunK);
      const seesaw = grp(sK, 1.2, TOP, 1.8); put(seesaw, rbox(0.5, 0.9, 0.7, P.gray, 0.08)); const plank = grp(seesaw, 0, 0.9, 0); put(plank, rbox(4.4, 0.16, 0.8, P.lilac, 0.05), 0, 0, 0);
      const boulders = [0, 1, 2].map((i) => { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 - i * 0.05, 0), M(i % 2 ? "#ff9fa3" : RED)); b.position.set(1.6 - i * 0.2, 0.55 + i * 0.5, 0); b.castShadow = true; plank.add(b); return b; });
      const fr = person(plank, P.navy, true); fr.g.position.set(-1.6, 0.08, 0); fr.g.scale.setScalar(1.0); const brand = person(plank, P.mint, false); brand.g.position.set(1.7, 0.08, 0.0); brand.g.scale.setScalar(0.001);
      const keyK = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16), M(P.gold)); keyK.position.set(-1.35, 1.25, 0.2); plank.add(keyK);
      const shutter = put(sK, rbox(2.6, 1.3, 0.1, P.gray, 0.03), -1.2, TOP, -1.2);
      card('<small>Le risque</small><b>reste au franchisé</b>', "coral sm", { get: () => V(1.2, 4.4, 1.8) }, 55.0, 58.6);
      defScene(54.4, 58.8, sK, (t) => {
        tilesIn(sKt, t, 54.4); appear(resK, t, 54.5, null, "pop", 0.5); appear(seesaw, t, 54.7, null, "pop", 0.5); appear(sunK, t, 54.5, null, "pop", 0.6);
        const tilt = 0.28 * eOutBack(prog(t, 55.4, 1.0)); plank.rotation.z = tilt; fr.g.rotation.z = -tilt; boulders.forEach((b, i) => { b.rotation.x = t * 0.2 * (i + 1); });
        shutter.position.y = TOP + 1.3 * eInOut(prog(t, 54.8, 1.2)); shutter.visible = shutter.position.y < TOP + 2.55;
      });

      /* L · 58.8 – 66.4 : not just a restaurant, a contract where the brand is paid first */
      const sL = mkStage(); const sLt = floor(sL, 9, 9, checker("#f6f4ff", "#ece8fc"));
      const deskL = grp(sL, 0, TOP, 0.4); put(deskL, rbox(5.2, 0.2, 3.4, P.lilac, 0.08), 0, 1.0, 0); for (const [x, z] of [[-2.4, -1.5], [2.4, -1.5], [-2.4, 1.5], [2.4, 1.5]]) put(deskL, rbox(0.2, 1.0, 0.2, P.lilac, 0.05), x, 0, z);
      const paper = put(deskL, rbox(2.6, 0.06, 3.0, "#ffffff", 0.03), -0.8, 1.2, 0); for (let i = 0; i < 6; i++) put(deskL, rbox(2.0, 0.02, 0.1, "#cfcce4", 0.01), -0.8, 1.27, -1.0 + i * 0.4); const stamp = put(deskL, cyl(0.45, 0.45, 0.06, RED, 20), -0.2, 1.3, 1.1);
      const resL = restaurant(deskL, 1.4, 0.0, 0.42); resL.position.y = 1.2 - TOP + TOP;
      const payQ = [[-3.4, 3.4], [-0.5, 3.4], [-0.5, 2.9]]; const brandBox = rbox(1.4, 0.8, 1.4, P.gold, 0.1); put(sL, brandBox, 3.2, TOP, 3.2); const frBox = rbox(1.4, 0.5, 1.4, P.sky, 0.1); put(sL, frBox, -3.4, TOP, 3.2);
      const coinsQ = []; for (let i = 0; i < 6; i++) { const c = cyl(0.3, 0.3, 0.1, i === 0 ? P.gold : "#ffe9a8", 18); sL.add(c); coinsQ.push(c); }
      card('<small>Un franchisé possède</small><b>un contrat</b>', "sm", { get: () => V(-0.8, 3.0, 0.4) }, 59.4, 62.4);
      card('<small>Payée en premier</small><b>la marque</b>', "gold sm", { get: () => V(3.2, 2.4, 3.2) }, 63.2, 66.2);
      defScene(58.8, 66.4, sL, (t) => {
        tilesIn(sLt, t, 58.8); appear(deskL, t, 58.9, null, "pop", 0.5); appear(resL, t, 59.5, null, "pop", 0.5); appear(stamp, t, 61.0, null, "pop", 0.3); stamp.position.y = 1.3 + Math.max(0, 0.4 - Math.abs(t - 61.2) * 2);
        appear(brandBox, t, 62.6, null, "pop", 0.5); appear(frBox, t, 62.8, null, "pop", 0.5);
        coinsQ.forEach((c, i) => { const f = prog(t, 63.0 + i * 0.35, 1.0); c.visible = f > 0 && f < 1.0; const e = eInOut(f); const tx = i === 0 || i === 2 || i === 4 ? 3.2 : -3.4; c.position.set(lerp(0, tx, e), TOP + 0.6 + Math.sin(e * Math.PI) * 1.8, lerp(-1.2, 3.2, e)); c.rotation.y = t * 6; });
      });

      /* M · 66.4 – 70.3 : finale, golden hour, the queue fills the till, the title lands */
      const sM = mkStage(); sM.userData.noDecor = true; const sMt = floor(sM, 9, 9, (i, j) => (j >= 6 ? "#9a93d2" : j === 5 ? "#f6e9ee" : (i + j) % 2 ? "#fff4f0" : "#fbe8e3"), "#f1c9c3", "#d9a4c8");
      const rM = restaurant(sM, -1.4, -2.2, 1.0); const qM = []; for (let i = 0; i < 12; i++) qM.push(person(sM, qCol[i], false));
      const regM = register(sM, 2.8, 0.0, 1.0); const cM = coinStack(sM, 12, 3.0, 1.9); const mProps = [tree(sM, -3.8, -3.6), tree(sM, 3.8, -3.6, 1.1), lamp(sM, 3.4, 0.6), lamp(sM, -3.6, 0.6), lamp(sM, 0, 4.6)];
      const confM = []; const crM = rng(21); const CCOL = [P.coral, P.gold, P.mint, P.sky, P.lilac, P.peach];
      for (let i = 0; i < 70; i++) { const m = rbox(0.14, 0.14, 0.05, CCOL[i % 6], 0.02); m.castShadow = false; m.visible = false; scene.add(m); const a = crM() * Math.PI * 2, sp = 3.5 + crM() * 4; confM.push({ m, v: [Math.cos(a) * sp * 0.6, 4 + crM() * 5, Math.sin(a) * sp * 0.6], spin: [crM() * 8, crM() * 8, crM() * 8] }); }
      const rainM = []; const rrM = rng(33); for (let k = 0; k < T.rain[2]; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 20), M(P.gold)); c.castShadow = true; c.visible = false; scene.add(c); rainM.push({ c, x: -3 + rrM() * 6, z: -3 + rrM() * 6, k, sp: 2 + rrM() * 5 }); }
      const tcv = document.createElement("canvas"); tcv.width = 2048; tcv.height = 560;
      const titleTex = new THREE.CanvasTexture(tcv); titleTex.colorSpace = THREE.SRGBColorSpace; titleTex.anisotropy = 4;
      function drawTitle() { const c = tcv.getContext("2d"); c.clearRect(0, 0, tcv.width, tcv.height); c.textAlign = "center"; c.textBaseline = "middle"; c.font = "900 210px DecryptInter, Inter, sans-serif"; c.fillStyle = "#2f2e7a"; c.fillText("DECRYPT", 1024, 170); c.fillStyle = "#c98a00"; c.fillText("BUSINESS", 1024, 380); c.fillStyle = "#7b5cf0"; c.fillRect(300, 505, 1448, 14); titleTex.needsUpdate = true; }
      drawTitle(); document.fonts.load("900 100px DecryptInter").then(() => { drawTitle(); renderAt(window.__hfThreeTime || 0); });
      const plaque = grp(sM, 6.6, 0, 6.6); put(plaque, rbox(9.6, 0.4, 3.4, P.white, 0.12), 0, -0.2, 0);
      const tp = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 2.46), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true })); tp.rotation.x = -Math.PI / 2; tp.position.set(0, 0.215, 0); plaque.add(tp);
      defScene(66.4, 71, sM, (t) => {
        tilesIn(sMt, t, 66.4); appear(rM, t, 66.5, null, "pop", 0.5); appear(regM, t, 66.6, null, "pop", 0.4); mProps.forEach((o, i) => appear(o, t, 66.7 + i * 0.1, null, "pop", 0.4));
        qM.forEach((q, i) => { appear(q.g, t, 66.6 + i * 0.06, null, "pop", 0.3); q.g.position.set(1.9 + i * 0.62, TOP, 0.9); q.g.rotation.y = -Math.PI / 2; });
        updCoins(cM, t, 66.9, 0.12, null);
        const pp = prog(t, T.plaque, 0.8); plaque.visible = pp > 0; plaque.position.y = lerp(-4, 0, eOutBack(pp)); plaque.scale.setScalar(Math.max(0.2 + 0.8 * eOut(pp), 0.001));
        const d = t - T.burst; confM.forEach(({ m, v, spin }) => { if (d < 0 || d > 2.2) { m.visible = false; return; } m.visible = true; m.position.set(2.8 + v[0] * d, TOP + 3.0 + v[1] * d - 4.5 * d * d, v[2] * d); m.rotation.set(spin[0] * d, spin[1] * d, spin[2] * d); m.scale.setScalar(Math.max(1 - 0.8 * prog(d, 1.4, 0.8), 0.001)); });
        rainM.forEach(({ c, x, z, k, sp }) => { const dd = t - (T.rain[0] + k * T.rain[1]); if (dd < 0 || dd > 1.3) { c.visible = false; return; } c.visible = true; const f = Math.min(dd / 0.8, 1); const by = dd > 0.8 ? Math.abs(Math.sin((dd - 0.8) * 9)) * 0.35 * Math.max(1 - (dd - 0.8) / 0.5, 0) : 0; c.position.set(x, lerp(13, TOP + 0.1, f * f) + by, z); c.rotation.set(dd * sp, 0, dd * sp * 0.5); c.scale.setScalar(Math.max(1 - prog(dd, 1.0, 0.3), 0.001)); });
      });

      /* ---------- ambient sky ---------- */
      const clouds = [];
      [[-9, 5, -8, 1], [8, 6, -9, 1.2], [-3, 8, -11, 0.9], [11, 4, -4, 1.0]].forEach(([x, y, z, sc], i) => {
        const g = grp(scene, x, y, z); [[0, 0, 0, 1], [0.9, -0.1, 0.2, 0.75], [-0.9, -0.15, 0, 0.7]].forEach(([dx, dy, dz, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 })); m.position.set(dx, dy, dz); g.add(m); }); g.scale.setScalar(sc); clouds.push({ g, x, i });
      });
      const islets = [[-3, -1.2, 7.2, 1.3], [6.6, -0.6, -2.4, 1.1]].map(([x, y, z, sc], i) => { const g = grp(scene, x, y, z); g.scale.setScalar(sc); put(g, rbox(2.4, 0.5, 2.4, P.deep, 0.1), 0, -0.65, 0); put(g, rbox(2.4, 0.3, 2.4, i ? "#d3efe3" : P.white, 0.06), 0, -0.15, 0); const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), M(P.mint)); c.position.set(0.3, 0.55, 0.2); c.castShadow = true; g.add(c); return { g, y, i }; });

      /* ---------- camera ---------- */
      const shots = [
        [0, 1.6, [1.2, 2.2, -0.6, 1.9], [0, 2.4, 0, 1.0], "io"], [1.6, 4.8, [0, 2.4, 0, 1.0], [-0.4, 2.2, 0.4, 1.16], "l"],
        [4.8, 8.5, [0, 1.8, 0, 1.0], [0.6, 1.8, 0.4, 1.16], "l"],
        [8.5, 13.96, [0, 1.6, 0, 1.0], [0, 1.4, 0, 1.2], "l"],
        [13.96, 16.3, [-0.8, 1.2, -0.6, 1.2], [0.6, 1.2, 0.4, 1.2], "l"], [16.3, 23.8, [1.6, 2.2, 2.2, 1.25], [0.6, 2.4, 2.4, 1.4], "io"],
        [23.8, 28.95, [0.2, 2.0, 0, 1.05], [0.6, 2.2, -0.2, 1.2], "l"],
        [28.95, 36.1, [0, 2.6, 0, 1.0], [0, 2.8, 0, 1.16], "l"],
        [36.1, 40.55, [0, 1.8, 0, 1.0], [0, 1.9, 0.4, 1.16], "l"],
        [40.55, 46.85, [0, 2.2, 0.8, 1.0], [0, 2.4, 0.6, 1.14], "l"],
        [46.85, 49.5, [0.8, 1.6, 0.4, 1.3], [1.4, 1.8, 0.6, 1.5], "l"],
        [49.5, 54.4, [0.8, 2.2, 0, 1.1], [0.4, 2.4, 0, 1.22], "l"],
        [54.4, 58.8, [0, 2.0, 0, 1.1], [0.4, 2.2, 0.4, 1.24], "l"],
        [58.8, 62.5, [0, 1.8, 0.4, 1.15], [0, 2.0, 0.4, 1.3], "l"], [62.5, 66.4, [0, 1.6, 1.4, 1.1], [0.6, 1.8, 2.0, 1.2], "l"],
        [66.4, 70.3, [0.4, 2.2, 0.4, 1.0], [1.5, 1.2, 1.5, 0.8], "io"],
      ];
      function camAt(t) {
        let s = shots[shots.length - 1]; for (const sh of shots) if (t < sh[1]) { s = sh; break; }
        const p = prog(t, s[0], s[1] - s[0]); const k = s[4] === "io" ? eInOut(p) : p * p * (3 - 2 * p) * 0.6 + p * 0.4;
        const v = s[2].map((q, i) => lerp(q, s[3][i], k));
        v[3] *= 1.1; if (T.cuts.some((c) => Math.abs(c - s[0]) < 0.01)) v[3] *= 1 + 0.12 * (1 - eOut(prog(t, s[0], 0.3)));
        return v;
      }
      const dirv = new THREE.Vector3(1, 1, 1).normalize();
      const rootEl = document.getElementById("root"), grainEl = document.getElementById("grain"), capEl = document.getElementById("cap");
      const hlfadeEl = document.getElementById("hlfade"), flashEl = document.getElementById("flash");
      const KEYS = [
        [-9, 0.1, ["#fff1dc", "#fde0cf", "#f2bcd0"], "#ffe9d6", 2.0, "#f7cfd6", 1.25],
        [8.1, 0.8, ["#efeafd", "#d8cff7", "#b9a8f0"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [13.6, 0.8, ["#e3f1fb", "#c3e0f6", "#9fc8ee"], "#f4f8ff", 2.0, "#b8cdf0", 1.25],
        [23.4, 0.8, ["#efe6fb", "#d9c8f4", "#b49ae6"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [35.8, 0.8, ["#e9ecf9", "#cfd6f1", "#aab6e6"], "#f4f6ff", 2.0, "#b8c0ee", 1.25],
        [40.2, 0.8, ["#eaf7ee", "#d3f0e2", "#b3e2f0"], "#fffbea", 2.2, "#c6ead8", 1.25],
        [46.5, 0.8, ["#efeafd", "#d8cff7", "#b9a8f0"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [54.1, 0.8, ["#ffe3cf", "#f8c3c0", "#c49be0"], "#ffd9b0", 2.3, "#f2b6c4", 1.2],
        [58.5, 0.8, ["#efeafd", "#d8cff7", "#b9a8f0"], "#fff6ee", 2.1, "#cfc4f5", 1.25],
        [66.3, 3.5, ["#ffeedd", "#f9cdbf", "#c9a2e8"], "#ffc98a", 2.5, "#f2b6c4", 1.15],
      ];
      const rgbs = (c) => `rgb(${c.map(Math.round).join(",")})`;
      const hxs = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
      function moodAt(t) {
        let sky = KEYS[0][2].map(hex2), sun = hex2(KEYS[0][3]), hg = hex2(KEYS[0][5]), sunI = KEYS[0][4], hemiI = KEYS[0][6];
        for (let i = 1; i < KEYS.length; i++) {
          const k = eInOut(prog(t, KEYS[i][0], KEYS[i][1]));
          sky = sky.map((c, j) => c.map((v, q) => lerp(v, hex2(KEYS[i][2][j])[q], k)));
          sun = sun.map((v, q) => lerp(v, hex2(KEYS[i][3])[q], k)); hg = hg.map((v, q) => lerp(v, hex2(KEYS[i][5])[q], k)); sunI = lerp(sunI, KEYS[i][4], k); hemiI = lerp(hemiI, KEYS[i][6], k);
        }
        return { sky: sky.map(rgbs), top: sky[0].map(Math.round).join(","), sun: hxs(sun), hg: hxs(hg), sunI, hemiI };
      }

      /* captions: rolling 3-4 word windows, one line, word by word */
      const capGroups = []; { let cur = []; let len = 0; const W_ = window.WORDS;
        W_.forEach((w, i) => { cur.push(w); len += w[0].length + 1; const end = /[.,?!]$/.test(w[0]); if (cur.length >= 4 || (cur.length >= 3 && len > 22) || (end && cur.length >= 2) || i === W_.length - 1) { capGroups.push(cur); cur = []; len = 0; } });
        if (cur.length) capGroups.push(cur); }
      let capIdx = -2;
      function renderAt(t) {
        scenes.forEach((s) => { const on = t >= s.t0 - 0.001 && t < s.t1; s.g.visible = on; if (on) s.update(t); });
        clouds.forEach(({ g, x, i }) => { g.position.x = ((x + t * (0.25 + i * 0.05) + 14) % 28) - 14; });
        islets.forEach(({ g, y, i }) => { g.position.y = y + Math.sin(t * 0.8 + i * 2) * 0.25; });
        const golden = prog(t, 66.3, 3.5);
        lampMats.forEach((lm) => { lm.emissiveIntensity = golden * 1.6; }); winMat.emissiveIntensity = golden * 1.2;
        flashEl.style.opacity = Math.max(0.35 * (1 - prog(t, 0, 0.3)), t >= T.burst ? 0.55 * (1 - prog(t, T.burst, 0.4)) : 0, t >= T.plaque ? 0.45 * (1 - prog(t, T.plaque, 0.4)) : 0, prog(t, T.loopFlash, 0.65)).toFixed(3);
        const md = moodAt(t);
        sun.color.set(md.sun); sun.intensity = md.sunI + 0.4 * golden; sun.position.set(-12 - 4 * golden, 22 - 10 * golden, 9 + 2 * golden);
        hemi.groundColor.set(md.hg); hemi.intensity = md.hemiI;
        rootEl.style.background = `linear-gradient(180deg, ${md.sky[0]} 0%, ${md.sky[1]} 45%, ${md.sky[2]} 100%)`;
        hlfadeEl.style.background = `linear-gradient(180deg, rgba(${md.top},.9) 0%, rgba(${md.top},.62) 55%, rgba(${md.top},0) 100%)`;
        const [cx, cy, cz, zoom] = camAt(t);
        cam.zoom = zoom; cam.updateProjectionMatrix(); cam.position.set(cx, cy, cz).addScaledVector(dirv, 80); cam.lookAt(cx, cy, cz); cam.updateMatrixWorld();
        for (const c of cards) {
          const s = eOutBack(prog(t, c.t0, 0.45)) * (1 - eOut(prog(t, c.t1, 0.3)));
          if (s <= 0.01) { c.d.style.opacity = 0; continue; }
          if (c.count) { const e = eOut(prog(t, c.t0 + 0.15, 0.9)); c.count.forEach(([idx, v]) => { c.spans[idx].textContent = fmt(v * e); }); }
          const [sx, sy] = toScreen(c.anchor.get()); const hw = (c.d.offsetWidth || 300) / 2 + 24; const cxp = Math.min(W - hw, Math.max(hw, sx));
          c.d.style.opacity = Math.min(1, s * 1.5); c.d.style.transform = `translate(${cxp}px,${sy}px) translate(-50%,-100%) scale(${s})`;
        }
        let gi = -1; capGroups.forEach((g, k) => { if (t >= g[0][1] - 0.04) gi = k; });
        const grp_ = gi >= 0 ? capGroups[gi] : null; const lastEnd = grp_ ? grp_[grp_.length - 1][2] : 0;
        if (gi !== capIdx) { capIdx = gi; capEl.innerHTML = grp_ ? grp_.map((w) => `<span>${w[0]}</span>`).join(" ") : ""; }
        if (grp_) { capEl.style.opacity = t <= lastEnd + 0.35 ? 1 : 0; [...capEl.children].forEach((sp, k) => { const on = t >= grp_[k][1] && t < grp_[k][2] + 0.05; sp.style.opacity = t >= grp_[k][1] ? 1 : 0.6; sp.style.color = on ? "#5b3fd0" : "#2f2e7a"; }); } else capEl.style.opacity = 0;
        grainEl.style.backgroundPosition = `${(Math.round(t * 30) % 7) * 37}px ${(Math.round(t * 30) % 5) * 53}px`;
        renderer.render(scene, cam);
        fxbCtx.clearRect(0, 0, 540, 960); fxbCtx.drawImage(glCanvas, 0, 0, 540, 960);
        fxgCtx.clearRect(0, 0, 270, 480); fxgCtx.drawImage(glCanvas, 0, 0, 270, 480);
      }
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
      document.fonts.ready.then(() => renderAt(window.__hfThreeTime || 0));
      renderAt(window.__hfThreeTime || 0);
