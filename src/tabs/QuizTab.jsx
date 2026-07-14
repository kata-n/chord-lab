import { useState } from 'react';
import QuizRunner from '../components/QuizRunner.jsx';
import {
  genNotesQuiz,
  genDegreeQuiz,
  genMinorDegreeQuiz,
  genProgressionQuiz,
  genFunctionQuiz,
  genTheoryMix,
} from '../quizzes.js';

const CATS = [
  { id: 'mix', label: 'ミックス', gen: genTheoryMix, desc: '全種類からランダム出題' },
  { id: 'notes', label: '構成音', gen: genNotesQuiz, desc: 'コードの中身の音を当てる' },
  { id: 'degree', label: 'ディグリー', gen: genDegreeQuiz, desc: 'キーと度数からコード名を当てる' },
  {
    id: 'minor-degree',
    label: 'マイナー',
    gen: genMinorDegreeQuiz,
    desc: 'マイナーキーの度数からコード名を当てる(レッスン6)',
  },
  { id: 'progression', label: '定番進行', gen: genProgressionQuiz, desc: '進行の穴埋め' },
  { id: 'function', label: '機能', gen: genFunctionQuiz, desc: 'T・S・Dを当てる' },
];

export default function QuizTab() {
  const [cat, setCat] = useState(CATS[0]);
  return (
    <div>
      <p className="tab-intro">
        レッスンで学んだ内容をドリルで定着させましょう。結果は自動で記録されます。
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
      <QuizRunner key={cat.id} generate={cat.gen} />
    </div>
  );
}
