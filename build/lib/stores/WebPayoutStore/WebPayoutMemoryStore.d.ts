import { WebPayoutStore, PayoutEntry } from "./WebPayoutStore";
export interface PayoutEntryMap {
    [key: string]: PayoutEntry;
}
export declare class WebPayoutMemoryStore extends WebPayoutStore {
    private entries;
    open(): Promise<void>;
    close(): Promise<void>;
    getItemId(key: any): string;
    getItem(key: string): Promise<PayoutEntry>;
    putItem(key: string, entry: PayoutEntry): Promise<void>;
}
