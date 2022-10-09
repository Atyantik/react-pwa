import { RuleSetRule } from 'webpack';

export const getMjsRule = (): RuleSetRule => ({
  test: /\.mjs$/,
  include: /node_modules/,
  type: 'javascript/auto',
});
