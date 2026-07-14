import { playNote } from '../audio.js';
import { noteName } from '../theory.js';

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];

// SVG のピアノ鍵盤。highlights(MIDIノート番号の配列)の鍵を光らせる。
// クリックで単音が鳴る。
export default function PianoKeyboard({
  from = 48,
  to = 83,
  highlights = [],
  accidental = 'sharp',
}) {
  const W = 26;
  const H = 108;
  const BW = 15;
  const BH = 66;

  const keys = [];
  for (let m = from; m <= to; m++) keys.push(m);
  const whites = keys.filter((m) => WHITE_PCS.includes(m % 12));
  const blacks = keys.filter((m) => !WHITE_PCS.includes(m % 12));

  const whiteX = new Map();
  whites.forEach((m, i) => whiteX.set(m, i * W));

  const hl = new Set(highlights);
  const width = whites.length * W;

  return (
    <div className="piano-wrap">
      <svg
        className="piano"
        viewBox={`0 0 ${width} ${H}`}
        style={{ minWidth: Math.max(width * 0.7, 420) }}
        role="img"
        aria-label="ピアノ鍵盤"
      >
        {whites.map((m) => (
          <g key={m}>
            <rect
              x={whiteX.get(m)}
              y={0}
              width={W}
              height={H}
              rx={3}
              className={hl.has(m) ? 'key-white key-on' : 'key-white'}
              onClick={() => playNote(m)}
            />
            {hl.has(m) && (
              <text
                x={whiteX.get(m) + W / 2}
                y={H - 8}
                textAnchor="middle"
                className="key-label"
              >
                {noteName(m % 12, accidental)}
              </text>
            )}
            {m % 12 === 0 && !hl.has(m) && (
              <text
                x={whiteX.get(m) + W / 2}
                y={H - 8}
                textAnchor="middle"
                className="key-label key-label-c"
              >
                C{Math.floor(m / 12) - 1}
              </text>
            )}
          </g>
        ))}
        {blacks.map((m) => {
          const px = whiteX.get(m - 1);
          if (px === undefined) return null;
          const x = px + W - BW / 2;
          return (
            <g key={m}>
              <rect
                x={x}
                y={0}
                width={BW}
                height={BH}
                rx={2}
                className={hl.has(m) ? 'key-black key-on-black' : 'key-black'}
                onClick={() => playNote(m)}
              />
              {hl.has(m) && (
                <text
                  x={x + BW / 2}
                  y={BH - 6}
                  textAnchor="middle"
                  className="key-label key-label-onblack"
                >
                  {noteName(m % 12, accidental)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
