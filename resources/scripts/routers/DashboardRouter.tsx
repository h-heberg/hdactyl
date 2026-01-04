import { ArrowRightFromSquare, Gear, House, Key, Lock, Server, Terminal } from '@gravity-ui/icons';
import md5 from 'blueimp-md5';
import { State, useStoreState } from 'easy-peasy';
import { Fragment, Suspense, useRef, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

import routes from '@/routers/routes';

import DashboardContainer from '@/components/dashboard/DashboardContainer';
import Logo from '@/components/elements/HLogo';
import MainSidebar from '@/components/elements/MainSidebar';
import MainWrapper from '@/components/elements/MainWrapper';
import { DashboardMobileMenu } from '@/components/elements/MobileFullScreenMenu';
import MobileTopBar from '@/components/elements/MobileTopBar';
import { NotFound } from '@/components/elements/ScreenBlock';

import http from '@/api/http';

import { ApplicationStore } from '@/state';

const DashboardRouter = () => {
    const user = useStoreState((state: State<ApplicationStore>) => state.user.data);

    // Mobile menu state
    const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuVisible(!isMobileMenuVisible);
    };

    const closeMobileMenu = () => {
        setMobileMenuVisible(false);
    };

    const onTriggerLogout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const onSelectAdminPanel = () => {
        window.open(`/admin`);
    };

    // Define refs for navigation buttons.
    const NavigationHome = useRef(null);
    const NavigationSettings = useRef(null);
    const NavigationApi = useRef(null);
    const NavigationSSH = useRef(null);

    return (
        <Fragment key={'dashboard-router'}>
            {/* Mobile Top Bar */}
            <MobileTopBar
                onMenuToggle={toggleMobileMenu}
                onTriggerLogout={onTriggerLogout}
                onSelectAdminPanel={onSelectAdminPanel}
                rootAdmin={user?.rootAdmin}
            />

            {/* Mobile Full Screen Menu */}
            <DashboardMobileMenu isVisible={isMobileMenuVisible} onClose={closeMobileMenu} />

            <div className='flex flex-row w-full'>
                {/* Desktop Sidebar */}
                <MainSidebar className='hidden lg:flex lg:relative lg:shrink-0'>
                    <div className='relative flex flex-row items-center justify-center h-8'>
                        <NavLink to={'/'} className='flex shrink-0 h-12 w-fit items-center'>
                            <Logo className='h-12' />
                        </NavLink>
                    </div>
                    <div aria-hidden className='mt-8 mb-4 bg-[#ffffff33] min-h-[1px] w-full'></div>
                    <ul data-hh-subnav-routes-wrapper='' className='hh-subnav-routes-wrapper'>
                        <li className='sidebar-category'>Général</li>

                        <NavLink to='/' end className='flex flex-row items-center' ref={NavigationHome}>
                            <House width={22} height={22} fill='currentColor' />
                            <p>Serveurs</p>
                        </NavLink>
                        <li className='sidebar-category'>Accès</li>

                        <NavLink to='/account/api' end className='flex flex-row items-center' ref={NavigationApi}>
                            <Key width={22} height={22} fill='currentColor' />
                            <p>Clés API</p>
                        </NavLink>

                        <NavLink to='/account/ssh' end className='flex flex-row items-center' ref={NavigationSSH}>
                            <Terminal width={22} height={22} fill='currentColor' />
                            <p>Clés SSH</p>
                        </NavLink>

                        <NavLink to='/account' end className='flex flex-row items-center' ref={NavigationSettings}>
                            <Gear width={22} height={22} fill='currentColor' />
                            <p>Paramètres</p>
                        </NavLink>
                        {user?.rootAdmin && (
                            <>
                                <li className='sidebar-category sidebar-category-admin'>Administration</li>

                                <NavLink
                                    to='/admin'
                                    ref={NavigationApi}
                                    end
                                    target='_blank'
                                    rel='noreferrer'
                                    className='flex flex-row items-center admin-link'
                                >
                                    <Lock width={22} height={22} fill='currentColor' />
                                    <p>Admin Panel</p>
                                </NavLink>
                            </>
                        )}
                    </ul>

                    <div className='sidebar-user'>
                        <div className='sidebar-user-avatar'>
                            <img
                                src={`https://www.gravatar.com/avatar/${md5(user?.email.toLowerCase())}`}
                                alt='User Avatar'
                                width={40}
                                height={40}
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

                <Suspense fallback={null}>
                    <MainWrapper className='w-full'>
                        <main className='relative w-full h-full overflow-y-auto overflow-x-hidden rounded-md bg-background'>
                            <Routes>
                                <Route path='' element={<DashboardContainer />} />

                                {routes.account.map(({ route, component: Component }) => (
                                    <Route
                                        key={route}
                                        path={`/account/${route}`.replace('//', '/')}
                                        element={<Component />}
                                    />
                                ))}

                                <Route path='*' element={<NotFound />} />
                            </Routes>
                        </main>
                    </MainWrapper>
                </Suspense>
            </div>
        </Fragment>
    );
};

export default DashboardRouter;
