const debug = require("debug-logger")("Web-Monetization-Middleware:Monetize");

import { Config } from "./Config";
import { SPSP, SPSPDetail } from "./SPSP";

import { ConnectionTag } from "./ConnectionTag";
import { PaymentTag } from "./PaymentTag";

import { Plugins } from "./Plugins";
import { Proof } from "./Proof";
import { Payout } from "./Payout";

import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";
import { WebMonetizeMemoryStore } from "../lib/stores/WebMonetizeStore/WebMonetizeMemoryStore";
import { WebMonetizeRedisStore } from "../lib/stores/WebMonetizeStore/WebMonetizeRedisStore";

import { WebPayoutStore } from "../lib/stores/WebPayoutStore/WebPayoutStore";
import { WebPayoutMemoryStore } from "../lib/stores/WebPayoutStore/WebPayoutMemoryStore";
import { WebPayoutRedisStore } from "../lib/stores/WebPayoutStore/WebPayoutRedisStore";

import Redis from "ioredis";

export class Monetize {
  public readonly config: Config;

  public readonly webMonetizeStore: WebMonetizeStore;
  public readonly webPayoutStore: WebPayoutStore;

  private readonly connectionTag: ConnectionTag;
  private readonly paymentTag: PaymentTag;

  private readonly plugins: Plugins;
  public readonly proof: Proof;
  private readonly payout: Payout;

  public readonly spsp: SPSP;
  
  public connected: boolean = false;

  constructor(config?: Config) {
    // config
    // ----------------------------
    this.config = config || new Config();

    // WebMonetizeStore
    // ----------------------------
    if (this.config.webMonetizeStore == "WebMonetizeMemoryStore") {
      this.webMonetizeStore = new WebMonetizeMemoryStore();
    } else if (this.config.webMonetizeStore == "WebMonetizeRedisStore") {
      debug.log("use redis for WebMonetizeStore");

      // redis client
      // ----------------------------
      const redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
      });

      this.webMonetizeStore = new WebMonetizeRedisStore(redis);
    } else {
      throw new Error("Invalid WebMonetizeStore setting");
    }

    // WebPayoutStore
    // ----------------------------
    if (this.config.webPayoutStore == "WebPayoutMemoryStore") {
      this.webPayoutStore = new WebPayoutMemoryStore();
    } else if (this.config.webPayoutStore == "WebPayoutRedisStore") {
      debug.log("use redis for WebPayoutRedisStore");

      // redis client
      // ----------------------------
      const redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
      });

      this.webPayoutStore = new WebPayoutRedisStore(redis);
    } else {
      throw new Error("Invalid WebPayoutStore setting");
    }

    // connectionTag
    // ----------------------------
    this.connectionTag = new ConnectionTag(this.config.connectionTagKey);

    // paymentTag
    // ----------------------------
    this.paymentTag = new PaymentTag(this.config.paymentTagKey);

    // ilp plugings
    // ----------------------------
    this.plugins = new Plugins();

    // payout
    // ----------------------------
    this.payout = new Payout(this.plugins);

    // proof
    // ----------------------------
    this.proof = new Proof({
      webMonetizeStore: this.webMonetizeStore,
      privateKey: this.config.proofPrivateKey,
      publicKey: this.config.proofPublicKey,
    });

    // spsp
    // ----------------------------
    this.spsp = new SPSP({
      spspInstanceId: this.config.spspInstanceId,
      plugins: this.plugins,
      payout: this.payout,
      connectionTag: this.connectionTag,
      paymentTag: this.paymentTag,
      webMonetizeStore: this.webMonetizeStore,
      webPayoutStore: this.webPayoutStore,
    });
  }

  async start() {
    debug("Monetize start");
    await this.webMonetizeStore.open();
    await this.webPayoutStore.open();
    await this.spsp.start();
    this.connected = true;
  }

  async end() {
    debug("Monetize end");
    await this.webMonetizeStore.close();
    await this.webPayoutStore.close();
    await this.spsp.close();
    this.connected = false;
  }
}
