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
const crypto = __importStar(require("crypto"));
const base64url_1 = __importDefault(require("base64url"));
class PaymentTag {
    constructor(paymentTagKey) {
        this.key = Buffer.from(paymentTagKey, "base64");
    }
    encode(data) {
        console.log("data", data);
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
        const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        const complete = Buffer.concat([tag, iv, encrypted]);
        return base64url_1.default(complete);
    }
    decode(completeEncoded) {
        const complete = Buffer.from(completeEncoded, "base64");
        const tag = complete.slice(0, 16);
        const iv = complete.slice(16, 16 + 12);
        const encrypted = complete.slice(16 + 12);
        const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
        decipher.setAuthTag(tag);
        const data = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return data.toString("utf8");
    }
}
exports.PaymentTag = PaymentTag;
//# sourceMappingURL=PaymentTag.js.map