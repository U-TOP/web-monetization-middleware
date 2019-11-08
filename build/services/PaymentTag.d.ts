export declare class PaymentTag {
    private key;
    constructor(paymentTagKey: string);
    encode(data: string): string;
    decode(completeEncoded: string): string;
}
