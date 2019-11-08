import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";
export declare class Proof {
    private webMonetizeStore;
    private privateKey;
    publicKey: string;
    constructor(props: {
        webMonetizeStore: WebMonetizeStore;
        privateKey: string;
        publicKey: string;
    });
    getProofData({ requestId }: {
        requestId: string;
    }): Promise<{
        data: import("../lib/stores/WebMonetizeStore/WebMonetizeStore").MonetizeEntry;
        token: string;
    }>;
}
