import { translate } from "@autoglot/cli";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import type { AutoglotOptions } from "./index.js";

function detectSourceLanguage(filename: string): string {
  const name = basename(filename, extname(filename));
  if (/^[a-z]{2}(-[A-Z]{2})?$/.test(name)) {
    return name.split("-")[0];
  }
  return "en";
}

export async function runTranslation(opts: AutoglotOptions): Promise<void> {
  const apiKey = opts.apiKey || process.env.AUTOGLOT_API_KEY || "";

  if (!apiKey) {
    console.error(
      "[autoglot] API key is required. Set AUTOGLOT_API_KEY or pass apiKey option."
    );
    return;
  }

  const sourcePath = resolve(opts.source);
  const sourceLanguage =
    opts.sourceLanguage || detectSourceLanguage(basename(sourcePath));

  let content: string;
  try {
    content = readFileSync(sourcePath, "utf-8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[autoglot] Failed to read source file: ${msg}`);
    return;
  }

  const filename = basename(sourcePath);

  console.log(
    `[autoglot] Translating ${filename} into ${opts.lang.join(", ")}...`
  );

  try {
    const files = await translate({
      files: [{ filename, content }],
      targetLanguages: opts.lang,
      sourceLanguage,
      apiKey,
      apiUrl: opts.apiUrl,
      skipCache: opts.skipCache,
      onProgress: (status) => {
        if (status.total_strings > 0) {
          console.log(
            `[autoglot] ${status.completed_strings}/${status.total_strings} strings (${status.progress}%)`
          );
        }
      },
    });

    const outputDir = dirname(sourcePath);
    for (const file of files) {
      const outPath = resolve(outputDir, file.filename);
      mkdirSync(dirname(outPath), { recursive: true });
      const outContent =
        typeof file.content === "string"
          ? file.content
          : JSON.stringify(file.content, null, 2);
      writeFileSync(outPath, outContent, "utf-8");
    }

    console.log(`[autoglot] Done — ${files.length} file(s) written.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[autoglot] Translation failed: ${msg}`);
  }
}
