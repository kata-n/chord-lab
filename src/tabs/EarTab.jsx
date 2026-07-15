import { useState } from 'react';
import QuizRunner from '../components/QuizRunner.jsx';
import DictationQuiz from '../components/DictationQuiz.jsx';
import { genIdolEar, genMajMinEar, genProgEar, genQualityEar } from '../quizzes.js';

const CATS = [
  {
    id: 'majmin',
    label: 'メジャー / マイナー',
    gen: genMajMinEar,
    desc: 'まずはここから。響きの明暗を聴き分ける',
  },
  {
    id: 'quality',
    label: 'コードの種類あて',
    gen: genQualityEar,
    desc: 'sus4・aug・dim7なども聴き分ける(レッスン7)',
  },
  {
    id: 'prog',
    label: '定番進行あて',
    gen: genProgEar,
    desc: 'レッスン4の進行を耳で当てる(キーはC固定)',
  },
  {
    id: 'idol',
    label: 'アイドル進行あて',
    gen: genIdolEar,
    desc: 'アイドル曲頻出のパターンをランダムなキーで当てる(レッスン9)',
  },
  {
    id: 'dictation',
    label: 'ディクテーション',
    comp: DictationQuiz,
    desc: '進行を1コードずつ度数で聴き取る実戦練習。耳コピへの近道',
  },
];

export default function EarTab() {
  const [cat, setCat] = useState(CATS[0]);
  return (
    <div>
      <p className="tab-intro">
        イヤートレーニング。音を再生してから答えを選びます。
        何度でも聴き直してOK。ヘッドホン推奨です。
      </p>
      <div className="cat-row">
        {CATS.map((c) => (
          <button
            key={c.id}
            className={cat.id === c.id ? 'cat-btn cat-on' : 'cat-btn'}
            onClick={() => setCat(c)}
            title={c.desc}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="cat-desc">{cat.desc}</p>
      {cat.comp ? (
        <cat.comp key={cat.id} />
      ) : (
        <QuizRunner key={cat.id} generate={cat.gen} />
      )}
    </div>
  );
}
