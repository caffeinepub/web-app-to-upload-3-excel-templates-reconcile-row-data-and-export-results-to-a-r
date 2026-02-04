/**
 * Helper to construct base-path-aware URLs for static assets.
 * Uses Vite's BASE_URL to support both root and subpath deployments.
 */
export function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Combine base and path, avoiding double slashes
  return `${base.replace(/\/$/, '')}${normalizedPath}`;
}
