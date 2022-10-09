import { notBoolean } from 'src/utils/not-boolean';
import BabelLazyRoutes from '../../babel/lazy-routes.js';

const getPresetEnvOptions = (options: { isTargetServer: boolean }) => {
  if (options.isTargetServer) {
    return [
      {
        targets: {
          node: 'current',
          esmodules: true,
        },
      },
    ];
  }

  return [
    {
      useBuiltIns: 'entry',
      corejs: 'core-js@3',
      targets: { esmodules: true },
    },
  ];
};

export const getBabelLoaderOptions = (
  options: {
    isTargetServer: boolean,
    hotReload: boolean,
  },
) => ({
  presets: [
    [
      '@babel/preset-env',
      ...(getPresetEnvOptions({ isTargetServer: options.isTargetServer })),
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
    options.hotReload && 'react-refresh/babel',
    'babel-plugin-lodash',
  ].filter(notBoolean),
});
