"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ilp_plugin_btp_1 = __importDefault(require("ilp-plugin-btp"));
class Plugins {
    create(opts) {
        const secret = require('crypto').randomBytes(16).toString('hex');
        const name = (opts && opts.name) || '';
        return new ilp_plugin_btp_1.default({ server: `btp+ws://${name}:${secret}@localhost:7768` });
    }
}
exports.Plugins = Plugins;
//# sourceMappingURL=Plugins.js.map