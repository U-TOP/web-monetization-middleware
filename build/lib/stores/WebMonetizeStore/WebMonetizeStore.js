"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber = require("bignumber.js");
class WebMonetizeStore {
    constructor() { }
    async get(key) {
        const entry = await this.getItem(key);
        if (entry) {
            return entry;
        }
        else {
            const newEntry = {
                total: 0,
                count: 0,
                rate: 0,
                timestamp: new Date().getTime(),
            };
            return newEntry;
        }
    }
    async add(key, amount, metadata) {
        if (!key)
            throw new Error("key is invalid");
        const entry = await this.get(key);
        if (!entry)
            throw new Error("item does not exist or has not been initialized");
        entry.metadata = metadata;
        entry.total += amount;
        entry.count++;
        entry.timestamp = new Date().getTime();
        if (entry.count > 0 && entry.total > 0) {
            entry.rate = new BigNumber(entry.total).div(entry.count).toNumber();
        }
        else {
            entry.rate = 0;
        }
        await this.putItem(key, entry);
    }
}
exports.WebMonetizeStore = WebMonetizeStore;
//# sourceMappingURL=WebMonetizeStore.js.map