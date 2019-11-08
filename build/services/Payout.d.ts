import { Plugins } from "./Plugins";
export declare class Payout {
    private plugins;
    private payouts;
    constructor(plugins: Plugins);
    send(paymentPointer: string, amount: number): void;
    private expirePaymentPointer;
    private makeTimer;
}
