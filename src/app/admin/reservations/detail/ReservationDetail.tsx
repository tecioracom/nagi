'use client';

import { useId, useState } from 'react';
import { AdminCard } from '@/components/site/AdminShell';
import { SelectField, TextAreaField } from '@/components/site/fields';
import { TAG, TAG_QUIET } from '@/components/site/styles';
import { signedYen, yen } from '@/components/site/format';
import { formatShort, formatSlashed } from '@/components/site/calendar';
import {
  ETA_OPTIONS,
  GUEST_0842,
  HISTORY_0842,
  RESERVATIONS,
  ROOM_TYPES,
  STAFF_MEMO_0842,
  STAFF_ON_DUTY,
  bookingNumber,
  freeRooms,
  meal,
  reservationTotal,
  roomType,
  stayTotal,
  typeOfRoom,
  type RoomTypeId,
} from '../../../_data';

/* ============================================================================
 * 予約詳細と、客室の変更。**書き出しの2枚（admin-04 / admin-06）は
 * 同じ1画面の2つの状態**なので、1ルートにしてある。
 *
 * ■ 差額は保存の前に出す
 *   客室タイプをオーシャンテラススイートからシービューツインに変えると、
 *   お支払いが ¥88,000 → ¥64,000 になり、下の帯に
 *   「客室変更は未保存です / 差額 −¥24,000」が出る。
 *   お客様側の予約画面に並んでいた2つの金額が、そのまま差額になる。
 *   **押してから分かるのでは遅い。**フロントが電話口で言う数字なので、
 *   保存の前に確定していること自体が仕様である。
 *
 * ■ 部屋番号は空いている部屋からしか選べない
 *   タイプを変えたら、その日程で空いている部屋に自動で移す。
 *   11/14–11/15 のシービューツインは 104 号室だけが空いている
 *   （101 鈴木様・102 佐藤様・103 中村様）。台帳から導いている。
 *
 * ■ 保存はしない
 *   終点は「変更内容の確認」。押すと、何を何に変えたか・差額・
 *   保存されないことを出す。
 * ==========================================================================*/

const R = RESERVATIONS[0]; // 0842 山田様

