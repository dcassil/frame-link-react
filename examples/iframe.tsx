import React, { useEffect, useState } from "react";
import {
  FrameLinkProvider,
  useConnection,
  useHandler,
  useSend,
} from "../src/index";
import type { AppMessages } from "./types";

/**
 * Example: Iframe content that communicates with parent window.
 *
 * This demonstrates:
 * - Setting up FrameLinkProvider in an iframe
 * - Connecting to the parent window
 * - Handling incoming messages and returning responses
 * - Sending messages to the parent
 */
export default function IframeApp(): React.JSX.Element {
  return (
    <FrameLinkProvider<AppMessages> options={{ targetOrigin: "*" }}>
      <IframeContent />
    </FrameLinkProvider>
  );
}

function IframeContent(): React.JSX.Element {
  const { connect, connected, connecting, error } = useConnection<AppMessages>();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string): void => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect((): void => {
    const connectToParent = async (): Promise<void> => {
      try {
        await connect(window.parent);
        addLog("Connected to parent");
      } catch (err) {
        addLog(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    void connectToParent();
  }, [connect]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Iframe Content</h1>

      <ConnectionStatus
        connected={connected}
        connecting={connecting}
        error={error}
      />

      {connected && (
        <>
          <MessageHandlers onLog={addLog} />
          <SendNotificationButton />
        </>
      )}

      <h3>Activity Log</h3>
      <ul style={{ maxHeight: "200px", overflow: "auto" }}>
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
    return <p style={{ color: "orange" }}>Connecting to parent...</p>;
  }
  if (error !== null) {
    return <p style={{ color: "red" }}>Error: {error.message}</p>;
  }
  if (connected) {
    return <p style={{ color: "green" }}>Connected to parent!</p>;
  }
  return <p style={{ color: "gray" }}>Disconnected</p>;
}

function MessageHandlers({
  onLog,
}: {
  onLog: (message: string) => void;
}): React.JSX.Element | null {
  useHandler<AppMessages, "user:get">("user:get", async (payload) => {
    onLog(`Received user:get request for id: ${payload.id}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      name: `User ${payload.id}`,
      email: `user${payload.id}@example.com`,
    };
  });

  useHandler<AppMessages, "user:update">("user:update", async (payload) => {
    onLog(`Received user:update for id: ${payload.id}, name: ${payload.name}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  });

  return null;
}

function SendNotificationButton(): React.JSX.Element {
  const sendNotification = useSend<AppMessages, "notification:show">(
    "notification:show"
  );

  const handleClick = async (): Promise<void> => {
    await sendNotification({
      message: "Hello from iframe!",
      type: "info",
    });
  };

  return (
    <button onClick={() => void handleClick()} style={{ marginTop: "10px" }}>
      Send Notification to Parent
    </button>
  );
}
