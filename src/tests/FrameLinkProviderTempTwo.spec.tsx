import React, { useContext, useEffect, useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "./utils";
import FrameLinkProvider, { FrameLinkContext } from "../FrameLinkProvider";

test("should set connected on ping", async () => {
  render(<TestComponent />);

  const connected = await screen.findByText("connected-123");

  expect(connected).toBeInTheDocument();
});

const TestComponent: React.FC = () => {
  return (
    <>
      <FrameLinkProvider>
        <Frame1 />
      </FrameLinkProvider>
    </>
  );
};
const Frame1: React.FC = () => {
  const { registerTarget, ready, connected } = useContext(FrameLinkContext);
  const [con, setCon] = useState("");

  registerTarget && registerTarget(window);

  useEffect(() => {
    if (connected) {
      setCon("connected-123");
    }
  }, [connected]);

  return (
    <div>
      <div data-testid="frame-one">frame one Component</div>
      <p>{con}</p>
    </div>
  );
};
