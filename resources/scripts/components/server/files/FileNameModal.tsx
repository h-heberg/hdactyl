import { FilePlus } from '@gravity-ui/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { join } from 'pathe';
import { object, string } from 'yup';

import ActionButton from '@/components/elements/ActionButton';
import Code from '@/components/elements/Code';
import Field from '@/components/elements/Field';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';

import { ServerContext } from '@/state/server';

type Props = RequiredModalProps & {
    onFileNamed: (name: string) => void;
};

interface Values {
    fileName: string;
}

const schema = object().shape({
    fileName: string()
        .required('Un nom de fichier est requis.')
        .min(1, 'Le nom est trop court.')
        // Empêche les caractères interdits et les noms se terminant par un point ou un espace
        .matches(/^[^\\/:*?"<>|]+$/, 'Le nom contient des caractères invalides.'),
});

const FileNameModal = ({ onFileNamed, onDismissed, ...props }: Props) => {
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        // On nettoie le nom pour éviter les slashes accidentels au début
        const cleanName = values.fileName.replace(/^(\/)+/, '');
        onFileNamed(join(directory, cleanName));
        setSubmitting(false);
    };

    return (
        <Formik onSubmit={submit} initialValues={{ fileName: '' }} validationSchema={schema}>
            {({ resetForm, values, isSubmitting }) => (
                <Modal
                    onDismissed={() => {
                        resetForm();
                        onDismissed();
                    }}
                    title='Créer un nouveau fichier'
                    {...props}
                >
                    <Form className='m-0 w-full flex flex-col gap-4'>
                        <Field
                            id='fileName'
                            name='fileName'
                            label='Nom du fichier'
                            placeholder='ex: server.properties, index.js...'
                            autoFocus
                        />

                        {/* Aperçu du chemin de création */}
                        <div className='bg-neutral-900/50 border border-white/5 rounded-xl p-4'>
                            <div className='flex items-center gap-2 mb-2 text-neutral-400'>
                                <FilePlus className='w-4 h-4' />
                                <span className='text-xs font-semibold uppercase tracking-wider'>Emplacement</span>
                            </div>
                            <p className='text-xs break-all opacity-80 leading-relaxed'>
                                <span className='text-neutral-500'>/root/</span>
                                <Code className='text-brand-400'>
                                    {join(directory, values.fileName).replace(/^(\.\.\/|\/)+/, '') || './'}
                                </Code>
                            </p>
                        </div>

                        <div className='flex justify-end items-center gap-3 mt-2 mb-4'>
                            <ActionButton
                                variant='secondary'
                                onClick={() => {
                                    resetForm();
                                    onDismissed();
                                }}
                            >
                                Annuler
                            </ActionButton>
                            <ActionButton variant='primary' type='submit' disabled={isSubmitting}>
                                Créer le fichier
                            </ActionButton>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default FileNameModal;
