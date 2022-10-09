import autoprefixer from 'autoprefixer';

export const getPostcssLoaderOptions = () => ({
  postcssOptions: {
    ident: 'postcss',
    plugins: [[autoprefixer]],
  },
});
