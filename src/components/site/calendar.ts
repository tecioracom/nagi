/* ============================================================================
 * 日付の計算。**日付ライブラリを使わない**ので、必要なぶんだけここに置く。
 *
 * ■ Date を使わない理由
 *   `new Date('2026-11-14')` は UTC 解釈、`new Date(2026, 10, 14)` は端末の
 *   タイムゾーン解釈になる。サーバー（UTC）とブラウザ（JST）で 1 日ずれると、
 *   泊数が 1 泊ぶん食い違い、**合計金額が SSR と CSR で変わる**。
 *   ここは整数演算だけで閉じる（Howard Hinnant の days_from_civil）。
 *
 * ■ 「今日」を持たない
 *   端末時計に依存する値をどこにも置かない。画面に出る日付はすべて
 *   各サイトの `_data.ts` が持つ固定値で、書き出した画面と一致させる。
 *
 * 8本のどのサイトからでも使う。**サイト固有の値はここに書かないこと。**
 * ==========================================================================*/

/** `YYYY-MM-DD` だけを受け取る。書式が違えば null。 */
export type CivilDate = { y: number; m: number; d: number };

export function parseDate(iso: string): CivilDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

export function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  if (m === 2) return isLeap(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

/** 1970-01-01 からの通算日。整数演算だけ。 */
export function toDays({ y, m, d }: CivilDate): number {
  const yy = y - (m <= 2 ? 1 : 0);
  const era = Math.floor((yy >= 0 ? yy : yy - 399) / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function fromDays(z: number): CivilDate {
  const zz = z + 719468;
  const era = Math.floor((zz >= 0 ? zz : zz - 146096) / 146097);
  const doe = zz - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: y + (m <= 2 ? 1 : 0), m, d };
}

export function addDays(iso: string, n: number): string {
  const c = parseDate(iso);
  if (!c) return iso;
  return formatIso(fromDays(toDays(c) + n));
}

/** 2つの日付の差（日数）。不正な入力は null。 */
export function diffDays(fromIso: string, toIso: string): number | null {
  const a = parseDate(fromIso);
  const b = parseDate(toIso);
  if (!a || !b) return null;
  return toDays(b) - toDays(a);
}

export function formatIso({ y, m, d }: CivilDate): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 0=日 … 6=土 */
export function dayOfWeek(iso: string): number | null {
  const c = parseDate(iso);
  if (!c) return null;
  const z = toDays(c);
  return ((z % 7) + 11) % 7;
}

export const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** `2026 / 11 / 14` — 書き出した画面の入力欄と同じ書式。 */
export function formatSlashed(iso: string): string {
  const c = parseDate(iso);
  if (!c) return iso;
  return `${c.y} / ${String(c.m).padStart(2, '0')} / ${String(c.d).padStart(2, '0')}`;
}

/** `2026.11.14` — 集計パネルの書式。 */
export function formatDotted(iso: string): string {
  const c = parseDate(iso);
  if (!c) return iso;
  return `${c.y}.${String(c.m).padStart(2, '0')}.${String(c.d).padStart(2, '0')}`;
}

/** `11/14` */
export function formatShort(iso: string): string {
  const c = parseDate(iso);
  if (!c) return iso;
  return `${c.m}/${c.d}`;
}

/** `2026年11月14日（土）` */
export function formatLongJa(iso: string): string {
  const c = parseDate(iso);
  const dow = dayOfWeek(iso);
  if (!c || dow === null) return iso;
  return `${c.y}年${c.m}月${c.d}日（${DOW_JA[dow]}）`;
}

/** `14（土）` — 週表の見出し。 */
export function formatDayCell(iso: string): string {
  const c = parseDate(iso);
  const dow = dayOfWeek(iso);
  if (!c || dow === null) return iso;
  return `${c.d}（${DOW_JA[dow]}）`;
}
