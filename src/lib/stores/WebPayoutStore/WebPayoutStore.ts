export interface PayoutEntry {
  monetizedTotal: number;
  monetizedCount: number;
  lastMonetizedAt: number;

  payoutTotal: number;
  payoutCount: number;
  lastPayoutAt: number;
}

export abstract class WebPayoutStore {
  constructor() {}

  abstract async open();
  abstract async close();

  protected abstract async putItem(key: string, entry: PayoutEntry): Promise<void>;
  public abstract async getItem(key: string): Promise<PayoutEntry | null>;

  async get(key: string): Promise<PayoutEntry> {
    const entry = await this.getItem(key);

    if (entry) {
      return entry;
    } else {
      const newEntry = {
        monetizedTotal: 0,
        monetizedCount: 0,
        lastMonetizedAt: 0,

        payoutTotal: 0,
        payoutCount: 0,
        lastPayoutAt: 0,
      } as PayoutEntry;

      return newEntry;
    }
  }

  async addMonetizedTotal(key: string, amount: number): Promise<void> {
    if (!key) throw new Error("key is invalid");

    const entry = await this.get(key);
    if (!entry) throw new Error("item does not exist or has not been initialized");

    entry.monetizedTotal += amount;
    entry.monetizedCount++;
    entry.lastMonetizedAt = new Date().getTime();
    await this.putItem(key, entry);
  }

  async addPayoutTotal(key: string, amount: number): Promise<void> {
    if (!key) throw new Error("key is invalid");

    const entry = await this.get(key);
    if (!entry) throw new Error("item does not exist or has not been initialized");

    entry.payoutTotal += amount;
    entry.payoutCount++;
    entry.lastPayoutAt = new Date().getTime();
    await this.putItem(key, entry);
  }
}
