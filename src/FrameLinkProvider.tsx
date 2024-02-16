import { RecoilRoot } from "recoil";
import FrameLinkProviderInternal, {
  FrameLinkContext as _FrameLinkContext,
} from "./FrameLinkProviderInternal";

export const FrameLinkContext = _FrameLinkContext;
export default function FrameLinkProvider({ children }: any) {
  return (
    <RecoilRoot>
      <FrameLinkProviderInternal>{children}</FrameLinkProviderInternal>
    </RecoilRoot>
  );
}
