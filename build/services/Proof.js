"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug-logger")("Web-Monetization-Middleware:Proof");
const jwt = __importStar(require("jsonwebtoken"));
const PROOF_EXPIRY = 3 * 1000;
class Proof {
    constructor(props) {
        Object.assign(this, props);
    }
    async getProofData({ requestId }) {
        const data = await this.webMonetizeStore.get(requestId);
        const token = await new Promise((resolve, reject) => {
            jwt.sign(data, this.privateKey, {
                algorithm: "ES256",
                expiresIn: PROOF_EXPIRY,
            }, (err, encoded) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(encoded);
                }
            });
        });
        return {
            data,
            token,
        };
    }
}
exports.Proof = Proof;
//# sourceMappingURL=Proof.js.map