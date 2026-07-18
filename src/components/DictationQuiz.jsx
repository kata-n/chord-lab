import { useEffect, useRef, useState } from 'react';
import { playProgression } from '../audio.js';
import { recordAnswer, recordDictationResult } from '../storage.js';
import { DICTATION_LEVELS, genDictation } from '../quizzes.js';
import { degreeChord, KEYS } from '../theory.js';
import { useSolfege, withSolfege } from '../solfege.jsx';
import ProgressionPlayer from './ProgressionPlayer.jsx';

const KEY_MODE_STORAGE = 'chord-lab-dict-keymode';

// キーを少しずつ広げていく5段階(五度圏の近い順)。正答8割を目安に次へ。
const KEY_STAGES = [
  { id: 'c', label: 'C固定', names: ['C'], desc: 'まずは聴き取りやすいCで相対感覚を固める' },
  { id: 'cg', label: 'C・G', names: ['C', 'G'], desc: '隣のキーGを混ぜて、毎問「ド」を取り直す練習' },
  { id: 'cgf', label: 'C・G・F', names: ['C', 'G', 'F'], desc: '反対隣のFも追加。3キーからランダム' },
  {
    id: 'five',
    label: '5キー',
    names: ['C', 'G', 'F', 'D', 'A'],
    desc: 'C・G・F・D・A の5キーからランダム',
  },
  {
    id: 'all',
    label: '全キー',
    names: KEYS.map((k) => k.name),
    desc: '8キー全部からランダム。実戦モード',
  },
];

function loadStageId() {
  try {
    const v = localStorage.getItem(KEY_MODE_STORAGE);
    if (v === 'random') return 'all'; // 旧設定の引き継ぎ
    return KEY_STAGES.some((s) => s.id === v) ? v : 'c';
  } catch {
    return 'c';
  }
}

function stageKeys(stageId) {
  const stage = KEY_STAGES.find((s) => s.id === stageId);
  return KEYS.filter((k) => stage.names.includes(k.name));
}

// 度数ディクテーション: 4コード進行(先頭はⅠ固定)を聴いて、残り3つを度数で答える
export default function DictationQuiz() {
  const [levelId, setLevelId] = useState('easy');
  const [stageId, setStageId] = useState(loadStageId);
  const [q, setQ] = useState(() => genDictation('easy', stageKeys(loadStageId())));
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

  const newQuestion = (lv = levelId, stage = stageId) => {
    stop();
    setQ(genDictation(lv, stageKeys(stage)));
    setAnswers([]);
    setRevealed(false);
  };

  const changeLevel = (lv) => {
    setLevelId(lv);
    newQuestion(lv);
  };

  const changeStage = (stage) => {
    setStageId(stage);
    try {
      localStorage.setItem(KEY_MODE_STORAGE, stage);
    } catch {
      /* 保存できなくても動作は継続 */
    }
    newQuestion(levelId, stage);
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
      next.forEach((a, i) => recordDictationResult(q.tokens[i + 1], a));
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
        <span className="cat-divider" />
        {KEY_STAGES.map((s) => (
          <button
            key={s.id}
            className={s.id === stageId ? 'cat-btn cat-on' : 'cat-btn'}
            onClick={() => changeStage(s.id)}
            title={s.desc}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="cat-desc">
        {level.desc}。{KEY_STAGES.find((s) => s.id === stageId).desc}
      </p>

      <div className="quiz">
        <div className="quiz-score">
          このセッション: {count.correct} / {count.total} コード正解
        </div>
        <p className="quiz-prompt">
          キーは {q.key.name} メジャー
          {solfegeOn ? `(このキーでは ド=${q.key.name})` : ''}。最初のコードはⅠ(
          {degreeChord(q.key, 1).name})です。続く3つのコードを度数で聴き取りましょう。
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
                : `❌ 正解: ${withSolfege(q.chords[i + 1].roman, solfegeOn)}=${q.chords[i + 1].name}`;
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
              正解:{' '}
              {q.chords
                .map((c) => `${withSolfege(c.roman, solfegeOn)}=${c.name}`)
                .join(' → ')}
            </p>
            <p className="quiz-hint">
              ▶再生で鍵盤の光る場所を追えます。コードを個別にクリックしてもOK。
            </p>
            <ProgressionPlayer chords={q.chords} accidental={q.key.accidental} />
            <button className="btn btn-primary" onClick={() => newQuestion()}>
              次の問題 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
