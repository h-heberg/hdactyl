'use client';

import {
    ArrowRightFromSquare,
    BranchesDown,
    ChevronDown,
    ClockArrowRotateLeft,
    CloudArrowUpIn,
    Database,
    FolderOpen,
    Gear,
    House,
    Lock,
    PencilToLine,
    Persons,
    Terminal,
} from '@gravity-ui/icons';
import md5 from 'blueimp-md5';
import { useStoreState } from 'easy-peasy';
import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import routes from '@/routers/routes';

import Can from '@/components/elements/Can';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/elements/DropdownMenu';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import Logo from '@/components/elements/HLogo';
import MainSidebar from '@/components/elements/MainSidebar';
import MainWrapper from '@/components/elements/MainWrapper';
import { ServerMobileMenu } from '@/components/elements/MobileFullScreenMenu';
import MobileTopBar from '@/components/elements/MobileTopBar';
import PermissionRoute from '@/components/elements/PermissionRoute';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import CommandMenu from '@/components/elements/commandk/CmdK';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import InstallListener from '@/components/server/InstallListener';
import TransferListener from '@/components/server/TransferListener';
import WebsocketHandler from '@/components/server/WebsocketHandler';

import getServers from '@/api/getServers';
import { PaginatedResult, httpErrorToHuman } from '@/api/http';
import http from '@/api/http';
import { Server } from '@/api/server/getServer';
import { getSubdomainInfo } from '@/api/server/network/subdomain';

import { ServerContext } from '@/state/server';

