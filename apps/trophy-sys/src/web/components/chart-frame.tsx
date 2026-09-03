import { type ReactNode, useState } from 'react';

import { SegmentedControl } from './segmented-control.tsx';

const VIEWS = [
  { label: 'chart', value: 'chart' },
  { label: 'table', value: 'table' },
] as const satisfies readonly { label: string; value: ChartView }[];

/**
 * The boxed frame every chart sits in, plus the accessibility floor: the same
 * numbers are one keyboard-reachable toggle away as a real table, so nothing
 * the chart says is only available to a mouse.
 */
export const ChartFrame = (props: ChartFrameProps) => {
  const [view, setView] = useState<ChartView>('chart');

  return (
    // min-w-0: a grid item defaults to min-width:auto, so a chart wider than the
    // column (the heatmap, the night-owl grid) would stretch the track and push
    // the whole page sideways instead of scrolling inside its own box.
    <section className='panel flex min-h-0 min-w-0 flex-col'>
      <span className='panel-title'>{props.title}</span>

      <div className='flex items-center gap-3 border-line border-b px-4 py-2'>
        <p className='min-w-0 flex-1 text-[10px] text-dim'>{props.note}</p>

        <SegmentedControl
          label={`${props.title} view`}
          name={`${props.name}-view`}
          onChange={setView}
          options={VIEWS}
          value={view}
        />
      </div>

      <div className='min-h-0 flex-1 overflow-auto'>
        {view === 'chart' ? props.children : props.table}
      </div>
    </section>
  );
};

/** The table fallback body — same numbers, no colour and no pointer needed. */
export const ChartTable = <Row,>(props: ChartTableProps<Row>) => {
  const headListJSX = props.columns.map((column) => {
    return (
      <th
        className={`sticky top-0 bg-bg-soft px-3 py-1.5 font-normal ${column.isNumeric ? 'text-right' : 'text-left'}`}
        key={column.head}
        scope='col'>
        {column.head}
      </th>
    );
  });

  const rowListJSX = props.rows.map((row, index) => {
    const cellListJSX = props.columns.map((column) => {
      return (
        <td
          className={`px-3 py-1 ${column.isNumeric ? 'text-right tabular-nums' : ''}`}
          key={column.head}>
          {column.cell(row)}
        </td>
      );
    });

    return (
      <tr
        className='border-line/60 border-b last:border-b-0'
        key={props.rowKey(row, index)}>
        {cellListJSX}
      </tr>
    );
  });

  return (
    <table className='w-full text-[10px] text-fg-soft'>
      <thead className='text-[9px] text-mute uppercase tracking-[0.12em]'>
        <tr>{headListJSX}</tr>
      </thead>
      <tbody>{rowListJSX}</tbody>
    </table>
  );
};

/* Types */
type ChartView = 'chart' | 'table';

interface ChartFrameProps {
  children: ReactNode;
  /** Unique per frame — two radio groups on one page must not share a name. */
  name: string;
  note: string;
  table: ReactNode;
  title: string;
}

export interface ChartColumn<Row> {
  cell: (row: Row) => ReactNode;
  head: string;
  isNumeric?: boolean;
}

interface ChartTableProps<Row> {
  columns: ChartColumn<Row>[];
  rowKey: (row: Row, index: number) => string;
  rows: Row[];
}
