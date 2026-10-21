'use client';

import { useId, useRef, useState } from 'react';
import {
  ErrorSummary,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/site/fields';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  SITE_SHELL,
  TAG,
} from '@/components/site/styles';
import { signedYen, yen } from '@/components/site/format';
import { formatDotted, formatShort } from '@/components/site/calendar';
import {
  email as vEmail,
  listErrors,
  phone as vPhone,
  required,
  trim,
  type FieldError,
} from '@/components/site/validate';
import {
  CHECK_IN_FROM,
  CHECK_OUT_BY,
  ETA_OPTIONS,
  GUEST_0842,
  MEALS,
  RESERVATIONS,
  ROOM_TYPES,
  bookingNumber,
  freeRooms,
  meal,
  reservationTotal,
  roomType,
  stayTotal,
  typeOfRoom,
  type MealId,
} from '../../_data';
import { StayPanel } from '../StayPanel';

/* ============================================================================
 * 予約の確認・変更。**保存はしない。終点は「変更内容の確認」。**
 *
 * ■ 変更は、押す前から見えていること
 *   「変更を保存」を押してから差分が出るのでは遅い。押す前に
 *   「どこを、何から何に変えたか」と「差額」を出す。書き出した画面が
 *   そうなっている（到着予定時刻を 15:00 → 17:00 に変更しています）。
 *
 * ■ 日程を変えたら、空室と料金を先に見せる
 *   宿の都合（空いているか）と客の都合（いくらになるか）は別の話なので、
 *   ボタンを1つ置いて、両方を同じ枠に出す。
 *
 * ■ 予約番号で照会する入口は作っていない
 *   照会には予約番号と姓が要り、どちらも入力させると「当たるまで試せる」
 *   口を公開することになる。見本では1件を開いた状態から始める。
 * ==========================================================================*/

const R = RESERVATIONS[0]; // 0842 山田様

const FIELD_ORDER = ['checkIn', 'checkOut', 'name', 'email', 'tel'] as const;
const FIELD_LABELS: Record<string, string> = {
  checkIn: 'チェックイン',
  checkOut: 'チェックアウト',
  name: 'お名前',
  email: 'メールアドレス',
  tel: '電話番号',
};

