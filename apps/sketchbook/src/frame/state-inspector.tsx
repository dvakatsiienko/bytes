import { useState } from 'react';

// The prototype rule this exists for: after every action, show the whole state
// that matters, so a wrong state model is visible instead of inferred.
export const StateInspector = (props: StateInspectorProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className='fixed bottom-6 left-6 w-72 rounded-lg border bg-card shadow-lg'>
      <button
        className='flex w-full items-center justify-between px-3 py-2 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.15em]'
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        type='button'>
        state
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen ? (
        <pre className='max-h-64 overflow-auto border-t px-3 py-2 font-mono text-[0.7rem] leading-relaxed'>
          {JSON.stringify(props.state, null, 2)}
        </pre>
      ) : null}
    </aside>
  );
};

/* Types */
interface StateInspectorProps {
  state: unknown;
}
