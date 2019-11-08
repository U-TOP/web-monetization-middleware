export interface PayoutEntry {
    monetizedTotal: number;
    monetizedCount: number;
    lastMonetizedAt: number;
    payoutTotal: number;
    payoutCount: number;
    lastPayoutAt: number;
}
export declare abstract class WebPayoutStore {
    constructor();
    abstract open(): any;
    abstract close(): any;
    protected abstract putItem(key: string, entry: PayoutEntry): Promise<void>;
    abstract getItem(key: string): Promise<PayoutEntry | null>;
    get(key: string): Promise<PayoutEntry>;
    addMonetizedTotal(key: string, amount: number): Promise<void>;
    addPayoutTotal(key: string, amount: number): Promise<void>;
}
