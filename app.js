(() => {
  'use strict';
  const CITE = 'Koda M, Harada N, Minamitani K, Fujii K, Orui M, Kuriyama S, Hozawa A, Tabuchi T. Monitoring disaster preparedness behaviors in Japan: social, residential, and neighborhood-related gradients. International Journal of Disaster Risk Reduction 2026;143:106317. <a href="https://doi.org/10.1016/j.ijdrr.2026.106317">doi:10.1016/j.ijdrr.2026.106317</a>';
  const T = {
    ja: {
      title: '災害への備えの地図', sub: 'IJDRR 2026 図1・補足表S5（都道府県別）', item: '備えの行動',
      prev: '← 前の行動', next: '次の行動 →', listTitle: '都道府県の値と95%信頼区間',
      sorts: { value: '割合の高い順', code: '北から' },
      items: [
        '家具の転倒防止対策', '食料・飲料などの備蓄', '非常用持ち出しバッグの準備',
        '家族の安否確認方法を決めている', '自宅での避難場所・経路を把握', '自宅の外での避難場所・経路を把握',
      ],
      question: [
        '「災害に備え、家具の転倒防止対策を行なっている」',
        '「災害に備え、食料・飲料などの備蓄を行っている」',
        '「災害に備え、非常用持ち出しバッグを準備している」',
        '「家族同士で災害時の安否確認方法を決めている」',
        '「自宅において災害に遭った際の避難場所や避難経路を把握している」',
        '「自宅の外で災害に遭った際の避難場所や避難経路を把握している」',
      ],
      explainPre: '調査票の', explainPost: 'に「はい」と答えた人の割合です。',
      panel: '図1', national: (v) => `全国 ${v[0].toFixed(1)}%（95%信頼区間 ${v[1].toFixed(1)}〜${v[2].toFixed(1)}）`,
      ci: '95%信頼区間', n: '回答者数', nat: '全国', pct: '重み付き割合（%）',
      zoom: 'ホイールやピンチで拡大、ドラッグで移動、ダブルクリックで戻ります。都道府県をクリックすると強調します。',
      note: '2023年のインターネット調査（JACSIS2023）の回答者28,481人について、回答者のかたよりを補正する重み（逆確率重み）をつけて計算した割合です。値は論文の補足表S5と同じです。回答者の少ない県では信頼区間が広く、県どうしの差は誤差の範囲であることが多いので、右の一覧の信頼区間とあわせて見てください。色の範囲は6つの行動で共通（5〜60%）です。北海道と沖縄県は位置をずらして表示しています。本人の回答にもとづく割合で、実際に備えができているかを確かめたものではありません。',
      cite: `出典：${CITE}（CC BY 4.0）`,
    },
    en: {
      title: 'Disaster preparedness maps', sub: 'IJDRR 2026, Figure 1 and Supplementary Table S5 (by prefecture)', item: 'Preparedness behavior',
      prev: '← Previous', next: 'Next →', listTitle: 'Prefecture estimates with 95% CI',
      sorts: { value: 'Highest first', code: 'North to south' },
      items: [
        'Secured furniture against overturning', 'Stockpiled food, beverages, and other supplies', 'Prepared an emergency go-bag',
        'Had a family safety-confirmation method', 'Knew evacuation sites/routes when at home', 'Knew evacuation sites/routes when away from home',
      ],
      question: [
        '“I have taken measures to prevent furniture from overturning in preparation for disasters”',
        '“I have stockpiled food, beverages, and other supplies in preparation for disasters”',
        '“I have prepared an emergency go-bag in preparation for disasters”',
        '“Family members have decided how to confirm one another’s safety during a disaster”',
        '“I know evacuation sites or routes for when I experience a disaster at home”',
        '“I know evacuation sites or routes for when I experience a disaster away from home”',
      ],
      explainPre: 'Weighted percentage of respondents answering yes to ', explainPost: '.',
      panel: 'Figure 1', national: (v) => `Japan overall ${v[0].toFixed(1)}% (95% CI ${v[1].toFixed(1)}–${v[2].toFixed(1)})`,
      ci: '95% CI', n: 'Respondents', nat: 'Japan overall', pct: 'Weighted prevalence (%)',
      zoom: 'Scroll or pinch to zoom, drag to pan, double-click to reset. Click a prefecture to highlight it.',
      note: 'Weighted prevalence (standardized inverse probability weighting) among 28,481 respondents to the 2023 Japan COVID-19 and Society Internet Survey (JACSIS2023), as reported in Supplementary Table S5. Prefectures with few respondents have wide confidence intervals, and many differences between prefectures are within sampling error; read the map together with the intervals in the list. The colour range (5–60%) is shared by all six behaviors. Hokkaido and Okinawa are repositioned. Values are respondent-reported and were not verified.',
      cite: `Source: ${CITE} (CC BY 4.0)`,
    },
  };
  const PANEL = 'ABCDEF';
  const PALETTE = ['#3B9AB2', '#78B7C5', '#EBCC2A', '#E1AF00', '#F21A00'];
  const DOMAIN = [5, 60];
  const color = (v) => d3.interpolateRgbBasis(PALETTE)(Math.max(0, Math.min(1, (v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0]))));
  const $ = (id) => document.getElementById(id);
  const state = { lang: 'ja', item: 0, sort: 'value', hl: null };
  let data, topo, features, pathGen, gMap, svg, zoom;

  try { const l = localStorage.getItem('lang'); if (l === 'en' || l === 'ja') state.lang = l; } catch (e) {}
  if (/[?&]lang=en/.test(location.search)) state.lang = 'en';
  readHash();

  function readHash() {
    const m = location.hash.match(/^#([A-F])/i);
    if (m) state.item = PANEL.indexOf(m[1].toUpperCase());
  }
  function writeHash() { history.replaceState(null, '', `#${PANEL[state.item]}`); }
  const t = () => T[state.lang];
  const prefName = (i) => state.lang === 'ja' ? data.ja[i] : data.prefs[i];
  const est = (i) => data.v[data.prefs[i]][state.item];

  Promise.all([
    fetch('data/values.json').then((r) => r.json()),
    fetch('data/pref.topojson').then((r) => r.json()),
  ]).then(([v, tp]) => {
    data = v; topo = tp;
    features = topojson.feature(topo, topo.objects.pref).features;
    features.forEach((f, i) => { f.properties.i = i; });
    buildMap();
    buildControls();
    render();
  });

  function buildMap() {
    const W = 760, H = 760;
    const box = { type: 'MultiPoint', coordinates: [[127.7, 26.8], [142.9, 42.0], [127.7, 42.0], [142.9, 26.8]] };
    const proj = d3.geoMercator().fitSize([W, H], box);
    pathGen = d3.geoPath(proj);
    svg = d3.select('#map').append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
    gMap = svg.append('g');
    gMap.selectAll('path.pref').data(features).join('path').attr('class', 'pref').attr('d', pathGen)
      .on('pointermove', onMove).on('pointerleave', () => { $('tip').hidden = true; })
      .on('click', (ev, d) => { setHl(d.properties.i); onMove(ev, d); });
    const line = (pts) => pathGen({ type: 'LineString', coordinates: pts });
    gMap.append('path').attr('class', 'sep').attr('d', line([[129, 37], [135, 37], [139, 41.5]]));
    gMap.append('path').attr('class', 'sep').attr('d', line([[132, 27], [135, 31.5], [142, 31.5]]));
    gMap.append('path').attr('class', 'hl');
    zoom = d3.zoom().scaleExtent([1, 12]).translateExtent([[0, 0], [W, H]])
      .on('zoom', (ev) => { gMap.attr('transform', ev.transform); });
    svg.call(zoom).on('dblclick.zoom', null).on('dblclick', () => { setHl(null); svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); });
  }

  function tipHtml(i) {
    const [v, lo, hi] = est(i), L = t();
    return `<b>${prefName(i)}　${v.toFixed(1)}%</b><span>${L.ci} ${lo.toFixed(1)}–${hi.toFixed(1)}</span><span>${L.n} ${data.n[data.prefs[i]].toLocaleString()}</span>`;
  }

  function onMove(ev, d) {
    const tip = $('tip'), wrap = document.querySelector('.mapwrap').getBoundingClientRect();
    tip.innerHTML = tipHtml(d.properties.i);
    tip.hidden = false;
    let x = ev.clientX - wrap.left + 14, y = ev.clientY - wrap.top + 14;
    if (x + 220 > wrap.width) x -= 240;
    tip.style.left = `${x}px`; tip.style.top = `${y}px`;
  }

  function setHl(i) {
    state.hl = state.hl === i ? null : i;
    drawHl();
  }

  function drawHl() {
    const f = state.hl == null ? null : features[state.hl];
    gMap.select('.hl').attr('d', f ? pathGen(f) : null);
    svg.classed('has-hl', !!f);
    gMap.selectAll('path.pref').classed('is-hl', (d) => d.properties.i === state.hl);
    document.querySelectorAll('#list li').forEach((li) => li.classList.toggle('is-hl', Number(li.dataset.i) === state.hl));
  }

  function buildControls() {
    $('lang').onclick = () => { state.lang = state.lang === 'ja' ? 'en' : 'ja'; try { localStorage.setItem('lang', state.lang); } catch (e) {} render(); };
    const step = (dir) => { state.item = (state.item + dir + 6) % 6; render(); };
    $('prev').onclick = () => step(-1); $('next').onclick = () => step(1);
  }

  function seg(el, items, key) {
    el.innerHTML = '';
    Object.entries(items).forEach(([k, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      const val = typeof state[key] === 'number' ? Number(k) : k;
      b.setAttribute('aria-pressed', String(state[key] === val));
      b.onclick = () => { state[key] = val; render(); };
      el.appendChild(b);
    });
  }

  function render() {
    const L = t();
    document.documentElement.lang = state.lang;
    document.title = L.title;
    document.querySelectorAll('[data-t]').forEach((el) => { const v = L[el.dataset.t]; if (typeof v === 'string') el.textContent = v; });
    $('lang').textContent = state.lang === 'ja' ? 'EN' : '日本語';
    seg($('item'), Object.fromEntries(L.items.map((s, i) => [i, `${PANEL[i]}. ${s}`])), 'item');
    seg($('sort'), L.sorts, 'sort');
    $('explain').textContent = `${L.explainPre}${L.question[state.item]}${L.explainPost}`;
    $('heading').textContent = `${L.panel}${PANEL[state.item]}. ${L.items[state.item]}`;
    $('national').textContent = L.national(data.national[state.item]);
    $('note').textContent = `${L.note} ${L.zoom}`;
    $('cite').innerHTML = L.cite;
    gMap.selectAll('path.pref').attr('fill', (d) => color(est(d.properties.i)[0]));
    svg.attr('aria-label', `${$('heading').textContent}. ${$('national').textContent}`);
    drawLegend();
    drawList();
    drawHl();
    writeHash();
  }

  function drawLegend() {
    const L = t(), stops = d3.range(0, 1.0001, 0.1).map((p) => `${color(DOMAIN[0] + p * (DOMAIN[1] - DOMAIN[0]))} ${p * 100}%`).join(',');
    const ticks = [10, 20, 30, 40, 50, 60].map((v) => `<span style="left:${(v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0]) * 100}%">${v}</span>`).join('');
    $('legend').innerHTML = `<div>${L.pct}</div><div class="bar" style="background:linear-gradient(90deg,${stops})"></div><div class="ticks">${ticks}</div>`;
  }

  function drawList() {
    const L = t(), nat = data.national[state.item][0];
    const order = d3.range(47);
    if (state.sort === 'value') order.sort((a, b) => est(b)[0] - est(a)[0]);
    const x = d3.scaleLinear().domain([0, 70]).range([0, 100]);
    $('list').innerHTML = order.map((i) => {
      const [v, lo, hi] = est(i);
      return `<li data-i="${i}" title="${prefName(i)}: ${v.toFixed(1)}% (${L.ci} ${lo.toFixed(1)}–${hi.toFixed(1)}, ${L.n} ${data.n[data.prefs[i]]})">`
        + `<span class="nm">${prefName(i)}</span>`
        + `<svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">`
        + `<line class="nat" x1="${x(nat)}" x2="${x(nat)}" y1="0" y2="14" vector-effect="non-scaling-stroke"/>`
        + `<line class="ci" x1="${x(lo)}" x2="${x(hi)}" y1="7" y2="7" vector-effect="non-scaling-stroke"/>`
        + `<rect x="${x(v) - 1.6}" y="3" width="3.2" height="8" rx="1" fill="${color(v)}" stroke="var(--ink)" stroke-width=".6" vector-effect="non-scaling-stroke"/></svg>`
        + `<span class="val">${v.toFixed(1)}</span></li>`;
    }).join('');
    document.querySelectorAll('#list li').forEach((li) => { li.onclick = () => setHl(Number(li.dataset.i)); });
    const key = document.querySelector('.listhead .nat-key');
    if (key) key.remove();
    $('sort').insertAdjacentHTML('afterend', `<span class="legend nat-key" style="margin:0"><i></i>${L.nat} ${nat.toFixed(1)}%</span>`);
  }

  window.addEventListener('hashchange', () => { readHash(); render(); });
})();
