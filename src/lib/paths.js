export function normalizeBase(base = '/') {
  const segments = String(base).split('/').filter(Boolean);
  return segments.length ? `/${segments.join('/')}/` : '/';
}

const APP_BASE = normalizeBase(import.meta.env?.BASE_URL || '/');

/** Resolve local assets and links beneath the repository's Pages path. */
export function sitePath(path = '', base = APP_BASE) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  return normalizeBase(base) + path.replace(/^\/+/, '');
}

export function currentRoute(pathname = globalThis.location?.pathname || '/', base = APP_BASE) {
  const prefix = normalizeBase(base);
  if (pathname === prefix.slice(0, -1)) return '';
  const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  return relative.split('/').filter(Boolean)[0] || '';
}
