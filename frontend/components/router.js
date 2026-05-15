// ── Router ───────────────────────────────────────────────────────────────────

import { h, createContext } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export const LocationContext = createContext(null);

export function RouterProvider({ base, children }) {
  const strip = path => path.startsWith(base) ? path.slice(base.length) || '/' : path;
  const [path, setPath] = useState(() => strip(location.pathname));
  useEffect(() => {
    const onPop = () => setPath(strip(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback(to => {
    history.pushState(null, '', base + (to === '/' ? '' : to));
    setPath(to);
  }, [base]);
  return html`<${LocationContext.Provider} value=${[path, navigate]}>${children}</${LocationContext.Provider}>`;
}

export function useLocation() { return useContext(LocationContext); }
