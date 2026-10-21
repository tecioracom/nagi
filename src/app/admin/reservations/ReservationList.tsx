'use client';

import { useId, useMemo, useState } from 'react';
import { TextField } from '@/components/site/fields';
import { TABLE, TAG, TD, TH } from '@/components/site/styles';
import { yen } from '@/components/site/format';
import { formatLongJa, formatShort } from '@/components/site/calendar';
import {
  RESERVATIONS,
  TODAY,
  occupiesOn,
  reservationTotal,
  roomType,
  typeOfRoom,
  type Reservation,
} from '../../_data';

/* ============================================================================
 * 予約一覧。**検索も絞り込みも本当に動く。**
 *
 * ■ 絞り込みの件数を、絞り込む前に出す
 *   「すべて 6 / 本日到着 4 / 到着待ち 3 / 未精算 4」は、押す前に
 *   **押したら何件になるか**を出している。押してから 0 件だった、を作らない。
 *   件数は、宿泊日と検索語で絞ったあとの集合から数える。
 *
 * ■ 一致しなかったときに、何をすれば戻れるかを書く
 *   「該当なし」だけだと手が止まる。いま効いている条件を並べて出す。
 *
 * ■ 状態は色だけで示さない
 *   到着待ち・滞在中・未精算はすべて文字で書く。淡い緑の面は補助。
 * ==========================================================================*/

type Tab = 'all' | 'arriving' | 'waiting' | 'unpaid';

const STATUS_LABEL = { staying: '滞在中', waiting: '到着待ち', left: '出発済み' } as const;
const SETTLE_LABEL = { unpaid: '未精算', prepaid: '事前決済済' } as const;

export function ReservationList() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;

  const [query, setQuery] = useState('');
  const [date, setDate] = useState(TODAY);
  const [tab, setTab] = useState<Tab>('all');

  const detailHref = `/admin/reservations/detail`;

  /** 宿泊日と検索語まで掛けた集合。タブの件数はここから数える。 */
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 数字だけを取り出す。空文字で includes すると**全件一致**になるので、
    // 「検索語に数字がある」ことを先に確かめる。
    const digits = q.replace(/[^0-9]/g, '');
    return RESERVATIONS.filter((r) => {
      if (date && !occupiesOn(r, date)) return false;
      if (q === '') return true;
      const byName =
        r.guest.toLowerCase().includes(q) ||
        r.guest
          .replace(/[\s　]/g, '')
          .includes(q.replace(/[\s　]/g, ''));
      const byNumber = digits !== '' && r.id.includes(digits);
      return byName || byNumber;
    });
  }, [query, date]);

  const counts = {
    all: scoped.length,
    arriving: scoped.filter((r) => r.checkIn === date).length,
    waiting: scoped.filter((r) => r.status === 'waiting').length,
    unpaid: scoped.filter((r) => r.settlement === 'unpaid').length,
  };

  const rows = scoped.filter((r) => {
    if (tab === 'arriving') return r.checkIn === date;
    if (tab === 'waiting') return r.status === 'waiting';
    if (tab === 'unpaid') return r.settlement === 'unpaid';
    return true;
  });

  const TABS: readonly { id: Tab; label: string }[] = [
    { id: 'all', label: 'すべて' },
    { id: 'arriving', label: '本日到着' },
    { id: 'waiting', label: '到着待ち' },
    { id: 'unpaid', label: '未精算' },
  ];

  return (
    <>
      <div
        role="group"
        aria-label="予約の検索"
        className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5"
      >
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <TextField
            id={id('q')}
            label="検索"
            value={query}
            onChange={setQuery}
            placeholder="宿泊者名・予約番号"
          />
          <TextField
            id={id('date')}
            label="宿泊日"
            type="date"
            value={date}
            onChange={setDate}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTab(t.id)}
                className={
                  on
                    ? 'inline-flex min-h-[40px] items-center gap-2 bg-[var(--soft)] px-4 text-[13px] font-bold text-[var(--soft-ink)]'
                    : 'inline-flex min-h-[40px] items-center gap-2 border border-[var(--line-strong)] px-4 text-[13px] font-medium text-[var(--sub)] hover:border-[var(--ink)]'
                }
              >
                {t.label}
                <span className="tabular-nums">{counts[t.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        aria-labelledby={id('h-list')}
        className="mt-6 min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5"
      >
        <h2 id={id('h-list')} className="text-[17px] font-bold text-[var(--ink)]">
          {date ? `${formatLongJa(date)}に宿泊する予約` : 'すべての予約'} / {rows.length}件
        </h2>

        {rows.length === 0 ? (
          <div className="mt-4 border border-[var(--line-strong)] px-4 py-5">
            <p className="text-[14px] font-semibold text-[var(--ink)]">
              条件に合う予約はありません。
            </p>
            <p className="mt-2 text-[13px] leading-[1.9] text-[var(--sub)]">
              いま効いている条件：宿泊日 {date || '指定なし'} /{' '}
              {query.trim() === '' ? '検索語なし' : `検索語「${query.trim()}」`} /{' '}
              {TABS.find((t) => t.id === tab)?.label}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDate(TODAY);
                setTab('all');
              }}
              className="mt-3 inline-flex min-h-[44px] items-center border border-[var(--line-strong)] px-4 text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
            >
              本日の予約に戻す
            </button>
          </div>
        ) : (
          <>
            <div className="site-scroll-x mt-4">
              <table className={`${TABLE} min-w-[880px]`}>
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      予約番号
                    </th>
                    <th scope="col" className={TH}>
                      宿泊者
                    </th>
                    <th scope="col" className={TH}>
                      宿泊日
                    </th>
                    <th scope="col" className={TH}>
                      客室番号・タイプ
                    </th>
                    <th scope="col" className={TH}>
                      状態
                    </th>
                    <th scope="col" className={TH}>
                      合計
                    </th>
                    <th scope="col" className={TH}>
                      精算
                    </th>
                    <th scope="col" className={TH}>
                      確認事項
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <Row key={r.id} r={r} detailHref={detailHref} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] tabular-nums text-[var(--sub)]">
              1–{rows.length} / {rows.length}件　予約番号は末尾4桁を表示しています。
            </p>
          </>
        )}
      </section>
    </>
  );
}

function Row({ r, detailHref }: { r: Reservation; detailHref: string }) {
  const mark = r.id === '0842';
  return (
    <tr className={mark ? 'bg-[var(--soft)]' : undefined}>
      <td className={`${TD} tabular-nums`}>{r.id}</td>
      <td className={TD}>
        {mark ? (
          <a href={detailHref} className="font-semibold underline underline-offset-4">
            {r.guest}
          </a>
        ) : (
          r.guest
        )}
      </td>
      <td className={`${TD} tabular-nums`}>
        {formatShort(r.checkIn)} &rarr; {formatShort(r.checkOut)}
      </td>
      <td className={TD}>
        {r.room} / {roomType(typeOfRoom(r.room)).name}
      </td>
      <td className={TD}>{STATUS_LABEL[r.status]}</td>
      <td className={`${TD} tabular-nums`}>{yen(reservationTotal(r))}</td>
      <td className={TD}>{SETTLE_LABEL[r.settlement]}</td>
      {/*
        空欄に `.sr-only` を置かないこと。`.sr-only` は position: absolute なので、
        position: static のスクロール容器（この表）の中に置くと overflow-x のクリップを
        抜けて、**ページ全体**に横スクロールが出る。ダッシは可視の文字のまま出す。
      */}
      <td className={TD}>
        {r.flag ? <span className={TAG}>{r.flag}</span> : '—'}
      </td>
    </tr>
  );
}
