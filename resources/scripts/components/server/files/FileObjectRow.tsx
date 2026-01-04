import { encodePathSegments } from '@/helpers';
import { File, FolderOpenFill } from '@gravity-ui/icons';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { join } from 'pathe';
import { ReactNode, memo } from 'react';
import isEqual from 'react-fast-compare';
import { NavLink } from 'react-router-dom';

import { ContextMenu, ContextMenuTrigger } from '@/components/elements/ContextMenu';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';

import { bytesToString } from '@/lib/formatters';

import { FileObject } from '@/api/server/files/loadDirectory';

import { ServerContext } from '@/state/server';

import { usePermissions } from '@/plugins/usePermissions';

import FileDropdownMenu from './FileDropdownMenu';

// On suppose que styles.details et styles.file_row sont remplacés par Tailwind ici pour plus de clarté
// ou gardez vos classes CSS si vous préférez.

function Clickable({ file, children }: { file: FileObject; children: ReactNode }) {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const isRestricted = (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead);

    const baseClasses = 'flex items-center flex-1 min-w-0 py-2.5 px-3 rounded-lg transition-colors';

    return isRestricted ? (
        <div className={`${baseClasses} cursor-default`}>{children}</div>
    ) : (
        <NavLink
            className={`${baseClasses} hover:bg-zinc-800/50 group-hover:text-indigo-400`}
            to={`/server/${id}/files${file.isFile ? '/edit' : '#'}${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}

const MemoizedClickable = memo(Clickable, isEqual);

const FileObjectRow = ({ file }: { file: FileObject }) => (
    <ContextMenu>
        <ContextMenuTrigger asChild>
            <div
                className='group flex items-center gap-2 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-all duration-200 last:border-0'
                key={file.name}
            >
                <div className='pl-4'>
                    <SelectFileCheckbox name={file.name} />
                </div>

                <MemoizedClickable file={file}>
                    <div
                        className={`flex-none mr-3 transition-transform ${file.isFile ? 'text-zinc-500' : 'text-indigo-400'}`}
                    >
                        {file.isFile ? <File width={20} height={20} /> : <FolderOpenFill width={20} height={20} />}
                    </div>

                    <div className='flex-1 truncate font-medium text-sm text-zinc-200 group-hover:text-white'>
                        {file.name}
                    </div>

                    {file.isFile && (
                        <div className='w-24 text-right shrink-0 hidden sm:block text-xs font-mono text-zinc-500'>
                            {bytesToString(file.size)}
                        </div>
                    )}

                    <div
                        className='w-40 text-right shrink-0 hidden md:block text-xs text-zinc-500 italic'
                        title={file.modifiedAt.toString()}
                    >
                        {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                            ? format(file.modifiedAt, 'MMM d, yyyy')
                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                    </div>
                </MemoizedClickable>

                <div className='opacity-0 group-hover:opacity-100 transition-opacity pr-4'>
                    <FileDropdownMenu file={file} />
                </div>
            </div>
        </ContextMenuTrigger>
    </ContextMenu>
);

export default memo(FileObjectRow, (prevProps, nextProps) => {
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    return isEqual(prevFile, nextFile);
});
