import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src'],
  outDir: './lib',
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  platform: 'node',
  skipNodeModulesBundle: true,
  bundle: false,
  format: ['esm', 'cjs'],
  minify: true,
});
