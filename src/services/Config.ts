const debug = require("debug-logger")("Web-Monetization-Middleware:Config");

import * as crypto from "crypto";
import uuid from "uuid/v4";
// import { ECKey } from "ec-key";
const ECKey = require("ec-key");

export class Config {
  public readonly host: string = process.env.HOST || "localhost";
  public readonly port: string = process.env.PORT || "8080";
  public readonly allowCrossOrigin: boolean = process.env.ALLOW_CROSS_ORIGIN === "true";

  public readonly spspInstanceId: string = process.env.SPSP_INSTANCE_ID || uuid();

  public readonly examplePaymentPointer: string = process.env.EXAMPLE_PAYMENT_POINTER!;
  public readonly examplePaymentId: string = process.env.EXAMPLE_PAYMENT_ID || uuid();

  public readonly paymentTagKey: string = process.env.PAYMENT_TAG_KEY || crypto.randomBytes(32).toString("base64");
  public readonly connectionTagKey: string =
    process.env.CONNECTION_TAG_KEY || crypto.randomBytes(32).toString("base64");

  public readonly webMonetizeStore: string = process.env.WEB_MONETIZE_STORE || "WebMonetizeMemoryStore";
  public readonly webPayoutStore: string = process.env.WEB_PAYOUT_STORE || "WebPayoutMemoryStore";

  private proofKeyEntropy: string | null = process.env.PROOF_KEY_ENTROPY || null; // Create a new ECKey instance from a base-64 spki string
  public readonly proofPrivateKey: string; // use jsonwebtoken, pem format string
  public readonly proofPublicKey: string; // use jsonwebtoken, pem format string

  constructor() {
    const ecKey = this.proofKeyEntropy ? new ECKey(this.proofKeyEntropy, "spki") : ECKey.createECKey("P-256");
    this.proofPrivateKey = ecKey.toString("pem");
    this.proofPublicKey = ecKey.asPublicECKey().toString("pem");
  }
}
