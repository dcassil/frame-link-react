import { renderHook } from "@testing-library/react";
import { createFrameLink } from "frame-link";
import { useHandler } from "../hooks/useHandler.js";
import { createWrapper, defaultTestOptions, type TestMessages } from "./test-utils.js";

jest.mock("frame-link", () => ({
  createFrameLink: jest.fn(),
}));

const mockCreateFrameLink = createFrameLink as jest.MockedFunction<typeof createFrameLink>;

describe("useHandler", () => {
  const mockUnsubscribe = jest.fn();
  const mockFrameLink = {
    send: jest.fn(),
    on: jest.fn(() => mockUnsubscribe),
    off: jest.fn(),
    connect: jest.fn(),
    destroy: jest.fn(),
    connected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFrameLink.mockReturnValue(mockFrameLink as any);
  });

  it("should register handler on mount", () => {
    const handler = jest.fn().mockReturnValue({ reply: "pong" });

    renderHook(
      () => { useHandler<TestMessages, "test:ping">("test:ping", handler); },
      { wrapper: createWrapper(defaultTestOptions) }
    );

    expect(mockFrameLink.on).toHaveBeenCalledWith("test:ping", expect.any(Function));
    expect(mockFrameLink.on).toHaveBeenCalledTimes(1);
  });

  it("should unregister handler on unmount", () => {
    const handler = jest.fn().mockReturnValue({ reply: "pong" });

    const { unmount } = renderHook(
      () => { useHandler<TestMessages, "test:ping">("test:ping", handler); },
      { wrapper: createWrapper(defaultTestOptions) }
    );

    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should call the provided handler when invoked", () => {
    const handler = jest.fn().mockReturnValue({ reply: "pong" });

    renderHook(
      () => { useHandler<TestMessages, "test:ping">("test:ping", handler); },
      { wrapper: createWrapper(defaultTestOptions) }
    );

    const calls = mockFrameLink.on.mock.calls as unknown[][];
    const registeredHandler = calls[0]?.[1] as ((payload: unknown) => unknown) | undefined;
    const payload = { message: "hello" };
    
    registeredHandler?.(payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should use the latest handler reference", () => {
    const handler1 = jest.fn().mockReturnValue({ reply: "first" });
    const handler2 = jest.fn().mockReturnValue({ reply: "second" });

    const { rerender } = renderHook(
      ({ handler }) => { useHandler<TestMessages, "test:ping">("test:ping", handler); },
      {
        wrapper: createWrapper(defaultTestOptions),
        initialProps: { handler: handler1 },
      }
    );

    rerender({ handler: handler2 });

    const calls = mockFrameLink.on.mock.calls as unknown[][];
    const registeredHandler = calls[0]?.[1] as ((payload: unknown) => unknown) | undefined;
    const payload = { message: "test" };
    
    registeredHandler?.(payload);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(payload);
  });

  it("should re-register when key changes", () => {
    const handler = jest.fn().mockReturnValue({ reply: "pong" });

    const { rerender } = renderHook(
      ({ key }) => { useHandler<TestMessages, "test:ping">(key as "test:ping", handler); },
      {
        wrapper: createWrapper(defaultTestOptions),
        initialProps: { key: "test:ping" },
      }
    );

    expect(mockFrameLink.on).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    rerender({ key: "test:getData" });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockFrameLink.on).toHaveBeenCalledTimes(2);
    expect(mockFrameLink.on).toHaveBeenLastCalledWith("test:getData", expect.any(Function));
  });

  it("should not re-register when handler changes", () => {
    const handler1 = jest.fn().mockReturnValue({ reply: "first" });
    const handler2 = jest.fn().mockReturnValue({ reply: "second" });

    const { rerender } = renderHook(
      ({ handler }) => { useHandler<TestMessages, "test:ping">("test:ping", handler); },
      {
        wrapper: createWrapper(defaultTestOptions),
        initialProps: { handler: handler1 },
      }
    );

    expect(mockFrameLink.on).toHaveBeenCalledTimes(1);

    rerender({ handler: handler2 });

    expect(mockFrameLink.on).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });
});
