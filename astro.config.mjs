import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeTableWrap from './src/plugins/rehype-table-wrap.mjs';
import rehypeChapterNumbers from './src/plugins/rehype-chapter-numbers.mjs';
import rehypeFigures from './src/plugins/rehype-figures.mjs';

export default defineConfig({
  site: 'https://bye-lemon.github.io',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeChapterNumbers, rehypeTableWrap, rehypeFigures],
    shikiConfig: { theme: 'github-light', wrap: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(search|search\.json|404|sites|gist|papers|slides|links)\/?$/.test(page),
    }),
  ],
});
