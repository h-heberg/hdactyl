import { FolderOpen, Pencil } from '@gravity-ui/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { join } from 'pathe';

import ActionButton from '@/components/elements/ActionButton';
import Code from '@/components/elements/Code';
import Field from '@/components/elements/Field';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';

import renameFiles from '@/api/server/files/renameFiles';

import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';

interface FormikValues {
    name: string;
}

type OwnProps = RequiredModalProps & {
    files: string[];
    useMoveTerminology?: boolean;
};

const RenameFileModal = ({ files, useMoveTerminology, ...props }: OwnProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    const submit = ({ name }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');

        // Optimistic UI updates for a single file
        if (files.length === 1) {
            const isMoving = useMoveTerminology || name.includes('/');
            if (!isMoving) {
                // Rename local
                mutate((data) => data!.map((f) => (f.name === files[0] ? { ...f, name } : f)), false);
            } else {
                // Hide from current view if moved
                mutate((data) => data!.filter((f) => f.name !== files[0]), false);
            }
        }

        const payload = files.map((f) => ({
            from: f,
            to: useMoveTerminology && files.length > 1 ? join(name, f) : name,
        }));

        renameFiles(uuid, directory, payload)
            .then(() => mutate())
            .then(() => setSelectedFiles([]))
            .then(() => props.onDismissed())
            .catch((error) => {
                mutate();
                setSubmitting(false);
                clearAndAddHttpError({ key: 'files', error });
            });
    };

    const isMultiple = files.length > 1;

    return (
        <Formik onSubmit={submit} initialValues={{ name: isMultiple ? '' : files[0] || '' }} enableReinitialize>
            {({ isSubmitting, values }) => (
                <Modal
                    {...props}
                    dismissable={!isSubmitting}
                    showSpinnerOverlay={isSubmitting}
                    title={useMoveTerminology ? 'Déplacer les éléments' : "Renommer l'élément"}
                >
                    <Form className='w-full'>
                        <div className='space-y-4'>
                            <Field
                                id='file_name'
                                name='name'
                                label={useMoveTerminology ? 'Chemin de destination' : 'Nouveau nom'}
                                placeholder={isMultiple ? 'Ex: /backups/old' : 'Ex: config_v2.yml'}
                                autoFocus
                            />

                            <div className='bg-neutral-900/50 border border-white/5 rounded-xl p-4 transition-all'>
                                <div className='flex items-center gap-2 mb-2 text-neutral-400'>
                                    {useMoveTerminology ? (
                                        <FolderOpen className='w-4 h-4' />
                                    ) : (
                                        <Pencil className='w-4 h-4' />
                                    )}
                                    <span className='text-xs font-semibold uppercase tracking-wider'>
                                        Aperçu du changement
                                    </span>
                                </div>

                                <p className='text-xs break-all leading-relaxed'>
                                    <span className='text-neutral-500'>/root/</span>
                                    <Code className='text-brand-400'>
                                        {join(directory, values.name).replace(/^(\.\.\/|\/)+/, '') ||
                                            (isMultiple ? '...' : values.name)}
                                    </Code>
                                </p>

                                {isMultiple && (
                                    <p className='mt-2 text-[10px] text-neutral-500 italic'>
                                        Note : {files.length} fichiers seront déplacés vers ce répertoire.
                                    </p>
                                )}
                            </div>

                            <div className='flex justify-end gap-3 pt-2'>
                                <ActionButton variant='secondary' onClick={props.onDismissed} disabled={isSubmitting}>
                                    Annuler
                                </ActionButton>
                                <ActionButton variant='primary' type='submit' disabled={isSubmitting}>
                                    {useMoveTerminology ? 'Déplacer' : 'Renommer'}
                                </ActionButton>
                            </div>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default RenameFileModal;
