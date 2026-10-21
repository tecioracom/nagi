#!/usr/bin/env bash
# =============================================================================
# このサンプルサイトが守ると決めたことを、機械で確かめる。
#
# 守ると決めたことは、下の各群の見出しがそのまま一覧になっている。
# ここはその**裏取り**で、人が目で見て気づけない壊れ方（宣言ごと捨てられる
# CSS、ハイドレート前の GET、配信ファイルと食い違う codecs 文字列）を
# 捕まえるためにある。
#
#   bash scripts/check.sh
#
# [8] [9] [12] [13] は **配信される HTML そのもの** を見る。`.next` が無ければ
# 自動で build する（`next build` は全ページを静的な .html に書き出す）。
#
# 新しい検査を足すときは、まず**わざと破って赤くなることを確かめる**こと。
# 常に緑の検査は、無いのと同じどころか「見てあるつもり」を作るので害になる。
# =============================================================================
set -uo pipefail
cd "$(dirname "$0")/.."

NG=0; OK=0
# 端末に出すときだけ色を付ける。CI やパイプの先では素のまま出す
# （ログを grep する側が色コードに引っかからないようにするため）。
if [ -t 1 ]; then
  R=$'\e[31m'; G=$'\e[32m'; C=$'\e[36m'; Y=$'\e[33m'; Z=$'\e[0m'
else
  R=''; G=''; C=''; Y=''; Z=''
fi

grp()  { printf '\n%s%s%s\n' "$C" "$1" "$Z"; }
ok()   { OK=$((OK+1)); printf '  %sOK: %s%s\n' "$G" "$1" "$Z"; }
ng()   { NG=$((NG+1)); printf '  %sNG: %s%s\n' "$R" "$1" "$Z"; [ -n "${2:-}" ] && printf '%s\n' "$2" | sed 's/^/      /'; }
skip() { printf '  %s--: %s%s\n' "$Y" "$1" "$Z"; }

