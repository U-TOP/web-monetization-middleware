"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ilp_protocol_stream_1 = require("ilp-protocol-stream");
const url_1 = require("url");
const axios_1 = __importDefault(require("axios"));
exports.resolvePaymentPointer = (pointer) => {
    if (!pointer.startsWith('$')) {
        return pointer;
    }
    const parsed = new url_1.URL('https://' + pointer.substring(1));
    if (parsed.pathname === '/') {
        parsed.pathname = '/.well-known/pay';
    }
    return parsed.href;
};
var State;
(function (State) {
    State[State["DISCONNECTED"] = 0] = "DISCONNECTED";
    State[State["CONNECTING"] = 1] = "CONNECTING";
    State[State["IDLE"] = 2] = "IDLE";
    State[State["SENDING"] = 3] = "SENDING";
})(State = exports.State || (exports.State = {}));
class PayoutConnection {
    constructor({ pointer, plugin }) {
        this.state = State.DISCONNECTED;
        this.closing = false;
        this.target = 0;
        this.sent = 0;
        this.totalStreamAmount = 0;
        this.pointer = pointer;
        this.spspUrl = exports.resolvePaymentPointer(pointer);
        this.plugin = plugin;
    }
    getDebugInfo() {
        return {
            state: this.state,
            target: this.target,
            sent: this.sent,
            streamSent: this.totalStreamAmount,
            pointer: this.pointer
        };
    }
    send(amount) {
        if (this.closing) {
            throw new Error('payout connection is closing');
        }
        this.target += amount;
        if ((this.getState() === State.SENDING ||
            this.getState() === State.IDLE) &&
            this.stream) {
            this.setState(State.SENDING);
            this.stream.setSendMax(this.getSendMax());
        }
        else {
            this.safeTrySending();
        }
    }
    isIdle() {
        return this.getState() === State.IDLE;
    }
    async close() {
        this.closing = true;
        if (this.connection) {
            await this.connection.destroy();
        }
        await this.plugin.disconnect();
    }
    async spspQuery() {
        const { data } = await axios_1.default({
            url: this.spspUrl,
            method: 'GET',
            headers: {
                accept: 'application/spsp4+json'
            }
        });
        return {
            destinationAccount: data.destination_account,
            sharedSecret: Buffer.from(data.shared_secret, 'base64')
        };
    }
    getSendMax() {
        return this.target - this.sent;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
    async safeTrySending() {
        this.trySending()
            .catch(() => {
            setTimeout(() => {
                this.safeTrySending();
            }, 2000);
        });
    }
    async trySending() {
        if (this.getState() !== State.DISCONNECTED) {
            return;
        }
        this.setState(State.CONNECTING);
        const spspParams = await this.spspQuery();
        const connection = await ilp_protocol_stream_1.createConnection({
            plugin: this.plugin,
            ...spspParams
        });
        const stream = connection.createStream();
        this.stream = stream;
        this.connection = connection;
        const sendMax = this.getSendMax();
        if (sendMax > 0) {
            this.setState(State.SENDING);
            stream.setSendMax(this.getSendMax());
        }
        else {
            this.setState(State.IDLE);
        }
        let appliedSent = false;
        this.totalStreamAmount = 0;
        const cleanUp = () => {
            setImmediate(() => {
                this.setState(State.DISCONNECTED);
                stream.removeListener('close', onClose);
                stream.removeListener('error', onError);
                stream.removeListener('outgoing_money', onOutgoingMoney);
                connection.removeListener('close', onClose);
                connection.removeListener('error', onError);
                if (!appliedSent) {
                    this.sent += this.totalStreamAmount;
                }
                if (this.getSendMax() > 0) {
                    this.safeTrySending();
                }
            });
        };
        const onClose = () => cleanUp();
        const onError = () => cleanUp();
        const onOutgoingMoney = (amount) => {
            this.totalStreamAmount += Number(amount);
            if (this.totalStreamAmount + this.sent === this.target) {
                this.setState(State.IDLE);
            }
        };
        connection.on('close', onClose);
        connection.on('error', onError);
        stream.on('close', onClose);
        stream.on('error', onError);
        stream.on('outgoing_money', onOutgoingMoney);
    }
}
exports.PayoutConnection = PayoutConnection;
//# sourceMappingURL=PayoutConnection.js.map