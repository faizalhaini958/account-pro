import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background pt-6 sm:pt-0">
            <div className="mb-6">
                <Link href="/" className="flex flex-col items-center gap-2">
                    <span className="text-3xl font-extrabold tracking-tighter">
                        BukuKira
                    </span>
                    <span className="text-muted-foreground text-sm font-medium tracking-wide">
                        Modern Accounting Software
                    </span>
                </Link>
            </div>

            <div className="w-full overflow-hidden bg-card px-8 py-8 shadow-2xl sm:max-w-3xl sm:rounded-3xl border relative">
                {children}
            </div>

            <div className="mt-8 text-muted-foreground text-sm">
                &copy; 2026 BukuKira
            </div>
        </div>
    );
}
