import React, { useEffect, useState } from "react";
import {
  FrameLinkProvider,
  useConnection,
  useHandler,
  useSend,
} from "../../src/index.js";
import type { SampleMessages } from "../sample-registry.js";

/**
 * Runnable demo — IFRAME page.
 *
 * Sets up its own FrameLinkProvider pointed at `window.parent`, answers the
 * parent's typed `user:get` request, and emits a typed `notification:show`
 * event up to the parent. Typed end-to-end against SampleMessages, no `any`.
 */
export default function IframeApp(): React.JSX.Element {
  return (
    // DEMO-ONLY: targetOrigin "*" is safe here ONLY because parent + iframe are
    // served from the same local origin. NEVER use "*" in production — pin it
    // to the exact parent origin instead.
    <FrameLinkProvider<SampleMessages> options={{ targetOrigin: "*" }}>
      <IframeContent />
    </FrameLinkProvider>
  );
}

function IframeContent(): React.JSX.Element {
  const { connect, connected, connecting, error } = useConnection();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string): void => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // The iframe connects to its parent as soon as it mounts.
  useEffect((): void => {
    const connectToParent = async (): Promise<void> => {
      try {
        await connect(window.parent);
        addLog("Connected to parent");
      } catch (err) {
        addLog(
          `Connection failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    };

    void connectToParent();
  }, [connect]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>frame-link demo — Iframe</h1>

      <ConnectionStatus
        connected={connected}
        connecting={connecting}
        error={error}
      />

      {connected && (
        <>
          <UserGetResponder onLog={addLog} />
          <SendNotificationButton onLog={addLog} />
        </>
      )}

      <h3>Activity log</h3>
      <ul style={{ maxHeight: "160px", overflow: "auto" }}>
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
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
    return <p style={{ color: "orange" }}>Status: connecting to parent…</p>;
  }
  if (error !== null) {
    return <p style={{ color: "red" }}>Status: error — {error.message}</p>;
  }
  if (connected) {
    return <p style={{ color: "green" }}>Status: connected to parent</p>;
  }
  return <p style={{ color: "gray" }}>Status: disconnected</p>;
}

export function UserGetResponder({
  onLog,
}: {
  onLog: (message: string) => void;
}): React.JSX.Element | null {
  // Handle the parent's typed request; the returned value is type-checked
  // against SampleMessages["user:get"]'s response.
  useHandler<SampleMessages, "user:get">("user:get", async (payload) => {
    onLog(`Received user:get for id: ${payload.id}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      name: `User ${payload.id}`,
      email: `user${payload.id}@example.com`,
    };
  });

  return null;
}

export function SendNotificationButton({
  onLog,
}: {
  onLog: (message: string) => void;
}): React.JSX.Element {
  const sendNotification = useSend<SampleMessages, "notification:show">(
    "notification:show"
  );

  const handleClick = async (): Promise<void> => {
    await sendNotification({ message: "Hello from the iframe!", type: "info" });
    onLog("Sent notification:show to parent");
  };

  return (
    <button onClick={() => void handleClick()} style={{ marginTop: "10px" }}>
      Send notification to parent
    </button>
  );
}
