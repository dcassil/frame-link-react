import type {
  MessageRegistry,
  PayloadOf,
  ResponseOf,
} from "frame-link";
import { useCallback } from "react";
import { useFrameLink } from "./useFrameLink.js";

/**
 * The sender function type returned by useSend.
 */
export type SendFunction<
  TRegistry extends MessageRegistry,
  TKey extends keyof TRegistry & string
> = (payload: PayloadOf<TRegistry, TKey>) => Promise<ResponseOf<TRegistry, TKey>>;

/**
 * Hook to create a type-safe message sender for a specific message key.
 *
 * @param key - The message key to send
 * @returns A memoized function to send messages of this type
 *
 * @example
 * ```tsx
 * interface MyMessages extends MessageRegistry {
 *   'user:get': MessageDefinition<{ id: string }, { name: string }>;
 * }
 *
 * function GetUserButton({ userId }: { userId: string }) {
 *   const sendGetUser = useSend<MyMessages, 'user:get'>('user:get');
 *
 *   const handleClick = async () => {
 *     const user = await sendGetUser({ id: userId });
 *     console.log('User name:', user.name);
 *   };
 *
 *   return <button onClick={handleClick}>Get User</button>;
 * }
 * ```
 */
export function useSend<
  TRegistry extends MessageRegistry,
  TKey extends keyof TRegistry & string
>(key: TKey): SendFunction<TRegistry, TKey> {
  const frameLink = useFrameLink<TRegistry>();

  const send = useCallback(
    async (payload: PayloadOf<TRegistry, TKey>): Promise<ResponseOf<TRegistry, TKey>> => {
      return await frameLink.send(key, payload);
    },
    [frameLink, key]
  );

  return send;
}
