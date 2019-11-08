const debug = require("debug-logger")("Web-Monetization-Middleware:WebPayoutRedisStore");

import Redis from "ioredis";
import { WebPayoutStore, PayoutEntry } from "./WebPayoutStore";

export class WebPayoutRedisStore extends WebPayoutStore {
  constructor(protected readonly redis: any) {
    super();
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

  async getItem(key: string) {
    const itemId = this.getItemId(key);
    const itemJsonString = await this.redis.get(itemId);
    if (itemJsonString === null) return null;
    const item = JSON.parse(itemJsonString);
    return item;
  }

  async putItem(key: string, entry: PayoutEntry) {
    if (!key) throw new Error("key is not included in item");
    const itemId = this.getItemId(key);
    await this.redis.set(itemId, JSON.stringify(entry));
  }
}
