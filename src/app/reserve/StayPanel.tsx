import { formatDotted, formatShort } from '@/components/site/calendar';
import { yen } from '@/components/site/format';
import { meal, roomType, stayTotal, type MealId, type RoomTypeId } from '../_data';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * 集計パネル「YOUR STAY」。予約画面と確認画面の両方に出る。
 *
 * ■ 選んだものと金額を**同時に**出す
 *   金額だけを出すと、何を選んだ結果なのかが分からない。客室・日程・人数・
 *   食事を同じ枠の中に並べ、その下に合計を置く。合計が変わったときに
 *   「どれを変えたから変わったのか」が枠の中で完結する。
 *
 * ■ 泊数が2泊以上のときだけ内訳を出す
 *   1泊なら合計＝単価なので、内訳は同じ数字の繰り返しになる。
 *   金・土と月〜水で単価が違うので、連泊では内訳がそのまま説明になる。
 *
 * ■ サーバーでもクライアントでも同じ値になる
 *   `stayTotal` は純粋関数で、端末時計も Intl も見ない。
 * ==========================================================================*/

type Props = {
  room: RoomTypeId;
  checkIn: string;
  checkOut: string;
  adults: number;
  mealId: MealId;
  /** 「お支払い：現地決済」に出す文言。 */
  paymentLabel: string;
  /**
   * この写真を先読みするか。**1ページ1枚まで**なので、呼び出し側が決める。
   *   予約フォーム … 客室一覧の先頭が先読み。ここは lazy
   *   予約の確認・変更 … 折りたたみの上の写真がこれ1枚。ここを先読み
   */
  eager?: boolean;
};

export function StayPanel({
  room,
  checkIn,
  checkOut,
  adults,
  mealId,
  paymentLabel,
  eager = false,
}: Props) {
  const type = roomType(room);
  const total = stayTotal({ type: room, checkIn, checkOut, adults, meal: mealId });
  const valid = total.nights > 0;

  return (
    <div className="border border-[var(--line)] bg-[var(--paper)]">
      <SitePhoto
        src={type.photo}
        width={680}
        height={510}
        eager={eager}
        className={`${type.tone} h-[150px] w-full`}
      />
      <div className="px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--sub)]">
          Your stay
        </p>
        <p className="nagi-display mt-2 text-[26px] leading-[1.2] text-[var(--green)]">
          {type.en}
        </p>
        <p className="mt-1 text-[14px] text-[var(--ink)]">{type.name}</p>
        <p className="mt-1 text-[12px] tabular-nums text-[var(--sub)]">
          {type.area}㎡ / 定員{type.capacity}名 / {type.feature}
        </p>

        <p className="mt-5 text-[13px] tabular-nums text-[var(--ink)]">
          {valid ? (
            <>
              {formatDotted(checkIn)} — {formatShort(checkOut)} / {total.nights}泊
            </>
          ) : (
            'チェックアウトはチェックインの翌日以降を選んでください'
          )}
        </p>
        <p className="mt-1 text-[13px] text-[var(--ink)]">
          大人{adults}名・1室 / {meal(mealId).label}
        </p>

        {valid && total.nights > 1 && (
          <ul className="mt-4 space-y-1 border-t border-[var(--line)] pt-3">
            {total.perNight.map((n) => (
              <li
                key={n.date}
                className="flex justify-between text-[12px] tabular-nums text-[var(--sub)]"
              >
                <span>{formatShort(n.date)}</span>
                <span>{yen(n.amount)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 flex items-baseline gap-3 border-t border-[var(--line)] pt-4">
          <span className="text-[19px] font-semibold text-[var(--ink)]">合計</span>
          <span className="nagi-display text-[28px] tabular-nums text-[var(--ink)]">
            {valid ? yen(total.total) : '—'}
          </span>
        </p>
        <p className="mt-2 text-[12px] leading-[1.8] text-[var(--sub)]">
          {adults}名・{valid ? total.nights : 0}泊の合計 / 税・サービス料込み
          <br />
          お支払い：{paymentLabel}
        </p>
      </div>
    </div>
  );
}
