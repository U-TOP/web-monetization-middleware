"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:SPSP");
const ilp_protocol_stream_1 = require("ilp-protocol-stream");
const deep_equal_1 = __importDefault(require("deep-equal"));
class SPSP {
    constructor(props) {
        Object.assign(this, props);
    }
    async close() {
        await this.streamServer.close();
    }
    async start() {
        this.streamServer = await ilp_protocol_stream_1.createServer({
            plugin: this.plugins.create(),
        });
        this.streamServer.on("connection", async (connection) => {
            const metadata = JSON.parse(this.connectionTag.decode(connection.connectionTag));
            const paymentPointer = metadata.pp;
            const requestId = metadata.requestId;
            const paymentId = metadata.paymentId;
            const spspInstanceId = metadata.spspInstanceId;
            debug("connection with metadata", JSON.stringify(metadata));
            const existing = await this.webMonetizeStore.get(requestId);
            const existingMetadata = existing && existing.metadata;
            if (existingMetadata && !deep_equal_1.default(existingMetadata, metadata)) {
                debug.error("connection with conflicting metadata", existingMetadata, metadata);
                connection.destroy();
                return;
            }
            const onStream = (stream) => {
                stream.setReceiveMax(Infinity);
                const onMoney = async (amount) => {
                    debug("received money ", requestId, amount);
                    if (!metadata.pp) {
                        debug.warn("The paymentpointer is not included in the metadata.This monetization is not payout");
                        return;
                    }
                    if (spspInstanceId !== this.spspInstanceId)
                        return;
                    this.webMonetizeStore.add(requestId, Number(amount), metadata);
                    await this.webPayoutStore.addMonetizedTotal(paymentId, Number(amount));
                    debug("addTotal", amount);
                    await this.payout.send(metadata.pp, Number(amount));
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
    async getPaymentTag({ paymentPointer, paymentId }) {
        const paymentTag = {
            paymentPointer,
            paymentId,
        };
        return this.paymentTag.encode(JSON.stringify(paymentTag));
    }
    async getSPSPDetail({ paymentTag, requestId }) {
        const { paymentPointer, paymentId } = JSON.parse(this.paymentTag.decode(paymentTag));
        const paymentEntry = await this.webPayoutStore.get(paymentId);
        debug("paymentEntry", paymentEntry);
        const spspParams = {
            pp: paymentPointer,
            requestId,
            paymentId,
            spspInstanceId: this.spspInstanceId,
        };
        debug("spspParams", spspParams);
        const metadata = this.connectionTag.encode(JSON.stringify(spspParams));
        debug("spspTag metadata", metadata);
        const { destinationAccount, sharedSecret } = this.streamServer.generateAddressAndSecret(metadata);
        debug("destinationAccount", destinationAccount);
        debug("sharedSecret", sharedSecret);
        return {
            destination_account: destinationAccount,
            shared_secret: sharedSecret.toString("base64"),
        };
    }
}
exports.SPSP = SPSP;
//# sourceMappingURL=SPSP.js.map