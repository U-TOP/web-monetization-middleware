import { WebPayoutStore, PayoutEntry } from "./WebPayoutStore";
export declare class WebPayoutRedisStore extends WebPayoutStore {
    protected readonly redis: any;
    constructor(redis: any);
    open(): Promise<void>;
    close(): Promise<void>;
    getItemId(key: any): string;
    getItem(key: string): Promise<any>;
    putItem(key: string, entry: PayoutEntry): Promise<void>;
}
