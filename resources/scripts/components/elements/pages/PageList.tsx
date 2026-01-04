import clsx from 'clsx';

interface Props {
    children: React.ReactNode;
    className?: string;
}

const PageListContainer = ({ className, children }: Props) => {
    return (
        <div
            className={clsx(
                className,
                'relative overflow-hidden p-1 border border-white/[0.05] rounded-[24px] bg-white/[0.01] backdrop-blur-sm',
            )}
        >
            <div className='absolute -top-24 -left-24 w-48 h-48 bg-white/[0.02] blur-[60px] pointer-events-none' />

            <div className='relative z-10 flex h-full w-full flex-col gap-1 overflow-hidden'>{children}</div>
        </div>
    );
};
PageListContainer.displayName = 'PageListContainer';

const PageListItem = ({ className, children }: Props) => {
    return (
        <div
            className={clsx(
                className,
                'relative group transition-all duration-300 bg-transparent hover:bg-white/[0.03] px-5 py-4 rounded-[20px] flex items-center gap-3 flex-col sm:flex-row border border-transparent hover:border-white/10',
            )}
        >
            <div className='absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent group-last:hidden' />

            <div className='relative z-10 w-full flex flex-col sm:flex-row items-center gap-3'>{children}</div>
        </div>
    );
};
PageListItem.displayName = 'PageListItem';

export { PageListContainer, PageListItem };