export function ReservationDetail() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;

  const savedType = typeOfRoom(R.room);
  const savedTotal = reservationTotal(R);

  const [type, setType] = useState<RoomTypeId>(savedType);
  const [room, setRoom] = useState(R.room);
  const [eta, setEta] = useState(R.eta);
  const [memoDraft, setMemoDraft] = useState('');
  const [memos, setMemos] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = stayTotal({
    type,
    checkIn: R.checkIn,
    checkOut: R.checkOut,
    adults: R.adults,
    meal: R.meal,
  });
  const diff = total.total - savedTotal;

  const roomChanged = type !== savedType || room !== R.room;
  const etaChanged = eta !== R.eta;
  const dirty = roomChanged || etaChanged || memos.length > 0;

  /** タイプを変えたら、その日程で空いている部屋に移す。 */
  function onType(next: RoomTypeId) {
    setType(next);
    setConfirmed(false);
    const free = freeRooms(next, R.checkIn, R.checkOut, R.id);
    setRoom(free[0] ?? R.room);
  }

  function reset() {
    setType(savedType);
    setRoom(R.room);
    setEta(R.eta);
    setMemos([]);
    setMemoDraft('');
    setConfirmed(false);
  }

  const roomOptions = freeRooms(type, R.checkIn, R.checkOut, R.id);

  return (
    <>
      <div className="mb-5">
        <p className="text-[13px] text-[var(--sub)]">
          <a
            href="/admin/reservations"
            className="underline underline-offset-4"
          >
            予約一覧
          </a>
          <span aria-hidden="true"> / </span>
          <span className="tabular-nums">{bookingNumber(R.id)}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-[26px] font-bold text-[var(--ink)]">{R.guest} 様</h1>
          <span className={TAG_QUIET}>到着待ち</span>
          <span className={TAG_QUIET}>
            {total.total === savedTotal ? '未精算' : '未精算（変更後）'}
          </span>
          <span className="text-[13px] text-[var(--sub)]">担当：{STAFF_ON_DUTY}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* 左 */}
        <div className="space-y-6">
          <AdminCard title="宿泊情報">
            {/*
              日程は入力欄にしない。ここで変えられないものを入力欄の形で
              置くと、打てるのに反映されない欄ができる。読む値として出し、
              どこで変えられるかを1行で書く。
            */}
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[13px] font-semibold text-[var(--ink)]">
                  チェックイン
                </dt>
                <dd className="mt-2 border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-[15px] tabular-nums text-[var(--ink)]">
                  {formatSlashed(R.checkIn)}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-[var(--ink)]">
                  チェックアウト
                </dt>
                <dd className="mt-2 border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-[15px] tabular-nums text-[var(--ink)]">
                  {formatSlashed(R.checkOut)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[12px] text-[var(--sub)]">
              日程の変更はお客様の「予約の確認・変更」から承ります。
            </p>

            <SelectField
              id={id('type')}
              label="客室タイプ"
              className="mt-5"
              value={type}
              onChange={(v) => onType(v as RoomTypeId)}
              options={ROOM_TYPES.map((t) => ({ value: t.id, label: t.name }))}
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <SelectField
                id={id('room')}
                label="部屋番号"
                value={room}
                onChange={(v) => {
                  setRoom(v);
                  setConfirmed(false);
                }}
                options={roomOptions.map((no) => ({
                  value: no,
                  label: `${no}号室 / 定員${roomType(type).capacity}名`,
                }))}
                hint={
                  roomOptions.length > 0
                    ? `${formatShort(R.checkIn)}–${formatShort(R.checkOut)} に空いているのは ${roomOptions.length}室です。`
                    : 'この日程に空室がありません。'
                }
              />
              <SelectField
                id={id('eta')}
                label="到着予定"
                value={eta}
                onChange={(v) => {
                  setEta(v);
                  setConfirmed(false);
                }}
                options={ETA_OPTIONS.map((t) => ({ value: t, label: t }))}
              />
            </div>

            <p className="mt-5 text-[13px] text-[var(--ink)]">
              大人{R.adults}名 / 1室 / {meal(R.meal).label}
            </p>
            <p className="mt-1 text-[12px] text-[var(--sub)]">
              客室タイプを変えると、「お支払い」と下の帯の差額がその場で変わります。
            </p>
          </AdminCard>

          <AdminCard title="お客様情報">
            <p className="text-[15px] font-semibold text-[var(--ink)]">{R.guest} 様</p>
            <p className="mt-2 text-[13px] tabular-nums text-[var(--ink)]">
              {GUEST_0842.email}
              <span aria-hidden="true" className="mx-3">
                /
              </span>
              {GUEST_0842.tel}
            </p>
            <p className="mt-2 text-[12px] text-[var(--sub)]">
              予約経路：{GUEST_0842.route}　受付日：{GUEST_0842.acceptedOn}
            </p>
          </AdminCard>
        </div>

        {/* 右 */}
        <div className="space-y-6">
          <AdminCard title="お支払い">
            <p className="text-[32px] font-bold tabular-nums leading-[1.2] text-[var(--ink)]">
              {yen(total.total)}
            </p>
            <p className="mt-2 text-[13px] text-[var(--sub)]">
              {type === savedType ? '未精算 / 現地決済' : '変更後の料金 / 現地決済'}
              <br />
              税込・サービス料込み / 追加料金なし
            </p>
            <button
              type="button"
              onClick={() => setShowBreakdown((v) => !v)}
              aria-expanded={showBreakdown}
              className="mt-4 flex min-h-[48px] w-full items-center justify-between gap-3 border border-[var(--line-strong)] px-4 text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
            >
              精算内容を確認
              <span aria-hidden="true">{showBreakdown ? '−' : '↗'}</span>
            </button>
            {showBreakdown && (
              <dl className="mt-4 space-y-2 border-t border-[var(--line)] pt-4 text-[13px]">
                {total.perNight.map((n) => (
                  <div key={n.date} className="flex justify-between tabular-nums">
                    <dt className="text-[var(--sub)]">
                      {formatShort(n.date)} / {roomType(type).name}
                    </dt>
                    <dd className="text-[var(--ink)]">{yen(n.amount)}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[var(--line)] pt-2 font-bold tabular-nums">
                  <dt>合計（{R.adults}名・{total.nights}泊）</dt>
                  <dd>{yen(total.total)}</dd>
                </div>
                {diff !== 0 && (
                  <div className="flex justify-between font-bold tabular-nums text-[var(--alert)]">
                    <dt>ご予約時からの差額</dt>
                    <dd>{signedYen(diff)}</dd>
                  </div>
                )}
              </dl>
            )}
          </AdminCard>

          <AdminCard title="スタッフ向けメモ">
            <p className="-mt-2 text-[12px] text-[var(--sub)]">
              お客様には表示されません
            </p>
            <p className="mt-3 text-[12px] tabular-nums text-[var(--sub)]">
              {STAFF_MEMO_0842.stamp}
            </p>
            {STAFF_MEMO_0842.lines.map((line) => (
              <p key={line} className="text-[13px] leading-[1.8] text-[var(--ink)]">
                {line}
              </p>
            ))}

            {memos.map((m, i) => (
              <div key={`${m}-${i}`} className="mt-4 border-t border-[var(--line)] pt-3">
                <p className="text-[12px]">
                  <span className={TAG}>未保存</span>
                </p>
                <p className="mt-1 text-[13px] leading-[1.8] text-[var(--ink)]">{m}</p>
              </div>
            ))}

            <TextAreaField
              id={id('memo')}
              className="mt-4"
              label="メモを追加"
              value={memoDraft}
              onChange={setMemoDraft}
              rows={2}
              placeholder="例：夕食を18:30に変更"
              hint="この画面を離れると消えます。保存はされません。"
            />
            <button
              type="button"
              onClick={() => {
                const text = memoDraft.trim();
                if (text === '') return;
                setMemos((prev) => [...prev, text]);
                setMemoDraft('');
                setConfirmed(false);
              }}
              className="mt-3 flex min-h-[48px] w-full items-center justify-between gap-3 border border-[var(--line-strong)] px-4 text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
            >
              メモを追加
              <span aria-hidden="true">&#8599;</span>
            </button>
          </AdminCard>

          <AdminCard title="変更履歴">
            <ul className="space-y-1">
              {HISTORY_0842.map((h) => (
                <li key={h} className="text-[12px] leading-[1.9] text-[var(--ink)]">
                  {h}
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </div>

      {/* 下帯：変更の状態と、確認 */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
        <p
          aria-live="polite"
          className={`text-[13px] font-semibold ${dirty ? 'text-[var(--ink)]' : 'text-[var(--sub)]'}`}
        >
          {type !== savedType
            ? `客室変更は未保存です / 差額 ${signedYen(diff)}`
            : dirty
              ? '未保存の変更があります'
              : '変更はありません'}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[48px] items-center gap-3 border border-[var(--line-strong)] px-5 text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
          >
            変更を戻す
            <span aria-hidden="true">&#8598;</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="inline-flex min-h-[48px] items-center gap-3 bg-[var(--green)] px-5 text-[14px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]"
          >
            変更内容を確認
            <span aria-hidden="true">&#8599;</span>
          </button>
        </div>
      </div>

      {confirmed && (
        <div className="mt-5 border border-[var(--green)] bg-[var(--soft)] px-5 py-5">
          <h2 className="text-[17px] font-bold text-[var(--soft-ink)]">
            変更内容の確認
          </h2>
          {!dirty ? (
            <p className="mt-2 text-[13px] leading-[1.9] text-[var(--soft-ink)]">
              変更されている項目はありません。{roomType(savedType).name} / {R.room}
              号室 / 到着予定 {R.eta} / {yen(savedTotal)} のままです。
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-[13px] leading-[1.9] text-[var(--soft-ink)]">
              {type !== savedType && (
                <li>
                  客室タイプ：{roomType(savedType).name} → {roomType(type).name}
                </li>
              )}
              {room !== R.room && (
                <li>
                  部屋番号：{R.room}号室 → {room}号室
                </li>
              )}
              {etaChanged && (
                <li>
                  到着予定：{R.eta} → {eta}
                </li>
              )}
              {memos.length > 0 && <li>スタッフメモ：{memos.length}件を追加</li>}
              {diff !== 0 && (
                <li className="font-bold">
                  お支払い：{yen(savedTotal)} → {yen(total.total)}（差額 {signedYen(diff)}）
                </li>
              )}
            </ul>
          )}
          <p className="mt-4 text-[13px] font-bold leading-[1.9] text-[var(--soft-ink)]">
            ここまでが確認です。変更は保存されていません。
          </p>
        </div>
      )}
    </>
  );
}
