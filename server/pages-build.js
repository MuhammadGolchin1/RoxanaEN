import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const STATIC_ROUTES = ['assessment', 'questionnaire', 'about', 'faq', 'privacy', 'contact'];

/** Pages has no SPA rewrite server. Emit a real HTML entry at every route. */
export function pagesEntries() {
  let outputDirectory;
  return {
    name: 'roxana-pages-entries',
    apply: 'build',
    configResolved(config) { outputDirectory = config.build.outDir; },
    async closeBundle() {
      const html = await readFile(join(outputDirectory, 'index.html'), 'utf8');
      for (const route of STATIC_ROUTES) {
        await mkdir(join(outputDirectory, route), { recursive: true });
        await writeFile(join(outputDirectory, route, 'index.html'), html);
      }
      await writeFile(join(outputDirectory, '404.html'), html);
      await writeFile(join(outputDirectory, '.nojekyll'), '');
    },
  };
}