const ServerRouter = () => {
    const params = useParams<'id'>();
    const location = useLocation();
    const navigate = useNavigate();

    // Global User State
    const user = useStoreState((state) => state.user.data);
    const rootAdmin = user?.rootAdmin;

    // Fetch all servers for the dropdown
    const { data: servers } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', 'all'],
        () => getServers({ type: 'all' }),
        { revalidateOnFocus: false },
    );

    console.log(servers);

    // Server State
    const [error, setError] = useState('');
    const [subdomainSupported, setSubdomainSupported] = useState(false);

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const serverName = ServerContext.useStoreState((state) => state.server.data?.name);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const databaseLimit = ServerContext.useStoreState((state) => state.server.data?.featureLimits.databases);
    const backupLimit = ServerContext.useStoreState((state) => state.server.data?.featureLimits.backups);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data?.featureLimits.allocations);

    const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);

    // Navigation Refs
    const NavigationHome = useRef(null);
    const NavigationFiles = useRef(null);
    const NavigationDatabases = useRef(null);
    const NavigationBackups = useRef(null);
    const NavigationNetworking = useRef(null);
    const NavigationUsers = useRef(null);
    const NavigationStartup = useRef(null);
    const NavigationSchedules = useRef(null);
    const NavigationSettings = useRef(null);
    const NavigationActivity = useRef(null);
    const NavigationShell = useRef(null);
    const NavigationApi = useRef(null);

    // Handlers
    const toggleMobileMenu = () => setMobileMenuVisible(!isMobileMenuVisible);
    const closeMobileMenu = () => setMobileMenuVisible(false);

    const onTriggerLogout = () => {
        http.post('/auth/logout').finally(() => {
            window.location.href = '/';
        });
    };

    // Effects
    useEffect(() => {
        setError('');
        if (params.id) {
            getServer(params.id).catch((error) => {
                setError(httpErrorToHuman(error));
            });
        }
        return () => clearServerState();
    }, [params.id]);

    useEffect(() => {
        if (uuid) {
            getSubdomainInfo(uuid)
                .then((data) => setSubdomainSupported(data.supported))
                .catch(() => setSubdomainSupported(false));
        }
    }, [uuid]);

    return (
        <Fragment key={'server-router'}>
            {!uuid || !id ? (
                error ? (
                    <ServerError title='Something went wrong' message={error} />
                ) : null
            ) : (
                <>
                    <MobileTopBar
                        onMenuToggle={toggleMobileMenu}
                        onTriggerLogout={onTriggerLogout}
                        onSelectAdminPanel={() => (window.location.href = '/admin/servers/view/' + serverId)}
                        rootAdmin={rootAdmin}
                    />

                    <ServerMobileMenu
                        isVisible={isMobileMenuVisible}
                        onClose={closeMobileMenu}
                        serverId={id}
                        databaseLimit={databaseLimit}
                        backupLimit={backupLimit}
                        allocationLimit={allocationLimit}
                        subdomainSupported={subdomainSupported}
                    />

                    <div className='flex flex-row w-full lg:pt-0 pt-16'>
                        <MainSidebar className='hidden lg:flex lg:relative lg:shrink-0'>
                            <div className='flex flex-row items-center justify-center h-8'>
                                <NavLink to={'/'} className='flex shrink-0 h-12 w-fit items-center'>
                                    <Logo className='h-12' />
                                </NavLink>
                            </div>

                            <div aria-hidden className='mt-8 mb-4 bg-[#ffffff33] min-h-[1px] w-full'></div>

                            <div className='mb-4 px-1'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='flex items-center justify-between w-full p-3 bg-[#ffffff09] border-[1px] border-[#ffffff11] rounded-xl text-sm transition-all hover:bg-[#ffffff0f] focus:outline-none group'>
                                        <div className='flex flex-col items-start overflow-hidden text-left'>
                                            <span className='text-[10px] uppercase font-bold text-white/30 tracking-wider'>
                                                Serveur actuel
                                            </span>
                                            <span className='w-full truncate font-semibold text-white group-hover:text-brand transition-colors'>
                                                {serverName}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className='ml-2 text-white/30 group-hover:text-white transition-colors'
                                            width={16}
                                            height={16}
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align='start'
                                        className='w-[240px] bg-[#111214] border-[#ffffff11] text-white'
                                    >
                                        <div className='p-2 text-[11px] font-bold text-white/30 uppercase tracking-widest'>
                                            Mes Serveurs
                                        </div>
                                        <div className='max-h-[300px] overflow-y-auto custom-scrollbar'>
                                            {servers?.items.map((server) => (
                                                <DropdownMenuItem
                                                    key={server.uuid}
                                                    onClick={() => navigate(`/server/${server.id}`)}
                                                    className={`flex flex-col items-start p-3 cursor-pointer rounded-lg m-1 transition-colors ${
                                                        server.id === id
                                                            ? 'bg-brand/10 border-brand/20'
                                                            : 'hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span
                                                        className={`font-medium ${server.id === id ? 'text-brand' : 'text-white'}`}
                                                    >
                                                        {server.name}
                                                    </span>
                                                    <span className='text-[11px] text-white/40 group-hover:text-white/60'>
                                                        {server.owner ? 'Propriétaire' : 'Collaborateur'}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <ul className='hh-subnav-routes-wrapper flex-grow overflow-y-auto'>
                                <li className='sidebar-category'>Général</li>
                                <NavLink
                                    ref={NavigationHome}
                                    to={`/server/${id}`}
                                    end
                                    className='flex flex-row items-center'
                                >
                                    <House width={22} height={22} fill='currentColor' />
                                    <p>Console</p>
                                </NavLink>

                                <li className='sidebar-category'>Gestion</li>
                                <Can action={'file.*'} matchAny>
                                    <NavLink
                                        ref={NavigationFiles}
                                        to={`/server/${id}/files`}
                                        className='flex flex-row items-center'
                                    >
                                        <FolderOpen width={22} height={22} fill='currentColor' />
                                        <p>Fichiers</p>
                                    </NavLink>
                                </Can>

                                {databaseLimit !== 0 && (
                                    <Can action={'database.*'} matchAny>
                                        <NavLink
                                            ref={NavigationDatabases}
                                            to={`/server/${id}/databases`}
                                            className='flex flex-row items-center'
                                        >
                                            <Database width={22} height={22} fill='currentColor' />
                                            <p>Bases de données</p>
                                        </NavLink>
                                    </Can>
                                )}

                                {backupLimit !== 0 && (
                                    <Can action={'backup.*'} matchAny>
                                        <NavLink
                                            ref={NavigationBackups}
                                            to={`/server/${id}/backups`}
                                            className='flex flex-row items-center'
                                        >
                                            <CloudArrowUpIn width={22} height={22} fill='currentColor' />
                                            <p>Sauvegardes</p>
                                        </NavLink>
                                    </Can>
                                )}

                                {(allocationLimit !== 0 || subdomainSupported) && (
                                    <Can action={'allocation.*'} matchAny>
                                        <NavLink
                                            ref={NavigationNetworking}
                                            to={`/server/${id}/network`}
                                            className='flex flex-row items-center'
                                        >
                                            <BranchesDown width={22} height={22} fill='currentColor' />
                                            <p>Réseau</p>
                                        </NavLink>
                                    </Can>
                                )}

                                <Can action={'schedule.*'} matchAny>
                                    <NavLink
                                        ref={NavigationSchedules}
                                        to={`/server/${id}/schedules`}
                                        className='flex flex-row items-center'
                                    >
                                        <ClockArrowRotateLeft width={22} height={22} fill='currentColor' />
                                        <p>Tâches planifiées</p>
                                    </NavLink>
                                </Can>

                                <Can action={'user.*'} matchAny>
                                    <NavLink
                                        ref={NavigationUsers}
                                        to={`/server/${id}/users`}
                                        className='flex flex-row items-center'
                                    >
                                        <Persons width={22} height={22} fill='currentColor' />
                                        <p>Sous-utilisateurs</p>
                                    </NavLink>
                                </Can>

                                <li className='sidebar-category'>Configuration</li>
                                <Can action={['startup.read', 'startup.update']} matchAny>
                                    <NavLink
                                        ref={NavigationStartup}
                                        to={`/server/${id}/startup`}
                                        className='flex flex-row items-center'
                                    >
                                        <Terminal width={22} height={22} fill='currentColor' />
                                        <p>Startup</p>
                                    </NavLink>
                                </Can>

                                <Can action={['settings.*', 'file.sftp']} matchAny>
                                    <NavLink
                                        ref={NavigationSettings}
                                        to={`/server/${id}/settings`}
                                        className='flex flex-row items-center'
                                    >
                                        <Gear width={22} height={22} fill='currentColor' />
                                        <p>Paramètres</p>
                                    </NavLink>
                                </Can>

                                <Can action={['activity.*']} matchAny>
                                    <NavLink
                                        ref={NavigationActivity}
                                        to={`/server/${id}/activity`}
                                        className='flex flex-row items-center'
                                    >
                                        <PencilToLine width={22} height={22} fill='currentColor' />
                                        <p>Activité</p>
                                    </NavLink>
                                </Can>

                                {rootAdmin && (
                                    <>
                                        <li className='sidebar-category sidebar-category-admin'>Administration</li>
                                        <NavLink
                                            to={`/admin/servers/view/${serverId}`}
                                            ref={NavigationApi}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='flex flex-row items-center admin-link'
                                        >
                                            <Lock width={22} height={22} fill='currentColor' />
                                            <p>Gérer l&apos;instance</p>
                                        </NavLink>
                                    </>
                                )}
                            </ul>

                            <div className='sidebar-user mt-auto'>
                                <div className='sidebar-user-avatar'>
                                    <img
                                        src={`https://www.gravatar.com/avatar/${md5(user?.email.toLowerCase() || '')}`}
                                        alt='Avatar'
                                        width={36}
                                        height={36}
                                        className='rounded-full'
                                    />
                                </div>
                                <div className='sidebar-user-info'>
                                    <span className='sidebar-user-name'>{user?.username}</span>
                                    <span className='sidebar-user-email'>{user?.email}</span>
                                </div>
                                <button className='sidebar-user-logout' onClick={onTriggerLogout} title='Log out'>
                                    <ArrowRightFromSquare width={16} height={16} />
                                </button>
                            </div>
                        </MainSidebar>

                        <MainWrapper className='w-full'>
                            <CommandMenu />
                            <InstallListener />
                            <TransferListener />
                            <WebsocketHandler />
                            <main className='relative inset-[1px] w-full h-full overflow-y-auto overflow-x-hidden rounded-md bg-[#08080875]'>
                                {inConflictState &&
                                (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                                    <ConflictStateRenderer />
                                ) : (
                                    <ErrorBoundary>
                                        <Routes location={location}>
                                            {routes.server.map(({ route, permission, component: Component }) => (
                                                <Route
                                                    key={route}
                                                    path={route}
                                                    element={
                                                        <PermissionRoute permission={permission}>
                                                            <Suspense fallback={null}>
                                                                <Component />
                                                            </Suspense>
                                                        </PermissionRoute>
                                                    }
                                                />
                                            ))}
                                            <Route path='*' element={<NotFound />} />
                                        </Routes>
                                    </ErrorBoundary>
                                )}
                            </main>
                        </MainWrapper>
                    </div>
                </>
            )}
        </Fragment>
    );
};

export default ServerRouter;
