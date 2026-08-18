import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

export const CompletionCurve = (props: CompletionCurveProps) => {
  return (
    <section aria-label='tasks completed over time'>
      <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
        tasks completed over session
      </p>
      <div className='mt-3 h-44 w-full'>
        <ResponsiveContainer height='100%' width='100%'>
          <AreaChart
            data={props.points}
            margin={{ bottom: 0, left: 0, right: 4, top: 8 }}>
            <defs>
              <linearGradient id='curveFill' x1='0' x2='0' y1='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--cobalt)'
                  stopOpacity={0.22}
                />
                <stop offset='100%' stopColor='var(--cobalt)' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='var(--rule)' vertical={false} />
            <XAxis
              axisLine={false}
              dataKey='minute'
              fontSize={11}
              stroke='var(--mist)'
              tickFormatter={(minute: number) => {
                return `${minute}m`;
              }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              fontSize={11}
              stroke='var(--mist)'
              tickLine={false}
              width={34}
            />
            <Area
              dataKey='done'
              fill='url(#curveFill)'
              stroke='var(--cobalt)'
              strokeWidth={2}
              type='stepAfter'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

/* Types */
interface CompletionCurveProps {
  points: CurvePoint[];
}
interface CurvePoint {
  done: number;
  minute: number;
}
