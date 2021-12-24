/* Core */
import { Button } from 'ui';
import { sum } from 'utils';

const Docs = () => {
    return (
        <div>
            <h1>Docs {sum(1, 2)}</h1>
            <Button />
        </div>
    );
};

export default Docs;
