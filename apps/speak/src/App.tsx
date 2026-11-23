import { useEffect, useRef, useState } from 'react';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { Column } from '@/components/Column.tsx';
import { Info } from '@/components/Info.tsx';
import { MsBox, MsSetting } from '@/components/MsSetting.tsx';
import { SectionFallback } from '@/components/SectionFallback.tsx';

import {
  type Answer,
  type Config,
  type Engine,
  type EngineSettings,
  LANGS,
  type Lang,
  api,
  voiceOf,
} from '@/api.ts';
import { LIMITS } from '@/limits.ts';
import { useSettings } from '@/useSettings.ts';

export const App = () => {
  const settings = useSettings();
  const draft = settings.config;
  const voices = useQuery({
    queryFn: api.voices,
    queryKey: ['voices'],
    staleTime: Number.POSITIVE_INFINITY,
  });
  // the card whose ▶ started the speech; its controls follow the daemon's status until the speech ends
  const [playing, setPlaying] = useState<Playing>();
  // polled while the tab is visible (react-query stops it with the tab); fast while a card plays
  const status = useQuery({
    queryFn: api.status,
    queryKey: ['status'],
    refetchInterval: playing ? 700 : 5000,
  });
  const [samples, setSamples] = useState<Record<Lang, string>>(SAMPLES);
  const dragStart = useRef<Config['chain']>(undefined);
  // the pill's infinite waveform: it plays the draft's glide and flow live, re-arms the daemon's 5-minute deadline
  // every minute, and turns off when toggled off, on unmount, or when the tab goes away
  const [isWaveOn, setIsWaveOn] = useState(false);
  const glide = draft?.meterGlideMs;
  const flow = draft?.meterFlowMs;
  useEffect(() => {
    if (isWaveOn) void api.wave({ flow, glide, on: true });
  }, [isWaveOn, glide, flow]);
  useEffect(() => {
    if (!isWaveOn) return;
    const off = () =>
      navigator.sendBeacon(
        '/api/wave',
        new Blob([JSON.stringify({ on: false })], {
          type: 'application/json',
        }),
      );
    const keepAlive = setInterval(() => void api.wave({ on: true }), 60_000);
    window.addEventListener('pagehide', off);
    return () => {
      clearInterval(keepAlive);
      window.removeEventListener('pagehide', off);
      void api.wave({ on: false });
    };
  }, [isWaveOn]);
  const [message, setMessage] = useState<{
    text: string;
    kind?: 'ok' | 'error';
  }>({ text: 'no changes' });

  // an action that did not happen says why in the save line
  const report = async (action: Promise<Answer>) => {
    const { error } = await action;
    if (error !== undefined) setMessage({ kind: 'error', text: error });
    return error === undefined;
  };

  // a preview counts as over once the daemon was seen speaking and then went quiet, or never started within 8 s
  useEffect(() => {
    if (!(playing && status.data)) return;
    if (status.data.speaking) {
      if (!playing.hasStarted) setPlaying({ ...playing, hasStarted: true });
    } else if (playing.hasStarted || Date.now() - playing.since > 8000) {
      setPlaying(undefined);
    }
  }, [status.data, playing]);

  if (!draft)
    return (
      <p className='p-4 text-muted'>
        {settings.error ? settings.error.message : 'reading the settings…'}
      </p>
    );

  const edit = (change: (config: Config) => Config) => {
    settings.edit(change);
    setMessage({ text: 'unsaved changes' });
  };
  const editEngine = (
    engine: Engine,
    change: (current: EngineSettings) => EngineSettings,
  ) =>
    edit((config) => ({
      ...config,
      engines: {
        ...config.engines,
        [engine]: change(config.engines[engine] ?? {}),
      },
    }));
  const setEngine = (engine: Engine, patch: EngineSettings) =>
    editEngine(engine, (current) => ({ ...current, ...patch }));
  const setVoice = (engine: Engine, lang: Lang, voice: string) =>
    editEngine(engine, (current) => {
      const { [lang]: _, ...others } = current.voice ?? {};
      return {
        ...current,
        voice: voice ? { ...others, [lang]: voice } : others,
      };
    });
  // a ♥ saves at once, outside the save button, and carries no other edit with it
  const setFavourite = async (engine: Engine, voice: string, isOn: boolean) => {
    const refusal = await settings.heart({ engine, isOn, voice });
    if (refusal)
      setMessage({ kind: 'error', text: `♥ not saved — ${refusal.error}` });
  };
  const preview = async (engine: Engine, lang: Lang) => {
    const voice = voiceOf(draft, engine, lang);
    const reply = await api.preview({
      engine,
      settings: {
        ...draft.engines[engine],
        voice: voice ? { [lang]: voice } : {},
      },
      text: samples[lang],
    });
    if (reply.error) return setMessage({ kind: 'error', text: reply.error });
    setMessage({ text: `▶ ${engine} · ${lang}` });
    setPlaying({ engine, hasStarted: false, lang, since: Date.now() });
  };
  const pause = async () => {
    await report(api.pause());
    await status.refetch();
  };
  const stop = async () => {
    if (await report(api.stop())) setPlaying(undefined);
  };
  const reset = async () => {
    const { error } = await settings.reset();
    setMessage(
      error
        ? { kind: 'error', text: error.message }
        : { text: 'reset to the saved config' },
    );
  };
  const save = async () => {
    const refusal = await settings.save();
    if (!refusal)
      return setMessage({ kind: 'ok', text: 'saved · the daemon loaded it' });
    const wayOut = refusal.stale ? ' · reset loads them' : '';
    setMessage({
      kind: 'error',
      text: `rejected — ${refusal.error}${wayOut}`,
    });
  };

  const statusData = status.data ?? {};
  const healthText = status.error
    ? status.error.message
    : `daemon up${statusData.accessibility === false ? ' · accessibility missing' : ''}${statusData.speaking ? ' · speaking' : ''}`;

  const columnListJSX = LANGS.map(([lang, title]) => {
    return (
      <ErrorBoundary
        FallbackComponent={SectionFallback}
        key={lang}
        resetKeys={[lang]}>
        <Column
          config={draft}
          lang={lang}
          onChain={(chain) =>
            edit((config) => ({
              ...config,
              chain: { ...config.chain, [lang]: chain },
            }))
          }
          onFavourite={(engine, voice, isFavourite) =>
            void setFavourite(engine, voice, isFavourite)
          }
          onPause={() => void pause()}
          onPreview={(engine) => void preview(engine, lang)}
          onSample={(sample) => setSamples({ ...samples, [lang]: sample })}
          onSettings={setEngine}
          onStop={() => void stop()}
          onVoice={(engine, voice) => setVoice(engine, lang, voice)}
          playing={
            playing?.lang === lang
              ? {
                  engine: playing.engine,
                  isPaused: statusData.paused === true,
                }
              : undefined
          }
          sample={samples[lang]}
          status={statusData}
          title={title}
          voices={voices.data}
        />
      </ErrorBoundary>
    );
  });

  const langLinkListJSX = LANGS.map(([lang, title]) => {
    return (
      <li key={lang}>
        <a
          className='block rounded-full px-3 py-1 text-sm text-pill-muted no-underline hover:bg-pill-hover hover:text-pill-ink'
          href={`#col-${lang}`}>
          {title}
        </a>
      </li>
    );
  });

  return (
    <>
      <div className='sticky top-3 z-30 mx-auto mt-3 max-w-[1280px] px-4'>
        <header className={capsuleClass}>
          <h1 className='m-0 text-lg'>
            <a
              className='flex items-center gap-2 rounded-full font-bold text-pill-ink no-underline hover:text-white'
              href='/'
              // one page: home is the top of it, with the #column anchor dropped — never a reload,
              // which would throw away unsaved edits
              onClick={(event) => {
                event.preventDefault();
                history.pushState(null, '', '/');
                window.scrollTo({
                  behavior: matchMedia('(prefers-reduced-motion: reduce)')
                    .matches
                    ? 'instant'
                    : 'smooth',
                  top: 0,
                });
              }}>
              <MeterMark />
              speak
            </a>
          </h1>
          <nav aria-label='languages'>
            <ul className='m-0 flex list-none gap-1 p-0'>{langLinkListJSX}</ul>
          </nav>
          <span className='flex-1' />
          <span className='select-text text-sm text-pill-muted'>
            {healthText}
          </span>
          <button
            className={pillButtonClass}
            onClick={() => void stop()}
            type='button'>
            ■ stop
          </button>
        </header>
      </div>
      <div className='mx-auto max-w-[1280px] px-4 pt-4'>
        <section
          aria-label='playback'
          className='flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[22px] border border-line bg-surface px-5 py-3'>
          <div className='flex items-center gap-2 text-sm text-muted'>
            <span className='flex items-center gap-1 whitespace-nowrap'>
              first audio budget
              <Info
                below
                text='how long a cloud voice gets to start before the next takes over. too many fallbacks → raise it. try 900'
              />
            </span>
            <MsBox
              className='w-20'
              label='first audio budget in ms'
              limit={LIMITS.firstAudioMs}
              onChange={(value) =>
                edit((config) => ({ ...config, firstAudioMs: value }))
              }
              step={50}
              value={draft.firstAudioMs}
            />{' '}
            ms
          </div>
          <MsSetting
            info='how smoothly a bar reaches its height. too sharp → raise it. try 30'
            label='pill glide'
            limit={LIMITS.meterGlideMs}
            onChange={(value) =>
              edit((config) => ({ ...config, meterGlideMs: value }))
            }
            value={draft.meterGlideMs ?? LIMITS.meterGlideMs.default}
          />
          <MsSetting
            info='how fast the wave travels outward. too fast → raise it first. try 70'
            label='pill flow'
            limit={LIMITS.meterFlowMs}
            onChange={(value) =>
              edit((config) => ({ ...config, meterFlowMs: value }))
            }
            value={draft.meterFlowMs ?? LIMITS.meterFlowMs.default}
          />
          <label className='flex min-h-8 cursor-pointer select-none items-center gap-2.5 text-sm text-muted'>
            <input
              aria-checked={isWaveOn}
              checked={isWaveOn}
              className='size-4'
              onChange={(event) => setIsWaveOn(event.target.checked)}
              role='switch'
              type='checkbox'
            />
            infinite waveform
          </label>
        </section>
      </div>
      <DragDropProvider
        // react owns the order through the whole drag: move() on every drag-over, the snapshot back on a
        // cancel. applying it only on drop fought dnd-kit's optimistic dom reorder (the page and the ranks
        // disagreed after a keyboard drag)
        onDragEnd={(event) => {
          const { current: chain } = dragStart;
          if (event.canceled && chain) edit((config) => ({ ...config, chain }));
          dragStart.current = undefined;
        }}
        onDragOver={(event) => {
          const ids = Object.fromEntries(
            LANGS.map(([lang]) => [
              lang,
              (draft.chain[lang] ?? []).map((engine) => `${lang}:${engine}`),
            ]),
          );
          const moved = move(ids, event);
          const chain = Object.fromEntries(
            Object.entries(moved).map(([lang, list]) => [
              lang,
              list.map((id) => String(id).split(':')[1] as Engine),
            ]),
          );
          if (JSON.stringify(chain) !== JSON.stringify(draft.chain))
            edit((config) => ({ ...config, chain }));
        }}
        onDragStart={() => {
          dragStart.current = draft.chain;
        }}>
        <main className='mx-auto grid max-w-[1280px] grid-cols-1 gap-x-6 gap-y-10 px-4 pt-8 pb-28 min-[900px]:grid-cols-3'>
          {columnListJSX}
        </main>
      </DragDropProvider>
      <div className='sticky bottom-3 z-30 mx-auto max-w-[1280px] px-4'>
        <footer className='flex flex-wrap items-center gap-2 rounded-[22px] border border-pill-line bg-pill/95 p-2 text-pill-ink shadow-lg'>
          <button
            className={savePillClass}
            disabled={!settings.isDirty}
            onClick={() => void save()}
            type='button'>
            save
          </button>
          <button
            className={pillButtonClass}
            disabled={!settings.isDirty}
            onClick={() => void reset()}
            type='button'>
            reset
          </button>
          <span
            className={`select-text px-2 text-sm ${message.kind ? messageColour[message.kind] : 'text-pill-muted'}`}
            role='status'>
            {message.text}
          </span>
        </footer>
      </div>
    </>
  );
};

