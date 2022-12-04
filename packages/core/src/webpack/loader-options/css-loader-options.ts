const getLocalIdentName = (options: { detailed: boolean }) => (options.detailed
  ? '[name]__[local]--[hash:base64:5]'
  : '[contenthash:base64:5]');

export const getCssLoaderOptions = (options: {
  sourceMap: boolean;
  detailedIdentName: boolean;
  context: string;
}) => ({
  sourceMap: options.sourceMap,
  modules: {
    localIdentName: getLocalIdentName({ detailed: options.detailedIdentName }),
    localIdentContext: options.context,
    mode: (resourcePath: string) => {
      if (/pure\.(css|s[ac]ss)$/i.test(resourcePath)) {
        return 'pure';
      }
      if (
        /global\.(css|s[ac]ss)$/i.test(resourcePath)
        || /(node_modules|src\/resources|src\\resources)/i.test(resourcePath)
      ) {
        return 'global';
      }
      return 'local';
    },
  },
  importLoaders: 2,
});
