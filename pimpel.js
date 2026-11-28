/* Oefeningen voor de pimpelmezen (middenbouw), op één plek voor alle spelletjes.
   Gebaseerd op Otis' werkbladen van november 2026: brug tot 20 met tussenstappen,
   + en − tot 100 zonder brug, groter/kleiner, de klok, de tafels van 2, 5 en 10 met delen.

   Een oefening (q) bestaat uit rijen; elke rij heeft één invulvakje (BOX):
     q = { key, label, nums, rows: [row], pic?, tip?(antwoord) }
     row = { parts: [getallen, tekens, BOX], ans, kind: 'num' | 'cmp' | 'choice', options? }
   Meer rijen = tussenstappen, die na elkaar ingevuld worden. */
window.PIMPEL = (function () {
  'use strict';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = R(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const MIN = '−', BOX = { box: true };
  const row = (parts, ans, o) => Object.assign({ parts, ans, kind: typeof ans === 'string' ? 'cmp' : 'num' }, o || {});
  const Q = (key, rows, label, nums, extra) => Object.assign({ key, rows, label, nums }, extra || {});
  const wpick = list => {                                    // [[gewicht, waarde], ...]
    let t = Math.random() * list.reduce((s, x) => s + x[0], 0);
    for (const [w, v] of list) { if ((t -= w) < 0) return v; }
    return list[list.length - 1][1];
  };

  /* ---------- Sommen tot 20 ---------- */
  // "brug": over het tiental (8 + 5, 13 − 6)
  const crosses20 = (plus, a, b) => plus ? (a % 10) + (b % 10) > 10 : (a % 10 !== 0 && (a % 10) < (b % 10));
  function sommen20(nv, o) {
    const s = nv.sommen, max = s.level === 'tot10' ? 10 : 20;
    let a, b, plus;
    for (let t = 0; t < 300; t++) {
      plus = s.ops === 'plus' ? true : s.ops === 'min' ? false : Math.random() < .5;
      if (plus) { a = R(1, max - 1); b = R(1, max - a); } else { a = R(2, max); b = R(1, a - 1); }
      const x = crosses20(plus, a, b);
      if (s.level === 'zonder' && x) continue;
      if (s.level === 'met' && !x) continue;
      break;
    }
    const sym = plus ? '+' : MIN, c = plus ? a + b : a - b, label = `${a} ${sym} ${b} = ${c}`;
    const brug = crosses20(plus, a, b) && max === 20;
    // eerst naar 10: 9 + 6 = 9 + 1 + 5 ; 13 − 6 = 13 − 3 − 3
    const first = plus ? 10 - a : a - 10, rest = b - first;
    const tip = brug ? `Eerst naar 10: ${a} ${sym} ${first} ${sym} ${rest} = 10 ${sym} ${rest} = ${c}` : null;
    if (brug && s.steps && !(o && o.noSteps)) {
      return Q('s20' + label, [
        row([a, sym, b, '=', a, sym, BOX, sym, '…'], first, { note: 'eerst naar 10' }),
        row([a, sym, first, sym, BOX], rest),
        row([10, sym, rest, '=', BOX], c)
      ], label, [a, b, c], { tip: () => tip });
    }
    if (s.missing && Math.random() < .35) {
      return Math.random() < .5
        ? Q('s20?b' + label, [row([a, sym, BOX, '=', c], b)], label, [a, b, c], { tip: () => tip })
        : Q('s20?a' + label, [row([BOX, sym, b, '=', c], a)], label, [a, b, c], { tip: () => tip });
    }
    return Q('s20' + label, [row([a, sym, b, '=', BOX], c)], label, [a, b, c], { tip: () => tip });
  }

  /* ---------- Sommen tot 100 zonder brug (blad RB9) ---------- */
  function honderd(nv) {
    const ops = nv.honderd.ops;
    for (let t = 0; t < 300; t++) {
      const plus = ops === 'plus' ? true : ops === 'min' ? false : Math.random() < .5;
      let a, b;
      // soorten zoals op het blad; TE − T (89 − 50, 79 − 60) vaker, daar zit de fout
      const kind = plus ? wpick([[3, 'T+T'], [2, 'T+E'], [2, 'E+T'], [3, 'TE+T'], [2, 'TE+E']])
                        : wpick([[3, 'T-T'], [5, 'TE-T'], [2, 'TE-E']]);
      if (kind === 'T+T') { a = R(1, 9) * 10; b = R(1, 10 - a / 10) * 10; }
      else if (kind === 'T+E') { a = R(1, 9) * 10; b = R(1, 9); }
      else if (kind === 'E+T') { a = R(1, 9); b = R(1, 9) * 10; }
      else if (kind === 'TE+T') { a = R(11, 89); b = R(1, 9 - Math.floor(a / 10)) * 10; }
      else if (kind === 'TE+E') { a = R(11, 98); b = R(1, 9); }
      else if (kind === 'T-T') { a = R(2, 10) * 10; b = R(1, a / 10 - 1) * 10; }
      else if (kind === 'TE-T') { a = R(21, 99); b = R(1, Math.floor(a / 10) - 1) * 10; }
      else { a = R(12, 99); b = R(1, 9); }
      if (!a || !b || a % 10 === 0 && kind.startsWith('TE')) continue;
      const c = plus ? a + b : a - b;
      if (c < 1 || c > 100) continue;
      if (plus ? (a % 10) + (b % 10) >= 10 && c !== 100 : (a % 10) < (b % 10)) continue;   // zonder brug
      const sym = plus ? '+' : MIN, label = `${a} ${sym} ${b} = ${c}`;
      const E = c % 10;
      const tip = given => {
        if (E && given === c - E) return `Vergeet de ${E} eenheden niet! ${label}`;
        if (given === (plus ? a - b : a + b)) return `Kijk naar het teken: het is ${plus ? 'plus' : 'min'}. ${label}`;
        if (b % 10 === 0 && a % 10) return `Eerst de tientallen, de eenheden blijven: ${label}`;
        return null;
      };
      return Q('h' + label, [row([a, sym, b, '=', BOX], c)], label, [a, b, c], { tip });
    }
    return Q('h50+30', [row([50, '+', 30, '=', BOX], 80)], '50 + 30 = 80', [50, 30, 80]);
  }

  /* ---------- Groter of kleiner (< = >) ---------- */
  function vergelijken(nv) {
    const max = nv.vergelijken.max === 20 ? 20 : 100;
    let a, b;
    const k = Math.random();
    if (k < .1) { a = b = R(2, max); }                                     // evenveel
    else if (k < .45 && max === 100) { const T = R(1, 9); a = T * 10 + R(0, 9); b = T * 10 + R(0, 9); }   // zelfde tientallen: 44 en 45
    else if (k < .65 && max === 100) { const x = R(1, 9), y = R(1, 9); a = x * 10 + y; b = y * 10 + x; } // omgedraaid: 76 en 67
    else { a = R(1, max); b = R(1, max); }
    if (a === b && k >= .1) b = a === max ? a - 1 : a + 1;
    const ans = a < b ? '<' : a > b ? '>' : '=';
    const label = `${a} ${ans} ${b}`;
    const tip = () => a === b ? `Ze zijn even groot: ${label}`
      : `Vergelijk eerst de T. Evenveel T? Dan de E. ${label}`;
    return Q('v' + label, [row([a, BOX, b], ans)], label, [a, b], { tip });
  }

  /* ---------- De klok ---------- */
  const NEXT = h => h % 12 + 1;
  function klokTxt(h, m) {
    if (m === 0) return `${h} uur`;
    if (m === 30) return `half ${NEXT(h)}`;
    if (m === 15) return `kwart over ${h}`;
    return `kwart voor ${NEXT(h)}`;
  }
  function klokSVG(h, m) {
    const ticks = [], nums = [];
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 80 : 85;
      ticks.push(`<line x1="${(r1 * Math.sin(a)).toFixed(1)}" y1="${(-r1 * Math.cos(a)).toFixed(1)}" x2="${(91 * Math.sin(a)).toFixed(1)}" y2="${(-91 * Math.cos(a)).toFixed(1)}" stroke="#2a2150" stroke-width="${big ? 3.5 : 1.5}"/>`);
    }
    for (let n = 1; n <= 12; n++) {
      const a = n * 30 * Math.PI / 180;
      nums.push(`<text x="${(66 * Math.sin(a)).toFixed(1)}" y="${(-66 * Math.cos(a)).toFixed(1)}">${n}</text>`);
    }
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    return `<svg class="klok" viewBox="-100 -100 200 200" role="img" aria-label="klok">
      <circle r="96" fill="#fff" stroke="#6a5cff" stroke-width="6"/>${ticks.join('')}
      <g font-size="17" font-weight="800" fill="#2a2150" text-anchor="middle" dominant-baseline="central" font-family="Nunito,Arial,sans-serif">${nums.join('')}</g>
      <line x1="0" y1="0" x2="0" y2="-44" stroke="#2a2150" stroke-width="9" stroke-linecap="round" transform="rotate(${ha})"/>
      <line x1="0" y1="0" x2="0" y2="-74" stroke="#4d7cff" stroke-width="5" stroke-linecap="round" transform="rotate(${ma})"/>
      <circle r="6" fill="#2a2150"/></svg>`;
  }
  function klok(nv) {
    const lv = nv.klok.level;                       // 'uur' | 'half' | 'kwart'
    const h = R(1, 12);
    const ms = lv === 'uur' ? [0] : lv === 'half' ? [0, 30, 30] : [0, 30, 15, 45];
    const m = pick(ms);
    const ans = klokTxt(h, m), opts = new Set([ans]);
    // de bekende valkuilen eerst: half 7 / half 8, wijzers verwisseld, een uur te vroeg of te laat
    const traps = [];
    if (m === 30) traps.push(`half ${h}`, `${h} uur`, `${NEXT(h)} uur`);
    if (m === 0) traps.push(`half ${h}`, `${NEXT(h)} uur`, `${h === 1 ? 12 : h - 1} uur`, h !== 12 ? '12 uur' : '6 uur');
    if (m === 15) traps.push(`kwart voor ${h}`, `kwart over ${NEXT(h)}`, `half ${NEXT(h)}`);
    if (m === 45) traps.push(`kwart over ${NEXT(h)}`, `kwart voor ${h}`, `half ${NEXT(h)}`);
    traps.forEach(t => { if (opts.size < 4) opts.add(t); });
    const tip = given => {
      if (m === 30 && given === `half ${h}`) return `Bij half kijk je naar het volgende uur: de kleine wijzer is voorbij de ${h}, dus ${ans}.`;
      if (m === 0) return `De grote wijzer staat op 12, de kleine wijzer op de ${h}: ${ans}.`;
      if (m === 30) return `De grote wijzer staat op 6: het is half. ${ans[0].toUpperCase() + ans.slice(1)}.`;
      if (m === 15) return `De grote wijzer staat op 3: kwart over. De kleine wijzer is net voorbij de ${h}: ${ans}.`;
      return `De grote wijzer staat op 9: kwart voor. Het is bijna ${NEXT(h)} uur: ${ans}.`;
    };
    return Q('k' + h + ':' + m, [row(['Hoe laat is het?', BOX], ans, { kind: 'choice', options: shuffle([...opts]), hideParts: true })],
      `🕒 ${String(h)}:${String(m).padStart(2, '0')} = ${ans}`, [h, m], { pic: klokSVG(h, m), tip });
  }

  /* ---------- Tafels ---------- */
  function tafel(nv) {
    const tafels = nv.tafels && nv.tafels.length ? nv.tafels : [1, 2, 5, 10];
    const t = pick(tafels);
    const kind = wpick([[nv.sprongen ? 2 : 0, 'sprong'], [nv.nul ? 1 : 0, 'nul'], [nv.delen ? 5 : 0, 'deel'], [5, 'maal']]);
    if (kind === 'sprong') {
      // tel met sprongen: 15, 20, ?, 30, 35
      const start = R(0, 5), len = 5, gap = R(1, len - 1), parts = [];
      for (let i = 0; i < len; i++) { if (i) parts.push('→'); parts.push(i === gap ? BOX : (start + i) * t); }
      const ans = (start + gap) * t, label = `sprongen van ${t}: ${(start + gap - 1) * t} → ${ans}`;
      return Q('sp' + t + ':' + start + ':' + gap, [row(parts, ans, { note: `sprongen van ${t}` })], label, [ans, t],
        { tip: () => `Telkens ${t} erbij: ${(start + gap - 1) * t} + ${t} = ${ans}` });
    }
    if (kind === 'nul') {
      const v = R(0, 2);
      if (v === 0) return Q('n0x' + t, [row([0, '×', t, '=', BOX], 0)], `0 × ${t} = 0`, [0, t], { tip: () => `0 keer iets is altijd 0.` });
      if (v === 1) return Q('nx0' + t, [row([t, '×', 0, '=', BOX], 0)], `${t} × 0 = 0`, [t, 0], { tip: () => `Iets 0 keer nemen is altijd 0.` });
      return Q('n0:' + t, [row([0, ':', t, '=', BOX], 0)], `0 : ${t} = 0`, [0, t], { tip: () => `0 verdelen geeft 0: er is niets om te verdelen.` });
    }
    const k = R(1, 10);
    if (kind === 'deel') {
      const a = k * t, label = `${a} : ${t} = ${k}`;
      const tip = given => given === a * t ? `Dat is ${a} × ${t}! Hier moet je delen: hoe vaak past ${t} in ${a}? ${k} × ${t} = ${a}, dus ${label}.`
        : `Hoe vaak past ${t} in ${a}? ${k} × ${t} = ${a}, dus ${label}.`;
      return Q('d' + label, [row([a, ':', t, '=', BOX], k)], label, [a, t, k], { tip });
    }
    const [x, y] = Math.random() < .3 ? [t, k] : [k, t];
    const c = x * y, label = `${x} × ${y} = ${c}`;
    const tip = () => `${k} keer ${t}: tel met sprongen van ${t}. ${label}`;
    if (nv.tafelMissing && Math.random() < .3) return Q('m?' + label, [row([x, '×', BOX, '=', c], y)], label, [x, y, c], { tip });
    return Q('m' + label, [row([x, '×', y, '=', BOX], c)], label, [x, y, c], { tip });
  }

  /* ---------- Mengen ---------- */
  // Welke rekenonderwerpen staan aan? (sommen tot 20, tot 100, vergelijken, klok)
  const TOPICS = { sommen: [3, sommen20], honderd: [3, honderd], vergelijken: [1, vergelijken], klok: [2, klok] };
  function on(nv) { return Object.keys(TOPICS).filter(k => nv[k] && nv[k].on); }
  let last = '';
  function reken(nv, o) {
    const list = on(nv);
    const opts = list.length > 1 ? list.filter(k => k !== last || Math.random() < .35) : list;
    const k = wpick(opts.map(t => [TOPICS[t][0], t]));
    last = k;
    return Object.assign(TOPICS[k][1](nv, o), { topic: k });
  }
  const ICONS = { sommen: '➕', honderd: '💯', vergelijken: '🐊', klok: '🕒' };

  return { reken, tafel, sommen20, honderd, vergelijken, klok, klokSVG, klokTxt, on, ICONS, BOX };
})();
