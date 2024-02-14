import FrameLink, { TFrameLink } from "frame-link";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

export const FrameLinkContext = createContext({} as TFrameLink);

export default function FrameLinkProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const frameLink = useRef<TFrameLink>(FrameLink(setReady));

  return (
    <FrameLinkContext.Provider
      value={{ ...frameLink.current, ready } as TFrameLink}
    >
      {children}
    </FrameLinkContext.Provider>
  );
}
