# NAGI

瀬戸内の海辺の宿のウェブサイト。瀬戸内の海に面した全8室の宿。客室を選んで日付を入れるところから、
当日フロントが開く画面までをひと続きで作った。

公開先: https://nagi.sample.teciora.com

## 画面

| ルート | |
|---|---|
| `/` | NAGI トップ |
| `/admin` | スタッフのログイン |
| `/admin/inventory` | 空室・料金 |
| `/admin/reservations` | 予約一覧 |
| `/admin/reservations/detail` | 予約詳細 |
| `/admin/today` | 本日の状況 |
| `/reserve` | 宿泊予約 |
| `/reserve/manage` | 予約の確認・変更 |

## 作りで決めたこと

### ヒーローは8秒の無音ループ

海だけが動いて、ほかは止まっている。AV1 と H.264 の2系統で出し、
`prefers-reduced-motion: reduce` のときは静止画に切り替える。
音声トラックは持たせていない。

### 予約と管理で同じ在庫を見る

客が見る空室と、フロントが見る8室×7日のカレンダーは同じ定数から導く。
片方だけ直せる形にしていない。

## 入力を扱う画面について

入力欄のある画面はあるが、`<form>` 要素を1つも置いていない。`action` の無い
form は、ハイドレートが終わる前に Enter を押すと現在の URL へ GET する。
氏名・電話・メールがクエリ文字列に乗り、履歴・リファラ・アクセスログに残る。
送信先を持たない画面にその穴を残す理由がないので、form ごと置いていない。

同じ理由で、`fetch` も Server Actions も `localStorage` も持たせていない。
ボタンの文字も実際に起きることに合わせてある（「送信する」ではなく
「入力内容を確認する」）。

`scripts/check.sh` がこれを機械で確かめる。15群あり、27通りの違反を注入して
全部赤くなることを確認してある。

```bash
bash scripts/check.sh
```

## 動かす

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # 本番と同じ静的書き出し
npm run typecheck
```

Next.js 15 の App Router。全8ルートを静的に書き出す。欧文の見出しに Cormorant Garamond を1書体だけ読む。和文は端末の書体に任せる。

main に push すると GitHub Actions が Vercel へ出す（`.github/workflows/deploy.yml`）。

## 素材

写真は AI 生成（Higgsfield 経由の `gpt_image_2`）。人体は写していない。
出所と条件は [docs/credits.md](docs/credits.md) に1ファイル1行で書いてある。
`public/samples/nagi/` に13ファイル、AVIF と WebP の2系統で置いてある。

## 書いてあることについて

この事業者は架空。社名・人名・住所・電話番号・金額・在庫数はこの画面のために
用意したもので、実在の事業者とは関係ない。全ページ noindex にしてある。

---

制作: [Teciora](https://www.teciora.com/)
