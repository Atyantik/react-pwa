import SassEmbedded from 'sass-embedded';
import * as Sass from 'sass';

export const getSassLoaderOptions = (options: {
  compiler: 'sass' | 'sass-embedded';
}) => {
  let compiler: any = SassEmbedded;
  if (options.compiler === 'sass') {
    compiler = Sass;
  }
  return {
    // Prefer `dart-sass` or sass-embedded,
    // dart-sass with nodejs api is very very slow
    implementation: compiler,
  };
};
