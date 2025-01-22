/* Core */
import { Button } from 'ui';
import { sum } from 'utils';

export default () => {
    return (
        <section>
            <h1 className = 'text-3xl font-bold underline'>Hello world!</h1>

            <h1>
                Web
                <br />
                {sum(1, 2)}
            </h1>
            <Button text = 'Click me...' />
        </section>
    );
};
