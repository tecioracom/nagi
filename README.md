# NAGI — ホテル のサンプルサイト

瀬戸内・全8室。予約の申し込みから、当日フロントが開く画面までひと続き。

Teciora が制作した、**実際に動く**サンプルサイトです。Next.js 15（App Router）の
静的書き出しで、全ページが端末上でそのまま動きます。

## この画面について

- **事業者は架空です。** 社名・人名・住所・電話番号・金額・在庫数は、この画面の
  ために用意したものです。実在の事業者・個人とは関係ありません。
- **入力は送信も保存もされません。** フォームの体裁をした画面はありますが、
  通信もしませんし、ブラウザにも残しません（下の「入力画面の作り」を参照）。
- **全ページ noindex です。** 架空の事業者が検索結果に出ないようにしています。
  `next.config.ts` の `headers()` と `src/app/layout.tsx` の `metadata.robots` の
  二重掛けです。robots.txt で Disallow してはいけません（クローラが noindex を
  読めなくなり、URL だけがインデックスされます）。

## 動かす

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # 本番と同じ静的書き出しで確認する
npm run typecheck            # tsc --noEmit
```

## 画面

| ルート | 画面 |
|---|---|
| `/` | NAGI トップ |
| `/admin` | スタッフのログイン |
| `/admin/inventory` | 空室・料金 |
| `/admin/reservations` | 予約一覧 |
| `/admin/reservations/detail` | 予約詳細 |
| `/admin/today` | 本日の状況 |
| `/reserve` | 宿泊予約 |
| `/reserve/manage` | 予約の確認・変更 |

## 入力画面の作り（意図的な制約）

この画面には、入力を扱う画面があっても次のものが**1つもありません**。体裁では
なく、仕組みとして持たせていません。

| 持たないもの | なぜ |
|---|---|
| `<form>` 要素 | `action` の無い form は、ハイドレート前に Enter を押すと現在の URL へ GET する。氏名・電話・メールがクエリ文字列に乗り、履歴・リファラ・アクセスログに残る。**架空の店でも、入力するのは実在の訪問者**である |
| `fetch` / Server Actions / `/api` | 送信先を持たない。持てば「送信されるかもしれない画面」になる |
| `localStorage` / `sessionStorage` / `cookie` | 訪問者の端末に何も残さない |
| 決済 SDK・カード番号の入力欄 | 決済の体裁は作らない |
| 実在のドメイン・電話番号・住所・地図 | メールは `@example.com`、電話は割り当てられない形式のみ |

ボタンの文字も、実際に起きることに合わせています（「送信する」ではなく
「入力内容を確認する」）。

## 素材

**写真と動画は生成画像です。**人体は1つも写していません。出所と条件は
[docs/credits.md](docs/credits.md) に1ファイル1行で書いてあります。
全点 Higgsfield 経由の `gpt_image_2` で生成していて、ライセンスは
Higgsfield Terms of Use（出力の権利は利用者に帰属・商用可・譲渡可）です。

配信している AVIF / WebP / MP4 / WebM に **C2PA は残っていません**（最適化変換で
機械的に落ちます）。`public/samples/nagi/` に AVIF と WebP の2系統で置いてあり、
`SitePhoto` が `<picture>` で AVIF を先に出します。Next.js の Image Optimizer は
通していません（1枚ずつ品質を詰めて書き出してあり、再エンコードすると
実測値と食い違うため）。

## 構成

```
src/
  app/
    layout.tsx      html/body・書体・.sample-shell（CSS 変数のスコープ）
    globals.css     Tailwind と基本の地
    site.css        このサイトのパレットと版面（.sample-nagi スコープ）
    page.tsx …      各ルート
  components/site/  8本のサンプルで共通の部品（写真・フォーム・検証・日付）
```

`src/app/layout.tsx` と各ルートの `layout.tsx` には
**overflow / transform / filter / backdrop-filter / contain / will-change を
付けないこと。** 1つでも付くと子孫の `position: sticky` が無言で効かなくなります
（管理画面のサイドバーと集計パネルが sticky です）。

---

制作: [Teciora](https://www.teciora.com/)
