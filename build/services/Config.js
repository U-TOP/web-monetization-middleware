"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:Config");
const crypto = __importStar(require("crypto"));
const v4_1 = __importDefault(require("uuid/v4"));
const ECKey = require("ec-key");
class Config {
    constructor() {
        this.host = process.env.HOST || "localhost";
        this.port = process.env.PORT || "8080";
        this.allowCrossOrigin = process.env.ALLOW_CROSS_ORIGIN === "true";
        this.spspInstanceId = process.env.SPSP_INSTANCE_ID || v4_1.default();
        this.examplePaymentPointer = process.env.EXAMPLE_PAYMENT_POINTER;
        this.examplePaymentId = process.env.EXAMPLE_PAYMENT_ID || v4_1.default();
        this.paymentTagKey = process.env.PAYMENT_TAG_KEY || crypto.randomBytes(32).toString("base64");
        this.connectionTagKey = process.env.CONNECTION_TAG_KEY || crypto.randomBytes(32).toString("base64");
        this.webMonetizeStore = process.env.WEB_MONETIZE_STORE || "WebMonetizeMemoryStore";
        this.webPayoutStore = process.env.WEB_PAYOUT_STORE || "WebPayoutMemoryStore";
        this.proofKeyEntropy = process.env.PROOF_KEY_ENTROPY || null;
        const ecKey = this.proofKeyEntropy ? new ECKey(this.proofKeyEntropy, "spki") : ECKey.createECKey("P-256");
        this.proofPrivateKey = ecKey.toString("pem");
        this.proofPublicKey = ecKey.asPublicECKey().toString("pem");
    }
}
exports.Config = Config;
//# sourceMappingURL=Config.js.map