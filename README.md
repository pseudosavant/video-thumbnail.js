# video-thumbnail.js
Library to convert a URL into a image data URI

### Supported features

* Video thumbnail generation from a URL (must be `same-origin` or support `CORS`)

### How to use

#### Simple
```js
async function getCoolThumbnail() {
  const url = 'https://mycool.com/videosite/video.mp4';
  const thumbnailURI = await videoThumbnail(url);
  // Do something with `thumbnailURI`
}
```

#### Advanced
```js
async function getCoolThumbnail() {
  const url = 'https://mycool.com/videosite/video.mp4';
  const time = 0.1; // Grab thumbnail from 10% into the video
  const size = 480; // Maximum of 480px wide thumbnail
  const type = 'dataURI'; // `videoThumbnail` can return a `dataURI` or `objectURL`
  const mime = {
    type: 'image/jpeg',
    quality: 0.5 // Quality is not required for `image/png`
  };
  const thumbnailURI = await videoThumbnail(url, {time, size, type, mime});
  // Do something with `thumbnailURI`
}
```

## Supported Browsers

The latest version of these browsers is supported:

* Safari (iOS and Mac)
* Edge (Chromium)
* Firefox
* Chrome

## License

* [MIT](./LICENSE)

&copy; 2020 Paul Ellis
