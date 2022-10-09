export const getGeneratorOptions = (
  options: {
    prefix: string,
    useBuildtimeGeneratorOptions: boolean,
    withBuild: boolean
  },
) => {
  if (options.useBuildtimeGeneratorOptions) {
    return {
      // We will use content hash for long term caching of asset
      filename: '[contenthash]-[name][ext][query]',
      outputPath: options.withBuild ? `./build/${options.prefix}` : `./${options.prefix}`,
      publicPath: `/${options.prefix}/`,
    };
  }
  return {
    // We will use content hash for long term caching of asset
    filename: `${options.prefix}/[contenthash]-[name][ext][query]`,
  };
};
