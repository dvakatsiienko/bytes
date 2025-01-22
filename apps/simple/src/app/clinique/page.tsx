/* Components */
import { SvgLogo } from './svg/SvgLogo';

export default () => {
    return (
        <main className = 'font'>
            <section>
                <header className = 'flex justify-center px-4 py-4 sm:justify-between sm:py-6 md:px-16'>
                    <SvgLogo />

                    <nav className = 'hidden gap-4 text-lg font-bold sm:flex md:gap-8 lg:gap-12'>
                        <div>New</div>
                        <div>clinique iD™</div>
                        <div>Best Sellers</div>
                        <div>Shop All</div>
                    </nav>
                </header>
            </section>
        </main>
    );
};
