export interface MonetizeEntry {
    total: number;
    count: number;
    rate: number;
    timestamp: number;
    metadata?: object;
}
export declare abstract class WebMonetizeStore {
    constructor();
    abstract open(): any;
    abstract close(): any;
    protected abstract putItem(key: string, entry: MonetizeEntry): Promise<void>;
    abstract getItem(key: string): Promise<MonetizeEntry | null>;
    get(key: string): Promise<MonetizeEntry>;
    add(key: string, amount: number, metadata: object): Promise<void>;
}
