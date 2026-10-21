/* ============================================================================
 * 表示用の書式。純粋関数だけ。Intl に頼らない（環境差で表示がぶれる）。
 * ==========================================================================*/

/** 3桁区切り。 */
export function groupDigits(value: number): string {
  const sign = value < 0 ? '-' : '';
  return sign + String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** `¥88,000` */
export function yen(value: number): string {
  return `¥${groupDigits(value)}`;
}

/**
 * 差額。**符号を必ず付ける**（`−¥24,000` / `+¥24,000`）。
 * マイナス記号は U+2212（全角の負号）。ハイフンだと和文の中で
 * 「¥24,000 との区切り線」に見える。
 */
export function signedYen(value: number): string {
  if (value === 0) return '±¥0';
  const mark = value < 0 ? '−' : '+';
  return `${mark}¥${groupDigits(Math.abs(value))}`;
}

/** `75%` — 小数を作らない（室数から出すので必ず割り切れる想定）。 */
export function percent(part: number, whole: number): string {
  if (whole <= 0) return '0%';
  return `${Math.round((part / whole) * 100)}%`;
}
