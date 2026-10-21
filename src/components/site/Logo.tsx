import type { CSSProperties } from 'react';

type LogoProps = {
  /** SVG マーク部分の一辺サイズ (px)。既定 28 */
  size?: number;
  /** ワードマークの色。ダーク面は #F3F4F6、ライト面は #0F1724 を渡す */
  wordmarkColor?: string;
  /** ワードマークを表示するか。false ならマークのみ */
  showWordmark?: boolean;
  className?: string;
  style?: CSSProperties;
};

// Aurora Pixel: "T" を 9 個の角丸スクエアで構成（確定色）
const PIXELS: { col: number; row: number; fill: string }[] = [
  { col: 0, row: 0, fill: '#00D1FF' },
  { col: 1, row: 0, fill: '#15BBFF' },
  { col: 2, row: 0, fill: '#29A5FF' },
  { col: 3, row: 0, fill: '#3E8FFF' },
  { col: 4, row: 0, fill: '#5379FF' },
  { col: 2, row: 1, fill: '#3E8FFF' },
  { col: 2, row: 2, fill: '#5379FF' },
  { col: 2, row: 3, fill: '#6763FF' },
  { col: 2, row: 4, fill: '#7C4DFF' },
];

const STEP = 20;
const PIXEL = 16;
const RX = 4;

export function Logo({
  size = 28,
  wordmarkColor = '#F3F4F6',
  showWordmark = true,
  className,
  style,
}: LogoProps) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label="Teciora"
        focusable="false"
      >
        {PIXELS.map(({ col, row, fill }) => (
          <rect
            key={`${col}-${row}`}
            x={col * STEP}
            y={row * STEP}
            width={PIXEL}
            height={PIXEL}
            rx={RX}
            fill={fill}
          />
        ))}
      </svg>
      {showWordmark && (
        <span
          aria-hidden="true"
          style={{
            color: wordmarkColor,
            fontWeight: 700,
            fontSize: size * 0.72,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Teciora
        </span>
      )}
    </span>
  );
}
