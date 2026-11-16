      /* ---------- cruise builders ---------- */
      const popO = (o, t, t0, d = 0.45, s0 = 1) => { const k = pop(t, t0, d); o.visible = k > 0.01; o.scale.setScalar(s0 * k); return k; };
      const dropStack = (st, t, t0, step = 0.05, hh = 3) => st.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * step, 0.3); c.visible = p0 > 0; c.position.y = 0.08 + k * 0.17 + (1 - bounce(p0)) * hh; });
      const seaM = () => new THREE.MeshStandardMaterial({ color: "#9b7a58", roughness: 0.55, metalness: 0.0 });
      const sea = (p, r = 14) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 56), seaM()); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.receiveShadow = true; p.add(m); return m; };
      function ship(p, o = {}) { const L = (o.L || 15) * 0.85, s = o.s || 1, hull = o.hull || "#7b4a2e", acc = o.acc || "#d8403a"; const g = grp(p); g.scale.setScalar(s * 1.15);
        const hm = mat(hull, { roughness: 0.55 }), wm = mat("#f4f1ea", { roughness: 0.5 }), gl = new THREE.MeshStandardMaterial({ color: "#ffe6b0", emissive: "#ffb95a", emissiveIntensity: 0.7, roughness: 0.1 });
        put(g, rb(L, 5.2, 6.2, hull, 0.25, hm), 0, 0.1, 0); put(g, rb(L + 0.8, 0.5, 6.8, "#3a2418", 0.1), 0, 5.3, 0);
        const aw = rb(L + 0.8, 0.3, 2.8, acc, 0.05, mat(acc, { roughness: 0.5 })); aw.position.set(0, 3.9, 4.0); aw.rotation.x = 0.28; g.add(aw);
        const n = Math.max(4, Math.round(L / 1.6)); for (let k = 0; k < n; k += 2) { const st = rb((L + 0.8) / n, 0.32, 2.82, "#ffffff", 0.04, wm); st.position.set(-L / 2 - 0.4 + (k + 0.5) * (L + 0.8) / n, 3.92, 4.0); st.rotation.x = 0.28; g.add(st); }
        const dr = rb(1.7, 3.2, 0.25, "#3a2418", 0.08); dr.position.set(L * 0.28, 0.1, 3.15); g.add(dr);
        for (const wx of [-L * 0.28, 0.0]) { const w = rb(L * 0.2, 2.0, 0.22, "#ffe6b0", 0.06, gl); w.castShadow = false; w.position.set(wx, 1.1, 3.15); g.add(w); }
        const sg = rb(L * 0.45, 0.9, 0.3, "#f4f1ea", 0.1, wm); sg.position.set(0, 5.9, 3.0); g.add(sg);
        const cup = cyl(0.7, 0.5, 1.0, "#ffffff", 20, mat("#ffffff", { roughness: 0.35 })); cup.position.set(-L * 0.3, 6.4, 0.5); g.add(cup); const cf = cyl(0.58, 0.58, 0.05, "#5a3318", 20, mat("#5a3318", { roughness: 0.4 })); cf.position.set(-L * 0.3, 6.92, 0.5); g.add(cf);
        return g; }
      const cupB = (p, o = {}) => { const s = o.s || 1, col = o.col || "#ffffff"; const g = grp(p); g.scale.setScalar(s); const cm = mat(col, { roughness: 0.3 });
        put(g, cyl(2.4, 2.4, 0.18, "#ffffff", 32, mat("#ffffff", { roughness: 0.3 })), 0, 0.09, 0); const c = cyl(1.5, 1.05, 1.9, col, 32, cm); c.position.set(0, 1.15, 0); g.add(c); const cf = cyl(1.38, 1.38, 0.06, "#5a3318", 32, mat("#5a3318", { roughness: 0.35 })); cf.position.set(0, 2.08, 0); g.add(cf);
        const h = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 10, 20), cm); h.position.set(1.55, 1.2, 0); h.castShadow = true; g.add(h); return g; };
      const bobShip = (g, t, k = 0.15, ph = 0) => { g.rotation.y = Math.sin(t * 0.5 + ph) * 0.02; };
      const barC = (p, x, w, d, col) => { const b = rb(w, 1, d, col, 0.1, mat(col, { roughness: 0.35 })); b.position.set(x, 0, 0); p.add(b); b.visible = false; return b; };
      const arrowDown = (p, col = P.red, s = 1) => { const g = arrowUp(p, col, s); g.rotation.z = Math.PI; return g; };
      const stackBar = (p, x, w, d) => { const b = rb(w, 1, d, "#43e0a6", 0.1, mat("#43e0a6", { roughness: 0.35 })); b.position.set(x, 0, 0); p.add(b); return b; };
      const arrowUp = (p, col = P.red, s = 1) => { const g = grp(p); g.scale.setScalar(s); const sh = rb(0.8, 2.2, 0.8, col, 0.1, mat(col, { roughness: 0.35 })); g.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.5, 4), mat(col, { roughness: 0.35 })); hd.position.y = 3.0; hd.castShadow = true; g.add(hd); return g; };
      const calendar = (p) => { const g = grp(p); put(g, rb(6.0, 4.4, 0.3, "#f4f7f6", 0.15, mat("#f4f7f6", { roughness: 0.4 })), 0, 0, 0); put(g, rb(6.0, 0.9, 0.34, P.red, 0.1, mat(P.red, { roughness: 0.4 })), 0, 3.5, 0); const cells = []; for (let i = 0; i < 12; i++) { const c = rb(1.2, 0.8, 0.2, P.blue, 0.05, mat("#cfe8f5", { roughness: 0.5 })); c.position.set(-2.1 + (i % 4) * 1.4, 2.2 - Math.floor(i / 4) * 1.15, 0.2); g.add(c); cells.push(c); } return { g, cells }; };
