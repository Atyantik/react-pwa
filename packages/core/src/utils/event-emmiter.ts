type Callback = (data?: any) => void;

export class DataEventEmitter {
  callbacks: Record<string, Callback[]> = {};

  on(event: string, cb: Callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(cb);
  }

  emit(event: string, data?: any) {
    const cbs = this.callbacks[event];
    if (cbs) {
      cbs.forEach((cb) => cb(data));
    }
  }
}
