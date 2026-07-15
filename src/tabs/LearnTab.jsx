import { useState } from 'react';
import {
  blackadderChord,
  buildChord,
  chordAt,
  degreeChord,
  DIATONIC,
  FUNCTIONS,
  IDOL_PATTERNS,
  MINOR_DIATONIC,
  MINOR_PROGRESSIONS,
  minorDegreeChord,
  minorProgressionChords,
  PROGRESSIONS,
  progressionChords,
  relativeMinor,
  romanName,
  transposeKey,
} from '../theory.js';
import ChordDemo from '../components/ChordDemo.jsx';
import ProgressionPlayer from '../components/ProgressionPlayer.jsx';
import { markLessonRead } from '../storage.js';
import { useSolfege, withSolfege } from '../solfege.jsx';

function Lesson1({ musicKey }) {
  const acc = musicKey.accidental;
  return (
    <div>
      <p>
        コード(和音)は、<strong>高さの違う音を同時に鳴らしたもの</strong>です。
        基本になるのは3つの音を重ねた「三和音(トライアド)」で、下から順に
        <strong>ルート(根音)・3度・5度</strong>と呼びます。
      </p>
      <p>
        いちばん大事な区別が<strong>メジャー</strong>と<strong>マイナー</strong>。
        違いは真ん中の「3度」の音がルートから
        <strong>半音4つ分(メジャー)</strong>か<strong>半音3つ分(マイナー)</strong>かだけです。
        たった半音1つの差で、響きが「明るい」と「暗い・切ない」に分かれます。
      </p>
      <p>下のボタンを押して、聴き比べてみましょう。鍵盤の光る場所にも注目してください。</p>
      <ChordDemo
        accidental={acc}
        chords={[
          { ...buildChord(musicKey.pc, 'maj', acc), sub: 'メジャー(明るい)' },
          { ...buildChord(musicKey.pc, 'min', acc), sub: 'マイナー(暗い)' },
        ]}
        caption="真ん中の音(3度)だけが半音ずれていることを鍵盤で確認してみましょう。"
      />
      <div className="callout">
        <strong>まとめ:</strong> メジャー = ルート + 4半音 + さらに3半音 /
        マイナー = ルート + 3半音 + さらに4半音。外側の音(完全5度)は同じです。
      </div>
    </div>
  );
}

function Lesson2({ musicKey }) {
  const acc = musicKey.accidental;
  const chords = DIATONIC.map((d) => degreeChord(musicKey, d.degree));
  return (
    <div>
      <p>
        キー(調)を決めると、そのキーのメジャースケール(ドレミファソラシ)の音だけを
        1つおきに3つ積んで、<strong>7つのコード</strong>が作れます。これが
        <strong>ダイアトニックコード</strong>。ポップスの大半は、ほぼこの7つだけでできています。
      </p>
      <p>
        コードをキーに依存しない形で呼ぶために、スケールの何番目の音がルートかを
        ローマ数字で表します(<strong>ディグリーネーム</strong>)。
        例えばキー{musicKey.name}なら Ⅰ = {chords[0].name}、Ⅴ = {chords[4].name} です。
        度数で覚えると、どのキーでも同じ知識が使い回せます。
      </p>
      <p>キー{musicKey.name}のダイアトニックコードを順番に鳴らしてみましょう。</p>
      <ChordDemo accidental={acc} chords={chords} />
      <div className="callout">
        <strong>覚え方:</strong> Ⅰ・Ⅳ・Ⅴがメジャー、Ⅱ・Ⅲ・Ⅵがマイナー、
        Ⅶだけ特殊(m♭5)。「メジャーは 1・4・5」とまず覚えればOK。
        画面上部でキーを切り替えると、同じ度数でもコード名が変わることが確認できます。
      </div>
    </div>
  );
}

