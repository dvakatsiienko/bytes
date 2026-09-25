import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

import type { Piece } from '../../art/pieces.ts';
import type { Take } from '../../server/takes.ts';
import { takeUrl } from '../takes.ts';

/** two takes of one piece: next to each other, or stacked under a slider */
export const CompareView = (props: CompareViewProps) => {
  const aspectRatio = `${props.piece.size.w} / ${props.piece.size.h}`;
  const altOf = (take: Take) => `${props.piece.title}, take ${take.id}`;

  if (props.mode === 'slider') {
    return (
      <figure className='flex flex-col gap-2' data-testid='compare-slider'>
        <ReactCompareSlider
          className='rounded-sm'
          itemOne={
            <ReactCompareSliderImage
              alt={altOf(props.a)}
              src={takeUrl(props.a)}
              style={{ aspectRatio }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              alt={altOf(props.b)}
              src={takeUrl(props.b)}
              style={{ aspectRatio }}
            />
          }
        />
        <figcaption className='flex justify-between font-mono text-[12px] text-muted-foreground'>
          <span>{props.a.id}</span>
          <span>{props.b.id}</span>
        </figcaption>
      </figure>
    );
  }

  const sideListJSX = [props.a, props.b].map((take) => {
    return (
      <figure className='flex min-w-0 flex-col gap-2' key={take.id}>
        <img
          alt={altOf(take)}
          className='block h-auto w-full rounded-sm'
          height={props.piece.size.h}
          src={takeUrl(take)}
          style={{ aspectRatio }}
          width={props.piece.size.w}
        />
        <figcaption className='font-mono text-[12px] text-muted-foreground'>
          {take.id}
          {take.note ? ` — ${take.note}` : ''}
        </figcaption>
      </figure>
    );
  });

  return (
    <div className='grid grid-cols-2 gap-4' data-testid='compare-side'>
      {sideListJSX}
    </div>
  );
};

/* Types */

interface CompareViewProps {
  a: Take;
  b: Take;
  mode: 'side' | 'slider';
  piece: Piece;
}
