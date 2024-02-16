"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameLinkContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const frame_link_1 = __importDefault(require("frame-link"));
const react_1 = require("react");
const recoil_1 = require("recoil");
const atoms = {};
const createAtom = (key) => {
    let _atom = (0, recoil_1.atom)({
        key: key,
        default: {},
    });
    atoms[key] = _atom;
    return atoms[key];
};
const useNotify = (key) => {
    let _atom = atoms[key] || createAtom(key);
    let updater = (0, recoil_1.useSetRecoilState)(_atom);
    return (data) => updater((previous) => (Object.assign(Object.assign({}, previous), data)));
};
const _useSubscribe = (key) => {
    let _atom = atoms[key] || createAtom(key);
    return (0, recoil_1.useRecoilValue)(_atom);
};
const _unSubscribe = (key) => {
    if (atoms[key]) {
        delete atoms[key];
    }
};
exports.FrameLinkContext = (0, react_1.createContext)({});
function FrameLinkProviderInternal({ children }) {
    var _a;
    const [ready, setReady] = (0, react_1.useState)(false);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const frameLink = (0, react_1.useRef)((0, frame_link_1.default)((connected) => {
        setConnected(connected);
    }));
    const usePostMessage = (key) => {
        const notify = useNotify(key);
        return (data, callback) => {
            var _a;
            (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.postMessage(key, data, (data) => {
                notify(data);
                if (callback) {
                    callback(data);
                }
            });
        };
    };
    const useAddListener = (key) => {
        const notify = useNotify(key);
        if (frameLink === null || frameLink === void 0 ? void 0 : frameLink.current) {
            frameLink.current.addListener(key, (data) => {
                console.log("state tore update", key);
                notify(data);
            });
        }
        else {
            window.setTimeout(() => {
                var _a;
                (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.addListener(key, (data) => {
                    console.log("state tore update", key);
                    notify(data);
                });
            }, 100);
            // throw new Error("attempted to call framelink before it was ready");
        }
    };
    const removeListener = (key) => {
        var _a;
        _unSubscribe(key);
        (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.removeListener(key);
    };
    const useSubscribe = (key) => {
        return _useSubscribe(key);
    };
    const unSubscribe = (key) => {
        _unSubscribe(key);
    };
    (0, react_1.useEffect)(() => {
        // frameLink.current = FrameLink((connected) => {
        //   setConnected(connected);
        // });
        setReady(true);
    }, []);
    return ((0, jsx_runtime_1.jsx)(exports.FrameLinkContext.Provider, { value: {
            useSubscribe,
            useAddListener,
            usePostMessage,
            postMessage,
            unSubscribe,
            registerTarget: (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.registerTarget,
            removeListener,
            ready,
            connected,
        }, children: children }));
}
exports.default = FrameLinkProviderInternal;
//# sourceMappingURL=FrameLinkProviderInternal.js.map