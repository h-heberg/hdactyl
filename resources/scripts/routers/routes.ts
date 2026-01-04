import type { ComponentType } from 'react';
import { lazy } from 'react';

import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import ActivityLogContainer from '@/components/dashboard/activity/ActivityLogContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import ServerActivityLogContainer from '@/components/server/ServerActivityLogContainer';
import BackupContainer from '@/components/server/backups/BackupContainer';
import ServerConsoleContainer from '@/components/server/console/ServerConsoleContainer';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import ModrinthContainer from '@/components/server/modrinth/ModrinthContainer';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import StartupContainer from '@/components/server/startup/StartupContainer';
import CreateUserContainer from '@/components/server/users/CreateUserContainer';
import EditUserContainer from '@/components/server/users/EditUserContainer';
import UsersContainer from '@/components/server/users/UsersContainer';

// Each of the router files is already code split out appropriately — so
// all the items above will only be loaded in when that router is loaded.
//
// These specific lazy loaded routes are to avoid loading in heavy screens
// for the server dashboard when they're only needed for specific instances.
const FileEditContainer = lazy(() => import('@/components/server/files/FileEditContainer'));
const ScheduleEditContainer = lazy(() => import('@/components/server/schedules/ScheduleEditContainer'));

interface RouteDefinition {
    /**
     * Route is the path that will be matched against, this field supports wildcards.
     */
    route: string;
    /**
     * Path is the path that will be used for any navbars or links, do not use wildcards or fancy
     * matchers here. If this field is left undefined, this route will not have a navigation element,
     */
    path?: string;
    // If undefined is passed this route is still rendered into the router itself
    // but no navigation link is displayed in the sub-navigation menu.
    name: string | undefined;
    component: ComponentType;
    end?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
    permission?: string | string[];
}

interface Routes {
    // All the routes available under "/account"
    account: RouteDefinition[];
    // All the routes available under "/server/:id"
    server: ServerRouteDefinition[];
}

export default {
    account: [
        {
            route: '',
            path: '',
            name: 'Compte',
            component: AccountOverviewContainer,
            end: true,
        },
        {
            route: 'api',
            path: 'api',
            name: 'Identifiants API',
            component: AccountApiContainer,
        },
        {
            route: 'ssh',
            path: 'ssh',
            name: 'Clés SSH',
            component: AccountSSHContainer,
        },
        {
            route: 'activity',
            path: 'activity',
            name: 'Activité',
            component: ActivityLogContainer,
        },
    ],
    server: [
        {
            route: '',
            path: '',
            permission: null,
            name: 'Console',
            component: ServerConsoleContainer,
            end: true,
        },
        {
            route: 'files/*',
            path: 'files',
            permission: 'file.*',
            name: 'Fichiers',
            component: FileManagerContainer,
        },
        {
            route: 'files/:action/*',
            permission: 'file.*',
            name: undefined,
            component: FileEditContainer,
        },
        {
            route: 'databases/*',
            path: 'databases',
            permission: 'database.*',
            name: 'Bases de données',
            component: DatabasesContainer,
        },
        {
            route: 'schedules/*',
            path: 'schedules',
            permission: 'schedule.*',
            name: 'Tâches planifiées',
            component: ScheduleContainer,
        },
        {
            route: 'schedules/:id/*',
            permission: 'schedule.*',
            name: undefined,
            component: ScheduleEditContainer,
        },
        {
            route: 'users/*',
            path: 'users',
            permission: 'user.*',
            name: 'Utilisateurs',
            component: UsersContainer,
        },
        {
            route: 'users/new',
            permission: 'user.*',
            name: undefined,
            component: CreateUserContainer,
        },
        {
            route: 'users/:id/edit',
            permission: 'user.*',
            name: undefined,
            component: EditUserContainer,
        },
        {
            route: 'backups/*',
            path: 'backups',
            permission: 'backup.*',
            name: 'Sauvegardes',
            component: BackupContainer,
        },
        {
            route: 'network/*',
            path: 'network',
            permission: 'allocation.*',
            name: 'Réseau',
            component: NetworkContainer,
        },
        {
            route: 'startup/*',
            path: 'startup',
            permission: ['startup.read', 'startup.update', 'startup.docker-image'],
            name: 'Démarrage',
            component: StartupContainer,
        },
        {
            route: 'settings/*',
            path: 'settings',
            permission: ['settings.*', 'file.sftp'],
            name: 'Paramètres',
            component: SettingsContainer,
        },
        {
            route: 'mods/*',
            path: 'mods',
            permission: ['modrinth.download', 'settings.modrinth'],
            name: 'Modrinth',
            component: ModrinthContainer,
        },
        {
            route: 'activity/*',
            path: 'activity',
            permission: 'activity.*',
            name: 'Activité',
            component: ServerActivityLogContainer,
        },
    ],
} as Routes;
