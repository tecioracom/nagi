import type { ReactNode } from 'react';

/* ============================================================================
 * 管理画面のシェル（左サイドバー + 上帯 + 本体）。8本で共有する。
 *
 * ■ 表側と裏側は別の器にする
 *   お客様が見る画面と、お店の人が一日じゅう開く画面では、求められるものが
 *   違う。裏側は「一目で全部が見える」ことが最優先なので、余白を詰め、
 *   面をカードに割り、濃い色のサイドバーで縦の位置を固定する。
 *
 * ■ サイドバーは sticky。**祖先に overflow / transform を付けないこと。**
 *   この器の外側（layout.tsx / samples.css の .sample-shell）にも付けない。
 *   1つ入るだけで無言で効かなくなる。検査 [11] が見ている。
 *
 * ■ 色はサイトの CSS 変数から取る
 *   `--green` … サイドバーの地（無ければ --ink）
 *   `--cream` … 本体の地
 *   `--paper` … カードの地
 *   8本それぞれの `.sample-<slug>` で定義する。
 *
 * ■ 現在地は色だけで示さない
 *   現在の項目は `aria-current="page"` と太字と面の塗りの3つで示す。
 *
 * ■ prop 名に `action` を使わない
 *   検査 [1] は `action=` を送信系の印として文字列で探す。JSX の prop 名でも
 *   同じ並びになるので、見出し右のボタンを受け取る口は `trailing` にしてある。
 *   （同じ理由で、識別子に `square` を使わない。決済 SDK の検出に当たる。）
 * ==========================================================================*/

export type AdminNavItem = {
  label: string;
  href: string;
  current?: boolean;
};

type Props = {
  /** サイドバー上部。ワードマークなど。 */
  brand: ReactNode;
  /** ワードマークの下の小さい行（「ホテル管理」など）。 */
  brandSub: string;
  nav: readonly AdminNavItem[];
  /** サイドバー下部の小さい2行（規模・案内リンクなど）。 */
  footNote?: ReactNode;
  /** 上帯の左（「NAGI 瀬戸内 / フロント」）。 */
  crumb: string;
  /** 上帯の右（日付・担当者）。 */
  meta: ReactNode;
  children: ReactNode;
};

export function AdminShell({
  brand,
  brandSub,
  nav,
  footNote,
  crumb,
  meta,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[var(--cream)] md:flex">
      {/* サイドバー */}
      <div className="site-on-dark bg-[var(--green,var(--ink))] text-[var(--cream)] md:w-[220px] md:shrink-0">
        <div className="sticky top-0 flex flex-col gap-6 px-5 py-5 md:h-screen md:px-6 md:py-7">
          <div>
            {brand}
            <p className="mt-2 text-[11px] tracking-[0.08em] text-[var(--on-dark-faint)]">
              {brandSub}
            </p>
          </div>

          <nav aria-label="管理画面のメニュー" className="md:flex-1">
            <ul className="flex flex-wrap gap-2 md:block md:space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    {...(item.current ? { 'aria-current': 'page' as const } : {})}
                    className={`flex min-h-[44px] items-center rounded-[4px] px-3 text-[14px] ${
                      item.current
                        ? 'bg-[var(--soft,#ffffff)] font-bold text-[var(--soft-ink,#111111)]'
                        : 'font-medium text-[var(--on-dark-strong)] hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {footNote && (
            <div className="hidden text-[12px] leading-[1.8] text-[var(--on-dark-faint)] md:block">
              {footNote}
            </div>
          )}
        </div>
      </div>

      {/* 本体 */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--cream)] px-5 py-4 md:px-8">
          <p className="text-[13px] font-medium text-[var(--sub)]">{crumb}</p>
          <div className="flex items-center gap-3 text-[13px] text-[var(--sub)]">
            {meta}
          </div>
        </div>
        <main id="main" className="px-5 py-7 md:px-8 md:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

/** 管理画面のカード。 */
export function AdminCard({
  title,
  trailing,
  children,
  className = '',
}: {
  title?: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      /*
       * `min-w-0` は飾りではない。このカードはグリッドの子になることがあり、
       * グリッドの子は既定で `min-width: auto`（＝中身の min-content より縮まない）。
       * 中に `min-w-[640px]` の表が入ると、**列がその幅まで広がってページ全体に
       * 横スクロールが出る**（`.site-scroll-x` は自分の中しかスクロールさせない）。
       */
      className={`min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5 md:p-6 ${className}`}
    >
      {(title || trailing) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 className="text-[17px] font-bold text-[var(--ink)]">{title}</h2>
          )}
          {trailing}
        </div>
      )}
      {children}
    </section>
  );
}

/** 数字を1つ出すタイル（到着4組・稼働75% など）。 */
export function AdminStat({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note: string;
}) {
  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4">
      <p className="text-[13px] text-[var(--sub)]">{label}</p>
      <p className="mt-1 text-[30px] font-bold leading-[1.2] tabular-nums text-[var(--ink)]">
        {value}
        {unit && <span className="ml-1 text-[17px] font-semibold">{unit}</span>}
      </p>
      <p className="mt-1 text-[12px] text-[var(--sub)]">{note}</p>
    </div>
  );
}
