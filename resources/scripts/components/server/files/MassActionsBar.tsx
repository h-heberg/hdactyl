import { Archive, Xmark } from '@gravity-ui/icons';
import { useEffect, useState } from 'react';
import { LuFolderOpen, LuTrash } from 'react-icons/lu';

import ActionButton from '@/components/elements/ActionButton';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import RenameFileModal from '@/components/server/files/RenameFileModal';

import compressFiles from '@/api/server/files/compressFiles';
import deleteFiles from '@/api/server/files/deleteFiles';

import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';

const MassActionsBar = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMove, setShowMove] = useState(false);

    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const selectedFiles = ServerContext.useStoreState((state) => state.files.selectedFiles);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    useEffect(() => {
        if (!loading) setLoadingMessage('');
    }, [loading]);

    const onClickCompress = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage('Archivage des fichiers...');

        compressFiles(uuid, directory, selectedFiles)
            .then(() => mutate())
            .then(() => setSelectedFiles([]))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => setLoading(false));
    };

    const onClickConfirmDeletion = () => {
        setLoading(true);
        setShowConfirm(false);
        clearFlashes('files');
        setLoadingMessage('Suppression des fichiers...');

        deleteFiles(uuid, directory, selectedFiles)
            .then(async () => {
                await mutate((files) => files!.filter((f) => selectedFiles.indexOf(f.name) < 0), false);
                setSelectedFiles([]);
            })
            .catch(async (error) => {
                await mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .finally(() => setLoading(false));
    };

    if (selectedFiles.length === 0 && !loading) return null;

    return (
        <>
            <SpinnerOverlay visible={loading} size={'large'} fixed>
                {loadingMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                title={'Supprimer les fichiers'}
                open={showConfirm}
                confirm={'Supprimer définitivement'}
                onClose={() => setShowConfirm(false)}
                onConfirmed={onClickConfirmDeletion}
                loading={loading}
            >
                <p className='mb-4 text-neutral-400'>
                    Êtes-vous sûr de vouloir supprimer{' '}
                    <span className='text-white font-bold'>{selectedFiles.length} fichier(s)</span> ? Cette action est
                    irréversible.
                </p>
                <div className='bg-black/20 border border-white/5 rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar'>
                    <ul className='text-xs space-y-1 text-neutral-500 font-mono'>
                        {selectedFiles.slice(0, 10).map((file) => (
                            <li key={file} className='truncate'>
                                • {file}
                            </li>
                        ))}
                        {selectedFiles.length > 10 && (
                            <li className='text-brand italic pt-1'>... et {selectedFiles.length - 10} autres</li>
                        )}
                    </ul>
                </div>
            </Dialog.Confirm>

            {showMove && (
                <RenameFileModal
                    files={selectedFiles}
                    visible
                    appear
                    useMoveTerminology
                    onDismissed={() => setShowMove(false)}
                />
            )}

            {/* Barre flottante - Transition via classes CSS standard */}
            <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 animate-in fade-in slide-in-from-bottom-4 duration-300'>
                <div className='flex items-center gap-2 bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl shadow-black/50'>
                    <div className='px-4 border-r border-white/10 flex items-center gap-3'>
                        <div className='flex items-center justify-center w-6 h-6 bg-brand rounded-full text-[10px] font-bold text-brand-950'>
                            {selectedFiles.length}
                        </div>
                        <span className='text-xs font-medium text-neutral-300 hidden sm:inline'>Sélectionnés</span>
                    </div>

                    <div className='flex items-center gap-1.5 px-2'>
                        <ActionButton
                            variant='secondary'
                            size='sm'
                            onClick={() => setShowMove(true)}
                            disabled={loading}
                            className='!bg-transparent hover:!bg-white/5 border-none'
                        >
                            <LuFolderOpen className='w-4 h-4 mr-2 opacity-60' />
                            Déplacer
                        </ActionButton>

                        <ActionButton
                            variant='secondary'
                            size='sm'
                            onClick={onClickCompress}
                            disabled={loading}
                            className='!bg-transparent hover:!bg-white/5 border-none'
                        >
                            <Archive className='w-4 h-4 mr-2 opacity-60' />
                            Archiver
                        </ActionButton>

                        <div className='w-px h-4 bg-white/10 mx-1' />

                        <ActionButton
                            variant='danger'
                            size='sm'
                            onClick={() => setShowConfirm(true)}
                            disabled={loading}
                            className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border-none px-4'
                        >
                            <LuTrash className='w-4 h-4 mr-2' />
                            Supprimer
                        </ActionButton>
                    </div>

                    <button
                        onClick={() => setSelectedFiles([])}
                        className='p-2 hover:bg-white/5 rounded-xl transition-colors text-neutral-500 hover:text-white'
                        title='Désélectionner tout'
                    >
                        <Xmark className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </>
    );
};

export default MassActionsBar;
