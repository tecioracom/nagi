import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SITE_SHELL } from '@/components/site/styles';

/* ============================================================================
 * NAGI の共通パーツ（ワードマーク・ヘッダー・宿のフッター・ページの器）。
 *
 * ■ 器の入れ子
 *     <NagiShell>                       ← .sample-body.sample-nagi（配色スコープ）
 *       <NagiHeader /> … <main> …       ← 宿の画面
 *       <NagiFooter />                  ← 宿のフッター（深緑）
 *     </NagiShell>
 *     <SiteFooter />                    ← Teciora の帯（スコープの**外**）
 *
 *   Teciora の帯をスコープの中に入れると、宿のパレットを継承して
 *   「宿のフッターが2つある」ように見える。必ず外に出すこと。
 *
 * ■ ここにも overflow / transform / filter を付けない（sticky が死ぬ）。
 * ==========================================================================*/

export function Wordmark({
  size = 'md',
  tone = 'ink',
}: {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'cream';
}) {
  const px = size === 'lg' ? 'text-[26px]' : size === 'sm' ? 'text-[16px]' : 'text-[20px]';
  const color = tone === 'cream' ? 'text-[var(--cream)]' : 'text-[var(--ink)]';
  return (
    <span className={`nagi-wordmark block ${px} ${color}`} aria-hidden="true">
      NAGI
    </span>
  );
}

/** ワードマークのリンク。読み上げには「NAGI ホーム」と出す。 */
export function WordmarkLink({
  tone = 'ink',
  size = 'md',
}: {
  tone?: 'ink' | 'cream';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <a
      href="/"
      className="inline-flex min-h-[44px] items-center"
    >
      <Wordmark size={size} tone={tone} />
      <span className="sr-only">NAGI ホーム</span>
    </a>
  );
}

const NAV: readonly { label: string; hash: string }[] = [
  { label: 'NAGI について', hash: '#about' },
  { label: '客室', hash: '#rooms' },
  { label: 'レストラン', hash: '#restaurant' },
  { label: '過ごし方', hash: '#experiences' },
];

/**
 * 宿のヘッダー。
 * `tone="over"` … ヒーロー写真の上（濃い地）に重ねる。トップだけ。
 * `tone="plain"` … クリーム地の上。予約・確認画面。
 */
export function NagiHeader({
  tone = 'plain',
}: {
  tone?: 'over' | 'plain';
}) {
  const over = tone === 'over';
  return (
    <header
      className={
        over
          ? 'site-on-dark absolute inset-x-0 top-0 z-20'
          : 'sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--cream)]'
      }
    >
      <div
        className={`${SITE_SHELL} flex min-h-[var(--site-header-h)] flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}
      >
        <WordmarkLink tone={over ? 'cream' : 'ink'} />

        {over ? (
          <nav aria-label="NAGI のメニュー" className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.hash}
                href={n.hash}
                className="text-[13px] text-[var(--on-dark-strong)] hover:text-[var(--cream)]"
              >
                {n.label}
              </a>
            ))}
            <a
              href="/reserve"
              className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--on-dark-line-strong)] px-5 text-[13px] font-semibold text-[var(--cream)] hover:bg-[var(--on-dark-fill)]"
            >
              宿泊予約
              <span aria-hidden="true">&#8599;</span>
            </a>
          </nav>
        ) : (
          <div className="flex items-center gap-5">
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-[var(--sub)] sm:inline">
              Setouchi, Japan
            </span>
            <a
              href="/reserve"
              className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[var(--ink)] underline underline-offset-4"
            >
              宿泊予約
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

/** 宿のフッター（深緑）。8本の中でここだけは NAGI の言葉で書く。 */
export function NagiFooter() {
  return (
    <div className="site-on-dark mt-20 bg-[var(--green)] py-12 text-[var(--cream)] md:py-14">
      <div className={SITE_SHELL}>
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <Wordmark size="lg" tone="cream" />
            <p className="mt-4 text-[13px] leading-[1.9] text-[var(--on-dark-soft)]">
              瀬戸内の海辺に佇む小さなホテル。
              <br />
              NAGI — Setouchi, Japan
            </p>
          </div>

          <nav aria-label="NAGI のページ" className="text-[13px]">
            <ul className="grid gap-y-2 sm:grid-cols-2 sm:gap-x-12">
              <li>
                <a href="/#rooms" className="hover:underline">
                  客室
                </a>
              </li>
              <li>
                <a href="/#restaurant" className="hover:underline">
                  レストラン
                </a>
              </li>
              <li>
                <a href="/reserve" className="hover:underline">
                  宿泊予約
                </a>
              </li>
              <li>
                <a href="/reserve/manage" className="hover:underline">
                  予約の確認・変更
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:underline">
                  スタッフの方
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-10 text-[11px] uppercase tracking-[0.16em] text-[var(--on-dark-faint)]">
          &copy; NAGI — Concept Website
        </p>
        <p className="mt-2 text-[12px] text-[var(--on-dark-faint)]">
          NAGI は架空のホテルです。
        </p>
      </div>
    </div>
  );
}

/**
 * 1ページぶんの器。
 * `main` の id は本体サイトと同じ `main`（スキップリンクの行き先）。
 */
export function NagiShell({
  children,
  header = 'plain',
  hideFooter = false,
}: {
  children: ReactNode;
  header?: 'over' | 'plain' | 'none';
  hideFooter?: boolean;
}) {
  return (
    <>
      <div className="sample-body sample-nagi min-h-screen bg-[var(--cream)] text-[var(--ink)]">
        {header !== 'none' && <NagiHeader tone={header} />}
        {children}
        {!hideFooter && <NagiFooter />}
      </div>
      <SiteFooter />
    </>
  );
}

/** 予約まわりの画面で使う、見出しの塊。 */
export function PageHead({
  en,
  ja,
  lead,
}: {
  en: string;
  ja: string;
  lead: string;
}) {
  return (
    <div>
      <h1 className="nagi-display text-[40px] leading-[1.12] text-[var(--green)] md:text-[54px]">
        {en}
      </h1>
      <p className="mt-3 text-[20px] font-semibold text-[var(--ink)] md:text-[24px]">
        {ja}
      </p>
      <p className="mt-3 max-w-[34em] text-[14px] leading-[1.9] text-[var(--sub)]">
        {lead}
      </p>
    </div>
  );
}
