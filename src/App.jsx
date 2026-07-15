import { useState } from 'react';
import { KEYS } from './theory.js';
import { loadProgress } from './storage.js';
import { useSolfege } from './solfege.jsx';
import LearnTab from './tabs/LearnTab.jsx';
import EarTab from './tabs/EarTab.jsx';
import QuizTab from './tabs/QuizTab.jsx';
import StatsTab from './tabs/StatsTab.jsx';

const TABS = [
  { id: 'learn', label: '📖 学ぶ' },
  { id: 'ear', label: '👂 聴く' },
  { id: 'quiz', label: '✏️ クイズ' },
  { id: 'stats', label: '📊 記録' },
];

export default function App() {
  const [tab, setTab] = useState('learn');
  const [keyIdx, setKeyIdx] = useState(0);
  const [lessonsRead, setLessonsRead] = useState(() => loadProgress().lessonsRead);
  const musicKey = KEYS[keyIdx];
  const solfege = useSolfege();

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">🎹 コード進行ラボ</h1>
        <div className="header-controls">
          <button
            className={solfege.on ? 'cat-btn cat-on' : 'cat-btn'}
            onClick={solfege.toggle}
            title="度数にドレミ(移動ド: キーのⅠ=ド)を併記します"
          >
            ドレミ併記 {solfege.on ? 'ON' : 'OFF'}
          </button>
          {tab === 'learn' && (
            <label className="key-select">
              キー:
              <select value={keyIdx} onChange={(e) => setKeyIdx(Number(e.target.value))}>
                {KEYS.map((k, i) => (
                  <option key={k.name} value={i}>
                    {k.name} メジャー
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab tab-on' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'learn' && (
          <LearnTab
            musicKey={musicKey}
            lessonsRead={lessonsRead}
            onRead={(id) => setLessonsRead((p) => ({ ...p, [id]: true }))}
          />
        )}
        {tab === 'ear' && <EarTab />}
        {tab === 'quiz' && <QuizTab />}
        {tab === 'stats' && <StatsTab />}
      </main>

      <footer className="footer">音が鳴ります。音量にご注意ください 🎵</footer>
    </div>
  );
}
