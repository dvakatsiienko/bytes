import { motion } from 'motion/react';

// The fun element for this update — one at a time, replaced whenever the board updates.
// Fixed and pointer-events-none: a flair may never touch the layout.
export const Flair = () => {
  return (
    <div
      aria-hidden
      className='pointer-events-none fixed top-24 right-8 z-50 select-none'>
      <div className='relative grid size-24 place-items-center'>
        {RING_LIST.map((ring) => {
          return (
            <motion.span
              animate={{ opacity: [0.5, 0], scale: [0.3, 1] }}
              className='absolute size-24 rounded-full border border-cobalt'
              key={ring.delay}
              transition={{
                delay: ring.delay,
                duration: 3,
                ease: 'easeOut',
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          );
        })}

        <motion.span
          animate={{ rotate: 360 }}
          className='absolute size-24'
          transition={{
            duration: 9,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}>
          <span className='absolute top-0 left-1/2 -translate-x-1/2 text-2xl'>
            🛰️
          </span>
        </motion.span>

        <span className='size-2 rounded-full bg-cobalt' />
      </div>

      <p className='mt-1 text-center font-mono text-[0.55rem] text-mist uppercase tracking-[0.2em]'>
        uplink
      </p>
    </div>
  );
};

/* Helpers */
const RING_LIST = [{ delay: 0 }, { delay: 1 }, { delay: 2 }];
