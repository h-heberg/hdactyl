import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

import { SocketEvent, SocketRequest } from '@/components/server/events';

import { bytesToString, ip, mbToBytes } from '@/lib/formatters';

import { SubdomainInfo, getSubdomainInfo } from '@/api/server/network/subdomain';

import { ServerContext } from '@/state/server';

import useWebsocketEvent from '@/plugins/useWebsocketEvent';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const StatProgress = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percentage = Math.min((value / (max || value || 1)) * 100, 100);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className='relative flex items-center justify-center w-10 h-10'>
            <svg className='w-full h-full transform -rotate-90'>
                <circle
                    cx='20'
                    cy='20'
                    r={radius}
                    stroke='currentColor'
                    strokeWidth='3'
                    fill='transparent'
                    className='text-white/5'
                />
                <circle
                    cx='20'
                    cy='20'
                    r={radius}
                    stroke='currentColor'
                    strokeWidth='3'
                    fill='transparent'
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap='round'
                    className={clsx('transition-all duration-1000 ease-out', color)}
                />
            </svg>
            <span className='absolute text-[9px] font-bold text-zinc-400'>{Math.round(percentage)}%</span>
        </div>
    );
};

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const [subdomainInfo, setSubdomainInfo] = useState<SubdomainInfo | null>(null);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((a) => a.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    const displayAddress = useMemo(() => {
        if (
            subdomainInfo?.current_subdomain?.attributes?.is_active &&
            subdomainInfo.current_subdomain.attributes.full_domain
        ) {
            return subdomainInfo.current_subdomain.attributes.full_domain;
        }
        return allocation;
    }, [subdomainInfo, allocation]);

    useEffect(() => {
        getSubdomainInfo(uuid)
            .then(setSubdomainInfo)
            .catch(() => setSubdomainInfo(null));
    }, [uuid]);

    useEffect(() => {
        if (connected && instance) instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        try {
            const s = JSON.parse(data);
            setStats({
                memory: s.memory_bytes,
                cpu: s.cpu_absolute,
                disk: s.disk_bytes,
                tx: s.network.tx_bytes,
                rx: s.network.rx_bytes,
                uptime: s.uptime || 0,
            });
        } catch (e) {
            console.error('Failed to parse stats data:', e);
        }
    });

    return (
        <div className={clsx('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4', className)}>
            {/* IP Address */}
            <div className='bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center gap-4'>
                <div className='p-2.5 bg-blue-500/10 rounded-lg'>
                    <svg className='w-5 h-5 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                        />
                    </svg>
                </div>
                <div className='flex-1 min-w-0'>
                    <p className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider'>Adresse IP</p>
                    <p className='text-sm font-mono text-zinc-200 truncate select-all'>{displayAddress}</p>
                </div>
            </div>

            {/* CPU usage */}
            <div className='bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='p-2.5 bg-purple-500/10 rounded-lg'>
                        <svg className='w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider'>Processeur</p>
                        <p className='text-sm font-mono text-zinc-200'>
                            {status === 'offline' ? '---' : `${stats.cpu.toFixed(1)}%`}
                        </p>
                    </div>
                </div>
                <StatProgress value={stats.cpu} max={limits.cpu || 100} color='text-purple-500' />
            </div>

            {/* RAM usage */}
            <div className='bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='p-2.5 bg-emerald-500/10 rounded-lg'>
                        <svg className='w-5 h-5 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider'>Mémoire RAM</p>
                        <p className='text-sm font-mono text-zinc-200'>
                            {status === 'offline' ? '---' : bytesToString(stats.memory)}
                        </p>
                    </div>
                </div>
                <StatProgress
                    value={stats.memory}
                    max={mbToBytes(limits.memory) || stats.memory}
                    color='text-emerald-500'
                />
            </div>

            {/* Storage usage */}
            <div className='bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='p-2.5 bg-amber-500/10 rounded-lg'>
                        <svg className='w-5 h-5 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider'>Stockage Disque</p>
                        <p className='text-sm font-mono text-zinc-200'>{bytesToString(stats.disk)}</p>
                    </div>
                </div>
                <StatProgress value={stats.disk} max={mbToBytes(limits.disk) || stats.disk} color='text-amber-500' />
            </div>
        </div>
    );
};

export default ServerDetailsBlock;
