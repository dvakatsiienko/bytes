import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {

    return (
        <main className='profile-page mx-auto grid w-full max-w-7xl gap-8 px-2 pb-2 sm:px-0 sm:pb-4 md:max-w-xl lg:max-w-2xl'>
            <form className='grid gap-6 self-end'>
                <h1 className='w-full text-lg font-semibold'>⚡ Welcome!</h1>
                <p>
                    You can customize your friends qualities here.
                    <br />
                    Tell what you would like their attitude would be.
                </p>

                <a className='text-link-active' href='#'>
                    Subscribe for more customization!
                </a>

                <div className='flex items-center justify-between gap-4'>
                    <span>🚧 not connected 🚧</span>
                </div>

                <Textarea
                    placeholder='Enter character quirks you would like to have...'
                    className='h-40'
                />
            </form>
        </main>
    );
}
