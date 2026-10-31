
      /* =====================================================================
         CAMERA, MOOD, OVERLAYS, RENDER
         ===================================================================== */
      const shots = B.shots.slice().sort((a, b) => a.t0 - b.t0);
      const camA = V(0, 0, 0), camL = V(0, 0, 0);
      function camAt(t) {
        let s = shots[0]; for (const sh of shots) if (t >= sh.t0 - 1e-6) s = sh;
        const p = prog(t, s.t0, Math.max(0.01, s.t1 - s.t0)); const k = s.ease === "io" ? eInOut(p) : p;
        camA.set(lerp(s.p0[0], s.p1[0], k), lerp(s.p0[1], s.p1[1], k), lerp(s.p0[2], s.p1[2], k));
        camL.set(lerp(s.l0[0], s.l1[0], k), lerp(s.l0[1], s.l1[1], k), lerp(s.l0[2], s.l1[2], k));
        camA.sub(camL).multiplyScalar(1.7).add(camL); camA.y += 1.5;
        camA.x += Math.sin(t * 0.7) * 0.25; camA.y += Math.sin(t * 0.9) * 0.12;
        let fov = s.fov; if (B.cuts.some((c) => Math.abs(c - s.t0) < 0.011)) fov *= 1 - 0.09 * (1 - eOut(prog(t, s.t0, 0.28)));
        return fov;
      }
      const KEYS = [
        [-9, 0.1, ["#090e2e", "#111a52", "#1b2a78"], "#fff0d0", 2.2, 1.0, "#141a45"],
        [T.night - 0.7, 0.8, ["#03061a", "#070c2a", "#0e1650"], "#7f9cff", 0.55, 0.5, "#0a1030"],
        [T.rain - 0.5, 0.8, ["#0c1226", "#18203c", "#2a3558"], "#c8d4f0", 1.0, 0.8, "#1a2240"],
        [T.spend - 0.5, 0.8, ["#090e2e", "#111a52", "#1b2a78"], "#fff0d0", 2.0, 1.0, "#141a45"],
        [T.finale - 0.3, 2.6, ["#14134a", "#5a2f78", "#f0a45a"], "#ffb870", 2.8, 1.0, "#7a3a60"],
      ];
      const rgbs = (c) => `rgb(${c.map(Math.round).join(",")})`;
      const hxs = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
      function moodAt(t) {
        let sky = KEYS[0][2].map(hex2), sun = hex2(KEYS[0][3]), sI = KEYS[0][4], hI = KEYS[0][5], hg = hex2(KEYS[0][6]);
        for (let i = 1; i < KEYS.length; i++) { const k = eInOut(prog(t, KEYS[i][0], KEYS[i][1]));
          sky = sky.map((c, j) => c.map((v, q) => lerp(v, hex2(KEYS[i][2][j])[q], k))); sun = sun.map((v, q) => lerp(v, hex2(KEYS[i][3])[q], k)); sI = lerp(sI, KEYS[i][4], k); hI = lerp(hI, KEYS[i][5], k); hg = hg.map((v, q) => lerp(v, hex2(KEYS[i][6])[q], k)); }
        return { sky: sky.map(rgbs), mid: hxs(sky[1]), sun: hxs(sun), sI, hI, hg: hxs(hg) };
      }
      const behind = (v) => { pvw.copy(v).applyMatrix4(cam.matrixWorldInverse); return pvw.z > -0.5; };
      const fmtT = (x) => x.toFixed(2);

      function renderAt(t) {
        U.forEach((f) => f(t));
        const fov = camAt(t); cam.fov = fov; cam.updateProjectionMatrix(); cam.position.copy(camA); cam.lookAt(camL); cam.updateMatrixWorld();
        const md = moodAt(t); sun.color.set(md.sun); sun.intensity = md.sI; hemi.intensity = md.hI; hemi.groundColor.set(md.hg); scene.fog.color.set(md.mid);
        sun.position.set(camL.x - 22, 36, camL.z + 20); sun.target.position.set(camL.x, 0, camL.z);
        rootEl.style.background = `linear-gradient(180deg, ${md.sky[0]} 0%, ${md.sky[1]} 45%, ${md.sky[2]} 100%)`;

        /* annotation pills with dashed leader lines */
        noteEls.forEach(({ n, el, lead }) => {
          const s = eOutBack(prog(t, n.t0, 0.25)) * (1 - prog(t, n.t1 - 0.2, 0.2));
          if (s <= 0.02) { el.style.opacity = 0; lead.style.opacity = 0; return; }
          let ax, ay, scr = false; if (n.anchor.startsWith("screen:")) { [ax, ay] = n.anchor.slice(7).split(",").map(Number); scr = true; } else { const o = ANCH[n.anchor]; const v = typeof o === "function" ? o() : o; if (behind(v)) { el.style.opacity = 0; lead.style.opacity = 0; return; } [ax, ay] = toScreen(v); }
          const px = clamp(ax + n.dx, 150, 930), py = clamp(ay + n.dy, 360, 1320);
          el.style.opacity = Math.min(1, s * 1.4); el.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%) scale(${s})`;
          if (scr) { lead.style.opacity = 0; return; }
          const sx = px, sy = py + 26, dx = ax - sx, dy = ay - sy, len = Math.hypot(dx, dy);
          lead.style.opacity = Math.min(1, s * 1.2); lead.style.width = Math.max(0, len * eOut(prog(t, n.t0 + 0.1, 0.25))) + "px"; lead.style.transform = `translate(${sx}px,${sy}px) rotate(${Math.atan2(dy, dx)}rad)`;
        });
        /* giant keywords */
        kwEls.forEach(({ k, el }) => { const p = prog(t, k.t0, 0.25), q = prog(t, k.t1 - 0.2, 0.2); const s = eOutBack(p) * (1 - q); el.style.opacity = s > 0.02 ? Math.min(1, s * 1.5) : 0; el.style.transform = `translateY(${(1 - eOut(p)) * -40}px) rotate(${k.rot}deg) scale(${Math.max(s, 0.001)})`; });
        /* stamps */
        stampEls.forEach(({ s: st, el }) => { const p = prog(t, st.t0, 0.3), q = prog(t, st.t1 - 0.25, 0.25); const op = (p > 0 ? 1 : 0) * (1 - q); el.style.opacity = op; el.style.transform = `translate(${st.x}px,${st.y}px) translate(-50%,-50%) rotate(${st.rot}deg) scale(${1 + (1 - eOutBack(p)) * 0.9})`; });
        /* data panels */
        panelEls.forEach(({ p, el, items }) => { const a = prog(t, p.t0, 0.4), q = prog(t, p.t1 - 0.3, 0.3); el.style.opacity = a * (1 - q); el.style.transform = `translateY(${(1 - eOut(a)) * 70}px) scale(${0.95 + 0.05 * eOut(a)})`;
          if (a <= 0 || q >= 1) return; items.forEach((it, idx) => { const w = it.dataset.w, i = Number(it.dataset.i ?? idx);
            if (w !== undefined) { const g = eOut(prog(t, p.t0 + 0.35 + i * 0.2, 0.8)); it.style.width = Number(w) * g + "%"; it.style.opacity = g > 0.02 ? 1 : 0; }
            else if (it.classList.contains("orb") || it.classList.contains("arrow")) { const g = eOutBack(prog(t, p.t0 + 0.5 + i * 0.9, 0.5)); it.style.transform = `scale(${Math.max(g, 0.001)})`; }
            else if (it.classList.contains("mo")) { const g = eOut(prog(t, p.t0 + 0.3 + i * 0.12, 0.5)); it.style.opacity = g; it.style.transform = `scaleY(${Math.max(g, 0.001)})`; } }); });
        /* captions: rolling window, active word in a gold pill */
        let gi = -1; capGroups.forEach((g, k) => { if (t >= g[0][1] - 0.04) gi = k; });
        const grp_ = gi >= 0 ? capGroups[gi] : null;
        if (gi !== capIdx) { capIdx = gi; capEl.innerHTML = grp_ ? grp_.map((w) => `<span>${w[0].replace(/%/g, " %")}</span>`).join(" ") : ""; }
        if (grp_) { const lastEnd = grp_[grp_.length - 1][2]; capEl.style.opacity = t <= lastEnd + 0.4 ? 1 : 0; [...capEl.children].forEach((sp, k) => { const on = t >= grp_[k][1] && t < grp_[k][2] + 0.06; sp.className = on ? "on" : t >= grp_[k][1] ? "past" : "next"; }); } else capEl.style.opacity = 0;
        progEl.style.width = (t / B.dur) * 100 + "%";
        const bp = prog(t, T.brand, 0.6); brandEl.style.opacity = bp; brandEl.style.transform = `scale(${0.9 + 0.1 * eOutBack(bp)})`;
        let fl = 0.35 * (1 - prog(t, 0, 0.3)); B.cuts.forEach((c) => { fl = Math.max(fl, 0.22 * (1 - prog(t, c, 0.16)) * (t >= c ? 1 : 0)); }); fl = Math.max(fl, prog(t, B.dur - 0.7, 0.65)); flashEl.style.opacity = fl.toFixed(3);
        renderer.render(scene, cam);
        fxgCtx.clearRect(0, 0, 270, 480); fxgCtx.drawImage(glCanvas, 0, 0, 270, 480);
      }
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
      document.fonts.ready.then(() => renderAt(window.__hfThreeTime || 0));
      renderAt(window.__hfThreeTime || 0);
