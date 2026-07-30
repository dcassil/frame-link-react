import { act, renderHook, waitFor } from "@testing-library/react";
import { createFrameLink } from "frame-link";
import { useConnection } from "../hooks/useConnection.js";
import { createWrapper, defaultTestOptions } from "./test-utils.js";

jest.mock("frame-link", () => ({
  createFrameLink: jest.fn(),
}));

const mockCreateFrameLink = createFrameLink as jest.MockedFunction<
  typeof createFrameLink
>;

describe("useConnection", () => {
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
    mockCreateFrameLink.mockReturnValue(mockFrameLink);
    mockFrameLink.connect.mockResolvedValue(undefined);
  });

  it("should return disconnected state initially", () => {
    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should provide a connect function", () => {
    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    expect(typeof result.current.connect).toBe("function");
  });

  it("should update state when connect is called", async () => {
    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    const mockWindow = {} as Window;

    await act(async () => {
      await result.current.connect(mockWindow);
    });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });

    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFrameLink.connect).toHaveBeenCalledWith(mockWindow);
  });

  it("should handle connection errors", async () => {
    const connectionError = new Error("Connection failed");
    mockFrameLink.connect.mockRejectedValueOnce(connectionError);

    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    const mockWindow = {} as Window;

    await act(async () => {
      try {
        await result.current.connect(mockWindow);
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(connectionError);
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
  });

  it("should have stable connect function across re-renders", () => {
    const { result, rerender } = renderHook(() => useConnection(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    const firstConnect = result.current.connect;

    rerender();

    expect(result.current.connect).toBe(firstConnect);
  });
});
