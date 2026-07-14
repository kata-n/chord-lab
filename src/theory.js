// 音楽理論のデータとユーティリティ

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// キー(調)。accidental はそのキーでの音名表記(シャープ系/フラット系)
export const KEYS = [
  { pc: 0, name: 'C', accidental: 'sharp' },
  { pc: 7, name: 'G', accidental: 'sharp' },
  { pc: 2, name: 'D', accidental: 'sharp' },
  { pc: 9, name: 'A', accidental: 'sharp' },
  { pc: 4, name: 'E', accidental: 'sharp' },
  { pc: 5, name: 'F', accidental: 'flat' },
  { pc: 10, name: 'B♭', accidental: 'flat' },
  { pc: 3, name: 'E♭', accidental: 'flat' },
];

export function noteName(pc, accidental = 'sharp') {
  const idx = ((pc % 12) + 12) % 12;
  return accidental === 'flat' ? FLAT_NAMES[idx] : SHARP_NAMES[idx];
}

// コードの種類: ルートからの半音数
export const QUALITIES = {
  maj: { suffix: '', intervals: [0, 4, 7], label: 'メジャー' },
  min: { suffix: 'm', intervals: [0, 3, 7], label: 'マイナー' },
  dim: { suffix: 'm(♭5)', intervals: [0, 3, 6], label: 'マイナーフラットファイブ' },
  aug: { suffix: 'aug', intervals: [0, 4, 8], label: 'オーギュメント' },
  sus4: { suffix: 'sus4', intervals: [0, 5, 7], label: 'サスフォー' },
  sus2: { suffix: 'sus2', intervals: [0, 2, 7], label: 'サスツー' },
  add9: { suffix: 'add9', intervals: [0, 4, 7, 14], label: 'アドナインス' },
  six: { suffix: '6', intervals: [0, 4, 7, 9], label: 'シックススコード' },
  dim7: { suffix: 'dim7', intervals: [0, 3, 6, 9], label: 'ディミニッシュセブンス' },
  mM7: { suffix: 'mM7', intervals: [0, 3, 7, 11], label: 'マイナーメジャーセブンス' },
  maj7: { suffix: 'M7', intervals: [0, 4, 7, 11], label: 'メジャーセブンス' },
  min7: { suffix: 'm7', intervals: [0, 3, 7, 10], label: 'マイナーセブンス' },
  dom7: { suffix: '7', intervals: [0, 4, 7, 10], label: 'セブンス' },
  m7b5: { suffix: 'm7(♭5)', intervals: [0, 3, 6, 10], label: 'ハーフディミニッシュ' },
};

// メジャーキーのダイアトニックコード(度数ごとの定義)
export const DIATONIC = [
  { degree: 1, offset: 0, numeral: 'Ⅰ', quality: 'maj', seventh: 'maj7', func: 'T' },
  { degree: 2, offset: 2, numeral: 'Ⅱ', quality: 'min', seventh: 'min7', func: 'S' },
  { degree: 3, offset: 4, numeral: 'Ⅲ', quality: 'min', seventh: 'min7', func: 'T' },
  { degree: 4, offset: 5, numeral: 'Ⅳ', quality: 'maj', seventh: 'maj7', func: 'S' },
  { degree: 5, offset: 7, numeral: 'Ⅴ', quality: 'maj', seventh: 'dom7', func: 'D' },
  { degree: 6, offset: 9, numeral: 'Ⅵ', quality: 'min', seventh: 'min7', func: 'T' },
  { degree: 7, offset: 11, numeral: 'Ⅶ', quality: 'dim', seventh: 'm7b5', func: 'D' },
];

// マイナーキー(ナチュラルマイナー基準)のダイアトニックコード
export const MINOR_DIATONIC = [
  { degree: 1, offset: 0, numeral: 'Ⅰ', quality: 'min', seventh: 'min7', func: 'T' },
  { degree: 2, offset: 2, numeral: 'Ⅱ', quality: 'dim', seventh: 'm7b5', func: 'S' },
  { degree: 3, offset: 3, numeral: '♭Ⅲ', quality: 'maj', seventh: 'maj7', func: 'T' },
  { degree: 4, offset: 5, numeral: 'Ⅳ', quality: 'min', seventh: 'min7', func: 'S' },
  { degree: 5, offset: 7, numeral: 'Ⅴ', quality: 'min', seventh: 'min7', func: 'D' },
  { degree: 6, offset: 8, numeral: '♭Ⅵ', quality: 'maj', seventh: 'maj7', func: 'S' },
  { degree: 7, offset: 10, numeral: '♭Ⅶ', quality: 'maj', seventh: 'dom7', func: 'D' },
];

