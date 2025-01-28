/* Components */
import { Header } from './Header';
import { Hero } from './Hero';
import { SigninButton } from './SigninButton';

const Home = () => {
    return (
        <main className = ''>
            {/* <SignIn /> */}
            <Header>
                <SigninButton />
            </Header>
            <Hero />
        </main>
    );
};

export default Home;
