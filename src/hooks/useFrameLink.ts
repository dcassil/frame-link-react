import type { FrameLink, MessageRegistry } from "frame-link";
import { useFrameLinkContext } from "./useFrameLinkContext.js";

/**
 * Hook to access the raw FrameLink instance.
 *
 * @throws Error if used outside of a FrameLinkProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const frameLink = useFrameLink<MyMessages>();
 *
 *   // Access the raw instance for advanced use cases
 *   console.log('Connected:', frameLink.connected);
 * }
 * ```
 */
export function useFrameLink<
  TRegistry extends MessageRegistry,
>(): FrameLink<TRegistry> {
  const { frameLink } = useFrameLinkContext<TRegistry>();

  if (frameLink === null) {
    throw new Error(
      "FrameLink instance not initialized - this should not happen",
    );
  }

  return frameLink;
}
