import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { FrameLinkProvider } from "../provider/FrameLinkProvider.js";
import { useConnection } from "../hooks/useConnection.js";
import {
  GetUserPanel,
  NotificationBanner,
} from "../../examples/demo/parent-app.js";
import {
  SendNotificationButton,
  UserGetResponder,
} from "../../examples/demo/iframe-app.js";
import type { SampleMessages } from "../../examples/sample-registry.js";

/**
 * End-to-end round-trip test for the runnable demo (FLINK-T-0012).
 *
 * Strategy (a): mount BOTH the parent and the iframe FrameLink provider trees
 * in the same jsdom document and bridge their `postMessage`/`message` routing.
 *
 * jsdom does not run a real embedded iframe, so `iframe.contentWindow` never
 * hosts the demo's iframe app. Instead we render the demo's real subcomponents
 * (`GetUserPanel`, `NotificationBanner` from the parent app; `UserGetResponder`,
 * `SendNotificationButton` from the iframe app) under two providers and wire a
 * pair of fake target windows so each side's `postMessage` is delivered to the
 * other side's `message` listener.
 *
 * Directional routing is achieved via origins: each provider validates incoming
 * messages against the *other* side's origin, and each fake target stamps
 * messages with the *sender's* origin. This guarantees a side never handles the
 * messages it posted itself (which would otherwise happen because both
 * listeners live on the same jsdom `window`).
 */

const PARENT_ORIGIN = "https://parent.example";
const IFRAME_ORIGIN = "https://iframe.example";

/**
 * Builds a fake target `Window` whose `postMessage` re-dispatches the message on
 * the shared jsdom `window` as a `MessageEvent`, stamped with `senderOrigin`.
 */
function createBridgeTarget(senderOrigin: string): Window {
  const target = {
    postMessage(data: unknown, _targetOrigin?: string): void {
      const event = new MessageEvent("message", {
        data,
        origin: senderOrigin,
      });
      window.dispatchEvent(event);
    },
  };
  return target as unknown as Window;
}

/** Parent side: connects to the iframe, then renders the real demo panels. */
function ParentHarness({ target }: { target: Window }): React.JSX.Element {
  const { connect, connected } = useConnection();

  useEffect((): void => {
    void connect(target);
  }, [connect, target]);

  return (
    <div>
      <p data-testid="parent-status">
        {connected ? "parent: connected" : "parent: disconnected"}
      </p>
      {connected && (
        <>
          <GetUserPanel />
          <NotificationBanner />
        </>
      )}
    </div>
  );
}

/** Iframe side: connects to the parent, then renders the real demo responders. */
function IframeHarness({ target }: { target: Window }): React.JSX.Element {
  const { connect, connected } = useConnection();

  useEffect((): void => {
    void connect(target);
  }, [connect, target]);

  const noop = (): void => {
    // logging is not needed for the round-trip assertions
  };

  return (
    <div>
      <p data-testid="iframe-status">
        {connected ? "iframe: connected" : "iframe: disconnected"}
      </p>
      {connected && (
        <>
          <UserGetResponder onLog={noop} />
          <SendNotificationButton onLog={noop} />
        </>
      )}
    </div>
  );
}

function DemoUnderTest(): React.JSX.Element {
  // Each side targets the OTHER side and validates the OTHER side's origin.
  const parentTarget = createBridgeTarget(PARENT_ORIGIN);
  const iframeTarget = createBridgeTarget(IFRAME_ORIGIN);

  return (
    <>
      <FrameLinkProvider<SampleMessages>
        options={{ targetOrigin: IFRAME_ORIGIN, timeout: 2000 }}
      >
        <ParentHarness target={parentTarget} />
      </FrameLinkProvider>
      <FrameLinkProvider<SampleMessages>
        options={{ targetOrigin: PARENT_ORIGIN, timeout: 2000 }}
      >
        <IframeHarness target={iframeTarget} />
      </FrameLinkProvider>
    </>
  );
}

describe("demo round-trip", () => {
  it("drives the handshake, a parent->iframe request, and an iframe->parent event", async () => {
    render(<DemoUnderTest />);

    // 1. Handshake completes on both sides.
    await waitFor(
      () => {
        expect(screen.getByTestId("parent-status")).toHaveTextContent(
          "parent: connected",
        );
        expect(screen.getByTestId("iframe-status")).toHaveTextContent(
          "iframe: connected",
        );
      },
      { timeout: 3000 },
    );

    // 2. Parent -> iframe typed request (user:get) renders the typed response.
    fireEvent.click(screen.getByRole("button", { name: /get user/i }));

    await waitFor(() => {
      expect(screen.getByTestId("user-result")).toHaveTextContent(
        "Got user: User 123 <user123@example.com>",
      );
    });

    // 3. Iframe -> parent typed event (notification:show) renders on the parent.
    fireEvent.click(
      screen.getByRole("button", { name: /send notification to parent/i }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-banner")).toHaveTextContent(
        "Notification from iframe: Hello from the iframe!",
      );
    });
  });
});
