import { RuleSetRule } from 'webpack';

export const getRawResourceRule = (options: {
  emit: boolean;
}): RuleSetRule => ({
  resourceQuery: /raw/,
  type: 'asset/source',
  generator: {
    emit: options.emit,
  },
});
