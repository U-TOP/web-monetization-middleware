import { ConnectionTag } from "./ConnectionTag";
import { PaymentTag } from "./PaymentTag";
import { Plugins } from "./Plugins";
import { Payout } from "./Payout";
import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";
import { WebPayoutStore } from "../lib/stores/WebPayoutStore/WebPayoutStore";
export interface SPSPDetail {
    destination_account: string;
    shared_secret: string;
}
export declare class SPSP {
    private spspInstanceId;
    private webMonetizeStore;
    private webPayoutStore;
    private connectionTag;
    private paymentTag;
    private plugins;
    private payout;
    private streamServer;
    constructor(props: {
        spspInstanceId: string;
        webMonetizeStore: WebMonetizeStore;
        webPayoutStore: WebPayoutStore;
        connectionTag: ConnectionTag;
        paymentTag: PaymentTag;
        plugins: Plugins;
        payout: Payout;
    });
    close(): Promise<void>;
    start(): Promise<void>;
    getPaymentTag({ paymentPointer, paymentId }: {
        paymentPointer: string;
        paymentId: string;
    }): Promise<string>;
    getSPSPDetail({ paymentTag, requestId }: {
        paymentTag: string;
        requestId: string;
    }): Promise<SPSPDetail>;
}
