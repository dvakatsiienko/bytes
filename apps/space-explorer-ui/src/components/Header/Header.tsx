import { ThemeToggle } from '../ThemeToggle';
import dog1Png from './img/dog-1.png';
import dog2Png from './img/dog-2.png';
import dog3Png from './img/dog-3.png';

export const Header = (props: HeaderProps) => {
  const token = localStorage.getItem('token');
  const email = token ? window.atob(token) : '';
  const avatar = props.image || pickAvatarByEmail(email);
  const avatarCn = props.image
    ? 'border border-line bg-bg-lift'
    : 'rounded-full';

  return (
    <header className='mb-8 flex items-center gap-4 border-line border-b pb-4'>
      {/** biome-ignore lint/performance/noImgElement: vite app, the next rule does not apply */}
      <img
        alt=''
        className={`size-14 shrink-0 object-cover ${avatarCn}`}
        height={56}
        src={avatar}
        width={56}
      />
      <div className='min-w-0'>
        <h1 className='select-text truncate font-bold text-fg-soft text-lg leading-tight'>
          {props.title}
        </h1>
        <p className='select-text truncate text-mute text-xs'>{email}</p>
      </div>
      <div className='ml-auto'>
        <ThemeToggle />
      </div>
    </header>
  );
};

/* Helpers */
const max = 25; // 25 letters in the alphabet
const offset = 97; // letter A's charcode is 97
const avatars = [dog1Png, dog2Png, dog3Png];
const maxIndex = avatars.length - 1;

function pickAvatarByEmail(email: string) {
  const charCode = email.toLowerCase().charCodeAt(0) - offset;

  if (Number.isNaN(charCode)) return avatars[0];

  const percentile = Math.max(0, Math.min(max, charCode)) / max;

  return avatars[Math.round(maxIndex * percentile)];
}

/* Types */
interface HeaderProps {
  image?: string;
  title: string;
}
