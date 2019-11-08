const debug = require("debug-logger")("Web-Monetization-Middleware:SPSP");

import { ConnectionTag } from "./ConnectionTag";
import { PaymentTag } from "./PaymentTag";

import { Proof } from "./Proof";
import { Plugins } from "./Plugins";
import { Payout } from "./Payout";

import { WebMonetizeStore } from "../lib/stores/WebMonetizeStore/WebMonetizeStore";
import { WebPayoutStore } from "../lib/stores/WebPayoutStore/WebPayoutStore";

import { createServer, DataAndMoneyStream, Server } from "ilp-protocol-stream";
import uuid from "uuid/v4";
import deepEqual from "deep-equal";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

export interface SPSPDetail {
  destination_account: string;
  shared_secret: string;
}

export class SPSP {
  private spspInstanceId: string;

  private webMonetizeStore: WebMonetizeStore;
  private webPayoutStore: WebPayoutStore;

  private connectionTag: ConnectionTag;
  private paymentTag: PaymentTag;

  private plugins: Plugins;
  private payout: Payout;

  private streamServer: Server;

  constructor(props: {
    spspInstanceId: string;
    webMonetizeStore: WebMonetizeStore;
    webPayoutStore: WebPayoutStore;
    connectionTag: ConnectionTag;
    paymentTag: PaymentTag;
    plugins: Plugins;
    payout: Payout;
  }) {
    Object.assign(this, props);
  }

  async close() {
    await this.streamServer.close();
  }

  async start() {
    this.streamServer = await createServer({
      // TODO: add isConnected to type in ilp-plugin repo
      plugin: this.plugins.create() as any,
    });

    this.streamServer.on("connection", async connection => {
      // get params from metadata
      // ---------------------------------
      const metadata = JSON.parse(this.connectionTag.decode(connection.connectionTag));
      const paymentPointer = metadata.pp;
      const requestId = metadata.requestId;
      const paymentId = metadata.paymentId;
      const spspInstanceId = metadata.spspInstanceId;

      debug("connection with metadata", JSON.stringify(metadata));

      // is exist webMonetizeStore
      // ---------------------------------
      const existing = await this.webMonetizeStore.get(requestId);
      const existingMetadata = existing && existing.metadata;
      if (existingMetadata && !deepEqual(existingMetadata, metadata)) {
        debug.error("connection with conflicting metadata", existingMetadata, metadata);
        connection.destroy();
        return;
      }

      // onStream
      // ---------------------------------
      const onStream = (stream: DataAndMoneyStream) => {
        stream.setReceiveMax(Infinity);

        // onMoney
        // ---------------------------------
        const onMoney = async (amount: string) => {
          debug("received money ", requestId, amount);

          // pp(paymentPointer)がmetadetaに含まれないのは実装上ありえないはず
          // ---------------------------------
          if (!metadata.pp) {
            debug.warn("The paymentpointer is not included in the metadata.This monetization is not payout");
            return;
          }

          // 将来的なspsp 転送負荷分散の為の実装
          // spsp instance idで自身が発行したspspDetailのみpaymentに加算していく
          // 同一のspspInstanceIdで複数のSPSPを起動すると、spspをListenしている情報を全て加算してしまうため処理分けを行う
          // ---------------------------------
          if (spspInstanceId !== this.spspInstanceId) return;

          // webMonetizeStoreに加算
          // ---------------------------------
          this.webMonetizeStore.add(requestId, Number(amount), metadata);

          // addMonetizedTotal
          // ---------------------------------
          await this.webPayoutStore.addMonetizedTotal(paymentId, Number(amount));
          debug("addTotal", amount);

          // 受け取ったmonetizeのpayout(転送)
          // ---------------------------------
          await this.payout.send(metadata.pp, Number(amount));

          // addPayoutTotal
          // ---------------------------------
          await this.webPayoutStore.addPayoutTotal(paymentId, Number(amount));
          debug("addPayoutTotal", amount);
        };

        const onClose = () => cleanUp();
        const onError = () => cleanUp();
        const cleanUp = () => {
          setImmediate(() => {
            stream.removeListener("money", onMoney);
            stream.removeListener("close", onClose);
            stream.removeListener("error", onError);
          });
        };

        stream.on("money", onMoney);
        stream.on("close", onClose);
        stream.on("error", onError);
      };

      const onClose = () => cleanUp();
      const onError = () => cleanUp();
      const cleanUp = () => {
        setImmediate(() => {
          connection.removeListener("stream", onStream);
          connection.removeListener("close", onClose);
          connection.removeListener("error", onError);
        });
      };

      connection.on("close", onClose);
      connection.on("error", onError);
      connection.on("stream", onStream);
    });
  }

  async getPaymentTag({ paymentPointer, paymentId }: { paymentPointer: string; paymentId: string }) {
    const paymentTag = {
      paymentPointer,
      paymentId,
    };
    return this.paymentTag.encode(JSON.stringify(paymentTag));
  }

  async getSPSPDetail({ paymentTag, requestId }: { paymentTag: string; requestId: string }): Promise<SPSPDetail> {
    // parse encryptedPaymentTag
    // ---------------------------------
    const { paymentPointer, paymentId } = JSON.parse(this.paymentTag.decode(paymentTag));

    // paymentIdからPaymentPersistStoreを準備、極力高速なKVSが望ましい(get,putが30ms以下程度)
    // ---------------------------------
    const paymentEntry = await this.webPayoutStore.get(paymentId);
    debug("paymentEntry", paymentEntry);

    // spspTag
    // ---------------------------------
    const spspParams = {
      pp: paymentPointer,
      requestId,
      paymentId,
      spspInstanceId: this.spspInstanceId, // SPSPを請負う自身のIDを追加
    };
    debug("spspParams", spspParams);

    // create connectionTag
    // ---------------------------------
    const metadata = this.connectionTag.encode(JSON.stringify(spspParams));
    debug("spspTag metadata", metadata);

    // metadataを含めたspsp detailを生成
    // ---------------------------------
    const { destinationAccount, sharedSecret } = this.streamServer.generateAddressAndSecret(metadata);
    debug("destinationAccount", destinationAccount);
    debug("sharedSecret", sharedSecret);

    return {
      destination_account: destinationAccount,
      shared_secret: sharedSecret.toString("base64"),
    };
  }
}
