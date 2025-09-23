import { useEffect } from "react";

export function useLinkNormalizer() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const u = new URL(a.href, window.location.origin);
        if ((u.pathname.startsWith('/games/') || u.pathname.startsWith('/play/')) &&
            !u.pathname.endsWith('/')) {
          e.preventDefault();
          u.pathname += '/';
          window.location.assign(u.href); // force full nav so Nginx 301 applies
        }
      } catch {}
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
}