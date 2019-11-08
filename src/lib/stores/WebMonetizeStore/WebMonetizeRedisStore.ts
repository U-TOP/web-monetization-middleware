const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeRedisStore");

import Redis from "ioredis";
import { WebMonetizeStore, MonetizeEntry } from "./WebMonetizeStore";

export class WebMonetizeRedisStore extends WebMonetizeStore {
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
    return `WEB-MONETIZE-${key}`;
  }

  async getItem(key: string) {
    const itemId = this.getItemId(key);
    const itemJsonString = await this.redis.get(itemId);
    if (itemJsonString === null) return null;
    const item = JSON.parse(itemJsonString);
    return item;
  }

  async putItem(key: string, entry: MonetizeEntry) {
    if (!key) throw new Error("key is not included in item");
    const itemId = this.getItemId(key);
    await this.redis.set(itemId, JSON.stringify(entry), "ex", 86400); // 1day
  }
}
