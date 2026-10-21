'use client';

import { useId, useState } from 'react';
import { TABLE, TAG, TD, TH } from '@/components/site/styles';
import { signedYen, yen } from '@/components/site/format';
import {
  addDays,
  formatDayCell,
  parseDate,
} from '@/components/site/calendar';
import {
  ROOMS,
  ROOM_TYPES,
  TODAY,
  TOTAL_ROOMS,
  cellState,
  nightlyRate,
  roomType,
  sellableCount,
  type RoomTypeId,
} from '../../_data';

/* ============================================================================
 * 空室・料金。
 *
 * ■ 週を動かせる
 *   矢印で前後の週へ。客室カレンダーも販売可能数も、同じ台帳から導くので
 *   どの週でも辻褄が合う（11/19–20 の 203 号室は設備点検で販売停止）。
 *
 * ■ 料金の変更は「その場で効いて、保存されない」
 *   編集に切り替えると単価が入力欄になる。書き換えると、上の帯に
 *   **変更した件数と差額**が出る。フロントが実際に見たいのはこの2つ。
 *   保存はしない。離れれば消える、と画面に書く。
 *
 * ■ 空室は色だけで伝えない
 *   「空室」「停止」「宿泊者名」を必ず文字で書く。面の濃さは補助。
 * ==========================================================================*/

/** `2026年11月14日 — 20日` / 月をまたぐときは `2026年11月28日 — 12月4日`。 */
function weekLabel(startIso: string, endIso: string): string {
  const a = parseDate(startIso);
  const b = parseDate(endIso);
  if (!a || !b) return `${startIso} — ${endIso}`;
  const head = `${a.y}年${a.m}月${a.d}日`;
  const tail = a.m === b.m && a.y === b.y ? `${b.d}日` : `${b.m}月${b.d}日`;
  return `${head} — ${tail}`;
}

