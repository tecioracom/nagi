/* ============================================================================
 * NAGI（架空・瀬戸内の海辺のホテル / 3タイプ・全8室）の共有データ。
 *
 * **表側の4画面と管理の6画面が、ここだけを見る。**
 * 複製すると、料金や室数を1か所だけ直したときに画面ごとに違う値が出る
 * ——という形で静かに壊れる。書き出した画面（public/works/nagi/）の数字は
 * すべてこのファイルから再現できる。
 *
 * 置いてよいのは次のものだけ:
 *  - React にもブラウザ API にも依存しない定数
 *  - 引数だけで結果が決まる純粋関数（SSR と CSR で必ず同じ値になる＝
 *    ハイドレーションのずれが出ない）
 * 日付ライブラリは使わない（`@/components/site/calendar` の整数演算）。
 *
 * 「今日」を端末時計から取らない。館内の「本日」は TODAY 定数にしてある。
 * ==========================================================================*/

import { addDays, dayOfWeek, diffDays } from '@/components/site/calendar';

/** 館内で「本日」とする日。書き出した管理画面の 2026年11月14日（土）。 */
export const TODAY = '2026-11-14';

/** 空室・料金の画面が出す1週間。 */
export const WEEK: readonly string[] = Array.from({ length: 7 }, (_, i) =>
  addDays(TODAY, i),
);

/* ---------------------------------------------------------------------------
 * 客室
 * ------------------------------------------------------------------------- */

export type RoomTypeId = 'suite' | 'twin' | 'washitsu';

export type RoomType = {
  id: RoomTypeId;
  name: string;
  /** 集計パネルに出る欧文。和文と併記する。 */
  en: string;
  /** ㎡ */
  area: number;
  capacity: number;
  feature: string;
  /** 大人2名・1泊・朝夕食付き・税サービス料込みの「基準日（金土）」料金。 */
  price: number;
  /** 部屋番号。並びが客室カレンダーの行順になる。 */
  rooms: readonly string[];
  lead: string;
  /** トップの客室カードの地（site.css の .nagi-room-N）。写真の下に残る。 */
  tone: string;
  /** 客室の写真（public/samples/ からの拡張子なしの道）。 */
  photo: string;
};

/**
 * 並びは書き出した画面と同じ（スイート → ツイン → 和洋室）。
 * 面積・定員・料金を同じ順で書くのは、3つを見比べられるようにするため。
 */
export const ROOM_TYPES: readonly RoomType[] = [
  {
    id: 'suite',
    name: 'オーシャンテラススイート',
    en: 'Ocean Terrace Suite',
    area: 85,
    capacity: 2,
    feature: 'テラス付き',
    price: 88000,
    rooms: ['201', '202'],
    lead: '大きな窓の先に海を望むテラス。木と石の風合いを生かした落ち着いた客室です。',
    tone: 'nagi-room-1',
    photo: 'nagi/room-1',
  },
  {
    id: 'twin',
    name: 'シービューツイン',
    en: 'Sea View Twin',
    area: 52,
    capacity: 2,
    feature: 'ツインベッド',
    price: 64000,
    rooms: ['101', '102', '103', '104'],
    lead: '窓辺の椅子から海を眺めるツインルーム。ベッドを2台備えた洋室です。',
    tone: 'nagi-room-2',
    photo: 'nagi/room-2',
  },
  {
    id: 'washitsu',
    name: '露天風呂付き和洋室',
    en: 'Open-air Bath Room',
    area: 72,
    capacity: 3,
    feature: '客室露天風呂付き',
    price: 78000,
    rooms: ['203', '204'],
    lead: '畳の広間とツインベッドを備えた和洋室。海を望む露天風呂でおくつろぎください。',
    tone: 'nagi-room-3',
    photo: 'nagi/room-3',
  },
];

export function roomType(id: RoomTypeId): RoomType {
  const t = ROOM_TYPES.find((x) => x.id === id);
  if (!t) throw new Error(`unknown room type: ${id}`);
  return t;
}

/** 部屋番号 → タイプ。客室カレンダーの行順で持つ。 */
export const ROOMS: readonly { no: string; type: RoomTypeId }[] = ROOM_TYPES
  .flatMap((t) => t.rooms.map((no) => ({ no, type: t.id })))
  .sort((a, b) => (a.no < b.no ? -1 : 1));

export const TOTAL_ROOMS = ROOMS.length; // 8

