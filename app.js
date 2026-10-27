(function () {
  const F = window.FUND;
  const $ = (id) => document.getElementById(id);
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const fmtPct = (v, d = 1, sign = true) => (v > 0 && sign ? "+" : "") + v.toFixed(d) + "%";

  /* ---------- Series ---------- */
  const years = Object.keys(F.returns).map(Number).sort((a, b) => a - b);
  const monthly = []; // {y, m, r}
  years.forEach((y) => F.returns[y].forEach((r, m) => { if (r !== null && r !== undefined && r !== "") monthly.push({ y, m, r: Number(r) }); }));
  const rets = monthly.map((d) => d.r / 100);
  const nav = [100];
  rets.forEach((r) => nav.push(nav[nav.length - 1] * (1 + r)));
  // NAV point dates: start = month before first return
  const first = monthly[0];
  const pts = nav.map((v, i) => ({ t: first.y + (first.m + i) / 12, v, label: i === 0 ? "Inception" : MONTHS[monthly[i - 1].m] + " " + monthly[i - 1].y }));

  /* ---------- Metrics ---------- */
  const n = rets.length;
  const mean = rets.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (n - 1));
  const rfM = (F.riskFreeRate || 0) / 100 / 12;
  const downside = Math.sqrt(rets.reduce((a, r) => a + Math.min(0, r - rfM) ** 2, 0) / n);
  let peak = 100, mdd = 0;
  nav.forEach((v) => { peak = Math.max(peak, v); mdd = Math.max(mdd, (peak - v) / peak); });
  const calc = {
    annualizedReturn: (Math.pow(nav[nav.length - 1] / 100, 12 / n) - 1) * 100,
    sharpe: ((mean - rfM) / sd) * Math.sqrt(12),
    sortino: downside > 0 ? ((mean - rfM) * 12) / (downside * Math.sqrt(12)) : null,
    stdDev: sd * Math.sqrt(12) * 100,
    maxDrawdown: mdd * 100
  };
  const M = {};
  Object.keys(F.metrics).forEach((k) => (M[k] = F.metrics[k] !== null && F.metrics[k] !== undefined ? F.metrics[k] : calc[k]));

  const metricDefs = [
    { k: "annualizedReturn", label: "Annualized Return", fmt: (v) => v.toFixed(1) + "%",
      def: "The compound annual growth rate of the fund's net asset value since inception.",
      how: "(Ending NAV ÷ Starting NAV)^(12 ÷ number of months) − 1, using monthly net returns." },
    { k: "sharpe", label: "Sharpe Ratio", fmt: (v) => v.toFixed(1),
      def: "Return earned per unit of total volatility, above the risk-free rate.",
      how: `Average monthly excess return ÷ standard deviation of monthly returns, × √12. Risk-free rate: ${F.riskFreeRate}% annually.` },
    { k: "stdDev", label: "Standard Deviation", fmt: (v) => v.toFixed(1) + "%",
      def: "How much monthly returns vary around their average, annualized.",
      how: "Sample standard deviation of monthly net returns × √12." },
    { k: "maxDrawdown", label: "Max Drawdown", fmt: (v) => v.toFixed(1) + "%",
      def: "The largest peak-to-trough decline in net asset value.",
      how: "Largest percentage fall from a prior month-end high to a subsequent month-end low." },
    { k: "sortino", label: "Sortino Ratio", fmt: (v) => v.toFixed(1),
      def: "Like the Sharpe ratio, but only penalizes downside volatility.",
      how: `Annualized excess return ÷ annualized downside deviation (months below the ${F.riskFreeRate}% risk-free rate).` },
    { k: "btcCorrelation", label: "Bitcoin Correlation", fmt: (v) => v.toFixed(2),
      def: "How closely the fund's monthly returns move with Bitcoin. Near zero means returns are largely independent of Bitcoin's direction.",
      how: "Pearson correlation of monthly fund net returns against monthly Bitcoin returns over the same period." },
    { k: "spxCorrelation", label: "S&P 500 Correlation", fmt: (v) => v.toFixed(2),
      def: "How closely the fund's monthly returns move with the S&P 500.",
      how: "Pearson correlation of monthly fund net returns against monthly S&P 500 total returns over the same period." }
  ];
  // Show six, like the reference layout
  const shown = metricDefs.filter((d) => ["annualizedReturn","sharpe","stdDev","maxDrawdown","sortino","spxCorrelation"].includes(d.k));
  if (M.spxCorrelation == null && M.btcCorrelation != null) shown[5] = metricDefs[5];

  /* ---------- Header ---------- */
  document.title = `${F.firm} — ${F.fundName}`;
  $("fund-name").textContent = F.fundName;
  $("chart-sub").textContent = F.chartSubtitle;
  $("asof").textContent = `All data as of ${F.asOf}`;
  $("sample-tag").hidden = !F.sampleData;
  const hl = $("headline");
  if (F.headline && F.headline.text) { hl.textContent = F.headline.text; hl.href = F.headline.url; } else hl.remove();
  const cum = (nav[nav.length - 1] / 100 - 1) * 100;
  $("cum-val").textContent = (cum >= 0 ? "+" : "") + Math.round(cum) + "%";

  /* ---------- Metrics grid ---------- */
  const mg = $("metrics");
  // order to read across rows like the reference: AR, Sharpe, SD / MDD, Sortino, Corr
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    const d = shown[i];
    const v = M[d.k];
    const b = document.createElement("button");
    b.className = "metric"; b.type = "button";
    b.innerHTML = `<span class="k">${d.label}</span><span class="v">${v == null ? "—" : d.fmt(v)}</span>`;
    b.onclick = () => openModal(d.label, `<p>${d.def}</p><p><strong>Methodology.</strong> ${d.how}</p>`);
    mg.appendChild(b);
  });

  /* ---------- Returns table ---------- */
  let html = "<thead><tr><th>YEAR</th>" + MONTHS.map((m) => `<th>${m}</th>`).join("") + "<th>TOTAL</th></tr></thead><tbody>";
  [...years].forEach((y) => {
    const row = F.returns[y];
    let comp = 1, any = false;
    html += `<tr><td>${y}</td>`;
    row.forEach((r) => {
      if (r === null || r === undefined || r === "") { html += `<td class="e">—</td>`; return; }
      any = true; comp *= 1 + r / 100;
      html += `<td class="${r >= 0 ? "p" : "n"}">${r.toFixed(1)}%</td>`;
    });
    html += `<td class="t">${any ? fmtPct((comp - 1) * 100) : "—"}</td></tr>`;
  });
  $("returns").innerHTML = html + "</tbody>";

  /* ---------- Chart ---------- */
  const chartEl = $("chart");
  function drawChart() {
    const W = chartEl.clientWidth, H = chartEl.clientHeight;
    const small = W < 520;
    const m = { l: small ? 40 : 52, r: 8, t: 8, b: small ? 34 : 40 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const vmax = Math.max(...nav), vmin = Math.min(...nav);
    const step = niceStep((vmax - Math.min(100, vmin)) / 4);
    const yMin = Math.max(0, Math.floor(Math.min(100, vmin) / step) * step - step * 0.25);
    const yMax = Math.ceil(vmax / step) * step;
    const x = (t) => m.l + ((t - t0) / (t1 - t0)) * iw;
    const y = (v) => m.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
    const line = pts.map((p, i) => (i ? "L" : "M") + x(p.t).toFixed(1) + "," + y(p.v).toFixed(1)).join("");
    const area = line + `L${x(t1)},${m.t + ih}L${x(t0)},${m.t + ih}Z`;
    let ticks = "";
    for (let v = Math.ceil(yMin / step) * step; v <= yMax + 0.001; v += step) {
      if (v < yMin + step * 0.4) continue;
      ticks += `<text x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`;
    }
    let xt = "";
    for (let yr = Math.ceil(t0); yr <= t1; yr++) {
      const xx = x(yr);
      xt += `<line x1="${xx}" x2="${xx}" y1="${m.t + ih}" y2="${m.t + ih + 4}" stroke="var(--line)"/>` +
        `<text class="xlab" x="${xx}" y="${m.t + ih + 22}" text-anchor="end" transform="rotate(-18 ${xx} ${m.t + ih + 22})">${yr}</text>`;
    }
    chartEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1c3553" stop-opacity=".26"/><stop offset="1" stop-color="#1c3553" stop-opacity=".02"/></linearGradient></defs>
      <line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${m.t + ih}" stroke="var(--line)"/>
      <line x1="${m.l}" x2="${m.l + iw}" y1="${m.t + ih}" y2="${m.t + ih}" stroke="var(--line)"/>
      <g class="axis">${ticks}${xt}</g>
      <path d="${area}" fill="url(#g)"/>
      <path d="${line}" fill="none" stroke="#1c3553" stroke-width="2" stroke-linejoin="round"/>
      <line id="hover-line" y1="${m.t}" y2="${m.t + ih}" stroke="#1c3553" stroke-opacity=".25" stroke-dasharray="3 3" visibility="hidden"/>
      <circle id="hover-dot" r="4" fill="#1c3553" visibility="hidden"/>
    </svg><div class="tip" id="tip"></div>`;
    chartEl.style.position = "relative";
    const svg = chartEl.querySelector("svg"), tip = $("tip"), hl = $("hover-line"), hd = $("hover-dot");
    svg.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const px = e.clientX - r.left;
      let best = 0, bd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(x(p.t) - px); if (d < bd) { bd = d; best = i; } });
      const p = pts[best], cx = x(p.t), cy = y(p.v);
      hl.setAttribute("x1", cx); hl.setAttribute("x2", cx); hl.setAttribute("visibility", "visible");
      hd.setAttribute("cx", cx); hd.setAttribute("cy", cy); hd.setAttribute("visibility", "visible");
      const r1 = best ? monthly[best - 1].r : null;
      tip.textContent = `${p.label} · $${p.v.toFixed(2)}${r1 !== null ? " · " + fmtPct(r1, 2) : ""}`;
      tip.style.left = Math.min(Math.max(cx, 90), W - 90) + "px"; tip.style.top = cy + "px"; tip.style.opacity = 1;
    });
    svg.addEventListener("pointerleave", () => { tip.style.opacity = 0; hl.setAttribute("visibility", "hidden"); hd.setAttribute("visibility", "hidden"); });
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  drawChart();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawChart, 120); });

  /* ---------- Strategy ---------- */
  $("strategy-intro").textContent = F.strategy.intro;
  $("engines").innerHTML = F.strategy.engines.map((e) =>
    `<div class="engine"><div class="w">${e.weight} OF CAPITAL</div><h3>${e.name}</h3><p>${e.text}</p></div>`).join("");
  $("terms").innerHTML = F.terms.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  /* ---------- Letters ---------- */
  $("letters-label").textContent = `${F.fundName} letters`;
  const byYear = {};
  F.letters.forEach((l) => (byYear[l.year] = byYear[l.year] || []).push(l));
  const order = ["Q1","Q2","Q3","Q4"];
  const mIdx = (p) => { const i = order.indexOf(p); if (i > -1) return (i + 1) * 3 - 0.5; const j = MONTHS.indexOf(String(p).toUpperCase()); return j > -1 ? j : 99; };
  $("letters-list").innerHTML = Object.keys(byYear).sort((a, b) => b - a).map((y) => {
    const items = byYear[y].sort((a, b) => mIdx(a.period) - mIdx(b.period)).map((l) =>
      `<li><span class="q">${l.period}</span>${l.file ? `<a href="${l.file}" target="_blank" rel="noopener">${l.title}</a>` : `<span class="nolink">${l.title}</span>`}</li>`).join("");
    return `<div class="ly"><span class="y">${y}</span><ul>${items}</ul></div>`;
  }).join("");

  /* ---------- Documents ---------- */
  const mail = (subj) => `mailto:${F.contactEmail}?subject=${encodeURIComponent(subj)}`;
  $("docs-list").innerHTML = F.documents.map((d) => {
    const inner = `<div><div class="c">${d.category}</div><div class="t">${d.title}</div>${d.date ? `<div class="d">${d.date}</div>` : ""}</div>`;
    if (d.restricted && F.dataRoomUrl) return `<a class="doc" href="${F.dataRoomUrl}" target="_blank" rel="noopener">${inner}<span class="act">Data room &rarr;</span></a>`;
    if (d.restricted) return `<a class="doc" href="${mail("Document request: " + d.title)}">${inner}<span class="act">Request access &rarr;</span></a>`;
    if (d.file) return `<a class="doc" href="${d.file}" target="_blank" rel="noopener">${inner}<span class="act">PDF &rarr;</span></a>`;
    return `<a class="doc" href="${mail("Document request: " + d.title)}">${inner}<span class="act">Request &rarr;</span></a>`;
  }).join("");
  const em = $("email-link"); em.textContent = F.contactEmail; em.href = "mailto:" + F.contactEmail;
  if (F.meetingUrl) $("meet-link").href = F.meetingUrl; else $("meet-link").remove();
  if (F.dataRoomUrl) { const dr = $("dataroom-link"); dr.href = F.dataRoomUrl; dr.hidden = false; }
  if (F.tearSheet) { const pb = $("pdf-btn"); pb.href = F.tearSheet; pb.hidden = false; }

  /* ---------- Modal ---------- */
  const modal = $("modal");
  function openModal(title, body) { $("modal-title").textContent = title; $("modal-body").innerHTML = body; modal.showModal(); }
  modal.querySelector(".close").onclick = () => modal.close();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  $("disc-btn").onclick = () => openModal("Disclosures", F.disclosures.map((p) => `<p>${p}</p>`).join(""));

  /* ---------- Side nav ---------- */
  const links = document.querySelectorAll(".side-nav a");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.s === e.target.id));
  }), { threshold: 0.5 });
  document.querySelectorAll(".panel").forEach((s) => io.observe(s));
})();
