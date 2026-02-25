import type { MessageRegistry } from "frame-link";
import { useFrameLinkContext } from "./useFrameLinkContext.js";

/**
 * Return type for the useConnection hook.
 */
export interface UseConnectionResult {
  /** Whether the connection has been established */
  connected: boolean;
  /** Whether a connection attempt is in progress */
  connecting: boolean;
  /** Error from the most recent connection attempt, if any */
  error: Error | null;
  /** Connect to a target window (iframe.contentWindow or window.parent) */
  connect: (target: Window) => Promise<void>;
}

/**
 * Hook to access connection state and the connect function.
 *
 * @example
 * ```tsx
 * function ParentComponent() {
 *   const { connect, connected, connecting, error } = useConnection();
 *   const iframeRef = useRef<HTMLIFrameElement>(null);
 *
 *   const handleIframeLoad = async () => {
 *     if (iframeRef.current?.contentWindow) {
 *       await connect(iframeRef.current.contentWindow);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {connecting && <p>Connecting...</p>}
 *       {connected && <p>Connected!</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       <iframe ref={iframeRef} onLoad={handleIframeLoad} src="..." />
 *     </div>
 *   );
 * }
 * ```
 */
export function useConnection(): UseConnectionResult {
  const { connected, connecting, error, connect } = useFrameLinkContext<MessageRegistry>();

  return {
    connected,
    connecting,
    error,
    connect,
  };
}
