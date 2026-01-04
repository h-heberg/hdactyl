import { fileBitsToString } from '@/helpers';
import { Form, Formik, FormikHelpers } from 'formik';
import { LuShieldAlert } from 'react-icons/lu';
import { object, string } from 'yup';

import ActionButton from '@/components/elements/ActionButton';
import Field from '@/components/elements/Field';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';

import chmodFiles from '@/api/server/files/chmodFiles';

import { ServerContext } from '@/state/server';

import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';

interface FormikValues {
    mode: string;
}

interface File {
    file: string;
    mode: string;
}

type OwnProps = RequiredModalProps & { files: File[] };

const schema = object().shape({
    mode: string()
        .required('Un mode octal est requis.')
        .matches(/^[0-7]{3,4}$/, 'Le mode doit être une valeur octale valide (ex: 755).'),
});

const ChmodFileModal = ({ files, ...props }: OwnProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    const submit = async ({ mode }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');
        await mutate(
            (data) =>
                data!.map((f) =>
                    f.name === files[0]?.file ? { ...f, mode: fileBitsToString(mode, !f.isFile), modeBits: mode } : f,
                ),
            false,
        );

        const data = files.map((f) => ({ file: f.file, mode: mode }));

        chmodFiles(uuid, directory, data)
            .then(() => {
                if (files.length > 0) {
                    return mutate();
                }
            })
            .then(() => setSelectedFiles([]))
            .then(() => props.onDismissed())
            .catch((error) => {
                mutate();
                setSubmitting(false);
                clearAndAddHttpError({ key: 'files', error });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            validationSchema={schema}
            initialValues={{ mode: files.length > 1 ? '' : (files[0]?.mode ?? '0644') }}
        >
            {({ isSubmitting }) => (
                <Modal
                    {...props}
                    title='Permissions du fichier'
                    dismissable={!isSubmitting}
                    showSpinnerOverlay={isSubmitting}
                >
                    <Form className='w-full m-0'>
                        <div className='space-y-6'>
                            <div className='bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3'>
                                <LuShieldAlert className='text-amber-500 w-6 h-6 shrink-0' />
                                <p className='text-xs text-amber-200/80 leading-relaxed'>
                                    <strong className='text-amber-500 block mb-1'>Utilisation avancée</strong>
                                    Modifier les permissions peut rendre vos fichiers inaccessibles ou corrompre le
                                    fonctionnement du serveur.
                                </p>
                            </div>

                            <Field id='file_mode' name='mode' label='Mode Octal' placeholder='ex: 0755' autoFocus />

                            <div className='grid grid-cols-3 gap-2 text-[12px] text-neutral-400 bg-neutral-900/50 p-3 rounded-lg border border-white/5'>
                                <div className='flex flex-col gap-1'>
                                    <span className='text-white font-bold border-b border-white/10 pb-1 mb-1'>
                                        Lecture (4)
                                    </span>
                                    <span>7 = rwx</span>
                                    <span>6 = rw-</span>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <span className='text-white font-bold border-b border-white/10 pb-1 mb-1'>
                                        Écriture (2)
                                    </span>
                                    <span>5 = r-x</span>
                                    <span>4 = r--</span>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <span className='text-white font-bold border-b border-white/10 pb-1 mb-1'>
                                        Exécution (1)
                                    </span>
                                    <span>0 = ---</span>
                                    <span>1 = --x</span>
                                </div>
                            </div>

                            <div className='flex justify-end items-center gap-3 mb-4'>
                                <ActionButton variant='secondary' onClick={props.onDismissed} disabled={isSubmitting}>
                                    Annuler
                                </ActionButton>
                                <ActionButton variant='primary' type='submit' disabled={isSubmitting}>
                                    Mettre à jour
                                </ActionButton>
                            </div>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default ChmodFileModal;
