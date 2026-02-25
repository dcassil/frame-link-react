import type { MessageRegistry } from "frame-link";
import { createContext } from "react";
import type { FrameLinkContextValue } from "./types.js";

/**
 * React context for FrameLink.
 *
 * This context is generic over the message registry type, but we use
 * MessageRegistry as the base type here. The actual type is enforced
 * at the provider and hook level.
 */
export const FrameLinkContext = createContext<FrameLinkContextValue<MessageRegistry> | null>(null);

FrameLinkContext.displayName = "FrameLinkContext";