function Lesson3({ musicKey }) {
  const acc = musicKey.accidental;
  const { on: solfegeOn } = useSolfege();
  const t = degreeChord(musicKey, 1);
  const s = degreeChord(musicKey, 4);
  const d = degreeChord(musicKey, 5);
  const cadence = [s, d, t].map((c) => ({ ...c }));
  return (
    <div>
      <p>
        ダイアトニックコードは、役割によって3つのグループに分けられます。これを
        <strong>コードの機能</strong>と呼びます。
      </p>
      <div className="func-cards">
        {Object.values(FUNCTIONS).map((f) => (
          <div key={f.short} className="func-card" style={{ borderColor: f.color }}>
            <div className="func-name" style={{ color: f.color }}>
              {f.name}({f.short})
            </div>
            <div className="func-desc">{f.desc}</div>
            <div className="func-degrees">
              {withSolfege(
                DIATONIC.filter((x) => x.func === f.short)
                  .map((x) => romanName(x.numeral, x.quality))
                  .join('・'),
                solfegeOn
              )}
            </div>
          </div>
        ))}
      </div>
      <p>
        コード進行とは、この<strong>「安定 → 動き → 緊張 → 解決」の物語</strong>を作ることです。
        特に「ドミナント(Ⅴ)→ トニック(Ⅰ)」の流れは<strong>解決</strong>と呼ばれ、
        音楽の推進力の源になっています。
      </p>
      <p>
        下の Ⅳ → Ⅴ → Ⅰ(サブドミナント → ドミナント → トニック)を再生して、
        最後に「帰ってきた」感じがするのを味わってください。
      </p>
      <ProgressionPlayer chords={cadence} accidental={acc} />
      <div className="callout">
        <strong>試してみよう:</strong> 上のチップを最後まで聴いたあと、Ⅴ({d.name}
        )だけを押して止めてみると、「宙ぶらりん」な感じがします。それがドミナントの緊張です。
      </div>
    </div>
  );
}

function Lesson4({ musicKey }) {
  const acc = musicKey.accidental;
  const { on: solfegeOn } = useSolfege();
  return (
    <div>
      <p>
        よく使われるコード進行には名前がついています。まずはこの
        <strong>定番進行</strong>を耳と度数で覚えるのが、コード進行学習の近道です。
        キーを変えても「進行の性格」は変わらないことも確かめてみましょう。
      </p>
      {PROGRESSIONS.map((p) => (
        <div key={p.id} className="prog-block">
          <h3>
            {p.name} <span className="prog-reading">{p.reading}</span>
          </h3>
          <p className="prog-roman-line">
            {withSolfege(
              progressionChords(p, musicKey)
                .map((c) => c.roman)
                .join(' → '),
              solfegeOn
            )}
          </p>
          <p>{p.desc}</p>
          <p className="prog-examples">使用例: {p.examples}</p>
          <ProgressionPlayer
            chords={progressionChords(p, musicKey)}
            accidental={acc}
            beatSec={p.degrees.length > 4 ? 0.85 : 1.0}
          />
        </div>
      ))}
    </div>
  );
}

function Lesson5({ musicKey }) {
  const acc = musicKey.accidental;
  const triad = buildChord(musicKey.pc, 'maj', acc);
  const seventhChords = [
    { ...buildChord(musicKey.pc, 'maj7', acc), sub: 'おしゃれ・浮遊感' },
    { ...buildChord((musicKey.pc + 9) % 12, 'min7', acc), sub: 'やわらかい・都会的' },
    { ...buildChord((musicKey.pc + 7) % 12, 'dom7', acc), sub: '強い緊張・ブルージー' },
  ];
  const twoFive = PROGRESSIONS.find((p) => p.id === 'twofive');
  return (
    <div>
      <p>
        三和音の上にもう1つ、<strong>7度の音</strong>を重ねたのがセブンスコード(四和音)。
        音が1つ増えるだけで、ぐっと大人っぽく、豊かな響きになります。
      </p>
      <p>代表的な3種類を聴き比べてみましょう。</p>
      <ChordDemo
        accidental={acc}
        chords={[{ ...triad, sub: '三和音(比較用)' }, ...seventhChords]}
        caption="M7(メジャーセブンス)、m7(マイナーセブンス)、7(ドミナントセブンス)は、それぞれ響きの性格が大きく違います。"
      />
      <p>
        セブンスの真価が出るのが、ジャズの基本進行<strong>ツーファイブワン</strong>です。
        Ⅱm7 → Ⅴ7 → ⅠM7 の流れを聴いてみましょう。
      </p>
      <ProgressionPlayer
        chords={progressionChords(twoFive, musicKey, { seventh: true })}
        accidental={acc}
      />
      <div className="callout">
        <strong>まとめ:</strong> M7 = メジャー + 長7度 / m7 = マイナー + 短7度 /
        7 = メジャー + 短7度。まずはこの3つを覚えれば十分です。
      </div>
    </div>
  );
}

