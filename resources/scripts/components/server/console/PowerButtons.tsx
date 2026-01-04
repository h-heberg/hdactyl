import { ArrowRotateRight, PlayFill, Skull, StopFill } from '@gravity-ui/icons';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import Can from '@/components/elements/Can';
import { Dialog } from '@/components/elements/dialog';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';

import { ServerContext } from '@/state/server';

interface PowerButtonProps {
    className?: string;
}

const PowerButtons = ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';

    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            if (action === 'start') {
                toast.success('Votre serveur démarre !');
            } else if (action === 'restart') {
                toast.success('Votre serveur redémarre.');
            } else if (action === 'stop') {
                toast.success("Votre serveur est en cours d'arrêt.");
            } else if (action === 'kill-confirmed') {
                toast.error('Processus du serveur arrêté.');
            }
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    if (!status) return null;

    const baseBtnClass =
        'flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group';

    return (
        <div
            className={`flex items-center bg-[#09090b] p-1.5 rounded-xl border border-white/10 shadow-inner ${className}`}
        >
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={"Forcer l'arrêt du processus"}
                confirm={'Continuer'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcer l&apos;arrêt du processus du serveur peut entraîner une perte de données ou une corruption des
                fichiers. Êtes-vous sûr de vouloir continuer ?
            </Dialog.Confirm>

            <Can action={'control.start'}>
                <button
                    className={`${baseBtnClass} cursor-pointer rounded-l-lg ${status === 'offline' ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    <PlayFill width={12} height={12} />
                    Démarrer
                </button>
            </Can>

            <Can action={'control.restart'}>
                <button
                    className={`${baseBtnClass} cursor-pointer border-x border-white/5 ${status !== 'offline' ? 'text-zinc-300 hover:text-white hover:bg-white/5' : 'text-zinc-500'}`}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    <ArrowRotateRight width={12} height={12} />
                    Redémarrer
                </button>
            </Can>

            <Can action={'control.stop'}>
                <button
                    className={`${baseBtnClass} cursor-pointer rounded-r-lg ${
                        killable
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/40'
                            : status !== 'offline'
                              ? 'bg-orange-600/10 text-orange-400 hover:bg-orange-600/20 border border-orange-500/20'
                              : 'text-zinc-500'
                    }`}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? <Skull width={12} height={12} /> : <StopFill width={12} height={12} />}
                    {killable ? 'Tuer' : 'Arrêter'}
                </button>
            </Can>
        </div>
    );
};

export default PowerButtons;
