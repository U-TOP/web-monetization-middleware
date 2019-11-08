const debug = require("debug-logger")("Web-Monetization-Middleware:Proof");
import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";

import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import uuid from "uuid/v4";

const PROOF_EXPIRY = 3 * 1000;

export class Proof {
  private webMonetizeStore: WebMonetizeStore;
  private privateKey: string;
  public publicKey: string;

  constructor(props: { webMonetizeStore: WebMonetizeStore; privateKey: string; publicKey: string }) {
    Object.assign(this, props);
  }

  async getProofData({ requestId }: { requestId: string }) {
    const data = await this.webMonetizeStore.get(requestId);
    const token: string = await new Promise((resolve: Function, reject: Function) => {
      jwt.sign(
        data,
        this.privateKey,
        {
          algorithm: "ES256",
          expiresIn: PROOF_EXPIRY,
        },
        (err: Error, encoded: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(encoded);
          }
        }
      );
    });

    return {
      data,
      token,
    };
  }
}
