import clsx from 'clsx';

interface ChartBlockProps {
    title: string;
    icon?: React.ReactNode;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

// eslint-disable-next-line react/display-name
export default ({ title, icon, legend, children }: ChartBlockProps) => (
    <div
        className={
            'bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 transition-all duration-300 hover:border-white/10 hover:bg-zinc-950/60 shadow-2xl group'
        }
    >
        <div className={'flex items-center justify-between mb-6'}>
            <div className='flex items-center gap-3'>
                {icon && (
                    <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all duration-300'>
                        {icon}
                    </div>
                )}
                <div className='flex flex-col gap-0.5'>
                    <h3
                        className={
                            'text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-300 transition-colors'
                        }
                    >
                        {title}
                    </h3>
                    <div className='h-0.5 w-4 bg-white/10 rounded-full group-hover:w-8 group-hover:bg-white/20 transition-all duration-500' />
                </div>
            </div>

            {legend && <div className={'flex items-center gap-3'}>{legend}</div>}
        </div>

        <div className={'relative w-full h-40 sm:h-44'}>{children}</div>
    </div>
);
