import type { Metadata } from 'next';
import { NagiAdmin } from '../../../_admin';
import { ReservationDetail } from './ReservationDetail';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '予約詳細 — NAGI 管理',
    description:
      'NAGI の予約詳細。客室タイプを変えると支払いが変わり、保存の前に差額が出ます。',
    alternates: {
      canonical: '/admin/reservations/detail',
    },
    robots: { index: false, follow: false },
  };
}

export default async function DetailPage() {

  return (
    <NagiAdmin current="reservations">
      <ReservationDetail />
    </NagiAdmin>
  );
}
