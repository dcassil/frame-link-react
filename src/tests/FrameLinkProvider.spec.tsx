import React, { useContext, useEffect, useState } from "react";
import { render, screen, waitFor } from "./utils";
import FrameLinkProvider, { FrameLinkContext } from "../FrameLinkProvider";

describe("FrameLinkProvider", () => {
  beforeEach(() => {
    jest.spyOn(window, "postMessage");
    render(<TestComponent />);
  });
  it("should sanity test", () => {
    const frame1 = screen.getByText("frame one Component");
    expect(frame1).toBeInTheDocument();
    screen.debug();
  });

  test("should send ping", () => {
    waitFor(() => {
      expect(window.postMessage).toHaveBeenCalledWith(
        {
          key: "ping",
          data: undefined,
          resp_key: expect.any(Number),
        },
        "*"
      );
    });
    screen.debug();
  });
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
