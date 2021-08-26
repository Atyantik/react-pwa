import path from 'path';

export default class ResolverWebpack {
  // eslint-disable-next-line class-methods-use-this
  apply(webpackHandler) {
    webpackHandler
      .hooks
      .beforeConfig
      .tap(
        'ResolvePath',
        (env, type, config) => {
          try {
            let conf = config;
            if (!Array.isArray(config)) {
              conf = [config];
            }
            conf.forEach((c) => {
              // eslint-disable-next-line no-param-reassign
              if (!c.resolve) c.resolve = {};
              // eslint-disable-next-line no-param-reassign
              if (!c.resolve.alias) c.resolve.alias = {};
              // eslint-disable-next-line no-param-reassign
              c.resolve.alias = {
                ...c.resolve.alias,
                '@components': path.resolve(__dirname, '../components/'),
                '@utils': path.resolve(__dirname, '../utils/'),
                '@resources': path.resolve(__dirname, '../resources/'),
                '@routes': path.resolve(__dirname, '../routes/'),
                '@pages': path.resolve(__dirname, '../pages/'),
                '@hooks': path.resolve(__dirname, '../hooks/'),
              };
            });
          } catch (ex) {
            // eslint-disable-next-line
            console.log(ex);
          }
        },
      );
  }
}
