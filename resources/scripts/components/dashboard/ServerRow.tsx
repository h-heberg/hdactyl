import { Server as ServerIcon } from '@gravity-ui/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { bytesToString, ip } from '@/lib/formatters';

import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';

const ServerRow = ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<NodeJS.Timeout | null>(null);
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const isGrid = className?.includes('flex-col');

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            if (interval.current) clearInterval(interval.current);
        };
    }, [isSuspended]);

    const getStatusBadge = (status: ServerPowerState | undefined) => {
        if (isSuspended) return { label: 'Suspendu', css: 'bg-red-500/20 text-red-400 border-red-500/30' };

        switch (status) {
            case 'running':
                return { label: 'En ligne', css: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
            case 'starting':
                return { label: 'Démarrage', css: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
            case 'stopping':
                return { label: 'Arrêt en cours', css: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
            default:
                return { label: 'Hors-ligne', css: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
        }
    };

    const statusBadge = getStatusBadge(stats?.status);

    return (
        <Link
            to={`/server/${server.id}`}
            className={clsx(
                'group relative flex overflow-hidden transition-all duration-300',
                'rounded-2xl border border-white/5 hover:border-white/20',
                isGrid ? 'flex-col min-h-[200px]' : 'flex-row items-center justify-between gap-4 p-5',
                className,
            )}
        >
            <div
                className='absolute inset-0 z-0'
                style={{
                    backgroundImage: `url(${server.nest?.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div
                className='absolute inset-0 z-0'
                style={{
                    backgroundImage: `url(${server.nest?.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className='absolute inset-0 z-10 bg-zinc-950/70 backdrop-blur-[2px] group-hover:bg-zinc-950/50 transition-colors' />

            {/* Top Section */}
            <div className={clsx('relative z-20 flex items-center gap-4', isGrid ? 'w-full p-5' : 'min-w-0')}>
                <div className='p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10'>
                    <ServerIcon className='text-white' width={24} height={24} />
                </div>

                <div className='flex flex-col min-w-0 flex-1'>
                    <div className='flex items-center gap-3'>
                        <h3 className='text-lg font-bold text-white truncate drop-shadow-md'>{server.name}</h3>

                        {/* Status badge */}
                        <div
                            className={clsx(
                                'px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider backdrop-blur-md',
                                statusBadge.css,
                            )}
                        >
                            {statusBadge.label}
                        </div>
                    </div>
                    <p className='text-xs font-mono text-zinc-300 mt-1'>
                        {server.allocations.find((a) => a.isDefault)?.alias ||
                            ip(server.allocations.find((a) => a.isDefault)?.ip || '')}
                        :{server.allocations.find((a) => a.isDefault)?.port}
                    </p>
                </div>
            </div>

            {/* Bottom/Right Section: Stats */}
            <div
                className={clsx(
                    'relative z-20 flex items-center',
                    isGrid
                        ? 'w-full px-5 py-4 mt-auto bg-black/40 backdrop-blur-md border-t border-white/10 justify-between'
                        : 'sm:w-auto justify-end',
                )}
            >
                {!stats || isSuspended ? (
                    <div className='px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-red-500/40 backdrop-blur-md border border-white/20 rounded-lg'>
                        {isSuspended
                            ? 'Suspendu'
                            : server.status === 'install_failed'
                              ? 'Installation échouée'
                              : server.status === 'installing'
                                ? 'Installation en cours'
                                : server.status === 'restoring_backup'
                                  ? 'Restauration de sauvegarde'
                                  : server.status === 'reinstall_failed'
                                    ? 'Réinstallation échouée'
                                    : server.status === 'suspended'
                                      ? 'Suspendu'
                                      : 'Hors-ligne'}
                    </div>
                ) : (
                    <div className={clsx('flex gap-4', isGrid ? 'w-full justify-around' : 'justify-end')}>
                        <GridStat
                            label='CPU'
                            value={`${stats.cpuUsagePercent.toFixed(0)}%`}
                            color='text-purple-300'
                            isGrid={isGrid}
                        />
                        <GridStat
                            label='RAM'
                            value={bytesToString(stats.memoryUsageInBytes, 0)}
                            color='text-emerald-300'
                            isGrid={isGrid}
                        />
                        <GridStat
                            label='DISK'
                            value={bytesToString(stats.diskUsageInBytes, 0)}
                            color='text-amber-300'
                            isGrid={isGrid}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
};

const GridStat = ({
    label,
    value,
    color,
    isGrid,
}: {
    label: string;
    value: string;
    color: string;
    isGrid?: boolean;
}) => {
    if (isGrid) {
        return (
            <div className='flex flex-col items-center gap-1'>
                <span className='text-[10px] font-bold text-zinc-500 uppercase tracking-tighter'>{label}</span>
                <span className={clsx('text-sm font-mono font-bold', color)}>{value}</span>
            </div>
        );
    }
    return (
        <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 border border-white/5'>
            <span className='text-[9px] uppercase font-black text-zinc-500 tracking-tighter'>{label}</span>
            <span className={clsx('text-xs font-mono font-bold', color)}>{value}</span>
        </div>
    );
};

export default ServerRow;
