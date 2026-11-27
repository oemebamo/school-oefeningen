/* Wat kan het kind al? Eén plek per groep (pimpelmezen / wolven), gebruikt door alle spelletjes.
   Ingesteld op niveau/index.html. Opgeslagen in localStorage onder niv.pimpelmees en niv.wolf.
   Bevat ook de Franse werkwoorden, zodat de lijst maar op één plek staat. */
(function () {
  'use strict';
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- Franse werkwoorden: [infinitief, betekenis, groep] ---------- */
  const VERBS = [
    ['parler', 'praten', 'er'], ['chanter', 'zingen', 'er'], ['danser', 'dansen', 'er'], ['jouer', 'spelen', 'er'],
    ['aimer', 'graag hebben', 'er'], ['habiter', 'wonen', 'er'], ['regarder', 'kijken naar', 'er'], ['écouter', 'luisteren naar', 'er'],
    ['marcher', 'wandelen', 'er'], ['sauter', 'springen', 'er'], ['dessiner', 'tekenen', 'er'], ['travailler', 'werken', 'er'],
    ['chercher', 'zoeken', 'er'], ['trouver', 'vinden', 'er'], ['donner', 'geven', 'er'], ['demander', 'vragen', 'er'],
    ['porter', 'dragen', 'er'], ['fermer', 'sluiten', 'er'],
    ['manger', 'eten', 'er'], ['nager', 'zwemmen', 'er'], ['commencer', 'beginnen', 'er'],   // spelling past zich aan bij nous
    ['finir', 'eindigen', 'ir'], ['choisir', 'kiezen', 'ir'], ['attendre', 'wachten', 're'], ['répondre', 'antwoorden', 're'],
    ['être', 'zijn', 'x'], ['avoir', 'hebben', 'x'], ['aller', 'gaan', 'x'], ['faire', 'doen of maken', 'x'],
    ['prendre', 'nemen', 'x'], ['venir', 'komen', 'x'], ['vouloir', 'willen', 'x']
  ];
  const KAARTJES = ['regarder', 'habiter', 'dessiner', 'donner', 'chercher', 'parler', 'fermer', 'sauter',
                    'demander', 'jouer', 'trouver', 'porter', 'écouter', 'travailler', 'marcher', 'aimer'];
  const END = {
    er: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
    ir: ['is', 'is', 'it', 'issons', 'issez', 'issent'],      // zoals finir
    re: ['s', 's', '', 'ons', 'ez', 'ent']                     // zoals attendre
  };
  const IRREG = {
    'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    prendre: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
    venir: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
    vouloir: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent']
  };
  function conj(inf, group) {
    if (group === 'x') return IRREG[inf].slice();
    const stem = inf.slice(0, -2);
    const f = END[group].map(e => stem + e);
    if (inf === 'manger' || inf === 'nager') f[3] = stem + 'eons';     // nous mangeons
    if (inf === 'commencer') f[3] = 'commençons';                       // nous commençons
    return f;
  }
  const elide = form => /^[aeiouhéèêâîôû]/i.test(form);                 // j’aime, j’habite, j’ai
  const FR_SETS = {                                                     // snelknoppen op de niveaupagina
    kaartjes: KAARTJES,
    er: VERBS.filter(v => v[2] === 'er').map(v => v[0]),
    irre: VERBS.filter(v => v[2] === 'ir' || v[2] === 're').map(v => v[0]),
    onregel: VERBS.filter(v => v[2] === 'x').map(v => v[0]),
    alles: VERBS.map(v => v[0])
  };

  /* ---------- Rekensoorten van de wolven ---------- */
  const REKEN = {
    brug:      ['🌉', 'Brugsommen', ['tot 100', 'tot 1000', 'met geld'], 'Tussenstappen (63 − 20 = 43, 43 − 7 = 36)'],
    dubbel:    ['✌️', 'Dubbel, helft & veelvoud', ['makkelijker', 'gewoon', 'moeilijker'], ''],
    plaats:    ['🏛️', 'Plaatswaarde tot 10 000', ['makkelijker', 'gewoon', 'moeilijker'], ''],
    maal:      ['🧮', 'Cijferend vermenigvuldigen', ['× 11 tot 19', '× 11 tot 49', '3 cijfers × 2 cijfers'], 'Tussenstappen (eerst de eenheden, dan de tientallen)'],
    kommaplus: ['💶', 'Kommagetallen + en −', ['met geld', 'geld en maten', 'ook E, t, h'], ''],
    kommamaal: ['📏', 'Kommagetallen ×', ['met eenheid', 'met en zonder eenheid', '× 2 cijfers'], 'Tussenstap (eerst zonder komma rekenen)'],
    delen:     ['🍪', 'Delen en staartdeling', ['deeltafels', 'staartdeling', 'met komma'], 'Tussenstappen (hoe vaak past … in …?)']
  };
  const SOMMEN_LEVELS = { tot10: 'tot 10', zonder: 'tot 20 zonder brug', met: 'tot 20 met brug', alles: 'alles tot 20' };
  const OPS = { plus: '+ plus', min: '− min', beide: '+ en −' };

  function groep() { return get('oef.groep', null) === 'wolf' ? 'wolf' : 'pimpelmees'; }

  // Standaardwaarden: overgenomen uit wat vroeger in de spelletjes zelf ingesteld stond
  function defaults(g) {
    if (g === 'wolf') {
      const np = get('np.settings', {}), fp = get('fp.settings', {});
      const lv = np.level || {}, sb = Object.assign({ maal: true, kommamaal: true, delen: true, brug: false }, np.stepsBy || {});
      const reken = {};
      Object.keys(REKEN).forEach(k => { reken[k] = { on: true, lv: typeof lv[k] === 'number' ? lv[k] : 1, steps: !!sb[k] }; });
      return {
        reken,
        tafels: [2, 3, 4, 5, 6, 7, 8, 9, 10], delen: true,
        frans: { verbs: (FR_SETS[fp.type] || KAARTJES).slice(), mode: fp.level === 1 ? 'typen' : 'kiezen', nlOnly: !!fp.nlOnly }
      };
    }
    const sp = get('sp.settings', {}), tp = get('tp.settings', {});
    const tafels = Array.isArray(tp.tables) && tp.tables.length ? tp.tables.filter(n => n >= 1 && n <= 10) : [2, 5, 10];
    return {
      sommen: { level: SOMMEN_LEVELS[sp.level] ? sp.level : 'alles', ops: OPS[sp.ops] ? sp.ops : 'beide', missing: !!sp.missing },
      tafels, tafelMissing: !!tp.missing
    };
  }
  function merge(d, v) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || !d || typeof d !== 'object' || Array.isArray(d)) return v === undefined ? d : v;
    const o = Object.assign({}, d);
    Object.keys(v).forEach(k => { o[k] = merge(d[k], v[k]); });
    return o;
  }
  function load(g) {
    g = g || groep();
    const n = merge(defaults(g), get('niv.' + g, null) || {});
    // nooit leeg: minstens één tafel, één rekensoort, één werkwoord
    if (!n.tafels || !n.tafels.length) n.tafels = g === 'wolf' ? [2] : [1];
    if (g === 'wolf') {
      if (!Object.values(n.reken).some(r => r.on)) n.reken.brug.on = true;
      n.frans.verbs = n.frans.verbs.filter(v => VERBS.some(x => x[0] === v));
      if (!n.frans.verbs.length) n.frans.verbs = KAARTJES.slice();
    }
    return n;
  }
  function save(g, n) { set('niv.' + g, n); }

  window.FR = { VERBS, KAARTJES, END, IRREG, conj, elide, SETS: FR_SETS };
  window.NIVEAU = { groep, load, save, REKEN, SOMMEN_LEVELS, OPS };
})();
