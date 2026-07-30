import { act, renderHook } from "@testing-library/react";
import { createFrameLink } from "frame-link";
import { useSend } from "../hooks/useSend.js";
import {
  createWrapper,
  defaultTestOptions,
  type TestMessages,
} from "./test-utils.js";

jest.mock("frame-link", () => ({
  createFrameLink: jest.fn(),
}));

const mockCreateFrameLink = createFrameLink as jest.MockedFunction<
  typeof createFrameLink
>;

describe("useSend", () => {
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
    mockFrameLink.send.mockResolvedValue({ reply: "pong" });
  });

  it("should return a memoized sender function", () => {
    const { result, rerender } = renderHook(
      () => useSend<TestMessages, "test:ping">("test:ping"),
      { wrapper: createWrapper(defaultTestOptions) },
    );

    const firstSend = result.current;

    rerender();

    expect(result.current).toBe(firstSend);
  });

  it("should call frameLink.send with correct arguments", async () => {
    const { result } = renderHook(
      () => useSend<TestMessages, "test:ping">("test:ping"),
      { wrapper: createWrapper(defaultTestOptions) },
    );

    const payload = { message: "hello" };

    await act(async () => {
      await result.current(payload);
    });

    expect(mockFrameLink.send).toHaveBeenCalledWith("test:ping", payload);
  });

  it("should return the response from frameLink.send", async () => {
    const expectedResponse = { reply: "world" };
    mockFrameLink.send.mockResolvedValueOnce(expectedResponse);

    const { result } = renderHook(
      () => useSend<TestMessages, "test:ping">("test:ping"),
      { wrapper: createWrapper(defaultTestOptions) },
    );

    let response: { reply: string } | undefined;

    await act(async () => {
      response = await result.current({ message: "hello" });
    });

    expect(response).toEqual(expectedResponse);
  });

  it("should propagate errors from frameLink.send", async () => {
    const sendError = new Error("Send failed");
    mockFrameLink.send.mockRejectedValueOnce(sendError);

    const { result } = renderHook(
      () => useSend<TestMessages, "test:ping">("test:ping"),
      { wrapper: createWrapper(defaultTestOptions) },
    );

    await expect(
      act(async () => {
        await result.current({ message: "hello" });
      }),
    ).rejects.toThrow("Send failed");
  });

  it("should update sender when key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useSend<TestMessages, "test:ping">(key as "test:ping"),
      {
        wrapper: createWrapper(defaultTestOptions),
        initialProps: { key: "test:ping" },
      },
    );

    const firstSend = result.current;

    rerender({ key: "test:getData" });

    expect(result.current).not.toBe(firstSend);
  });
});
