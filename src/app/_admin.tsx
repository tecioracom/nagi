import type { ReactNode } from 'react';
import { AdminShell } from '@/components/site/AdminShell';
import { SiteFooter } from '@/components/site/SiteFooter';
import { formatLongJa } from '@/components/site/calendar';
import { Wordmark } from './_ui';
import { ROOM_TYPES, STAFF_ON_DUTY, TODAY, TOTAL_ROOMS } from './_data';

/* ============================================================================
 * NAGI の管理画面の器。共有の AdminShell に、この宿ぶんの中身を入れる。
 *
 * 表側（クリーム地・欧文の明朝）とは別の器にしてある。フロントが一日じゅう
 * 開く画面なので、余白を詰め、面をカードに割り、深緑のサイドバーで
 * 縦の位置を固定する。**白い汎用ダッシュボードには寄せない。**
 * ==========================================================================*/

export type AdminPage = 'today' | 'reservations' | 'inventory';

export function NagiAdmin({
  current,
  crumb = 'NAGI 瀬戸内 / フロント',
  children,
}: {
  current: AdminPage;
  crumb?: string;
  children: ReactNode;
}) {
  const base = `/admin`;
  return (
    <>
      <div className="sample-body sample-nagi">
        <AdminShell
          brand={<Wordmark size="md" tone="cream" />}
          brandSub="ホテル管理"
          nav={[
            { label: '本日の状況', href: `${base}/today`, current: current === 'today' },
            {
              label: '予約一覧',
              href: `${base}/reservations`,
              current: current === 'reservations',
            },
            {
              label: '空室・料金',
              href: `${base}/inventory`,
              current: current === 'inventory',
            },
          ]}
          footNote={
            <>
              <p>
                {ROOM_TYPES.length}タイプ / 全{TOTAL_ROOMS}室
              </p>
              <p className="mt-1">
                <a
                  href="/"
                  className="underline underline-offset-4"
                >
                  宿のサイトを開く
                </a>
              </p>
            </>
          }
          crumb={crumb}
          meta={
            <>
              <span className="tabular-nums">{formatLongJa(TODAY)}</span>
              <span aria-hidden="true">・</span>
              <span>{STAFF_ON_DUTY}</span>
            </>
          }
        >
          {children}
        </AdminShell>
      </div>
      {/* Teciora の帯。**配色スコープの外**に置く（[8] が全ページで見ている）。 */}
      <SiteFooter />
    </>
  );
}

/** 画面の見出し（管理側）。 */
export function AdminHead({
  title,
  lead,
  trailing,
}: {
  title: string;
  lead: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold text-[var(--ink)]">{title}</h1>
        <p className="mt-1 text-[13px] text-[var(--sub)]">{lead}</p>
      </div>
      {trailing}
    </div>
  );
}
