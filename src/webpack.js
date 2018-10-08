import SassPlugin from '@pawjs/sass/webpack';
import SrcsetPlugin from '@pawjs/srcset/webpack';

export default class ProjectWebpack {
  constructor({ addPlugin }) {
    // Add sass compiler to the project
    addPlugin(new SassPlugin());
    addPlugin(new SrcsetPlugin());
  }
}
