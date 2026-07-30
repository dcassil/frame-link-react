import type { FrameLink, FrameLinkOptions, MessageRegistry } from "frame-link";
import type { ReactNode } from "react";

/**
 * Connection status states for the FrameLink instance.
 */
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

/**
 * Internal state managed by the connection reducer.
 */
export interface ConnectionState {
  status: ConnectionStatus;
  error: Error | null;
}

/**
 * Actions for the connection state reducer.
 */
export type ConnectionAction =
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS" }
  | { type: "CONNECT_ERROR"; error: Error }
  | { type: "DISCONNECT" };

/**
 * The value provided by FrameLinkContext.
 */
export interface FrameLinkContextValue<TRegistry extends MessageRegistry> {
  /** The FrameLink instance, null if not yet initialized */
  frameLink: FrameLink<TRegistry> | null;
  /** Whether the connection has been established */
  connected: boolean;
  /** Whether a connection attempt is in progress */
  connecting: boolean;
  /** Error from the most recent connection attempt, if any */
  error: Error | null;
  /** Connect to a target window */
  connect: (target: Window) => Promise<void>;
}

/**
 * Props for the FrameLinkProvider component.
 */
export interface FrameLinkProviderProps {
  children: ReactNode;
  /** Configuration options passed to createFrameLink */
  options: FrameLinkOptions;
}
