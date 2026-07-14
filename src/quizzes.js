// クイズの問題ジェネレーター

import {
  KEYS,
  DIATONIC,
  MINOR_DIATONIC,
  FUNCTIONS,
  PROGRESSIONS,
  QUALITIES,
  buildChord,
  degreeChord,
  minorDegreeChord,
  progressionChords,
  relativeMinor,
  romanName,
  pick,
  randomInt,
  shuffle,
} from './theory.js';

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];

// --- 理論クイズ ---

// 構成音クイズ: 「Cm の構成音はどれ?」
export function genNotesQuiz() {
  const rootPc = pick(WHITE_PCS);
  const quality = pick(['maj', 'min']);
  const chord = buildChord(rootPc, quality);
  const variants = quality === 'maj' ? ['min', 'sus4', 'aug'] : ['maj', 'dim', 'sus4'];
  const options = shuffle([
    { label: chord.noteNames.join('・'), correct: true },
    ...variants.map((v) => ({
      label: buildChord(rootPc, v).noteNames.join('・'),
      correct: false,
    })),
  ]);
  return {
    category: 'notes',
    prompt: `${chord.name} の構成音はどれ?`,
    sound: { type: 'chord', midi: chord.midi },
    soundLabel: '🔊 答えの響きをきく',
    options: options.map((o) => o.label),
    answerIndex: options.findIndex((o) => o.correct),
    explain:
      quality === 'maj'
        ? `${chord.name}(メジャー)= ルートから「4半音 + 3半音」。${chord.noteNames.join(' - ')} です。`
        : `${chord.name}(マイナー)= ルートから「3半音 + 4半音」。${chord.noteNames.join(' - ')} です。`,
  };
}

// ディグリークイズ: 「キーGメジャーの Ⅵm は?」
export function genDegreeQuiz() {
  const key = pick(KEYS);
  const degree = 1 + randomInt(6); // Ⅰ〜Ⅵm(Ⅶは除外)
  const correct = degreeChord(key, degree);
  const others = shuffle(
    [1, 2, 3, 4, 5, 6].filter((d) => d !== degree)
  ).slice(0, 3);
  const options = shuffle([
    { label: correct.name, correct: true },
    ...others.map((d) => ({ label: degreeChord(key, d).name, correct: false })),
  ]);
  const all = [1, 2, 3, 4, 5, 6, 7]
    .map((d) => {
      const c = degreeChord(key, d);
      return `${c.roman}=${c.name}`;
    })
    .join('、');
  return {
    category: 'degree',
    prompt: `キー ${key.name} メジャーの ${correct.roman} はどのコード?`,
    sound: { type: 'chord', midi: correct.midi },
    soundLabel: '🔊 答えの響きをきく',
    options: options.map((o) => o.label),
    answerIndex: options.findIndex((o) => o.correct),
    explain: `${key.name}メジャーのダイアトニックコードは ${all} です。`,
  };
}

// 定番進行の穴埋めクイズ
export function genProgressionQuiz() {
  const prog = pick(PROGRESSIONS);
  const key = KEYS[0]; // C
  const chords = progressionChords(prog, key);
  const blank = randomInt(chords.length);
  const romans = chords.map((c, i) => (i === blank ? '□' : c.roman));
  const answer = chords[blank].roman;
  const distractorPool = DIATONIC.map((d) => romanName(d.numeral, d.quality)).filter(
    (r) => r !== answer
  );
  const options = shuffle([
    { label: answer, correct: true },
    ...shuffle(distractorPool)
      .slice(0, 3)
      .map((r) => ({ label: r, correct: false })),
  ]);
  return {
    category: 'progression',
    prompt: `${prog.name}(${prog.reading})の進行は?\n${romans.join(' → ')}`,
    sound: { type: 'progression', chords },
    soundLabel: '🔊 正しい進行をきく',
    options: options.map((o) => o.label),
    answerIndex: options.findIndex((o) => o.correct),
    explain: `${prog.name}は ${chords.map((c) => c.roman).join(' → ')}(キーCなら ${chords
      .map((c) => c.name)
      .join(' → ')})です。`,
  };
}

// 機能クイズ: 「Ⅳ の機能は?」
export function genFunctionQuiz() {
  const d = pick(DIATONIC);
  const roman = romanName(d.numeral, d.quality);
  const funcs = ['T', 'S', 'D'];
  const options = funcs.map((f) => FUNCTIONS[f].name);
  const answerIndex = funcs.indexOf(d.func);
  const group = DIATONIC.filter((x) => x.func === d.func)
    .map((x) => romanName(x.numeral, x.quality))
    .join('・');
  return {
    category: 'function',
    prompt: `${roman} のコードの機能は?`,
    sound: null,
    options,
    answerIndex,
    explain: `${roman} は${FUNCTIONS[d.func].name}(${FUNCTIONS[d.func].desc})。同じ仲間は ${group} です。`,
  };
}

