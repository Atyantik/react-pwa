import SassEmbedded from 'sass-embedded';
import * as Sass from 'sass';
import NodeSass from 'node-sass';

export const getSassLoaderOptions = (options: {
  compiler: 'sass' | 'sass-embedded' | 'node-sass';
}) => {
  let compiler: any = SassEmbedded;
  if (options.compiler === 'node-sass') {
    compiler = NodeSass;
  } else if (options.compiler === 'sass') {
    compiler = Sass;
  }
  return {
    // Prefer `dart-sass` or sass-embedded,
    // dart-sass with nodejs api is very very slow
    implementation: compiler,
  };
};
