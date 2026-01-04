import ModalContext from '@/context/ModalContext';
import { useContext } from 'react';

import FlashMessageRender from '@/components/FlashMessageRender';
import CopyOnClick from '@/components/elements/CopyOnClick';

import asModal from '@/hoc/asModal';

import ActionButton from '../elements/ActionButton';

interface Props {
    apiKey: string;
}

const ApiKeyModal = ({ apiKey }: Props) => {
    const { dismiss } = useContext(ModalContext);

    return (
        <div className='p-6 space-y-6 max-w-lg mx-auto rounded-lg shadow-lg'>
            {/* Flash message section */}
            <FlashMessageRender byKey='account' />

            {/* Modal Header */}
            <p className='text-sm text-white-600 mt-2'>
                La clé API que vous avez demandée est affichée ci-dessous. Veuillez la conserver en lieu sûr, car elle
                ne sera plus affichée par la suite.
            </p>

            {/* API Key Display Section */}
            <div className='relative mt-6'>
                <pre className='bg-background text-white p-4 rounded-lg font-mono overflow-x-auto border border-white/10'>
                    <CopyOnClick text={apiKey}>
                        <code className='text-sm break-words'>{apiKey}</code>
                    </CopyOnClick>

                    {/* Copy button with icon */}
                    <div className='absolute top-2 right-2'></div>
                </pre>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end space-x-4'>
                <ActionButton type='button' onClick={() => dismiss()} variant='primary' className='flex items-center'>
                    Fermer
                </ActionButton>
            </div>
        </div>
    );
};

ApiKeyModal.displayName = 'ApiKeyModal';

export default asModal<Props>({
    title: 'Votre clé API',
    closeOnEscape: true, // Allows closing the modal by pressing Escape
    closeOnBackground: true, // Allows closing by clicking outside the modal
})(ApiKeyModal);