// the pill's meter as a still mark: five bars, centre-heavy, in the live indigo
const MeterMark = () => {
  const barListJSX = [0.35, 0.65, 1, 0.65, 0.35].map((height, index) => {
    return (
      <rect
        fill='var(--color-pill-accent)'
        height={16 * height}
        key={index}
        rx='1.25'
        width='2.5'
        x={3 + index * 4}
        y={12 - 8 * height}
      />
    );
  });
  return (
    <svg aria-hidden='true' className='size-6' viewBox='0 0 24 24'>
      {barListJSX}
    </svg>
  );
};

/* Styles */
// the pill's capsule: dark glass in both themes, a hairline of white, its own ink
const capsuleClass =
  'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] border border-pill-line bg-pill/95 px-3 py-1.5 text-pill-ink shadow-lg';

const pillButtonClass =
  'h-8 rounded-full border border-pill-line px-3.5 text-sm text-pill-ink hover:bg-pill-hover disabled:opacity-50';

// its own classes, not pillButtonClass plus overrides: two bg utilities on one element resolve by stylesheet order
const savePillClass =
  'h-8 rounded-full border border-pill-accent bg-pill-accent px-3.5 text-sm font-semibold text-pill hover:brightness-110 disabled:opacity-50';

const messageColour = {
  error: 'text-pill-bad',
  ok: 'text-pill-ok',
} as const;

/* Helpers */
const SAMPLES: Record<Lang, string> = {
  en: 'FRM-266 shipped in v0.3.85 → see `speak/`',
  ru: 'Привет! Я прочитаю вслух всё, что ты выделишь, — спокойно, чётко и без спешки.',
  uk: 'Привіт! Я прочитаю вголос усе, що ти виділиш, — спокійно, чітко і без поспіху.',
};

/* Types */
interface Playing {
  engine: Engine;
  hasStarted: boolean;
  lang: Lang;
  since: number;
}
