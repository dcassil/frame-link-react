import React, { useEffect, useRef, useState } from "react";
import {
  FrameLinkProvider,
  useConnection,
  useHandler,
  useSend,
} from "../src/index";
import type { AppMessages } from "./types";

/**
 * Example: Parent window component that embeds an iframe.
 *
 * This demonstrates:
 * - Setting up the FrameLinkProvider with options
 * - Connecting to an iframe when it loads
 * - Sending messages to the iframe
 * - Handling messages from the iframe
 */
export default function ParentApp(): React.JSX.Element {
  return (
    <FrameLinkProvider<AppMessages> options={{ targetOrigin: "*" }}>
      <ParentContent />
    </FrameLinkProvider>
  );
}

function ParentContent(): React.JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { connect, connected, connecting, error } = useConnection<AppMessages>();

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
    <div style={{ padding: "20px" }}>
      <h1>Parent Window</h1>

      <ConnectionStatus
        connected={connected}
        connecting={connecting}
        error={error}
      />

      {connected && <UserActions />}

      <NotificationHandler />

      <iframe
        ref={iframeRef}
        src="/iframe.html"
        onLoad={() => void handleIframeLoad()}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
        title="Child Frame"
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
    return <p style={{ color: "orange" }}>Connecting...</p>;
  }
  if (error !== null) {
    return <p style={{ color: "red" }}>Error: {error.message}</p>;
  }
  if (connected) {
    return <p style={{ color: "green" }}>Connected!</p>;
  }
  return <p style={{ color: "gray" }}>Disconnected</p>;
}

function UserActions(): React.JSX.Element {
  const [userId, setUserId] = useState("123");
  const [result, setResult] = useState<string>("");

  const sendGetUser = useSend<AppMessages, "user:get">("user:get");
  const sendUpdateUser = useSend<AppMessages, "user:update">("user:update");

  const handleGetUser = async (): Promise<void> => {
    try {
      const user = await sendGetUser({ id: userId });
      setResult(`Got user: ${user.name} (${user.email})`);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUpdateUser = async (): Promise<void> => {
    try {
      const response = await sendUpdateUser({ id: userId, name: "Updated Name" });
      setResult(`Update ${response.success ? "succeeded" : "failed"}`);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>User Actions</h2>
      <input
        value={userId}
        onChange={(e): void => setUserId(e.target.value)}
        placeholder="User ID"
      />
      <button onClick={() => void handleGetUser()}>Get User</button>
      <button onClick={() => void handleUpdateUser()}>Update User</button>
      {result !== "" && <p>Result: {result}</p>}
    </div>
  );
}

function NotificationHandler(): React.JSX.Element | null {
  const [notification, setNotification] = useState<{
    message: string;
    type: "info" | "error";
  } | null>(null);

  useHandler<AppMessages, "notification:show">(
    "notification:show",
    (payload): void => {
      setNotification(payload);
      setTimeout((): void => setNotification(null), 3000);
    }
  );

  if (notification === null) {
    return null;
  }

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: notification.type === "error" ? "#fee" : "#eff",
        border: `1px solid ${notification.type === "error" ? "red" : "blue"}`,
        marginBottom: "10px",
      }}
    >
      {notification.message}
    </div>
  );
}
