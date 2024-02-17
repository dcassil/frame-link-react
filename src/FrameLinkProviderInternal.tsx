// FrameLinkProvider.tsx
import { useEffect, useRef, useState } from "react";
import { atom, useSetRecoilState, useRecoilValue } from "recoil";
import FrameLink, { TFrameLink } from "frame-link";
import FrameLinkReact from "./types";
import { FrameLinkContext } from "./FrameLinkProvider";

/**
 * Initializes a record of Recoil atoms.
 */
const listeners: Record<
  FrameLinkReact.ListenerKey,
  FrameLinkReact.Listener<any>
> = {};

/**
 * Creates and adds a listener to the store.
 * @param key - The key to listen to.
 * @returns The newly created listeners.
 */
function createListener<T>(
  key: FrameLinkReact.ListenerKey
): FrameLinkReact.Listener<T> {
  listeners[key] = atom<FrameLinkReact.ListenerValue<T, any>>({
    key: String(key),
    default: {} as any,
  });

  return listeners[key] as FrameLinkReact.Listener<T>;
}

/**
 * Returns an updater function for a given key.
 * @param key - The key to notify on.
 * @returns Function to notify a given key with a payload.
 */
function useNotify<T>(key: FrameLinkReact.ListenerKey) {
  const updater = useSetRecoilState<T>(
    listeners[key] || createListener<T>(key)
  );

  return (data: T) => updater((previous: T) => ({ ...previous, ...data } as T));
}

/**
 * Subscribe to a given key, any time a new value is sent the component will re-render.
 * @param key - The key to identify the Recoil state.
 * @returns payload sent via useNotify.
 */
function useSubscribe<T>(key: FrameLinkReact.ListenerKey): T {
  return useRecoilValue<T>(listeners[key] || createListener<T>(key));
}

/**
 * Unsubscribes a listener.
 * @param key - The key to identify the Listener.
 */
function unSubscribe(key: FrameLinkReact.ListenerKey): void {
  if (listeners[key]) {
    delete listeners[key];
  }
}

/**
 * FrameLinkProvider component.
 */
const FrameLinkProvider: FrameLinkReact.Provider = ({
  children,
}: FrameLinkReact.ProviderProps) => {
  const [ready, setReady] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const frameLink = useRef<TFrameLink>();

  // Initialize FrameLink connection
  useEffect(() => {
    frameLink.current = FrameLink((connected) => {
      setConnected(connected);
    });
  }, []);

  // Custom hook to post messages via FrameLink
  function usePostMessage<T>(key: string) {
    const notify = useNotify(key);

    return (data: T, callback: (data: T) => void) => {
      frameLink.current?.postMessage(key, data, (data: T) => {
        notify(data);

        if (callback) {
          callback(data);
        }
      });
    };
  }

  // Custom hook to add listener for a specific key
  function useAddListener<T>(key: string) {
    const notify = useNotify<T>(key);

    useEffect(() => {
      const listener = (data: T) => {
        notify(data);
      };

      // Delay listener registration to allow frameLink to setup
      const delay = frameLink?.current ? 0 : 100;
      const timeout = window.setTimeout(() => {
        frameLink.current?.addListener(key, listener);
      }, delay);

      return () => clearTimeout(timeout);
    }, [key, notify]);
  }

  // Remove listener for a specific key
  const removeListener = (key: FrameLinkReact.ListenerKey) => {
    unSubscribe(key);
    frameLink.current?.removeListener({ key: String(key) });
  };

  // Set ready state after initialization
  useEffect(() => {
    setReady(true);
  }, []);

  // Provide FrameLink context to children components
  return (
    <FrameLinkContext.Provider
      value={{
        useSubscribe,
        useAddListener,
        usePostMessage,
        postMessage: frameLink.current?.postMessage!,
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
};

export default FrameLinkProvider;
