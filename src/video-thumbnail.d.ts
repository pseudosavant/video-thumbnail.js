/**
 * ESM Type definitions for video-thumbnail.js
 * Source: https://github.com/pseudosavant/video-thumbnail.js
 * License: MIT
 */

export type ImageMimeType = 'image/jpeg' | 'image/webp' | 'image/png';
export type OutputType = 'dataURI' | 'objectURL';
export type Timestamps = number | number[];

export type TimingPhase = 'load' | 'seek' | 'encode' | 'total';
export type TimingWhen = 'start' | 'end';
export interface TimingEvent {
  phase: TimingPhase;
  when: TimingWhen;
  ts: number; // performance.now() timestamp (ms)
  index?: number; // index of the thumbnail when multiple timestamps are used
  error?: boolean; // true when an error occurred within the phase
}

export interface MimeOptions {
  /** Image mime type. Defaults to 'image/jpeg'. */
  type?: ImageMimeType;
  /** Quality between 0 and 1, when applicable to the format. */
  quality?: number;
}

export interface Options {
  /** One or more timestamps to capture. Defaults to [0.1]. */
  timestamps?: Timestamps;
  /** Output width (pixels). Height is derived from video aspect ratio. Defaults to 480. */
  size?: number;
  /** Image encoding options (mime type and quality). */
  mime?: MimeOptions;
  /** Output type. 'dataURI' (default) or 'objectURL'. */
  type?: OutputType;
  /** Whether to use localStorage-based caching (default: false). */
  cache?: boolean;
  /** Prefix for cache keys in localStorage. */
  cacheKeyPrefix?: string;
  /** If true, only read from cache; do not generate new thumbnails. */
  cacheReadOnly?: boolean;
  /** Enable console logging for debug output (default: false). */
  debug?: boolean;
  /** Optional callback for detailed timing instrumentation. */
  onTiming?: (event: TimingEvent) => void;
}

export interface MemoryUsage {
  cacheSizeBytes: number;
  cacheSizeKB: number;
  canvasPoolEntries: number;
  activeObjectURLs: number;
}

export interface ThumbnailResult {
  /** Data URI or Blob object URL, depending on Options.type. */
  URI: string;
  /** The timestamp requested for this thumbnail. */
  timestamp: number;
  /** Total time spent generating this thumbnail (ms). */
  duration: number;
  /** Resolved mime settings used for encoding the image. */
  mime: { type: ImageMimeType; quality?: number };
  /** Actual seek time used (in seconds), if applicable. */
  seekTime?: number;
  /** Seek operation time for this thumbnail (ms). */
  seekMs?: number;
  /** Encode operation time for this thumbnail (ms). */
  encodeMs?: number;
  /** Approximate encoded size (KB). */
  sizeKB?: number;
}

export interface TimingAggregate {
  loadMs: number;
  totalMs: number;
  seeksMs: number[];
  encodesMs: number[];
  seekMsTotal: number;
  encodeMsTotal: number;
}

export type ThumbnailResults = ThumbnailResult[] & { timing: TimingAggregate };

/**
 * Generate one or more thumbnails from a video URL.
 *
 * Notes:
 * - When options.type is 'dataURI' (default), the returned URI is a data URL.
 * - When options.type is 'objectURL', the returned URI is a blob URL. Call
 *   cleanupObjectURLs() to revoke them when no longer needed.
 */
export default function videoThumbnail(
  url: string,
  options?: Options
): Promise<ThumbnailResults>;

/** Remove all cached thumbnails from localStorage for the given prefix (or the default prefix). */
export function clearCache(prefix?: string): boolean;

/** Returns the total size in bytes of all cached thumbnails in localStorage. */
export function cacheSize(prefix?: string): number;

/** Return a snapshot of current memory/resource usage. */
export function getMemoryUsage(): MemoryUsage;

/** Revoke all Blob object URLs that were created by this library. */
export function cleanupObjectURLs(): number;

/** Clear the internal canvas pool. */
export function clearCanvasPool(): boolean;
/**
 * Type definitions for video-thumbnail.js
 * Source: https://github.com/pseudosavant/video-thumbnail.js
 * License: MIT
 */

