import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import FrameLinkProvider from "../FrameLinkProvider";
import "@testing-library/jest-dom";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <FrameLinkProvider>{children}</FrameLinkProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
