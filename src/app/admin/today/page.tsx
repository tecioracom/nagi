import type { Metadata } from 'next';
import { AdminCard, AdminStat } from '@/components/site/AdminShell';
import { TABLE, TAG, TAG_QUIET, TD, TH } from '@/components/site/styles';
import { percent } from '@/components/site/format';
import { NagiAdmin, AdminHead } from '../../_admin';
import {
  ATTENTION,
  DEPARTURES_DONE,
  DEPARTURES_TODAY,
  HOUSEKEEPING,
  HOUSEKEEPING_LABEL,
  ROOMS,
  ROOM_TYPES,
  TOTAL_ROOMS,
  arrivalsToday,
  occupiedTonight,
  roomType,
  roomsToPrepare,
  typeOfRoom,
} from '../../_data';

/* ============================================================================
 * 本日の状況 `/admin/today`。
 *
 * 出している数字はすべて `_data.ts` の台帳から導いている。
 *   到着4組 …… 本日チェックインの予約数
 *   稼働75% …… 今夜の在室6室 ÷ 全8室
 *   準備2室 …… 清掃中 + 点検待ち
 * 定数で書かずに導くのは、予約を1件足したときに**数字だけが古いまま**に
 * ならないようにするため。書き出した画面と同じ値になる。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '本日の状況 — NAGI 管理',
    description: 'NAGI のフロントが開く「本日の状況」。到着予定と、対応が必要な項目。',
    alternates: { canonical: '/admin/today' },
    robots: { index: false, follow: false },
  };
}

const STATUS_LABEL = { staying: '到着済み', waiting: '到着待ち', left: '出発済み' } as const;

export default async function TodayPage() {

  const arrivals = arrivalsToday();
  const arrived = arrivals.filter((r) => r.status === 'staying').length;
  const occupied = occupiedTonight();
  const prepare = roomsToPrepare();
  const cleaning = prepare.filter((no) => HOUSEKEEPING[no] === 'cleaning').length;
  const inspect = prepare.filter((no) => HOUSEKEEPING[no] === 'inspect').length;
  const detailHref = `/admin/reservations/detail`;

  return (
    <NagiAdmin current="today">
      <AdminHead
        title="本日の状況"
        lead="到着予定と対応が必要な項目を確認できます。"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="本日の到着"
          value={String(arrivals.length)}
          unit="組"
          note={`チェックイン済み ${arrived}組`}
        />
        <AdminStat
          label="本日の出発"
          value={String(DEPARTURES_TODAY)}
          unit="組"
          note={`チェックアウト済み ${DEPARTURES_DONE}組`}
        />
        <AdminStat
          label="今夜の稼働"
          value={percent(occupied, TOTAL_ROOMS)}
          note={`${occupied}室 / 全${TOTAL_ROOMS}室`}
        />
        <AdminStat
          label="準備が必要な客室"
          value={String(prepare.length)}
          unit="室"
          note={`清掃中 ${cleaning}室・点検待ち ${inspect}室`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <AdminCard title="本日のチェックイン">
          <div className="site-scroll-x">
            <table className={TABLE}>
              <thead>
                <tr>
                  <th scope="col" className={TH}>
                    時刻
                  </th>
                  <th scope="col" className={TH}>
                    宿泊者
                  </th>
                  <th scope="col" className={TH}>
                    客室番号・タイプ
                  </th>
                  <th scope="col" className={TH}>
                    人数
                  </th>
                  <th scope="col" className={TH}>
                    状態
                  </th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((r) => {
                  const mark = r.id === '0842';
                  return (
                    <tr key={r.id} className={mark ? 'bg-[var(--soft)]' : undefined}>
                      <td className={`${TD} tabular-nums`}>{r.eta}</td>
                      <td className={TD}>
                        {mark ? (
                          <a
                            href={detailHref}
                            className="font-semibold underline underline-offset-4"
                          >
                            {r.guest}
                          </a>
                        ) : (
                          r.guest
                        )}
                      </td>
                      <td className={TD}>
                        {r.room} / {roomType(typeOfRoom(r.room)).name}
                      </td>
                      <td className={`${TD} tabular-nums`}>{r.adults}名</td>
                      <td className={TD}>{STATUS_LABEL[r.status]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title={`対応が必要な項目 ${ATTENTION.length}`}>
          <ul className="divide-y divide-[var(--line)]">
            {ATTENTION.map((a) => (
              <li key={a.tag} className="py-4 first:pt-0">
                <p className="flex items-center gap-3 text-[12px]">
                  <span className={TAG}>{a.tag}</span>
                  <span className="tabular-nums text-[var(--sub)]">{a.eta}</span>
                </p>
                {a.lines.map((line) => (
                  <p key={line} className="mt-1 text-[13px] text-[var(--ink)]">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          <a
            href={detailHref}
            className="mt-2 flex min-h-[48px] items-center justify-between gap-3 border border-[var(--line-strong)] px-4 text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
          >
            山田様の予約を確認
            <span aria-hidden="true">&#8599;</span>
          </a>
        </AdminCard>
      </div>

      <AdminCard title="客室の準備状況" className="mt-6">
        <p className="-mt-2 mb-4 text-[12px] text-[var(--sub)]">
          {ROOM_TYPES.map(
            (t) =>
              `${t.rooms[0]}–${t.rooms[t.rooms.length - 1]}：${t.name}（${t.rooms.length}室）`,
          ).join(' / ')}
        </p>
        <ul role="list" className="flex flex-wrap gap-2">
          {ROOMS.map((r) => {
            const state = HOUSEKEEPING[r.no];
            const strong = state === 'staying' || state === 'cleaning';
            return (
              <li
                key={r.no}
                className={
                  strong
                    ? 'flex min-w-[120px] items-center gap-2 bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--soft-ink)]'
                    : 'flex min-w-[120px] items-center gap-2 border border-[var(--line)] px-3 py-2 text-[12px] text-[var(--sub)]'
                }
              >
                <span className="tabular-nums font-semibold">{r.no}</span>
                <span>{HOUSEKEEPING_LABEL[state]}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[12px] text-[var(--sub)]">
          <span className={TAG_QUIET}>清掃済み</span> は次のお客様をお迎えできる状態です。
        </p>
      </AdminCard>
    </NagiAdmin>
  );
}
