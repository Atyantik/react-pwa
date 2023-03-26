import Sass from 'sass-embedded';

export const getSassLoaderOptions = () => ({
  // Prefer `dart-sass`
  implementation: Sass,
});
