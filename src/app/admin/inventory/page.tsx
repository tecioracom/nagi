import type { Metadata } from 'next';
import { NagiAdmin, AdminHead } from '../../_admin';
import { InventoryBoard } from './InventoryBoard';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '空室・料金 — NAGI 管理',
    description:
      'NAGI の空室・料金。8室×7日のカレンダーと、タイプ別の販売料金・販売可能数。',
    alternates: { canonical: '/admin/inventory' },
    robots: { index: false, follow: false },
  };
}

export default async function InventoryPage() {

  return (
    <NagiAdmin current="inventory">
      <AdminHead
        title="空室・料金"
        lead="客室ごとの予定と販売料金を同じ週で確認できます。"
      />
      <InventoryBoard />
    </NagiAdmin>
  );
}
