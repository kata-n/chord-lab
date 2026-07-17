import { useState } from 'react';
import { loadProgress, resetProgress } from '../storage.js';
import { QUIZ_CATEGORIES, dictationChord } from '../quizzes.js';
import { KEYS } from '../theory.js';
import { useSolfege, withSolfege } from '../solfege.jsx';
import { LESSONS } from './LearnTab.jsx';

const DICT_TOKENS = ['1', '2', '3', '4', '5', '6', '7', '4m', 'b6', 'b7'];

function tokenRoman(token) {
  return dictationChord(KEYS[0], token).roman;
}

export default function StatsTab() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [confirming, setConfirming] = useState(false);
  const { on: solfegeOn } = useSolfege();

  const readCount = LESSONS.filter((l) => progress.lessonsRead[l.id]).length;
  const cats = Object.entries(QUIZ_CATEGORIES);
  const anyQuiz = cats.some(([id]) => progress.quiz[id]?.total > 0);

  const dict = progress.dictation;
  const dictDegrees = DICT_TOKENS.filter((t) => dict.degrees[t]?.total > 0);
  const confusions = Object.entries(dict.confusions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

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
        <h3>ディクテーションの傾向</h3>
        {dictDegrees.length === 0 && (
          <p className="muted">まだデータがありません。聴くタブのディクテーションに挑戦しましょう。</p>
        )}
        {dictDegrees.length > 0 && (
          <>
            <p className="stat-sub">度数ごとの正答率(出題されたコードが正解できた割合)</p>
            {dictDegrees.map((t) => {
              const s = dict.degrees[t];
              const rate = Math.round((s.correct / s.total) * 100);
              return (
                <div key={t} className="stat-row">
                  <div className="stat-label">{withSolfege(tokenRoman(t), solfegeOn)}</div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${rate}%` }} />
                  </div>
                  <div className="stat-nums">
                    {rate}%({s.correct}/{s.total})
                  </div>
                </div>
              );
            })}
            {confusions.length > 0 && (
              <>
                <p className="stat-sub">取り違えの多いペア(聴き比べ練習の狙い目)</p>
                <ul className="confusion-list">
                  {confusions.map(([k, n]) => {
                    const [correct, answered] = k.split('>');
                    return (
                      <li key={k}>
                        <strong>{withSolfege(tokenRoman(correct), solfegeOn)}</strong> を{' '}
                        <strong>{withSolfege(tokenRoman(answered), solfegeOn)}</strong>{' '}
                        と答えた × {n}回
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}
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
