import { Check } from '@gravity-ui/icons';
import clsx from 'clsx';
import { useField } from 'formik';
import { memo, useCallback } from 'react';
import isEqual from 'react-fast-compare';

interface Props {
    isEditable?: boolean;
    title: string;
    permissions: string[];
    className?: string;
    children: React.ReactNode;
}

const PermissionTitleBox: React.FC<Props> = memo(({ isEditable, title, permissions, className, children }) => {
    const [{ value }, , { setValue }] = useField<string[]>('permissions');

    const allChecked = permissions.every((p) => value.includes(p));

    const onToggleAll = useCallback(() => {
        if (allChecked) {
            setValue(value.filter((p) => !permissions.includes(p)));
        } else {
            setValue([...value, ...permissions.filter((p) => !value.includes(p))]);
        }
    }, [permissions, value, allChecked]);

    return (
        <div
            className={clsx(
                'bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-white/10',
                className,
            )}
        >
            <div className='px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]'>
                <h4 className='text-xs font-black uppercase tracking-[0.15em] text-zinc-400'>{title}</h4>

                {isEditable && (
                    <button
                        type='button'
                        onClick={onToggleAll}
                        className={clsx(
                            'group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border',
                            allChecked
                                ? 'bg-blue-500/10 border-blue-500/20 text-brand'
                                : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10',
                        )}
                    >
                        <div
                            className={clsx(
                                'w-4 h-4 rounded-md border flex items-center justify-center transition-all',
                                allChecked
                                    ? 'bg-brand border-brand'
                                    : 'bg-zinc-900 border-white/10 group-hover:border-white/20',
                            )}
                        >
                            {allChecked && <Check width={12} height={12} className='text-white' />}
                        </div>
                        <span className='text-[10px] font-black uppercase tracking-widest'>
                            {allChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </span>
                    </button>
                )}
            </div>

            <div className='p-6'>{children}</div>
        </div>
    );
}, isEqual);

PermissionTitleBox.displayName = 'PermissionTitleBox';

export default PermissionTitleBox;
