/** Hash routing (#/orders/ZV-10001) so every page works on GitHub Pages without server rewrites. */
import { useSyncExternalStore, type AnchorHTMLAttributes } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
};

const currentHash = () => window.location.hash.replace(/^#/, '') || '/';

/** Current path without the query, e.g. "/orders/ZV-10001". */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => currentHash().split('?')[0] || '/');
}

/** Query string of the current route, e.g. "status=pending" for "#/orders?status=pending". */
export function useQuery(): URLSearchParams {
  const query = useSyncExternalStore(subscribe, () => currentHash().split('?')[1] ?? '');
  return new URLSearchParams(query);
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function Link({ to, ...props }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...props} />;
}

/** Matches "/orders/:id" against a path; returns the params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}