# 走査対象。コメントは落とす（注記の中の語で赤くならないように）。
SRC=$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) | sort)
code() { # ファイルを1つ受け取り、コメントを除いた中身を出す
  # **文字列リテラルを先に食わせて守る**こと。素朴に s{//[^\n]*}{} とすると
  # "https://js.stripe.com/v3" の // 以降が消え、禁じたはずの SDK 名や
  # 外部 URL が検査をすり抜ける（実際にすり抜けた）。
  perl -0777 -pe '
    s{
        ( "(?:[^"\\]|\\.)*"            # 二重引用符の文字列
        | \x27(?:[^\x27\\]|\\.)*\x27  # 単一引用符の文字列
        | `(?:[^`\\]|\\.)*`            # テンプレート文字列
        )
      | //[^\n]*                        # 行コメント
      | /\*.*?\*/                       # 塊コメント
    }{ defined $1 ? $1 : "" }gexs
  ' "$1"
}
hits() { # パターンを全ファイルのコメント除去後の中身から探す
  local pat="$1" f out=''
  for f in $SRC; do
    local m; m=$(code "$f" | grep -nE "$pat" | sed "s|^|$f:|")
    [ -n "$m" ] && out="$out$m"$'\n'
  done
  printf '%s' "$out" | grep -v '^$'
}
want_none() { # [見出し] [パターン]
  local m; m=$(hits "$2")
  if [ -z "$m" ]; then ok "$1"; else ng "$1" "$m"; fi
}

# ---------------------------------------------------------------- 静的 HTML
# [8] [9] [12] [13] は配信される HTML そのものを見るので build が要る。
# **build に失敗しても静的な検査は最後まで走らせる。** 途中で exit すると、
# 1行の書き損じで 20 以上の検査が黙って飛ぶ（それで実際に見逃した）。
BUILT=1
if [ ! -d .next/server/app ]; then
  printf '%s.next が無いので build します（[8] [9] [12] [13] が見ます）%s\n' "$Y" "$Z"
  LOG=$(mktemp)
  if ! npx next build >"$LOG" 2>&1; then
    BUILT=0
    printf '%sbuild に失敗しました。配信 HTML を見る検査は飛ばします%s\n' "$R" "$Z"
    tail -15 "$LOG" | sed 's/^/      /'
  fi
  rm -f "$LOG"
fi
if [ "$BUILT" = "1" ]; then
  HTML=$(find .next/server/app -name '*.html' ! -name '_not-found.html' | sort)
  PAGES=$(printf '%s\n' "$HTML" | grep -c . || true)
  # **0枚なら build が中途半端。** ここで止めないと、HTML を見る検査が
  # 「対象ゼロ件だから違反ゼロ件」で全部緑になる（実際にそうなった）。
  if [ "$PAGES" = "0" ]; then
    BUILT=0
    printf '%s.next/server/app に HTML が1枚も無い（build が中途半端）%s\n' "$R" "$Z"
  fi
else
  PAGES=0
fi
[ "$BUILT" = "0" ] && HTML=''
# 配信 HTML を見る群はこれで囲う。build が無ければ飛ばし、黙って緑にしない。
html_checks() { [ "$BUILT" = "1" ] && return 0; skip "$1（build に失敗したので見ていない）"; return 1; }

if [ "$BUILT" = "0" ]; then
  grp "[0] build"
  ng "build が通り、全ページの HTML が書き出されている" \
     "npx next build を手で走らせて、何が落ちているか確かめること"
fi

grp "[1] フォーム要素と送信先を持たない"
# action の無い <form> は、ハイドレート前に Enter を押すと現在の URL へ GET する。
# 氏名・電話・メールがクエリ文字列に乗り、履歴・リファラ・アクセスログに残る。
want_none "<form> 要素が1つも無い"            '<[Ff]orm[ >/]'
want_none "action= を書いていない"            '(^|[^a-zA-Z])action=' 
want_none "method= を書いていない"            '(^|[^a-zA-Z])method='

grp "[2] 通信しない"
want_none "fetch / XHR / sendBeacon / WebSocket / EventSource が無い" \
  '\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|new EventSource|\.ajax\('

grp "[3] サーバ側の受け口を持たない"
want_none "'use server' が無い"               "'use server'|\"use server\""
if [ -d src/app/api ] || find src/app -name 'route.ts' -o -name 'route.tsx' 2>/dev/null | grep -q .; then
  ng "/api ルートが無い" "$(find src/app -path '*api*' -o -name 'route.ts*' | sed 's/^/  /')"
else ok "/api ルートが無い"; fi

grp "[4] 訪問者の端末に何も残さない"
want_none "localStorage / sessionStorage / cookie / indexedDB が無い" \
  'localStorage|sessionStorage|document\.cookie|indexedDB|\bcaches\b'

grp "[5] 決済の仕組みを持たない"
want_none "決済 SDK の名前が無い" \
  'stripe|paypal|braintree|pay\.jp|payjp|komoju|checkout\.js|Square\(|squareup'
want_none "カード番号の入力欄が無い" \
  'autocomplete="cc-|cardnumber|card-number|cvc|cvv|securitycode|expiry'

grp "[6] 連絡先は架空のものだけ"
BADMAIL=$(hits '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+' | grep -vE '@example\.(com|net|org)|@[A-Za-z0-9.-]*\$\{' || true)
if [ -z "$BADMAIL" ]; then ok "メールは example.com のみ"; else ng "メールは example.com のみ" "$BADMAIL"; fi
want_none "tel: リンクが無い"  'href="tel:|href=\{`tel:'
# 電気通信番号計画（令和元年総務省告示第6号）: 英字は十進数字（C は 0 を除く）。
# つまり 050-0XXX-XXXX は割り当てられない = 実在の誰にも繋がらない。
BADTEL=$(hits '0[0-9]{1,4}-[0-9]{2,4}-[0-9]{4}' | grep -vE '050-0[0-9]{3}-[0-9]{4}' || true)
if [ -z "$BADTEL" ]; then ok "電話は割り当てられない 050-0 形式のみ"; else ng "電話は割り当てられない 050-0 形式のみ" "$BADTEL"; fi

grp "[7] 実在の場所を指さない"
want_none "地図の埋め込みが無い" 'google\.com/maps|maps\.google|openstreetmap|mapbox|<iframe'
BADURL=$(hits 'https?://[A-Za-z0-9.-]+' | grep -vE 'teciora\.com|example\.(com|net|org)|www\.w3\.org|schema\.org' || true)
if [ -z "$BADURL" ]; then ok "外部 URL は teciora.com と example.com のみ"; else ng "外部 URL は teciora.com と example.com のみ" "$BADURL"; fi

