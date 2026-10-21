import { Logo } from '@/components/site/Logo';

/* ============================================================================
 * 断り書きの帯。**全ページ**の最後に置く。
 *
 * ■ なぜ全ページに要るか
 *   これは動くサイトで、どのページも直リンクで開ける。氏名やメールを
 *   入力させる画面もある。**誰が作ったものなのか分からないまま入力させる
 *   画面を1枚も残さない**ための帯である。消さないこと。
 *
 * ■ サイトのスコープの外に置く
 *   `.sample-nagi` の**外**に置くこと。中に入れるとこのサイトの
 *   パレットを継承して、作り手の帯に見えなくなる。ページの構造は
 *     <div className="sample-body sample-nagi"> … サイト本体 … </div>
 *     <SiteFooter />            ← ここ（スコープの外）
 *   にする。
 *
 * ■ 書くのは2つだけ
 *   素性（架空の事業者の画面であること）と、この画面で起きないこと
 *   （入力は送信も保存もされない）。褒め言葉も次の導線も置かない。
 * ==========================================================================*/

export function SiteFooter() {
  return (
    <footer
      aria-label="この画面についての断り書き"
      className="relative bg-primary [--focus-ring:#00D1FF] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-brand before:content-['']"
    >
      <div className="mx-auto w-full max-w-content px-6 py-10 md:px-8 md:py-12 lg:px-12">
        <a
          href="https://www.teciora.com/"
          className="inline-flex min-h-[44px] items-center gap-2"
        >
          <Logo size={18} showWordmark={false} />
          <span className="text-body font-bold tracking-[-0.02em] text-white">
            Teciora
          </span>
        </a>

        <p className="mt-3 max-w-prose text-body-sm text-white/80">
          この画面の事業者は架空です。社名・人名・金額・在庫数は、この画面のために用意しました。
        </p>
        <p className="mt-2 max-w-prose text-body-sm text-white/80">
          入力した内容は送信も保存もされません。ブラウザを閉じれば残りません。
        </p>
      </div>
    </footer>
  );
}
