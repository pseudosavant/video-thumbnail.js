/**
 * TypeScript usage examples for video-thumbnail.js
 * This file demonstrates proper TypeScript usage and validates the type definitions
 */

/// <reference path="./video-thumbnail.d.ts" />

// Import the types from the namespace
import VideoThumbnail = require('./video-thumbnail.js');

// Example 1: Basic thumbnail generation with type safety
async function basicExample() {
  // Type-safe options object
  const options: VideoThumbnail.ThumbnailOptions = {
    timestamps: [0.1, 0.5, 0.9],
    size: 720,
    mime: { 
      type: 'image/jpeg', // Type-safe MIME types
      quality: 0.8 
    },
    cache: true
  };

  try {
    const thumbnails = await videoThumbnail('example.mp4', options);
    
    // Type-safe access to result properties
    thumbnails.forEach((thumbnail: VideoThumbnail.ThumbnailResult) => {
      console.log(`Thumbnail at ${thumbnail.timestamp}: ${thumbnail.sizeKB}KB`);
      console.log(`Seek time: ${thumbnail.seekTime}s, Duration: ${thumbnail.duration}ms`);
    });
  } catch (error) {
    console.error('Failed to generate thumbnails:', error);
  }
}

// Example 2: Advanced usage with all options
async function advancedExample() {
  const result = await videoThumbnail('video.mp4', {
    timestamps: [1000, 5000, 10000], // Absolute millisecond timestamps
    size: 1280,
    mime: { type: 'image/webp', quality: 0.9 },
    type: 'objectURL', // More memory efficient for large images
    cache: true,
    cacheKeyPrefix: 'my-app-thumbs',
    shouldCache: true
  });

  // Memory management
  const usage: VideoThumbnail.MemoryUsage = videoThumbnail.getMemoryUsage();
  console.log(`Memory usage: ${usage.cacheSizeKB}KB cache, ${usage.canvasPoolEntries} canvas pool entries`);

  return result;
}

// Example 3: Cache management
function cacheManagement() {
  // Get cache size
  const sizeBytes: number = videoThumbnail.cacheSize();
  console.log(`Cache size: ${Math.round(sizeBytes / 1024)}KB`);

  // Clear specific cache
  const cleared: boolean = videoThumbnail.clearCache('my-app-thumbs');
  console.log(`Cache cleared: ${cleared}`);

  // Clean up object URLs
  const cleanedUrls: number = videoThumbnail.cleanupObjectURLs();
  console.log(`Cleaned up ${cleanedUrls} object URLs`);

  // Clear canvas pool
  const poolCleared: boolean = videoThumbnail.clearCanvasPool();
  console.log(`Canvas pool cleared: ${poolCleared}`);
}

// Example 4: Error handling with typed errors
async function errorHandling() {
  try {
    await videoThumbnail('nonexistent.mp4', {
      timestamps: [0.5],
      size: 99999 // This might exceed browser limits
    });
  } catch (error) {
    if (error instanceof VideoLoadError) {
      console.error(`Failed to load video: ${error.url} - ${error.message}`);
    } else if (error instanceof CanvasError) {
      console.error(`Canvas error in ${error.operation}: ${error.message}`);
    } else if (error instanceof ValidationError) {
      console.error(`Invalid parameter ${error.parameter}: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Example 5: Type validation at compile time
function typeValidationExamples() {
  // These would cause TypeScript compilation errors:
  
  // ❌ Invalid MIME type
  // const badOptions1: VideoThumbnail.ThumbnailOptions = {
  //   mime: { type: 'image/gif' } // Error: not assignable to ImageMimeType
  // };
  
  // ❌ Invalid output type
  // const badOptions2: VideoThumbnail.ThumbnailOptions = {
  //   type: 'blob' // Error: not assignable to OutputType
  // };
  
  // ❌ Invalid quality value
  // const badOptions3: VideoThumbnail.ThumbnailOptions = {
  //   mime: { type: 'image/jpeg', quality: '0.8' } // Error: string not assignable to number
  // };

  // ✅ Valid options
  const goodOptions: VideoThumbnail.ThumbnailOptions = {
    timestamps: [0.25, 0.75],
    size: 640,
    mime: { type: 'image/png' }, // quality optional for PNG
    type: 'dataURI',
    cache: false
  };

  return goodOptions;
}

// Export examples for external usage
export {
  basicExample,
  advancedExample,
  cacheManagement,
  errorHandling,
  typeValidationExamples
};