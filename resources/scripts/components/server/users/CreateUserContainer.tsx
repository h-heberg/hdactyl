import { ChevronLeft, PersonPlus } from '@gravity-ui/icons';
import clsx from 'clsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ActionButton from '@/components/elements/ActionButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import UserFormComponent from '@/components/server/users/UserFormComponent';

import { ServerContext } from '@/state/server';

const CreateUserContainer = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);

    const handleSuccess = () => {
        navigate(`/server/${serverId}/users`);
    };

    const handleCancel = () => {
        navigate(`/server/${serverId}/users`);
    };

    return (
        <ServerContentBlock title={'Create User'}>
            {/* Header Style Network/Modern */}
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10'>
                <div className='max-w-2xl'>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='p-2 bg-brand/10 rounded-lg border border-brand/20 text-brand'>
                            <PersonPlus width={20} height={20} />
                        </div>
                        <h1 className='text-3xl font-black text-white tracking-tight'>Nouvel utilisateur</h1>
                    </div>
                    <p className='text-zinc-500 text-sm font-medium leading-relaxed'>
                        Configurez un accès personnalisé pour un nouveau membre. Vous pourrez définir ses permissions
                        précises à l&apos;étape suivante.
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    <ActionButton
                        variant='secondary'
                        onClick={() => navigate(`/server/${serverId}/users`)}
                        className='flex items-center gap-2 px-5 py-2.5 rounded-xl border-white/5 hover:bg-white/5'
                        disabled={isSubmitting}
                    >
                        <ChevronLeft width={18} height={18} fill='currentColor' />
                        <span className='font-bold text-sm'>Retour à la liste</span>
                    </ActionButton>
                </div>
            </div>

            {/* Form Container Style "Card" */}
            <div
                className={clsx(
                    'relative overflow-hidden transition-all duration-300',
                    'bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] p-6 sm:p-10',
                )}
            >
                <div className='absolute -top-24 -right-24 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none' />

                <div className='relative z-10'>
                    <UserFormComponent
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        flashKey='user:create'
                        isSubmitting={isSubmitting}
                        setIsSubmitting={setIsSubmitting}
                    />
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default CreateUserContainer;
