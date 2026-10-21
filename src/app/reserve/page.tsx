import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SITE_SHELL } from '@/components/site/styles';
import { NagiShell, PageHead } from '../_ui';
import { ReserveForm } from './ReserveForm';
import { ReserveFormFromQuery } from './ReserveFormFromQuery';

/* ============================================================================
 * 宿泊予約 `/reserve`。
 *
 * 書き出しでは「予約フォーム」と「予約完了」の2画面だったが、実装では
 * **1ルートの2つの状態**にしてある。予約は成立しないので、完了の画面を
 * 別ルートで持つと、直リンクで「完了しました」だけが開けてしまう。
 * 終点は同じルートの「入力内容の確認」。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '宿泊予約 — NAGI',
    description:
      'NAGI の宿泊予約。日程・人数・お食事・客室を選ぶと合計金額が変わります。入力内容の確認までで、送信も保存もされません。',
    alternates: { canonical: '/reserve' },
    robots: { index: false, follow: false },
  };
}

export default async function ReservePage() {

  return (
    <NagiShell>
      <main id="main">
        <div className={`${SITE_SHELL} pt-14 md:pt-20`}>
          <PageHead
            en="Reserve your stay."
            ja="宿泊予約"
            lead="日程とお客様情報をご入力のうえ、内容をご確認ください。日程・人数・お食事・客室を変えると、合計金額がその場で変わります。"
          />
        </div>
        <Suspense
          fallback={<ReserveForm initialRoom="suite" />}
        >
          <ReserveFormFromQuery />
        </Suspense>
      </main>
    </NagiShell>
  );
}
