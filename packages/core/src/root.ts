import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFileUrl = new URL(import.meta.url);
const path = fileURLToPath(currentFileUrl);
const libSrc = resolve(path, '..');

export { libSrc };
