import { Check } from '@gravity-ui/icons';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            'peer h-5 w-5 shrink-0 rounded-lg border-2 border-white/20 shadow-sm transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-black',
            'hover:border-white/40',
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current animate-in zoom-in-50 duration-200')}
        >
            <Check className='h-4 w-4 stroke-[3px]' />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));

Checkbox.displayName = 'Checkbox';

export { Checkbox };