export function typeOfRoom(no: string): RoomTypeId {
  const r = ROOMS.find((x) => x.no === no);
  if (!r) throw new Error(`unknown room: ${no}`);
  return r.type;
}

/* ---------------------------------------------------------------------------
 * 料金
 * ------------------------------------------------------------------------- */

/**
 * 曜日で3段。空室・料金の画面に出る表そのもの。
 *   金・土 …… 基準（ROOM_TYPES.price）
 *   日・木 …… 基準 − 1段
 *   月火水 …… 基準 − 2段
 * 1泊ごとに単価が変わるので、**日程を変えると合計が動く**。
 */
const WEEKDAY_STEP: Record<RoomTypeId, readonly [number, number, number]> = {
  // [金土, 日木, 月火水]
  suite: [88000, 80000, 76000],
  twin: [64000, 60000, 56000],
  washitsu: [78000, 72000, 68000],
};

/** その日1泊ぶんの単価（大人2名・朝夕食付き）。 */
export function nightlyRate(type: RoomTypeId, iso: string): number {
  const dow = dayOfWeek(iso);
  const [high, mid, low] = WEEKDAY_STEP[type];
  if (dow === 5 || dow === 6) return high; // 金・土
  if (dow === 0 || dow === 4) return mid; // 日・木
  return low; // 月・火・水
}

/** 食事。基準は「朝夕食付き」で、外すと1名1泊あたり引く。 */
export type MealId = 'both' | 'breakfast' | 'room';

export const MEALS: readonly {
  id: MealId;
  label: string;
  /** 1名1泊あたりの増減（円）。 */
  delta: number;
  note: string;
}[] = [
  { id: 'both', label: '朝夕食付き', delta: 0, note: '夕食はレストランで、朝食はテラスまたはレストランで。' },
  { id: 'breakfast', label: '朝食付き', delta: -6000, note: '夕食を外します。1名1泊あたり ¥6,000 引きます。' },
  { id: 'room', label: '素泊まり', delta: -9000, note: '朝夕食とも外します。1名1泊あたり ¥9,000 引きます。' },
];

