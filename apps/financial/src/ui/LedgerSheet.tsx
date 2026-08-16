import { display, figures } from '@/theme/fonts';

/**
 * The hero is the thing the headline promises: one sheet. A statement drawn as
 * greenbar paper — perforated edge, banded rows, figures right-aligned, and a
 * stamp pressed across the total. Decorative, so it is hidden from the reader.
 */
export const LedgerSheet = () => (
  <svg
    aria-hidden
    className='w-full max-w-[620px]'
    fill='none'
    role='presentation'
    viewBox='0 0 620 470'
    xmlns='http://www.w3.org/2000/svg'>
    <title>An invoice on greenbar ledger paper</title>

    <g transform='rotate(-3 310 235)'>
      <rect
        fill='var(--color-paper)'
        height='400'
        stroke='var(--color-rule)'
        width='500'
        x='70'
        y='40'
      />
    </g>

    <rect
      fill='#ffffff'
      height='410'
      stroke='var(--color-rule)'
      width='510'
      x='55'
      y='30'
    />

    {PERFORATION.map((y) => (
      <circle cx='72' cy={y} fill='var(--color-rule)' key={y} r='2.5' />
    ))}

    <line stroke='var(--color-rule)' x1='89' x2='89' y1='30' y2='440' />

    <text
      className={display.className}
      fill='var(--color-ink)'
      fontSize='19'
      x='108'
      y='75'>
      Statement
    </text>
    <rect
      fill='var(--color-ink-soft)'
      height='6'
      opacity='0.4'
      width='96'
      x='108'
      y='90'
    />
    <rect
      fill='var(--color-ink-soft)'
      height='6'
      opacity='0.25'
      width='64'
      x='108'
      y='104'
    />

    <rect fill='var(--color-bar)' height='22' width='120' x='420' y='62' />
    <rect
      fill='var(--color-ink-soft)'
      height='6'
      opacity='0.4'
      width='84'
      x='438'
      y='70'
    />

    <line stroke='var(--color-rule)' x1='89' x2='545' y1='126' y2='126' />

    {ROWS.map((row, index) => (
      <g key={row.y}>
        {index % 2 === 1 && (
          <rect
            fill='var(--color-bar)'
            height='30'
            width='456'
            x='89'
            y={row.y}
          />
        )}
        <rect
          fill='var(--color-ink)'
          height='7'
          opacity='0.32'
          width={row.label}
          x='108'
          y={row.y + 11}
        />
        <rect
          fill='var(--color-ink)'
          height='9'
          opacity='0.7'
          width={row.figure}
          x={528 - row.figure}
          y={row.y + 10}
        />
      </g>
    ))}

    <line stroke='var(--color-ink)' x1='89' x2='545' y1='348' y2='348' />
    <line stroke='var(--color-ink)' x1='89' x2='545' y1='352' y2='352' />

    <text
      className={figures.className}
      fill='var(--color-ink-soft)'
      fontSize='10'
      letterSpacing='1.8'
      x='108'
      y='380'>
      TOTAL DUE
    </text>
    <text
      className={figures.className}
      fill='var(--color-seal)'
      fontSize='24'
      textAnchor='end'
      x='528'
      y='384'>
      $12,480.00
    </text>

    <g transform='rotate(-9 420 405)'>
      <rect
        height='40'
        stroke='var(--color-seal)'
        strokeWidth='2.5'
        width='132'
        x='354'
        y='385'
      />
      <text
        className={display.className}
        fill='var(--color-seal)'
        fontSize='17'
        letterSpacing='3'
        textAnchor='middle'
        x='420'
        y='412'>
        PAID
      </text>
    </g>
  </svg>
);

const PERFORATION = [
  58, 88, 118, 148, 178, 208, 238, 268, 298, 328, 358, 388, 418,
];

const ROWS = [
  { figure: 74, label: 138, y: 136 },
  { figure: 62, label: 106, y: 166 },
  { figure: 88, label: 154, y: 196 },
  { figure: 56, label: 92, y: 226 },
  { figure: 80, label: 128, y: 256 },
  { figure: 66, label: 116, y: 286 },
  { figure: 94, label: 146, y: 316 },
];
