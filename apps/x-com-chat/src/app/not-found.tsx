export default function NotFound() {
    return (
        <section className='page-layout-error gap-4'>
            <h1 className='justify-self-start'>👽 Hi there! I&apos;m AECSS.</h1>

            <div className='grid gap-2 text-base font-medium'>
                <p>It stands for Alien Emergency Client Support Server.</p>
                <p>There is no page here. If an issue persists, please call me.</p>

                <a href='tel:+6494461709' className='text-link-active'>
                    +1-442-617-0944
                </a>

                <p>Otherwise, tap my head in Header which will bring you to a chat page.</p>
            </div>
        </section>
    );
}