/**
 * Generate one or more thumbnails from a video URL.
 *
 * Notes:
 * - When options.type is 'dataURI' (default), the returned URI is a data URL.
 * - When options.type is 'objectURL', the returned URI is a blob URL. Call
 *   videoThumbnail.cleanupObjectURLs() to revoke them when no longer needed.
 */
declare function videoThumbnail(
  url: string,
  options?: videoThumbnail.Options
): Promise<videoThumbnail.ThumbnailResults>;

declare namespace videoThumbnail {
  /** Supported image mime types for output */
  type ImageMimeType = 'image/jpeg' | 'image/webp' | 'image/png';

  /** Output type: data URI (default) or object URL from a Blob */
  type OutputType = 'dataURI' | 'objectURL';

  /** Timestamp(s) to capture. Values in [0,1) are treated as relative seconds; >= 1 as absolute seconds. */
  type Timestamps = number | number[];

  type TimingPhase = 'load' | 'seek' | 'encode' | 'total';
  type TimingWhen = 'start' | 'end';
  interface TimingEvent {
    phase: TimingPhase;
    when: TimingWhen;
    ts: number;
    index?: number;
    error?: boolean;
  }

  /** Encoding options for the output image */
  interface MimeOptions {
    /** Image mime type. Defaults to 'image/jpeg'. */
    type?: ImageMimeType;
    /** Quality between 0 and 1, when applicable to the format. */
    quality?: number;
  }

  /** Options accepted by videoThumbnail() */
  interface Options {
    /** One or more timestamps to capture. Defaults to [0.1]. */
    timestamps?: Timestamps;
    /** Output width (pixels). Height is derived from video aspect ratio. Defaults to 480. */
    size?: number;
    /** Image encoding options (mime type and quality). */
    mime?: MimeOptions;
    /** Output type. 'dataURI' (default) or 'objectURL'. */
    type?: OutputType;
    /** Whether to use localStorage-based caching (default: false). */
    cache?: boolean;
    /** Prefix for cache keys in localStorage. */
    cacheKeyPrefix?: string;
    /** If true, only read from cache; do not generate new thumbnails. */
    cacheReadOnly?: boolean;
    /** Enable console logging for debug output (default: false). */
    debug?: boolean;
    /** Optional callback for detailed timing instrumentation. */
    onTiming?: (event: TimingEvent) => void;
  }

  /** Basic information about memory/resource usage reported by the library */
  interface MemoryUsage {
    cacheSizeBytes: number;
    cacheSizeKB: number;
    canvasPoolEntries: number;
    activeObjectURLs: number;
  }

  /** Result object for each generated thumbnail */
  interface ThumbnailResult {
    /** Data URI or Blob object URL, depending on Options.type. */
    URI: string;
    /** The timestamp requested for this thumbnail. */
    timestamp: number;
    /** Total time spent generating this thumbnail (ms). */
    duration: number;
    /** Resolved mime settings used for encoding the image. */
    mime: { type: ImageMimeType; quality?: number };
    /** Actual seek time used (in seconds), if applicable. */
    seekTime?: number;
    /** Seek operation time for this thumbnail (ms). */
    seekMs?: number;
    /** Encode operation time for this thumbnail (ms). */
    encodeMs?: number;
    /** Approximate encoded size (KB). */
    sizeKB?: number;
  }

  interface TimingAggregate {
    loadMs: number;
    totalMs: number;
    seeksMs: number[];
    encodesMs: number[];
    seekMsTotal: number;
    encodeMsTotal: number;
  }

  type ThumbnailResults = ThumbnailResult[] & { timing: TimingAggregate };

  /**
   * Remove all cached thumbnails from localStorage for the given prefix (or the default prefix).
   * Returns true when completed.
   */
  function clearCache(prefix?: string): boolean;

  /** Returns the total size in bytes of all cached thumbnails in localStorage. */
  function cacheSize(prefix?: string): number;

  /** Return a snapshot of current memory/resource usage. */
  function getMemoryUsage(): MemoryUsage;

  /** Revoke all Blob object URLs that were created by this library. */
  function cleanupObjectURLs(): number;

  /** Clear the internal canvas pool. */
  function clearCanvasPool(): boolean;
}

export = videoThumbnail;
export as namespace videoThumbnail;