// 度数のローマ数字表記(数字 + コード種のサフィックス)
export function romanName(numeral, qualityKey) {
  return numeral + QUALITIES[qualityKey].suffix;
}

export const FUNCTIONS = {
  T: { name: 'トニック', short: 'T', desc: '安定・落ち着き。曲の「家」', color: '#3b82f6' },
  S: { name: 'サブドミナント', short: 'S', desc: 'ふくらみ・広がり。少し外に出た感じ', color: '#10b981' },
  D: { name: 'ドミナント', short: 'D', desc: '緊張・不安定。トニックに戻りたがる', color: '#f59e0b' },
};

// ルートを G3(55)〜F#4(66) に収めたコンパクトなボイシングで構成音の MIDI ノートを作る
export function buildChord(rootPc, qualityKey, accidental = 'sharp') {
  const q = QUALITIES[qualityKey];
  let rootMidi = 60 + (((rootPc % 12) + 12) % 12);
  if (rootMidi > 66) rootMidi -= 12;
  const midi = q.intervals.map((iv) => rootMidi + iv);
  return {
    rootPc: ((rootPc % 12) + 12) % 12,
    quality: qualityKey,
    name: noteName(rootPc, accidental) + q.suffix,
    midi,
    noteNames: midi.map((m) => noteName(m % 12, accidental)),
  };
}

// キーと度数(1〜7)からダイアトニックコードを作る
export function degreeChord(key, degree, opts = {}) {
  const d = DIATONIC[degree - 1];
  const quality = opts.seventh ? d.seventh : d.quality;
  const chord = buildChord(key.pc + d.offset, quality, key.accidental);
  return { ...chord, roman: romanName(d.numeral, quality), func: d.func, degree: d.degree };
}

// メジャーキーの平行短調(同じ調号のマイナーキー)
export function relativeMinor(key) {
  const pc = (key.pc + 9) % 12;
  return {
    pc,
    name: noteName(pc, key.accidental) + 'm',
    tonicName: noteName(pc, key.accidental),
    accidental: key.accidental,
  };
}

// マイナーキーの度数からダイアトニックコードを作る。
// opts.harmonic を立てると Ⅴ がハーモニックマイナー由来のメジャー(Ⅴ7)になる。
export function minorDegreeChord(minorKey, degree, opts = {}) {
  const d = MINOR_DIATONIC[degree - 1];
  let quality = opts.seventh ? d.seventh : d.quality;
  if (degree === 5 && opts.harmonic) quality = opts.seventh ? 'dom7' : 'maj';
  const chord = buildChord(minorKey.pc + d.offset, quality, minorKey.accidental);
  return { ...chord, roman: romanName(d.numeral, quality), func: d.func, degree: d.degree };
}

