"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:Payout");
const PayoutConnection_1 = require("../lib/PayoutConnection");
const CLEANUP_TIMEOUT = 30 * 1000;
class Payout {
    constructor(plugins) {
        this.plugins = plugins;
        this.payouts = {};
    }
    send(paymentPointer, amount) {
        if (!this.payouts[paymentPointer]) {
            this.payouts[paymentPointer] = {
                connection: new PayoutConnection_1.PayoutConnection({
                    pointer: paymentPointer,
                    plugin: this.plugins.create({}),
                }),
                lastSent: Date.now(),
                timer: this.makeTimer(paymentPointer, CLEANUP_TIMEOUT),
            };
        }
        else {
            this.payouts[paymentPointer].lastSent = Date.now();
        }
        this.payouts[paymentPointer].connection.send(amount);
        debug("payout money", amount, paymentPointer);
    }
    async expirePaymentPointer(paymentPointer) {
        const payout = this.payouts[paymentPointer];
        if (!payout) {
            return;
        }
        const isExpired = Date.now() - payout.lastSent > CLEANUP_TIMEOUT;
        const isIdle = payout.connection.isIdle();
        if (isExpired) {
            if (!isIdle) {
                console.error("closing payout that was not idle.", JSON.stringify(payout.connection.getDebugInfo()));
            }
            delete this.payouts[paymentPointer];
            await payout.connection.close();
        }
        else {
            const msUntilExpiry = CLEANUP_TIMEOUT - (Date.now() - payout.lastSent);
            this.makeTimer(paymentPointer, msUntilExpiry);
        }
    }
    makeTimer(paymentPointer, duration) {
        return setTimeout(() => {
            this.expirePaymentPointer(paymentPointer).catch((e) => {
                console.error("failed to clean up payout.", e);
            });
        }, duration);
    }
}
exports.Payout = Payout;
//# sourceMappingURL=Payout.js.map