import type { Metadata } from 'next';
import { SITE_SHELL } from '@/components/site/styles';
import { NagiShell, PageHead } from '../../_ui';
import { ManageForm } from './ManageForm';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '予約の確認・変更 — NAGI',
    description:
      'NAGI のご予約内容の確認と変更。変更前と変更後、差額を保存の前に表示します。確認までで、送信も保存もされません。',
    alternates: { canonical: '/reserve/manage' },
    robots: { index: false, follow: false },
  };
}

export default async function ManagePage() {

  return (
    <NagiShell>
      <main id="main">
        <div className={`${SITE_SHELL} pt-14 md:pt-20`}>
          <PageHead
            en="Your stay."
            ja="予約の確認・変更"
            lead="ご予約内容を確認できます。変更する項目を書き換えると、変更前と変更後、差額がその場に出ます。"
          />
        </div>
        <ManageForm />
      </main>
    </NagiShell>
  );
}