function Lesson6({ musicKey }) {
  const acc = musicKey.accidental;
  const minor = relativeMinor(musicKey);
  const chords = MINOR_DIATONIC.map((d) => minorDegreeChord(minor, d.degree));
  const vm = minorDegreeChord(minor, 5);
  const v7 = minorDegreeChord(minor, 5, { seventh: true, harmonic: true });
  const im = minorDegreeChord(minor, 1);
  return (
    <div>
      <p>
        ここまでのメジャーキーに対して、暗く切ない響きの<strong>マイナーキー</strong>があります。
        実は新しい音は不要で、メジャースケールを<strong>6番目の音から</strong>始めるとマイナースケールになります。
        {musicKey.name}メジャーに対する {minor.name}(平行短調)は、
        <strong>同じ鍵盤・同じコード</strong>を使い、「家(トニック)」が {im.name} に変わるだけです。
      </p>
      <p>マイナーキーではダイアトニックコードの度数の数え方が変わります。{minor.name}キーで確認しましょう。</p>
      <ChordDemo accidental={acc} chords={chords} />
      <div className="callout">
        <strong>ポイント:</strong> Ⅰm・Ⅳm・Ⅴm がマイナー、♭Ⅲ・♭Ⅵ・♭Ⅶ がメジャー。
        「♭」付きの度数は、メジャーキーより半音低い位置にルートがあるという意味です。
      </div>
      <h3>ハーモニックマイナーと「強いⅤ」</h3>
      <p>
        ナチュラルマイナーのⅤm({vm.name})は、トニックへ戻る力が弱め。そこで第7音を半音上げた
        <strong>ハーモニックマイナー</strong>を使うと、Ⅴがメジャー化({v7.name})して
        「帰りたい!」という強い緊張が生まれます。聴き比べてみましょう。
      </p>
      <ProgressionPlayer
        chords={[{ ...vm, roman: 'Ⅴm(弱い)' }, { ...im }, { ...v7, roman: 'Ⅴ7(強い)' }, { ...im }]}
        accidental={acc}
      />
      <h3>マイナーキーの定番進行</h3>
      {MINOR_PROGRESSIONS.map((p) => (
        <div key={p.id} className="prog-block">
          <h3>
            {p.name} <span className="prog-reading">{p.reading}</span>
          </h3>
          <p>{p.desc}</p>
          <p className="prog-examples">使用例: {p.examples}</p>
          <ProgressionPlayer chords={minorProgressionChords(p, minor)} accidental={acc} />
        </div>
      ))}
    </div>
  );
}