grp "[8] 断り書きの帯が全ページにある（配信 HTML を見る）"
if html_checks "[8] 断り書きの帯"; then
MISS=''
for f in $HTML; do
  grep -q 'この画面についての断り書き' "$f" || MISS="$MISS$f"$'\n'
done
if [ -z "$MISS" ]; then ok "全 $PAGES ページに帯がある"; else ng "全ページに帯がある" "$MISS"; fi
# 配色スコープの中に入れると、このサイトのパレットを継承して帯に見えなくなる
want_none "帯を配色スコープの中に入れていない" 'sample-[a-z]+[^>]*>[^<]*<SiteFooter'
fi

grp "[9] noindex が二重に掛かっている"
grep -q "X-Robots-Tag" next.config.ts && grep -q "noindex" next.config.ts \
  && ok "next.config.ts の headers() で付けている" || ng "next.config.ts の headers() で付けている"
grep -q "robots:" src/app/layout.tsx && grep -q "index: false" src/app/layout.tsx \
  && ok "layout.tsx の metadata で付けている" || ng "layout.tsx の metadata で付けている"
# robots.txt で Disallow すると、クローラが noindex を読めず URL だけが載る
if [ -f public/robots.txt ] && grep -q "Disallow" public/robots.txt; then
  ng "robots.txt で Disallow していない" "public/robots.txt"
else ok "robots.txt で Disallow していない"; fi
if html_checks "[9] 配信 HTML の robots メタ"; then
  NOI=$(printf '%s\n' "$HTML" | while read -r f; do [ -n "$f" ] && grep -ql 'name="robots"' "$f" || printf '%s\n' "$f"; done | grep -c . || true)
  [ "$NOI" = "0" ] && ok "配信 HTML の全ページに robots メタがある" \
    || ng "配信 HTML の全ページに robots メタがある" "$NOI ページに無い"
fi

grp "[10] 別タブで開かない"
want_none 'target="_blank" が無い' 'target="_blank"|target=\{.?_blank'

grp "[11] sticky を壊す性質を包み div に付けていない"
# overflow / transform / filter / backdrop-filter / contain / will-change の
# どれか1つでも祖先に付くと、子孫の position: sticky が無言で効かなくなる。
BAD11=''
for f in $(find src/app -name 'layout.tsx'); do
  m=$(code "$f" | grep -nE 'overflow-|transform|filter|backdrop-|contain-|will-change' | sed "s|^|$f:|")
  [ -n "$m" ] && BAD11="$BAD11$m"$'\n'
done
if [ -z "$BAD11" ]; then ok "layout.tsx の包み div は素のまま"; else ng "layout.tsx の包み div は素のまま" "$BAD11"; fi

grp "[12] 先読みは1ページ1枚まで（配信 HTML を見る）"
if html_checks "[12] 先読み"; then
# 折りたたみの上の1枚だけを eager にする。2枚以上にすると初期表示のバイト数が
# 歯止めを失う。lazy が付いていない <img> はすべて eager として数える。
BAD12=''
for f in $HTML; do
  n=$(grep -o '<img[^>]*>' "$f" | grep -vc 'loading="lazy"' || true)
  [ "${n:-0}" -gt 1 ] && BAD12="$BAD12$f: ${n}枚"$'\n'
done
if [ -z "$BAD12" ]; then ok "どのページも先読みは1枚以下"; else ng "どのページも先読みは1枚以下" "$BAD12"; fi
fi

grp "[13] 動画"
VID=$(find public -name '*.mp4' -o -name '*.webm' | sort)
if [ -z "$VID" ]; then
  want_none "<video> / <audio> を書いていない" '<video|<audio'
  ok "動画を持たないサイト（素材も無い）"
