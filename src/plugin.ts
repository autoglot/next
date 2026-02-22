// Minimal webpack compiler type — avoids requiring webpack as a dependency.
// Next.js provides the real compiler at runtime.
interface WebpackCompiler {
  hooks: {
    done: {
      tapPromise(name: string, fn: () => Promise<void>): void;
    };
  };
}

export class AutoglotWebpackPlugin {
  private run: () => Promise<void>;

  constructor(_options: unknown, run: () => Promise<void>) {
    this.run = run;
  }

  apply(compiler: WebpackCompiler) {
    compiler.hooks.done.tapPromise("AutoglotPlugin", this.run);
  }
}
