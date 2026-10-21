/* ============================================================================
 * 8本のサイトの写真を1か所から出す部品。
 *
 * ■ なぜ `<picture>` を素で書くか（`next/image` を使わない）
 *   8本の写真は**書き出し済みの静止画**で、寸法も枚数も固定である。
 *   `next/image` の最適化 API を挟むと、配信のたびに変換が走るうえ、
 *   AVIF と WebP の出し分けがランタイムの判定になる。ここは
 *   `<source type="image/avif">` で**ブラウザに選ばせる**ほうが速く、
 *   検査も「描画された `<img>` の loading 属性」を素直に読める。
 *
 * ■ 位置指定は絶対配置にする
 *   置き場所の高さの決まり方が3通りある:
 *     `aspect-[4/3]`（比で決まる）/ `min-h-[320px]`（下限で決まる）/
 *     グリッドの `items-stretch`（兄弟で決まる）。
 *   `h-full` は親の高さが auto のとき解決できず、`min-h` の面で画像が
 *   潰れる。`relative` な器の中に `absolute inset-0` で置けば、
 *   **どの決まり方でも同じように埋まる**。
 *
 * ■ ⚠ 器の position は **インラインスタイルで書く**（class では書かない）
 *   最初は器を `relative` の class で書き、全面に敷く場所では呼び出し側から
 *   `className="absolute inset-0"` を渡していた。**これは無言で壊れる。**
 *   Tailwind は position のユーティリティを static → fixed → absolute →
 *   relative → sticky の順に出力するので、`class="relative absolute"` と
 *   両方付いたときに勝つのは **後から出る `relative`** である。
 *   属性に書いた順は関係ない。結果、NAGI のヒーロー写真は
 *   `position: relative` の**高さ0の箱**になり、画像が 1440×0 で
 *   描かれていた（ブラウザで実測して気づいた。HTML には `<img>` が
 *   あり、ファイルも取得されていたので、検査はすべて緑だった）。
 *   インラインスタイルは class に必ず勝つので、この衝突が起きない。
 *   全面に敷きたいときは `fill` を渡すこと。
 *
 * ■ 地の色（グラデーション）は消さない
 *   `className` にはこれまでどおり `.nagi-room-1` などの面のクラスを渡す。
 *   写真が届くまでの間と、読み込みに失敗したときに、その面の色が残る。
 *   **写真が乗っても版面の明度が変わらない**ように選んである。
 *
 * ■ alt は既定で空
 *   どの写真にも、すぐ隣に名前（客室名・品名・節の見出し）が出ている。
 *   同じことを読み上げさせない。情報を持つ写真だけ `alt` を渡す。
 *
 * ■ 先読みは1ページ1枚まで
 *   `eager` を渡した1枚だけが `loading="eager"` + `fetchPriority="high"`。
 *   残りは `loading="lazy"`。折りたたみの下を先読みすると、見えていない
 *   画像が初期表示の帯域を食う。ガードレール検査 [12] が配信 HTML を見ている。
 * ==========================================================================*/

type Props = {
  /** `public/samples/` からの拡張子なしの道。例: `nagi/sea` */
  src: string;
  /** 配信している画像の実寸（CLS 対策。絶対配置なので版面には効かない）。 */
  width: number;
  height: number;
  /** 置き場所のクラス。面のクラス（`.nagi-room-1` 等）もここに渡す。 */
  className?: string;
  /** 情報を持つ写真だけ渡す。既定は空＝装飾。 */
  alt?: string;
  /** 折りたたみの上の1枚だけ true。**1ページに1枚まで。** */
  eager?: boolean;
  /** 画像の寄せ（`object-position`）。既定は中央。 */
  position?: string;
  /**
   * 親（`position: relative` の面）いっぱいに敷く。ヒーローの地に使う。
   * class ではなくインラインスタイルで効かせる（上の注記を参照）。
   */
  fill?: boolean;
};

export function SitePhoto({
  src,
  width,
  height,
  className = '',
  alt = '',
  eager = false,
  position,
  fill = false,
}: Props) {
  const base = `/samples/${src}`;
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={
        fill
          ? { position: 'absolute', inset: 0 }
          : { position: 'relative' }
      }
    >
      <picture>
        <source srcSet={`${base}.avif`} type="image/avif" />
        <img
          src={`${base}.webp`}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          fetchPriority={eager ? 'high' : undefined}
          className="absolute inset-0 h-full w-full object-cover"
          style={position ? { objectPosition: position } : undefined}
        />
      </picture>
    </div>
  );
}
