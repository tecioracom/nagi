'use client';

import { useSearchParams } from 'next/navigation';
import { ROOM_TYPES, type RoomTypeId } from '../_data';
import { ReserveForm } from './ReserveForm';

/* ============================================================================
 * `?room=twin` を読んで、選択済みの状態でフォームを開く。
 *
 * ■ `useSearchParams` は **必ず Suspense の内側**で呼ぶ
 *   包まないと、このルートは静的生成をやめてリクエストごとの描画になる。
 *   包んだうえで、代替表示（fallback）に**同じフォームの既定状態**を渡す。
 *   代替表示を「読み込み中」の箱にすると、静的 HTML に何も入らなくなり、
 *   JS が動かない環境でフォームが1つも出ない。
 *
 * ■ クエリに載せてよいのは客室タイプだけ
 *   氏名・メール・電話は1文字も URL に載せない。この口は `room` しか読まず、
 *   未知の値は黙って既定（スイート）に落とす。
 * ==========================================================================*/

export function ReserveFormFromQuery() {
  const params = useSearchParams();
  const raw = params.get('room');
  const known = ROOM_TYPES.some((r) => r.id === raw);
  return (
    <ReserveForm
      initialRoom={known ? (raw as RoomTypeId) : 'suite'}
    />
  );
}
