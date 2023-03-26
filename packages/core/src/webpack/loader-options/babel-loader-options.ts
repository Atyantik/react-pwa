import { notBoolean } from '../../utils/not-boolean.js';

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

export const getBabelLoaderOptions = (options: {
  isTargetServer: boolean;
  hotReload: boolean;
  useCache: boolean;
}) => ({
  cacheDirectory: options.useCache,
  // Disabling cache-compression, as it will occupy more space on disk, however
  // it is faster to read rather than decompress it.
  cacheCompression: false,
  presets: [
    [
      '@babel/preset-env',
      ...getPresetEnvOptions({ isTargetServer: options.isTargetServer }),
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
  plugins: [options.hotReload && 'react-refresh/babel'].filter(notBoolean),
});
