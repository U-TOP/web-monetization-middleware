import { Config } from "./Config";
import { SPSP } from "./SPSP";
import { Proof } from "./Proof";
import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";
import { WebPayoutStore } from "../lib/stores/WebPayoutStore/WebPayoutStore";
export declare class Monetize {
    readonly config: Config;
    readonly webMonetizeStore: WebMonetizeStore;
    readonly webPayoutStore: WebPayoutStore;
    private readonly connectionTag;
    private readonly paymentTag;
    private readonly plugins;
    readonly proof: Proof;
    private readonly payout;
    readonly spsp: SPSP;
    connected: boolean;
    constructor(config?: Config);
    start(): Promise<void>;
    end(): Promise<void>;
}
