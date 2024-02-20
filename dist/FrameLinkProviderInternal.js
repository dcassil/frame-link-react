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
 * Creates and adds a listener to the store if it does not exist.
 * @param key - The key to listen to.
 * @returns The newly created listeners.
 */
function createListenerIfNotExists(key) {
    if (doesListenerExist(key))
        return getListener(key);
    setListener(key, (0, recoil_1.atom)({
        key: String(key),
        default: {},
    }));
    return getListener(key);
}
/**
 * Delete listenr if it exists.
 * @param key - The key to listen to.
 * @returns void.
 */
function deleteListenerIfExists(key) {
    if (doesListenerExist(key))
        delete listeners[key];
}
/**
 * Get listenr if it exists.
 * @param key - The key to listen to.
 * @returns The listener.
 */
function getListener(key) {
    return listeners[key];
}
/**
 * Set listenr.
 * @param key - The key to listen to.
 * @returns void.
 */
function setListener(key, listener) {
    listeners[key] = listener;
}
/**
 * Check if listener has already been added.
 * @param key - The key to identify the Listener.
 */
function doesListenerExist(key) {
    return !!listeners[key];
}
/**
 * Returns an updater function for a given key.
 * @param key - The key to notify on.
 * @returns Function to notify a given key with a payload.
 */
function useNotify(key) {
    const listener = createListenerIfNotExists(key);
    const updater = (0, recoil_1.useSetRecoilState)(listener);
    return (data) => updater((previous) => (Object.assign(Object.assign({}, previous), data)));
}
/**
 * Unsubscribes a listener if it exists.
 * @param key - The key to identify the Listener.
 */
function unSubscribe(key) {
    deleteListenerIfExists(key);
}
/**
 * FrameLinkProvider component.
 * @param children - ReactNode
 * @param origin - allowed origin of other frame.  Default: '*'
 */
const FrameLinkProvider = ({ children, targetOrigin, }) => {
    var _a, _b;
    const [ready, setReady] = (0, react_1.useState)(false);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const frameLink = (0, react_1.useRef)();
    // Initialize FrameLink connection
    (0, react_1.useEffect)(() => {
        frameLink.current = (0, frame_link_1.default)(() => {
            setConnected(true);
        }, { targetOrigin: targetOrigin });
    }, []);
    /**
     * Send a message to the other frame ( parent or iframe ).
     * @param key - The key to identify the Listener.
     * @returns A notify function to call with data to send the other frame and an optional callback
     * @returns (data: any, callback?: (response: any)) => void
     */
    function usePostMessage(key) {
        return (data, callback) => {
            var _a;
            (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.postMessage(key, data, (data) => {
                if (callback) {
                    callback(data);
                }
            });
        };
    }
    /**
     * Subscribe to a message from the other frame ( parent or iframe ).
     * @param key - The key to identify the Listener.
     * @param reply - Optional function that is passed the current value of the subscribed key
     * - It should return an object
     * - if usePostMessage / update was given a reply callback, it will be called with the data returned from the reply function
     * - - const updateKey = usePostMessage('key')
     * - - updateKey(data, (replyData) => {// get a reply back and do something with the data})
     * @returns the most recent value sent by the other frame.
     * @returns This will update and trigger a re-render when the value changes.
     */
    function useSubscribe(key, reply) {
        var _a;
        const notify = useNotify(key);
        const listener = (data) => {
            notify(data);
            return reply && reply(data);
        };
        if (frameLink.current && !frameLink.current.hasListener({ key })) {
            (_a = frameLink.current) === null || _a === void 0 ? void 0 : _a.addListener(key, listener);
        }
        return (0, recoil_1.useRecoilValue)(listeners[key]);
    }
    /**
     * Remove a listener, disables all subscibers for the given key.
     * @param key - The key to identify the Listener.
     */
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