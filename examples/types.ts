import type { MessageDefinition, MessageRegistry } from "frame-link";

/**
 * Shared message registry for parent and iframe communication.
 * Define your message contracts here.
 */
export interface AppMessages extends MessageRegistry {
  "user:get": MessageDefinition<{ id: string }, { name: string; email: string }>;
  "user:update": MessageDefinition<{ id: string; name: string }, { success: boolean }>;
  "notification:show": MessageDefinition<{ message: string; type: "info" | "error" }, void>;
}
