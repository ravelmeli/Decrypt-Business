
      /* ---------- restaurant builders ---------- */
      const popO = (o, t, t0, d = 0.45, s0 = 1) => { const k = pop(t, t0, d); o.visible = k > 0.01; o.scale.setScalar(s0 * k); return k; };
      const dropStack = (st, t, t0, step = 0.05, hh = 3) => st.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * step, 0.3); c.visible = p0 > 0; c.position.y = 0.08 + k * 0.17 + (1 - bounce(p0)) * hh; });
      const glassM = () => new THREE.MeshStandardMaterial({ color: "#ffe2a8", emissive: "#ffc060", emissiveIntensity: 0.65, roughness: 0.15, metalness: 0.1 });
      function resto(p, o = {}) { const w = o.w || 11, h = o.h || 4.2, d = o.d || 6, col = o.col || "#f3ead2", aw = o.aw || "#d8403a"; const g = grp(p); g.scale.setScalar(o.s || 1);
        put(g, rb(w, h, d, col, 0.14, mat(col, { roughness: 0.75 })), 0, 0, 0);
        put(g, rb(w + 0.6, 0.5, d + 0.6, "#8a4a2a", 0.1, mat("#8a4a2a", { roughness: 0.7 })), 0, h, 0);
        const n = 8; for (let i = 0; i < n; i++) { const st = rb(w / n, 0.16, 2.2, aw, 0.03, mat(i % 2 ? aw : "#f4f7f6", { roughness: 0.6 })); st.position.set((i - (n - 1) / 2) * (w / n), h - 1.3, d / 2 + 0.95); st.rotation.x = 0.4; g.add(st); }
        const win = rb(w * 0.5, 1.7, 0.12, "#ffe2a8", 0.04, glassM()); win.castShadow = false; win.position.set(-w * 0.14, 0.7, d / 2 + 0.05); g.add(win);
        put(g, rb(1.3, 2.3, 0.2, "#7a4b2a", 0.05, mat("#7a4b2a", { roughness: 0.7 })), w * 0.3, 0, d / 2 + 0.07);
        put(g, rb(w * 0.5, 0.8, 0.25, "#0f3a3f", 0.1, mat("#0f3a3f", { roughness: 0.4 })), 0, h + 0.5, d / 2 - 0.2); put(g, rb(w * 0.44, 0.1, 0.28, P.gold, 0.03, GOLD()), 0, h + 0.86, d / 2 - 0.2);
        put(g, rb(1, 1.6, 1, "#a8664a", 0.1, mat("#a8664a", { roughness: 0.85 })), -w * 0.3, h + 0.4, -d * 0.2);
        return g; }
      function chefHat(w) { put(w.g, cyl(0.21, 0.25, 0.34, "#ffffff", 14, mat("#ffffff", { roughness: 0.5 })), 0, 2.08, 0); const puff = sph(0.3, "#ffffff", 12, mat("#ffffff", { roughness: 0.5 })); puff.position.y = 2.38; w.g.add(puff); return w; }
      const chef = (p, i = 0, s = 0.95) => chefHat(worker(p, "#f4f7f6", s, civ(i)));
      const waiter = (p, i = 0, s = 0.9) => { const w = worker(p, "#23323a", s, civ(i)); const tr = cyl(0.42, 0.42, 0.05, "#cfd8dc", 16, mat("#cfd8dc", { roughness: 0.3, metalness: 0.7 })); tr.position.set(0.5, 1.45, 0.3); w.g.add(tr); const pl = sph(0.18, P.orange, 8); pl.position.set(0.5, 1.58, 0.3); w.g.add(pl); return w; };
      const platefood = (p, x, y, z, r = 0.5, col = P.orange) => { const g = grp(p, x, y, z); put(g, cyl(r, r * 0.9, 0.06, "#ffffff", 20, mat("#ffffff", { roughness: 0.25 })), 0, 0, 0); const f = sph(r * 0.45, col, 10, mat(col, { roughness: 0.6 })); f.position.y = r * 0.35; f.scale.y = 0.7; g.add(f); return g; };
      function tableSet(p, x, z, n = 2, shirts = [0, 3]) { const g = grp(p, x, 0, z); const tb = prop("round_wooden_table_01", 1.25, g); const items = [{ o: tb }];
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.6; const cx = Math.sin(a) * 1.45, cz = Math.cos(a) * 1.45; const ch = prop("dining_chair_02", 1.55, g); ch.position.set(cx, 0, cz); ch.rotation.y = a + Math.PI;
          const dn = adult(g, SHIRT[(shirts[i % shirts.length] + i) % 8], i + 1, 0.62); dn.legL.visible = false; dn.legR.visible = false; dn.g.position.set(cx * 0.9, 0.3, cz * 0.9); dn.g.rotation.y = a + Math.PI; items.push({ o: ch }, { o: dn.g, w: dn }); }
        const pf = platefood(g, 0, 1.28, 0, 0.45); items.push({ o: pf }); return { g, items }; }
      const grid100 = (p, x, z, cols = 10, step = 0.78) => { const g = grp(p, x, 0, z); const cs = []; for (let i = 0; i < 100; i++) { const c = cyl(0.3, 0.3, 0.12, P.gold, 14, mat("#2c6a74", { roughness: 0.5, metalness: 0.2 })); c.position.set((i % cols - (cols - 1) / 2) * step, 0.1, Math.floor(i / cols) * step); c.rotation.x = 0.0; g.add(c); cs.push(c); } return { g, cs }; };
      const stackBar = (p, x, w, d) => { const b = rb(w, 1, d, "#43e0a6", 0.1, mat("#43e0a6", { roughness: 0.35 })); b.position.set(x, 0, 0); p.add(b); return b; };
      const arrowUp = (p, col = P.red, s = 1) => { const g = grp(p); g.scale.setScalar(s); const sh = rb(0.8, 2.2, 0.8, col, 0.1, mat(col, { roughness: 0.35 })); g.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.5, 4), mat(col, { roughness: 0.35 })); hd.position.y = 3.0; hd.castShadow = true; g.add(hd); return g; };
      const calendar = (p) => { const g = grp(p); put(g, rb(6.0, 4.4, 0.3, "#f4f7f6", 0.15, mat("#f4f7f6", { roughness: 0.4 })), 0, 0, 0); put(g, rb(6.0, 0.9, 0.34, P.red, 0.1, mat(P.red, { roughness: 0.4 })), 0, 3.5, 0); const cells = []; for (let i = 0; i < 12; i++) { const c = rb(1.2, 0.8, 0.2, P.blue, 0.05, mat("#cfe8f5", { roughness: 0.5 })); c.position.set(-2.1 + (i % 4) * 1.4, 2.2 - Math.floor(i / 4) * 1.15, 0.2); g.add(c); cells.push(c); } return { g, cells }; };
