import { createContext, useContext, useState } from 'react';

// ドレミ併記(移動ド: キーのⅠ=ド)のON/OFFをアプリ全体で共有する

const SOLFEGE = {
  'Ⅰ': 'ド',
  'Ⅱ': 'レ',
  'Ⅲ': 'ミ',
  'Ⅳ': 'ファ',
  'Ⅴ': 'ソ',
  'Ⅵ': 'ラ',
  'Ⅶ': 'シ',
};

const STORAGE_KEY = 'chord-lab-solfege';

const Ctx = createContext({ on: false, toggle: () => {} });

export function SolfegeProvider({ children }) {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () =>
    setOn((v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v ? '0' : '1');
      } catch {
        /* 保存できなくても動作は継続 */
      }
      return !v;
    });
  return <Ctx.Provider value={{ on, toggle }}>{children}</Ctx.Provider>;
}

export function useSolfege() {
  return useContext(Ctx);
}

// ディグリー表記(Ⅰ, Ⅵm, ♭Ⅶ, Ⅱm7(♭5) など)にマッチ
const ROMAN_RE = /♭?[ⅠⅡⅢⅣⅤⅥⅦ](?:m7\(♭5\)|m\(♭5\)|mM7|M7|m7|sus4|aug|dim7|add9|m|7|6)?/g;

// 文字列中のディグリー表記に階名を付け足す: "Ⅳ→Ⅵm" → "Ⅳ(ファ)→Ⅵm(ラ)"
export function withSolfege(text, on) {
  if (!on || typeof text !== 'string') return text;
  return text.replace(ROMAN_RE, (tok) => {
    const flat = tok.startsWith('♭');
    const numeral = flat ? tok[1] : tok[0];
    const name = SOLFEGE[numeral];
    if (!name) return tok;
    return `${tok}(${flat ? name + '♭' : name})`;
  });
}
