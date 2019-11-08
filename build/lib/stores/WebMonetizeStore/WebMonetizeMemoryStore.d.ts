import { WebMonetizeStore, MonetizeEntry } from "./WebMonetizeStore";
export interface MonetizeEntryMap {
    [key: string]: MonetizeEntry;
}
export declare class WebMonetizeMemoryStore extends WebMonetizeStore {
    private entries;
    open(): Promise<void>;
    close(): Promise<void>;
    getItem(key: string): Promise<MonetizeEntry>;
    putItem(key: string, entry: MonetizeEntry): Promise<void>;
}
