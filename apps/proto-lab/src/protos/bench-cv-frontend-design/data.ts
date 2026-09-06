// Facts from the brief that the shared cv data does not carry.
export const ledgerList = [
  { label: 'based in', value: 'Kyiv, Ukraine' },
  { label: 'open to', value: 'consumer product, startup-shaped' },
  { label: 'speaks', value: 'English, Ukrainian, Russian' },
  { label: 'PSN level', value: '301' },
  { label: 'platinums', value: '34' },
] as const satisfies readonly LedgerRow[];

/* Types */
interface LedgerRow {
  label: string;
  value: string;
}
