interface SelectControlProps<Value extends string> {
  hint: string;
  labels: Record<Value, string>;
  onChange: (value: Value) => void;
  /** Explicit — record key order is alphabetised by the linter. */
  options: readonly Value[];
  value: Value;
}

/** The one dropdown look shared by the library and trophy control bars. */
export const SelectControl = <Value extends string>({
  hint,
  labels,
  options,
  value,
  onChange,
}: SelectControlProps<Value>) => (
  <select
    className='hint hint-right shrink-0 cursor-pointer border border-line bg-bg-soft px-2 py-1 text-[11px] text-dim uppercase tracking-[0.1em] transition-colors hover:text-fg-soft focus:border-orange focus:text-fg focus:outline-none'
    data-hint={hint}
    onChange={(event) => onChange(event.target.value as Value)}
    value={value}>
    {options.map((option) => (
      <option key={option} value={option}>
        {labels[option]}
      </option>
    ))}
  </select>
);