else
  for v in $VID; do
    if ! command -v ffprobe >/dev/null; then skip "$v の中身（ffprobe が無い）"; continue; fi
    A=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$v" | grep -c . || true)
    [ "$A" = "0" ] && ok "$(basename "$v"): 音声トラック0本" || ng "$(basename "$v"): 音声トラック0本" "$A 本ある"
  done
  for f in $HTML; do
    grep -q '<video' "$f" || continue
    # React は autoPlay / playsInline をキャメルケースのまま書き出す
    # （HTML の属性名は構文解析時に小文字化されるので動作は正しい）。grep は -i で見る。
    for a in autoplay muted loop playsinline preload poster; do
      grep -qi "<video[^>]*$a" "$f" || ng "$(basename "$f") の <video> に $a がある"
    done
    if grep -qi '<video[^>]*controls' "$f"; then
      ng "$(basename "$f") の <video> に controls を付けていない"
    else
      ok "$(basename "$f") の <video>: autoplay muted loop playsinline preload poster・controls 無し"
    fi
  done
  # <source type="…codecs=…"> が実ファイルの中身と合っているか
  for f in $HTML; do
    grep -o '<source[^>]*>' "$f" 2>/dev/null | grep 'codecs' | while read -r s; do
      src=$(printf '%s' "$s" | sed -n 's/.*src="\([^"]*\)".*/\1/p')
      cod=$(printf '%s' "$s" | sed -n 's/.*codecs=\\*"\{0,1\}\([^"\\]*\).*/\1/p')
      real="public$src"
      [ -f "$real" ] || { ng "$src が public に無い"; continue; }
      vc=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$real")
      case "$cod:$vc" in
        *av01*:av1|*av1*:av1|*avc1*:h264|*h264*:h264) ok "$(basename "$src"): codecs=$cod は中身($vc)と一致" ;;
        *) ng "$(basename "$src"): codecs=$cod が中身($vc)と食い違う" ;;
      esac
    done
  done
fi

grp "[14] CSS 変数に不透明度修飾子を付けていない"
# text-[var(--x)]/80 は rgb(var(--x) / 0.8) に展開される。--x が #RRGGBB だと
# 不正な値になって**宣言ごと捨てられ**、文字は親の色を継ぐ（暗地に暗文字）。
BAD14=$(grep -rnoE '\[var\(--[a-z0-9-]+\)\]/[0-9]+' src --include='*.tsx' --include='*.ts' || true)
if [ -z "$BAD14" ]; then ok "CSS変数への不透明度修飾子が無い"; else ng "CSS変数への不透明度修飾子が無い" "$BAD14"; fi

grp "[15] 素材がコードと双方向で一致"
# 置いてあるのに使われていない素材（消し忘れ）と、
# 参照しているのに無い素材（404）の両方を見る。片方だけでは台帳にならない。
#
# 素材の道は SitePhoto / SiteVideo が `/samples/<ここ>` と組み立てる。
# 書き方は2通りある: JSX 属性は二重引用符（src="nagi/sea"）、
# データ定義は単一引用符（photo: 'nagi/room-1'）。**両方**拾うこと。
USED=$(grep -rhoE "[\"']([a-z0-9]+/[a-z0-9-]+)[\"']" src --include='*.tsx' --include='*.ts' \
       | tr -d "\"'" | sort -u \
       | while read -r u; do [ -d "public/samples/$(dirname "$u")" ] && printf '%s\n' "$u"; done)
MISS15=''; ORPH=''
for u in $USED; do
  ls public/samples/"$u".* >/dev/null 2>&1 || MISS15="$MISS15  参照しているのに無い: $u"$'\n'
done
for f in $(find public/samples -type f \( -name '*.avif' -o -name '*.webp' -o -name '*.mp4' -o -name '*.webm' \) | sort); do
  key=$(printf '%s' "$f" | sed 's|public/samples/||; s|\.[a-z0-9]*$||')
  # 動画の poster は SiteVideo が `${base}-poster.webp` と組み立てるので、
  # 文字列としては現れない。元の動画が使われていれば poster も使われている。
  stem=$(printf '%s' "$key" | sed 's/-poster$//')
  printf '%s\n' "$USED" | grep -qx "$key"  && continue
  printf '%s\n' "$USED" | grep -qx "$stem" && continue
  ORPH="$ORPH  使われていない: $f"$'\n'
done
NUSED=$(printf '%s\n' "$USED" | grep -c . || true)
NFILE=$(find public/samples -type f | grep -c . || true)
if [ -z "$MISS15$ORPH" ]; then
  ok "素材 ${NFILE}ファイル / 参照 ${NUSED}件が双方向で一致"
else
  ng "素材とコードが双方向で一致" "$MISS15$ORPH"
fi

# ------------------------------------------------------------------- まとめ
printf '\n'
if [ "$NG" = "0" ]; then printf '%s検査: すべて通過（OK %d / ページ %d）%s\n' "$G" "$OK" "$PAGES" "$Z"; exit 0
else printf '%s検査: NG %d / OK %d%s\n' "$R" "$NG" "$OK" "$Z"; exit 1; fi
