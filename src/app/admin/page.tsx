import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Wordmark } from '../_ui';
import { ROOM_TYPES, TOTAL_ROOMS } from '../_data';
import { LoginForm } from './LoginForm';

/* ============================================================================
 * スタッフのログイン `/admin`。
 * 左半分は宿の深緑、右にログインカード（書き出しと同じ割り）。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ログイン — NAGI 管理',
    description:
      'NAGI のスタッフ用管理画面のログイン。見本のため入力は照合されず、どこにも送られません。',
    alternates: { canonical: '/admin' },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLoginPage() {

  return (
    <>
      <div className="sample-body sample-nagi md:flex md:min-h-screen">
        {/* 左：宿の面 */}
        <div className="site-on-dark bg-[var(--green)] px-8 py-10 text-[var(--cream)] md:w-[38%] md:px-12 md:py-14">
          <Wordmark size="lg" tone="cream" />
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[var(--on-dark-faint)]">
            Setouchi, Japan
          </p>
          <div className="mt-16 md:mt-32">
            <p className="text-[24px] font-semibold">NAGI 瀬戸内</p>
            <p className="mt-2 text-[13px] text-[var(--on-dark-soft)]">
              スタッフ専用管理画面
            </p>
            <div
              className="mt-8 h-[170px] w-full max-w-[320px] rounded-[2px] bg-[linear-gradient(170deg,#41615a_0%,#22433e_52%,#122c2a_100%)]"
              aria-hidden="true"
            />
            <p className="mt-4 text-[12px] tabular-nums text-[var(--on-dark-faint)]">
              {ROOM_TYPES.length}タイプ / 全{TOTAL_ROOMS}室
            </p>
          </div>
        </div>

        {/* 右：ログイン */}
        <main
          id="main"
          className="flex flex-1 flex-col items-center justify-center bg-[var(--cream)] px-6 py-14"
        >
          <LoginForm />
          <p className="mt-5 max-w-[420px] text-[12px] leading-[1.8] text-[var(--sub)]">
            アカウントの発行は施設の管理者にご依頼ください。
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-[var(--sub)]">
            &copy; NAGI
          </p>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
