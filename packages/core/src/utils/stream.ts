import { Duplex } from 'node:stream';

export class PwaStream extends Duplex {
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _read() {}

  // Writes the data, push and set the delay/timeout
  // eslint-disable-next-line no-underscore-dangle
  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.push(chunk);
    callback();
  }

  // When all the data is done passing, it stops.
  // eslint-disable-next-line no-underscore-dangle
  _final() {
    this.push(null);
  }
}
