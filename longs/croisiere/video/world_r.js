      /* ---------- cruise builders ---------- */
      const popO = (o, t, t0, d = 0.45, s0 = 1) => { const k = pop(t, t0, d); o.visible = k > 0.01; o.scale.setScalar(s0 * k); return k; };
      const dropStack = (st, t, t0, step = 0.05, hh = 3) => st.cs.forEach((c, k) => { const p0 = prog(t, t0 + k * step, 0.3); c.visible = p0 > 0; c.position.y = 0.08 + k * 0.17 + (1 - bounce(p0)) * hh; });
      const seaM = () => new THREE.MeshStandardMaterial({ color: "#1d7a9a", roughness: 0.25, metalness: 0.15 });
      const sea = (p, r = 14) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 56), seaM()); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.receiveShadow = true; p.add(m); return m; };
      function ship(p, o = {}) { const L = o.L || 15, s = o.s || 1, hull = o.hull || "#1f3f66", acc = o.acc || "#d8403a"; const g = grp(p); g.scale.setScalar(s);
        const hm = mat(hull, { roughness: 0.4, metalness: 0.2 }), wm = mat("#f4f7f6", { roughness: 0.4 }), wn = new THREE.MeshStandardMaterial({ color: "#bfe6f0", emissive: P.sky, emissiveIntensity: 0.6, roughness: 0.1 });
        put(g, rb(L, 2.2, 3.8, hull, 0.3, hm), 0, 0.2, 0); const bow = rb(2.7, 2.2, 2.7, hull, 0.3, hm); bow.rotation.y = Math.PI / 4; bow.position.set(L / 2, 0.2, 0); g.add(bow);
        put(g, rb(L + 1.6, 0.18, 3.5, acc, 0.05, mat(acc, { roughness: 0.4 })), -0.2, 1.5, 0);
        for (let i = 0; i < 5; i++) { const w = L * (0.78 - i * 0.07), d = 3.3 - i * 0.18; put(g, rb(w, 0.95, d, "#f4f7f6", 0.18, wm), -L * 0.04, 2.4 + i * 0.95, 0); const st = rb(w - 0.8, 0.26, d + 0.06, "#bfe6f0", 0.05, wn); st.castShadow = false; st.position.set(-L * 0.04, 2.7 + i * 0.95, 0); g.add(st); }
        const fn = cyl(0.9, 1.0, 1.9, acc, 14, mat(acc, { roughness: 0.35 })); fn.position.set(L * 0.1, 7.9, 0); g.add(fn); put(g, rb(1.2, 0.3, 1.2, "#ffffff", 0.05), L * 0.1 - 0.6, 8.3, -0.6);
        for (let i = 0; i < 6; i++) { const lb = rb(0.9, 0.38, 0.55, "#ff9a4a", 0.12, mat("#ff9a4a", { roughness: 0.5 })); lb.position.set(-L * 0.3 + i * 1.8, 1.7, 1.85); g.add(lb); }
        const pool = rb(2.6, 0.12, 1.8, "#3ac6ff", 0.05, emis("#3ac6ff", 0.5)); pool.position.set(-L * 0.3, 7.15, 0); g.add(pool);
        return g; }
      const bobShip = (g, t, k = 0.15, ph = 0) => { g.position.y = Math.sin(t * 0.9 + ph) * k; g.rotation.z = Math.sin(t * 0.7 + ph) * 0.012; };
      const barC = (p, x, w, d, col) => { const b = rb(w, 1, d, col, 0.1, mat(col, { roughness: 0.35 })); b.position.set(x, 0, 0); p.add(b); b.visible = false; return b; };
      const arrowDown = (p, col = P.red, s = 1) => { const g = arrowUp(p, col, s); g.rotation.z = Math.PI; return g; };
      const stackBar = (p, x, w, d) => { const b = rb(w, 1, d, "#43e0a6", 0.1, mat("#43e0a6", { roughness: 0.35 })); b.position.set(x, 0, 0); p.add(b); return b; };
      const arrowUp = (p, col = P.red, s = 1) => { const g = grp(p); g.scale.setScalar(s); const sh = rb(0.8, 2.2, 0.8, col, 0.1, mat(col, { roughness: 0.35 })); g.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.5, 4), mat(col, { roughness: 0.35 })); hd.position.y = 3.0; hd.castShadow = true; g.add(hd); return g; };
      const calendar = (p) => { const g = grp(p); put(g, rb(6.0, 4.4, 0.3, "#f4f7f6", 0.15, mat("#f4f7f6", { roughness: 0.4 })), 0, 0, 0); put(g, rb(6.0, 0.9, 0.34, P.red, 0.1, mat(P.red, { roughness: 0.4 })), 0, 3.5, 0); const cells = []; for (let i = 0; i < 12; i++) { const c = rb(1.2, 0.8, 0.2, P.blue, 0.05, mat("#cfe8f5", { roughness: 0.5 })); c.position.set(-2.1 + (i % 4) * 1.4, 2.2 - Math.floor(i / 4) * 1.15, 0.2); g.add(c); cells.push(c); } return { g, cells }; };
