import { WebMonetizeStore, MonetizeEntry } from "./WebMonetizeStore";
export declare class WebMonetizeRedisStore extends WebMonetizeStore {
    protected readonly redis: any;
    constructor(redis: any);
    open(): Promise<void>;
    close(): Promise<void>;
    getItemId(key: any): string;
    getItem(key: string): Promise<any>;
    putItem(key: string, entry: MonetizeEntry): Promise<void>;
}
