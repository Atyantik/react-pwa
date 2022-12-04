import { Configuration } from 'webpack';

export const getExperiments = (options: {
  outputModule: boolean;
}): Configuration['experiments'] => ({
  // We need output as module to be included client side
  outputModule: options.outputModule,
  // outputModule: true,
  // Enable top level await for simplicity
  topLevelAwait: true,
  backCompat: false,
  cacheUnaffected: true,
});
