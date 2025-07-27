export default function NotFound() {
  return (
    <section className='page-layout-error gap-4'>
      <h1 className='justify-self-start'>👽 Hi there! I&apos;m AECSS.</h1>

      <div className='grid gap-2 font-medium text-base'>
        <p>It stands for Alien Emergency Client Support Server.</p>
        <p>There is no page here. If an issue persists, please call me.</p>

        <a className='text-link-active' href='tel:+6494461709'>
          +1-442-617-094
        </a>

        <p>
          Otherwise, tap my head in Header which will bring you to a chat page.
        </p>
      </div>
    </section>
  );
}
