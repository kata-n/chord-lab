// 学習進捗の localStorage 保存

const KEY = 'chord-lab-progress-v1';

const EMPTY = { quiz: {}, lessonsRead: {}, streak: { current: 0, best: 0 } };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const p = JSON.parse(raw);
    return {
      quiz: p.quiz || {},
      lessonsRead: p.lessonsRead || {},
      streak: p.streak || { current: 0, best: 0 },
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

function save(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function recordAnswer(category, correct) {
  const p = loadProgress();
  if (!p.quiz[category]) p.quiz[category] = { correct: 0, total: 0 };
  p.quiz[category].total += 1;
  if (correct) {
    p.quiz[category].correct += 1;
    p.streak.current += 1;
    p.streak.best = Math.max(p.streak.best, p.streak.current);
  } else {
    p.streak.current = 0;
  }
  save(p);
  return p;
}

export function markLessonRead(id) {
  const p = loadProgress();
  p.lessonsRead[id] = true;
  save(p);
  return p;
}

export function resetProgress() {
  localStorage.removeItem(KEY);
  return structuredClone(EMPTY);
}
