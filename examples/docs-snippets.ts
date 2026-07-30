/**
 * docs-snippets.ts — compile-only snippets for frame-link documentation.
 *
 * This file is NEVER executed at runtime. Its sole purpose is to let
 * `tsc --noEmit` prove that every snippet shown in the README compiles
 * against the real package types. Wrap bodies in exported async functions
 * so `await` is legal without top-level await.
 *
 * Each section is clearly labelled. The single `@ts-expect-error` near the
 * bottom is an intentional negative test — it asserts that the compiler
 * rejects a wrong payload type, actively proving compile-time safety.
 */

import { createFrameLink } from "frame-link";
import type { PayloadOf, ResponseOf } from "frame-link";
import type { SampleMessages } from "./sample-registry.js";

// ---------------------------------------------------------------------------
// Section 1 — Create a typed FrameLink instance
// ---------------------------------------------------------------------------

export async function snippetCreateLink(): Promise<void> {
  const link = createFrameLink<SampleMessages>({
    targetOrigin: "https://example.com",
  });

  // Section 2 — Typed request / response: user:get
  // link.send returns Promise<ResponseOf<SampleMessages, "user:get">>
  const user = await link.send("user:get", { id: "123" });

  // `user` is inferred as { name: string; email: string }
  const greeting = `Hello, ${user.name} — ${user.email}`;
  console.log(greeting);

  // Section 3 — Typed request / response: user:update
  const updateResult = await link.send("user:update", {
    id: "123",
    name: "Ada Lovelace",
  });

  // `updateResult` is inferred as { success: boolean }
  if (updateResult.success) {
    console.log("Update succeeded");
  }

  // Section 4 — Fire-and-forget event: notification:show
  // The handler receives void; do NOT await a meaningful value.
  link.on("notification:show", (payload) => {
    console.log(`[${payload.type}] ${payload.message}`);
    // No return value — response is void for this event.
  });

  // Send the event fire-and-forget style (still returns Promise<void>).
  void link.send("notification:show", { message: "Hello!", type: "info" });

  // Section 5 — Unsubscribe from a handler
  const unsubscribe = link.on("notification:show", (_payload) => {
    /* handler body */
  });
  unsubscribe();
}

// ---------------------------------------------------------------------------
// Section 6 — Using PayloadOf and ResponseOf utility types
// ---------------------------------------------------------------------------

// Derive the payload and result types from the registry without importing
// the concrete types directly — useful for consumers that only have access
// to the registry interface.
type GetUserPayload = PayloadOf<SampleMessages, "user:get">;
// => { id: string }

type GetUserResponse = ResponseOf<SampleMessages, "user:get">;
// => { name: string; email: string }

type ShowNotificationPayload = PayloadOf<SampleMessages, "notification:show">;
// => { message: string; type: "info" | "error" }

type ShowNotificationResponse = ResponseOf<SampleMessages, "notification:show">;
// => void

// Ensure the utility types are referenced so noUnusedLocals doesn't fire.
export type {
  GetUserPayload,
  GetUserResponse,
  ShowNotificationPayload,
  ShowNotificationResponse,
};

// ---------------------------------------------------------------------------
// Section 7 — Negative test: wrong payload type is rejected by the compiler
//
// The line below passes a number for `id` instead of a string.
// `@ts-expect-error` asserts the compiler MUST report an error here.
// If you remove the @ts-expect-error directive and re-run tsc --noEmit,
// tsc will error on this line — proof that the type guard is real.
// ---------------------------------------------------------------------------

export async function snippetNegativeTest(): Promise<void> {
  const link = createFrameLink<SampleMessages>({
    targetOrigin: "https://example.com",
  });

  // @ts-expect-error — id must be string, not number; this must fail to compile.
  await link.send("user:get", { id: 42 });
}
