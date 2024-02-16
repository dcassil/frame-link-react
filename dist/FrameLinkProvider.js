"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameLinkContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const recoil_1 = require("recoil");
const FrameLinkProviderInternal_1 = __importStar(require("./FrameLinkProviderInternal"));
exports.FrameLinkContext = FrameLinkProviderInternal_1.FrameLinkContext;
function FrameLinkProvider({ children }) {
    return ((0, jsx_runtime_1.jsx)(recoil_1.RecoilRoot, { children: (0, jsx_runtime_1.jsx)(FrameLinkProviderInternal_1.default, { children: children }) }));
}
exports.default = FrameLinkProvider;
//# sourceMappingURL=FrameLinkProvider.js.map