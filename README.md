# developer-json-toolkit

A browser-only JSON workbench built with Vite, React, strict TypeScript, Tailwind CSS and lucide-react. No backend, external APIs, editor framework or tracking.

## Setup

Requires Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To produce a static release:

```sh
npm run build
```

Deploy the generated `dist/` directory to any static web host. `npm run preview` previews a production build locally; `npm run typecheck` checks strict TypeScript. No application server is required. The app uses relative asset paths for subdirectory hosting.

## Features

- Responsive input and output panes; native monospace textareas.
- Format with two spaces, minify, or validate while preserving original text.
- Copy output, download valid JSON, upload `.json`, load a sample, and clear.
- Objects, arrays, strings, numbers, booleans, and null are supported.
- Friendly parse errors include the browser's original error detail. When a character offset is supplied, the UI reports a one-based character and approximate line. Engines without a location do not get an invented one.
- Character counts, nesting depth, root type, and root object key count. Non-object key counts are N/A. Scalars have depth zero; a root container has depth one. Parsed stats update only after a successful action.
- Dark/light theme, output line wrapping, visible keyboard focus, labelled controls and live status messages.
- Ctrl/Cmd+Enter formats; Ctrl/Cmd+Shift+Enter minifies while in the input editor. Tab moves between controls. Output supports native selection and copy.
- Data stays in memory on the current page; refreshing resets it. No persistence or network requests for document contents.

## Limits and behavior

Input is limited to 100,000 JavaScript string characters (UTF-16 code units). Oversized pastes are rejected intact; native typing is capped by the textarea. Uploads are limited to 100,000 bytes (100 KB) and must have a `.json` extension. UTF-8 non-ASCII files may reach the byte cap before the character cap. Maximum nesting depth is 100 and maximum displayed output is 1,000,000 characters. The iterative depth scan avoids recursive traversal, and limits bound synchronous parsing and formatting work.

Invalid parsing never alters input and clears previous output. Editing input also clears output and parsed statistics, so stale data cannot be downloaded. A valid output is required to enable copy/download. Upload selection and read failures preserve existing content. Clipboard access needs a secure context (HTTPS or localhost); if unavailable, select and copy the output manually.

JSON uses native JavaScript parsing semantics: duplicate keys retain the last value; numbers can lose precision beyond JavaScript's safe range, and extreme exponents can become Infinity (serialized as null). This is not a lossless large-number editor. JSON comments, trailing commas, and a leading byte-order mark are rejected by the native parser. Format/minify normalize values through `JSON.stringify`; Validate preserves the original accepted text.

## Screenshot

<img width="1895" height="905" alt="image" src="https://github.com/user-attachments/assets/cc2aab32-f7ac-4d94-b652-8f4ca6db25ca" />


## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite for local development |
| `npm run build` | Strict type check and production build |
| `npm run preview` | Preview the built static files |
| `npm run typecheck` | Check TypeScript without emitting files |

No tests are included, as requested.
