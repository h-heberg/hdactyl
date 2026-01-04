import { FolderPlus } from '@gravity-ui/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { join } from 'pathe';
import { useContext, useEffect, useState } from 'react';
import { object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Code from '@/components/elements/Code';
import Field from '@/components/elements/Field';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';

import asDialog from '@/hoc/asDialog';

import createDirectory from '@/api/server/files/createDirectory';

import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { useFlashKey } from '@/plugins/useFlash';

interface Values {
    directoryName: string;
}

const schema = object().shape({
    directoryName: string()
        .required('Un nom de dossier est requis.')
        .min(1, 'Le nom est trop court.')
        .matches(/^[^\\/:"*?<>\\|]+$/, 'Le nom contient des caractères invalides.'),
});

const NewDirectoryDialog = asDialog({
    title: 'Nouveau dossier',
})(() => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const { mutate } = useFileManagerSwr();
    const { close } = useContext(DialogWrapperContext);
    const { clearAndAddHttpError } = useFlashKey('files:directory-modal');

    useEffect(() => {
        return () => clearAndAddHttpError();
    }, [clearAndAddHttpError]);

    const submit = ({ directoryName }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        createDirectory(uuid, directory, directoryName)
            .then(() => mutate())
            .then(() => close())
            .catch((error) => {
                setSubmitting(false);
                clearAndAddHttpError(error);
            });
    };

    return (
        <Formik onSubmit={submit} validationSchema={schema} initialValues={{ directoryName: '' }}>
            {({ submitForm, values, isSubmitting }) => (
                <>
                    <FlashMessageRender byKey='files:directory-modal' />
                    <Form className='m-0'>
                        <Field
                            autoFocus
                            id='directoryName'
                            name='directoryName'
                            label='Nom du dossier'
                            placeholder='ex: logs, backups...'
                        />
                        <div className='mt-4 p-3 bg-neutral-900/50 border border-white/5 rounded-lg'>
                            <p className='text-xs text-neutral-400 mb-1'>Chemin de destination :</p>
                            <Code className='text-[10px] break-all opacity-80'>
                                <span className='text-neutral-500'>/root/</span>
                                <span className='text-brand-400'>
                                    {join(directory, values.directoryName).replace(/^(\.\.\/|\/)+/, '') || './'}
                                </span>
                            </Code>
                        </div>
                    </Form>
                    <Dialog.Footer>
                        <ActionButton variant='secondary' onClick={close} disabled={isSubmitting}>
                            Annuler
                        </ActionButton>
                        <ActionButton variant='primary' onClick={submitForm} disabled={isSubmitting}>
                            Créer le dossier
                        </ActionButton>
                    </Dialog.Footer>
                </>
            )}
        </Formik>
    );
});

const NewDirectoryButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <NewDirectoryDialog open={open} onClose={() => setOpen(false)} />
            <ActionButton variant='secondary' onClick={() => setOpen(true)} className='flex items-center gap-2'>
                <FolderPlus className='w-4 h-4' />
                Nouveau dossier
            </ActionButton>
        </>
    );
};

export default NewDirectoryButton;
