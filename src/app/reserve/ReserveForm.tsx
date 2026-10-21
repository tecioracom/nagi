'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import {
  CheckField,
  SelectField,
  TextAreaField,
  TextField,
  ErrorSummary,
} from '@/components/site/fields';
import { StepBar } from '@/components/site/StepBar';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  SITE_SHELL,
} from '@/components/site/styles';
import { yen } from '@/components/site/format';
import { formatDotted, formatShort } from '@/components/site/calendar';
import {
  agreed,
  email as vEmail,
  listErrors,
  phone as vPhone,
  required,
  trim,
  type FieldError,
} from '@/components/site/validate';
import {
  CANCEL_POLICY,
  CHECK_IN_FROM,
  CHECK_OUT_BY,
  ETA_OPTIONS,
  MEALS,
  ROOM_TYPES,
  meal,
  roomType,
  stayTotal,
  type MealId,
  type RoomTypeId,
} from '../_data';
import { StayPanel } from './StayPanel';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * 宿泊予約フォーム。**この画面の終点は「確認」**。
 *
 * ■ 送らない・保存しない
 *   ボタンは「入力内容を確認する」。押すと入力チェックが走り、通れば
 *   同じルートのまま確認表示に切り替わる。「予約が完了しました」とは
 *   出さない——予約は成立していないので、それは事実と違う。
 *   押せないボタンを置いて「押せません」と書く形も採らない。
 *   **押せて、押した結果がちゃんと出る**ほうが、何ができるかが伝わる。
 *
 * ■ `<form>` を使わない
 *   `<form>` はハイドレート前に Enter を押されると、現在の URL へ GET する。
 *   氏名・メール・電話が**そのままクエリ文字列に載る**。URL は履歴にも
 *   リファラにもログにも残るので、起こせない形にしておく。
 *   `div role="group"` + `type="button"` だけで組む。
 *
 * ■ カード番号の入力欄を置かない
 *   書き出した画面にも無いが、置かない理由は「描かれていないから」ではない。
 *   公開されるページに決済の入力欄を置くと、**本物だと思った人が本物の番号を
 *   打つ**。支払いは方法の選択までにする。
 *
 * ■ 合計は4つの入力すべてで動く
 *   日程（曜日で単価が変わる）・人数・食事・客室タイプ。
 *   計算は `_data.ts` の純粋関数で、管理画面と同じものを使う。
 * ==========================================================================*/

const PAYMENTS = [
  { value: 'onsite', label: '現地でのお支払い（ご到着時・ご出発時）' },
  { value: 'prepay', label: '事前のお支払い（お手続きのご案内をお送りします）' },
] as const;
type PaymentId = (typeof PAYMENTS)[number]['value'];

const PAYMENT_SHORT: Record<PaymentId, string> = {
  onsite: '現地決済',
  prepay: '事前決済',
};

const FIELD_ORDER = [
  'checkIn',
  'checkOut',
  'adults',
  'room',
  'name',
  'email',
  'tel',
  'agree',
] as const;

const FIELD_LABELS: Record<string, string> = {
  checkIn: 'チェックイン',
  checkOut: 'チェックアウト',
  adults: '人数',
  room: '客室',
  name: 'お名前',
  email: 'メールアドレス',
  tel: '電話番号',
  agree: '宿泊条件への同意',
};

