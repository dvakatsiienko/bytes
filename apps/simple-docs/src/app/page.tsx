/* Core */
import { Button } from 'ui';
import { sum } from 'utils';

export default () => {
    return (
        <section>
            <h1>
                Docs
                <br />
                {sum(1, 2)}
            </h1>
            <Button />
        </section>
    );
};
