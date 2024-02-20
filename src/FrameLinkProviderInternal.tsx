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
 * Creates and adds a listener to the store if it does not exist.
 * @param key - The key to listen to.
 * @returns The newly created listeners.
 */
function createListenerIfNotExists<T>(
  key: FrameLinkReact.ListenerKey
): FrameLinkReact.Listener<T> {
  if (doesListenerExist(key)) return getListener(key);

  setListener(
    key,
    atom<FrameLinkReact.ListenerValue<T, any>>({
      key: String(key),
      default: {} as FrameLinkReact.Listener<T>,
    })
  );

  return getListener(key);
}

/**
 * Delete listenr if it exists.
 * @param key - The key to listen to.
 * @returns void.
 */
function deleteListenerIfExists<T>(key: FrameLinkReact.ListenerKey): void {
  if (doesListenerExist(key)) delete listeners[key];
}

/**
 * Get listenr if it exists.
 * @param key - The key to listen to.
 * @returns The listener.
 */
function getListener<T>(key: FrameLinkReact.ListenerKey) {
  return listeners[key] as FrameLinkReact.Listener<T>;
}

/**
 * Set listenr.
 * @param key - The key to listen to.
 * @returns void.
 */
function setListener<T>(
  key: FrameLinkReact.ListenerKey,
  listener: FrameLinkReact.Listener<T>
) {
  listeners[key] = listener;
}

/**
 * Check if listener has already been added.
 * @param key - The key to identify the Listener.
 */
function doesListenerExist(key: FrameLinkReact.ListenerKey): boolean {
  return !!listeners[key];
}

/**
 * Returns an updater function for a given key.
 * @param key - The key to notify on.
 * @returns Function to notify a given key with a payload.
 */
function useNotify<T>(key: FrameLinkReact.ListenerKey) {
  const listener = createListenerIfNotExists<T>(key);
  const updater = useSetRecoilState<T>(listener);

  return (data: T) => updater((previous: T) => ({ ...previous, ...data } as T));
}

/**
 * Unsubscribes a listener if it exists.
 * @param key - The key to identify the Listener.
 */
function unSubscribe(key: FrameLinkReact.ListenerKey): void {
  deleteListenerIfExists(key);
}

/**
 * FrameLinkProvider component.
 * @param children - ReactNode
 * @param origin - allowed origin of other frame.  Default: '*'
 */
const FrameLinkProvider: FrameLinkReact.Provider = ({
  children,
  targetOrigin,
}: FrameLinkReact.ProviderProps) => {
  const [ready, setReady] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const frameLink = useRef<TFrameLink>();

  // Initialize FrameLink connection
  useEffect(() => {
    frameLink.current = FrameLink(
      () => {
        setConnected(true);
      },
      { targetOrigin: targetOrigin }
    );
  }, []);

  /**
   * Send a message to the other frame ( parent or iframe ).
   * @param key - The key to identify the Listener.
   * @returns A notify function to call with data to send the other frame and an optional callback
   * @returns (data: any, callback?: (response: any)) => void
   */
  function usePostMessage<T>(key: string) {
    return (data: T, callback?: (data: T) => void) => {
      frameLink.current?.postMessage(key, data, (data: T) => {
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
  function useSubscribe<T, K = any>(key: string, reply?: (data: T) => K) {
    const notify = useNotify<T>(key);
    const listener = (data: T) => {
      notify(data);
      return reply && reply(data);
    };

    if (frameLink.current && !frameLink.current.hasListener({ key })) {
      frameLink.current?.addListener(key, listener);
    }

    return useRecoilValue<T>(listeners[key]);
  }

  /**
   * Remove a listener, disables all subscibers for the given key.
   * @param key - The key to identify the Listener.
   */
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