export const PROGRESSIONS = [
  {
    id: 'canon',
    name: 'カノン進行',
    reading: '1563-4145',
    degrees: [1, 5, 6, 3, 4, 1, 4, 5],
    desc: 'パッヘルベルの「カノン」が由来。安定と切なさを行き来しながら、なだらかに下っていくベースラインが心地よい、時代を超えた定番。',
    examples: '「クリスマス・イブ」「さくら(独唱)」など無数の曲',
  },
  {
    id: 'oudou',
    name: '王道進行',
    reading: '4536進行',
    degrees: [4, 5, 3, 6],
    desc: 'J-POPで最も使われると言われる進行。ふくらみ(Ⅳ)から緊張(Ⅴ)を経て、Ⅲm→Ⅵmと切なく着地する。サビで多用される。',
    examples: '「ロビンソン」「愛をこめて花束を」など',
  },
  {
    id: 'komuro',
    name: '小室進行',
    reading: '6451進行',
    degrees: [6, 4, 5, 1],
    desc: '小室哲哉さんが多用したことから命名。マイナー(Ⅵm)から始まる哀愁と、最後にⅠへ解決する爽快感が特徴。疾走感のある曲に合う。',
    examples: '90年代ダンスポップ、アニソンなど多数',
  },
  {
    id: 'pop',
    name: 'ポップパンク進行',
    reading: '1564進行',
    degrees: [1, 5, 6, 4],
    desc: '洋楽ポップスの大定番。明るくまっすぐで、ループしても飽きない。「Let It Be」型とも呼ばれる。',
    examples: '「Let It Be」「小さな恋のうた」など',
  },
  {
    id: 'twofive',
    name: 'ツーファイブワン',
    reading: '2-5-1',
    degrees: [2, 5, 1],
    seventh: true,
    desc: 'ジャズの基本にして最重要進行。S→D→Tと機能の流れがそのまま形になっている。セブンスコード(Ⅱm7→Ⅴ7→ⅠM7)で弾くのが定番。',
    examples: 'ジャズスタンダードのほぼ全て',
  },
];

export function progressionChords(prog, key, opts = {}) {
  const seventh = opts.seventh ?? prog.seventh ?? false;
  return prog.degrees.map((deg) => degreeChord(key, deg, { seventh }));
}

// マイナーキーの定番進行
export const MINOR_PROGRESSIONS = [
  {
    id: 'm-andalusian',
    name: 'アンダルシア進行',
    reading: 'Ⅰm→♭Ⅶ→♭Ⅵ→Ⅴ',
    degrees: [1, 7, 6, 5],
    harmonicV: true,
    desc: 'ベースが1音ずつ下りていくドラマチックな進行。フラメンコが由来で、哀愁と情熱を併せ持つ。最後のⅤはハーモニックマイナー由来のメジャーコードにするのが定番。',
    examples: '「Hit the Road Jack」、フラメンコ、ロック、演歌まで幅広く',
  },
  {
    id: 'm-fourchord',
    name: 'マイナー4コード',
    reading: 'Ⅰm→♭Ⅵ→♭Ⅲ→♭Ⅶ',
    degrees: [1, 6, 3, 7],
    desc: '壮大でエモーショナルなループ。マイナーの暗さの中に♭Ⅲ・♭Ⅶの明るさが混ざり、切なくも前向きな響きになる。',
    examples: 'ロックバラード、映画音楽、洋楽ヒット曲の定番ループ',
  },
  {
    id: 'm-twofive',
    name: 'マイナーツーファイブ',
    reading: 'Ⅱm7(♭5)→Ⅴ7→Ⅰm7',
    degrees: [2, 5, 1],
    seventh: true,
    harmonicV: true,
    desc: 'メジャーのツーファイブワンのマイナー版。Ⅱm7(♭5)の不安定さからⅤ7の緊張を経てⅠm7に解決する、ジャズ・バラードの必須進行。',
    examples: 'ジャズ、バラード、アニソンのしっとりした場面',
  },
];

export function minorProgressionChords(prog, minorKey) {
  return prog.degrees.map((deg) =>
    minorDegreeChord(minorKey, deg, {
      seventh: prog.seventh ?? false,
      harmonic: prog.harmonicV ?? false,
    })
  );
}

// ブラックアダーコード(俗称: イキスギコード)。
// ベース音の全音上に築いたオーギュメントを乗せた分数コード。
// 実体は「3度と5度を省いたドミナント7th(9, ♯11)」で、フレンチシックスと同じ響き。
export function blackadderChord(bassPc, accidental = 'sharp') {
  const pc = ((bassPc % 12) + 12) % 12;
  const bassMidi = 48 + pc; // C3〜B3 の低めのベース
  const midi = [bassMidi, bassMidi + 10, bassMidi + 14, bassMidi + 18];
  return {
    rootPc: pc,
    quality: 'blackadder',
    name: `${noteName(pc + 2, accidental)}aug/${noteName(pc, accidental)}`,
    midi,
    noteNames: midi.map((m) => noteName(m % 12, accidental)),
  };
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomInt(n) {
  return Math.floor(Math.random() * n);
}

export function pick(arr) {
  return arr[randomInt(arr.length)];
}
