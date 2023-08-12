import xxhash from 'xxhash-wasm';

const { h32ToString } = await xxhash();

export const hash = h32ToString;
