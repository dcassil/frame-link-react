"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// FrameLinkProvider.tsx
const react_1 = require("react");
const recoil_1 = require("recoil");
const frame_link_1 = __importDefault(require("frame-link"));
const FrameLinkProvider_1 = require("./FrameLinkProvider");
/**
 * Initializes a record of Recoil atoms.
 */
const listeners = {};
/**
 * Creates and adds a listener to the store.
 * @param key - The key to listen to.
 * @returns The newly created listeners.
 */
function createListener(key) {
    listeners[key] = (0, recoil_1.atom)({
        key: String(key),
        default: {},
    });
    return listeners[key];
}
/**
 * Returns an updater function for a given key.
 * @param key - The key to notify on.
 * @returns Function to notify a given key with a payload.
 */
function useNotify(key) {
    const updater = (0, recoil_1.useSetRecoilState)(listeners[key] || createListener(key));
    return (data) => updater((previous) => (Object.assign(Object.assign({}, previous), data)));
}
/**
 * Subscribe to a given key, any time a new value is sent the component will re-render.
 * @param key - The key to identify the Recoil state.
 * @returns payload sent via useNotify.
 */
function useSubscribe(key) {
    return (0, recoil_1.useRecoilValue)(listeners[key] || createListener(key));
}
/**
 * Unsubscribes a listener.
 * @param key - The key to identify the Listener.
 */
function unSubscribe(key) {
    if (listeners[key]) {
        delete listeners[key];
    }
}
/**
 * FrameLinkProvider component.
 */
const FrameLinkProvider = ({ children, }) => {
    var _a, _b;
    const [ready, setReady] = (0, react_1.useState)(false);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const frameLink = (0, react_1.useRef)();
    // Initialize FrameLink connection
    (0, react_1.useEffect)(() => {
        frameLink.current = (0, frame_link_1.default)((connected) => {
            setConnected(connected);
        });
    }, []);
    // Custom hook to post messages via FrameLink
    function usePostMessage(key) {
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
    }
    // Custom hook to add listener for a specific key
    function useAddListener(key) {
        const notify = useNotify(key);
        (0, react_1.useEffect)(() => {
            const listener = (data) => {
                notify(data);
            };
            // Delay listener registration to allow frameLink to setup
            const delay = (frameLink === null || frameLink === void 0 ? void 0 : frameLink.current) ? 0 : 100;
            const timeout = window.setTimeout(() => {
                var _a;
                (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.addListener(key, listener);
            }, delay);
            return () => clearTimeout(timeout);
        }, [key, notify]);
    }
    // Remove listener for a specific key
    const removeListener = (key) => {
        var _a;
        unSubscribe(key);
        (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.removeListener({ key: String(key) });
    };
    // Set ready state after initialization
    (0, react_1.useEffect)(() => {
        setReady(true);
    }, []);
    // Provide FrameLink context to children components
    return ((0, jsx_runtime_1.jsx)(FrameLinkProvider_1.FrameLinkContext.Provider, { value: {
            useSubscribe,
            useAddListener,
            usePostMessage,
            postMessage: (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.postMessage,
            unSubscribe,
            registerTarget: (_b = frameLink.current) === null || _b === void 0 ? void 0 : _b.registerTarget,
            removeListener,
            ready,
            connected,
        }, children: children }));
};
exports.default = FrameLinkProvider;
//# sourceMappingURL=FrameLinkProviderInternal.js.map