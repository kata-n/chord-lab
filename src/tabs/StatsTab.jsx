import { useState } from 'react';
import { loadProgress, resetProgress } from '../storage.js';
import { QUIZ_CATEGORIES } from '../quizzes.js';
import { LESSONS } from './LearnTab.jsx';

export default function StatsTab() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [confirming, setConfirming] = useState(false);

  const readCount = LESSONS.filter((l) => progress.lessonsRead[l.id]).length;
  const cats = Object.entries(QUIZ_CATEGORIES);
  const anyQuiz = cats.some(([id]) => progress.quiz[id]?.total > 0);

  return (
    <div>
      <p className="tab-intro">学習の記録(このブラウザに保存されています)。</p>

      <div className="stat-card">
        <h3>レッスン</h3>
        <p>
          読了 {readCount} / {LESSONS.length}
        </p>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(readCount / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      <div className="stat-card">
        <h3>クイズ成績</h3>
        {!anyQuiz && <p className="muted">まだクイズに挑戦していません。</p>}
        {cats.map(([id, label]) => {
          const s = progress.quiz[id];
          if (!s || s.total === 0) return null;
          const rate = Math.round((s.correct / s.total) * 100);
          return (
            <div key={id} className="stat-row">
              <div className="stat-label">{label}</div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${rate}%` }} />
              </div>
              <div className="stat-nums">
                {rate}%({s.correct}/{s.total})
              </div>
            </div>
          );
        })}
      </div>

      <div className="stat-card">
        <h3>連続正解</h3>
        <p>
          現在 <strong>{progress.streak.current}</strong> 問 / 自己ベスト{' '}
          <strong>{progress.streak.best}</strong> 問
        </p>
      </div>

      <div className="stat-card">
        <h3>データの管理</h3>
        {confirming ? (
          <div className="reset-confirm">
            <p>本当にすべての記録を削除しますか?</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                setProgress(resetProgress());
                setConfirming(false);
              }}
            >
              削除する
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
              やめる
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
            記録をリセット…
          </button>
        )}
      </div>
    </div>
  );
}
