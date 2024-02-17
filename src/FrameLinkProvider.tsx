import { createContext, ReactNode } from "react";
import { RecoilRoot } from "recoil";
import FrameLinkProviderInternal from "./FrameLinkProviderInternal";
import FrameLinkReact from "./types";

export const FrameLinkContext = createContext({} as FrameLinkReact.Context);

export default function FrameLinkProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RecoilRoot>
      <FrameLinkProviderInternal>{children}</FrameLinkProviderInternal>
    </RecoilRoot>
  );
}
