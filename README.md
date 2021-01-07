# video-thumbnail.js
Library to convert a URL into a image [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) or [objectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

## Supported features

* Video thumbnail generation from a URL (must be `same-origin` or support `CORS`)

## How to use

### Simple
```js
async function getCoolThumbnail() {
  const url = 'https://mycool.com/videosite/video.mp4';
  const thumbnailURI = await videoThumbnail(url);
  // Do something with `thumbnailURI`
}
```

### Advanced
```js
async function getCoolThumbnail() {
  const url = 'https://mycool.com/videosite/video.mp4';
  const time = 0.1; // Grab thumbnail from 10% into the video
  const size = 480; // Maximum of 480px wide thumbnail
  const type = 'dataURI'; // `videoThumbnail` can return a `dataURI` or `objectURL`
  const cache = true; // Cache thumbnails in `localStorage`
  const timeout = 5000; // Stop trying to generate a thumbnail if it takes more than 5 seconds. Default: 30s seconds.
  const cacheKeyPrefix = 'myCustomThumbnailCacheKeyPrefix';
  const mime = {
    type: 'image/jpeg',
    quality: 0.5 // Quality is not required for `image/png`
  };
  const thumbnailURI = await videoThumbnail(url, {time, size, type, mime, cache, cacheKeyPrefix, timeout});
  // Do something with `thumbnailURI`
}
```

### Clearing `localStorage` cache
```js
videoThumbnail.clearCache() // Clears the thumbnails cached with the default cache key prefix ('video-thumbnail.js')
```

```js
videoThumbnail.clearCache('myCustomThumbnailCacheKeyPrefix') // Clears the thumbnails cached with the custom cache key prefix 'myCustomThumbnailCacheKeyPrefix'
```

## Data URI vs Object URL?

### Data URI

* Pros: string is portable across contexts
* Cons: Synchronous generation of the image file

## Supported Browsers

The latest version of these browsers is supported:

* Safari (iOS and Mac)
* Edge (Chromium)
* Firefox
* Chrome

## License

* [MIT](./LICENSE)

&copy; 2020 Paul Ellis
