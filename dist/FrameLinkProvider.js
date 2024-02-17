"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameLinkContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const recoil_1 = require("recoil");
const FrameLinkProviderInternal_1 = __importDefault(require("./FrameLinkProviderInternal"));
exports.FrameLinkContext = (0, react_1.createContext)({});
function FrameLinkProvider({ children, }) {
    return ((0, jsx_runtime_1.jsx)(recoil_1.RecoilRoot, { children: (0, jsx_runtime_1.jsx)(FrameLinkProviderInternal_1.default, { children: children }) }));
}
exports.default = FrameLinkProvider;
//# sourceMappingURL=FrameLinkProvider.js.map