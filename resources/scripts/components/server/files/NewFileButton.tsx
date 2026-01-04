import { FilePlus } from '@gravity-ui/icons';
import { NavLink } from 'react-router-dom';

import ActionButton from '@/components/elements/ActionButton';

interface Props {
    id: string;
}

const NewFileButton = ({ id }: Props) => {
    return (
        <NavLink to={`/server/${id}/files/new${window.location.hash}`} className='no-underline'>
            <ActionButton
                variant='secondary'
                size='md'
                className='flex items-center gap-2 group transition-all duration-200'
            >
                <FilePlus className='w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity' />
                <span>Nouveau fichier</span>
            </ActionButton>
        </NavLink>
    );
};

export default NewFileButton;
