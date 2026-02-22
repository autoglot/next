import type { NextConfig } from "next";
import { AutoglotWebpackPlugin } from "./plugin.js";
import { runTranslation } from "./translate.js";

export interface AutoglotOptions {
  /** Path to source file, e.g. "src/locales/en.json" */
  source: string;
  /** Target languages, e.g. ["es", "fr", "de"] */
  lang: string[];
  /** Source language (default: auto-detect from filename) */
  sourceLanguage?: string;
  /** API key (default: AUTOGLOT_API_KEY env var) */
  apiKey?: string;
  /** API base URL (default: production) */
  apiUrl?: string;
  /** Project for glossary/style guide (owner/repo format, e.g. "acme/my-app") */
  project?: string;
  /** Skip translation cache */
  skipCache?: boolean;
}

export function withAutoglot(options: AutoglotOptions) {
  // Prevents translation from running twice when both
  // runAfterProductionCompile and the webpack plugin are active.
  let hasRun = false;
  const runOnce = async () => {
    if (hasRun) return;
    hasRun = true;
    await runTranslation(options);
  };

  return (nextConfig: NextConfig): NextConfig => {
    return {
      ...nextConfig,
      compiler: {
        ...((nextConfig as Record<string, unknown>).compiler as Record<string, unknown> ?? {}),
        // Bundler-agnostic hook — works with both webpack and Turbopack.
        // Available since Next.js 15.4.1. Ignored by older versions.
        runAfterProductionCompile: runOnce,
      },
      // Webpack fallback for Next.js < 15.4.1 (no runAfterProductionCompile).
      // On Turbopack builds this function is never called.
      webpack(config, context) {
        if (!context.isServer) {
          config.plugins!.push(new AutoglotWebpackPlugin(options, runOnce));
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, context);
        }
        return config;
      },
    };
  };
}
