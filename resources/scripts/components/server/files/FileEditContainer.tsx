import { encodePathSegments } from '@/helpers';
import type { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { ArrowRotateRight, ChevronDown, Code } from '@gravity-ui/icons';
import { For } from 'million/react';
import { dirname } from 'pathe';
import { lazy, useEffect, useMemo, useRef, useState } from 'react';
import { LuSave } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/elements/DropdownMenu';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Spinner from '@/components/elements/Spinner';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import FileNameModal from '@/components/server/files/FileNameModal';

import { httpErrorToHuman } from '@/api/http';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

const Editor = lazy(() => import('@/components/elements/editor/Editor'));

const FileEditContainer = () => {
    const { action, '*': rawFilename } = useParams<{ action: 'edit' | 'new'; '*': string }>();
    const navigate = useNavigate();
    const { addError, clearFlashes } = useFlash();

    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [language, setLanguage] = useState<LanguageDescription>();
    const [filename, setFilename] = useState<string>(decodeURIComponent(rawFilename ?? ''));

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const fetchFileContent = useRef<(() => Promise<string>) | null>(null);

    useEffect(() => {
        if (action === 'new') return;
        if (!filename) return;

        setLoading(true);
        setDirectory(dirname(filename));

        getFileContents(uuid, filename)
            .then(setContent)
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'files:view' });
            })
            .finally(() => setLoading(false));
    }, [action, uuid, filename]);

    const handleSave = async (name?: string) => {
        const targetName = name ?? filename;
        if (!fetchFileContent.current) return;

        setLoading(true);
        clearFlashes('files:view');

        try {
            const currentContent = await fetchFileContent.current();
            await saveFileContents(uuid, targetName, currentContent);
            toast.success(`Fichier ${targetName} enregistré.`);

            if (name) {
                navigate(`/server/${id}/files/edit/${encodePathSegments(name)}`);
            }
        } catch (error) {
            addError({ message: httpErrorToHuman(error), key: 'files:view' });
        } finally {
            setLoading(false);
        }
    };

    const saveAndRestart = async () => {
        await handleSave();
        if (instance) {
            setTimeout(() => toast.info('Redémarrage du serveur...'), 500);
            instance.send('set state', 'restart');
        }
    };

    const isPyroIgnore = useMemo(() => ['.pyroignore', 'pyroignore'].some((ext) => filename.endsWith(ext)), [filename]);

    return (
        <PageContentBlock
            title={action === 'edit' ? `Édition : ${filename}` : `Nouveau fichier`}
            className='p-0! h-full flex flex-col'
        >
            <FlashMessageRender byKey={'files:view'} />

            {/* Header / Breadcrumbs */}
            <div className='flex items-center justify-between px-6 py-4 bg-neutral-900/50 border-b border-white/5'>
                <ErrorBoundary>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </ErrorBoundary>

                <div className='flex items-center gap-3'>
                    <DropdownMenu>
                        <DropdownMenuTrigger className='flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5'>
                            <Code className='w-3.5 h-3.5 opacity-60' />
                            <span>{language?.name ?? 'Auto-détection'}</span>
                            <ChevronDown className='w-3 h-3 opacity-40' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='max-h-60 overflow-auto'>
                            <For each={languages.sort((a, b) => a.name.localeCompare(b.name))} memo>
                                {(l) => (
                                    <DropdownMenuItem key={l.name} onSelect={() => setLanguage(l)}>
                                        {l.name}
                                    </DropdownMenuItem>
                                )}
                            </For>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {action === 'edit' ? (
                        <Can action={'file.update'}>
                            <div className='flex'>
                                <ActionButton
                                    variant='primary'
                                    className='rounded-r-none border-r border-black/20 px-4'
                                    onClick={() => handleSave()}
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size='small' /> : <LuSave className='w-4 h-4 mr-2' />}
                                    Sauvegarder
                                </ActionButton>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <ActionButton variant='primary' className='rounded-l-none px-2'>
                                            <ChevronDown className='w-4 h-4' />
                                        </ActionButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem onSelect={saveAndRestart} className='gap-2'>
                                            <ArrowRotateRight className='w-4 h-4' />
                                            Sauvegarder & Redémarrer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Can>
                    ) : (
                        <ActionButton variant='primary' onClick={() => setModalVisible(true)}>
                            Créer le fichier
                        </ActionButton>
                    )}
                </div>
            </div>

            {/* Infos PyroIgnore */}
            {isPyroIgnore && (
                <div className='mx-6 mt-4 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex gap-3 items-start'>
                    <div className='p-2 bg-cyan-500/10 rounded-lg text-cyan-400'>
                        <Code className='w-4 h-4' />
                    </div>
                    <p className='text-sm text-neutral-400 leading-relaxed'>
                        Vous éditez un fichier <code className='text-cyan-300 font-mono'>.pyroignore</code>. Les
                        fichiers listés ici seront exclus des sauvegardes. Utilisez{' '}
                        <code className='text-cyan-300'>*</code> comme joker.
                    </p>
                </div>
            )}

            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    handleSave(name);
                }}
            />

            {/* Editor Container */}
            <div className='flex-grow relative mt-4 overflow-hidden border-t border-white/5'>
                {loading && !content && (
                    <div className='absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/50 backdrop-blur-sm'>
                        <Spinner />
                    </div>
                )}
                <div className='h-full w-full'>
                    <Editor
                        filename={filename}
                        initialContent={content}
                        language={language}
                        onLanguageChanged={setLanguage}
                        fetchContent={(val) => {
                            fetchFileContent.current = val;
                        }}
                        onContentSaved={() => (action === 'edit' ? handleSave() : setModalVisible(true))}
                        className='h-full border-none'
                    />
                </div>
            </div>
        </PageContentBlock>
    );
};

export default FileEditContainer;