export function ReserveForm({
  initialRoom = 'suite',
}: {
  initialRoom?: RoomTypeId;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const summaryRef = useRef<HTMLDivElement>(null);

  const [checkIn, setCheckIn] = useState('2026-11-14');
  const [checkOut, setCheckOut] = useState('2026-11-15');
  const [adults, setAdults] = useState('2');
  const [mealId, setMealId] = useState<MealId>('both');
  const [room, setRoom] = useState<RoomTypeId>(initialRoom);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [eta, setEta] = useState('15:00');
  const [payment, setPayment] = useState<PaymentId>('onsite');
  const [request, setRequest] = useState('');
  const [agree, setAgree] = useState(false);

  /** 入力チェックの結果を出すのは、いちど確認を押してから。 */
  const [checked, setChecked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const adultsNum = Number(adults);
  const type = roomType(room);
  const total = stayTotal({ type: room, checkIn, checkOut, adults: adultsNum, meal: mealId });

  const errors: Record<string, FieldError> = {
    checkIn: required(checkIn, 'チェックイン'),
    checkOut:
      required(checkOut, 'チェックアウト') ??
      (total.nights <= 0
        ? 'チェックアウトはチェックインの翌日以降を選んでください。'
        : total.nights > 14
          ? '連泊は14泊までで承ります。'
          : null),
    adults:
      adultsNum > type.capacity
        ? `${type.name}の定員は${type.capacity}名です。人数か客室を変えてください。`
        : null,
    room: null,
    name: required(name, 'お名前'),
    email: vEmail(email),
    tel: vPhone(tel),
    agree: agreed(agree, '宿泊条件・個人情報の取り扱い'),
  };

  const items = checked ? listErrors(FIELD_ORDER, errors, FIELD_LABELS) : [];
  const err = (k: string) => (checked ? (errors[k] ?? null) : null);

  function onConfirm() {
    setChecked(true);
    const bad = FIELD_ORDER.some((k) => errors[k]);
    if (bad) {
      setConfirmed(false);
      // まとめへ焦点を移す。どの欄が引っかかったかを最初に読ませる。
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setConfirmed(true);
    window.requestAnimationFrame(() => {
      document.getElementById(id('confirm-head'))?.focus();
    });
  }

  /* ---------------------------------------------------------------- 確認 */
  if (confirmed) {
    return (
      <div className={`${SITE_SHELL} pb-24 pt-8 md:pt-12`}>
        <StepBar
          steps={['予約内容・お客様情報', '入力内容の確認']}
          current={2}
          className="mb-10"
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div>
            <h2
              id={id('confirm-head')}
              tabIndex={-1}
              className="nagi-display text-[38px] leading-[1.1] text-[var(--green)] md:text-[48px]"
            >
              Please check your details.
            </h2>
            <p className="mt-3 text-[20px] font-semibold text-[var(--ink)]">
              入力内容の確認
            </p>

            <div className="mt-6 border border-[var(--green)] bg-[var(--soft)] px-5 py-4">
              <p className="text-[14px] font-bold leading-[1.8] text-[var(--soft-ink)]">
                ここまでが確認です。ご予約はまだ確定していません。
              </p>
              <p className="mt-2 text-[13px] leading-[1.9] text-[var(--soft-ink)]">
                入力した内容は送信も保存もされません。ブラウザを閉じれば残りません。
              </p>
            </div>

            <dl className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              <Row label="ご宿泊">
                {formatDotted(checkIn)} — {formatShort(checkOut)} / {total.nights}泊
                <br />
                チェックイン {CHECK_IN_FROM}〜 / チェックアウト {CHECK_OUT_BY}
              </Row>
              <Row label="客室">
                {type.name}（{type.area}㎡ / 定員{type.capacity}名 / {type.feature}）
              </Row>
              <Row label="人数・食事">
                大人{adultsNum}名・1室 / {meal(mealId).label}
              </Row>
              <Row label="お名前">{trim(name)}</Row>
              <Row label="メールアドレス">{trim(email)}</Row>
              <Row label="電話番号">{trim(tel)}</Row>
              <Row label="到着予定時刻">{eta}</Row>
              <Row label="お支払い方法">
                {PAYMENTS.find((p) => p.value === payment)?.label}
              </Row>
              <Row label="ご要望">{trim(request) === '' ? 'なし' : trim(request)}</Row>
              <Row label="合計">
                <span className="text-[22px] font-semibold tabular-nums">
                  {yen(total.total)}
                </span>
                <br />
                <span className="text-[12px] text-[var(--sub)]">
                  {adultsNum}名・{total.nights}泊の合計 / 税・サービス料込み
                </span>
              </Row>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmed(false)}
                className={BTN_SECONDARY}
              >
                入力内容を修正する
                <span aria-hidden="true">&#8598;</span>
              </button>
              <a href="/" className={BTN_SECONDARY}>
                NAGI トップへ戻る
                <span aria-hidden="true">&#8599;</span>
              </a>
            </div>
          </div>

          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <StayPanel
              room={room}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adultsNum}
              mealId={mealId}
              paymentLabel={PAYMENT_SHORT[payment]}
            />
          </aside>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- 入力 */
  return (
    <div className={`${SITE_SHELL} pb-24 pt-8 md:pt-12`}>
      <StepBar
        steps={['予約内容・お客様情報', '入力内容の確認']}
        current={1}
        className="mb-10"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div role="group" aria-label="宿泊予約の入力">
          {items.length > 0 && (
            <div ref={summaryRef} className="mb-8">
              <ErrorSummary
                id={id('summary')}
                title={`入力を確認してください（${items.length}件）`}
                items={items}
                fieldId={(k) => id(k)}
              />
            </div>
          )}

          {/* 01 ご宿泊について */}
          <section aria-labelledby={id('h-stay')}>
            <h2
              id={id('h-stay')}
              className="flex items-baseline gap-4 text-[22px] text-[var(--ink)]"
            >
              <span className="text-[14px] tabular-nums text-[var(--sub)]">01</span>
              ご宿泊について
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                id={id('checkIn')}
                label="チェックイン"
                type="date"
                value={checkIn}
                onChange={setCheckIn}
                requiredMark
                error={err('checkIn')}
              />
              <TextField
                id={id('checkOut')}
                label="チェックアウト"
                type="date"
                value={checkOut}
                onChange={setCheckOut}
                requiredMark
                error={err('checkOut')}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <SelectField
                id={id('adults')}
                label="人数・客室"
                value={adults}
                onChange={setAdults}
                options={[
                  { value: '1', label: '大人1名 / 1室' },
                  { value: '2', label: '大人2名 / 1室' },
                  { value: '3', label: '大人3名 / 1室' },
                ]}
                error={err('adults')}
                hint="1名は2名料金の75%、3名めは1泊あたり ¥12,000 を加算します。"
              />
              <SelectField
                id={id('meal')}
                label="お食事"
                value={mealId}
                onChange={(v) => setMealId(v as MealId)}
                options={MEALS.map((m) => ({ value: m.id, label: m.label }))}
                hint={meal(mealId).note}
              />
            </div>
          </section>

          {/* 客室を選ぶ */}
          <section aria-labelledby={id('h-rooms')} className="mt-12">
            <h2 id={id('h-rooms')} className="text-[22px] text-[var(--ink)]">
              客室を選ぶ
            </h2>
            <p className="mt-2 text-[12px] text-[var(--sub)]">
              大人{adultsNum}名・{total.nights > 0 ? `${total.nights}泊` : '—'}・
              {meal(mealId).label} / 税・サービス料込み
            </p>

            <ul role="list" className="mt-5 grid gap-6 sm:grid-cols-3">
              {ROOM_TYPES.map((r, i) => {
                const selected = r.id === room;
                const rowTotal = stayTotal({
                  type: r.id,
                  checkIn,
                  checkOut,
                  adults: adultsNum,
                  meal: mealId,
                });
                const over = adultsNum > r.capacity;
                return (
                  <li key={r.id} className="flex flex-col">
                    <SitePhoto
                      src={r.photo}
                      width={680}
                      height={510}
                      eager={i === 0}
                      className={`${r.tone} aspect-[4/3] w-full`}
                    />
                    <h3 className="mt-4 text-[15px] font-semibold text-[var(--ink)]">
                      {r.name}
                    </h3>
                    <p className="mt-2 text-[12px] tabular-nums text-[var(--sub)]">
                      {r.area}㎡ / 定員{r.capacity}名 / {r.feature}
                    </p>
                    <p className="mt-2 flex-1 text-[20px] font-semibold tabular-nums text-[var(--ink)]">
                      {rowTotal.nights > 0 ? yen(rowTotal.total) : '—'}
                    </p>
                    {over && (
                      <p className="mt-2 text-[12px] font-semibold text-[var(--alert)]">
                        定員{r.capacity}名です
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setRoom(r.id)}
                      aria-pressed={selected}
                      className={
                        selected
                          ? 'mt-3 inline-flex min-h-[48px] w-full items-center justify-between border-2 border-[var(--green)] bg-[var(--paper)] px-4 text-[14px] font-semibold text-[var(--ink)]'
                          : 'mt-3 inline-flex min-h-[48px] w-full items-center justify-between bg-[var(--green)] px-4 text-[14px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]'
                      }
                    >
                      {selected ? '選択中' : 'この客室を選ぶ'}
                      <span aria-hidden="true">{selected ? '✓' : '↗'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 02 お客様情報 */}
          <section aria-labelledby={id('h-guest')} className="mt-12">
            <h2
              id={id('h-guest')}
              className="flex items-baseline gap-4 text-[22px] text-[var(--ink)]"
            >
              <span className="text-[14px] tabular-nums text-[var(--sub)]">02</span>
              お客様情報
            </h2>
            <p className="mt-2 text-[12px] text-[var(--sub)]">
              <span aria-hidden="true">*</span> は必須項目です
            </p>

            <div className="mt-5 space-y-5">
              <TextField
                id={id('name')}
                label="お名前"
                value={name}
                onChange={setName}
                placeholder="例：山田 花子"
                autoComplete="name"
                requiredMark
                error={err('name')}
              />
              <TextField
                id={id('email')}
                label="メールアドレス"
                type="email"
                inputMode="email"
                value={email}
                onChange={setEmail}
                placeholder="例：hanako@example.com"
                autoComplete="email"
                requiredMark
                error={err('email')}
              />
              <TextField
                id={id('tel')}
                label="電話番号"
                type="tel"
                inputMode="tel"
                value={tel}
                onChange={setTel}
                placeholder="例：050-0123-4567"
                autoComplete="tel"
                requiredMark
                error={err('tel')}
                hint="ご到着が遅れるときのご連絡に使います。"
              />
              <SelectField
                id={id('eta')}
                label="到着予定時刻"
                value={eta}
                onChange={setEta}
                options={ETA_OPTIONS.map((t) => ({ value: t, label: t }))}
                hint={`チェックインは ${CHECK_IN_FROM} からです。`}
              />
              {/*
                支払いは**方法の選択まで**。カード番号の入力欄は置かない。
                ラジオは <fieldset> ではなく role="radiogroup" で組む
                （@tailwindcss/forms が fieldset の余白を潰すため）。
              */}
              <div role="radiogroup" aria-labelledby={id('payment-label')}>
                <p
                  id={id('payment-label')}
                  className="block text-[13px] font-semibold leading-[1.5] text-[var(--ink)]"
                >
                  お支払い方法
                </p>
                <div className="mt-2 space-y-2">
                  {PAYMENTS.map((p) => (
                    <label
                      key={p.value}
                      className="flex min-h-[44px] items-center gap-3 border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2 text-[14px] leading-[1.6] text-[var(--ink)]"
                    >
                      <input
                        type="radio"
                        checked={payment === p.value}
                        onChange={() => setPayment(p.value)}
                        className="h-[16px] w-[16px] shrink-0 border-[var(--line-strong)] text-[var(--green)] focus:ring-0"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <TextAreaField
                id={id('request')}
                label="ご要望（任意）"
                value={request}
                onChange={setRequest}
                placeholder="例：食物アレルギーについて"
                rows={3}
              />
            </div>
          </section>

          {/* 条件と同意 */}
          <div className="mt-10 border-t border-[var(--line)] pt-6">
            <p className="text-[13px] leading-[1.9] text-[var(--sub)]">
              お支払いはご到着時またはご出発時に承ります。カード番号はこの画面では承りません。
            </p>
            <ul className="mt-3 space-y-1 text-[12px] leading-[1.8] text-[var(--sub)]">
              {CANCEL_POLICY.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <CheckField
              id={id('agree')}
              className="mt-5"
              checked={agree}
              onChange={setAgree}
              error={err('agree')}
              label="宿泊条件・個人情報の取り扱いに同意する"
            />

            <button type="button" onClick={onConfirm} className={`${BTN_PRIMARY} mt-6`}>
              入力内容を確認する
              <span aria-hidden="true">&#8599;</span>
            </button>
            <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
              押すと入力内容の確認に進みます。ここでご予約は確定しません。
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <StayPanel
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adultsNum}
            mealId={mealId}
            paymentLabel={PAYMENT_SHORT[payment]}
          />
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-[13px] font-semibold text-[var(--sub)]">{label}</dt>
      <dd className="text-[14px] leading-[1.9] text-[var(--ink)]">{children}</dd>
    </div>
  );
}
