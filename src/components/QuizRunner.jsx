import { useEffect, useRef, useState } from 'react';
import { playChord, playProgression } from '../audio.js';
import { recordAnswer } from '../storage.js';
import { useSolfege, withSolfege } from '../solfege.jsx';

// クイズの出題・解答・フィードバックを担う共通コンポーネント。
// generate() が問題オブジェクトを返す。
export default function QuizRunner({ generate }) {
  const [q, setQ] = useState(() => generate());
  const [selected, setSelected] = useState(null);
  const [listened, setListened] = useState(false);
  const [count, setCount] = useState({ correct: 0, total: 0 });
  const stopRef = useRef(null);
  const { on: solfegeOn } = useSolfege();

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const play = () => {
    if (!q.sound) return;
    if (stopRef.current) stopRef.current();
    if (q.sound.type === 'chord') {
      playChord(q.sound.midi);
    } else {
      stopRef.current = playProgression(q.sound.chords, { beatSec: 0.9 });
    }
    setListened(true);
  };

  const choose = (i) => {
    if (selected != null) return;
    setSelected(i);
    const ok = i === q.answerIndex;
    recordAnswer(q.category, ok);
    setCount((c) => ({ correct: c.correct + (ok ? 1 : 0), total: c.total + 1 }));
  };

  const next = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setQ(generate());
    setSelected(null);
    setListened(false);
  };

  const answered = selected != null;
  const locked = q.mustListen && !listened;

  return (
    <div className="quiz">
      <div className="quiz-score">
        このセッション: {count.correct} / {count.total} 問正解
      </div>
      <p className="quiz-prompt">{withSolfege(q.prompt, solfegeOn)}</p>
      {q.sound && (
        <button className="btn btn-play" onClick={play}>
          {q.soundLabel}
        </button>
      )}
      {locked && <p className="quiz-hint">まず再生ボタンを押して音を聴いてください。</p>}
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (answered) {
            if (i === q.answerIndex) cls += ' quiz-correct';
            else if (i === selected) cls += ' quiz-wrong';
            else cls += ' quiz-dim';
          }
          return (
            <button key={i} className={cls} disabled={answered || locked} onClick={() => choose(i)}>
              {withSolfege(opt, solfegeOn)}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={selected === q.answerIndex ? 'quiz-feedback ok' : 'quiz-feedback ng'}>
          <div className="quiz-verdict">
            {selected === q.answerIndex ? '⭕ 正解!' : '❌ ざんねん…'}
          </div>
          <p>{withSolfege(q.explain, solfegeOn)}</p>
          <button className="btn btn-primary" onClick={next}>
            次の問題 →
          </button>
        </div>
      )}
    </div>
  );
}
