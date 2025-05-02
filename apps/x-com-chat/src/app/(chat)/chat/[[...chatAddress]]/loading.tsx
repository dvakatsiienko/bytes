/* Components */
import { SpinnerSvg } from '@/components/svg/SpinnerIcon';

export default function ChatPageSkeleton() {
    return (
        <div className='grid place-content-center'>
            <SpinnerSvg pageLoader />
        </div>
    );
}
