// Provider
export {
  FrameLinkContext,
  FrameLinkProvider,
  type ConnectionAction,
  type ConnectionState,
  type ConnectionStatus,
  type FrameLinkContextValue,
  type FrameLinkProviderProps,
} from "./provider/index.js";

// Hooks
export {
  useConnection,
  useFrameLink,
  useHandler,
  useSend,
  type SendFunction,
  type UseConnectionResult,
} from "./hooks/index.js";

// Re-export frame-link types for convenience
export type {
  FrameLink,
  FrameLinkOptions,
  MessageDefinition,
  MessageHandler,
  MessageRegistry,
  PayloadOf,
  ResponseOf,
} from "frame-link";