export function meal(id: MealId) {
  const m = MEALS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown meal: ${id}`);
  return m;
}

/**
 * 人数の掛け方。
 *   2名 …… 表示どおり（基準）
 *   1名 …… 基準の 75%
 *   3名 …… 基準 + ¥12,000（定員3名の客室だけ）
 * 端数が出ないよう、75% は 1,000 円単位に丸める。
 */
export const EXTRA_ADULT = 12000;

export function occupancyRate(base: number, adults: number): number {
  if (adults <= 1) return Math.round((base * 0.75) / 1000) * 1000;
  if (adults === 2) return base;
  return base + EXTRA_ADULT * (adults - 2);
}

export type StayInput = {
  type: RoomTypeId;
  checkIn: string;
  checkOut: string;
  adults: number;
  meal: MealId;
};

export type StayTotal = {
  /** 泊数。checkOut <= checkIn なら 0。 */
  nights: number;
  /** 1泊ごとの明細。 */
  perNight: { date: string; amount: number }[];
  total: number;
};

/**
 * 合計。**日程・人数・食事・客室タイプの4つすべてが効く。**
 * 書き出した集計パネル（YOUR STAY）が出しているのはこの値。
 */
export function stayTotal(input: StayInput): StayTotal {
  const nights = diffDays(input.checkIn, input.checkOut) ?? 0;
  if (nights <= 0) return { nights: 0, perNight: [], total: 0 };

  const mealDelta = meal(input.meal).delta * input.adults;
  const perNight: { date: string; amount: number }[] = [];
  for (let i = 0; i < nights; i += 1) {
    const date = addDays(input.checkIn, i);
    const base = occupancyRate(nightlyRate(input.type, date), input.adults);
    perNight.push({ date, amount: base + mealDelta });
  }
  return {
    nights,
    perNight,
    total: perNight.reduce((sum, n) => sum + n.amount, 0),
  };
}

/* ---------------------------------------------------------------------------
 * 予約台帳（架空）
 * ------------------------------------------------------------------------- */

export type StayStatus = 'staying' | 'waiting' | 'left';
export type Settlement = 'unpaid' | 'prepaid';

export type Reservation = {
  /** 予約番号の末尾4桁。表示は NG-261114-<id>。 */
  id: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  room: string;
  adults: number;
  meal: MealId;
  status: StayStatus;
  settlement: Settlement;
  /** 到着予定（保存済みの値）。 */
  eta: string;
  /** 一覧の「確認事項」。無ければ空。 */
  flag: string;
};

/**
 * 本日（11/14）に在館する6件。書き出した「予約一覧」と同じ並び。
 * 先頭の 0842 が、表側の予約画面・予約詳細・客室変更に出てくる1件。
 */
export const RESERVATIONS: readonly Reservation[] = [
  {
    id: '0842',
    guest: '山田 花子',
    checkIn: '2026-11-14',
    checkOut: '2026-11-15',
    room: '201',
    adults: 2,
    meal: 'both',
    status: 'waiting',
    settlement: 'unpaid',
    eta: '17:00',
    flag: '食事の確認',
  },
  {
    id: '0840',
    guest: '鈴木 一郎',
    checkIn: '2026-11-14',
    checkOut: '2026-11-15',
    room: '101',
    adults: 2,
    meal: 'both',
    status: 'staying',
    settlement: 'unpaid',
    eta: '15:00',
    flag: '',
  },
  {
    id: '0841',
    guest: '佐藤 直子',
    checkIn: '2026-11-14',
    checkOut: '2026-11-16',
    room: '102',
    adults: 2,
    meal: 'both',
    status: 'waiting',
    settlement: 'prepaid',
    eta: '16:00',
    flag: '',
  },
  {
    id: '0843',
    guest: '高橋 健',
    checkIn: '2026-11-14',
    checkOut: '2026-11-15',
    room: '202',
    adults: 1,
    meal: 'both',
    status: 'waiting',
    settlement: 'unpaid',
    eta: '18:00',
    flag: '',
  },
  {
    id: '0828',
    guest: '中村 洋子',
    checkIn: '2026-11-13',
    checkOut: '2026-11-15',
    room: '103',
    adults: 2,
    meal: 'both',
    status: 'staying',
    settlement: 'unpaid',
    eta: '15:00',
    flag: '',
  },
  {
    id: '0829',
    guest: '伊藤 修',
    checkIn: '2026-11-13',
    checkOut: '2026-11-16',
    room: '203',
    adults: 2,
    meal: 'both',
    status: 'staying',
    settlement: 'prepaid',
    eta: '16:00',
    flag: '',
  },
];

/** 予約番号の表示形。 */
export function bookingNumber(id: string): string {
  return `NG-261114-${id}`;
}

/** 台帳の1件から合計を出す。一覧の「合計」列はこの値。 */
export function reservationTotal(r: Reservation): number {
  return stayTotal({
    type: typeOfRoom(r.room),
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    adults: r.adults,
    meal: r.meal,
  }).total;
}

/** その日に在室しているか（チェックアウト日は数えない）。 */
export function occupiesOn(r: Reservation, iso: string): boolean {
  const from = diffDays(r.checkIn, iso);
  const to = diffDays(iso, r.checkOut);
  return from !== null && to !== null && from >= 0 && to >= 1;
}

/** 販売を止めている部屋・日（設備点検など）。 */
export const STOPPED: readonly { room: string; dates: readonly string[] }[] = [
  { room: '203', dates: ['2026-11-19', '2026-11-20'] },
];

export function isStopped(room: string, iso: string): boolean {
  return STOPPED.some((s) => s.room === room && s.dates.includes(iso));
}

/** その日その部屋の状態。 */
export type CellState =
  | { kind: 'booked'; reservation: Reservation }
  | { kind: 'stopped' }
  | { kind: 'open' };

export function cellState(room: string, iso: string): CellState {
  const r = RESERVATIONS.find((x) => x.room === room && occupiesOn(x, iso));
  if (r) return { kind: 'booked', reservation: r };
  if (isStopped(room, iso)) return { kind: 'stopped' };
  return { kind: 'open' };
}

/** その日その日程で売れる室数（タイプ別）。空室・料金の「販売可能数」。 */
export function sellableCount(type: RoomTypeId, iso: string): number {
  return roomType(type).rooms.filter((no) => cellState(no, iso).kind === 'open')
    .length;
}

/** その日程（連泊）を通して空いている部屋番号。客室の振り替えに使う。 */
export function freeRooms(
  type: RoomTypeId,
  checkIn: string,
  checkOut: string,
  ignoreReservationId?: string,
): string[] {
  const nights = diffDays(checkIn, checkOut) ?? 0;
  return roomType(type).rooms.filter((no) => {
    for (let i = 0; i < nights; i += 1) {
      const iso = addDays(checkIn, i);
      if (isStopped(no, iso)) return false;
      const taken = RESERVATIONS.find(
        (r) =>
          r.room === no &&
          r.id !== ignoreReservationId &&
          occupiesOn(r, iso),
      );
      if (taken) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------------------
 * 本日の状況
 * ------------------------------------------------------------------------- */

export type Housekeeping = 'staying' | 'cleaning' | 'inspect' | 'ready';

export const HOUSEKEEPING_LABEL: Record<Housekeeping, string> = {
  staying: '滞在中',
  cleaning: '清掃中',
  inspect: '点検待ち',
  ready: '清掃済み',
};

/** 客室の準備状況。書き出した「本日の状況」と同じ8室ぶん。 */
export const HOUSEKEEPING: Readonly<Record<string, Housekeeping>> = {
  '101': 'staying',
  '102': 'inspect',
  '103': 'staying',
  '104': 'ready',
  '201': 'ready',
  '202': 'cleaning',
  '203': 'staying',
  '204': 'ready',
};

/** 本日到着（チェックイン日が本日）。到着予定の早い順。 */
export function arrivalsToday(): Reservation[] {
  return RESERVATIONS.filter((r) => r.checkIn === TODAY).sort((a, b) =>
    a.eta < b.eta ? -1 : 1,
  );
}

/** 本日出発（チェックアウト日が本日）。台帳には在館中の6件しか無いので固定値。 */
export const DEPARTURES_TODAY = 3;
export const DEPARTURES_DONE = 2;

/** 今夜の在室室数。 */
export function occupiedTonight(): number {
  return ROOMS.filter((r) => cellState(r.no, TODAY).kind === 'booked').length;
}

/** 準備が必要な客室（清掃中・点検待ち）。 */
export function roomsToPrepare(): string[] {
  return ROOMS.filter(
    (r) => HOUSEKEEPING[r.no] === 'cleaning' || HOUSEKEEPING[r.no] === 'inspect',
  ).map((r) => r.no);
}

/** 対応が必要な項目。番号順ではなく、到着の早い順に並べる。 */
export const ATTENTION: readonly {
  tag: string;
  eta: string;
  lines: readonly string[];
}[] = [
  {
    tag: '要確認',
    eta: '17:00到着',
    lines: ['201 山田様の食物アレルギー', '調理担当の確認待ち'],
  },
  { tag: '点検待ち', eta: '16:00到着', lines: ['102 号室の最終点検'] },
  { tag: '清掃中', eta: '18:00到着', lines: ['202 号室の仕上がり確認'] },
];

/* ---------------------------------------------------------------------------
 * 0842（山田様）— 表側の予約画面と、管理の予約詳細で同じものを見る
 * ------------------------------------------------------------------------- */

export const GUEST_0842 = {
  name: '山田 花子',
  email: 'hanako@example.com',
  /**
   * 電話番号は 050-0 で始まる形にする。
   * 電気通信番号計画上、加入者に指定されえない並びで、**掛かってしまう番号を
   * 画面に置かない**ための選び方。`tel:` のリンクも作らない。
   */
  tel: '050-0123-4567',
  request: 'なし',
  route: '公式サイト',
  acceptedOn: '2026年10月20日',
} as const;

/** 予約詳細の「変更履歴」。新しい順。 */
export const HISTORY_0842: readonly string[] = [
  '本日 10:20 田中：スタッフメモを追加',
  '11/10 18:42 お客様：到着予定を17:00に変更',
  '10/20 12:10 公式サイトから予約',
];

/** 予約詳細の「スタッフ向けメモ」。お客様には出さない。 */
export const STAFF_MEMO_0842 = {
  stamp: '11/14 10:20 田中',
  lines: ['お電話で甲殻類アレルギーのご申告あり。', '調理担当へ確認を依頼済み。'],
} as const;

/** 到着予定の選択肢。チェックイン15:00〜、最終は21:00。 */
export const ETA_OPTIONS: readonly string[] = [
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

/** 館内の時刻。トップ・完了・管理で同じ値を出す。 */
export const CHECK_IN_FROM = '15:00';
export const CHECK_OUT_BY = '11:00';

/** キャンセル料。同意チェックの手前に置く。 */
export const CANCEL_POLICY: readonly string[] = [
  'キャンセル料：7〜3日前 30% / 2〜1日前 50%',
  '当日・ご連絡のない不泊 100%',
];

/** 担当者（管理画面の右上）。 */
export const STAFF_ON_DUTY = '田中 美咲';
