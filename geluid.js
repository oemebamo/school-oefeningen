/* Geluid dat ook op iPad en iPhone betrouwbaar speelt, gedeeld door alle spelletjes.
   - iPadOS laat geluid pas toe na een tik: bij de eerste tik ontgrendelen we het en laden we de opnames vooraf.
   - Opnames spelen via Web Audio, zodat ze ook na een pauze (eindwoord, meme) nog mogen spelen.
   - Ook als de iPad op stil staat (waar de browser dat toelaat), en het geluid komt terug na een video of een andere app. */
window.GELUID = (function () {
  'use strict';
  const me = document.currentScript && document.currentScript.src;
  const BASE = me ? me.replace(/[^/]*$/, '') + 'geluiden/' : '../../geluiden/';
  let ctx = null, preloaded = false;
  const cache = {};
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}

  function context() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch (e) { return null; }
    }
    if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }   // ook na 'interrupted' (video, andere app)
    return ctx;
  }
  function load(url) {
    if (!cache[url]) {
      cache[url] = fetch(url).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(b => new Promise((res, rej) => context().decodeAudioData(b, res, rej)))
        .catch(() => null);
    }
    return cache[url];
  }
  function preload() {
    if (preloaded) return; preloaded = true;
    (Array.isArray(window.GELUIDEN) ? window.GELUIDEN : []).forEach(f => load(BASE + encodeURIComponent(f)));
  }
  let ttsReady = false;
  function unlock() {
    const c = context(); if (!c) return;
    try { const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch (e) {}
    preload();
    // iOS spreekt pas na een eerste spreekopdracht binnen een tik
    if (!ttsReady && window.speechSynthesis) {
      try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); ttsReady = true; } catch (e) {}
    }
  }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx) context(); });

  // Een opname afspelen (bestandsnaam uit geluiden/). Lukt het niet via Web Audio, dan gewoon met <audio>.
  function play(file) {
    const url = BASE + encodeURIComponent(file), c = context();
    const fallback = () => { try { new Audio(url).play().catch(() => {}); } catch (e) {} };
    if (!c) { fallback(); return true; }
    load(url).then(buf => {
      if (!buf) return fallback();
      try { const s = c.createBufferSource(); s.buffer = buf; s.connect(c.destination); s.start(0); } catch (e) { fallback(); }
    });
    return true;
  }
  // Computerstem. Op iOS valt een zin soms weg als je meteen na cancel() spreekt: daarom heel even wachten.
  function speak(text, lang, rate, pitch) {
    if (!window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = lang || 'en-US'; u.rate = rate || 1.05; u.pitch = pitch || 1.2;
      if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); setTimeout(() => speechSynthesis.speak(u), 60); }
      else speechSynthesis.speak(u);
    } catch (e) {}
  }
  return { ctx: context, play, speak };
})();
