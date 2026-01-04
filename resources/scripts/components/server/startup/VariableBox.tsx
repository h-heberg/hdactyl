import { ChevronDown, ChevronUp, Lock } from '@gravity-ui/icons';
import clsx from 'clsx';
import debounce from 'debounce';
import { memo, useState } from 'react';
import isEqual from 'react-fast-compare';

import FlashMessageRender from '@/components/FlashMessageRender';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/elements/DropdownMenu';
import InputSpinner from '@/components/elements/InputSpinner';
import { Switch } from '@/components/elements/SwitchV2';
import { Input } from '@/components/elements/TextInput';

import { ServerEggVariable } from '@/api/server/types';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import getServerStartup from '@/api/swr/getServerStartup';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';
import { usePermissions } from '@/plugins/usePermissions';

interface Props {
    variable: ServerEggVariable;
}

const VariableBox = ({ variable }: Props) => {
    const FLASH_KEY = `server:startup:${variable.envVariable}`;
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(false);
    const [canEdit] = usePermissions(['startup.update']);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getServerStartup(uuid);
    const [dropDownOpen, setDropDownOpen] = useState(false);

    const setVariableValue = debounce((value: string) => {
        setLoading(true);
        clearFlashes(FLASH_KEY);

        updateStartupVariable(uuid, variable.envVariable, value)
            .then(([response, invocation]) =>
                mutate(
                    (data) => ({
                        ...data!,
                        invocation,
                        variables: (data!.variables || []).map((v) =>
                            v.envVariable === response.envVariable ? response : v,
                        ),
                    }),
                    false,
                ),
            )
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ key: FLASH_KEY, error });
            })
            .then(() => setLoading(false));
    }, 500);

    const useSwitch = variable.rules.some(
        (v) => v === 'boolean' || v === 'in:0,1' || v === 'in:1,0' || v === 'in:true,false' || v === 'in:false,true',
    );
    const isStringSwitch = variable.rules.some((v) => v === 'string');
    const selectValues = variable.rules.find((v) => v.startsWith('in:'))?.split(',') || [];

    return (
        <div
            className={clsx(
                'flex flex-col justify-between gap-5 transition-all duration-300',
                'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/10 shadow-lg',
                'p-5 sm:p-6 rounded-[24px] relative overflow-hidden group',
            )}
        >
            {/* Dégradé d'accentuation interne */}
            <div className='absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none' />

            <FlashMessageRender byKey={FLASH_KEY} />

            <div className='relative z-10 space-y-4'>
                <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2 min-w-0'>
                            {!variable.isEditable && (
                                <div className='p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500'>
                                    <Lock width={14} height={14} />
                                </div>
                            )}
                            <span className='text-sm font-black uppercase tracking-wider text-zinc-100 truncate'>
                                {variable.name}
                            </span>
                        </div>
                        <div className='px-2 py-0.5 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase'>
                            {variable.envVariable}
                        </div>
                    </div>

                    <p className='text-xs leading-relaxed text-zinc-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity'>
                        {variable.description}
                    </p>
                </div>

                <div className='relative pt-2'>
                    <InputSpinner visible={loading}>
                        {useSwitch ? (
                            <div className='flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl'>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] uppercase font-black text-zinc-500 tracking-tighter mb-1'>
                                        Status
                                    </span>
                                    <span
                                        className={clsx(
                                            'text-sm font-mono font-bold',
                                            (
                                                isStringSwitch
                                                    ? variable.serverValue === 'true'
                                                    : variable.serverValue === '1'
                                            )
                                                ? 'text-emerald-400'
                                                : 'text-zinc-400',
                                        )}
                                    >
                                        {isStringSwitch
                                            ? variable.serverValue === 'true'
                                                ? 'ENABLED'
                                                : 'DISABLED'
                                            : variable.serverValue === '1'
                                              ? 'ACTIVE'
                                              : 'INACTIVE'}
                                    </span>
                                </div>
                                <Switch
                                    disabled={!canEdit || !variable.isEditable}
                                    name={variable.envVariable}
                                    defaultChecked={
                                        isStringSwitch ? variable.serverValue === 'true' : variable.serverValue === '1'
                                    }
                                    onCheckedChange={() => {
                                        if (canEdit && variable.isEditable) {
                                            const newVal = isStringSwitch
                                                ? variable.serverValue === 'true'
                                                    ? 'false'
                                                    : 'true'
                                                : variable.serverValue === '1'
                                                  ? '0'
                                                  : '1';
                                            setVariableValue(newVal);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className='relative group/input'>
                                {selectValues.length > 0 && (variable.serverValue ?? variable.defaultValue) ? (
                                    <DropdownMenu onOpenChange={(open) => setDropDownOpen(open)}>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className='w-full flex items-center justify-between gap-3 h-12 px-4 text-sm font-bold text-zinc-200 transition-all bg-black/20 border border-white/5 rounded-xl hover:bg-black/40 hover:border-white/20 disabled:opacity-30'
                                                disabled={!canEdit || !variable.isEditable}
                                            >
                                                <span className='font-mono truncate'>{variable.serverValue}</span>
                                                <div className='text-zinc-500 transition-transform duration-200'>
                                                    {dropDownOpen ? (
                                                        <ChevronUp width={18} height={18} />
                                                    ) : (
                                                        <ChevronDown width={18} height={18} />
                                                    )}
                                                </div>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='z-[9999]' sideOffset={8}>
                                            <DropdownMenuRadioGroup
                                                value={variable.serverValue ?? ''}
                                                onValueChange={setVariableValue}
                                            >
                                                {selectValues.map((val) => {
                                                    const cleanVal = val.replace('in:', '');
                                                    return (
                                                        <DropdownMenuRadioItem
                                                            key={cleanVal}
                                                            value={cleanVal}
                                                            className='font-mono text-xs'
                                                        >
                                                            {cleanVal}
                                                        </DropdownMenuRadioItem>
                                                    );
                                                })}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Input
                                        className='w-full h-12 !bg-black/20 !border-white/5 focus:!border-white/20 !rounded-xl font-mono text-sm'
                                        onKeyUp={(e) =>
                                            canEdit && variable.isEditable && setVariableValue(e.currentTarget.value)
                                        }
                                        readOnly={!canEdit || !variable.isEditable}
                                        name={variable.envVariable}
                                        defaultValue={variable.serverValue ?? ''}
                                        placeholder={variable.defaultValue || 'Enter value...'}
                                        disabled={!canEdit || !variable.isEditable}
                                    />
                                )}
                            </div>
                        )}
                    </InputSpinner>
                </div>
            </div>
        </div>
    );
};

export default memo(VariableBox, isEqual);
