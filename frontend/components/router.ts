// ── Router ───────────────────────────────────────────────────────────────────

import { h, createContext, type ComponentChildren } from "preact";
import { useState, useEffect, useCallback, useContext } from "preact/hooks";
import htm from "htm";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type Navigate = (to: string) => void;
type LocationTuple = [string, Navigate];

export const LocationContext = createContext<LocationTuple | null>(null);

export function RouterProvider({ base, children }: { base: string; children: ComponentChildren }) {
  const strip = (path: string) => (path.startsWith(base) ? path.slice(base.length) || "/" : path);
  const [path, setPath] = useState(() => strip(location.pathname));
  useEffect(() => {
    const onPop = () => setPath(strip(location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [base]);
  const navigate = useCallback(
    (to: string) => {
      history.pushState(null, "", base + (to === "/" ? "" : to));
      setPath(to);
    },
    [base],
  );
  return html`<${LocationContext.Provider} value=${[path, navigate]}>${children}</${LocationContext.Provider}>`;
}

export function useLocation(): LocationTuple {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocation must be used within RouterProvider");
  return value;
}
