import type { MessageHandler, MessageRegistry, PayloadOf } from "frame-link";
import { useEffect, useRef } from "react";
import { useFrameLink } from "./useFrameLink.js";

/**
 * Hook to register a message handler that is automatically cleaned up on unmount.
 *
 * @param key - The message key to handle
 * @param handler - The handler function that receives the payload and returns a response
 *
 * @example
 * ```tsx
 * interface MyMessages extends MessageRegistry {
 *   'user:get': MessageDefinition<{ id: string }, { name: string }>;
 * }
 *
 * function UserHandler() {
 *   useHandler<MyMessages, 'user:get'>('user:get', async (payload) => {
 *     const user = await fetchUser(payload.id);
 *     return { name: user.name };
 *   });
 *
 *   return null;
 * }
 * ```
 */
export function useHandler<
  TRegistry extends MessageRegistry,
  TKey extends keyof TRegistry & string
>(
  key: TKey,
  handler: MessageHandler<TRegistry, TKey>
): void {
  const frameLink = useFrameLink<TRegistry>();
  const handlerRef = useRef(handler);

  useEffect((): void => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect((): (() => void) => {
    const wrappedHandler: MessageHandler<TRegistry, TKey> = (
      payload: PayloadOf<TRegistry, TKey>
    ): ReturnType<MessageHandler<TRegistry, TKey>> => {
      return handlerRef.current(payload);
    };

    const unsubscribe = frameLink.on(key, wrappedHandler);

    return unsubscribe;
  }, [frameLink, key]);
}
