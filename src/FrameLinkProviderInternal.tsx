import FrameLink, {
  TFrameLink,
  TPostMessage,
  TRegisterTarget,
  TRemoveListener,
} from "frame-link";
import { createContext, useEffect, useRef, useState } from "react";
import { atom, useSetRecoilState, useRecoilValue, RecoilState } from "recoil";

const atoms: Record<any, any> = {};

const createAtom = (key: any): RecoilState<any> => {
  let _atom = atom({
    key: key,
    default: {},
  });

  atoms[key] = _atom;

  return atoms[key];
};

const useNotify = (key: any) => {
  let _atom = atoms[key] || createAtom(key);
  let updater = useSetRecoilState(_atom);

  return (data: any) => updater((previous: any) => ({ ...previous, ...data }));
};

const _useSubscribe = (key: any) => {
  let _atom = atoms[key] || createAtom(key);

  return useRecoilValue(_atom);
};

const _unSubscribe = (key: any) => {
  if (atoms[key]) {
    delete atoms[key];
  }
};

export type TFrameLinkProvider = {
  useAddListener: (key: any) => void;
  useSubscribe: (key: any) => any;
  unSubscribe: (key: any) => any;
  usePostMessage: (
    key: any
  ) => (data: any, callback: (data: any) => void) => void;
  postMessage: TPostMessage;
  removeListener: TRemoveListener;
  registerTarget: TRegisterTarget | undefined;
  ready: boolean;
  connected: boolean;
};
export const FrameLinkContext = createContext({} as TFrameLinkProvider);

export default function FrameLinkProviderInternal({ children }: any) {
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const frameLink = useRef<TFrameLink | undefined>(
    FrameLink((connected) => {
      setConnected(connected);
    })
  );

  const usePostMessage = (key: any) => {
    const notify = useNotify(key);

    return (data: any, callback: (data: any) => void) => {
      frameLink.current?.postMessage(key, data, (data: any) => {
        notify(data);

        if (callback) {
          callback(data);
        }
      });
    };
  };

  const useAddListener = (key: string) => {
    const notify = useNotify(key);

    if (frameLink?.current) {
      frameLink.current.addListener(key, (data: any) => {
        console.log("state tore update", key);
        notify(data);
      });
    } else {
      window.setTimeout(() => {
        frameLink.current?.addListener(key, (data: any) => {
          console.log("state tore update", key);
          notify(data);
        });
      }, 100);
      // throw new Error("attempted to call framelink before it was ready");
    }
  };

  const removeListener = (key: any) => {
    _unSubscribe(key);
    frameLink.current?.removeListener(key);
  };

  const useSubscribe = (key: any) => {
    return _useSubscribe(key);
  };

  const unSubscribe = (key: any) => {
    _unSubscribe(key);
  };

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <FrameLinkContext.Provider
      value={{
        useSubscribe,
        useAddListener,
        usePostMessage,
        postMessage,
        unSubscribe,
        registerTarget: frameLink.current?.registerTarget,
        removeListener,
        ready,
        connected,
      }}
    >
      {children}
    </FrameLinkContext.Provider>
  );
}
