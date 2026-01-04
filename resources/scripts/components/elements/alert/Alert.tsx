import { CircleExclamationFill, TriangleExclamation } from '@gravity-ui/icons';
import clsx from 'clsx';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

const Alert = ({ type, className, children }: AlertProps) => {
    return (
        <div
            className={clsx(
                'relative flex items-center overflow-hidden transition-all duration-300',
                'px-5 py-4 rounded-[20px] border backdrop-blur-md shadow-lg',
                {
                    // Style Danger (Rouge)
                    'border-red-500/20 bg-red-500/[0.03] text-red-200 shadow-red-500/5': type === 'danger',
                    // Style Warning (Ambre/Jaune)
                    'border-amber-500/20 bg-amber-500/[0.03] text-amber-100 shadow-amber-500/5': type === 'warning',
                },
                className,
            )}
        >
            {/* Barre d'accentuation latérale style "Glow" */}
            <div
                className={clsx(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-r-full shadow-[0_0_15px_rgba(0,0,0,0.5)]',
                    type === 'danger' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-500 shadow-amber-500/50',
                )}
            />

            {/* Background pattern subtil */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className='relative z-10 flex items-center w-full'>
                <div
                    className={clsx(
                        'flex-shrink-0 p-2 rounded-xl mr-4 border border-white/5 bg-black/20',
                        type === 'danger' ? 'text-red-400' : 'text-amber-400',
                    )}
                >
                    {type === 'danger' ? (
                        <CircleExclamationFill width={20} height={20} />
                    ) : (
                        <TriangleExclamation width={20} height={20} />
                    )}
                </div>

                <div className='text-sm font-medium leading-relaxed tracking-tight'>{children}</div>
            </div>
        </div>
    );
};

export default Alert;
