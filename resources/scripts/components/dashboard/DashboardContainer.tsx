import { Bars, ChevronDown, House, LayoutCellsLarge, SlidersVertical } from '@gravity-ui/icons';
import { useStoreState } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import ServerRow from '@/components/dashboard/ServerRow';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/elements/DropdownMenu';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Pagination from '@/components/elements/Pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/elements/Tabs';
import { PageListContainer } from '@/components/elements/pages/PageList';

import getServers from '@/api/getServers';
import { PaginatedResult } from '@/api/http';
import { Server } from '@/api/server/getServer';

import useFlash from '@/plugins/useFlash';
import { usePersistedState } from '@/plugins/usePersistedState';

import { MainPageHeader } from '../elements/MainPageHeader';

const DashboardContainer = () => {
    const getTitle = () => {
        if (serverViewMode === 'admin-all') return 'Tout les serveurs (Admin)';
        if (serverViewMode === 'all') return 'Tout les serveurs';
        return 'Vos serveurs';
    };

    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    // const showOnlyAdmin = usePersistedState(`${uuid}:show_all_servers`, false);

    const [serverViewMode, setServerViewMode] = usePersistedState<'owner' | 'admin-all' | 'all'>(
        `${uuid}:server_view_mode`,
        rootAdmin ? 'admin-all' : 'owner',
    );

    const [dashboardDisplayOption, setDashboardDisplayOption] = usePersistedState(
        `${uuid}:dashboard_display_option`,
        'list',
    );

    const getApiType = (): string | undefined => {
        if (serverViewMode === 'owner') return 'owner';
        if (serverViewMode === 'admin-all') return 'admin-all';
        if (serverViewMode === 'all') return 'all';
        return undefined;
    };

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', serverViewMode, page],
        () => getServers({ page, type: getApiType() }),
        { revalidateOnFocus: false },
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div className='w-full h-full min-h-full flex-1 flex flex-col px-2 sm:px-0'>
                <Tabs
                    defaultValue={dashboardDisplayOption}
                    onValueChange={(value) => {
                        setDashboardDisplayOption(value);
                    }}
                    className='w-full'
                >
                    <div
                        className='transform-gpu skeleton-anim-2 mb-3 sm:mb-4'
                        style={{
                            animationDelay: '50ms',
                            animationTimingFunction:
                                'linear(0,0.01,0.04 1.6%,0.161 3.3%,0.816 9.4%,1.046,1.189 14.4%,1.231,1.254 17%,1.259,1.257 18.6%,1.236,1.194 22.3%,1.057 27%,0.999 29.4%,0.955 32.1%,0.942,0.935 34.9%,0.933,0.939 38.4%,1 47.3%,1.011,1.017 52.6%,1.016 56.4%,1 65.2%,0.996 70.2%,1.001 87.2%,1)',
                        }}
                    >
                        <MainPageHeader
                            title={getTitle()}
                            titleChildren={
                                <div className='flex gap-4'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className='inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#ffffff11] px-3 py-1.5 text-sm font-medium text-[#ffffff88] transition-all hover:bg-[#ffffff23] hover:text-[#ffffff] focus-visible:outline-hidden'>
                                                <SlidersVertical width={20} height={21} color='white' />
                                                <div>{getTitle()}</div>
                                                <ChevronDown width={13} height={13} color='white' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='flex flex-col gap-1 z-99999' sideOffset={8}>
                                            <DropdownMenuItem
                                                onSelect={() => setServerViewMode('owner')}
                                                className={serverViewMode === 'owner' ? 'bg-accent/20' : ''}
                                            >
                                                Vos serveurs
                                            </DropdownMenuItem>

                                            {rootAdmin && (
                                                <>
                                                    <DropdownMenuItem
                                                        onSelect={() => setServerViewMode('admin-all')}
                                                        className={serverViewMode === 'admin-all' ? 'bg-accent/20' : ''}
                                                    >
                                                        Tout les serveurs (Admin)
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem
                                                onSelect={() => setServerViewMode('all')}
                                                className={serverViewMode === 'all' ? 'bg-accent/20' : ''}
                                            >
                                                Tout les serveurs
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <TabsList>
                                        <TabsTrigger aria-label='Voir les serveurs en liste' value='list'>
                                            <Bars width={18} height={20} color='white' />
                                        </TabsTrigger>
                                        <TabsTrigger aria-label='Voir les serveurs en grille' value='grid'>
                                            <LayoutCellsLarge width={20} height={20} color='white' />
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            }
                        />
                    </div>
                    {!servers ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand'></div>
                        </div>
                    ) : (
                        <>
                            <TabsContent value='list' className='outline-none'>
                                <Pagination data={servers} onPageSelect={setPage}>
                                    {({ items }) =>
                                        items.length > 0 ? (
                                            <div className='flex flex-col gap-3'>
                                                {items.map((server, index) => (
                                                    <div
                                                        key={server.uuid}
                                                        className='animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both'
                                                        style={{ animationDelay: `${index * 40}ms` }}
                                                    >
                                                        <ServerRow server={server} className='w-full' />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyServerState admin={serverViewMode === 'admin-all'} />
                                        )
                                    }
                                </Pagination>
                            </TabsContent>
                            <TabsContent value='grid' className='outline-none'>
                                <Pagination data={servers} onPageSelect={setPage}>
                                    {({ items }) =>
                                        items.length > 0 ? (
                                            <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4'>
                                                {items.map((server, index) => (
                                                    <div
                                                        key={server.uuid}
                                                        className='animate-in fade-in zoom-in-95 duration-500 fill-mode-both'
                                                        style={{ animationDelay: `${index * 40}ms` }}
                                                    >
                                                        <ServerRow
                                                            server={server}
                                                            className='flex-col items-start h-full min-h-[160px] justify-between'
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyServerState admin={serverViewMode === 'admin-all'} />
                                        )
                                    }
                                </Pagination>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </PageContentBlock>
    );
};

/**
 * Composant interne pour l'état vide (Empty State)
 * Centralise le design pour éviter la répétition
 */
const EmptyServerState = ({ admin }: { admin: boolean }) => (
    <div className='flex flex-col items-center justify-center py-20 px-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]'>
        <div className='relative mb-6'>
            <div className='absolute inset-0 bg-blue-500/20 blur-3xl rounded-full' />
            <div className='relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center shadow-2xl'>
                <House width={32} height={32} className='text-zinc-400' />
            </div>
        </div>
        <div className='text-center space-y-2'>
            <h3 className='text-xl font-bold text-white tracking-tight'>
                {admin ? 'Aucun autre serveur trouvé' : 'Aucun serveur trouvé'}
            </h3>
            <p className='text-sm text-zinc-500 max-w-[280px] leading-relaxed'>
                {admin
                    ? 'La base de données ne contient aucun autre serveur à afficher pour le moment.'
                    : "Il semblerait que vous n'ayez aucun serveur actif associé à votre compte."}
            </p>
        </div>
    </div>
);

export default DashboardContainer;
