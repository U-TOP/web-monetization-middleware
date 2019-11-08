const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeRedisStore");

import Redis from "ioredis";
import { WebPayoutStore, PayoutEntry } from "./WebPayoutStore";

export interface PayoutEntryMap {
  [key: string]: PayoutEntry;
}

export class WebPayoutMemoryStore extends WebPayoutStore {
  private entries: PayoutEntryMap = {};

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
    return this.entries[key];
  }

  async putItem(key: string, entry: PayoutEntry) {
    this.entries[key] = entry;
  }
}
