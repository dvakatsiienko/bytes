/* Core */
import { Button } from 'ui';
import { sum } from 'utils';

const Web = () => {
    return (
        <div>
            <h1>
                Web...
                <br />
                {sum(1, 2)}
            </h1>
            <Button />
        </div>
    );
};

export default Web;
