import { Database, Plus } from '@gravity-ui/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { For } from 'million/react';
import { useEffect, useState } from 'react';
import { object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import Field from '@/components/elements/Field';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import Modal from '@/components/elements/Modal';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer } from '@/components/elements/pages/PageList';
import DatabaseRow from '@/components/server/databases/DatabaseRow';

import { httpErrorToHuman } from '@/api/http';
import createServerDatabase from '@/api/server/databases/createServerDatabase';
import getServerDatabases from '@/api/server/databases/getServerDatabases';

import { ServerContext } from '@/state/server';

import { useDeepMemoize } from '@/plugins/useDeepMemoize';
import useFlash from '@/plugins/useFlash';

interface DatabaseValues {
    databaseName: string;
    connectionsFrom: string;
}

const databaseSchema = object().shape({
    databaseName: string()
        .required('Un nom de base de données est requis.')
        .min(3, 'Le nom doit faire au moins 3 caractères.')
        .max(48, 'Le nom ne doit pas dépasser 48 caractères.')
        .matches(
            /^[\w\-.]{3,48}$/,
            'Le nom ne peut contenir que des lettres, chiffres, tirets, points et underscores.',
        ),
    connectionsFrom: string().matches(/^[\w\-/.%:]+$/, "Une adresse d'hôte valide est requise."),
});

const DatabasesContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    const databases = useDeepMemoize(ServerContext.useStoreState((state) => state.databases.data));
    const setDatabases = ServerContext.useStoreActions((state) => state.databases.setDatabases);
    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');
        getServerDatabases(uuid)
            .then((databases) => setDatabases(databases))
            .catch((error) => addError({ key: 'databases', message: httpErrorToHuman(error) }))
            .then(() => setLoading(false));
    }, []);

    const submitDatabase = (values: DatabaseValues, { setSubmitting, resetForm }: FormikHelpers<DatabaseValues>) => {
        clearFlashes('database:create');
        createServerDatabase(uuid, {
            databaseName: values.databaseName,
            connectionsFrom: values.connectionsFrom || '%',
        })
            .then((database) => {
                resetForm();
                appendDatabase(database);
                setSubmitting(false);
                setCreateModalVisible(false);
            })
            .catch((error) => {
                addError({ key: 'database:create', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <ServerContentBlock title={'Bases de données'}>
            <FlashMessageRender byKey={'databases'} />

            <MainPageHeader title={'Bases de données'}>
                <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl'>
                    Créez et gérez des bases de données MySQL pour votre serveur. Configurez les accès, gérez les
                    utilisateurs et consultez les détails de connexion JDBC.
                </p>
            </MainPageHeader>

            <div className='mt-10'>
                <div className='bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300'>
                    {/* Header interne identique au NetworkContainer */}
                    <div className='p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]'>
                        <div className='flex items-center gap-4'>
                            <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400'>
                                <Database width={20} height={20} />
                            </div>
                            <div>
                                <h3 className='text-sm font-bold uppercase tracking-widest text-zinc-200'>
                                    Instances de bases de données
                                </h3>
                                <p className='text-[11px] text-zinc-500 font-medium font-mono lowercase tracking-tighter'>
                                    Gérez vos bases de données
                                </p>
                            </div>
                        </div>

                        <Can action={'database.create'}>
                            <div className='flex items-center gap-4'>
                                <div className='hidden sm:flex items-center px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-tighter'>
                                    {databaseLimit === null ? (
                                        <span>{databases.length} / ∞</span>
                                    ) : databaseLimit === 0 ? (
                                        <span className='text-red-400 font-bold tracking-normal'>Désactivé</span>
                                    ) : (
                                        <span>
                                            {databases.length} sur {databaseLimit} utilisés
                                        </span>
                                    )}
                                </div>

                                {(databaseLimit === null ||
                                    (databaseLimit > 0 && databaseLimit !== databases.length)) && (
                                    <ActionButton
                                        variant='primary'
                                        onClick={() => setCreateModalVisible(true)}
                                        className='group !rounded-full !px-5 !py-2 flex items-center gap-2'
                                    >
                                        <Plus width={16} height={16} />
                                        <span className='text-xs font-bold uppercase tracking-wider'>
                                            Nouvelle Base
                                        </span>
                                    </ActionButton>
                                )}
                            </div>
                        </Can>
                    </div>

                    {/* Zone de contenu (Liste ou États) */}
                    <div className='p-2'>
                        {loading && !databases.length ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-4'>
                                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-white/20 border-t-zinc-200'></div>
                                <p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
                                    Initialisation...
                                </p>
                            </div>
                        ) : databases.length > 0 ? (
                            <div className='space-y-1 p-2'>
                                <PageListContainer>
                                    <For each={databases} memo>
                                        {(database) => <DatabaseRow key={database.id} database={database} />}
                                    </For>
                                </PageListContainer>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
                                <div className='w-16 h-16 mb-6 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/5'>
                                    <Database width={28} height={28} className='text-zinc-600' />
                                </div>
                                <h4 className='text-lg font-bold text-zinc-200 tracking-tight'>
                                    {databaseLimit === 0 ? 'Accès restreint' : 'Aucune base de données'}
                                </h4>
                                <p className='text-sm text-zinc-500 mt-2 max-w-[280px] leading-relaxed font-medium'>
                                    {databaseLimit === 0
                                        ? 'Votre offre actuelle ne permet pas de créer de bases de données.'
                                        : 'Commencez par créer une base de données pour stocker vos informations.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de création (style conservé mais épuré) */}
            <Formik
                onSubmit={submitDatabase}
                initialValues={{ databaseName: '', connectionsFrom: '' }}
                validationSchema={databaseSchema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Modal
                        visible={createModalVisible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            resetForm();
                            setCreateModalVisible(false);
                        }}
                        title='Créer une nouvelle base de données'
                    >
                        <div className='flex flex-col gap-4 w-full'>
                            <FlashMessageRender byKey={'database:create'} />
                            <Form className='space-y-6'>
                                <Field
                                    name={'databaseName'}
                                    label={'Nom de la base'}
                                    description={"Le nom sera préfixé par l'ID de votre serveur."}
                                />
                                <Field
                                    name={'connectionsFrom'}
                                    label={'Connexions autorisées'}
                                    placeholder='%'
                                    description={'Laissez vide (%) pour autoriser toutes les adresses.'}
                                />
                                <div className='flex gap-3 justify-end pt-4'>
                                    <ActionButton
                                        variant='primary'
                                        type='submit'
                                        className='w-full sm:w-auto !px-8 mb-6'
                                        disabled={isSubmitting}
                                    >
                                        Créer l&apos;instance
                                    </ActionButton>
                                </div>
                            </Form>
                        </div>
                    </Modal>
                )}
            </Formik>
        </ServerContentBlock>
    );
};

export default DatabasesContainer;
