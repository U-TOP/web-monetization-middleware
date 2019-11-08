"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebPayoutStore {
    constructor() { }
    async get(key) {
        const entry = await this.getItem(key);
        if (entry) {
            return entry;
        }
        else {
            const newEntry = {
                monetizedTotal: 0,
                monetizedCount: 0,
                lastMonetizedAt: 0,
                payoutTotal: 0,
                payoutCount: 0,
                lastPayoutAt: 0,
            };
            return newEntry;
        }
    }
    async addMonetizedTotal(key, amount) {
        if (!key)
            throw new Error("key is invalid");
        const entry = await this.get(key);
        if (!entry)
            throw new Error("item does not exist or has not been initialized");
        entry.monetizedTotal += amount;
        entry.monetizedCount++;
        entry.lastMonetizedAt = new Date().getTime();
        await this.putItem(key, entry);
    }
    async addPayoutTotal(key, amount) {
        if (!key)
            throw new Error("key is invalid");
        const entry = await this.get(key);
        if (!entry)
            throw new Error("item does not exist or has not been initialized");
        entry.payoutTotal += amount;
        entry.payoutCount++;
        entry.lastPayoutAt = new Date().getTime();
        await this.putItem(key, entry);
    }
}
exports.WebPayoutStore = WebPayoutStore;
//# sourceMappingURL=WebPayoutStore.js.map