import { useEffect, useRef, useState } from 'react';
import { playProgression } from '../audio.js';
import { useSolfege, withSolfege } from '../solfege.jsx';
import PianoKeyboard from './PianoKeyboard.jsx';

// コード進行の再生プレイヤー。コードのチップ表示+鍵盤+再生/停止ボタン。
export default function ProgressionPlayer({
  chords,
  accidental = 'sharp',
  beatSec = 1.0,
  showRoman = true,
  showKeyboard = true,
}) {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef(null);
  const { on: solfegeOn } = useSolfege();

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  // chords が変わったら(キー変更など)再生を止める
  useEffect(() => {
    if (stopRef.current) stopRef.current();
    setStep(-1);
    setPlaying(false);
  }, [chords]);

  const toggle = () => {
    if (playing) {
      if (stopRef.current) stopRef.current();
      return;
    }
    setPlaying(true);
    stopRef.current = playProgression(chords, {
      beatSec,
      onStep: (i) => setStep(i),
      onEnd: () => {
        setPlaying(false);
        setStep(-1);
        stopRef.current = null;
      },
    });
  };

  const current = step >= 0 ? chords[step] : null;

  return (
    <div className="prog-player">
      <div className="prog-row">
        <button className={playing ? 'btn btn-stop' : 'btn btn-play'} onClick={toggle}>
          {playing ? '■ 停止' : '▶ 再生'}
        </button>
        <div className="chip-row">
          {chords.map((c, i) => (
            <div key={i} className={i === step ? 'chip chip-on' : 'chip'}>
              <div className="chip-name">{c.name}</div>
              {showRoman && c.roman && (
                <div className="chip-roman">{withSolfege(c.roman, solfegeOn)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showKeyboard && (
        <PianoKeyboard highlights={current ? current.midi : []} accidental={accidental} />
      )}
    </div>
  );
}
