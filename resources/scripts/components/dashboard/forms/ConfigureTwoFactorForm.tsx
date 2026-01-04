import { useStoreState } from 'easy-peasy';
import { useEffect, useState } from 'react';

import DisableTOTPDialog from '@/components/dashboard/forms/DisableTOTPDialog';
import RecoveryTokensDialog from '@/components/dashboard/forms/RecoveryTokensDialog';
import SetupTOTPDialog from '@/components/dashboard/forms/SetupTOTPDialog';
import ActionButton from '@/components/elements/ActionButton';

import { ApplicationStore } from '@/state';

import useFlash from '@/plugins/useFlash';

const ConfigureTwoFactorForm = () => {
    const [tokens, setTokens] = useState<string[]>([]);
    const [visible, setVisible] = useState<'enable' | 'disable' | null>(null);
    const isEnabled = useStoreState((state: ApplicationStore) => state.user.data!.useTotp);
    const { clearFlashes } = useFlash();

    useEffect(() => {
        return () => {
            clearFlashes('account:two-step');
        };
    }, [visible]);

    const onTokens = (tokens: string[]) => {
        setTokens(tokens);
        setVisible(null);
    };

    return (
        <div className='contents'>
            <SetupTOTPDialog open={visible === 'enable'} onClose={() => setVisible(null)} onTokens={onTokens} />
            <RecoveryTokensDialog tokens={tokens} open={tokens.length > 0} onClose={() => setTokens([])} />
            <DisableTOTPDialog open={visible === 'disable'} onClose={() => setVisible(null)} />
            <p className={`text-sm`}>
                {isEnabled
                    ? "Votre compte est protégé par une application d'authentification."
                    : "Vous n'avez pas configuré d'application d'authentification."}
            </p>
            <div className={`mt-6`}>
                {isEnabled ? (
                    <ActionButton variant='danger' onClick={() => setVisible('disable')}>
                        Retirer l&apos;authentificateur
                    </ActionButton>
                ) : (
                    <ActionButton variant='primary' onClick={() => setVisible('enable')}>
                        Configurer l&apos;authentificateur
                    </ActionButton>
                )}
            </div>
        </div>
    );
};

export default ConfigureTwoFactorForm;