function Lesson7({ musicKey }) {
  const acc = musicKey.accidental;
  const pc = musicKey.pc;
  const catalog = [
    { ...buildChord(pc, 'maj', acc), sub: '基準(メジャー)' },
    { ...buildChord(pc, 'sus4', acc), sub: '宙づりの緊張' },
    { ...buildChord(pc, 'sus2', acc), sub: '透明・浮遊感' },
    { ...buildChord(pc, 'add9', acc), sub: 'キラキラ・広がり' },
    { ...buildChord(pc, 'six', acc), sub: '軽やか・レトロ' },
    { ...buildChord(pc, 'aug', acc), sub: '不思議・不安' },
    { ...buildChord(pc, 'dim7', acc), sub: 'ミステリアス' },
    { ...buildChord(pc, 'mM7', acc), sub: '切なくドラマチック' },
  ];
  const sus = [
    { ...buildChord(pc, 'sus4', acc), roman: 'Ⅰsus4' },
    { ...buildChord(pc, 'maj', acc), roman: 'Ⅰ' },
  ];
  const passingDim = [
    { ...degreeChord(musicKey, 1), roman: 'Ⅰ' },
    { ...buildChord(pc + 1, 'dim7', acc), roman: '♯Ⅰdim7' },
    { ...degreeChord(musicKey, 2, { seventh: true }) },
    { ...degreeChord(musicKey, 5, { seventh: true }) },
    { ...degreeChord(musicKey, 1) },
  ];
  return (
    <div>
      <p>
        三和音とセブンス以外にも、曲に彩りを加えるコードがたくさんあります。まずは
        {musicKey.name}をルートに、代表的な種類を聴き比べてみましょう。
        それぞれの「キャラクター」を感じ取るのがコツです。
      </p>
      <ChordDemo accidental={acc} chords={catalog} />
      <h3>sus4は「解決」して使う</h3>
      <p>
        sus4は3度を4度に置き換えたコード。明暗が決まらない宙づりの響きで、
        <strong>メジャーに戻る瞬間の気持ちよさ</strong>のために使われることが多いです。
      </p>
      <ProgressionPlayer chords={sus} accidental={acc} />
      <h3>dim7は「通り道」に置く</h3>
      <p>
        ディミニッシュセブンス(dim7)は全部の音が短3度間隔の不思議なコード。
        コードとコードの間に挟んで、ベースを半音でなめらかにつなぐ
        <strong>パッシングディミニッシュ</strong>という使い方が定番です。
        Ⅰ → ♯Ⅰdim7 → Ⅱm7 とベースが半音ずつ上がるのを聴いてください。
      </p>
      <ProgressionPlayer chords={passingDim} accidental={acc} />
      <div className="callout">
        <strong>まとめ:</strong> 新しいコードは「構成音の暗記」より
        「キャラクターと使いどころ」で覚えるのが実戦的。気に入った響きから使ってみましょう。
      </div>
    </div>
  );
}

