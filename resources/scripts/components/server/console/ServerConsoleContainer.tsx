import { CircleInfo } from '@gravity-ui/icons';
import { memo, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';

import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
// import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import { Alert } from '@/components/elements/alert';
import Console from '@/components/server/console/Console';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import { CrashAnalysisCard } from '@/components/server/features/MclogsFeature';

import { ServerContext } from '@/state/server';

import useWebsocketEvent from '@/plugins/useWebsocketEvent';

import Features from '@feature/Features';

import UptimeDuration from '../UptimeDuration';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';
type UptimeStat = Record<'uptime', number>;

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const [uptime, setUptime] = useState<UptimeStat>({ uptime: 0 });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }
        setUptime({
            uptime: stats.uptime || 0,
        });
    });

    return (
        <ServerContentBlock title={'Home'}>
            <div className='w-full h-full min-h-full flex-1 flex flex-col px-2 sm:px-0'>
                {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                    <div className='transform-gpu skeleton-anim-2 mb-6'>
                        <Alert type={'warning'}>
                            {isNodeUnderMaintenance
                                ? 'La node est en maintenance.'
                                : isInstalling
                                  ? "Le serveur est en cours d'installation..."
                                  : 'Le serveur est en cours de transfert.'}
                        </Alert>
                    </div>
                )}

                <div className='transform-gpu skeleton-anim-2 mb-4'>
                    <MainPageHeader
                        title={name}
                        headChildren={
                            <div className='hidden ms:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md'>
                                <div className='relative flex h-2 w-2'>
                                    <span className='animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                    <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                                </div>
                                <span className='text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400'>
                                    Uptime: <span className='text-emerald-400 font-mono'>{UptimeDuration(uptime)}</span>
                                </span>
                            </div>
                        }
                        titleChildren={<PowerButtons className='flex items-center' />}
                    />
                </div>

                <div className='flex flex-col gap-4'>
                    <div className='transform-gpu skeleton-anim-2'>
                        <ServerDetailsBlock />
                    </div>

                    {eggFeatures.map((v) => v.toLowerCase()).includes('mclogs') && (
                        <div className='transform-gpu skeleton-anim-2'>
                            <CrashAnalysisCard />
                        </div>
                    )}

                    <div className='transform-gpu skeleton-anim-2'>
                        <div className='bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl'>
                            <Console />
                        </div>
                    </div>

                    <div className='transform-gpu skeleton-anim-2'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <Spinner.Suspense>
                                <StatGraphs />
                            </Spinner.Suspense>
                        </div>
                    </div>

                    <div className='transform-gpu skeleton-anim-2 pb-10'>
                        <ErrorBoundary>
                            <Features enabled={eggFeatures} />
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
