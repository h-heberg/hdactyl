import { CircleCheckFill, CircleExclamationFill, CircleInfoFill, TriangleExclamationFill } from '@gravity-ui/icons';
import clsx from 'clsx';
import styled from 'styled-components';

import Code from './elements/Code';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const typeStyles = {
    success: {
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/5',
        text: 'text-emerald-400',
        icon: CircleCheckFill,
        glow: 'shadow-emerald-500/10',
    },
    error: {
        border: 'border-red-500/20',
        bg: 'bg-red-500/5',
        text: 'text-red-400',
        icon: CircleExclamationFill,
        glow: 'shadow-red-500/10',
    },
    warning: {
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/5',
        text: 'text-amber-400',
        icon: TriangleExclamationFill,
        glow: 'shadow-amber-500/10',
    },
    info: {
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        text: 'text-blue-400',
        icon: CircleInfoFill,
        glow: 'shadow-blue-500/10',
    },
};

const Container = styled.div<{ $type?: FlashMessageType }>``;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type = 'info' }: Props) => {
    const style = typeStyles[type];
    const Icon = style.icon;

    return (
        <Container
            className={clsx(
                'relative flex flex-col gap-3 p-4 rounded-2xl mb-6 backdrop-blur-xl border transition-all duration-300 shadow-lg',
                style.bg,
                style.border,
                style.glow,
            )}
            $type={type}
            role={'alert'}
        >
            <div
                className={clsx(
                    'absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-current to-transparent opacity-20',
                    style.text,
                )}
            />

            <div className='flex items-center gap-3'>
                <div className={clsx('p-2 rounded-lg bg-black/20 border border-white/5', style.text)}>
                    <Icon width={18} height={18} />
                </div>

                {title ? (
                    <h2 className={clsx('font-black text-xs uppercase tracking-[0.2em]', style.text)}>{title}</h2>
                ) : (
                    <h2 className={clsx('font-black text-xs uppercase tracking-[0.2em]', style.text)}>
                        System Message
                    </h2>
                )}
            </div>

            <div className='relative'>
                {/* On enveloppe Code pour qu'il hérite du style sombre transparent */}
                <div className='bg-black/40 rounded-xl border border-white/5 overflow-hidden'>
                    <Code className='!bg-transparent !border-none !p-3 text-zinc-300 font-mono text-xs leading-relaxed'>
                        {children}
                    </Code>
                </div>
            </div>
        </Container>
    );
};

MessageBox.displayName = 'MessageBox';

export default MessageBox;
