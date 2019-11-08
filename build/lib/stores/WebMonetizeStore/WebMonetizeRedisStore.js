"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeRedisStore");
const WebMonetizeStore_1 = require("./WebMonetizeStore");
class WebMonetizeRedisStore extends WebMonetizeStore_1.WebMonetizeStore {
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
        return `WEB-MONETIZE-${key}`;
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
        await this.redis.set(itemId, JSON.stringify(entry), "ex", 86400);
    }
}
exports.WebMonetizeRedisStore = WebMonetizeRedisStore;
//# sourceMappingURL=WebMonetizeRedisStore.js.map