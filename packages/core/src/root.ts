import { resolve } from 'node:path';

const currentFileUrl = new URL(import.meta.url);
const libSrc = resolve(currentFileUrl.pathname, '..');

export { libSrc };
