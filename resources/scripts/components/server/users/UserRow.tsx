import { Pencil, Person, ShieldCheck, ShieldExclamation } from '@gravity-ui/icons';
import clsx from 'clsx';
import { useStoreState } from 'easy-peasy';
import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { useNavigate } from 'react-router-dom';

import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';

import { ServerContext } from '@/state/server';
import { Subuser } from '@/state/server/subusers';

interface Props {
    subuser: Subuser;
}

const UserRow = ({ subuser }: Props) => {
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const navigate = useNavigate();
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);

    const handleEditClick = () => {
        navigate(`/server/${serverId}/users/${subuser.uuid}/edit`);
    };

    const isSelf = subuser.uuid === uuid;

    return (
        <div
            className={clsx(
                'group relative overflow-hidden transition-all duration-300',
                'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/10',
                'rounded-3xl p-4 sm:p-5',
            )}
        >
            <div className='relative z-10 flex flex-col md:flex-row md:items-center gap-5'>
                {/* Gauche: Avatar & Identité */}
                <div className='flex items-center gap-4 flex-1 min-w-0'>
                    <div className='relative shrink-0'>
                        <div className='w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden group-hover:border-white/20 transition-colors'>
                            <img
                                className='w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity'
                                src={`${subuser.image}?s=400`}
                                alt={subuser.username}
                            />
                        </div>
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3'>
                            <h3 className='text-base font-bold text-zinc-100 truncate tracking-tight'>
                                {subuser.username}
                            </h3>
                            {isSelf && (
                                <span className='px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400'>
                                    Moi
                                </span>
                            )}
                        </div>
                        <p className='text-xs text-zinc-500 font-medium truncate mt-0.5'>{subuser.email}</p>
                    </div>
                </div>

                <div className='flex items-center gap-8 md:px-8 border-y md:border-y-0 md:border-x border-white/5 py-4 md:py-0'>
                    <div className='flex flex-col items-center md:items-start'>
                        <p className='text-lg font-mono font-black text-white leading-none'>
                            {subuser.permissions
                                .filter((p) => p !== 'websocket.connect')
                                .length.toString()
                                .padStart(2, '0')}
                        </p>
                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-1'>
                            Privilèges
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2 shrink-0 md:justify-end'>
                    <Can action={'user.update'}>
                        <button
                            onClick={handleEditClick}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 text-zinc-400 border border-white/5 hover:border-white/20 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-black uppercase tracking-widest'
                        >
                            <Pencil width={14} height={14} />
                            <span>Éditer</span>
                        </button>
                    </Can>

                    {!isSelf && (
                        <Can action={'user.delete'}>
                            <RemoveSubuserButton subuser={subuser} />
                        </Can>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(UserRow, isEqual);
