import { Copy, Database, Eye, TrashBin } from '@gravity-ui/icons';
import clsx from 'clsx';
import { Form, Formik, FormikHelpers } from 'formik';
import { memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import styled from 'styled-components';
import { object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import Modal from '@/components/elements/Modal';
import Spinner from '@/components/elements/Spinner';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';

import { httpErrorToHuman } from '@/api/http';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

const Label = styled.label`
    display: inline-block;
    color: #ffffff77;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 0.5rem;
`;

interface Props {
    database: ServerDatabase;
}

const DatabaseRow = ({ database }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const jdbcConnectionString = `jdbc:mysql://${database.username}${database.password ? `:${encodeURIComponent(database.password)}` : ''}@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('Le nom de la base de données doit être fourni.')
            .oneOf(
                [database.name.split('_', 2)[1] || '', database.name],
                'Le nom de la base de données ne correspond pas.',
            ),
    });

    const submit = (_: { confirm: string }, { setSubmitting, resetForm }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                resetForm();
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
                setSubmitting(false);
            })
            .catch((error) => {
                resetForm();
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            {/* Modal de suppression et de détails conservés (logique inchangée) */}
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                        title='Supprimer la base de données'
                    >
                        <FlashMessageRender byKey={'database:delete'} />
                        <div className='flex flex-col'>
                            <p className='text-zinc-400 text-sm'>
                                Cette action est permanente. La base <strong>{database.name}</strong> sera
                                définitivement supprimée.
                            </p>
                            <Form className='mt-6'>
                                <Field
                                    name={'confirm'}
                                    label={'Confirmer le nom'}
                                    description={'Saisissez le nom de la base pour confirmer.'}
                                />
                                <ActionButton
                                    variant='danger'
                                    type='submit'
                                    className='w-full my-6'
                                    disabled={!isValid || isSubmitting}
                                >
                                    {isSubmitting ? 'Suppression...' : 'Supprimer définitivement'}
                                </ActionButton>
                            </Form>
                        </div>
                    </Modal>
                )}
            </Formik>

            <Modal
                visible={connectionVisible}
                title='Détails de connexion'
                onDismissed={() => setConnectionVisible(false)}
            >
                <div className='flex flex-col gap-5'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='flex flex-col'>
                            <Label>Hôte (Endpoint)</Label>
                            <CopyOnClick text={database.connectionString}>
                                <Input readOnly value={database.connectionString} />
                            </CopyOnClick>
                        </div>
                        <div className='flex flex-col'>
                            <Label>Connexions autorisées</Label>
                            <CopyOnClick text={database.allowConnectionsFrom}>
                                <Input readOnly value={database.allowConnectionsFrom} />
                            </CopyOnClick>
                        </div>
                        <div className='flex flex-col'>
                            <Label>Utilisateur</Label>
                            <CopyOnClick text={database.username}>
                                <Input readOnly value={database.username} />
                            </CopyOnClick>
                        </div>
                        <Can action={'database.view_password'}>
                            <div className='flex flex-col'>
                                <Label>Mot de passe</Label>
                                <div className='flex gap-2'>
                                    <CopyOnClick text={database.password} showInNotification={false}>
                                        <Input type='password' readOnly value={database.password} className='w-full' />
                                    </CopyOnClick>
                                    <Can action={'database.update'}>
                                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                                    </Can>
                                </div>
                            </div>
                        </Can>
                    </div>
                    <div className='flex flex-col mb-8'>
                        <Label>Chaîne JDBC</Label>
                        <CopyOnClick text={jdbcConnectionString} showInNotification={false}>
                            <Input type='password' readOnly value={jdbcConnectionString} />
                        </CopyOnClick>
                    </div>
                </div>
            </Modal>

            {/* Nouveau design de la ligne */}
            <div
                className={clsx(
                    'group relative overflow-hidden transition-all duration-300 mb-2',
                    'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/10',
                    'rounded-3xl p-4 sm:p-5',
                )}
            >
                <div className='relative z-10 flex flex-col md:flex-row md:items-center gap-5'>
                    {/* Left: Icon & DB Name */}
                    <div className='flex items-start gap-4 flex-1 min-w-0'>
                        <div className='hidden sm:flex p-3 bg-zinc-900/50 rounded-xl border border-white/5 text-zinc-500 group-hover:text-zinc-300 transition-colors'>
                            <Database width={20} height={20} />
                        </div>

                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 flex-wrap mb-1'>
                                <CopyOnClick text={database.name}>
                                    <div className='cursor-pointer group/copy flex items-center gap-2'>
                                        <h3 className='text-sm sm:text-base font-bold text-zinc-100 group-hover/copy:text-white transition-colors tracking-tight'>
                                            {database.name}
                                        </h3>
                                        <Copy
                                            width={14}
                                            height={14}
                                            className='text-zinc-600 group-hover/copy:text-zinc-400'
                                        />
                                    </div>
                                </CopyOnClick>
                            </div>

                            {/* Metadata Grid */}
                            <div className='flex flex-wrap gap-x-6 gap-y-1'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] uppercase font-black text-zinc-600 tracking-tighter'>
                                        Host:
                                    </span>
                                    <span className='text-xs font-mono text-zinc-400 truncate max-w-[150px]'>
                                        {database.connectionString}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] uppercase font-black text-zinc-600 tracking-tighter'>
                                        User:
                                    </span>
                                    <span className='text-xs font-mono text-zinc-400'>{database.username}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className='flex items-center gap-2 sm:justify-end shrink-0'>
                        <button
                            onClick={() => setConnectionVisible(true)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border',
                                'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-zinc-800',
                            )}
                        >
                            <Eye width={14} height={14} />
                            <span className='hidden lg:inline'>Détails Connexion</span>
                            <span className='lg:hidden'>Détails</span>
                        </button>

                        <Can action={'database.delete'}>
                            <button
                                onClick={() => setVisible(true)}
                                className={clsx(
                                    'p-2.5 rounded-xl transition-all border',
                                    'bg-red-500/5 text-red-500/50 border-red-500/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40',
                                )}
                            >
                                <TrashBin width={18} height={18} />
                            </button>
                        </Can>
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(DatabaseRow, isEqual);
