import { EngineCard } from '@/components/EngineCard.tsx';

import {
  type Config,
  type Engine,
  type EngineEntry,
  type EngineSettings,
  type Lang,
  type Status,
  entryOf,
  voiceOf,
} from '@/api.ts';

// one language: its chain in order, then the engines that could join it
export const Column = (props: ColumnProps) => {
  const chain = props.config.chain[props.lang] ?? [];
  const order = [
    ...chain.flatMap((engine) => entryOf(props.engines, engine) ?? []),
    ...props.engines.filter(
      (entry) =>
        entry.languages.includes(props.lang) && !chain.includes(entry.id),
    ),
  ];

  const cardListJSX = order.map((entry) => {
    const engine = entry.id;
    const rank = chain.indexOf(engine);
    return (
      <EngineCard
        engine={entry}
        isLast={rank === chain.length - 1}
        key={engine}
        lang={props.lang}
        onFavourite={(voice, isFavourite) =>
          props.onFavourite(engine, voice, isFavourite)
        }
        onMove={(step) => props.onChain(swap(chain, rank, rank + step))}
        onPause={props.onPause}
        onPreview={() => props.onPreview(engine)}
        onSettings={(patch) => props.onSettings(engine, patch)}
        onStop={props.onStop}
        onToggle={(isOn) =>
          props.onChain(
            isOn ? [...chain, engine] : chain.filter((each) => each !== engine),
          )
        }
        onVoice={(voice) => props.onVoice(engine, voice)}
        playState={
          props.playing?.engine === engine
            ? playStateOf(props.playing.isPaused)
            : undefined
        }
        rank={rank >= 0 ? rank : undefined}
        settings={props.config.engines[engine] ?? {}}
        status={props.status.engines?.[engine]}
        voice={voiceOf(props.config, engine, props.lang)}
        voiceOptions={voiceOptions(entry, props.lang)}
      />
    );
  });

  return (
    <section className='scroll-mt-24' id={`col-${props.lang}`}>
      <h2 className='mb-3 text-base font-semibold'>{props.title}</h2>
      <label className='mb-5 block text-sm text-muted'>
        sample line
        <input
          className='mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink'
          onChange={(event) => props.onSample(event.target.value)}
          type='text'
          value={props.sample}
        />
      </label>
      <ol className='m-0 grid list-none gap-3 p-0'>{cardListJSX}</ol>
    </section>
  );
};

/* Helpers */
const playStateOf = (isPaused: boolean) => (isPaused ? 'paused' : 'playing');

const swap = (chain: Engine[], from: number, to: number) => {
  const next = [...chain];
  [next[from], next[to]] = [next[to] as Engine, next[from] as Engine];
  return next;
};

const voiceOptions = (entry: EngineEntry, lang: Lang) =>
  entry.voices
    .filter((voice) => !voice.lang || voice.lang === lang)
    .map((voice): [string, string] => [voice.id, voice.name]);

/* Types */
interface ColumnProps {
  config: Config;
  engines: EngineEntry[];
  lang: Lang;
  onChain: (chain: Engine[]) => void;
  onFavourite: (engine: Engine, voice: string, isFavourite: boolean) => void;
  onPause: () => void;
  onPreview: (engine: Engine) => void;
  onSample: (sample: string) => void;
  onSettings: (engine: Engine, patch: EngineSettings) => void;
  onStop: () => void;
  onVoice: (engine: Engine, voice: string) => void;
  playing?: { engine: Engine; isPaused: boolean };
  sample: string;
  status: Status;
  title: string;
}
