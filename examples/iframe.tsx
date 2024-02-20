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

  useEffect(() => {
    if (ready && registerTarget) {
      // Register the target ( in this case the parent )
      registerTarget(window.parent);
    }
  }, [ready]);

  useEffect(() => {
    // Wait for them to connect ( sends a ping and gets a reply ping )
    console.log("connected", connected);
  }, [connected]);

  return <div></div>;
}

function MyButtonComponent() {
  const { usePostMessage } = useContext(FrameLinkContext);
  // create an updater for a given key;
  const updateTestTwo = usePostMessage("test-two");

  return (
    <button
      onClick={() =>
        // Call the updater with the data to send to the other frame.
        updateTestTwo({ myPayload: "this is a test-two test" }, (replyData) => {
          // Optional callback... See subscribe
          // If a reply callback is included, when this is received on the parent, we will send a response back
          // If the parent includes a reply callback when subscribing, replyData will be whatever that callback returns.
        })
      }
    >
      send test
    </button>
  );
}

const optionalReplyFunction = (latestData) => {
  return { anything: "you want" }; //
};

function MyNotificationComponent() {
  const { useSubscribe } = useContext(FrameLinkContext);
  const test = useSubscribe<{ myPayload: string }>(
    "test",
    optionalReplyFunction
  );

  // This will update whenever "test-two" gets new data.
  return <div>{test?.myPayload}</div>;
}
