/* ============================================================================
 * 面いっぱいに敷く、音の無い8秒ループ。いまは NAGI のヒーロー1か所だけ。
 *
 * ■ なぜ `<video>` を素で書くか
 *   `SitePhoto` と同じ理由。配信するのは**書き出し済みの2ファイル**
 *   （WebM/AV1 と MP4/H.264）で、寸法も尺も固定である。`<source>` を2本
 *   並べて**ブラウザに選ばせる**のがいちばん速く、検査も描画された
 *   属性をそのまま読める。作り方は `scripts/build-nagi-hero-video.mjs`。
 *
 * ■ ⚠ `type` に codecs まで書く（`video/webm` だけでは**壊れる**）
 *   WebM は読めるが AV1 は読めない実装（多くの Safari）が `video/webm` を
 *   「maybe」と答えて **webm を選んでから復号に失敗する**。資源選択は
 *   選んだあとに失敗しても次の `<source>` に落ちないので、ヒーローが
 *   ポスターのまま固まる。codecs 付きなら「空文字＝再生不可」と答えるので、
 *   その場で MP4 に落ちる。Chromium で `canPlayType` を実測して確かめた:
 *     'video/webm; codecs="av01.0.08M.08"' → probably
 *     'video/webm'                         → maybe（危険なほう）
 *
 * ■ ⚠ 動きを減らす設定では**再生しない**
 *   Figma の `NAGI / Motion & interaction guide` の指定。歯止めは2つ掛ける。
 *     1. `<source media="(prefers-reduced-motion: no-preference)">`
 *        資源選択の段階で候補が0本になり、**1バイトも取りに行かない**
 *        （Chromium で実測: webm も mp4 も要求が飛ばない）。
 *     2. `.site-video-motion { display: none }`（site.css）
 *        `media` 属性を無視する実装が仮にあっても、動くものが出ない。
 *   どちらの経路でも**静止画は出る**ようにするため、ポスターは
 *   `poster` 属性と器の `background-image` の**両方**に置いてある
 *   （同じ URL なので取得は1回）。1 だけだと器が空になり、2 だけだと
 *   最初のコマが描かれるまで透ける。
 *
 * ■ ポスターは動画の1コマ目そのもの
 *   別の絵にすると、動画が最初のコマを描いた瞬間に切り替わって見える。
 *   `<video poster>` は URL を1つしか取れないので AVIF との出し分けは
 *   できない。WebP 1枚（Safari 14 以降で確実に出る）。
 *
 * ■ ⚠ 器の position は **インラインスタイルで書く**（class では書かない）
 *   `SitePhoto` の注記と同じ罠。Tailwind は position を
 *   static → fixed → absolute → **relative** の順に出力するので、
 *   `class="relative"` の器に呼び出し側から `absolute inset-0` を渡すと
 *   **後から出る relative が勝ち、高さ0の箱**になる。中の動画も高さ0になり、
 *   HTML も取得も正常に見えるので**検査は全部緑のまま**通る。
 *   全面に敷くときは `fill` を渡すこと。
 *
 * ■ 装飾なので読み上げない
 *   すぐ隣に見出しと本文が出ている。`aria-hidden` を付け、`controls` は
 *   付けない（controls が無い `<video>` はフォーカスも取らない）。
 * ==========================================================================*/

/** 動きを止める設定のときに候補から外すための条件。 */
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/**
 * 配信している2本のコーデック文字列。`scripts/build-nagi-hero-video.mjs` の
 * 設定と対になっている。片方だけ変えると、その環境だけ静止画のまま止まる。
 *
 * ⚠ **寸法を変えると level が変わる**（1248×832 は level 5、1440×960 は
 *   level 8）。ここを直し忘れると、宣言より上位の水準のファイルを配ることに
 *   なる。検査 [13] が**配信ファイルの中身から組み立てた文字列**と突き合わせる。
 */
const WEBM_TYPE = 'video/webm; codecs="av01.0.08M.08"';
const MP4_TYPE = 'video/mp4; codecs="avc1.640028"';

type Props = {
  /** `public/samples/` からの拡張子なしの道。例: `nagi/sea` */
  src: string;
  /** 配信している動画の実寸（絶対配置なので版面には効かない）。 */
  width: number;
  height: number;
  /** 置き場所のクラス。面のクラス（`.nagi-sea` 等）もここに渡す。 */
  className?: string;
  /** 寄せ（`object-position` / `background-position`）。既定は中央。 */
  position?: string;
  /**
   * 親（`position: relative` の面）いっぱいに敷く。ヒーローの地に使う。
   * class ではなくインラインスタイルで効かせる（上の注記を参照）。
   */
  fill?: boolean;
};

export function SiteVideo({
  src,
  width,
  height,
  className = '',
  position,
  fill = false,
}: Props) {
  const base = `/samples/${src}`;
  const poster = `${base}-poster.webp`;
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        ...(fill
          ? { position: 'absolute' as const, inset: 0 }
          : { position: 'relative' as const }),
        backgroundImage: `url("${poster}")`,
        backgroundSize: 'cover',
        backgroundPosition: position ?? 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <video
        className="site-video-motion absolute inset-0 h-full w-full object-cover"
        style={position ? { objectPosition: position } : undefined}
        width={width}
        height={height}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source media={MOTION_OK} src={`${base}.webm`} type={WEBM_TYPE} />
        <source media={MOTION_OK} src={`${base}.mp4`} type={MP4_TYPE} />
      </video>
    </div>
  );
}