// マイナーディグリークイズ: 「キーAマイナーの ♭Ⅵ は?」
export function genMinorDegreeQuiz() {
  const majorKey = pick(KEYS);
  const minor = relativeMinor(majorKey);
  const degree = 1 + randomInt(7);
  const correct = minorDegreeChord(minor, degree);
  const others = shuffle([1, 2, 3, 4, 5, 6, 7].filter((d) => d !== degree)).slice(0, 3);
  const options = shuffle([
    { label: correct.name, correct: true },
    ...others.map((d) => ({ label: minorDegreeChord(minor, d).name, correct: false })),
  ]);
  const all = [1, 2, 3, 4, 5, 6, 7]
    .map((d) => {
      const c = minorDegreeChord(minor, d);
      return `${c.roman}=${c.name}`;
    })
    .join('、');
  return {
    category: 'minor-degree',
    prompt: `キー ${minor.name}(${majorKey.name}メジャーの平行短調)の ${correct.roman} はどのコード?`,
    sound: { type: 'chord', midi: correct.midi },
    soundLabel: '🔊 答えの響きをきく',
    options: options.map((o) => o.label),
    answerIndex: options.findIndex((o) => o.correct),
    explain: `${minor.name}(ナチュラルマイナー)のダイアトニックコードは ${all} です。`,
  };
}

export function genTheoryMix() {
  return pick([
    genNotesQuiz,
    genDegreeQuiz,
    genProgressionQuiz,
    genFunctionQuiz,
    genMinorDegreeQuiz,
  ])();
}

// --- イヤートレーニング ---

// メジャー/マイナー聴き分け
export function genMajMinEar() {
  const rootPc = randomInt(12);
  const quality = pick(['maj', 'min']);
  const chord = buildChord(rootPc, quality);
  const options = ['メジャー(明るい)', 'マイナー(暗い・切ない)'];
  return {
    category: 'ear-majmin',
    prompt: '再生されたコードはどっち?',
    sound: { type: 'chord', midi: chord.midi },
    soundLabel: '🔊 再生する',
    mustListen: true,
    options,
    answerIndex: quality === 'maj' ? 0 : 1,
    explain: `正解は ${chord.name}(${quality === 'maj' ? 'メジャー' : 'マイナー'})でした。構成音: ${chord.noteNames.join(' - ')}`,
  };
}

// 定番進行の聴き当て
export function genProgEar() {
  const prog = pick(PROGRESSIONS);
  const key = KEYS[0]; // C
  const chords = progressionChords(prog, key);
  const options = PROGRESSIONS.map((p) => `${p.name}(${p.reading})`);
  return {
    category: 'ear-prog',
    prompt: '再生されたコード進行はどれ?',
    sound: { type: 'progression', chords },
    soundLabel: '🔊 再生する',
    mustListen: true,
    options,
    answerIndex: PROGRESSIONS.findIndex((p) => p.id === prog.id),
    explain: `正解は${prog.name}: ${chords.map((c) => c.roman).join(' → ')}(${chords
      .map((c) => c.name)
      .join(' → ')})でした。`,
  };
}

// コードの種類あて(耳): maj / min / sus4 / aug / dim7 / 7
const QUALITY_EAR_POOL = [
  { q: 'maj', label: 'メジャー' },
  { q: 'min', label: 'マイナー' },
  { q: 'sus4', label: 'sus4(宙づり)' },
  { q: 'aug', label: 'aug(不思議・不安)' },
  { q: 'dim7', label: 'dim7(ミステリアス)' },
  { q: 'dom7', label: 'セブンス(7)' },
];

export function genQualityEar() {
  const rootPc = randomInt(12);
  const target = pick(QUALITY_EAR_POOL);
  const chord = buildChord(rootPc, target.q);
  return {
    category: 'ear-quality',
    prompt: '再生されたコードの種類は?',
    sound: { type: 'chord', midi: chord.midi },
    soundLabel: '🔊 再生する',
    mustListen: true,
    options: QUALITY_EAR_POOL.map((p) => p.label),
    answerIndex: QUALITY_EAR_POOL.findIndex((p) => p.q === target.q),
    explain: `正解は ${chord.name}(${QUALITIES[target.q].label})でした。構成音: ${chord.noteNames.join(' - ')}`,
  };
}

export const QUIZ_CATEGORIES = {
  notes: '構成音',
  degree: 'ディグリー',
  'minor-degree': 'マイナーディグリー',
  progression: '定番進行',
  function: '機能(T/S/D)',
  'ear-majmin': '聴き分け: メジャー/マイナー',
  'ear-prog': '聴き分け: 定番進行',
  'ear-quality': '聴き分け: コードの種類',
};
