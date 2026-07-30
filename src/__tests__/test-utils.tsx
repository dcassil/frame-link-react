import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { FrameLinkProvider } from "../provider/FrameLinkProvider.js";
import type {
  FrameLinkOptions,
  MessageDefinition,
  MessageRegistry,
} from "frame-link";

export interface TestMessages extends MessageRegistry {
  "test:ping": MessageDefinition<{ message: string }, { reply: string }>;
  "test:getData": MessageDefinition<{ id: string }, { data: string }>;
}

export const defaultTestOptions: FrameLinkOptions = {
  targetOrigin: "*",
  timeout: 5000,
};

interface WrapperProps {
  children: ReactNode;
}

export function createWrapper(options: FrameLinkOptions = defaultTestOptions) {
  return function Wrapper({ children }: WrapperProps): ReactElement {
    return <FrameLinkProvider options={options}>{children}</FrameLinkProvider>;
  };
}

export function renderWithProvider(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    providerOptions?: FrameLinkOptions;
  },
): RenderResult {
  const { providerOptions, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(providerOptions),
    ...renderOptions,
  });
}

export function createMockFrameLink() {
  const mockUnsubscribe = jest.fn();

  return {
    send: jest.fn().mockResolvedValue({}),
    on: jest.fn().mockReturnValue(mockUnsubscribe),
    off: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    connected: false,
    mockUnsubscribe,
  };
}
