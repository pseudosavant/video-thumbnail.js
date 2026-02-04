# Repository Guidelines

## Project Structure and Module Organization

- `src/video-thumbnail.js` is the main ESM module and runtime implementation.
- `src/video-thumbnail.d.ts` provides TypeScript typings.
- `src/performance-test.html` and `src/typescript-examples.ts` are local test harness/examples.
- `videos/` contains sample media used by the test harness.
- `README.md` documents the public API and usage patterns.

## Build, Test, and Development Commands

There are no npm scripts in `package.json`. This library is designed to run in the browser, so use a local static server to load modules over HTTP.

Examples:

```bash
npx http-server .
```

Then open `src/performance-test.html` in the browser through the server URL (not `file://`).

## Coding Style and Naming Conventions

- JavaScript is ESM-only (`"type": "module"`), so use `import`/`export`.
- Indentation is two spaces, with semicolons.
- Prefer descriptive, lowerCamelCase names for functions and variables (e.g., `getVideo`, `cacheKeyPrefix`).
- Public API is defined in `src/video-thumbnail.js` and mirrored in `src/video-thumbnail.d.ts`. Keep them in sync.

## Testing Guidelines

There is no automated test runner in this repo. Manual verification uses:

- `src/performance-test.html` as the browser harness.
- Sample media under `videos/` for local playback.

When changing thumbnail generation, validate:

- data URI output and object URL output.
- caching paths (localStorage) and cleanup functions.
- timing fields on results (`timing`, `seekMs`, `encodeMs`).

## Commit and Pull Request Guidelines

Recent commit history uses short, descriptive summaries, often prefixed with a version tag (e.g., `v2.0.0 Release`). Follow that pattern for release or versioned changes. For feature work, use concise present-tense summaries (e.g., `Add cache read-only option`).

Pull requests should include:

- A short description of the change and why it matters.
- Any API or behavioral changes called out explicitly.
- If modifying the test harness, include a brief note on how you verified it (browser + sample video used).

## Configuration Notes

- The module relies on browser APIs (HTML5 video, canvas, localStorage).
- Video URLs must be same-origin or CORS-enabled. Use a dev server in testing.
