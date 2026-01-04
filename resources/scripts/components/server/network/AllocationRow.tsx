import { AntennaSignal, Copy, CrownDiamond, TrashBin, Xmark } from '@gravity-ui/icons';
import clsx from 'clsx';
import { memo, useCallback, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { Textarea } from '@/components/elements/Input';
import InputSpinner from '@/components/elements/InputSpinner';
import Spinner from '@/components/elements/Spinner';

import { ip } from '@/lib/formatters';

import { Allocation } from '@/api/server/getServer';
import deleteServerAllocation from '@/api/server/network/deleteServerAllocation';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import getServerAllocations from '@/api/swr/getServerAllocations';

import { ServerContext } from '@/state/server';

import { useFlashKey } from '@/plugins/useFlash';

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState(allocation.notes || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback(
        (id: number, notes: string) => {
            mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
        },
        [mutate],
    );

    const saveNotes = useCallback(() => {
        setLoading(true);
        clearFlashes();
        setServerAllocationNotes(uuid, allocation.id, notesValue)
            .then(() => {
                onNotesChanged(allocation.id, notesValue);
                setIsEditingNotes(false);
            })
            .catch(clearAndAddHttpError)
            .finally(() => setLoading(false));
    }, [uuid, allocation.id, notesValue, onNotesChanged, clearFlashes, clearAndAddHttpError]);

    const allocationString = allocation.alias
        ? `${allocation.alias}:${allocation.port}`
        : `${ip(allocation.ip)}:${allocation.port}`;

    return (
        <div
            className={clsx(
                'group relative overflow-hidden transition-all duration-300',
                'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/10',
                'rounded-3xl p-4 sm:p-5',
            )}
        >
            <div className='relative z-10 flex flex-col md:flex-row md:items-center gap-5'>
                {/* Left: Icon & IP Info */}
                <div className='flex items-start gap-4 flex-1 min-w-0'>
                    <div className='hidden sm:flex p-3 bg-zinc-900/50 rounded-xl border border-white/5 text-zinc-500 group-hover:text-zinc-300 transition-colors'>
                        <AntennaSignal width={20} height={20} />
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 flex-wrap'>
                            <CopyOnClick text={allocationString}>
                                <div className='cursor-pointer group/copy flex items-center gap-2'>
                                    <h3 className='text-sm sm:text-base font-mono font-bold text-zinc-100 group-hover/copy:text-white transition-colors tracking-tight'>
                                        {allocationString}
                                    </h3>
                                    <Copy
                                        width={14}
                                        height={14}
                                        className='text-zinc-600 group-hover/copy:text-zinc-400 transition-colors'
                                    />
                                </div>
                            </CopyOnClick>

                            {allocation.isDefault && (
                                <div className='px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5'>
                                    <CrownDiamond width={12} height={12} />
                                    Par défaut
                                </div>
                            )}
                        </div>

                        {/* Notes Inline Section */}
                        <div className='mt-2'>
                            {isEditingNotes ? (
                                <div className='mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200'>
                                    <InputSpinner visible={loading}>
                                        <Textarea
                                            ref={textareaRef}
                                            className='w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-zinc-300 placeholder-zinc-600 focus:ring-1 focus:ring-zinc-500 transition-all'
                                            placeholder='Note descriptive...'
                                            value={notesValue}
                                            onChange={(e) => setNotesValue(e.currentTarget.value)}
                                            rows={2}
                                        />
                                    </InputSpinner>
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={saveNotes}
                                            className='px-3 py-1 bg-zinc-100 text-black rounded-lg text-xs font-bold hover:bg-white transition-colors'
                                        >
                                            Sauvegarder
                                        </button>
                                        <button
                                            onClick={() => setIsEditingNotes(false)}
                                            className='px-3 py-1 bg-white/5 text-zinc-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors'
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setIsEditingNotes(true)}
                                    className='group/note cursor-pointer inline-flex items-center gap-2'
                                >
                                    <p
                                        className={clsx(
                                            'text-xs font-medium transition-colors leading-relaxed truncate max-w-[300px]',
                                            allocation.notes
                                                ? 'text-zinc-500 group-hover/note:text-zinc-300'
                                                : 'text-zinc-700 italic group-hover/note:text-zinc-500',
                                        )}
                                    >
                                        {allocation.notes || 'Ajouter une note...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className='flex items-center gap-2 sm:justify-end shrink-0'>
                    <Can action={'allocation.update'}>
                        <button
                            disabled={allocation.isDefault}
                            onClick={() => {
                                clearFlashes();
                                setPrimaryServerAllocation(uuid, allocation.id)
                                    .then(() => mutate())
                                    .catch(clearAndAddHttpError);
                            }}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border',
                                allocation.isDefault
                                    ? 'bg-white/5 text-zinc-600 border-transparent opacity-50'
                                    : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-zinc-800',
                            )}
                        >
                            <CrownDiamond width={14} height={14} />
                            <span className='hidden lg:inline'>Définir par défaut</span>
                            <span className='lg:hidden'>Défaut</span>
                        </button>
                    </Can>

                    <Can action={'allocation.delete'}>
                        <button
                            disabled={allocation.isDefault || deleteLoading}
                            onClick={() => {
                                if (confirm('Supprimer cette allocation ?')) {
                                    setDeleteLoading(true);
                                    deleteServerAllocation(uuid, allocation.id)
                                        .then(() => mutate())
                                        .catch(clearAndAddHttpError)
                                        .finally(() => setDeleteLoading(false));
                                }
                            }}
                            className={clsx(
                                'p-2.5 rounded-xl transition-all border',
                                allocation.isDefault
                                    ? 'hidden'
                                    : 'bg-red-500/5 text-red-500/50 border-red-500/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40',
                            )}
                        >
                            {deleteLoading ? <Spinner size='small' /> : <TrashBin width={18} height={18} />}
                        </button>
                    </Can>
                </div>
            </div>
        </div>
    );
};

export default memo(AllocationRow, isEqual);
