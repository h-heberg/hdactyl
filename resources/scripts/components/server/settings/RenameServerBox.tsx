import { Actions, useStoreActions } from 'easy-peasy';
import { Form, Formik, useFormikContext } from 'formik';
import { LuLoader, LuSave } from 'react-icons/lu';
import { toast } from 'sonner';
import { object, string } from 'yup';

// Ajout d'icônes

import ActionButton from '@/components/elements/ActionButton';
import Field from '@/components/elements/Field';
import TitledGreyBox from '@/components/elements/TitledGreyBox';

import { httpErrorToHuman } from '@/api/http';
import renameServer from '@/api/server/renameServer';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

interface Values {
    name: string;
    description: string;
}

const RenameServerForm = () => {
    const { isSubmitting, isValid, dirty } = useFormikContext<Values>();

    return (
        <TitledGreyBox title={'Server Identity'}>
            <Form className='relative'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-1'>
                        <Field
                            id={'name'}
                            name={'name'}
                            label={'Nom du serveur'}
                            type={'text'}
                            placeholder='Mon super serveur'
                            disabled
                        />
                    </div>

                    <div className='space-y-1'>
                        <Field
                            id={'description'}
                            name={'description'}
                            label={'Description (Optionnelle)'}
                            type={'text'}
                            placeholder='Environnement de production...'
                        />
                    </div>
                </div>

                <div className='mt-8 pt-4 border-t border-white/5 flex items-center justify-between'>
                    <div className='hidden sm:block'>
                        {!dirty && <span className='text-xs text-neutral-500'>Aucun changement détecté.</span>}
                    </div>

                    <ActionButton
                        variant='primary'
                        type={'submit'}
                        disabled={isSubmitting || !isValid || !dirty}
                        className='group flex items-center gap-2 min-w-[120px] justify-center'
                    >
                        {isSubmitting ? (
                            <LuLoader className='w-4 h-4 animate-spin' />
                        ) : (
                            <LuSave className='w-4 h-4 group-hover:scale-110 transition-transform' />
                        )}
                        <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                    </ActionButton>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

const RenameServerBox = () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = (values: Values, { setSubmitting }: any) => {
        clearFlashes('settings');
        const updateToast = toast.loading('Updating server details...');

        renameServer(server.uuid, values.name, values.description)
            .then(() => {
                setServer({ ...server, ...values });
                toast.success('Identity updated successfully', { id: updateToast });
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
                toast.error('Failed to update server', { id: updateToast });
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: server.name,
                description: server.description || '',
            }}
            validationSchema={object().shape({
                name: string().required('Le nom est requis').min(1).max(191),
                description: string().nullable().max(191),
            })}
            enableReinitialize
        >
            <RenameServerForm />
        </Formik>
    );
};

export default RenameServerBox;
