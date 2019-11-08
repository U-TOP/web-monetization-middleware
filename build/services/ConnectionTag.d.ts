export declare class ConnectionTag {
    private key;
    constructor(connectionTagKey: string);
    encode(data: string): string;
    decode(completeEncoded: string): string;
}
