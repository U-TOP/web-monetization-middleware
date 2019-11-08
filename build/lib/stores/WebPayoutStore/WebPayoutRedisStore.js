"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:WebPayoutRedisStore");
const WebPayoutStore_1 = require("./WebPayoutStore");
class WebPayoutRedisStore extends WebPayoutStore_1.WebPayoutStore {
    constructor(redis) {
        super();
        this.redis = redis;
    }
    async open() {
        debug("not implement open operation");
    }
    async close() {
        debug("not implement close operation");
    }
    getItemId(key) {
        return `WEB-PAYOUT-${key}`;
    }
    async getItem(key) {
        const itemId = this.getItemId(key);
        const itemJsonString = await this.redis.get(itemId);
        if (itemJsonString === null)
            return null;
        const item = JSON.parse(itemJsonString);
        return item;
    }
    async putItem(key, entry) {
        if (!key)
            throw new Error("key is not included in item");
        const itemId = this.getItemId(key);
        await this.redis.set(itemId, JSON.stringify(entry));
    }
}
exports.WebPayoutRedisStore = WebPayoutRedisStore;
//# sourceMappingURL=WebPayoutRedisStore.js.map