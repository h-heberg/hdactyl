import {
    AntennaSignal,
    Calendar,
    Check,
    Copy,
    Database,
    FolderOpen,
    Gear,
    Person,
    Server,
    Shield,
} from '@gravity-ui/icons';
import clsx from 'clsx';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { Form, Formik } from 'formik';
import { useEffect } from 'react';
import { array, object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import Field from '@/components/elements/Field';
import PermissionRow from '@/components/server/users/PermissionRow';

import createOrUpdateSubuser from '@/api/server/users/createOrUpdateSubuser';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { Subuser } from '@/state/server/subusers';

import { useDeepCompareMemo } from '@/plugins/useDeepCompareMemo';
import { usePermissions } from '@/plugins/usePermissions';

interface Values {
    email: string;
    permissions: string[];
}

interface Props {
    subuser?: Subuser;
    onSuccess: (subuser: Subuser) => void;
    onCancel: () => void;
    flashKey: string;
    isSubmitting?: boolean;
    setIsSubmitting?: (submitting: boolean) => void;
}

const UserFormComponent = ({ subuser, onSuccess, onCancel, flashKey, isSubmitting, setIsSubmitting }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSubuser = ServerContext.useStoreActions((actions) => actions.subusers.appendSubuser);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const isRootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const permissions = useStoreState((state) => state.permissions.data);
    const loggedInPermissions = ServerContext.useStoreState((state) => state.server.permissions);
    const [canEditUser] = usePermissions(subuser ? ['user.update'] : ['user.create']);

    const editablePermissions = useDeepCompareMemo(() => {
        const cleaned = Object.keys(permissions).map((key) =>
            Object.keys(permissions[key]?.keys ?? {}).map((pkey) => `${key}.${pkey}`),
        );
        const list: string[] = ([] as string[]).concat.apply([], Object.values(cleaned));
        if (isRootAdmin || (loggedInPermissions.length === 1 && loggedInPermissions[0] === '*')) {
            return list;
        }
        return list.filter((key) => loggedInPermissions.indexOf(key) >= 0);
    }, [isRootAdmin, permissions, loggedInPermissions]);

    const submit = (values: Values) => {
        if (setIsSubmitting) setIsSubmitting(true);
        clearFlashes(flashKey);

        createOrUpdateSubuser(uuid, values, subuser)
            .then((subuser) => {
                appendSubuser(subuser);
                onSuccess(subuser);
            })
            .catch((error) => {
                if (setIsSubmitting) setIsSubmitting(false);
                clearAndAddHttpError({ key: flashKey, error });
            });
    };

    useEffect(() => () => clearFlashes(flashKey), []);

    const getPermissionIcon = (key: string) => {
        switch (key) {
            case 'control':
                return Server;
            case 'user':
                return Person;
            case 'file':
                return FolderOpen;
            case 'backup':
                return Copy;
            case 'allocation':
                return AntennaSignal;
            case 'startup':
                return Gear;
            case 'database':
                return Database;
            case 'schedule':
                return Calendar;
            default:
                return Shield;
        }
    };

    return (
        <>
            <FlashMessageRender byKey={flashKey} />

            <Formik
                onSubmit={submit}
                initialValues={
                    {
                        email: subuser?.email || '',
                        permissions: subuser?.permissions || [],
                    } as Values
                }
                validationSchema={object().shape({
                    email: string().max(191).email().required(),
                    permissions: array().of(string()),
                })}
            >
                {({ setFieldValue, values }) => (
                    <Form className='space-y-12'>
                        {/* Section Information */}
                        {!subuser && (
                            <div className='relative'>
                                <div className='flex items-center gap-4 mb-6'>
                                    <div className='w-1 bg-blue-500 h-6 rounded-full' />
                                    <h3 className='text-lg font-black text-white uppercase tracking-wider'>Identité</h3>
                                </div>
                                <div className='bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8'>
                                    <Field
                                        name={'email'}
                                        label={'Adresse Email'}
                                        description={
                                            "L'utilisateur recevra une invitation par mail pour accéder à ce serveur."
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section Permissions */}
                        <div className='relative'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-1 bg-blue-500 h-6 rounded-full' />
                                    <h3 className='text-lg font-black text-white uppercase tracking-wider'>
                                        Permissions détaillées
                                    </h3>
                                </div>

                                {canEditUser && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            const allSelected = editablePermissions.every((p) =>
                                                values.permissions.includes(p),
                                            );
                                            setFieldValue('permissions', allSelected ? [] : [...editablePermissions]);
                                        }}
                                        className='text-[10px] uppercase tracking-[0.2em] font-black px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5'
                                    >
                                        {editablePermissions.every((p) => values.permissions.includes(p))
                                            ? 'Tout désélectionner'
                                            : 'Tout sélectionner'}
                                    </button>
                                )}
                            </div>

                            {!isRootAdmin && loggedInPermissions[0] !== '*' && (
                                <div className='mb-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4'>
                                    <Shield className='text-blue-500' width={20} />
                                    <p className='text-xs text-blue-200/60 font-medium'>
                                        Certaines permissions sont masquées car vous ne les possédez pas vous-même.
                                    </p>
                                </div>
                            )}

                            <div className='grid grid-cols-1 gap-6'>
                                {Object.keys(permissions)
                                    .filter((key) => key !== 'websocket')
                                    .map((key) => {
                                        const Icon = getPermissionIcon(key);
                                        const categoryKeys = Object.keys(permissions[key]?.keys ?? {}).map(
                                            (pkey) => `${key}.${pkey}`,
                                        );
                                        const isAllCategorySelected = categoryKeys.every((p) =>
                                            values.permissions.includes(p),
                                        );

                                        return (
                                            <div
                                                key={key}
                                                className='group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden transition-all hover:border-white/10'
                                            >
                                                <div className='p-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]'>
                                                    <div className='flex items-center gap-4'>
                                                        <div className='p-2.5 bg-zinc-900 rounded-2xl border border-white/5 text-blue-500'>
                                                            <Icon width={20} height={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className='font-bold text-white capitalize'>{key}</h4>
                                                            <p className='text-[11px] text-zinc-500 font-medium'>
                                                                {permissions[key]?.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {canEditUser && (
                                                        <button
                                                            type='button'
                                                            onClick={() => {
                                                                if (isAllCategorySelected) {
                                                                    setFieldValue(
                                                                        'permissions',
                                                                        values.permissions.filter(
                                                                            (p) => !categoryKeys.includes(p),
                                                                        ),
                                                                    );
                                                                } else {
                                                                    setFieldValue(
                                                                        'permissions',
                                                                        Array.from(
                                                                            new Set([
                                                                                ...values.permissions,
                                                                                ...categoryKeys.filter((p) =>
                                                                                    editablePermissions.includes(p),
                                                                                ),
                                                                            ]),
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            className={clsx(
                                                                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border',
                                                                isAllCategorySelected
                                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                                    : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300',
                                                            )}
                                                        >
                                                            <Check
                                                                width={14}
                                                                height={14}
                                                                className={clsx(!isAllCategorySelected && 'opacity-0')}
                                                            />
                                                            <span className='text-[10px] font-black uppercase tracking-widest'>
                                                                Groupe
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-3'>
                                                    {Object.keys(permissions[key]?.keys ?? {}).map((pkey) => (
                                                        <PermissionRow
                                                            key={`permission_${key}.${pkey}`}
                                                            permission={`${key}.${pkey}`}
                                                            disabled={
                                                                !canEditUser ||
                                                                !editablePermissions.includes(`${key}.${pkey}`)
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Footer Fixe / Boutons */}
                        <Can action={subuser ? 'user.update' : 'user.create'}>
                            <div className='flex flex-col sm:flex-row gap-3 justify-end pt-8'>
                                <ActionButton
                                    variant='secondary'
                                    type='button'
                                    onClick={onCancel}
                                    className='px-8 py-3 rounded-2xl border-white/5 hover:bg-white/5 font-bold text-sm'
                                >
                                    Annuler
                                </ActionButton>
                                <ActionButton
                                    variant='primary'
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-10 py-3 rounded-2xl shadow-lg shadow-blue-500/10 font-bold text-sm'
                                >
                                    {subuser ? 'Mettre à jour' : "Inviter l'utilisateur"}
                                </ActionButton>
                            </div>
                        </Can>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default UserFormComponent;
