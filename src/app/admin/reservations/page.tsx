import type { Metadata } from 'next';
import { NagiAdmin, AdminHead } from '../../_admin';
import { ReservationList } from './ReservationList';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '予約一覧 — NAGI 管理',
    description:
      'NAGI の予約一覧。宿泊者名・予約番号での検索と、宿泊日・状態・精算での絞り込み。',
    alternates: { canonical: '/admin/reservations' },
    robots: { index: false, follow: false },
  };
}

export default async function ReservationsPage() {

  return (
    <NagiAdmin current="reservations">
      <AdminHead
        title="予約一覧"
        lead="宿泊者名・予約番号で検索し、予約内容を確認できます。"
        trailing={
          /*
            「予約を登録」は宿のサイトの予約フォームへ送る。
            電話で受けた予約をフロントが入れる導線で、**実際に動く1枚**に
            繋がっている。押しても何も起きないボタンは置かない。
          */
          <a
            href="/reserve"
            className="inline-flex min-h-[48px] items-center gap-3 bg-[var(--green)] px-5 text-[14px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]"
          >
            <span aria-hidden="true">+</span>
            予約を登録
            <span aria-hidden="true">&#8599;</span>
          </a>
        }
      />
      <ReservationList />
    </NagiAdmin>
  );
}
