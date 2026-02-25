import { renderHook } from "@testing-library/react";
import { createFrameLink } from "frame-link";
import { useFrameLink } from "../hooks/useFrameLink.js";
import { createWrapper, defaultTestOptions } from "./test-utils.js";

jest.mock("frame-link", () => ({
  createFrameLink: jest.fn(),
}));

const mockCreateFrameLink = createFrameLink as jest.MockedFunction<typeof createFrameLink>;

describe("useFrameLink", () => {
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

  it("should throw when used outside provider", () => {
    expect(() => {
      renderHook(() => useFrameLink());
    }).toThrow("useFrameLinkContext must be used within a FrameLinkProvider");
  });

  it("should return the FrameLink instance when inside provider", () => {
    const { result } = renderHook(() => useFrameLink(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    expect(result.current).toBe(mockFrameLink);
  });

  it("should return the same instance across re-renders", () => {
    const { result, rerender } = renderHook(() => useFrameLink(), {
      wrapper: createWrapper(defaultTestOptions),
    });

    const firstInstance = result.current;
    
    rerender();

    expect(result.current).toBe(firstInstance);
  });
});
