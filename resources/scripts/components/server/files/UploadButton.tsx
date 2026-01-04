import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { LuFileUp, LuUpload } from 'react-icons/lu';

import ActionButton from '@/components/elements/ActionButton';
import { ModalMask } from '@/components/elements/Modal';
import FadeTransition from '@/components/elements/transitions/FadeTransition';

import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';

import { ServerContext } from '@/state/server';

import useEventListener from '@/plugins/useEventListener';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { useFlashKey } from '@/plugins/useFlash';

function isFileOrDirectory(event: DragEvent): boolean {
    if (!event.dataTransfer?.types) {
        return false;
    }

    return event.dataTransfer.types.some((value) => value.toLowerCase() === 'files');
}

const UploadButton = () => {
    const fileUploadInput = useRef<HTMLInputElement>(null);
    const [timeouts, _] = useState<NodeJS.Timeout[]>([]);
    const [visible, setVisible] = useState(false);
    const { mutate } = useFileManagerSwr();
    const { addError, clearAndAddHttpError } = useFlashKey('files');

    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { clearFileUploads, removeFileUpload, pushFileUpload } = ServerContext.useStoreActions(
        (actions) => actions.files,
    );

    useEventListener(
        'dragenter',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFileOrDirectory(e)) {
                return setVisible(true);
            }
        },
        { capture: true },
    );

    useEventListener('dragexit', () => setVisible(false), { capture: true });

    useEventListener('keydown', () => {
        if (visible) setVisible(false);
    });

    useEffect(() => {
        return () => timeouts.forEach(clearTimeout);
    }, []);

    const onFileSubmission = (files: FileList) => {
        clearAndAddHttpError();
        const list = Array.from(files);
        if (list.some((file) => !file.size || (!file.type && file.size === 4096))) {
            return addError('Folder uploads are not supported at this time.', 'Error');
        }

        const uploads = list.map((file) => {
            const controller = new AbortController();
            pushFileUpload({
                name: file.name,
                data: { abort: controller, loaded: 0, total: file.size },
            });

            return () =>
                getFileUploadUrl(uuid).then((url) =>
                    axios
                        .post(
                            url,
                            { files: file },
                            {
                                signal: controller.signal,
                                headers: { 'Content-Type': 'multipart/form-data' },
                                params: { directory },
                            },
                        )
                        .then(() => timeouts.push(setTimeout(() => removeFileUpload(file.name), 500))),
                );
        });

        Promise.all(uploads.map((fn) => fn()))
            .then(() => mutate())
            .catch((error) => {
                clearFileUploads();
                clearAndAddHttpError(error);
            });
    };

    return (
        <>
            <FadeTransition show={visible} duration='duration-150' key='upload_modal_mask' appear unmount>
                <ModalMask
                    className='flex backdrop-blur-sm bg-black/40'
                    onClick={() => setVisible(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setVisible(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setVisible(false);
                        if (!e.dataTransfer?.files.length) return;
                        onFileSubmission(e.dataTransfer.files);
                    }}
                >
                    <div className='w-full flex items-center justify-center pointer-events-none'>
                        <div className='relative flex flex-col items-center gap-6 bg-zinc-900 w-full rounded-3xl py-16 px-8 mx-10 max-w-lg shadow-2xl transition-all border-dashed border-2 border-brand/50'>
                            <div className='p-5 bg-brand/10 rounded-full text-brand'>
                                <LuUpload size={48} className='animate-bounce' />
                            </div>

                            <div className='text-center space-y-2'>
                                <h1 className='text-2xl font-bold text-zinc-100'>Déposer pour envoyer</h1>
                                <p className='text-zinc-400 text-sm'>
                                    Vos fichiers seront téléchargés dans{' '}
                                    <span className='text-brand font-mono'>{directory || '/'}</span>
                                </p>
                            </div>

                            <div className='absolute inset-4 border-2 border-dashed border-zinc-700/50 rounded-2xl'></div>
                        </div>
                    </div>
                </ModalMask>
            </FadeTransition>

            <input
                type='file'
                ref={fileUploadInput}
                className='hidden'
                onChange={(e) => {
                    if (!e.currentTarget.files) return;
                    onFileSubmission(e.currentTarget.files);
                    if (fileUploadInput.current) fileUploadInput.current.files = null;
                }}
                multiple
            />

            <ActionButton
                className='group flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand/80 text-white border-none shadow-lg shadow-brand/20 transition-all'
                onClick={() => fileUploadInput.current?.click()}
            >
                <LuFileUp size={18} className='group-hover:-translate-y-1 transition-transform' />
                <span>Upload</span>
            </ActionButton>
        </>
    );
};

export default UploadButton;
