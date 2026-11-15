export function tagSlug(tag: string): string {
  return encodeURIComponent(
    tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  );
}
