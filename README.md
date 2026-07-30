# frame-link-react

React bindings for [`frame-link`](../frame-link-ts/README.md) — type-safe, bidirectional parent↔iframe messaging via a Context provider and a set of focused hooks.

This package wraps the core `frame-link` library in React context so components can send and handle messages without manually managing the `FrameLink` instance lifecycle.

---

## Installation

`frame-link` is a **peer dependency** and must be installed alongside this package:

```bash
npm install frame-link frame-link-react
# or
yarn add frame-link frame-link-react
```

**Peer requirements:** React 18 or later.

---

## Provider setup

Wrap the subtree that needs cross-frame messaging with `FrameLinkProvider`. The provider is generic over your message registry so all hooks inside it are fully typed.

```tsx
import { FrameLinkProvider } from "frame-link-react";
import type { SampleMessages } from "./sample-registry";

export default function App() {
  return (
    <FrameLinkProvider<SampleMessages>
      options={{ targetOrigin: "https://your-iframe-origin.example.com" }}
    >
      <YourComponent />
    </FrameLinkProvider>
  );
}
```

### `FrameLinkProviderProps`

| Prop | Type | Description |
|------|------|-------------|
| `options` | `FrameLinkOptions` | Passed directly to `createFrameLink`. Must include `targetOrigin`. |
| `children` | `ReactNode` | The subtree that can access the provider's hooks. |

The provider creates and owns a single `FrameLink` instance. It tears it down (`destroy()`) when `options` changes or the provider unmounts. You do not need to manage the instance manually.

---

## Hooks reference

All hooks must be called inside a `FrameLinkProvider`. They infer types from the same `TRegistry` the provider was instantiated with.

### `useConnection()`

Returns connection state and a `connect` function.

```ts
function useConnection(): UseConnectionResult
```

**`UseConnectionResult`**

| Field | Type | Description |
|-------|------|-------------|
| `connect` | `(target: Window) => Promise<void>` | Initiate a connection to a target window (e.g. `iframe.contentWindow` or `window.parent`). |
| `connected` | `boolean` | `true` once the handshake has completed. |
| `connecting` | `boolean` | `true` while the handshake is in progress. |
| `error` | `Error \| null` | Set if the most recent connection attempt failed. |

```tsx
const { connect, connected, connecting, error } = useConnection();
```

### `useSend<TRegistry, TKey>(key)`

Returns a memoized, type-safe sender for the given message key.

```ts
function useSend<
  TRegistry extends MessageRegistry,
  TKey extends keyof TRegistry & string,
>(key: TKey): SendFunction<TRegistry, TKey>
```

`SendFunction<TRegistry, TKey>` has the shape:

```ts
(payload: PayloadOf<TRegistry, TKey>) => Promise<ResponseOf<TRegistry, TKey>>
```

```tsx
const sendGetUser = useSend<SampleMessages, "user:get">("user:get");

const user = await sendGetUser({ id: "123" });
// user is typed as { name: string; email: string }
```

### `useHandler<TRegistry, TKey>(key, handler)`

Registers a handler for incoming messages on `key`. The handler is automatically unregistered when the component unmounts.

```ts
function useHandler<
  TRegistry extends MessageRegistry,
  TKey extends keyof TRegistry & string,
>(key: TKey, handler: MessageHandler<TRegistry, TKey>): void
```

The handler receives `PayloadOf<TRegistry, TKey>` and must return `ResponseOf<TRegistry, TKey>` (sync or async).

```tsx
useHandler<SampleMessages, "user:get">("user:get", async (payload) => {
  const user = await db.getUser(payload.id);
  return { name: user.name, email: user.email };
});
```

### `useFrameLink<TRegistry>()`

Returns the raw `FrameLink<TRegistry>` instance for advanced use cases. Prefer the purpose-built hooks above for normal usage.

```ts
function useFrameLink<TRegistry extends MessageRegistry>(): FrameLink<TRegistry>
```

Throws if called outside a provider.

---

## Component example

The following shows a minimal typed integration using the `SampleMessages` registry. This is the same pattern used in [`examples/parent.tsx`](./examples/parent.tsx) and [`examples/iframe.tsx`](./examples/iframe.tsx).

### Shared registry (`sample-registry.ts`)

