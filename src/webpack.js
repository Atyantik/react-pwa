import SassPlugin from '@pawjs/sass/webpack';
import SrcsetPlugin from '@pawjs/srcset/webpack';
import ImageOptimizer from '@pawjs/image-optimizer/webpack';

export default class ProjectWebpack {
  constructor({ addPlugin }) {
    // Add sass compiler to the project
    addPlugin(new SassPlugin());
    const optimizerOptions = {
      supportedEnv: [
        'production',
      ],
      configLabel: 'MEDIUM_QUALITY',
    };
    addPlugin(new ImageOptimizer(optimizerOptions));

    addPlugin(new SrcsetPlugin());
  }
}
