"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:Monetize");
const Config_1 = require("./Config");
const SPSP_1 = require("./SPSP");
const ConnectionTag_1 = require("./ConnectionTag");
const PaymentTag_1 = require("./PaymentTag");
const Plugins_1 = require("./Plugins");
const Proof_1 = require("./Proof");
const Payout_1 = require("./Payout");
const WebMonetizeMemoryStore_1 = require("../lib/stores/WebMonetizeStore/WebMonetizeMemoryStore");
const WebMonetizeRedisStore_1 = require("../lib/stores/WebMonetizeStore/WebMonetizeRedisStore");
const WebPayoutMemoryStore_1 = require("../lib/stores/WebPayoutStore/WebPayoutMemoryStore");
const WebPayoutRedisStore_1 = require("../lib/stores/WebPayoutStore/WebPayoutRedisStore");
const ioredis_1 = __importDefault(require("ioredis"));
class Monetize {
    constructor(config) {
        this.connected = false;
        this.config = config || new Config_1.Config();
        if (this.config.webMonetizeStore == "WebMonetizeMemoryStore") {
            this.webMonetizeStore = new WebMonetizeMemoryStore_1.WebMonetizeMemoryStore();
        }
        else if (this.config.webMonetizeStore == "WebMonetizeRedisStore") {
            debug.log("use redis for WebMonetizeStore");
            const redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || "127.0.0.1",
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                password: process.env.REDIS_PASSWORD,
            });
            this.webMonetizeStore = new WebMonetizeRedisStore_1.WebMonetizeRedisStore(redis);
        }
        else {
            throw new Error("Invalid WebMonetizeStore setting");
        }
        if (this.config.webPayoutStore == "WebPayoutMemoryStore") {
            this.webPayoutStore = new WebPayoutMemoryStore_1.WebPayoutMemoryStore();
        }
        else if (this.config.webPayoutStore == "WebPayoutRedisStore") {
            debug.log("use redis for WebPayoutRedisStore");
            const redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || "127.0.0.1",
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                password: process.env.REDIS_PASSWORD,
            });
            this.webPayoutStore = new WebPayoutRedisStore_1.WebPayoutRedisStore(redis);
        }
        else {
            throw new Error("Invalid WebPayoutStore setting");
        }
        this.connectionTag = new ConnectionTag_1.ConnectionTag(this.config.connectionTagKey);
        this.paymentTag = new PaymentTag_1.PaymentTag(this.config.paymentTagKey);
        this.plugins = new Plugins_1.Plugins();
        this.payout = new Payout_1.Payout(this.plugins);
        this.proof = new Proof_1.Proof({
            webMonetizeStore: this.webMonetizeStore,
            privateKey: this.config.proofPrivateKey,
            publicKey: this.config.proofPublicKey,
        });
        this.spsp = new SPSP_1.SPSP({
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
exports.Monetize = Monetize;
//# sourceMappingURL=Monetize.js.map