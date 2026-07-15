import { useEffect, useRef, useState } from 'react';
import { playProgression } from '../audio.js';
import { recordAnswer } from '../storage.js';
import { DICTATION_LEVELS, genDictation } from '../quizzes.js';
import { degreeChord } from '../theory.js';
import { useSolfege, withSolfege } from '../solfege.jsx';

// 度数ディクテーション: 4コード進行(先頭はⅠ固定)を聴いて、残り3つを度数で答える
export default function DictationQuiz() {
  const [levelId, setLevelId] = useState('easy');
  const [q, setQ] = useState(() => genDictation('easy'));
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [count, setCount] = useState({ correct: 0, total: 0 });
  const stopRef = useRef(null);
  const { on: solfegeOn } = useSolfege();

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const stop = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
  };

  const newQuestion = (lv = levelId) => {
    stop();
    setQ(genDictation(lv));
    setAnswers([]);
    setRevealed(false);
  };

  const changeLevel = (lv) => {
    setLevelId(lv);
    newQuestion(lv);
  };

  const playCadence = () => {
    stop();
    stopRef.current = playProgression(
      [1, 4, 5, 1].map((d) => degreeChord(q.key, d)),
      { beatSec: 0.55 }
    );
  };

  const playAll = () => {
    stop();
    stopRef.current = playProgression(q.chords, { beatSec: 0.95 });
  };

  const playBass = () => {
    stop();
    const bassNotes = q.chords.map((c) => ({ midi: [c.midi[0] - 12] }));
    stopRef.current = playProgression(bassNotes, { beatSec: 0.95 });
  };

  const choose = (token) => {
    if (revealed || answers.length >= 3) return;
    const next = [...answers, token];
    setAnswers(next);
    if (next.length === 3) {
      const results = next.map((a, i) => a === q.tokens[i + 1]);
      results.forEach((ok) => recordAnswer('dictation', ok));
      setCount((c) => ({
        correct: c.correct + results.filter(Boolean).length,
        total: c.total + 3,
      }));
      setRevealed(true);
    }
  };

  const level = DICTATION_LEVELS.find((l) => l.id === levelId);
  const allCorrect =
    revealed && answers.every((a, i) => a === q.tokens[i + 1]);

  return (
    <div>
      <div className="cat-row">
        {DICTATION_LEVELS.map((l) => (
          <button
            key={l.id}
            className={l.id === levelId ? 'cat-btn cat-on' : 'cat-btn'}
            onClick={() => changeLevel(l.id)}
            title={l.desc}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="cat-desc">{level.desc}</p>

      <div className="quiz">
        <div className="quiz-score">
          このセッション: {count.correct} / {count.total} コード正解
        </div>
        <p className="quiz-prompt">
          キーは {q.key.name} メジャー。最初のコードはⅠ({degreeChord(q.key, 1).name}
          )です。続く3つのコードを度数で聴き取りましょう。
        </p>
        <div className="dict-controls">
          <button className="btn" onClick={playCadence}>
            🔑 キーを確認
          </button>
          <button className="btn btn-play" onClick={playAll}>
            🔊 進行を再生
          </button>
          <button className="btn" onClick={playBass}>
            🎸 ベースだけ再生
          </button>
        </div>

        <div className="chip-row dict-slots">
          <div className="chip chip-fixed">
            <div className="chip-name">{withSolfege('Ⅰ', solfegeOn)}</div>
            <div className="chip-roman">おてほん</div>
          </div>
          {[0, 1, 2].map((i) => {
            const answered = answers[i];
            const correctToken = q.tokens[i + 1];
            let cls = 'chip';
            let mark = null;
            if (revealed) {
              const ok = answered === correctToken;
              cls += ok ? ' chip-correct' : ' chip-wrong';
              mark = ok
                ? '⭕'
                : `❌ 正解: ${withSolfege(q.chords[i + 1].roman, solfegeOn)}`;
            }
            return (
              <div key={i} className={cls}>
                <div className="chip-name">
                  {answered
                    ? withSolfege(q.options.find((o) => o.token === answered)?.label, solfegeOn)
                    : '?'}
                </div>
                <div className="chip-roman">{mark || `${i + 2}つめ`}</div>
              </div>
            );
          })}
        </div>

        {!revealed && (
          <>
            <div className="dict-options">
              {q.options.map((o) => (
                <button key={o.token} className="quiz-option dict-option" onClick={() => choose(o.token)}>
                  {withSolfege(o.label, solfegeOn)}
                </button>
              ))}
            </div>
            {answers.length > 0 && (
              <button className="btn btn-ghost" onClick={() => setAnswers([])}>
                入力をやり直す
              </button>
            )}
          </>
        )}

        {revealed && (
          <div className={allCorrect ? 'quiz-feedback ok' : 'quiz-feedback ng'}>
            <div className="quiz-verdict">
              {allCorrect ? '⭕ 全問正解!' : 'おしい!もう一度聴いてみよう'}
            </div>
            <p>
              正解: {withSolfege(q.chords.map((c) => c.roman).join(' → '), solfegeOn)}(キー
              {q.key.name}では {q.chords.map((c) => c.name).join(' → ')})
            </p>
            <div className="dict-controls">
              <button className="btn" onClick={playAll}>
                🔊 答え合わせで聴く
              </button>
              <button className="btn btn-primary" onClick={() => newQuestion()}>
                次の問題 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
