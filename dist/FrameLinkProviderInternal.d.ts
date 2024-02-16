/// <reference types="react" />
import { TPostMessage, TRegisterTarget, TRemoveListener } from "frame-link";
export type TFrameLinkProvider = {
    useAddListener: (key: any) => void;
    useSubscribe: (key: any) => any;
    unSubscribe: (key: any) => any;
    usePostMessage: (key: any) => (data: any, callback: (data: any) => void) => void;
    postMessage: TPostMessage;
    removeListener: TRemoveListener;
    registerTarget: TRegisterTarget | undefined;
    ready: boolean;
    connected: boolean;
};
export declare const FrameLinkContext: import("react").Context<TFrameLinkProvider>;
export default function FrameLinkProviderInternal({ children }: any): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FrameLinkProviderInternal.d.ts.map