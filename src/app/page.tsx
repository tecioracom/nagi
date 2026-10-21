import type { Metadata } from 'next';
import { SITE_SHELL } from '@/components/site/styles';
import { yen } from '@/components/site/format';
import { NagiShell, NagiHeader } from './_ui';
import { CHECK_IN_FROM, CHECK_OUT_BY, ROOM_TYPES } from './_data';
import { SitePhoto } from '@/components/site/SitePhoto';
import { SiteVideo } from '@/components/site/SiteVideo';

/* ============================================================================
 * NAGI トップ `/`。
 * 書き出した 1440×5874 の1ページを、そのまま1ルートに実装したもの。
 *
 * ■ ヒーローは動画（2026-09-18 に静止画から差し替えた）
 *   書き出しのフレーム `NAGI / Motion — Higgsfield ocean / 8 seconds` は
 *   40枚のコマを並べたものだった。実体の動画（1536×1024 / 30fps / 240コマ /
 *   8.000秒・継ぎ目はピクセル単位で一致）を配信用に落として敷いている。
 *   **サイト全体で動画はこの1本だけ。**作り方は
 *   `scripts/build-nagi-hero-video.mjs`、埋め込みは `SiteVideo`。
 *   動きを減らす設定のときは再生せず、動画の1コマ目から作ったポスターを出す。
 *
 * ■ 写真（2026-09-18 に入れた）
 *   客室3種・レストラン・露天風呂の5点。`public/samples/nagi/`。
 *   面のクラス（.nagi-sea / .nagi-room-N …）は**消さずに残してある**:
 *   写真が届くまでと、読み込みに失敗したときに、面の明度が動かないため。
 *   **このページは静止画を先読みしない**（ヒーローが動画になり、折りたたみの
 *   上に `<img>` が無くなった。検査 [12] は eager 0枚を許す）。
 *
 * ■ 数字は1か所から
 *   面積・定員・料金は `_data.ts` の ROOM_TYPES。予約画面・管理画面と
 *   同じ定数を見ている。片方だけ直すことができない形にしてある。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'NAGI — 瀬戸内の海辺のホテル',
    description:
      '瀬戸内の海を望む全8室のホテル NAGI。客室・レストラン・過ごし方と、宿泊予約。Teciora が制作したサンプルサイトで、NAGI は架空のホテルです。',
    alternates: { canonical: '/' },
    robots: { index: false, follow: false },
  };
}

const EXPERIENCES: readonly { n: string; title: string; lead: string }[] = [
  { n: '01', title: '海を望む露天風呂', lead: '朝日を眺めながら湯につかる。' },
  { n: '02', title: '瀬戸内の食事', lead: '旬の魚や野菜を使った季節の料理。' },
  { n: '03', title: '気ままなひととき', lead: '本を読んだり海辺を歩いたり。' },
];

export default async function NagiTopPage() {

  return (
    <NagiShell header="none">
      {/*
        §hero — ヘッダーはこの中（position: relative の子）に置く。
        overflow-hidden は付けない。はみ出すものが無いうえ、
        この面は将来 sticky を入れたくなる場所なので、癖を残さない。
      */}
      <section className="nagi-sea relative">
        {/*
          海の8秒ループ（無音・継ぎ目なし）。**このサイト全体で動画はここ1本だけ。**
          静止画だった `nagi/sea.{avif,webp}` は削除した（動画のポスターが
          同じ絵を出すので、2つ持つ理由が無い）。
          動きを減らす設定のときは再生せずポスターを出す（`SiteVideo` の注記）。
          膜（.nagi-hero-scrim）は、**コマによって変わる明るさ**に文字の
          読みやすさを預けないために重ねる。左下ほど濃い。
        */}
        <SiteVideo
          src="nagi/sea"
          width={1248}
          height={832}
          fill
          className="z-0"
        />
        <div
          className="nagi-hero-scrim absolute inset-0 z-0"
          aria-hidden="true"
        />
        <NagiHeader tone="over" />
        <div
          className={`${SITE_SHELL} site-on-dark relative z-10 flex min-h-[560px] flex-col justify-end py-24 md:min-h-[680px] md:py-28`}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--on-dark-soft)]">
            A seaside hotel in Setouchi
          </p>
          <h1 className="nagi-display mt-4 text-[52px] leading-[1.06] text-[var(--cream)] md:text-[84px]">
            A quiet stay
            <br />
            by the sea.
          </h1>
          <p className="mt-4 text-[17px] tracking-[-0.01em] text-[var(--on-dark-strong)] md:text-[19px]">
            海辺でゆっくり。
          </p>
          <p className="mt-10 text-[13px] leading-[1.9] text-[var(--on-dark-soft)]">
            瀬戸内の海を眺めながら
            <br />
            何も予定を入れずに過ごす休日。
          </p>
        </div>
      </section>

      <main id="main">
        {/* §01 about */}
        <section id="about" className="py-20 md:py-28">
          <div className={SITE_SHELL}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--sub)]">
              01 — About NAGI
            </p>
            <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="text-[30px] leading-[1.5] text-[var(--ink)] md:text-[36px]">
                  海を眺めて
                  <br />
                  一日を過ごす。
                </h2>
                <p className="nagi-display mt-6 text-[22px] italic text-[var(--sub)]">
                  A day with no plans.
                </p>
              </div>
              <div className="max-w-[30em] space-y-5 text-[14px] leading-[2] text-[var(--ink)]">
                <p>
                  NAGI は瀬戸内の海を望む小さなホテルです。朝はテラスでお茶を飲み、午後は読書を。
                </p>
                <p>
                  気が向いたら海辺を歩き、戻ったらお風呂へ。予定を決めずにゆっくりお過ごしください。
                </p>
                <p className="text-[13px] text-[var(--sub)]">
                  全8室／チェックイン {CHECK_IN_FROM}〜／チェックアウト {CHECK_OUT_BY}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* §02 rooms */}
        <section id="rooms" className="pb-20 md:pb-28">
          <div className={SITE_SHELL}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--sub)]">
              02 — Rooms
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <h2 className="nagi-display text-[38px] leading-[1.1] text-[var(--green)] md:text-[52px]">
                Wake up to the sea.
              </h2>
              <p className="text-[13px] text-[var(--sub)]">
                どの部屋からも瀬戸内の海を。
              </p>
            </div>

            <ul role="list" className="mt-10 grid gap-10 md:grid-cols-3">
              {ROOM_TYPES.map((r) => (
                <li key={r.id} className="flex flex-col">
                  <SitePhoto
                    src={r.photo}
                    width={760}
                    height={570}
                    className={`${r.tone} aspect-[4/3] w-full rounded-[2px]`}
                  />
                  <h3 className="mt-5 text-[19px] font-semibold text-[var(--ink)]">
                    {r.name}
                  </h3>
                  <p className="nagi-display text-[15px] text-[var(--sub)]">
                    {r.en}
                  </p>
                  <p className="mt-3 text-[12px] tabular-nums text-[var(--sub)]">
                    {r.area}㎡ / 定員{r.capacity}名 / {r.feature}
                  </p>
                  <p className="mt-3 flex-1 text-[13px] leading-[1.9] text-[var(--ink)]">
                    {r.lead}
                  </p>
                  <p className="mt-4 text-[22px] font-semibold tabular-nums text-[var(--ink)]">
                    {yen(r.price)}
                    <span className="ml-2 text-[12px] font-normal text-[var(--sub)]">
                      大人2名・1泊・朝夕食付き
                    </span>
                  </p>
                  <a
                    href={`/reserve?room=${r.id}`}
                    className="mt-4 inline-flex min-h-[48px] items-center justify-between gap-3 bg-[var(--green)] px-5 text-[14px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]"
                  >
                    この客室を予約
                    <span aria-hidden="true">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] leading-[1.9] text-[var(--sub)]">
              料金は大人2名・1室が基準です。1名でのご利用は2名料金の75%、3名めは1泊あたり{yen(12000)}を加算します。金・土は上の料金、日・木は1段、月〜水は2段お安くなります。
            </p>
          </div>
        </section>

        {/* §03 restaurant */}
        <section id="restaurant" className="pb-20 md:pb-28">
          <div className={SITE_SHELL}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--sub)]">
              03 — Restaurant &amp; Bar
            </p>
            <h2 className="nagi-display mt-4 text-[38px] leading-[1.1] text-[var(--green)] md:text-[52px]">
              Restaurant &amp; Bar
            </h2>

            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
              <SitePhoto
                src="nagi/restaurant"
                width={1000}
                height={750}
                className="nagi-restaurant aspect-[4/3] w-full rounded-[2px]"
              />
              <div>
                <h3 className="text-[26px] leading-[1.5] text-[var(--ink)] md:text-[30px]">
                  瀬戸内の魚と
                  <br />
                  季節のひと皿。
                </h3>
                <p className="mt-5 max-w-[30em] text-[14px] leading-[2] text-[var(--ink)]">
                  その日に届いた魚や野菜を使った夕食をご用意します。食後はカウンターでワインやカクテルを。海を眺めながらお過ごしください。
                </p>
                <dl className="mt-8 space-y-4 text-[13px]">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--sub)]">
                      Restaurant
                    </dt>
                    <dd className="mt-1 tabular-nums text-[var(--ink)]">
                      朝食 7:00–10:00 / 夕食 18:00–21:00
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--sub)]">
                      Bar
                    </dt>
                    <dd className="mt-1 tabular-nums text-[var(--ink)]">
                      20:00–23:00（L.O. 22:30）
                    </dd>
                  </div>
                </dl>
                <p className="mt-6 text-[12px] leading-[1.9] text-[var(--sub)]">
                  夕食は朝夕食付きのご宿泊プランに含まれます。お飲み物は別料金です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* §04 experiences — ここだけ深緑の面にする */}
        <section
          id="experiences"
          className="site-on-dark bg-[var(--green)] py-20 text-[var(--cream)] md:py-28"
        >
          <div className={`${SITE_SHELL} grid gap-12 md:grid-cols-2 md:gap-16`}>
            <SitePhoto
              src="nagi/stay"
              width={1000}
              height={750}
              className="nagi-stay min-h-[280px] rounded-[2px]"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--on-dark-faint)]">
                04 — Experiences
              </p>
              <h2 className="nagi-display mt-4 text-[40px] leading-[1.1] text-[var(--cream)] md:text-[54px]">
                At your
                <br />
                own pace.
              </h2>
              <p className="mt-4 text-[15px] text-[var(--on-dark-strong)]">
                NAGI での過ごし方
              </p>

              <ul role="list" className="mt-8">
                {EXPERIENCES.map((e) => (
                  <li
                    key={e.n}
                    className="flex gap-5 border-t border-[var(--on-dark-line)] py-5"
                  >
                    <span className="text-[12px] tabular-nums text-[var(--on-dark-faint)]">
                      {e.n}
                    </span>
                    <span>
                      <span className="block text-[17px] text-[var(--cream)]">
                        {e.title}
                      </span>
                      <span className="mt-1 block text-[13px] text-[var(--on-dark-soft)]">
                        {e.lead}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* §cta */}
        <section className="py-24 text-center md:py-32">
          <div className={SITE_SHELL}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--sub)]">
              Plan your stay
            </p>
            <p className="nagi-display mt-6 text-[44px] leading-[1.08] text-[var(--green)] md:text-[64px]">
              A few days
              <br />
              by the sea.
            </p>
            <p className="mt-5 text-[16px] text-[var(--ink)]">
              次の休みは瀬戸内へ。
            </p>
            <a
              href="/reserve"
              className="mt-8 inline-flex min-h-[52px] items-center justify-between gap-6 bg-[var(--green)] px-8 text-[15px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]"
            >
              宿泊予約
              <span aria-hidden="true">&#8599;</span>
            </a>
            <p className="mt-6 text-[13px]">
              <a
                href="/reserve/manage"
                className="inline-flex min-h-[44px] items-center text-[var(--ink)] underline underline-offset-4"
              >
                ご予約の確認・変更はこちら
              </a>
            </p>
          </div>
        </section>
      </main>
    </NagiShell>
  );
}
