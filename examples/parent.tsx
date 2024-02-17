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
    if (!!frameRef.current) {
      registerTarget && registerTarget(frameRef.current);
    }
  }, [ready, frameRef]);

  useEffect(() => {
    console.log("connected", connected);
  }, [connected]);

  return (
    <div>
      <iframe ref={frameRef} src="www.something.com" />{" "}
    </div>
  );
}

function MyButtonComponent() {
  const { usePostMessage } = useContext(FrameLinkContext);
  const updateTest = usePostMessage("test");

  return (
    <button
      onClick={() =>
        updateTest({ myPayload: "this is a test" }, () => {
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
  useAddListener("test-two"); // This will be removed in the near future.
  const testTwo = useSubscribe<{ myPayload: string }>("test-two"); // this will do both.

  // This will update whenever "test-two" gets new data.
  return <div>{testTwo.myPayload}</div>;
}
