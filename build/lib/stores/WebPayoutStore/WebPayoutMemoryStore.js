"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeRedisStore");
const WebPayoutStore_1 = require("./WebPayoutStore");
class WebPayoutMemoryStore extends WebPayoutStore_1.WebPayoutStore {
    constructor() {
        super(...arguments);
        this.entries = {};
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
        return this.entries[key];
    }
    async putItem(key, entry) {
        this.entries[key] = entry;
    }
}
exports.WebPayoutMemoryStore = WebPayoutMemoryStore;
//# sourceMappingURL=WebPayoutMemoryStore.js.map