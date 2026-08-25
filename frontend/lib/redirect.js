// Shared helper for safely preserving/consuming a post-login redirect target.
// Used by route guards (to build "?redirect=" when bouncing an unauthenticated
// visitor to /login) and by the login page (to navigate back afterwards).
//
// Only same-origin, in-app paths are ever allowed. This deliberately rejects:
//   - protocol-relative URLs ("//evil.com/...") — browsers treat these as external
//   - absolute URLs with a scheme ("https://evil.com", "javascript:alert(1)")
//   - anything that doesn't start with a single "/"
export function isSafeRedirectPath(path) {
  if (typeof path !== 'string' || path.length === 0) return false;

  // Must start with exactly one '/', never '//' or '/\' (both are interpreted
  // as protocol-relative / scheme-relative by browsers).
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//') || path.startsWith('/\\')) return false;

  // Reject anything carrying a scheme (e.g. "/\tjavascript:alert(1)" style
  // smuggling, or a literal colon-scheme after normalization attempts).
  if (/^\/\s*([a-z][a-z0-9+.-]*:)/i.test(path)) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(path)) return false;

  return true;
}

const DEFAULT_FALLBACK = '/';

// Builds "/login?redirect=<encoded-path>" — omits the param entirely when the
// current path isn't worth preserving (e.g. already /login) or is unsafe.
export function buildLoginUrl(currentPath, fallback = DEFAULT_FALLBACK) {
  if (isSafeRedirectPath(currentPath) && !currentPath.startsWith('/login')) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  return '/login';
}

// Resolves the value to actually navigate to after a successful login:
// the preserved redirect target if it's safe, otherwise the role-based fallback.
export function resolvePostLoginPath(redirectParam, roleFallbackPath) {
  if (redirectParam && isSafeRedirectPath(redirectParam)) {
    return redirectParam;
  }
  return roleFallbackPath;
}
