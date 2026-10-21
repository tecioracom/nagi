/* ============================================================================
 * 入力チェック。**React にもブラウザ API にも依存しない純粋関数だけ。**
 * 8本のサイトが同じ関数を使う（サイトごとに書き直すと、片方だけ緩くなる）。
 *
 * ■ 返すのは日本語の一文
 *   「入力してください」ではなく **何をどうすればよいか** を書く。
 *   問題が無ければ null。呼び出し側は null 以外を集めて出す。
 *
 * ■ 厳しくしすぎない
 *   氏名に文字種の制限を掛けない（外国姓・旧字体・ミドルネームで弾く）。
 *   メールは「@ の前後に文字があって、空白が無い」までしか見ない。
 *   ここで弾けるのは打ち間違いだけで、到達性は送ってみるまで分からない。
 *   **送らないサイトなので、なおさら厳しくする理由が無い。**
 * ==========================================================================*/

export type FieldError = string | null;

/** 前後の空白を落とす。全角空白も対象にする（和文の入力では普通に混ざる）。 */
export function trim(value: string): string {
  return value.replace(/^[\s　]+|[\s　]+$/g, '');
}

export function required(value: string, label: string): FieldError {
  return trim(value) === '' ? `${label}を入力してください。` : null;
}

export function requiredChoice(value: string, label: string): FieldError {
  return trim(value) === '' ? `${label}を選んでください。` : null;
}

export function maxLength(value: string, label: string, max: number): FieldError {
  return trim(value).length > max
    ? `${label}は${max}文字までで入力してください。`
    : null;
}

/**
 * メールアドレス。
 * `@` がちょうど1つ、前後が空でない、空白と全角文字を含まない、
 * ドメイン側に `.` がある——ここまで。
 */
export function email(value: string, label = 'メールアドレス'): FieldError {
  const v = trim(value);
  if (v === '') return `${label}を入力してください。`;
  if (/[\s　]/.test(v)) return `${label}に空白が入っています。`;
  const parts = v.split('@');
  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
    return `${label}は「名前@example.com」の形で入力してください。`;
  }
  if (!parts[1].includes('.') || parts[1].startsWith('.') || parts[1].endsWith('.')) {
    return `${label}のドメイン（@ のうしろ）を確認してください。`;
  }
  return null;
}

/**
 * 電話番号。数字とハイフンだけを許し、桁数だけを見る。
 * 市外局番の桁は地域で違うので、区切り位置は見ない。
 */
export function phone(value: string, label = '電話番号'): FieldError {
  const v = trim(value);
  if (v === '') return `${label}を入力してください。`;
  if (!/^[0-9-]+$/.test(v)) {
    return `${label}は数字とハイフンで入力してください。`;
  }
  const digits = v.replace(/-/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return `${label}は10桁または11桁で入力してください。`;
  }
  return null;
}

/** 同意チェック。押していなければ、何に同意するのかを繰り返す。 */
export function agreed(checked: boolean, what: string): FieldError {
  return checked ? null : `${what}への同意をご確認ください。`;
}

/**
 * エラーの集合から「最初の1件」を取り出す。
 * まとめて出したあと、その欄へ焦点を移すために使う。
 */
export function firstError(
  order: readonly string[],
  errors: Readonly<Record<string, FieldError>>,
): { key: string; message: string } | null {
  for (const key of order) {
    const message = errors[key];
    if (message) return { key, message };
  }
  return null;
}

/** null を落として、出す順に並べた一覧にする。 */
export function listErrors(
  order: readonly string[],
  errors: Readonly<Record<string, FieldError>>,
  labels: Readonly<Record<string, string>>,
): { key: string; label: string; message: string }[] {
  return order
    .filter((k) => errors[k])
    .map((k) => ({ key: k, label: labels[k] ?? k, message: errors[k] as string }));
}
