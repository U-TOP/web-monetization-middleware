export declare class Config {
    readonly host: string;
    readonly port: string;
    readonly allowCrossOrigin: boolean;
    readonly spspInstanceId: string;
    readonly examplePaymentPointer: string;
    readonly examplePaymentId: string;
    readonly paymentTagKey: string;
    readonly connectionTagKey: string;
    readonly webMonetizeStore: string;
    readonly webPayoutStore: string;
    private proofKeyEntropy;
    readonly proofPrivateKey: string;
    readonly proofPublicKey: string;
    constructor();
}
