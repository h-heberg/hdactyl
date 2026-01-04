import { type ClassValue, clsx } from 'clsx';
import { FieldProps, Field as FormikField } from 'formik';
import { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';

// Utilitaire pour fusionner les classes Tailwind proprement
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OwnProps {
    name: string;
    label?: string;
    description?: string;
    validate?: (value: any) => undefined | string | Promise<any>;
    containerClassName?: string;
}

type Props = OwnProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'> & { id?: string };

const Field = forwardRef<HTMLInputElement, Props>(
    ({ name, label, description, validate, containerClassName, className, id, ...props }, ref) => {
        const generatedId = useId();
        const resolvedId = id || generatedId;

        return (
            <FormikField innerRef={ref} name={name} validate={validate}>
                {({ field, form: { errors, touched, isSubmitting } }: FieldProps) => {
                    const hasError = !!(touched[field.name] && errors[field.name]);

                    return (
                        <div className={cn('flex flex-col gap-1.5', containerClassName)}>
                            {label && (
                                <label className='text-xs font-medium text-white/50 ml-1' htmlFor={id}>
                                    {label}
                                </label>
                            )}

                            <input
                                id={resolvedId}
                                {...field}
                                {...props}
                                disabled={props.disabled || isSubmitting}
                                className={cn(
                                    // Base styles (en cohérence avec ton bg-[#ffffff17])
                                    'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm transition-all outline-hidden',
                                    'placeholder:text-white/20 text-white',
                                    // Hover & Focus states
                                    'hover:border-white/20 focus:border-brand/50 focus:bg-white/10',
                                    // Error state
                                    hasError && 'border-red-500/50 bg-red-500/5 focus:border-red-500',
                                    // Disabled state
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    className,
                                )}
                            />

                            <div className='min-h-[1.25rem] px-1'>
                                {hasError ? (
                                    <p className='text-[12px] font-medium text-[#d36666] animate-in fade-in slide-in-from-top-1'>
                                        {String(errors[field.name]).charAt(0).toUpperCase() +
                                            String(errors[field.name]).slice(1)}
                                    </p>
                                ) : description ? (
                                    <p className='text-[12px] text-white/40'>{description}</p>
                                ) : null}
                            </div>
                        </div>
                    );
                }}
            </FormikField>
        );
    },
);

Field.displayName = 'Field';

export default Field;
