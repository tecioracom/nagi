/* ============================================================================
 * 8本のサイトで共有する見た目の定数。
 *
 * React を import しない素のモジュールにしてある。
 * `'use client'` を付けたファイルから定数を export すると、
 * サーバーコンポーネント側から使えなくなるため。
 *
 * 値はすべて CSS 変数（`.sample-<slug>` が定義する）で書く。
 * ここに固定色を書くと、8本が同じ見た目に寄る。
 * ==========================================================================*/

/** ページの中身の最大幅とガター。 */
export const SITE_SHELL = 'mx-auto w-full max-w-[1120px] px-5 md:px-8 lg:px-10';

/** 主ボタン（塗り）。押すと次の状態に進むもの。 */
export const BTN_PRIMARY =
  'inline-flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--field-radius,4px)] bg-[var(--green,var(--ink))] px-5 text-[15px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep,var(--ink))] sm:w-auto sm:min-w-[260px]';

/** 副ボタン（線）。戻る・やり直す。 */
export const BTN_SECONDARY =
  'inline-flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--field-radius,4px)] border border-[var(--line-strong)] bg-[var(--paper)] px-5 text-[15px] font-semibold text-[var(--ink)] transition duration-150 hover:border-[var(--ink)] sm:w-auto sm:min-w-[200px]';

/** 文中の弱いリンク。 */
export const LINK =
  'inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-[var(--ink)] underline underline-offset-4';

/** 本文。**行長は `em` で指定する（`ch` は和文で効かない）。** */
export const LEAD = 'max-w-[34em] text-[15px] leading-[1.9] text-[var(--sub)]';

/** 節の見出しの上の欧文ラベル。字間は正のまま（和文の見出しとは別物）。 */
export const OVERLINE =
  'text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--sub)]';

/** 表の枠。`site-scroll-x` と対で使う（overflow はその要素自身に付く）。 */
export const TABLE = 'w-full min-w-[640px] border-collapse text-left';
export const TH =
  'whitespace-nowrap border-b border-[var(--line)] bg-[var(--cream)] px-3 py-2 text-[12px] font-semibold text-[var(--sub)]';
export const TD =
  'whitespace-nowrap border-b border-[var(--line)] px-3 py-3 text-[13px] text-[var(--ink)]';

/** 状態の札。色だけで意味を伝えないよう、必ず文字を入れる。 */
export const TAG =
  'inline-flex items-center rounded-[3px] bg-[var(--soft)] px-2 py-[3px] text-[12px] font-semibold text-[var(--soft-ink)]';
export const TAG_QUIET =
  'inline-flex items-center rounded-[3px] border border-[var(--line-strong)] px-2 py-[3px] text-[12px] font-medium text-[var(--sub)]';
