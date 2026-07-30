import type { MessageDefinition, MessageRegistry } from "frame-link";

/**
 * Canonical sample message registry for frame-link documentation and demos.
 *
 * Domain: "user" — a generic user-management domain used to illustrate
 * typed request/response and fire-and-forget event patterns.
 *
 * Downstream consumers (docs-snippets.ts, the runnable demo, README snippets)
 * all import from this file so every example stays in sync.
 */
export interface SampleMessages extends MessageRegistry {
  /** Fetch a user by ID. Returns the user's name and email. */
  "user:get": MessageDefinition<{ id: string }, { name: string; email: string }>;

  /** Update a user's display name. Returns whether the update succeeded. */
  "user:update": MessageDefinition<
    { id: string; name: string },
    { success: boolean }
  >;

  /**
   * Fire-and-forget notification event.
   * The sender does not wait for a meaningful response (void).
   */
  "notification:show": MessageDefinition<
    { message: string; type: "info" | "error" },
    void
  >;
}

// Re-export AppMessages under its original name so existing parent.tsx /
// iframe.tsx imports (which use `types.ts`) continue to compile unchanged.
// types.ts itself is left in place; this registry is the new canonical source.
export type { AppMessages } from "./types.js";
