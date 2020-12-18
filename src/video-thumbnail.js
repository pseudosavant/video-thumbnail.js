(function videoThumbnailIIFE(global) {
  function canThumbnail() {
    const falseMessage = '[video-thumbnail]: unsupported browser (must support `createImageBitmap`)';

    // Must support `createImageBitmap`
    const supported = !!window.createImageBitmap;

    if (!supported) console.info(falseMessage);
    return supported;
  }
  const supportsThumbnails = canThumbnail();

  // Thumbnail generation
  function getVideo(url) {
    const $player = document.createElement('video');
    $player.crossorigin = 'anonymous';
    $player.muted = true;
    $player.autoplay = false;
    $player.preload = false;
    $player.playbackRate = 0;

    const event = 'loadedmetadata';
    const promise = new Promise((resolve, reject) => {
      $player.addEventListener(event, function loadedmetadata() {
        $player.pause();
        resolve($player);
      }, false);

      $player.addEventListener('error', reject);
    });
    $player.src = url;

    return promise;
  }

  async function cibOptsSupport() {
    const c = document.createElement('canvas');
    c.width = 10;
    c.height = 10;

    try {
      const bitmap = await createImageBitmap(c, 0, 0, 10, 10, { resizeWidth: 1 })
      return bitmap.width === 1;
    } catch (e) {
      return false;
    }
  }

  function getBitmap(videoSrc, time, size) {
    const $player = videoSrc;

    const promise = new Promise((resolve, reject) => {
      $player.addEventListener('seeked', async function seeked() {
        var bitmap;
        // Check for `createImageBitmap` options support
        if (await cibOptsSupport()) {
          const cibOpts = {
            resizeWidth: size,
            resizeQuality: 'high'
          };
          bitmap = createImageBitmap($player, cibOpts);
        } else {
          // Fall back to `canvas.drawImage` for scaling
          const aspectRatio = $player.videoHeight / $player.videoWidth;
          const w = size;
          const h = w * aspectRatio;

          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;

          const ctx = c.getContext('2d');
          ctx.drawImage($player, 0, 0, w, h);
          bitmap = createImageBitmap(c);
        }

        return bitmap.then(resolve).catch(reject);
      }, false);

      $player.addEventListener('error', reject);
    });

    // Relative seek if `0 < time < 1`, absolute otherwise
    const seekTime = (betweenZeroAndOne(time) ? time * $player.duration : time);
    $player.currentTime = seekTime;

    return promise;
  }

  function betweenZeroAndOne(n) {
    return (n > 0 && n < 1);
  }

  function bitmapToOffscreenCanvas(bitmap) {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

    const ctx = canvas.getContext('bitmaprenderer');
    ctx.transferFromImageBitmap(bitmap);

    return canvas;
  }

  function bitmapToDataURI(bitmap, mime, type) {
    const p = new Promise(async (resolve, reject) => {
      const blob = await bitmapToBlob(bitmap, mime);

      if (type === 'objectURL') {
        resolve(URL.createObjectURL(blob));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }
    });

    return p;
  }

  async function bitmapToBlob(bitmap, mime) {
    if (!!window.OffscreenCanvas) {
      const canvas = bitmapToOffscreenCanvas(bitmap);
      const blob = await canvas.convertToBlob(mime);
      return blob;
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
  
      const ctx = canvas.getContext('2d');
  
      ctx.drawImage(bitmap, bitmap.width, bitmap.height);
  
      const p = new Promise((resolve, reject) => {
        const type = mime.type;
        const quality = mime.quality;
        canvas.toBlob(resolve, type, quality);
      });

      return p;
    }
  }

  async function getThumbnailDataURI(url, opts) {
    if (!supportsThumbnails) {
      console.error('[video-thumbnail]: unsupported browser (must support `createImageBitmap`)');
      return;
    }

    const def = {
      time: 0.1,
      size: 480,
      mime: { type: 'image/png' },
      type: 'dataURI'
    };

    const isImageMimeType = (s) => (/image\/.+/i).test(s);

    const time = (typeof opts.time === 'number' && opts.time >= 0 ? opts.time : def.size);
    const size = (typeof opts.size === 'number' && opts.size >  0 ? opts.size : def.size);
    const mime = (opts.mime && isImageMimeType(opts.mime.type)    ? opts.mime : def.mime);
    const type = (opts.type === 'objectURL'                       ? opts.type : def.type);

    try {
      const $player = await getVideo(url);
      const bitmap = await getBitmap($player, time, size);
      $player.src = ''; // Unset video
      const dataURI = await bitmapToDataURI(bitmap, mime, type);

      return dataURI;
    } catch (e) {
      console.info(`Unable to create thumbnail for: ${url}`, e);
    }
  }

  global.videoThumbnail = getThumbnailDataURI;
})(this);