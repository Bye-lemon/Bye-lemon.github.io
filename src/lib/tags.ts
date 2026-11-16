import { pinyin } from 'pinyin';

/** ASCII slug for a tag: ASCII keeps symbols, Chinese becomes pinyin. */
export function tagSlug(tag: string): string {
  const raw = tag.trim();
  if (/^[\x20-\x7E]+$/.test(raw)) {
    return raw
      .toLowerCase()
      .replace(/\+/g, '-plus')
      .replace(/#/g, '-sharp')
      .replace(/\./g, '-dot')
      .replace(/&/g, '-and')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'tag';
  }
  const ascii = pinyin(raw, { style: pinyin.STYLE_NORMAL, separator: '-' })
    .flat()
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || 'tag';
}
