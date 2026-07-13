import { readFile } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Generisk kontekst-loader.
 *
 * Starter fra en "index"-markdown-fil og følger alle relative markdown-links
 * rekursivt. Indholdet af hver linket fil samles til én streng, som kan
 * bruges som fast kontekst til AI-modellen.
 *
 * Fordelen: For at tilføje/fjerne kontekst redigerer man kun index.md
 * (eller en fil den linker til) — aldrig koden.
 */

// Rod for kontekstfiler. Kan overstyres via CONTEXT_DIR (fx i produktion).
function contextRoot(): string {
  if (process.env.CONTEXT_DIR) {
    return resolve(process.env.CONTEXT_DIR);
  }
  // Dette modul ligger i src/server/lib/, så context/ er 3 niveauer op.
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', '..', 'context');
}

// Matcher markdown-links: [tekst](sti). Ignorerer absolutte URL'er og ankre.
const MARKDOWN_LINK = /\[[^\]]*\]\(([^)]+)\)/g;

function extractLinkedPaths(markdown: string): string[] {
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK.exec(markdown)) !== null) {
    const target = match[1].trim().split('#')[0].split(' ')[0];
    if (!target) continue;
    // Spring eksterne links og ikke-markdown over.
    if (/^[a-z]+:\/\//i.test(target)) continue;
    if (target.startsWith('mailto:')) continue;
    if (!target.toLowerCase().endsWith('.md')) continue;
    paths.push(target);
  }
  return paths;
}

export type LoadedContextFile = {
  path: string;
  content: string;
};

export type LoadedContext = {
  files: LoadedContextFile[];
  combined: string;
};

/**
 * Indlæser kontekst startende fra en index-fil.
 * Følger relative markdown-links rekursivt og undgår dubletter.
 */
export async function loadContext(indexFile = 'index.md'): Promise<LoadedContext> {
  const root = contextRoot();
  const indexPath = resolve(root, indexFile);

  const visited = new Set<string>();
  const files: LoadedContextFile[] = [];

  async function walk(absPath: string, isIndex: boolean): Promise<void> {
    const normalized = resolve(absPath);

    // Sikkerhed: hold os inden for kontekst-roden.
    const rel = relative(root, normalized);
    if (rel.startsWith('..') || rel.split(sep)[0] === '..') {
      return;
    }
    if (visited.has(normalized)) return;
    visited.add(normalized);

    let content: string;
    try {
      content = await readFile(normalized, 'utf8');
    } catch {
      // Manglende fil springes stille over, så en død link ikke vælter alt.
      return;
    }

    // Selve index-filen er kun en "rutefil" og tages ikke med i output.
    if (!isIndex) {
      files.push({ path: rel.split(sep).join('/'), content: content.trim() });
    }

    const baseDir = dirname(normalized);
    for (const linked of extractLinkedPaths(content)) {
      await walk(resolve(baseDir, linked), false);
    }
  }

  await walk(indexPath, true);

  const combined = files
    .map((f) => `# Kilde: ${f.path}\n\n${f.content}`)
    .join('\n\n---\n\n');

  return { files, combined };
}
