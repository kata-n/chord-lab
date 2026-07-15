import { useState } from 'react';
import { playChord } from '../audio.js';
import { useSolfege, withSolfege } from '../solfege.jsx';
import PianoKeyboard from './PianoKeyboard.jsx';

// コードのボタンを押すと音が鳴り、下の鍵盤に構成音が表示されるデモ
export default function ChordDemo({ chords, accidental = 'sharp', caption }) {
  const [active, setActive] = useState(null);
  const { on: solfegeOn } = useSolfege();

  return (
    <div className="chord-demo">
      <div className="chip-row">
        {chords.map((c, i) => (
          <button
            key={i}
            className={active === i ? 'chip chip-btn chip-on' : 'chip chip-btn'}
            onClick={() => {
              playChord(c.midi);
              setActive(i);
            }}
          >
            <div className="chip-name">{c.name}</div>
            {c.roman && <div className="chip-roman">{withSolfege(c.roman, solfegeOn)}</div>}
            {c.sub && <div className="chip-roman">{c.sub}</div>}
          </button>
        ))}
      </div>
      <PianoKeyboard
        highlights={active != null ? chords[active].midi : []}
        accidental={accidental}
      />
      {active != null && chords[active].noteNames && (
        <p className="demo-notes">
          構成音: <strong>{chords[active].noteNames.join(' - ')}</strong>
        </p>
      )}
      {caption && <p className="demo-caption">{caption}</p>}
    </div>
  );
}
