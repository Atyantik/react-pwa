import path from 'path';
import Module from 'module';

export const requireFromString = (code: string, fname: any, options?: any) => {
  let opts = options;
  let filename = fname;
  if (typeof filename === 'object') {
    opts = filename;
    filename = undefined;
  }

  opts = opts || {};
  filename = filename || '';

  opts.appendPaths = opts.appendPaths || [];
  opts.prependPaths = opts.prependPaths || [];

  if (typeof code !== 'string') {
    throw new Error(`code must be a string, not ${typeof code}`);
  }
  // @ts-ignore
  const paths = Module._nodeModulePaths(path.dirname(filename)); // eslint-disable-line

  // @ts-ignore
  const { parent } = Module;
  const m = new Module(filename, parent);
  m.filename = filename;
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  m._compile(code, filename);

  const { exports } = m;
  if (parent && parent.children) {
    parent.children.splice(parent.children.indexOf(m), 1);
  }
  return exports;
};
