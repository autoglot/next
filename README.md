# @autoglot/next

Automatic i18n translation for Next.js. Wraps your Next.js config so translations run after every production build — no manual step required.

Works with both **webpack** and **Turbopack**.

## Quick start

```bash
npm install @autoglot/next @autoglot/cli
```

```javascript
// next.config.mjs
import { withAutoglot } from '@autoglot/next';

export default withAutoglot({
  source: 'src/locales/en.json',
  lang: ['es', 'fr', 'de'],
})({
  // your existing next config
});
```

Set your API key:

```bash
export AUTOGLOT_API_KEY=your_key_here
```

Run `next build` and translations appear alongside your source file.

## Setup

1. Sign up at [autoglot.app](https://autoglot.app)
2. Go to [dashboard / API keys](https://autoglot.app/dashboard/api-keys) and create a key
3. Add `AUTOGLOT_API_KEY` to your environment (`.env.local`, CI secrets, etc.)
4. Install the packages:

```bash
npm install @autoglot/next @autoglot/cli
```

## Configuration

`withAutoglot(options)` takes an options object and returns a function that wraps your Next.js config.

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `source` | `string` | Yes | | Path to source translation file (e.g. `src/locales/en.json`) |
| `lang` | `string[]` | Yes | | Target language codes |
| `sourceLanguage` | `string` | No | Auto-detect from filename | Source language code |
| `apiKey` | `string` | No | `AUTOGLOT_API_KEY` env var | API key |
| `apiUrl` | `string` | No | `https://api.autoglot.app` | API base URL |
| `skipCache` | `boolean` | No | `false` | Skip translation cache |

### Output

Translated files are written next to the source file. For example, given `source: "src/locales/en.json"` and `lang: ["es", "fr"]`, you'll get:

```
src/locales/
  en.json       ← your source (untouched)
  es.json       ← generated
  fr.json       ← generated
```

## Examples

### Basic i18next setup

```javascript
// next.config.mjs
import { withAutoglot } from '@autoglot/next';

export default withAutoglot({
  source: 'public/locales/en/common.json',
  lang: ['es', 'fr', 'de', 'ja'],
})({});
```

### With existing Next.js config

```javascript
// next.config.mjs
import { withAutoglot } from '@autoglot/next';

const nextConfig = {
  reactStrictMode: true,
  images: { domains: ['example.com'] },
};

export default withAutoglot({
  source: 'src/locales/en.json',
  lang: ['es', 'fr'],
})(nextConfig);
```

### Composing with other plugins

```javascript
// next.config.mjs
import { withAutoglot } from '@autoglot/next';
import createMDX from '@next/mdx';

const withMDX = createMDX();

export default withAutoglot({
  source: 'src/locales/en.json',
  lang: ['es', 'fr', 'de'],
})(withMDX({
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}));
```

### Explicit source language

```javascript
export default withAutoglot({
  source: 'locales/messages.json',
  lang: ['fr', 'de'],
  sourceLanguage: 'en',
})({});
```

### Skip cache for fresh translations

```javascript
export default withAutoglot({
  source: 'src/locales/en.json',
  lang: ['es'],
  skipCache: true,
})({});
```

### Only in production builds

Translations only run during `next build`, not `next dev`. The plugin hooks into the production compilation lifecycle, so no extra configuration is needed.

## How it works

1. **Next.js 15.4.1+** — uses the built-in `compiler.runAfterProductionCompile` hook, which works with both webpack and Turbopack
2. **Older versions** — falls back to a webpack plugin that runs on the `done` hook (after compilation completes)
3. If both mechanisms are available, a deduplication guard ensures translation only runs once

The plugin reads your source file, sends it to the autoglot API, polls until translation completes, and writes the translated files to disk.

## Supported file formats

| Format | Extension |
|--------|-----------|
| JSON | `.json` |
| YAML | `.yml`, `.yaml` |
| PO/POT | `.po`, `.pot` |
| Xcode String Catalog | `.xcstrings` |

## Supported languages

| Code | Language | Code | Language |
|------|----------|------|----------|
| `de` | German | `ja` | Japanese |
| `fr` | French | `ko` | Korean |
| `es` | Spanish | `zh-Hans` | Simplified Chinese |
| `it` | Italian | `zh-Hant` | Traditional Chinese |
| `pt` | Portuguese | `ar` | Arabic |
| `pt-BR` | Brazilian Portuguese | `he` | Hebrew |
| `nl` | Dutch | `hi` | Hindi |
| `pl` | Polish | `th` | Thai |
| `ru` | Russian | `vi` | Vietnamese |
| `uk` | Ukrainian | `id` | Indonesian |
| `tr` | Turkish | `ms` | Malay |
| `sv` | Swedish | `cs` | Czech |
| `da` | Danish | `hu` | Hungarian |
| `fi` | Finnish | `ro` | Romanian |
| `nb` | Norwegian | `sk` | Slovak |
| `el` | Greek | `bg` | Bulgarian |

## Links

- [autoglot dashboard](https://autoglot.app/dashboard)
- [Get API key](https://autoglot.app/dashboard/api-keys)
- [@autoglot/cli](https://github.com/autoglot/cli) — standalone CLI and library
- [Report issues](https://github.com/autoglot/next/issues)