export function ManageForm() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const summaryRef = useRef<HTMLDivElement>(null);

  const type = typeOfRoom(R.room);
  const savedTotal = reservationTotal(R);

  const [checkIn, setCheckIn] = useState(R.checkIn);
  const [checkOut, setCheckOut] = useState(R.checkOut);
  const [adults, setAdults] = useState(String(R.adults));
  const [mealId, setMealId] = useState<MealId>(R.meal);
  const [name, setName] = useState<string>(GUEST_0842.name);
  const [email, setEmail] = useState<string>(GUEST_0842.email);
  const [tel, setTel] = useState<string>(GUEST_0842.tel);
  const [eta, setEta] = useState(R.eta);
  const [request, setRequest] = useState<string>(GUEST_0842.request);

  const [showRooms, setShowRooms] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const adultsNum = Number(adults);
  const total = stayTotal({ type, checkIn, checkOut, adults: adultsNum, meal: mealId });
  const diffYen = total.nights > 0 ? total.total - savedTotal : 0;

  const errors: Record<string, FieldError> = {
    checkIn: required(checkIn, 'チェックイン'),
    checkOut:
      required(checkOut, 'チェックアウト') ??
      (total.nights <= 0
        ? 'チェックアウトはチェックインの翌日以降を選んでください。'
        : null),
    name: required(name, 'お名前'),
    email: vEmail(email),
    tel: vPhone(tel),
  };
  const items = checked ? listErrors(FIELD_ORDER, errors, FIELD_LABELS) : [];
  const err = (k: string) => (checked ? (errors[k] ?? null) : null);

  /** 保存済みの値と、いまの入力の差。押す前から出す。 */
  const changes: { label: string; from: string; to: string }[] = [];
  if (checkIn !== R.checkIn) {
    changes.push({ label: 'チェックイン', from: formatDotted(R.checkIn), to: formatDotted(checkIn) });
  }
  if (checkOut !== R.checkOut) {
    changes.push({ label: 'チェックアウト', from: formatDotted(R.checkOut), to: formatDotted(checkOut) });
  }
  if (adultsNum !== R.adults) {
    changes.push({ label: '人数', from: `大人${R.adults}名`, to: `大人${adultsNum}名` });
  }
  if (mealId !== R.meal) {
    changes.push({ label: 'お食事', from: meal(R.meal).label, to: meal(mealId).label });
  }
  if (trim(name) !== GUEST_0842.name) {
    changes.push({ label: 'お名前', from: GUEST_0842.name, to: trim(name) });
  }
  if (trim(email) !== GUEST_0842.email) {
    changes.push({ label: 'メールアドレス', from: GUEST_0842.email, to: trim(email) });
  }
  if (trim(tel) !== GUEST_0842.tel) {
    changes.push({ label: '電話番号', from: GUEST_0842.tel, to: trim(tel) });
  }
  if (eta !== R.eta) {
    changes.push({ label: '到着予定時刻', from: R.eta, to: eta });
  }
  if (trim(request) !== GUEST_0842.request) {
    changes.push({ label: 'ご要望', from: GUEST_0842.request, to: trim(request) || 'なし' });
  }

  function onConfirm() {
    setChecked(true);
    if (FIELD_ORDER.some((k) => errors[k])) {
      setConfirmed(false);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setConfirmed(true);
    window.requestAnimationFrame(() => {
      document.getElementById(id('result'))?.focus();
    });
  }

  return (
    <div className={`${SITE_SHELL} pb-24 pt-10`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--line)] pb-4 text-[13px]">
        <span className="tabular-nums text-[var(--sub)]">
          予約番号 {bookingNumber(R.id)}
        </span>
        <span className={TAG}>予約確定</span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div role="group" aria-label="予約内容の確認・変更">
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

          <section aria-labelledby={id('h-stay')}>
            <h2 id={id('h-stay')} className="text-[22px] text-[var(--ink)]">
              ご宿泊日・人数
            </h2>
            <p className="mt-2 text-[13px] text-[var(--sub)]">
              {roomType(type).name}（{roomType(type).area}㎡ / 定員
              {roomType(type).capacity}名）／ {R.room}号室
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                id={id('checkIn')}
                label="チェックイン"
                type="date"
                value={checkIn}
                onChange={setCheckIn}
                error={err('checkIn')}
              />
              <TextField
                id={id('checkOut')}
                label="チェックアウト"
                type="date"
                value={checkOut}
                onChange={setCheckOut}
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
                ]}
              />
              <SelectField
                id={id('meal')}
                label="お食事"
                value={mealId}
                onChange={(v) => setMealId(v as MealId)}
                options={MEALS.map((m) => ({ value: m.id, label: m.label }))}
              />
            </div>

            <p className="mt-4 text-[13px] leading-[1.9] text-[var(--sub)]">
              日程・人数の変更は、空室と料金を確認してから承ります。
            </p>
            <button
              type="button"
              onClick={() => setShowRooms(true)}
              className={`${BTN_PRIMARY} mt-4`}
            >
              変更後の空室・料金を確認
              <span aria-hidden="true">&#8599;</span>
            </button>

            {showRooms && (
              <div className="mt-5 border border-[var(--line)] bg-[var(--paper)] p-5">
                <h3 className="text-[15px] font-bold text-[var(--ink)]">
                  {total.nights > 0
                    ? `${formatDotted(checkIn)} — ${formatShort(checkOut)} / ${total.nights}泊 の空室`
                    : '日程を確認してください'}
                </h3>
                {total.nights > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {ROOM_TYPES.map((t) => {
                      const free = freeRooms(t.id, checkIn, checkOut, R.id);
                      const rowTotal = stayTotal({
                        type: t.id,
                        checkIn,
                        checkOut,
                        adults: adultsNum,
                        meal: mealId,
                      }).total;
                      return (
                        <li
                          key={t.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2 text-[13px]"
                        >
                          <span className="text-[var(--ink)]">{t.name}</span>
                          <span className="tabular-nums text-[var(--sub)]">
                            {free.length > 0 ? `残り${free.length}室` : '満室'} /{' '}
                            {yen(rowTotal)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-[var(--alert)]">
                    チェックアウトはチェックインの翌日以降を選んでください。
                  </p>
                )}
                <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
                  客室タイプのご変更はフロントで承ります。お電話またはメールでご連絡ください。
                </p>
              </div>
            )}
          </section>

          <section aria-labelledby={id('h-guest')} className="mt-12">
            <h2 id={id('h-guest')} className="text-[22px] text-[var(--ink)]">
              お客様情報
            </h2>
            <div className="mt-5 space-y-5">
              <TextField
                id={id('name')}
                label="お名前"
                value={name}
                onChange={setName}
                error={err('name')}
              />
              <TextField
                id={id('email')}
                label="メールアドレス"
                type="email"
                inputMode="email"
                value={email}
                onChange={setEmail}
                error={err('email')}
              />
              <TextField
                id={id('tel')}
                label="電話番号"
                type="tel"
                inputMode="tel"
                value={tel}
                onChange={setTel}
                error={err('tel')}
              />
              <SelectField
                id={id('eta')}
                label="到着予定時刻"
                value={eta}
                onChange={setEta}
                options={ETA_OPTIONS.map((t) => ({ value: t, label: t }))}
                hint={`チェックインは ${CHECK_IN_FROM} から、チェックアウトは ${CHECK_OUT_BY} までです。`}
              />
              <TextAreaField
                id={id('request')}
                label="ご要望"
                value={request}
                onChange={setRequest}
                rows={3}
              />
            </div>
          </section>

          {/* 差分。押す前から出す。 */}
          <div className="mt-10 border-t border-[var(--line)] pt-6">
            {changes.length === 0 ? (
              <p className="text-[13px] text-[var(--sub)]">
                変更はまだありません。項目を書き換えると、ここに変更前と変更後が出ます。
              </p>
            ) : (
              <div className="border border-[var(--green)] bg-[var(--soft)] px-5 py-4">
                <p className="text-[14px] font-bold text-[var(--soft-ink)]">
                  未確認の変更が{changes.length}件あります
                </p>
                <ul className="mt-2 space-y-1">
                  {changes.map((c) => (
                    <li
                      key={c.label}
                      className="text-[13px] leading-[1.8] text-[var(--soft-ink)]"
                    >
                      {c.label}：{c.from} → {c.to}
                    </li>
                  ))}
                </ul>
                {diffYen !== 0 && (
                  <p className="mt-2 text-[13px] font-bold tabular-nums text-[var(--soft-ink)]">
                    差額 {signedYen(diffYen)}（{yen(savedTotal)} → {yen(total.total)}）
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onConfirm}
              className={`${BTN_PRIMARY} mt-6`}
            >
              変更内容を確認する
              <span aria-hidden="true">&#8599;</span>
            </button>
            <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
              押すと変更内容の確認に進みます。ここで変更は確定しません。
            </p>

            {confirmed && (
              <div
                id={id('result')}
                tabIndex={-1}
                className="mt-6 border border-[var(--line-strong)] bg-[var(--paper)] px-5 py-5"
              >
                <h3 className="text-[17px] font-bold text-[var(--ink)]">
                  変更内容の確認
                </h3>
                {changes.length === 0 ? (
                  <p className="mt-2 text-[13px] leading-[1.9] text-[var(--sub)]">
                    変更されている項目はありません。予約内容は
                    {formatDotted(R.checkIn)} — {formatShort(R.checkOut)} / 大人
                    {R.adults}名・{yen(savedTotal)} のままです。
                  </p>
                ) : (
                  <dl className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                    {changes.map((c) => (
                      <div
                        key={c.label}
                        className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6"
                      >
                        <dt className="text-[13px] font-semibold text-[var(--sub)]">
                          {c.label}
                        </dt>
                        <dd className="text-[14px] text-[var(--ink)]">
                          {c.from} → <strong>{c.to}</strong>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {diffYen !== 0 && (
                  <p className="mt-3 text-[15px] font-bold tabular-nums text-[var(--ink)]">
                    お支払い：{yen(savedTotal)} → {yen(total.total)}（差額{' '}
                    {signedYen(diffYen)}）
                  </p>
                )}
                <p className="mt-4 text-[13px] font-bold leading-[1.9] text-[var(--ink)]">
                  ここまでが確認です。変更は保存されていません。
                </p>
                <p className="mt-1 text-[13px] leading-[1.9] text-[var(--sub)]">
                  入力した内容は送信も保存もされません。ブラウザを閉じれば残りません。
                </p>
                <a href="/" className={`${BTN_SECONDARY} mt-5`}>
                  NAGI トップへ戻る
                  <span aria-hidden="true">&#8599;</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <StayPanel
            room={type}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adultsNum}
            mealId={mealId}
            paymentLabel="現地決済"
            eager
          />
        </aside>
      </div>
    </div>
  );
}
