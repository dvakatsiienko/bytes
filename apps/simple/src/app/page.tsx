/* Core */
import { Button } from 'ui';
import { sum } from 'utils';

export default () => {
    return (
        <section className = 'grid grid-cols-1 place-items-center'>
            <section className = 'prose w-full'>
                <h1 className = 'text-center'>Hello world!</h1>

                <h2>{sum(24, 24)}</h2>

                <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magnam illo porro
                    voluptatibus quo, eaque qui vero distinctio, voluptates ea ab ex quas aliquam
                    molestiae officia nobis facilis beatae molestias praesentium!
                </p>

                <Button text = 'Click me...' />
            </section>
        </section>
    );
};
