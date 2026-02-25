import {
  createFrameLink,
  type FrameLink,
  type MessageRegistry,
} from "frame-link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { FrameLinkContext } from "./context.js";
import { connectionReducer, initialConnectionState } from "./reducer.js";
import type {
  FrameLinkContextValue,
  FrameLinkProviderProps,
} from "./types.js";

/**
 * Provider component that creates and manages a FrameLink instance.
 *
 * @example
 * ```tsx
 * interface MyMessages extends MessageRegistry {
 *   'user:get': MessageDefinition<{ id: string }, { name: string }>;
 * }
 *
 * function App() {
 *   return (
 *     <FrameLinkProvider options={{ targetOrigin: 'https://example.com' }}>
 *       <MyComponent />
 *     </FrameLinkProvider>
 *   );
 * }
 * ```
 */
export function FrameLinkProvider<TRegistry extends MessageRegistry>({
  children,
  options,
}: FrameLinkProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(connectionReducer, initialConnectionState);
  
  const [frameLink, setFrameLink] = useState<FrameLink<TRegistry>>(() => 
    createFrameLink<TRegistry>(options)
  );
  
  const optionsRef = useRef(options);

  useEffect((): (() => void) | undefined => {
    if (optionsRef.current === options) {
      return undefined;
    }
    
    optionsRef.current = options;
    frameLink.destroy();
    dispatch({ type: "DISCONNECT" });
    
    const newInstance = createFrameLink<TRegistry>(options);
    setFrameLink(newInstance);
    
    return undefined;
  }, [options, frameLink]);

  useEffect((): (() => void) => {
    return (): void => {
      frameLink.destroy();
    };
  }, [frameLink]);

  const connect = useCallback(async (target: Window): Promise<void> => {
    dispatch({ type: "CONNECT_START" });

    try {
      await frameLink.connect(target);
      dispatch({ type: "CONNECT_SUCCESS" });
    } catch (err: unknown) {
      const connectError = err instanceof Error ? err : new Error(String(err));
      dispatch({ type: "CONNECT_ERROR", error: connectError });
      throw connectError;
    }
  }, [frameLink]);

  const contextValue = useMemo((): FrameLinkContextValue<TRegistry> => ({
    frameLink,
    connected: state.status === "connected",
    connecting: state.status === "connecting",
    error: state.error,
    connect,
  }), [frameLink, state.status, state.error, connect]);

  return (
    <FrameLinkContext.Provider value={contextValue as unknown as FrameLinkContextValue<MessageRegistry>}>
      {children}
    </FrameLinkContext.Provider>
  );
}