```ts
import type { MessageDefinition, MessageRegistry } from "frame-link";

export interface SampleMessages extends MessageRegistry {
  "user:get": MessageDefinition<{ id: string }, { name: string; email: string }>;
  "user:update": MessageDefinition<{ id: string; name: string }, { success: boolean }>;
  "notification:show": MessageDefinition<
    { message: string; type: "info" | "error" },
    void
  >;
}
```

### Parent side

```tsx
import React, { useRef } from "react";
import { FrameLinkProvider, useConnection, useSend, useHandler } from "frame-link-react";
import type { SampleMessages } from "./sample-registry";

export default function ParentApp() {
  return (
    // Use your iframe's exact origin here — never "*" in production.
    <FrameLinkProvider<SampleMessages>
      options={{ targetOrigin: "https://your-iframe-origin.example.com" }}
    >
      <ParentContent />
    </FrameLinkProvider>
  );
}

function ParentContent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { connect, connected, connecting, error } = useConnection();

  const handleIframeLoad = async () => {
    const contentWindow = iframeRef.current?.contentWindow;
    if (contentWindow) {
      await connect(contentWindow);
    }
  };

  return (
    <div>
      {connecting && <p>Connecting…</p>}
      {error && <p>Error: {error.message}</p>}
      {connected && <UserPanel />}
      <NotificationReceiver />
      <iframe
        ref={iframeRef}
        src="https://your-iframe-origin.example.com"
        onLoad={() => void handleIframeLoad()}
      />
    </div>
  );
}

function UserPanel() {
  const sendGetUser = useSend<SampleMessages, "user:get">("user:get");

  const handleClick = async () => {
    const user = await sendGetUser({ id: "123" });
    console.log(user.name, user.email);
  };

  return <button onClick={() => void handleClick()}>Get user</button>;
}

function NotificationReceiver() {
  useHandler<SampleMessages, "notification:show">(
    "notification:show",
    (payload) => {
      console.log(`[${payload.type}] ${payload.message}`);
    }
  );
  return null;
}
```

### Iframe side

```tsx
import React, { useEffect } from "react";
import { FrameLinkProvider, useConnection, useHandler, useSend } from "frame-link-react";
import type { SampleMessages } from "./sample-registry";

export default function IframeApp() {
  return (
    <FrameLinkProvider<SampleMessages>
      options={{ targetOrigin: "https://your-parent-origin.example.com" }}
    >
      <IframeContent />
    </FrameLinkProvider>
  );
}

function IframeContent() {
  const { connect, connected } = useConnection();

  useEffect(() => {
    void connect(window.parent);
  }, [connect]);

  return connected ? <Handlers /> : <p>Connecting…</p>;
}

function Handlers() {
  // Handle user:get requests from the parent.
  useHandler<SampleMessages, "user:get">("user:get", async (payload) => {
    return { name: `User ${payload.id}`, email: `${payload.id}@example.com` };
  });

  // Send a notification to the parent.
  const sendNotification = useSend<SampleMessages, "notification:show">(
    "notification:show"
  );

  return (
    <button onClick={() => void sendNotification({ message: "Hello!", type: "info" })}>
      Notify parent
    </button>
  );
}
```

---

## Connection-status usage

Destructure `connected`, `connecting`, and `error` from `useConnection` to drive UI state:

```tsx
function StatusBadge() {
  const { connected, connecting, error } = useConnection();

  if (connecting) return <span className="badge badge-warning">Connecting…</span>;
  if (error)      return <span className="badge badge-error">Error: {error.message}</span>;
  if (connected)  return <span className="badge badge-success">Connected</span>;
  return <span className="badge badge-neutral">Disconnected</span>;
}
```

---

## Security

**Always supply an explicit `targetOrigin`.** Using `"*"` disables the browser's origin check and allows any page to receive your messages.

```tsx
// Good — messages go only to the expected origin.
<FrameLinkProvider<SampleMessages>
  options={{ targetOrigin: "https://trusted-iframe.example.com" }}
>

// Bad — never use in production.
<FrameLinkProvider<SampleMessages>
  options={{ targetOrigin: "*" }} // demo-only, do not copy
>
```

> The files in `examples/parent.tsx` and `examples/iframe.tsx` use `targetOrigin: "*"` for local development convenience only. Do not copy that setting into production code.

For a full discussion of the origin-validation model, replay-attack mitigations, and CSP recommendations, see the **Security** section of the [frame-link README](../frame-link-ts/README.md).
