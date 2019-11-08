"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeMemoryStore");
const WebMonetizeStore_1 = require("./WebMonetizeStore");
class WebMonetizeMemoryStore extends WebMonetizeStore_1.WebMonetizeStore {
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
    async getItem(key) {
        return this.entries[key];
    }
    async putItem(key, entry) {
        this.entries[key] = entry;
    }
}
exports.WebMonetizeMemoryStore = WebMonetizeMemoryStore;
//# sourceMappingURL=WebMonetizeMemoryStore.js.map