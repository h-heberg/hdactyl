import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ITerminalOptions, Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import debounce from 'debounce';
import { useEffect, useMemo, useRef, useState } from 'react';

import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { SocketEvent, SocketRequest } from '@/components/server/events';

import { ServerContext } from '@/state/server';

import useEventListener from '@/plugins/useEventListener';
import { usePermissions } from '@/plugins/usePermissions';
import { usePersistedState } from '@/plugins/usePersistedState';

const theme = {
    background: '#09090b',
    cursor: 'transparent',
    black: '#000000',
    red: '#ef4444',
    green: '#22c55e',
    yellow: '#f59e0b',
    blue: '#3b82f6',
    magenta: '#d946ef',
    cyan: '#06b6d4',
    white: '#fafafa',
    brightBlack: '#3f3f46',
    brightRed: '#f87171',
    brightGreen: '#4ade80',
    brightYellow: '#fbbf24',
    brightBlue: '#60a5fa',
    brightMagenta: '#e879f9',
    brightCyan: '#22d3ee',
    brightWhite: '#ffffff',
    selection: 'rgba(59, 130, 246, 0.3)',
};

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: window.innerWidth < 640 ? 11 : 12,
    fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    theme: theme,
    lineHeight: 1.2,
};

const Console = () => {
    const TERMINAL_PRELUDE = '\u001b[1m\u001b[38;5;39mcontainer@h-heberg~ \u001b[0m';
    const ref = useRef<HTMLDivElement>(null);
    const terminal = useMemo(
        () =>
            new Terminal({
                ...terminalProps,
                rows: window.innerWidth < 640 ? 20 : 25,
            }),
        [],
    );

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const handleConsoleOutput = (line: string, prelude = false) =>
        terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');

    const handleTransferStatus = (status: string) => {
        if (status === 'failure') {
            terminal.writeln(TERMINAL_PRELUDE + '\u001b[1m\u001b[31mTransfer has failed.\u001b[0m');
        }
    };

    const handleDaemonErrorOutput = (line: string) =>
        terminal.writeln(
            TERMINAL_PRELUDE + '\u001b[1m\u001b[41m ' + line.replace(/(?:\r\n|\r|\n)$/im, '') + ' \u001b[0m',
        );

    const handlePowerChangeEvent = (state: string) =>
        terminal.writeln(TERMINAL_PRELUDE + '\u001b[1m\u001b[32mServer marked as ' + state + '...\u001b[0m');

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }

        const command = e.currentTarget.value;
        if (e.key === 'Enter' && command.length > 0) {
            setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
            setHistoryIndex(-1);
            if (instance) instance.send('send command', command);
            e.currentTarget.value = '';
        }
    };

    useEffect(() => {
        if (connected && ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(webLinksAddon);
            terminal.open(ref.current);
            fitAddon.fit();

            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                }
                return true;
            });
        }
    }, [terminal, connected]);

    useEventListener(
        'resize',
        debounce(() => {
            if (terminal.element) {
                terminal.options.fontSize = window.innerWidth < 640 ? 11 : 12;
                fitAddon.fit();
            }
        }, 100),
    );

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) terminal.clear();
            Object.keys(listeners).forEach((key) => {
                const listener = listeners[key];
                if (listener) instance.addListener(key, listener);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key) => {
                    const listener = listeners[key];
                    if (listener) instance.removeListener(key, listener);
                });
            }
        };
    }, [connected, instance]);

    return (
        <div className='group relative bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20'>
            <div className='relative'>
                <SpinnerOverlay visible={!connected} size={'large'} />

                {/* Terminal Container */}
                <div className='min-h-[280px] sm:min-h-[380px] p-2 sm:p-4'>
                    <div ref={ref} className='h-full w-full' />
                </div>

                {/* Command Input Area */}
                {canSendCommands && (
                    <div className='flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-t border-white/5 group-focus-within:bg-white/[0.04] transition-all duration-200'>
                        <span className='text-blue-400 font-mono text-sm font-bold select-none'>{'>'}</span>
                        <input
                            className='w-full bg-transparent font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 border-0 outline-none focus:ring-0'
                            type='text'
                            placeholder='Taper une commande...'
                            aria-label='Console command input.'
                            disabled={!instance || !connected}
                            onKeyDown={handleCommandKeyDown}
                            autoCorrect='off'
                            autoCapitalize='none'
                        />
                        <div className='hidden sm:block text-[10px] text-zinc-600 font-mono border border-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider'>
                            Entrer
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Console;
