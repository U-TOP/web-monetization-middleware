export declare const resolvePaymentPointer: (pointer: string) => string;
export declare enum State {
    DISCONNECTED = 0,
    CONNECTING = 1,
    IDLE = 2,
    SENDING = 3
}
export declare class PayoutConnection {
    private pointer;
    private spspUrl;
    private connection?;
    private stream?;
    private plugin;
    private state;
    private closing;
    private target;
    private sent;
    private totalStreamAmount;
    constructor({ pointer, plugin }: {
        pointer: string;
        plugin: any;
    });
    getDebugInfo(): {
        state: State;
        target: number;
        sent: number;
        streamSent: number;
        pointer: string;
    };
    send(amount: number): void;
    isIdle(): boolean;
    close(): Promise<void>;
    private spspQuery;
    private getSendMax;
    private getState;
    private setState;
    private safeTrySending;
    private trySending;
}
