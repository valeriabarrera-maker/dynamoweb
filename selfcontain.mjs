// Convierte los HTML capturados en auto-contenidos para abrir con file://
// - rutas absolutas /_next/ y /favicon -> relativas
// - quita el query ?dpl=...
// - neutraliza <script> (Next.js re-hidrataria y romperia el snapshot offline)
// Originales se respaldan en _raw/ antes de tocar.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = new URL('.', import.meta.url).pathname;
const RAW = join(DIR, '_raw');
if (!existsSync(RAW)) mkdirSync(RAW);

const files = readdirSync(DIR).filter(f => f.endsWith('.html'));
const DPL = /\?dpl=dpl_[A-Za-z0-9]+/g;

for (const f of files) {
  const src = join(DIR, f);
  const bak = join(RAW, f);
  if (!existsSync(bak)) copyFileSync(src, bak);      // respaldo 1 sola vez
  let html = readFileSync(bak, 'utf8');               // partir SIEMPRE del original

  // 1) quitar todos los <script> (externos e inline) -> evita re-hidratacion
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // 2) quitar preloads de script
  html = html.replace(/<link\b[^>]*as="script"[^>]*>/gi, '');
  // 3) quitar el query ?dpl
  html = html.replace(DPL, '');
  // 4) favicon con query raro -> relativo
  html = html.replace(/\/favicon\.ico\?[^"']*/g, 'favicon.ico');
  // 5) rutas absolutas -> relativas
  html = html.replace(/(["'(])\/_next\//g, '$1_next/');
  html = html.replace(/(["'])\/favicon\.ico(["'])/g, '$1favicon.ico$2');

  writeFileSync(src, html);
  console.log(`${f}: ${readFileSync(bak,'utf8').length} -> ${html.length} bytes`);
}
console.log('Originales respaldados en _raw/');
