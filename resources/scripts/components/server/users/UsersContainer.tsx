import { Person, Plus } from '@gravity-ui/icons';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { For } from 'million/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer } from '@/components/elements/pages/PageList';
import UserRow from '@/components/server/users/UserRow';

import { httpErrorToHuman } from '@/api/http';
import getServerSubusers from '@/api/server/users/getServerSubusers';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

const UsersContainer = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const subusers = ServerContext.useStoreState((state) => state.subusers.data);
    const setSubusers = ServerContext.useStoreActions((actions) => actions.subusers.setSubusers);

    const permissions = useStoreState((state: ApplicationStore) => state.permissions.data);
    const getPermissions = useStoreActions((actions: Actions<ApplicationStore>) => actions.permissions.getPermissions);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        clearFlashes('users');
        getServerSubusers(uuid)
            .then((subusers) => {
                setSubusers(subusers);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'users', message: httpErrorToHuman(error) });
            });
    }, []);

    useEffect(() => {
        getPermissions().catch((error) => {
            addError({ key: 'users', message: httpErrorToHuman(error) });
            console.error(error);
        });
    }, []);

    if (!subusers.length && (loading || !Object.keys(permissions).length)) {
        return (
            <ServerContentBlock title={'Users'}>
                <FlashMessageRender byKey={'users'} />
                <MainPageHeader title={'Users'}>
                    <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl'>
                        Gère l&apos;accès des utilisateurs à votre serveur. Accordez des permissions spécifiques à
                        d&apos;autres utilisateurs pour vous aider à gérer et maintenir votre serveur.
                    </p>
                    <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl mt-2'>
                        Chargement des utilisateurs...
                    </p>
                </MainPageHeader>
                <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand'></div>
                </div>
            </ServerContentBlock>
        );
    }

    return (
        <ServerContentBlock title={'Users'}>
            <FlashMessageRender byKey={'users'} />
            <MainPageHeader title={'Users'}>
                <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl'>
                    Gère l&apos;accès des utilisateurs à votre serveur. Accordez des permissions spécifiques à
                    d&apos;autres utilisateurs pour vous aider à gérer et maintenir votre serveur.
                </p>
            </MainPageHeader>

            <div className='mt-10'>
                <div className='bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300'>
                    <div className='p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]'>
                        <div className='flex items-center gap-4'>
                            <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400'>
                                <Person width={20} height={20} />
                            </div>
                            <div>
                                <h3 className='text-sm font-bold uppercase tracking-widest text-zinc-200'>
                                    Utilisateurs serveur
                                </h3>
                                <p className='text-[11px] text-zinc-500 font-medium'>
                                    Gérez l&apos;accès et les permissions
                                </p>
                            </div>
                        </div>

                        <Can action={'user.create'}>
                            <div className='flex items-center gap-4'>
                                <div className='hidden sm:flex items-center px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-tighter'>
                                    <span>
                                        {subusers.length} {subusers.length === 1 ? 'utilisateur' : 'utilisateurs'}
                                    </span>
                                </div>

                                <ActionButton
                                    variant='primary'
                                    onClick={() => navigate(`/server/${serverId}/users/new`)}
                                    className='group !rounded-full !px-5 !py-2 flex items-center gap-2'
                                >
                                    <Plus width={16} height={16} />
                                    <span className='text-xs font-bold uppercase tracking-wider'>
                                        Ajouter un utilisateur
                                    </span>
                                </ActionButton>
                            </div>
                        </Can>
                    </div>

                    <div className='p-2'>
                        {!subusers.length ? (
                            <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
                                <div className='w-16 h-16 mb-6 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/5'>
                                    <Person width={28} height={28} className='text-zinc-600' />
                                </div>
                                <h4 className='text-lg font-bold text-zinc-200 tracking-tight'>
                                    Aucun utilisateur trouvé
                                </h4>
                                <p className='text-sm text-zinc-500 mt-2 max-w-[280px] leading-relaxed font-medium'>
                                    Votre serveur n&apos;a pas d&apos;utilisateurs supplémentaires. Ajoutez-en
                                    d&apos;autres pour vous aider à gérer votre serveur.
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-1 p-2'>
                                <PageListContainer>
                                    <For each={subusers} memo>
                                        {(subuser) => <UserRow key={subuser.uuid} subuser={subuser} />}
                                    </For>
                                </PageListContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default UsersContainer;
