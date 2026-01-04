import clsx from 'clsx';
import { useStoreState } from 'easy-peasy';
import { Field, FieldProps } from 'formik';

interface Props {
    permission: string;
    disabled: boolean;
}

const PermissionRow = ({ permission, disabled }: Props) => {
    const [key = '', pkey = ''] = permission.split('.', 2);
    const permissions = useStoreState((state) => state.permissions.data);

    return (
        <Field name={'permissions'}>
            {({ field, form }: FieldProps<string[]>) => {
                const isChecked = field.value.includes(permission);

                return (
                    <label
                        htmlFor={`permission_${permission}`}
                        className={clsx(
                            'relative flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
                            isChecked
                                ? 'bg-brand/[0.05] border-brand/30 ring-1 ring-brand/30'
                                : 'bg-white/[0.01] border-white/[0.05] hover:border-white/10 hover:bg-white/[0.03]',
                            disabled && 'opacity-50 cursor-not-allowed grayscale-[0.5]',
                        )}
                    >
                        <div className='flex items-center justify-between mb-1'>
                            <span
                                className={clsx(
                                    'text-sm font-bold tracking-tight transition-colors',
                                    isChecked ? 'text-brand' : 'text-zinc-200',
                                )}
                            >
                                {pkey}
                            </span>

                            {/* Custom Checkbox Style */}
                            <div className='relative flex items-center justify-center'>
                                <input
                                    type='checkbox'
                                    id={`permission_${permission}`}
                                    className='peer hidden'
                                    checked={isChecked}
                                    onChange={() => {
                                        if (disabled) return;
                                        const nextValue = isChecked
                                            ? field.value.filter((v) => v !== permission)
                                            : [...field.value, permission];
                                        form.setFieldValue('permissions', nextValue);
                                    }}
                                    disabled={disabled}
                                />
                                <div
                                    className={clsx(
                                        'w-5 h-5 rounded-lg border transition-all flex items-center justify-center',
                                        isChecked ? 'bg-brand border-brand' : 'border-white/10 bg-zinc-900',
                                    )}
                                >
                                    {isChecked && (
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                            className='w-3.5 h-3.5 text-white'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(permissions[key]?.keys?.[pkey]?.length ?? 0) > 0 && (
                            <p className='text-[11px] text-zinc-500 font-medium leading-relaxed pr-6'>
                                {permissions[key]?.keys?.[pkey]}
                            </p>
                        )}
                    </label>
                );
            }}
        </Field>
    );
};

export default PermissionRow;
