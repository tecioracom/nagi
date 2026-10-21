/* ============================================================================
 * 画面遷移の帯。「いまどこで、次に何があるか」を1行で出す。
 *
 * ■ 色だけで現在地を示さない
 *   現在地は **番号 + 太字 + aria-current** の3つで示す。
 *   罫の濃さだけにすると、色覚と低コントラストの両方で落ちる。
 *
 * ■ リンクにしない
 *   まだ通っていない先へのリンクを出すと、順番に意味が無いことになる。
 *   戻る導線は各画面が自分で持つ（「入力内容を修正する」など）。
 *
 * ■ 終点の名前
 *   このサイト群は何も送らないので、最後の段は必ず「確認」で終わる。
 *   「完了」「送信しました」と書くと事実と違う。
 * ==========================================================================*/

type Props = {
  steps: readonly string[];
  /** 1 始まり。 */
  current: number;
  className?: string;
  /** 読み上げ用の帯の名前。 */
  ariaLabel?: string;
};

export function StepBar({
  steps,
  current,
  className = '',
  ariaLabel = '入力の進みぐあい',
}: Props) {
  return (
    <ol
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
    >
      {steps.map((label, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex items-center gap-4">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`h-px w-10 ${done || isCurrent ? 'bg-[var(--ink)]' : 'bg-[var(--line-strong)]'}`}
              />
            )}
            <span
              {...(isCurrent ? { 'aria-current': 'step' as const } : {})}
              className={`text-[13px] leading-[1.5] ${
                isCurrent
                  ? 'font-bold text-[var(--ink)]'
                  : 'text-[var(--sub)]'
              }`}
            >
              <span className="mr-2 tabular-nums">
                {String(n).padStart(2, '0')}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
