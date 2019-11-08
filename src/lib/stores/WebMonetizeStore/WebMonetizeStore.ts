const BigNumber = require("bignumber.js");

export interface MonetizeEntry {
  total: number;
  count: number;
  rate: number; // To reduce the load, the past average rate is the entry rate.
  timestamp: number;
  metadata?: object;
}

export abstract class WebMonetizeStore {
  constructor() {}

  abstract async open();
  abstract async close();

  protected abstract async putItem(key: string, entry: MonetizeEntry): Promise<void>;
  public abstract async getItem(key: string): Promise<MonetizeEntry | null>;

  async get(key: string): Promise<MonetizeEntry> {
    const entry = await this.getItem(key);

    if (entry) {
      return entry;
    } else {
      const newEntry = {
        total: 0,
        count: 0,
        rate: 0,
        timestamp: new Date().getTime(),
      } as MonetizeEntry;

      return newEntry;
    }
  }

  async add(key: string, amount: number, metadata: object): Promise<void> {
    if (!key) throw new Error("key is invalid");

    const entry = await this.get(key);
    if (!entry) throw new Error("item does not exist or has not been initialized");

    entry.metadata = metadata;
    entry.total += amount;
    entry.count++;
    entry.timestamp = new Date().getTime();

    // 負荷軽減の為、簡素なrate計算に変更
    if (entry.count > 0 && entry.total > 0) {
      entry.rate = new BigNumber(entry.total).div(entry.count).toNumber();
    } else {
      entry.rate = 0;
    }
    await this.putItem(key, entry);
  }
}
