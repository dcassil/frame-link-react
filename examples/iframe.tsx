import React from "react";
import { useContext, useEffect, useRef } from "react";
import FrameLinkProvider, { FrameLinkContext } from "../src/FrameLinkProvider";

export default function App() {
  return (
    <FrameLinkProvider>
      <MyComponent />
      <MyButtonComponent />
      <MyNotificationComponent />
    </FrameLinkProvider>
  );
}

function MyComponent() {
  const { registerTarget, ready, connected } = useContext(FrameLinkContext);
  const frameRef = useRef<any>();

  useEffect(() => {
    if (ready && registerTarget) {
      registerTarget(window.parent);
    }
  }, [ready]);

  useEffect(() => {
    console.log("connected", connected);
  }, [connected]);

  return <div></div>;
}

function MyButtonComponent() {
  const { usePostMessage } = useContext(FrameLinkContext);
  const updateTestTwo = usePostMessage("test-two");

  return (
    <button
      onClick={() =>
        updateTestTwo({ myPayload: "this is a test-two test" }, () => {
          // Optional callback... well it is supposed to be.  I need to fix the type
        })
      }
    >
      send test
    </button>
  );
}

function MyNotificationComponent() {
  const { useAddListener, useSubscribe } = useContext(FrameLinkContext);
  useAddListener("test");
  const test = useSubscribe<{ myPayload: string }>("test");

  // This will update whenever "test-two" gets new data.
  return <div>{test.myPayload}</div>;
}
