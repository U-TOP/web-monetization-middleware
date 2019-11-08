const debug = require("debug-logger")("Web-Monetization-Middleware:WebMonetizeMemoryStore");

import { WebMonetizeStore, MonetizeEntry } from "./WebMonetizeStore";

export interface MonetizeEntryMap {
  [key: string]: MonetizeEntry;
}

export class WebMonetizeMemoryStore extends WebMonetizeStore {
  private entries: MonetizeEntryMap = {};

  async open() {
    debug("not implement open operation");
  }

  async close() {
    debug("not implement close operation");
  }

  async getItem(key: string) {
    return this.entries[key];
  }

  async putItem(key: string, entry: MonetizeEntry) {
    this.entries[key] = entry;
  }
}
