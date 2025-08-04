import { BrandLogo } from '@/components/brand-logo';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthSplitLayout({ children }: PropsWithChildren) {
    const { quote } = usePage<SharedData>().props;
    const theme = localStorage.getItem('theme');
    if (!theme) {
        document.documentElement.classList.remove('dark'); // default to light
    }

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center bg-card px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <BrandLogo className="size-8 fill-current text-white" />
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[512px]">{children}</div>
            </div>
        </div>
    );
}
