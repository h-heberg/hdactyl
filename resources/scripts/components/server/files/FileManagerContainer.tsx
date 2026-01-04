import { hashToPath } from '@/helpers';
import { FolderOpen, Magnifier } from '@gravity-ui/icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import debounce from 'debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Can from '@/components/elements/Can';
import { Checkbox } from '@/components/elements/CheckboxNew';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import { ServerError } from '@/components/elements/ScreenBlock';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import UploadButton from '@/components/server/files/UploadButton';

import { httpErrorToHuman } from '@/api/http';
import { FileObject } from '@/api/server/files/loadDirectory';

import { useStoreActions } from '@/state/hooks';
import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';

import NewFileButton from './NewFileButton';

const sortFiles = (files: FileObject[]): FileObject[] => {
    return [...files]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1))
        .filter((file, index, self) => index === self.findIndex((t) => t.name === file.name));
};

const FileManagerContainer = () => {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash, pathname } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();

    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = debounce(setSearchTerm, 50);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const filesArray = useMemo(() => {
        return sortFiles(files ?? []).filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, searchTerm]);

    const onSelectAllClick = () => {
        setSelectedFiles(
            selectedFilesLength === (files?.length || 0) && files?.length !== 0
                ? []
                : files?.map((file) => file.name) || [],
        );
    };

    const rowVirtualizer = useVirtualizer({
        count: filesArray.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 54,
        overscan: 10,
    });

    if (error) return <ServerError title={'Something went wrong.'} message={httpErrorToHuman(error)} />;

    return (
        <ServerContentBlock className='p-0!' title={'File Manager'} showFlashKey={'files'}>
            <div className='px-4 sm:px-12 pt-6 sm:pt-10'>
                <MainPageHeader
                    title={'Fichiers'}
                    titleChildren={
                        <div className='flex items-center gap-2'>
                            <FileManagerStatus />
                            <Can action={'file.create'}>
                                <div className='flex gap-1.5'>
                                    <NewDirectoryButton />
                                    <NewFileButton id={id} />
                                    <UploadButton />
                                </div>
                            </Can>
                        </div>
                    }
                >
                    <p className='text-sm text-neutral-400'>
                        Gérez vos fichiers et dossiers. Organisez votre système de fichiers en toute simplicité.
                    </p>
                </MainPageHeader>

                <div className='flex flex-col gap-4 mt-8 mb-6'>
                    {/* Barre de recherche stylisée */}
                    <div className='relative group'>
                        <Magnifier className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-brand transition-colors' />
                        <input
                            ref={searchInputRef}
                            type='text'
                            placeholder='Rechercher un fichier...'
                            className='w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-hidden transition-all'
                            onChange={(e) => debouncedSearchTerm(e.target.value)}
                        />
                    </div>

                    <FileManagerBreadcrumbs
                        renderLeft={
                            <Checkbox
                                className='ml-3 mr-4'
                                checked={files?.length !== 0 && selectedFilesLength === files?.length}
                                onCheckedChange={onSelectAllClick}
                            />
                        }
                    />
                </div>

                {!files ? (
                    <div className='flex justify-center py-20'>
                        <Spinner />
                    </div>
                ) : filesArray.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-24 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-2xl'>
                        <FolderOpen className='w-12 h-12 text-neutral-700 mb-4' />
                        <p className='text-neutral-500 font-medium'>
                            {searchTerm ? 'Aucun résultat pour cette recherche.' : 'Ce dossier est vide.'}
                        </p>
                    </div>
                ) : (
                    <div
                        ref={parentRef}
                        className='relative border border-neutral-800/60 rounded-xl bg-neutral-900/20 overflow-auto max-h-[70vh] custom-scrollbar'
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const file = filesArray[virtualRow.index];
                                return (
                                    <div
                                        key={virtualRow.key}
                                        className='absolute top-0 left-0 w-full'
                                        style={{
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <FileObjectRow file={file} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <MassActionsBar />
        </ServerContentBlock>
    );
};

export default FileManagerContainer;