export function InventoryBoard() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<'all' | RoomTypeId>('all');
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const start = addDays(TODAY, offset * 7);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = week[6];

  const rateOf = (type: RoomTypeId, iso: string) =>
    overrides[`${type}:${iso}`] ?? nightlyRate(type, iso);

  const changed = Object.entries(overrides).filter(([key, value]) => {
    const [type, iso] = key.split(':');
    return value !== nightlyRate(type as RoomTypeId, iso);
  });
  const diffTotal = changed.reduce((sum, [key, value]) => {
    const [type, iso] = key.split(':');
    return sum + (value - nightlyRate(type as RoomTypeId, iso));
  }, 0);

  const rows = ROOMS.filter((r) => filter === 'all' || r.type === filter);
  const types = ROOM_TYPES.filter((t) => filter === 'all' || t.id === filter);

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffset((v) => v - 1)}
            aria-label="前の週"
            className="inline-flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] text-[16px] text-[var(--ink)] hover:border-[var(--ink)]"
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>
          <p
            aria-live="polite"
            className="min-w-0 text-center text-[17px] font-bold tabular-nums text-[var(--ink)] sm:min-w-[230px] sm:text-[19px]"
          >
            {weekLabel(start, end)}
          </p>
          <button
            type="button"
            onClick={() => setOffset((v) => v + 1)}
            aria-label="次の週"
            className="inline-flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] text-[16px] text-[var(--ink)] hover:border-[var(--ink)]"
          >
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>

        <p className="text-[12px] tabular-nums text-[var(--sub)]">
          {ROOM_TYPES.length}タイプ / 全{TOTAL_ROOMS}室
        </p>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <label htmlFor={id('filter')} className="text-[12px] text-[var(--sub)]">
            客室タイプ
          </label>
          <select
            id={id('filter')}
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | RoomTypeId)}
            className="min-h-[44px] border border-[var(--line-strong)] bg-[var(--paper)] px-3 text-[13px] text-[var(--ink)] focus:ring-0"
          >
            <option value="all">すべて</option>
            {ROOM_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-pressed={editing}
            className={
              editing
                ? 'inline-flex min-h-[44px] items-center gap-3 border-2 border-[var(--green)] bg-[var(--paper)] px-4 text-[13px] font-bold text-[var(--ink)]'
                : 'inline-flex min-h-[44px] items-center gap-3 bg-[var(--green)] px-4 text-[13px] font-semibold text-[var(--cream)] hover:bg-[var(--green-deep)]'
            }
          >
            {editing ? '料金の変更をやめる' : '料金・販売を変更'}
            <span aria-hidden="true">{editing ? '−' : '↗'}</span>
          </button>
        </div>
      </div>

      {changed.length > 0 && (
        <p className="mt-4 border border-[var(--green)] bg-[var(--soft)] px-4 py-3 text-[13px] font-bold text-[var(--soft-ink)]">
          未保存の料金変更が{changed.length}件あります / 1泊あたりの合計差額{' '}
          {signedYen(diffTotal)}
          <span className="ms-3 font-normal">
            この画面を離れると元に戻ります。保存はされません。
          </span>
        </p>
      )}

      {/* 客室カレンダー */}
      <section className="mt-6 min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[17px] font-bold text-[var(--ink)]">客室カレンダー</h2>
        <p className="mt-1 text-[12px] text-[var(--sub)]">
          名前：予約あり / 空室：販売可 / 停止：販売停止
        </p>
        <div className="site-scroll-x mt-4">
          <table className={`${TABLE} min-w-[820px]`}>
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  客室
                </th>
                {week.map((iso) => (
                  <th key={iso} scope="col" className={`${TH} tabular-nums`}>
                    {formatDayCell(iso)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.no}>
                  <th scope="row" className={`${TD} font-medium`}>
                    {r.no} / {roomType(r.type).name}
                  </th>
                  {week.map((iso) => {
                    const state = cellState(r.no, iso);
                    if (state.kind === 'booked') {
                      return (
                        <td key={iso} className={`${TD} bg-[var(--soft)]`}>
                          {state.reservation.guest.split(/[\s　]/)[0]}
                        </td>
                      );
                    }
                    if (state.kind === 'stopped') {
                      return (
                        <td key={iso} className={`${TD} bg-[var(--cream)]`}>
                          停止
                        </td>
                      );
                    }
                    return (
                      <td key={iso} className={`${TD} text-[var(--sub)]`}>
                        空室
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* タイプ別の料金・空室数 */}
      <section className="mt-6 min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5">
        <h2 className="text-[17px] font-bold text-[var(--ink)]">
          タイプ別の販売料金・空室数
        </h2>
        <p className="mt-1 text-[12px] text-[var(--sub)]">
          大人2名 / 1泊 / 朝夕食付き / 税・サービス料込み
        </p>
        <div className="site-scroll-x mt-4">
          <table className={`${TABLE} min-w-[820px]`}>
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  <span className="sr-only">項目</span>
                </th>
                {week.map((iso) => (
                  <th key={iso} scope="col" className={`${TH} tabular-nums`}>
                    {formatDayCell(iso)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <Rows
                  key={t.id}
                  type={t.id}
                  name={t.name}
                  week={week}
                  editing={editing}
                  rateOf={rateOf}
                  onRate={(iso, value) => {
                    setOverrides((prev) => ({ ...prev, [`${t.id}:${iso}`]: value }));
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
        {editing && (
          <p className="mt-3 text-[12px] text-[var(--sub)]">
            単価を書き換えると、上の帯に変更件数と差額が出ます。
          </p>
        )}
      </section>
    </>
  );
}

function Rows({
  type,
  name,
  week,
  editing,
  rateOf,
  onRate,
}: {
  type: RoomTypeId;
  name: string;
  week: readonly string[];
  editing: boolean;
  rateOf: (type: RoomTypeId, iso: string) => number;
  onRate: (iso: string, value: number) => void;
}) {
  return (
    <>
      <tr>
        <th scope="row" className={`${TD} font-medium`}>
          {name}
        </th>
        {week.map((iso) => {
          const value = rateOf(type, iso);
          const base = nightlyRate(type, iso);
          return (
            <td key={iso} className={`${TD} tabular-nums`}>
              {editing ? (
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">¥</span>
                  <input
                    type="number"
                    step={1000}
                    min={0}
                    value={value}
                    aria-label={`${name} ${iso} の単価`}
                    onChange={(e) => onRate(iso, Number(e.target.value))}
                    className="w-[92px] border border-[var(--line-strong)] bg-[var(--paper)] px-2 py-1 text-[13px] tabular-nums text-[var(--ink)] focus:ring-0"
                  />
                </span>
              ) : (
                yen(value)
              )}
              {value !== base && !editing && (
                <span className="ms-2 inline-block">
                  <span className={TAG}>変更</span>
                </span>
              )}
            </td>
          );
        })}
      </tr>
      <tr>
        <th scope="row" className={`${TD} text-[var(--sub)]`}>
          販売可能数
        </th>
        {week.map((iso) => (
          <td key={iso} className={`${TD} tabular-nums text-[var(--sub)]`}>
            {sellableCount(type, iso)}室
          </td>
        ))}
      </tr>
    </>
  );
}
