import { TPostMessage, TRegisterTarget } from "frame-link";
import { ReactNode } from "react";
import { RecoilState } from "recoil";

export = FrameLinkReact;

declare namespace FrameLinkReact {
  /**
   * Defines a record of Recoil states indexed by string or number keys.
   */
  type Listeners<T> = {
    [key in keyof T]: Listener<T>;
  };

  type Listener<T> = RecoilState<T>;

  type ListenerKey = keyof Listeners<any>;

  type ListenerValue<T, K extends keyof T> = Listeners<T>[K];

  /**
   * Defines the structure of the FrameLink provider.
   */
  interface Context {
    useAddListener: (key: string) => void;
    useSubscribe: <T>(key: string) => T;
    unSubscribe: (key: string) => void;
    usePostMessage: (
      key: string
    ) => (data: any, callback: (data: any) => void) => void;
    postMessage: TPostMessage;
    removeListener: (key: string) => void;
    registerTarget: TRegisterTarget | undefined;
    ready: boolean;
    connected: boolean;
  }

  interface ProviderProps {
    children: React.ReactNode;
  }

  type Provider = ({ children }: ProviderProps) => JSX.Element;
}
