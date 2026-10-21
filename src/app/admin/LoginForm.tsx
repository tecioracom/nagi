'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/site/fields';
import { email as vEmail, required, type FieldError } from '@/components/site/validate';

/* ============================================================================
 * スタッフのログイン。
 *
 * ■ ボタンは「ログイン」のまま、押すと本当に管理画面が開く
 *   照合する相手がいないので、入力チェックだけを行い、通れば
 *   本日の状況へ進む。押せないボタンを置いて「押せません」と書くより、
 *   **押した結果がちゃんと出る**ほうが、何ができるかが伝わる。
 *
 * ■ 「本当のパスワードを入れないでください」と先に書く
 *   見本と分かっていても、ログインの形をした画面には打つ人がいる。
 *   照合しないこと・どこにも送らないことを、入力欄の**前**に置く。
 *   `autoComplete="off"` にして、パスワード管理ソフトに覚えさせない。
 * ==========================================================================*/

export function LoginForm() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const router = useRouter();

  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [checked, setChecked] = useState(false);

  const errors: Record<string, FieldError> = {
    mail: vEmail(mail),
    pass: required(pass, 'パスワード'),
  };
  const err = (k: string) => (checked ? (errors[k] ?? null) : null);

  function onLogin() {
    setChecked(true);
    if (errors.mail || errors.pass) return;
    router.push('/admin/today');
  }

  return (
    <div
      role="group"
      aria-label="スタッフのログイン"
      className="w-full max-w-[420px] border border-[var(--line)] bg-[var(--paper)] px-7 py-8"
    >
      <h1 className="text-[24px] font-bold text-[var(--ink)]">ログイン</h1>
      <p className="mt-2 text-[13px] leading-[1.8] text-[var(--sub)]">
        スタッフ用アカウントでログインしてください。
      </p>

      <p className="mt-4 border border-[var(--line-strong)] bg-[var(--cream)] px-4 py-3 text-[12px] font-semibold leading-[1.8] text-[var(--ink)]">
        この画面は見本です。入力は照合されず、どこにも送られません。実際にお使いのパスワードは入力しないでください。
      </p>

      <div className="mt-5 space-y-5">
        <TextField
          id={id('mail')}
          label="メールアドレス"
          type="email"
          inputMode="email"
          value={mail}
          onChange={setMail}
          placeholder="staff@example.com"
          autoComplete="off"
          error={err('mail')}
        />
        <TextField
          id={id('pass')}
          label="パスワード"
          type="password"
          value={pass}
          onChange={setPass}
          autoComplete="off"
          error={err('pass')}
        />
      </div>

      <p className="mt-4 text-[12px] leading-[1.8] text-[var(--sub)]">
        パスワードをお忘れの場合は、施設の管理者にご連絡ください。
      </p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-5 inline-flex min-h-[48px] w-full items-center justify-between gap-3 bg-[var(--green)] px-5 text-[15px] font-semibold text-[var(--cream)] transition duration-150 hover:bg-[var(--green-deep)]"
      >
        ログイン
        <span aria-hidden="true">&#8599;</span>
      </button>
    </div>
  );
}
