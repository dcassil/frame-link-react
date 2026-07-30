import React, { useRef, useState } from "react";
import {
  FrameLinkProvider,
  useConnection,
  useHandler,
  useSend,
} from "../../src/index.js";
import type { SampleMessages } from "../sample-registry.js";

/**
 * Runnable demo — PARENT page.
 *
 * Proves bidirectional, end-to-end typed messaging against the shared
 * `SampleMessages` registry (from sample-registry.ts):
 *  - parent -> iframe request:  `user:get`   (typed request/response)
 *  - iframe -> parent event:    `notification:show` (typed fire-and-forget)
 *
 * The connection handshake is driven from the iframe's `load` event, and the
 * request button is gated on `connected` so we never send before the handshake
 * completes.
 */
export default function ParentApp(): React.JSX.Element {
  return (
    // DEMO-ONLY: targetOrigin "*" is safe here ONLY because the parent and the
    // iframe are served from the same local origin (Vite dev server / preview).
    // NEVER use "*" in production — pin it to the exact child origin instead.
    <FrameLinkProvider<SampleMessages> options={{ targetOrigin: "*" }}>
      <ParentContent />
    </FrameLinkProvider>
  );
}

function ParentContent(): React.JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { connect, connected, connecting, error } = useConnection();

  // Connect to the iframe once it has loaded (its window is only usable then).
  const handleIframeLoad = async (): Promise<void> => {
    const contentWindow = iframeRef.current?.contentWindow;
    if (contentWindow !== null && contentWindow !== undefined) {
      try {
        await connect(contentWindow);
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>frame-link demo — Parent</h1>

      <ConnectionStatus
        connected={connected}
        connecting={connecting}
        error={error}
      />

      {/* parent -> iframe request, gated on a completed handshake */}
      {connected && <GetUserPanel />}

      {/* iframe -> parent event renders here */}
      <NotificationBanner />

      <iframe
        ref={iframeRef}
        src="/iframe.html"
        onLoad={() => void handleIframeLoad()}
        style={{
          width: "100%",
          height: "320px",
          border: "1px solid #ccc",
          marginTop: "16px",
        }}
        title="frame-link demo iframe"
      />
    </div>
  );
}

function ConnectionStatus({
  connected,
  connecting,
  error,
}: {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}): React.JSX.Element {
  if (connecting) {
    return <p style={{ color: "orange" }}>Status: connecting…</p>;
  }
  if (error !== null) {
    return <p style={{ color: "red" }}>Status: error — {error.message}</p>;
  }
  if (connected) {
    return <p style={{ color: "green" }}>Status: connected</p>;
  }
  return <p style={{ color: "gray" }}>Status: disconnected</p>;
}

export function GetUserPanel(): React.JSX.Element {
  const [userId, setUserId] = useState("123");
  const [result, setResult] = useState<string>("");

  // Fully typed against SampleMessages — payload/response inferred, no `any`.
  const sendGetUser = useSend<SampleMessages, "user:get">("user:get");

  const handleGetUser = async (): Promise<void> => {
    try {
      const user = await sendGetUser({ id: userId });
      setResult(`Got user: ${user.name} <${user.email}>`);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <h2>Parent → iframe request (user:get)</h2>
      <input
        value={userId}
        onChange={(e): void => setUserId(e.target.value)}
        placeholder="User ID"
      />
      <button onClick={() => void handleGetUser()} style={{ marginLeft: 8 }}>
        Get User
      </button>
      {result !== "" && <p data-testid="user-result">{result}</p>}
    </div>
  );
}

export function NotificationBanner(): React.JSX.Element | null {
  const [notification, setNotification] = useState<{
    message: string;
    type: "info" | "error";
  } | null>(null);

  // iframe -> parent event handler, typed against SampleMessages.
  useHandler<SampleMessages, "notification:show">(
    "notification:show",
    (payload): void => {
      setNotification(payload);
    }
  );

  if (notification === null) {
    return null;
  }

  return (
    <div
      data-testid="notification-banner"
      style={{
        padding: "10px",
        backgroundColor: notification.type === "error" ? "#fee" : "#eff",
        border: `1px solid ${notification.type === "error" ? "red" : "blue"}`,
        marginBottom: "10px",
      }}
    >
      Notification from iframe: {notification.message}
    </div>
  );
}
