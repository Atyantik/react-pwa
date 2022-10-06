/* eslint-disable class-methods-use-this */
import path from 'node:path';
import fs from 'node:fs';
import nodeExternals from 'webpack-node-externals';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import Sass from 'sass';
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import BabelLazyRoutes from './babel/lazy-routes.js';
import { notBoolean } from './utils/not-boolean.js';
import { projectExistsSync } from './utils/resolver.js';
import { InjectSW } from './webpack/plugins/inject-sw.js';

const currentFileUrl = new URL(import.meta.url);
const libSrc = path.resolve(currentFileUrl.pathname, '..');

export const extensionRegex = (assetsList: string[]) => new RegExp(`\\.(${assetsList.join('|')})$`);

const defaultConfig = {
  react: {
    strictMode: true,
  },
  serviceWorker: true,
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type WebpackHandlerConstructorOptions = {
  mode: webpack.Configuration['mode'],
  target: webpack.Configuration['target'],
  projectRoot: string
  buildWithHttpServer: boolean,
  envVars: Record<string, any>,
  config: Record<string, any>,
  copyPublicFolder: Boolean,
  useBuildtimeGeneratorOptions: Boolean,
};
export class WebpackHandler {
  /**
   * Extensions of all assets that can be served via url
   */
  protected staticAssetsExtensions = [
    '7z',
    'arj',
    'deb',
    'pkg',
    'rar',
    'rpm',
    'tar.gz',
    'z',
    'zip',
    'bin',
    'dmg',
    'iso',
    'toast',
    'vcd',
    'csv',
    'dat',
    'db',
    'dbf',
    'log',
    'mdb',
    'sav',
    'sql',
    'tar',
    'xml',
    'email',
    'eml',
    'emlx',
    'msg',
    'oft',
    'ost',
    'pst',
    'vcf',
    'apk',
    'bat',
    'cgi',
    'pl',
    'com',
    'exe',
    'gadget',
    'jar',
    'msi',
    'py',
    'wsf',
    'fnt',
    'fon',
    'otf',
    'ttf',
    'eot',
    'woff',
    'woff2',
    'ai',
    'ps',
    'psd',
    'asp',
    'aspx',
    'cer',
    'cfm',
    'htm',
    'html',
    'jsp',
    'part',
    'php',
    'rss',
    'xhtml',
    'key',
    'odp',
    'pps',
    'ppt',
    'pptx',
    'c',
    'class',
    'cpp',
    'cs',
    'h',
    'java',
    'sh',
    'swift',
    'vb',
    'ods',
    'xls',
    'xlsm',
    'xlsx',
    'bak',
    'cab',
    'cfg',
    'cpl',
    'cur',
    'dll',
    'dmp',
    'drv',
    'icns',
    'ini',
    'lnk',
    'sys',
    'tmp',
    '3g2',
    '3gp',
    'avi',
    'flv',
    'h264',
    'm4v',
    'mkv',
    'mov',
    'mp4',
    'mpg',
    'mpeg',
    'rm',
    'swf',
    'vob',
    'wmv',
    'doc',
    'docx',
    'odt',
    'pdf',
    'rtf',
    'tex',
    'txt',
    'wpd',
  ];

  /**
   * Image extension
   */
  protected imageAssetsExtensions = [
    'bmp',
    'gif',
    'ico',
    'jpeg',
    'jpg',
    'png',
    'svg',
    'tif',
    'tiff',
  ];

  protected configOptions: Record<string, any> = defaultConfig;

  protected options: WebpackHandlerConstructorOptions;

  constructor(
    options: Optional<WebpackHandlerConstructorOptions, 'buildWithHttpServer' | 'envVars' | 'config' | 'copyPublicFolder' | 'useBuildtimeGeneratorOptions'>,
  ) {
    this.options = {
      buildWithHttpServer: false,
      envVars: {},
      config: {},
      copyPublicFolder: false,
      useBuildtimeGeneratorOptions: true,
      ...options,
    };

    const { react, serviceWorker, ...otherOptions } = options?.config ?? {};
    this.configOptions = {
      react: {
        StrictMode: true,
        ...(react ?? {}),
      },
      serviceWorker: serviceWorker ?? !this.isDevelopment,
      ...otherOptions,
    };
  }

  get isDevelopment() {
    return this.options.mode === 'development';
  }

  get isTargetWeb() {
    return this.options.target === 'web';
  }

  get isTargetServer() {
    return this.options.target === 'node';
  }

  get shouldHotReload() {
    return this.isDevelopment && this.isTargetWeb;
  }

  setMode(mode: webpack.Configuration['mode']) {
    this.options.mode = mode;
  }

  getMode(): webpack.Configuration['mode'] {
    return this.options.mode;
  }

  setTarget(target: webpack.Configuration['target']) {
    this.options.target = target;
  }

  getTarget(): webpack.Configuration['target'] {
    return this.options.target;
  }

  setProjectRoot(projectRoot: string) {
    this.options.projectRoot = projectRoot;
  }

  setBuildWithHttpServer(val: boolean) {
    this.options.buildWithHttpServer = !!val;
  }

  getLocalIdentName() {
    return this.isDevelopment ? '[name]__[local]--[hash:base64:5]' : '[contenthash:base64:5]';
  }

  getCssLoaderOptions(options = { withinSrc: true }) {
    if (options.withinSrc) {
      return {
        sourceMap: this.isDevelopment,
        modules: {
          localIdentName: this.getLocalIdentName(),
          mode: (resourcePath: string) => {
            if (/pure\.(css|s[ac]ss)$/i.test(resourcePath)) {
              return 'pure';
            }
            if (/global\.(css|s[ac]ss)$/i.test(resourcePath)) {
              return 'global';
            }
            return 'local';
          },
          localIdentContext: path.resolve(this.options.projectRoot, 'src'),
        },
        importLoaders: 2,
      };
    }
    return {
      modules: {
        localIdentName: '[local]',
        localIdentContext: path.resolve(this.options.projectRoot, 'src'),
      },
      importLoaders: 2,
    };
  }

  getPostcssLoaderOptions() {
    return {
      postcssOptions: {
        ident: 'postcss',
        plugins: [[autoprefixer]],
      },
    };
  }

  getSassLoaderOptions() {
    return {
      // Prefer `dart-sass`
      implementation: Sass,
      sassOptions: {
        fiber: false,
      },
    };
  }

  getCssRules(): webpack.RuleSetRule[] {
    return [
      {
        test: /\.(css|s[ac]ss)$/i,
        exclude: [path.join(this.options.projectRoot, 'src', 'resources'), /node_modules/],
        use: [
          this.shouldHotReload && { loader: 'style-loader' },
          this.shouldHotReload || {
            loader: MiniCssExtractPlugin.loader,
            options: { emit: this.isTargetWeb },
          },
          {
            loader: 'css-loader',
            options: this.getCssLoaderOptions(),
          },
          {
            loader: 'postcss-loader',
            options: this.getPostcssLoaderOptions(),
          },
          // Compiles Sass to CSS
          {
            loader: 'sass-loader',
            options: this.getSassLoaderOptions(),
          },
        ].filter(notBoolean),
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        include: [path.join(this.options.projectRoot, 'src', 'resources'), /node_modules/],
        use: [
          this.shouldHotReload && { loader: 'style-loader' },
          this.shouldHotReload || {
            loader: MiniCssExtractPlugin.loader,
            options: { emit: this.isTargetWeb },
          },
          {
            loader: 'css-loader',
            options: this.getCssLoaderOptions({ withinSrc: false }),
          },
          {
            loader: 'postcss-loader',
            options: this.getPostcssLoaderOptions(),
          },
          // Compiles Sass to CSS
          {
            loader: 'sass-loader',
            options: this.getSassLoaderOptions(),
          },
        ].filter(notBoolean),
      },
    ];
  }

  getEntry(): webpack.Configuration['entry'] {
    if (this.isTargetWeb) {
      return [
        this.shouldHotReload && 'webpack-hot-middleware/client?reload=true',
        this.shouldHotReload && 'react-refresh/runtime',
        path.resolve(libSrc, 'client.js'),
      ].filter(notBoolean);
    }
    if (this.isTargetServer) {
      if (this.options.buildWithHttpServer) {
        return [path.resolve(libSrc, 'fastify-server.js')].filter(notBoolean);
      }
      return [path.resolve(libSrc, 'server.js')].filter(notBoolean);
    }
    return [];
  }

  getOptimization(): webpack.Configuration['optimization'] {
    if (this.isTargetWeb) {
      return {
        splitChunks: {
          minSize: 2000,
          maxAsyncRequests: 20,
          maxInitialRequests: 20,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              reuseExistingChunk: true,
              name: (modulePath: any) => {
                if (modulePath && typeof modulePath.context === 'string') {
                  const reactPackageMatch = modulePath.context.match(
                    /[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
                  );
                  if (reactPackageMatch) {
                    return 'react';
                  }
                  const packageName = modulePath.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                  )[1];
                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `${packageName.replace('@', '')}`;
                }
                return undefined;
              },
            },
          },
        },
      };
    }
    if (this.isTargetServer) {
      return {
        splitChunks: false,
      };
    }
    return undefined;
  }

  getExperiments(): webpack.Configuration['experiments'] {
    return {
      // We need output as module to be included client side
      outputModule: this.isTargetWeb,
      // outputModule: true,
      // Enable top level await for simplicity
      topLevelAwait: true,
      backCompat: false,
      cacheUnaffected: true,
    };
  }

  getOutput(): webpack.Configuration['output'] {
    if (this.isTargetWeb) {
      return {
        clean: true,
        module: true,
        asyncChunks: true,
        publicPath: '/',
        path: path.resolve(this.options.projectRoot, 'dist', 'build'),
        chunkFilename: 'js/[chunkhash].js',
        filename: 'js/[contenthash].js',
        assetModuleFilename: 'assets/[contenthash]-[name][ext][query]',
      };
    }
    if (this.isTargetServer) {
      return {
        module: false,
        chunkFormat: 'commonjs',
        publicPath: '/',
        path: path.resolve(this.options.projectRoot, 'dist'),
        filename: 'server.cjs',
        library: {
          type: 'commonjs',
        },
      };
    }
    return undefined;
  }

  getMjsRule(): webpack.RuleSetRule {
    return {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    };
  }

  getGeneratorOptions(prefix: string) {
    if (this.options.useBuildtimeGeneratorOptions) {
      return {
        // We will use content hash for long term caching of asset
        filename: '[contenthash]-[name][ext][query]',
        outputPath: this.isTargetServer ? `./build/${prefix}` : `./${prefix}`,
        publicPath: `/${prefix}/`,
      };
    }
    return {
      // We will use content hash for long term caching of asset
      filename: `${prefix}/[contenthash]-[name][ext][query]`,
    };
  }

  getAssetsRule(): webpack.RuleSetRule {
    return {
      test: extensionRegex(this.staticAssetsExtensions),
      type: 'asset/resource',
      generator: {
        // We will use content hash for long term caching of asset
        filename: this.getGeneratorOptions('assets'),
      },
    };
  }

  getImagesRule(): webpack.RuleSetRule {
    return {
      test: extensionRegex(this.imageAssetsExtensions),
      type: 'asset',
      // Not doing dataURL condition as it is causing issues with SVG #use in safari
      parser: {
        dataUrlCondition: {
          maxSize: 0, // You can make it 4kb by 4 * 1024
        },
      },
      generator: this.getGeneratorOptions('images'),
    };
  }

  getRawResourceRule(): webpack.RuleSetRule {
    return {
      resourceQuery: /raw/,
      type: 'asset/source',
      generator: {
        emit: this.isTargetWeb,
      },
    };
  }

  // getSwcLoaderOptions() {
  //   return {
  //     "jsc": {
  //       "target" : "es2022",
  //       "parser": {
  //         "syntax": "typescript",
  //         "tsx": true,
  //         "decorators": false,
  //         "dynamicImport":  true
  //       },
  //       "loose": true,
  //       "transform": {
  //         "react": {
  //           "runtime": "automatic",
  //           "pragma": "React.createElement",
  //           "pragmaFrag": "React.Fragment",
  //           "throwIfNamespace": true,
  //           "development": this.isDevelopment,
  //           "refresh": this.shouldHotReload,
  //           "useBuiltins": false
  //         }
  //       },
  //     }
  //   };
  // }

  getBabelLoaderOptions() {
    return {
      presets: [
        [
          '@babel/preset-env',
          ...(this.isTargetServer
            ? [
              {
                targets: {
                  node: 'current',
                  esmodules: true,
                },
              },
            ]
            : [
              {
                useBuiltIns: 'entry',
                corejs: 'core-js@3',
                targets: { esmodules: true },
              },
            ]),
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
        [
          '@babel/preset-typescript',
          {
            allowDeclareFields: true,
          },
        ],
      ],
      plugins: [
        BabelLazyRoutes,
        this.shouldHotReload && 'react-refresh/babel',
        'babel-plugin-lodash',
      ].filter(notBoolean),
    };
  }

  getJsRule(): webpack.RuleSetRule {
    return {
      test: /\.(j|t)sx?$/,
      exclude: [/node_modules/],
      include: [path.resolve(this.options.projectRoot, 'src')],
      use: {
        // loader: "swc-loader",
        // options: this.getSwcLoaderOptions(),
        loader: 'babel-loader',
        options: this.getBabelLoaderOptions(),
      },
    };
  }

  getResolveExtensions(): string[] {
    return ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'];
  }

  getResolveAlias(): Exclude<webpack.Configuration['resolve'], undefined>['alias'] {
    return undefined;
  }

  getResolve(): webpack.Configuration['resolve'] {
    return {
      alias: {
        '@currentProject/webmanifest': (
          projectExistsSync(path.resolve(this.options.projectRoot, 'src', 'webmanifest'))
          || path.resolve(libSrc, 'defaults', 'webmanifest')
        ),
        '@currentProject': path.resolve(this.options.projectRoot, 'src'),
        ...(this.getResolveAlias() ?? {}),
      },
      extensions: this.getResolveExtensions(),
    };
  }

  getResolveLoader(): webpack.Configuration['resolveLoader'] {
    const libraryNodeModules = path.resolve(libSrc, 'node_modules');
    const libraryHasNodeModules = libraryNodeModules ? fs.existsSync(libraryNodeModules) : false;

    const workspaceNodeModules = path.resolve(libSrc, '..', '..', '..', 'node_modules');
    const workspaceHasNodeModules = workspaceNodeModules
      ? fs.existsSync(workspaceNodeModules)
      : false;
    return {
      modules: [
        'node_modules',
        ...(libraryHasNodeModules ? [libraryNodeModules] : []),
        ...(workspaceHasNodeModules ? [workspaceNodeModules] : []),
      ],
    };
  }

  getDevtool(): webpack.Configuration['devtool'] {
    return this.isDevelopment ? 'eval-source-map' : false;
  }

  getContext(): webpack.Configuration['context'] {
    return this.options.projectRoot;
  }

  getFilteredEnvVars() {
    if (this.isTargetServer) {
      return this.options.envVars;
    }
    const envVars: Record<string, any> = {};
    const envKeys = Object.keys(this.options.envVars);
    for (let i = 0; i < envKeys.length; i += 1) {
      if (!envKeys[i].startsWith('_PRIVATE_')) {
        envVars[envKeys[i]] = this.options.envVars[envKeys[i]];
      }
    }
    return envVars;
  }

  canCopyPublicFolder(): Boolean {
    if (!this.options.copyPublicFolder) {
      return false;
    }
    if (!this.getOutput()?.path) {
      return false;
    }
    const pathToPublicFolder = path.resolve(this.options.projectRoot, 'src', 'public');
    try {
      return fs.statSync(pathToPublicFolder).isDirectory();
    } catch {
      // do nothing
    }
    return false;
  }

  getServiceWorkerPlugin() {
    if (!this.isTargetWeb || this.configOptions.serviceWorker === false) {
      return false;
    }
    // Check if custom sw already exists
    const projectSW = projectExistsSync(
      path.join(this.options.projectRoot, 'src', 'sw.js'),
    );
    if (projectSW) {
      const projectSWContent = fs.readFileSync(projectSW, { encoding: 'utf-8' });
      // If no manifest is needed, then simply inject the project sw.js
      if (projectSWContent.indexOf('self.__WB_MANIFEST') === -1) {
        return new InjectSW({
          srcFile: projectSW,
        });
      }
      // If __WB_MANIFEST exists then inject it via the InjectManifest Plugin
      return new WorkboxPlugin.InjectManifest({
        swSrc: projectSW,
        swDest: 'sw.js',
      });
    }
    // If the minimal option is selected, simply inject the minimum
    // service worker for PWA
    if (this.configOptions.serviceWorker === 'minimal') {
      return new InjectSW();
    }

    // If default option is selected then inject the offline supported
    // service worker
    return new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      swDest: 'sw.js',
    });
  }

  getPlugins(): webpack.Configuration['plugins'] {
    return [
      new webpack.DefinePlugin({
        ...(this.isTargetWeb ? { 'process.env': {} } : {}),
        EnableReactStrictMode: this.configOptions.react.StrictMode && this.isDevelopment,
        EnableServiceWorker: this.configOptions.serviceWorker !== false,
      }),
      new webpack.EnvironmentPlugin({
        ...this.getFilteredEnvVars(),
      }),
      this.shouldHotReload && new webpack.HotModuleReplacementPlugin(),
      this.shouldHotReload
        && new ReactRefreshWebpackPlugin({ esModule: true, overlay: { sockProtocol: 'ws' } }),
      this.shouldHotReload
        || new MiniCssExtractPlugin({
          filename: 'css/[contenthash].css',
          chunkFilename: 'css/[chunkhash].css',
          ignoreOrder: true,
        }),
      this.isTargetServer
        && new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      this.canCopyPublicFolder() && new CopyPlugin({
        patterns: [
          {
            from: path.resolve(this.options.projectRoot, 'src', 'public'),
            to: path.join(this.getOutput()?.path ?? '', 'public'),
          },
        ],
      }),
      this.getServiceWorkerPlugin(),
    ].filter(notBoolean);
  }

  getConfig(): webpack.Configuration {
    return {
      mode: this.getMode(),
      entry: this.getEntry(),
      optimization: this.getOptimization(),
      experiments: this.getExperiments(),
      output: this.getOutput(),
      externalsPresets: this.isTargetServer ? { node: true } : undefined,
      externals: this.isTargetServer
        ? [
          nodeExternals({
            allowlist: [/@reactpwa/, /\.(css|s[ac]ss)$/i],
            additionalModuleDirs: [
              path.resolve(this.options.projectRoot, 'node_modules'),
              path.resolve(libSrc, 'node_modules'),
              path.resolve(libSrc, '..', 'node_modules'),
              path.resolve(libSrc, '..', '..', 'node_modules'),
              path.resolve(libSrc, '..', '..', '..', 'node_modules'),
            ],
          }),
        ]
        : undefined,
      module: {
        rules: [
          this.getMjsRule(),
          this.getAssetsRule(),
          this.getImagesRule(),
          this.getRawResourceRule(),
          this.getJsRule(),
          ...this.getCssRules(),
        ],
      },
      resolve: this.getResolve(),
      resolveLoader: this.getResolveLoader(),
      devtool: this.getDevtool(),
      context: this.getContext(),
      target: this.getTarget(),
      plugins: this.getPlugins(),
    };
  }
}
