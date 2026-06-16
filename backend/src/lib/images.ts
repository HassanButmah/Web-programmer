/** Normalize Story.images (JSON in SQLite) to string[] for API responses. */
export function asImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}
