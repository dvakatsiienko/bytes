import { cx } from 'cva';

import dog1Png from './img/dog-1.png';
import dog2Png from './img/dog-2.png';
import dog3Png from './img/dog-3.png';

export const Header = (props: HeaderProps) => {
  const { image, title } = props;
  const email = window.atob(localStorage.getItem('token') as string);
  const avatar = image || pickAvatarByEmail('test@email.com');

  return (
    <section className='mb-9 flex items-center'>
      {/** biome-ignore lint/performance/noImgElement: todo — make nextjs biome rules specific to each next app instaed of applying globally */}
      <img
        alt='Space dog'
        className={cx('mr-5 size-33', { 'rounded-full': !image })}
        height={135}
        src={avatar}
        width={135}
      />
      <div>
        <h2>{title}</h2>
        <h5 className='mt-1 text-text-secondary'>{email}</h5>
      </div>
    </section>
  );
};

/* Helpers */
const max = 25; // 25 letters in the alphabet
const offset = 97; // letter A's charcode is 97
const avatars = [dog1Png, dog2Png, dog3Png];
const maxIndex = avatars.length - 1;

function pickAvatarByEmail(email: string) {
  const charCode = email.toLowerCase().charCodeAt(0) - offset;
  const percentile = Math.max(0, Math.min(max, charCode)) / max;

  return avatars[Math.round(maxIndex * percentile)];
}

/* Types */
interface HeaderProps {
  title: string;
  image?: string;
}
