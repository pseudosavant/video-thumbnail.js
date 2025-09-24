# video-thumbnail.js (ESM-only)

Generate video thumbnails in the browser as [data URIs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) or [object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

## Features

- Generate one or multiple thumbnails from an HTML5 video URL
- Works with same-origin videos or cross-origin with CORS enabled
- Output as data URI (default) or object URL (Blob)
- Canvas pooling, caching helpers, and timing instrumentation

## Usage

### Basic

```js
import videoThumbnail from 'video-thumbnail.js';

const thumbs = await videoThumbnail('https://example.com/video.mp4');
// thumbs is an array of
// { URI, timestamp, duration, mime, seekTime?, seekMs?, encodeMs?, sizeKB? }
// The returned array also has a non-enumerable aggregate timing object: thumbs.timing
```

### Advanced

```js
import videoThumbnail, { clearCache } from 'video-thumbnail.js';

const url = 'https://example.com/video.mp4';
const options = {
  timestamps: [0.1, 0.5, 10], // relative (0..1) or absolute seconds (>=1)
  size: 480,                  // width in px, height is based on aspect ratio
  type: 'dataURI',            // 'dataURI' (default) or 'objectURL'
  cache: true,                // use localStorage caching
  cacheKeyPrefix: 'my-thumbs',
  mime: { type: 'image/jpeg', quality: 0.8 },
  onTiming: (e) => console.log(e), // optional timing events
};

const thumbs = await videoThumbnail(url, options);
// Do something with thumbs[0].URI, etc.

// Clear cached thumbnails for your prefix
clearCache('my-thumbs');
```

### Object URLs (Blob) and cleanup

```js
import videoThumbnail, { cleanupObjectURLs } from 'video-thumbnail.js';

const thumbs = await videoThumbnail('/videos/sample.mp4', { type: 'objectURL' });
// Use thumbs[0].URI in an <img src="...">, then when finished:
cleanupObjectURLs();
```

## API

Default export:

- `videoThumbnail(url: string, options?: Options): Promise<ThumbnailResults>`

Named exports:

- `clearCache(prefix?: string): boolean`
- `cacheSize(prefix?: string): number`
- `getMemoryUsage(): { cacheSizeBytes, cacheSizeKB, canvasPoolEntries, activeObjectURLs }`
- `cleanupObjectURLs(): number` (returns count revoked)
- `clearCanvasPool(): boolean`

Options:

- `timestamps`: number | number[] — values in (0,1) are relative; >= 1 are absolute seconds
- `size`: number — output width in px (height maintains aspect ratio)
- `mime`: `{ type: 'image/jpeg' | 'image/webp' | 'image/png', quality?: number }`
- `type`: 'dataURI' | 'objectURL'
- `cache`: boolean
- `cacheKeyPrefix`: string
- `cacheReadOnly`: boolean (read cache only; don’t generate)
- `onTiming`: (event) => void (receive per-phase timing)

Result:

- `{ URI: string, timestamp: number, duration: number, mime: { type, quality? }, seekTime?: number, seekMs?: number, encodeMs?: number, sizeKB?: number }`
- The returned array also has a non-enumerable `timing` aggregate: `{ loadMs, totalMs, seeksMs, encodesMs, seekMsTotal, encodeMsTotal }`

## Notes

- Requires a web server (don’t open modules via file://). Use a dev server so the browser can import modules by URL.
- Video URLs must be same-origin or support CORS.
- JPEG is the default and most widely supported output. WebP support for canvas encoding is browser-dependent.

## Supported Browsers

Latest versions of:

- Safari (iOS and macOS)
- Edge (Chromium)
- Firefox
- Chrome

## License

[MIT](./LICENSE)

© 2025 Paul Ellis
