import type { MessageRegistry } from "frame-link";
import { useContext } from "react";
import { FrameLinkContext } from "../provider/context.js";
import type { FrameLinkContextValue } from "../provider/types.js";

/**
 * Internal hook to access the FrameLink context.
 * Throws an error if used outside of a FrameLinkProvider.
 *
 * @internal
 */
export function useFrameLinkContext<
  TRegistry extends MessageRegistry,
>(): FrameLinkContextValue<TRegistry> {
  const context = useContext(FrameLinkContext);

  if (context === null) {
    throw new Error(
      "useFrameLinkContext must be used within a FrameLinkProvider",
    );
  }

  return context as unknown as FrameLinkContextValue<TRegistry>;
}
