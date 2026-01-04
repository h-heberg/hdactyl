import { useCallback } from 'react';

import { Checkbox } from '@/components/elements/CheckboxNew';

import { ServerContext } from '@/state/server';

const SelectFileCheckbox = ({ name }: { name: string }) => {
    // Utilisation d'un sélecteur mémoïsé pour la performance
    const isChecked = ServerContext.useStoreState((state) => state.files.selectedFiles.includes(name));

    const appendSelectedFile = ServerContext.useStoreActions((actions) => actions.files.appendSelectedFile);
    const removeSelectedFile = ServerContext.useStoreActions((actions) => actions.files.removeSelectedFile);

    // Handler stable pour éviter les re-renders inutiles
    const handleChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                appendSelectedFile(name);
            } else {
                removeSelectedFile(name);
            }
        },
        [name, appendSelectedFile, removeSelectedFile],
    );

    return (
        <Checkbox
            className='ml-4'
            checked={isChecked}
            onCheckedChange={handleChange}
            // Empêche le clic sur la checkbox de déclencher l'ouverture du fichier dans la ligne parent
            onClick={(e) => e.stopPropagation()}
        />
    );
};

export default SelectFileCheckbox;
