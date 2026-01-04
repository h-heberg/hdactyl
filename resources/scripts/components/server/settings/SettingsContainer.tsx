import { useStoreState } from 'easy-peasy';
import isEqual from 'react-fast-compare';
import { LuExternalLink, LuShieldAlert } from 'react-icons/lu';

// Icônes pour l'UI

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Label from '@/components/elements/Label';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';

import { ip } from '@/lib/formatters';

import { ServerContext } from '@/state/server';

import RenameServerBox from './RenameServerBox';

const SettingsContainer = () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Paramètres du serveur'}>
            <FlashMessageRender byKey={'settings'} />

            <MainPageHeader title={'Gestion du serveur'}>
                <p className='text-sm text-neutral-400 max-w-2xl'>
                    Gérez les paramètres avancés de votre instance. Modifiez l&apos;identité du serveur, accédez aux
                    protocoles de transfert de fichiers ou réinitialisez votre environnement.
                </p>
            </MainPageHeader>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
                <div className='lg:col-span-2 space-y-6'>
                    <Can action={'settings.rename'}>
                        <div className='bg-neutral-900/50 border border-neutral-800 rounded-xl p-1'>
                            <RenameServerBox />
                        </div>
                    </Can>

                    <Can action={'file.sftp'}>
                        <TitledGreyBox title={'Accès SFTP'}>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='bg-black/20 p-3 rounded-lg border border-white/5'>
                                        <Label className='text-xs uppercase tracking-wider text-neutral-500'>
                                            Hostname / IP
                                        </Label>
                                        <CopyOnClick text={`${ip(sftp.ip)}`}>
                                            <p className='font-mono text-sm text-neutral-200 mt-1 truncate'>
                                                {ip(sftp.ip)}
                                            </p>
                                        </CopyOnClick>
                                        <p className='text-[10px] text-neutral-600 mt-1'>Port: {sftp.port}</p>
                                    </div>

                                    <div className='bg-black/20 p-3 rounded-lg border border-white/5'>
                                        <Label className='text-xs uppercase tracking-wider text-neutral-500'>
                                            Username
                                        </Label>
                                        <CopyOnClick text={`${username}.${id}`}>
                                            <p className='font-mono text-sm text-neutral-200 mt-1 truncate'>{`${username}.${id}`}</p>
                                        </CopyOnClick>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row items-center gap-4 bg-brand/5 border border-brand/10 p-4 rounded-xl'>
                                    <div className='flex-1 text-xs text-neutral-400 leading-relaxed'>
                                        <span className='text-brand font-medium'>Tip:</span> Your SFTP password is the
                                        same as your panel password. Use a client like FileZilla or WinSCP.
                                    </div>
                                    <a
                                        href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}
                                        className='w-full sm:w-auto'
                                    >
                                        <ActionButton
                                            variant='secondary'
                                            className='w-full flex items-center justify-center gap-2'
                                        >
                                            <LuExternalLink className='w-3 h-3' /> Launch Client
                                        </ActionButton>
                                    </a>
                                </div>
                            </div>
                        </TitledGreyBox>
                    </Can>
                </div>

                <div className='space-y-6'>
                    {/* Debug Info */}
                    <TitledGreyBox title={'Informations Système'}>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center py-2 border-b border-white/5'>
                                <span className='text-sm text-neutral-500'>Node</span>
                                <span className='text-sm font-mono text-neutral-300'>{node}</span>
                            </div>
                            <div className='py-2'>
                                <span className='text-sm text-neutral-500 block mb-2'>Server UUID</span>
                                <CopyOnClick text={uuid}>
                                    <code className='block w-full text-[10px] font-mono bg-black/40 p-2 rounded border border-white/5 text-neutral-400 break-all overflow-hidden italic'>
                                        {uuid}
                                    </code>
                                </CopyOnClick>
                            </div>
                        </div>
                    </TitledGreyBox>

                    {/* Danger Zone */}
                    <Can action={'settings.reinstall'}>
                        <div className='rounded-xl border border-red-900/30 bg-red-950/10 overflow-hidden'>
                            <div className='p-4 border-b border-red-900/20 bg-red-900/5 flex items-center gap-2'>
                                <LuShieldAlert className='w-4 h-4 text-red-500' />
                                <span className='text-sm font-semibold text-red-500 uppercase tracking-tight'>
                                    Danger Zone
                                </span>
                            </div>
                            <div className='p-4'>
                                <p className='text-xs text-neutral-500 mb-4'>
                                    La réinstallation supprimera certains fichiers et réinitialisera les scripts de
                                    démarrage.
                                </p>
                                <ReinstallServerBox />
                            </div>
                        </div>
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default SettingsContainer;
