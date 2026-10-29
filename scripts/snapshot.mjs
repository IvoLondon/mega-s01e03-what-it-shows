import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Preserve the actual prerendered site and all assets so the desk sees the real components.
await rm('rendered', { recursive: true, force: true });
await cp('build', 'rendered', { recursive: true });

// A second, self-contained reading copy opens directly from disk. It is a static snapshot:
// the explorer's controls are disabled, while the built site retains full interaction.
const pagePath = 'build/kb/incidents/4471-review/index.html';
let html = await readFile(pagePath, 'utf8');
const styles = [...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)];
for (const match of styles) {
  const css = await readFile(resolve('build/kb/incidents/4471-review', match[1]), 'utf8');
  html = html.replace(match[0], `<style>${css}</style>`);
}
html = html.replace(/<link\b[^>]*rel="(?:modulepreload|preload)"[^>]*>/g, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<select\b/g, '<select disabled')
  .replace(/<input\b/g, '<input disabled');
await mkdir('rendered', { recursive: true });
await writeFile('rendered/4471-review.html', html);
console.log('Saved the rendered site and self-contained reading copy to rendered/.');
