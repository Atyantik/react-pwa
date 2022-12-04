export const getGeneratorOptions = (options: {
  prefix: string;
  emit: boolean;
}) => ({
  // We will use content hash for long term caching of asset
  filename: `${options.prefix}/[contenthash]-[name][ext][query]`,
  emit: options.emit,
});
