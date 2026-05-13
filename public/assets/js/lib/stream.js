((global) => {
  // Mutable ref for closures; withLatestFrom may emit [undefined, y] before `other` has emitted.
  const mutableRef = (initial) => {
    let v = initial;
    return {
      read: () => v,
      write: (x) => {
        v = x;
      },
    };
  };

  class Stream {
    constructor(generator) {
      this.paused = false;
      this.generator = generator;
    }
    subscribe(listener) {
      this.generator((x) => {
        if (!this.paused) {
          this.last = x;
          listener(x);
        }
      });
    }

    filter(pred) {
      return new Stream((next) => {
        // llamar al g anterior
        // cada ver que g a. emita x
        //   si pred(x) emitir
        this.generator((x) => {
          if (pred(x)) next(x);
        });
      });
    }

    map(fn) {
      return new Stream((next) => {
        // llamar al g anterior
        // cada vez que g a. emita x
        //   emitir fn(x)
        this.generator((x) => {
          next(fn(x));
        });
      });
    }

    scan(fn, i) {
      return new Stream((next) => {
        const acc = mutableRef(i);
        this.generator((x) => {
          const nextAcc = fn(acc.read(), x);
          acc.write(nextAcc);
          next(nextAcc);
        });
      });
    }

    withLatestFrom(other) {
      return new Stream((next) => {
        const latest = mutableRef(undefined);
        other.subscribe((x) => {
          latest.write(x);
        });
        this.generator((y) => {
          next([latest.read(), y]);
        });
      });
    }

    getLast() {
      return this.last;
    }

    pause() {
      this.paused = true;
      return this.paused;
    }

    resume() {
      this.paused = false;
      return this.paused;
    }
  }

  Stream.of = (...xs) => {
    return new Stream((next) => {
      xs.forEach(next);
    });
  };

  Stream.pauseAll = (...xs) => xs.forEach((x) => x.pause());
  Stream.resumeAll = (...xs) => xs.forEach((x) => x.resume());

  Stream.merge = (...streams) => {
    return new Stream((next) => {
      // llamar a los g de streams
      // coda vez que cualquier stream en streams emita x
      //   emitir x
      streams.forEach((stream) => {
        stream.subscribe(next);
      });
    });
  };

  global.Stream = Stream;
})(window);
