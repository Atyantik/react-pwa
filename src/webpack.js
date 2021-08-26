import SassPlugin from '@pawjs/sass/webpack';
import SrcsetPlugin from '@pawjs/srcset/webpack';
import ResolverPlugin from './plugins/webpack-resolver';

export default class ProjectWebpack {
  constructor({ addPlugin }) {
    // Add sass compiler to the project
    addPlugin(new SassPlugin());
    const optimizerOptions = {
      mozjpeg: {
        progressive: true,
        quality: 95,
      },
      optipng: {
        enabled: true,
      },
      pngquant: {
        quality: '90-100',
        speed: 2,
      },
      gifsicle: {
        interlaced: false,
      },
      webp: {
        quality: 95,
      },
    };
    addPlugin(new SrcsetPlugin());
    addPlugin(new ResolverPlugin());
  }
}
