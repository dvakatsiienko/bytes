/* Core */
import cx from 'clsx';

/* Components */
import { Chat } from '@/components/Chat';
import { Header } from '@/components/Header';
import { SigninButton } from './SigninButton';

/* Instruments */
import styles from './chat-page-layout.module.css';

/* eslint-disable */
const rerrrrrrrrrrrrrr = 2

const Home = () => {
    return (
        <main className={cx(styles['chat-page-layout'], 'z-10')}>
            <Header>
                <SigninButton />
            </Header>

            <div className='hero relative isolate grid'>
                <div
                    aria-hidden="true"
                    className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
                    <div
                        className='aspect-1155/678 bg-linear-to-tr relative left-[calc(50%-11rem)] w-[36.125rem] -translate-x-1/2 rotate-[30deg] from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                <Chat />

                <div
                    aria-hidden='true'
                    className='fixed inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl'>
                    <div
                        className='aspect-1155/678 bg-linear-to-tr relative left-[calc(50%+3rem)] w-[36.125rem] -translate-x-1/2 from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]'
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>
        </main>
    );
};

export default Home;
