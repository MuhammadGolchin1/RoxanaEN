import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { normalizeBase, sitePath, currentRoute } from '../src/lib/paths.js';
import { formsEndpoint } from '../src/lib/submission.js';
import { pagesEntries, STATIC_ROUTES } from '../server/pages-build.js';

test('repository paths apply to media, navigation and route selection', () => {
  assert.equal(normalizeBase(''), '/');
  assert.equal(normalizeBase('RoxanaEN'), '/RoxanaEN/');
  assert.equal(sitePath('/roxana-hero-background.mp4', '/RoxanaEN/'), '/RoxanaEN/roxana-hero-background.mp4');
  assert.equal(sitePath('/#about', '/RoxanaEN/'), '/RoxanaEN/#about');
  assert.equal(sitePath('#top', '/RoxanaEN/'), '#top');
  assert.equal(sitePath('https://example.com/', '/RoxanaEN/'), 'https://example.com/');
  assert.equal(currentRoute('/RoxanaEN/questionnaire/', '/RoxanaEN/'), 'questionnaire');
  assert.equal(currentRoute('/RoxanaEN/', '/RoxanaEN/'), '');
  assert.equal(currentRoute('/RoxanaEN', '/RoxanaEN/'), '');
  assert.equal(currentRoute('/assessment/', '/'), 'assessment');
});

test('static hosting requires an explicit form API while local development and preview keep working', () => {
  assert.equal(formsEndpoint({configured:'',development:false,hostname:'muhammadgolchin1.github.io'}), null);
  assert.equal(formsEndpoint({configured:'',development:false,hostname:'127.0.0.1'}), '/api/forms');
  assert.equal(formsEndpoint({configured:'',development:true,hostname:'localhost'}), '/api/forms');
  assert.equal(formsEndpoint({configured:'https://api.example.com/api/forms',development:false}), 'https://api.example.com/api/forms');
  assert.throws(()=>formsEndpoint({configured:'http://api.example.com/api/forms',development:false}), /secure/);
  assert.throws(()=>formsEndpoint({configured:'https://user:password@api.example.com/api/forms',development:false}), /invalid/);
});

test('every clean route has its own HTML entry for direct navigation and refresh', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'roxana-pages-'));
  try {
    const html = '<html><script src="/RoxanaEN/assets/main.js"></script></html>';
    await writeFile(join(directory,'index.html'),html);
    const plugin = pagesEntries();
    plugin.configResolved({build:{outDir:directory}});
    await plugin.closeBundle();
    for(const route of STATIC_ROUTES) assert.equal(await readFile(join(directory,route,'index.html'),'utf8'),html);
    assert.equal(await readFile(join(directory,'404.html'),'utf8'),html);
    assert.equal(await readFile(join(directory,'.nojekyll'),'utf8'),'');
  } finally {
    const resolved = await realpath(directory);
    assert.equal(dirname(resolved), await realpath(tmpdir()));
    assert.ok(basename(resolved).startsWith('roxana-pages-'));
    await rm(resolved,{recursive:true,force:true});
  }
});