function Lesson8({ musicKey }) {
  const acc = musicKey.accidental;
  const pc = musicKey.pc;
  const maruSa = [
    { ...degreeChord(musicKey, 4, { seventh: true }) },
    { ...buildChord(pc + 4, 'dom7', acc), roman: 'Ⅲ7' },
    { ...degreeChord(musicKey, 6, { seventh: true }) },
    { ...buildChord(pc, 'dom7', acc), roman: 'Ⅰ7' },
  ];
  const ba = blackadderChord(pc + 7, acc);
  const normalCadence = [
    { ...degreeChord(musicKey, 4, { seventh: true }) },
    { ...degreeChord(musicKey, 5, { seventh: true }) },
    { ...degreeChord(musicKey, 1) },
  ];
  const baCadence = [
    { ...degreeChord(musicKey, 4, { seventh: true }) },
    { ...ba, roman: 'イキスギ(Ⅴベース)' },
    { ...degreeChord(musicKey, 1) },
  ];
  return (
    <div>
      <p>
        最終レッスンは、ダイアトニックの「外」に一歩踏み出すコードたち。
        うまく使うと、進行に強烈なフックが生まれます。
      </p>
      <h3>セカンダリードミナントと丸サ進行</h3>
      <p>
        Ⅴ7→Ⅰの「解決」の力を、Ⅰ以外のコードにも借りてくるのが
        <strong>セカンダリードミナント</strong>。たとえば Ⅵm7 の直前に、そのドミナントである
        <strong>Ⅲ7</strong>(ダイアトニックではⅢm7のはず)を置くと、強い引力が生まれます。
      </p>
      <p>
        これを含む有名ループが、椎名林檎「丸の内サディスティック」で知られる
        <strong>丸サ進行</strong>(Just the Two of Us進行)。ⅣM7 → Ⅲ7 → Ⅵm7 → Ⅰ7
        と回り続ける、おしゃれでジャジーな進行です(Ⅰ7も次のⅣへ向かうセカンダリードミナント)。
      </p>
      <ProgressionPlayer chords={maruSa} accidental={acc} beatSec={1.1} />
      <h3>ブラックアダーコード(イキスギコード)</h3>
      <p>
        ネット発の俗称で知られる飛び道具コード。作り方は
        <strong>「ベース音の全音(2半音)上にオーギュメントを乗せる」</strong>だけ。
        たとえばベース{ba.noteNames[0]}なら {ba.name} です。
        実体は3度と5度を省いたドミナント7th(9, ♯11)で、クラシックでは「フランス風増6度」
        と呼ばれてきた響き。強烈な浮遊感となめらかな解決を両立します。
      </p>
      <ChordDemo
        accidental={acc}
        chords={[
          { ...degreeChord(musicKey, 5, { seventh: true }), sub: 'ふつうのⅤ7' },
          { ...ba, sub: 'イキスギ化したⅤ' },
        ]}
        caption="どちらもトニックへ解決するドミナントの仲間。イキスギコードのほうが謎めいた浮遊感があります。"
      />
      <p>実際の進行で聴き比べましょう。まずは普通のⅣ→Ⅴ7→Ⅰ、次にⅤ7をイキスギコードに差し替えた版です。</p>
      <ProgressionPlayer chords={normalCadence} accidental={acc} />
      <ProgressionPlayer chords={baCadence} accidental={acc} />
      <div className="callout">
        <strong>豆知識:</strong> オーギュメントは3つの音が等間隔なので、同じイキスギコードは
        3通りの名前で書けます({ba.name} = 構成音が同じ別表記あり)。
        「どこへでも行けてしまう」自由さが、イキスギという俗称の由来です。
      </div>
    </div>
  );
}

function Lesson9({ musicKey }) {
  const acc = musicKey.accidental;
  return (
    <div>
      <p>
        アイドル曲やJ-POPは「イントロ → Aメロ → Bメロ → サビ」という構成の中で、
        <strong>セクションごとの「型」</strong>がよく使われます。型を知っていると、曲を聴いたときに
        「いまBメロの階段だ!」「サビはⅣ始まりだ!」と聴き取れるようになります。
      </p>
      <p>
        サビの二大定番、<strong>王道進行(4536)</strong>と<strong>小室進行(6451)</strong>は
        Lesson 4で学びました。ここではそれ以外の頻出パターンを聴いていきます。
      </p>
      {IDOL_PATTERNS.map((p) => (
        <div key={p.id} className="prog-block">
          <h3>
            {p.name} <span className="prog-reading">{p.reading}</span>
          </h3>
          <p className="prog-examples">よく出る場所: {p.section}</p>
          <p>{p.desc}</p>
          <ProgressionPlayer chords={p.build(musicKey)} accidental={acc} />
        </div>
      ))}
      <div className="callout">
        <strong>練習:</strong> 聴くタブの「アイドル進行あて」で、ここのパターンを
        ランダムなキーで聴き当てる練習ができます。キーが変わっても型は同じ、を体で覚えましょう。
      </div>
    </div>
  );
}

