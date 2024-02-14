"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameLinkContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const frame_link_1 = __importDefault(require("frame-link"));
const react_1 = require("react");
exports.FrameLinkContext = (0, react_1.createContext)({});
function FrameLinkProvider({ children, }) {
    const [ready, setReady] = (0, react_1.useState)(false);
    const frameLink = (0, react_1.useRef)((0, frame_link_1.default)(setReady));
    return ((0, jsx_runtime_1.jsx)(exports.FrameLinkContext.Provider, { value: Object.assign(Object.assign({}, frameLink.current), { ready }), children: children }));
}
exports.default = FrameLinkProvider;
//# sourceMappingURL=FrameLinkContext.js.map