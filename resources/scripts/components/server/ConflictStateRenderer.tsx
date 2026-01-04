import { DiamondExclamationFill } from '@gravity-ui/icons';

import ScreenBlock from '@/components/elements/ScreenBlock';

import { ServerContext } from '@/state/server';

import Spinner from '../elements/Spinner';

const ConflictStateRenderer = () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false,
    );

    return status === 'installing' ? (
        <div className={'flex flex-col items-center justify-center h-full'}>
            <Spinner size={'large'} />
            <div className='flex flex-col mt-4 text-center'>
                <label className='text-neutral-100 text-lg font-bold'>
                    Votre serveur est en cours d&apos;installation
                </label>
                <label className='text-neutral-500 text-md font-semibold mt-1'>
                    Cela peut prendre quelques minutes, merci de votre patience.
                </label>
            </div>
        </div>
    ) : status === 'install_failed' ? (
        <div className={'flex flex-col items-center justify-center h-full'}>
            <DiamondExclamationFill width={32} height={32} />
            <div className='flex flex-col mt-4 text-center'>
                <label className='text-neutral-100 text-lg font-bold'>
                    L&apos;installation de votre serveur a échoué
                </label>
                <label className='text-neutral-500 text-md font-semibold mt-1'>
                    Veuillez contacter le support pour obtenir de l&apos;aide.
                </label>
            </div>
        </div>
    ) : status === 'reinstall_failed' ? (
        <div className={'flex flex-col items-center justify-center h-full'}>
            <DiamondExclamationFill width={32} height={32} />
            <div className='flex flex-col mt-4 text-center'>
                <label className='text-neutral-100 text-lg font-bold'>
                    La réinstallation de votre serveur a échoué
                </label>
                <label className='text-neutral-500 text-md font-semibold mt-1'>
                    Veuillez contacter le support pour obtenir de l&apos;aide.
                </label>
            </div>
        </div>
    ) : status === 'suspended' ? (
        <ScreenBlock title={'Serveur suspendu'} message={'Ce serveur est suspendu et ne peut pas être accédé.'} />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock title={'Node en maintenance'} message={'La node de ce serveur est actuellement en maintenance.'} />
    ) : (
        <ScreenBlock
            title={isTransferring ? 'Transfert en cours' : 'Restauration depuis une sauvegarde'}
            message={
                isTransferring
                    ? 'Votre serveur est en cours de transfert vers un nouveau nœud, veuillez revenir plus tard.'
                    : 'Votre serveur est en cours de restauration depuis une sauvegarde, veuillez revenir dans quelques minutes.'
            }
        />
    );
};

export default ConflictStateRenderer;
