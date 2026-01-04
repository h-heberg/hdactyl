import { Globe, Plus } from '@gravity-ui/icons';
import { For } from 'million/react';
import { useEffect } from 'react';
import isEqual from 'react-fast-compare';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer } from '@/components/elements/pages/PageList';
import AllocationRow from '@/components/server/network/AllocationRow';

import createServerAllocation from '@/api/server/network/createServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';

import { ServerContext } from '@/state/server';

import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import { useFlashKey } from '@/plugins/useFlash';

const NetworkContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.allocations);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const { data, error, mutate } = getServerAllocations();

    useEffect(() => {
        mutate(allocations);
    }, [mutate, allocations]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [clearAndAddHttpError, error]);

    useDeepCompareEffect(() => {
        if (!data) return;
        setServerFromState((state) => ({ ...state, allocations: data }));
    }, [data]);

    const onCreateAllocation = () => {
        clearFlashes();
        createServerAllocation(uuid)
            .then((allocation) => {
                setServerFromState((s) => ({ ...s, allocations: s.allocations.concat(allocation) }));
                return mutate(data?.concat(allocation), false);
            })
            .catch((error) => clearAndAddHttpError(error));
    };

    return (
        <ServerContentBlock title={'Network'}>
            <FlashMessageRender byKey={'server:network'} />

            <MainPageHeader title={'Networking'}>
                <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl'>
                    Configure network settings for your server. Manage subdomains, IP addresses and ports that your
                    server can bind to for incoming connections.
                </p>
            </MainPageHeader>

            <div className='mt-10'>
                <div className='bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300'>
                    {/* Header interne au bloc */}
                    <div className='p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]'>
                        <div className='flex items-center gap-4'>
                            <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400'>
                                <Globe width={20} height={20} />
                            </div>
                            <div>
                                <h3 className='text-sm font-bold uppercase tracking-widest text-zinc-200'>
                                    Port Allocations
                                </h3>
                                <p className='text-[11px] text-zinc-500 font-medium'>Manage incoming port bindings</p>
                            </div>
                        </div>

                        {data && (
                            <Can action={'allocation.create'}>
                                <div className='flex items-center gap-4'>
                                    <div className='hidden sm:flex items-center px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-tighter'>
                                        {allocationLimit === null ? (
                                            <span>{data.filter((a) => !a.isDefault).length} / ∞</span>
                                        ) : allocationLimit === 0 ? (
                                            <span className='text-red-400'>Désactivé</span>
                                        ) : (
                                            <span>
                                                {data.filter((a) => !a.isDefault).length} sur {allocationLimit} utilisés
                                            </span>
                                        )}
                                    </div>

                                    {(allocationLimit === null ||
                                        (allocationLimit > 0 &&
                                            allocationLimit > data.filter((a) => !a.isDefault).length)) && (
                                        <ActionButton
                                            variant='primary'
                                            onClick={onCreateAllocation}
                                            className='group !rounded-full !px-5 !py-2 flex items-center gap-2'
                                        >
                                            <Plus width={16} height={16} />
                                            <span className='text-xs font-bold uppercase tracking-wider'>
                                                Ajouter une allocation
                                            </span>
                                        </ActionButton>
                                    )}
                                </div>
                            </Can>
                        )}
                    </div>

                    {/* Liste ou états vides */}
                    <div className='p-2'>
                        {!data ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-4'>
                                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-white/20 border-t-zinc-200'></div>
                                <p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
                                    Synchronizing...
                                </p>
                            </div>
                        ) : data.length > 0 ? (
                            <div className='space-y-1 p-2'>
                                <PageListContainer>
                                    <For each={data} memo>
                                        {(allocation) => (
                                            <AllocationRow
                                                key={`${allocation.ip}:${allocation.port}`}
                                                allocation={allocation}
                                            />
                                        )}
                                    </For>
                                </PageListContainer>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
                                <div className='w-16 h-16 mb-6 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/5'>
                                    <Globe width={28} height={28} className='text-zinc-600' />
                                </div>
                                <h4 className='text-lg font-bold text-zinc-200 tracking-tight'>
                                    {allocationLimit === 0 ? 'Allocations Restricted' : 'No Ports Assigned'}
                                </h4>
                                <p className='text-sm text-zinc-500 mt-2 max-w-[280px] leading-relaxed font-medium'>
                                    {allocationLimit === 0
                                        ? 'Your current plan does not allow for additional network allocations.'
                                        : 'Every server needs at least one port to communicate with the world.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default NetworkContainer;
