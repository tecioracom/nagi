'use client';

import type { ReactNode } from 'react';

/* ============================================================================
 * 8本のサイトで共有するフォーム部品。
 *
 * ■ **`<form>` を使わない。**
 *   これは様式の好みではなく、この案件の制約から出てくる結論である。
 *   `<form>` は action を書かなくても、送信時に**現在の URL へ GET** する。
 *   JS が動いていない／ハイドレートが間に合っていない状態で入力欄の中で
 *   Enter を押すと、氏名・メール・電話が**そのままクエリ文字列に載る**。
 *   URL は履歴・リファラ・アクセスログに残る。架空の宿でも、入力するのは
 *   実在の訪問者なので、ここは「起きにくい」ではなく「起こせない」にする。
 *   入力欄は `<div role="group">` に入れ、ボタンは必ず `type="button"`。
 *
 * ■ 色は CSS 変数だけで書く
 *   `var(--ink)` `var(--line-strong)` … は `.sample-<slug>` が定義する。
 *   ここに固定色を書くと、8本が同じ見た目に寄る。
 *
 * ■ エラーは「まとめ」と「欄の直下」の両方に出す
 *   まとめだけだと、長いフォームでどの欄か分からない。
 *   欄の直下だけだと、折りたたみの外にある欄に気づけない。
 *   まとめの各行はボタンで、押すとその欄に焦点が移る。
 * ==========================================================================*/

export const FIELD_BASE =
  'mt-2 block w-full rounded-[var(--field-radius,4px)] border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-3 text-[15px] leading-[1.6] text-[var(--ink)] placeholder:text-[var(--sub)] focus:border-[var(--focus-ring)] focus:ring-0';

export const LABEL_BASE =
  'block text-[13px] font-semibold leading-[1.5] text-[var(--ink)]';

type FieldProps = {
  id: string;
  label: string;
  /** 見出しの横に * を出す。文言は `requiredMark` で差し替えられる。 */
  requiredMark?: boolean;
  /** 欄の下に出す補足（1行）。 */
  hint?: string;
  /** 入力チェックの結果。null なら出さない。 */
  error?: string | null;
  children: (aria: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
  className?: string;
};

/** ラベル・補足・エラーの配線だけを持つ器。入力要素は children が描く。 */
export function Field({
  id,
  label,
  requiredMark = false,
  hint,
  error,
  children,
  className = '',
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL_BASE}>
        {label}
        {requiredMark && (
          <span className="ml-1 text-[var(--alert)]" aria-hidden="true">
            *
          </span>
        )}
        {requiredMark && <span className="sr-only">（必須）</span>}
      </label>
      {children({
        id,
        ...(error ? { 'aria-invalid': true } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}
      {hint && (
        <p id={hintId} className="mt-2 text-[13px] leading-[1.6] text-[var(--sub)]">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errId}
          className="mt-2 text-[13px] font-semibold leading-[1.6] text-[var(--alert)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

type TextProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  requiredMark?: boolean;
  hint?: string;
  error?: string | null;
  placeholder?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'date';
  className?: string;
};

export function TextField({
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  type = 'text',
  className,
  ...rest
}: TextProps) {
  return (
    <Field {...rest} className={className}>
      {(aria) => (
        <input
          {...aria}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={FIELD_BASE}
        />
      )}
    </Field>
  );
}

type SelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  requiredMark?: boolean;
  hint?: string;
  error?: string | null;
  className?: string;
};

export function SelectField({
  value,
  onChange,
  options,
  className,
  ...rest
}: SelectProps) {
  return (
    <Field {...rest} className={className}>
      {(aria) => (
        <select
          {...aria}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FIELD_BASE}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

type TextAreaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  requiredMark?: boolean;
  hint?: string;
  error?: string | null;
  placeholder?: string;
  className?: string;
};

export function TextAreaField({
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
  ...rest
}: TextAreaProps) {
  return (
    <Field {...rest} className={className}>
      {(aria) => (
        <textarea
          {...aria}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={FIELD_BASE}
        />
      )}
    </Field>
  );
}

type CheckProps = {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
  className?: string;
};

export function CheckField({
  id,
  label,
  checked,
  onChange,
  error,
  className = '',
}: CheckProps) {
  const errId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          {...(error ? { 'aria-invalid': true, 'aria-describedby': errId } : {})}
          className="mt-[3px] h-[18px] w-[18px] shrink-0 rounded-[2px] border-[var(--line-strong)] text-[var(--green,var(--ink))] focus:ring-0"
        />
        <label htmlFor={id} className="text-[14px] leading-[1.7] text-[var(--ink)]">
          {label}
        </label>
      </div>
      {error && (
        <p
          id={errId}
          className="mt-2 text-[13px] font-semibold leading-[1.6] text-[var(--alert)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

type SummaryProps = {
  /** 見出しの id。まとめ自体に焦点を当てるので tabIndex={-1} を持つ。 */
  id: string;
  title: string;
  items: readonly { key: string; label: string; message: string }[];
  /** 行を押したときに焦点を移す先の要素 id を返す。既定は key と同じ。 */
  fieldId?: (key: string) => string;
};

/**
 * エラーのまとめ。
 * 1件でもあるときだけ描く。`role="alert"` は付けない
 * （押すたびに全文を読み上げ直すので、長いまとめでは邪魔になる）。
 * 代わりに、呼び出し側がこの要素へ focus を移す。
 */
export function ErrorSummary({ id, title, items, fieldId }: SummaryProps) {
  if (items.length === 0) return null;
  const to = fieldId ?? ((k: string) => k);
  return (
    <div
      id={id}
      tabIndex={-1}
      className="rounded-[var(--field-radius,4px)] border border-[var(--alert)] bg-[var(--paper)] px-4 py-4"
    >
      <p className="text-[14px] font-bold text-[var(--alert)]">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li key={it.key} className="text-[13px] leading-[1.7]">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(to(it.key));
                if (el) {
                  el.scrollIntoView({ block: 'center' });
                  (el as HTMLElement).focus();
                }
              }}
              className="text-left text-[var(--alert)] underline underline-offset-4"
            >
              {it.label}：{it.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