function Lesson10({ musicKey }) {
  const acc = musicKey.accidental;
  const iv = degreeChord(musicKey, 4);
  const ivm = chordAt(musicKey, 5, 'min', 'Ⅳm');
  const cry = [degreeChord(musicKey, 4), ivm, degreeChord(musicKey, 1)];
  const epic = [
    chordAt(musicKey, 8, 'maj', '♭Ⅵ'),
    chordAt(musicKey, 10, 'maj', '♭Ⅶ'),
    degreeChord(musicKey, 1),
  ];
  const rock = [
    degreeChord(musicKey, 1),
    chordAt(musicKey, 10, 'maj', '♭Ⅶ'),
    degreeChord(musicKey, 4),
    degreeChord(musicKey, 1),
  ];
  return (
    <div>
      <p>
        明るい曲の中で、一瞬だけ胸がぎゅっとなる箇所——あの正体はたいてい
        <strong>借用和音</strong>です。同じルートのマイナーキー(同主短調。
        {musicKey.name}メジャーなら{musicKey.name}マイナー)からコードを一時的に借りてくるので、
        メジャーの世界にマイナーの陰りが差し込みます。
      </p>
      <h3>Ⅳm — 「泣き」の代名詞</h3>
      <p>
        いちばん頻出なのが<strong>Ⅳをマイナーにした Ⅳm</strong>(サブドミナントマイナー)。
        まずⅣと聴き比べて、中の音が半音下がる瞬間の切なさを確認しましょう。
      </p>
      <ChordDemo
        accidental={acc}
        chords={[
          { ...iv, sub: 'ふつうのⅣ' },
          { ...ivm, sub: '泣きのⅣm' },
        ]}
      />
      <p>実戦では Ⅳ → Ⅳm → Ⅰ の形で「明るい → 切ない → 帰ってくる」と流れるのが定番です。</p>
      <ProgressionPlayer chords={cry} accidental={acc} />
      <h3>♭Ⅵ → ♭Ⅶ → Ⅰ — エモい持ち上げ</h3>
      <p>
        マイナーキーから♭Ⅵと♭Ⅶを借りて、半音ずつ持ち上がるようにⅠへ着地する形。
        ゲームクリアのファンファーレや、アニソン・アイドル曲のラストの「勝利感」でおなじみです。
      </p>
      <ProgressionPlayer chords={epic} accidental={acc} />
      <h3>Ⅰ → ♭Ⅶ → Ⅳ — ロックな抜け感</h3>
      <p>♭Ⅶだけ借りると、力の抜けたロックっぽい爽快感になります。クールな曲調のアイドル曲でも頻出。</p>
      <ProgressionPlayer chords={rock} accidental={acc} />
      <div className="callout">
        <strong>聴き取りのコツ:</strong> 「メジャーの曲なのに急に切ない/影がある」と感じたら
        借用和音を疑いましょう。ディクテーションの「むずかしい」レベルで、Ⅳm・♭Ⅵ・♭Ⅶの
        聴き取り練習ができます。
      </div>
    </div>
  );
}

function Lesson11({ musicKey }) {
  const acc = musicKey.accidental;
  const oudou = PROGRESSIONS.find((p) => p.id === 'oudou');
  const upHalf = transposeKey(musicKey, 1);
  const upWhole = transposeKey(musicKey, 2);
  const half = [...progressionChords(oudou, musicKey), ...progressionChords(oudou, upHalf)];
  const whole = [...progressionChords(oudou, musicKey), ...progressionChords(oudou, upWhole)];
  return (
    <div>
      <p>
        アイドル曲のクライマックス、ラストのサビで急にもう一段盛り上がる——あれが
        <strong>転調</strong>(ラスサビ転調)です。いちばん多いのは
        <strong>半音上げ</strong>と<strong>全音上げ</strong>。進行(度数)はそのままで、
        土台のキーだけが持ち上がります。
      </p>
      <p>
        王道進行(Ⅳ→Ⅴ→Ⅲm→Ⅵm)を2回演奏します。1周目はキー{musicKey.name}
        、2周目は半音上の{upHalf.name}。5つめのコードで「フワッと浮く」感じに注目してください。
      </p>
      <ProgressionPlayer chords={half} accidental={acc} beatSec={0.85} />
      <p>こちらは全音(半音2つ分)上げ。より突き抜けた明るさになります(2周目はキー{upWhole.name})。</p>
      <ProgressionPlayer chords={whole} accidental={acc} beatSec={0.85} />
      <div className="callout">
        <strong>聴き取りのコツ:</strong> 転調しても<strong>度数の並びは変わりません</strong>。
        「コード名」ではなく「Ⅳ→Ⅴ→Ⅲm→Ⅵm」という型で聴けていれば、転調後も迷子になりません。
        これこそ度数(ディグリー)で学ぶ最大のご利益です。
      </div>
    </div>
  );
}

