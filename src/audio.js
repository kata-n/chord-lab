// Web Audio API によるシンプルなピアノ風サウンドエンジン

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export function playNote(midi, { duration = 1.2, gain = 0.22 } = {}) {
  const ac = getCtx();
  const t0 = ac.currentTime;
  const f = midiToFreq(midi);

  const env = ac.createGain();
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(f * 6, 8000), t0);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 300), t0 + duration);

  const o1 = ac.createOscillator();
  o1.type = 'triangle';
  o1.frequency.value = f;

  const o2 = ac.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = f * 2;
  const g2 = ac.createGain();
  g2.gain.value = 0.35;

  o1.connect(env);
  o2.connect(g2);
  g2.connect(env);
  env.connect(lp);
  lp.connect(ac.destination);

  o1.start(t0);
  o2.start(t0);
  o1.stop(t0 + duration + 0.1);
  o2.stop(t0 + duration + 0.1);
}

export function playChord(midis, { duration = 1.5, gain = 0.16 } = {}) {
  midis.forEach((m) => playNote(m, { duration, gain }));
}

// コード進行を順に再生する。戻り値の関数で途中停止できる。
// onStep(i) は各コードの頭で、onEnd() は再生終了時に呼ばれる。
export function playProgression(chords, { beatSec = 1.0, onStep, onEnd } = {}) {
  const timers = [];
  chords.forEach((chord, i) => {
    timers.push(
      setTimeout(() => {
        playChord(chord.midi, { duration: beatSec * 1.4 });
        if (onStep) onStep(i);
      }, i * beatSec * 1000)
    );
  });
  timers.push(
    setTimeout(() => {
      if (onEnd) onEnd();
    }, chords.length * beatSec * 1000 + 400)
  );
  return () => {
    timers.forEach(clearTimeout);
    if (onEnd) onEnd();
  };
}
