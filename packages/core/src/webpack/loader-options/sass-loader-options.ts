import Sass from 'sass-embedded';

export const getSassLoaderOptions = () => ({
  // Prefer `dart-sass` or sass-embedded,
  // dart-sass with nodejs api is very very slow
  implementation: Sass,
});