export const LESSONS = [
  { id: 'basics', no: 1, title: 'コードってなに? — メジャーとマイナー', comp: Lesson1 },
  { id: 'diatonic', no: 2, title: 'ダイアトニックコードと度数(ディグリー)', comp: Lesson2 },
  { id: 'functions', no: 3, title: 'コードの機能 — T・S・D', comp: Lesson3 },
  { id: 'progressions', no: 4, title: '定番コード進行を聴いて覚える', comp: Lesson4 },
  { id: 'sevenths', no: 5, title: 'セブンスコード入門', comp: Lesson5 },
  { id: 'minor', no: 6, title: 'マイナーキー入門 — 平行短調と定番進行', comp: Lesson6 },
  { id: 'colors', no: 7, title: 'コードの引き出しを増やす — sus4・add9・dim7など', comp: Lesson7 },
  {
    id: 'advanced',
    no: 8,
    title: '発展編 — 丸サ進行とブラックアダーコード',
    comp: Lesson8,
  },
  { id: 'idol', no: 9, title: 'アイドル曲の定番パターン — Bメロ・サビ前・サビ頭', comp: Lesson9 },
  { id: 'cry', no: 10, title: '泣きのコード — 借用和音(Ⅳm・♭Ⅵ・♭Ⅶ)', comp: Lesson10 },
  { id: 'modulation', no: 11, title: '転調を体感する — ラスサビ半音上げ', comp: Lesson11 },
];

export default function LearnTab({ musicKey, lessonsRead, onRead }) {
  const [openId, setOpenId] = useState(null);
  const lesson = LESSONS.find((l) => l.id === openId);

  const open = (l) => {
    setOpenId(l.id);
    onRead(l.id);
    markLessonRead(l.id);
    window.scrollTo({ top: 0 });
  };

  if (lesson) {
    const Comp = lesson.comp;
    const idx = LESSONS.findIndex((l) => l.id === lesson.id);
    const prev = LESSONS[idx - 1];
    const next = LESSONS[idx + 1];
    return (
      <div className="lesson-view">
        <button className="btn btn-ghost" onClick={() => setOpenId(null)}>
          ← レッスン一覧へ
        </button>
        <h2>
          Lesson {lesson.no}: {lesson.title}
        </h2>
        <Comp musicKey={musicKey} />
        <div className="lesson-nav">
          {prev ? (
            <button className="btn btn-ghost" onClick={() => open(prev)}>
              ← Lesson {prev.no}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button className="btn btn-primary lesson-nav-next" onClick={() => open(next)}>
              次へ: Lesson {next.no} {next.title} →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setOpenId(null)}>
              🎉 全レッスン完了!一覧へ戻る
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="tab-intro">
        上から順に読むと、コード進行の基礎が一通り身につきます。
        例はすべて音を鳴らして確かめられます(現在のキー: <strong>{musicKey.name}メジャー</strong>)。
      </p>
      <div className="lesson-list">
        {LESSONS.map((l) => (
          <button key={l.id} className="lesson-card" onClick={() => open(l)}>
            <span className="lesson-no">Lesson {l.no}</span>
            <span className="lesson-title">{l.title}</span>
            {lessonsRead[l.id] && <span className="lesson-done">✓ 読了</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
