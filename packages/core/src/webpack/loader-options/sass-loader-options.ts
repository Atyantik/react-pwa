import Sass from 'sass';

export const getSassLoaderOptions = () => ({
  // Prefer `dart-sass`
  implementation: Sass,
  sassOptions: {
    fiber: false,
  },
});
