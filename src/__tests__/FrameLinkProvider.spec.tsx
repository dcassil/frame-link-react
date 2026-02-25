import { render, screen } from "@testing-library/react";
import { createFrameLink } from "frame-link";
import { useContext } from "react";
import { FrameLinkContext } from "../provider/context.js";
import { FrameLinkProvider } from "../provider/FrameLinkProvider.js";
import { defaultTestOptions } from "./test-utils.js";

jest.mock("frame-link", () => ({
  createFrameLink: jest.fn(),
}));

const mockCreateFrameLink = createFrameLink as jest.MockedFunction<typeof createFrameLink>;

describe("FrameLinkProvider", () => {
  const mockFrameLink = {
    send: jest.fn(),
    on: jest.fn(() => jest.fn()),
    off: jest.fn(),
    connect: jest.fn(),
    destroy: jest.fn(),
    connected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFrameLink.mockReturnValue(mockFrameLink as any);
  });

  it("should create FrameLink instance on mount", () => {
    render(
      <FrameLinkProvider options={defaultTestOptions}>
        <div>child</div>
      </FrameLinkProvider>
    );

    expect(mockCreateFrameLink).toHaveBeenCalledWith(defaultTestOptions);
    expect(mockCreateFrameLink).toHaveBeenCalledTimes(1);
  });

  it("should provide context to children", () => {
    function TestChild() {
      const context = useContext(FrameLinkContext);
      return <div data-testid="has-context">{context !== null ? "yes" : "no"}</div>;
    }

    render(
      <FrameLinkProvider options={defaultTestOptions}>
        <TestChild />
      </FrameLinkProvider>
    );

    expect(screen.getByTestId("has-context")).toHaveTextContent("yes");
  });

  it("should destroy instance on unmount", () => {
    const { unmount } = render(
      <FrameLinkProvider options={defaultTestOptions}>
        <div>child</div>
      </FrameLinkProvider>
    );

    expect(mockFrameLink.destroy).not.toHaveBeenCalled();

    unmount();

    expect(mockFrameLink.destroy).toHaveBeenCalledTimes(1);
  });

  it("should provide initial disconnected state", () => {
    function TestChild() {
      const context = useContext(FrameLinkContext);
      return (
        <div>
          <span data-testid="connected">{String(context?.connected ?? false)}</span>
          <span data-testid="connecting">{String(context?.connecting ?? false)}</span>
        </div>
      );
    }

    render(
      <FrameLinkProvider options={defaultTestOptions}>
        <TestChild />
      </FrameLinkProvider>
    );

    expect(screen.getByTestId("connected")).toHaveTextContent("false");
    expect(screen.getByTestId("connecting")).toHaveTextContent("false");
  });

  it("should re-create instance when options change", () => {
    const { rerender } = render(
      <FrameLinkProvider options={defaultTestOptions}>
        <div>child</div>
      </FrameLinkProvider>
    );

    expect(mockCreateFrameLink).toHaveBeenCalledTimes(1);
    expect(mockFrameLink.destroy).not.toHaveBeenCalled();

    const newOptions = { ...defaultTestOptions, timeout: 10000 };
    
    rerender(
      <FrameLinkProvider options={newOptions}>
        <div>child</div>
      </FrameLinkProvider>
    );

    expect(mockFrameLink.destroy).toHaveBeenCalledTimes(1);
    expect(mockCreateFrameLink).toHaveBeenCalledTimes(2);
    expect(mockCreateFrameLink).toHaveBeenLastCalledWith(newOptions);
  });
});
