export function notBoolean<T>(i: T): i is Exclude<T, boolean> {
  return typeof i !== 'boolean';
}
