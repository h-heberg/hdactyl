import { Actions, useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { LuLoader, LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

// Icônes pour le feedback

import ActionButton from '@/components/elements/ActionButton';
import { Dialog } from '@/components/elements/dialog';

import { httpErrorToHuman } from '@/api/http';
import reinstallServer from '@/api/server/reinstallServer';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

const ReinstallServerBox = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        setLoading(true);
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Le processus de réinstallation a commencé.',
                });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .finally(() => {
                setLoading(false);
                setModalVisible(false);
            });
    };

    useEffect(() => {
        return () => clearFlashes('settings');
    }, []);

    return (
        <div className='relative'>
            <Dialog.Confirm
                open={modalVisible}
                title={'Réinstaller le serveur ?'}
                confirm={'Oui, réinstaller'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
                loading={loading}
            >
                <div className='flex items-start gap-4'>
                    <div className='p-2 bg-red-500/10 rounded-full shrink-0'>
                        <LuTriangleAlert className='w-6 h-6 text-red-500' />
                    </div>
                    <div>
                        Votre serveur sera arrêté et certains fichiers pourront être écrasés. Cette action est
                        irréversible. Voulez-vous vraiment continuer ?
                    </div>
                </div>
            </Dialog.Confirm>

            <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                    <div className='mt-0.5 p-1.5 bg-amber-500/10 rounded-md shrink-0'>
                        <LuTriangleAlert className='w-4 h-4 text-amber-500' />
                    </div>
                    <p className='text-xs text-neutral-400 leading-relaxed'>
                        La réinstallation exécute à nouveau le script d&apos;installation initial.
                        <span className='block mt-1 text-neutral-300 font-medium'>
                            Pensez à sauvegarder vos données importantes avant de lancer l&apos;opération.
                        </span>
                    </p>
                </div>

                <ActionButton
                    variant='danger'
                    onClick={() => setModalVisible(true)}
                    className='w-full group flex items-center justify-center gap-2 py-3 bg-red-600/10 border-red-500/20 hover:bg-red-600/20 hover:border-red-500/40 text-red-500 transition-all'
                >
                    {loading ? (
                        <LuLoader className='w-4 h-4 animate-spin' />
                    ) : (
                        <LuRefreshCw className='w-4 h-4 group-hover:rotate-180 transition-transform duration-500' />
                    )}
                    <span>Réinstaller le serveur</span>
                </ActionButton>
            </div>
        </div>
    );
};

export default ReinstallServerBox;
