import { cn } from '@/lib/utils';

type LayoutProps = {
    children: React.ReactNode;
    className?: string;
};

export const Layout = ({ children, className }: LayoutProps) => {
    return (
        <div className={cn('antialiased scroll-smooth focus:scroll-auto', className)}>
            {children}
        </div>
    );
};

type MainProps = {
    children: React.ReactNode;
    className?: string;
    id?: string;
};

export const Main = ({ children, className, id }: MainProps) => {
    return (
        <main
            className={cn(
                'prose prose:font-sans dark:prose-invert md:prose-lg max-w-none',
                'prose-headings:font-normal',
                'prose-a:border-b prose-a:border-b-primary dark:prose-a:border-b-primary',
                'prose-a:font-normal prose-a:text-primary dark:prose-a:text-primary',
                'hover:prose-a:border-b-primary hover:prose-a:opacity-75 dark:hover:prose-a:border-b-primary',
                'prose-a:no-underline prose-a:transition-all',
                'prose-blockquote:not-italic',
                className
            )}
            id={id}
        >
            {children}
        </main>
    );
};

type SectionProps = {
    children: React.ReactNode;
    className?: string;
    id?: string;
};

export const Section = ({ children, className, id }: SectionProps) => {
    return (
        <section className={cn('py-12', className)} id={id}>
            {children}
        </section>
    );
};

type ContainerProps = {
    children: React.ReactNode;
    className?: string;
    id?: string;
};

export const Container = ({ children, className, id }: ContainerProps) => {
    return (
        <div className={cn('max-w-5xl mx-auto', 'p-6 sm:p-8', className)} id={id}>
            {children}
        </div>
    );
};
