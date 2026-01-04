import { BarsPlay, Copy, FileArrowDown, FileZipper, PencilToLine, Shield, TrashBin } from '@gravity-ui/icons';
import { join } from 'pathe';
import { memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { toast } from 'sonner';

import Can from '@/components/elements/Can';
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/elements/ContextMenu';
import { Dialog } from '@/components/elements/dialog';
import ChmodFileModal from '@/components/server/files/ChmodFileModal';
import RenameFileModal from '@/components/server/files/RenameFileModal';

import compressFiles from '@/api/server/files/compressFiles';
import copyFile from '@/api/server/files/copyFile';
import decompressFiles from '@/api/server/files/decompressFiles';
import deleteFiles from '@/api/server/files/deleteFiles';
import getFileDownloadUrl from '@/api/server/files/getFileDownloadUrl';
import { FileObject } from '@/api/server/files/loadDirectory';

import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';

type ModalType = 'rename' | 'move' | 'chmod';

const FileDropdownMenu = ({ file }: { file: FileObject }) => {
    const [modal, setModal] = useState<ModalType | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError, clearFlashes } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const doDeletion = async () => {
        clearFlashes('files');
        const toastId = toast.loading(`Suppression de ${file.name}...`);

        try {
            // Update optimiste
            await mutate((files) => files!.filter((f) => f.key !== file.key), false);
            await deleteFiles(uuid, directory, [file.name]);
            toast.success(`${file.isFile ? 'Fichier' : 'Dossier'} supprimé`, { id: toastId });
        } catch (error) {
            mutate(); // Rollback
            clearAndAddHttpError({ key: 'files', error });
            toast.error(`Erreur lors de la suppression`, { id: toastId });
        } finally {
            setShowConfirmation(false);
        }
    };

    const doCopy = () => {
        const toastId = toast.loading('Duplication en cours...');
        copyFile(uuid, join(directory, file.name))
            .then(() => mutate())
            .then(() => toast.success('Élément dupliqué avec succès', { id: toastId }))
            .catch((error) => {
                clearAndAddHttpError({ key: 'files', error });
                toast.error('Erreur lors de la duplication', { id: toastId });
            });
    };

    const doDownload = () => {
        getFileDownloadUrl(uuid, join(directory, file.name))
            .then((url) => {
                // @ts-expect-error valid
                window.location = url;
                toast.success('Le téléchargement va commencer');
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }));
    };

    const doArchive = () => {
        const toastId = toast.loading('Archivage...');
        compressFiles(uuid, directory, [file.name])
            .then(() => mutate())
            .then(() => toast.success('Archive créée', { id: toastId }))
            .catch((error) => {
                clearAndAddHttpError({ key: 'files', error });
                toast.error("Échec de l'archivage", { id: toastId });
            });
    };

    const doUnarchive = () => {
        const toastId = toast.loading('Extraction...');
        decompressFiles(uuid, directory, file.name)
            .then(() => mutate())
            .then(() => toast.success('Archive extraite', { id: toastId }))
            .catch((error) => {
                clearAndAddHttpError({ key: 'files', error });
                toast.error("Échec de l'extraction", { id: toastId });
            });
    };

    return (
        <>
            <Dialog.Confirm
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                title={`Supprimer ${file.isFile ? 'le fichier' : 'le dossier'}`}
                confirm={'Supprimer définitivement'}
                onConfirmed={doDeletion}
            >
                Êtes-vous sûr de vouloir supprimer <span className='font-bold text-white'>{file.name}</span> ? Cette
                action est irréversible.
            </Dialog.Confirm>

            {modal === 'chmod' && (
                <ChmodFileModal
                    visible
                    appear
                    files={[{ file: file.name, mode: file.modeBits }]}
                    onDismissed={() => setModal(null)}
                />
            )}

            {(modal === 'rename' || modal === 'move') && (
                <RenameFileModal
                    visible
                    appear
                    files={[file.name]}
                    useMoveTerminology={modal === 'move'}
                    onDismissed={() => setModal(null)}
                />
            )}

            <ContextMenuContent className='min-w-[180px] p-1.5 bg-neutral-950 border-white/10'>
                <div className='px-2 py-1.5 mb-1'>
                    <p className='text-[10px] uppercase tracking-wider text-neutral-500 font-bold'>Actions</p>
                </div>

                <Can action={'file.update'}>
                    <ContextMenuItem onSelect={() => setModal('rename')}>
                        <PencilToLine className='mr-2.5 h-4 w-4 opacity-70' />
                        <span>Renommer</span>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => setModal('move')}>
                        <BarsPlay className='mr-2.5 h-4 w-4 opacity-70' />
                        <span>Déplacer</span>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => setModal('chmod')}>
                        <Shield className='mr-2.5 h-4 w-4 opacity-70' />
                        <span>Permissions</span>
                    </ContextMenuItem>
                </Can>

                <ContextMenuSeparator className='bg-white/5 my-1' />

                {file.isFile && (
                    <Can action={'file.create'}>
                        <ContextMenuItem onSelect={doCopy}>
                            <Copy className='mr-2.5 h-4 w-4 opacity-70' />
                            <span>Dupliquer</span>
                        </ContextMenuItem>
                    </Can>
                )}

                <Can action={file.isArchiveType() ? 'file.create' : 'file.archive'}>
                    <ContextMenuItem onSelect={file.isArchiveType() ? doUnarchive : doArchive}>
                        <FileZipper className='mr-2.5 h-4 w-4 opacity-70' />
                        <span>{file.isArchiveType() ? 'Extraire' : 'Archiver'}</span>
                    </ContextMenuItem>
                </Can>

                {file.isFile && (
                    <ContextMenuItem onSelect={doDownload}>
                        <FileArrowDown className='mr-2.5 h-4 w-4 opacity-70' />
                        <span>Télécharger</span>
                    </ContextMenuItem>
                )}

                <Can action={'file.delete'}>
                    <ContextMenuSeparator className='bg-white/5 my-1' />
                    <ContextMenuItem
                        onSelect={() => setShowConfirmation(true)}
                        className='text-red-400 focus:text-red-300 focus:bg-red-500/10'
                    >
                        <TrashBin className='mr-2.5 h-4 w-4' />
                        <span>Supprimer</span>
                    </ContextMenuItem>
                </Can>
            </ContextMenuContent>
        </>
    );
};

export default memo(FileDropdownMenu, isEqual);
