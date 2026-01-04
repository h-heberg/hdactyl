import { Xmark } from '@gravity-ui/icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useContext, useEffect, useState } from 'react';

import ActionButton from '@/components/elements/ActionButton';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';

import asDialog from '@/hoc/asDialog';

import { ServerContext } from '@/state/server';

/**
 * CircleProgress refait avec un style plus "SaaS"
 */
const CircleProgress = ({ progress, className }: { progress: number; className?: string }) => {
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg className={className} viewBox='0 0 32 32'>
            <circle
                stroke='currentColor'
                strokeWidth='3'
                fill='transparent'
                r={radius}
                cx='16'
                cy='16'
                className='text-zinc-700'
            />
            <circle
                className='transition-all duration-500 ease-out text-indigo-500'
                stroke='currentColor'
                strokeWidth='3'
                strokeLinecap='round'
                fill='transparent'
                r={radius}
                cx='16'
                cy='16'
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform='rotate(-90 16 16)'
            />
        </svg>
    );
};

const FileUploadList = () => {
    const { close } = useContext(DialogWrapperContext);
    const cancelFileUpload = ServerContext.useStoreActions((actions) => actions.files.cancelFileUpload);
    const clearFileUploads = ServerContext.useStoreActions((actions) => actions.files.clearFileUploads);
    const uploads = ServerContext.useStoreState((state) =>
        Object.entries(state.files.uploads).sort(([a], [b]) => a.localeCompare(b)),
    );

    return (
        <Tooltip.Provider>
            <div className='space-y-3 mt-4'>
                <div className='max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar'>
                    {uploads.map(([name, file]) => {
                        const progress = Math.floor((file.loaded / file.total) * 100);
                        return (
                            <div
                                key={name}
                                className='flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl transition-all hover:border-zinc-700'
                            >
                                <div className='relative shrink-0'>
                                    <CircleProgress progress={progress} className='w-8 h-8' />
                                    <span className='absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-400'>
                                        {progress}%
                                    </span>
                                </div>

                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-medium text-zinc-200 truncate'>{name}</p>
                                    <p className='text-xs text-zinc-500 uppercase tracking-wider'>Uploading...</p>
                                </div>

                                <ActionButton
                                    variant='secondary'
                                    size='sm'
                                    onClick={() => cancelFileUpload(name)}
                                    className='!p-2 !bg-transparent hover:!bg-red-500/10 hover:!text-red-400 border-none transition-colors'
                                >
                                    <Xmark />
                                </ActionButton>
                            </div>
                        );
                    })}
                </div>

                <Dialog.Footer>
                    <ActionButton variant='secondary' onClick={close} className='text-zinc-400 hover:text-white'>
                        Réduire
                    </ActionButton>
                    <ActionButton variant='danger' onClick={() => clearFileUploads()}>
                        Tout annuler
                    </ActionButton>
                </Dialog.Footer>
            </div>
        </Tooltip.Provider>
    );
};

const FileUploadListDialog = asDialog({
    title: 'Transferts en cours',
    description: 'Vos fichiers sont en cours de téléchargement sur le serveur.',
})(FileUploadList);

const FileManagerStatus = () => {
    const [open, setOpen] = useState(false);
    const count = ServerContext.useStoreState((state) => Object.keys(state.files.uploads).length);

    useEffect(() => {
        if (count === 0) setOpen(false);
    }, [count]);

    return (
        <>
            <Tooltip.Provider>
                {count > 0 && (
                    <Tooltip.Root delayDuration={100}>
                        <Tooltip.Trigger asChild>
                            <button
                                onClick={() => setOpen(true)}
                                className='group relative flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/30 transition-all active:scale-95'
                            >
                                {/* Effet de Pulse */}
                                <span className='absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20'></span>

                                <svg className='animate-spin h-6 w-6 text-white' viewBox='0 0 24 24'>
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='3'
                                        fill='none'
                                    />
                                    <path
                                        className='opacity-100'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    />
                                </svg>

                                {/* Badge de comptage */}
                                <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white shadow-sm'>
                                    {count}
                                </span>
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content
                                side='left'
                                className='px-3 py-2 text-xs font-medium bg-zinc-900 text-zinc-200 rounded-lg shadow-xl border border-zinc-800 mb-2'
                                sideOffset={10}
                            >
                                {count} fichier{count > 1 ? 's' : ''} en cours...
                                <Tooltip.Arrow className='fill-zinc-800' />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                )}
                <FileUploadListDialog open={open} onClose={() => setOpen(false)} />
            </Tooltip.Provider>
        </>
    );
};

export default FileManagerStatus;
