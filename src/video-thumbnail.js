(function videoThumbnailIIFE(global) {
  // video-thumbnail.js
  // https://github.com/pseudosavant/video-thumbnail.js
  // © 2020 Paul Ellis (https://github.com/pseudosavant)
  // License: MIT
  // v1.0.0

  function getVideo(url) {
    const $player = document.createElement('video');
    $player.crossorigin = 'anonymous';
    $player.muted = true;
    $player.autoplay = true; // Must be set to `true` for iOS
    $player.playsInline = true; // Must be set to `true` to prevent automatic fullscreen on iOS
    
    const eventName = 'canplay';
    const promise = new Promise((resolve, reject) => {
      $player.addEventListener(eventName, function loadedmetadata() {
        $player.pause();
        
        resolve($player);
      }, false);
      
      $player.addEventListener('error', reject);
    });
    $player.src = url;
    
    return promise;
  }
  
  function videoToDataURI(videoSrc, time, size, mime, type) {
    const $player = videoSrc;
    
    const promise = new Promise((resolve, reject) => {
      $player.addEventListener('seeked', async function seeked() {
        const aspectRatio = $player.videoHeight / $player.videoWidth;
        const w = size;
        const h = w * aspectRatio;
        const c = document.createElement('canvas');
        
        c.width = w;
        c.height = h;
        
        const ctx = c.getContext('2d');
        ctx.drawImage($player, 0, 0, w, h);
        
        if (type === 'objectURL') {
          c.toBlob((blob) => resolve(URL.createObjectURL(blob)), mime.type, mime.quality);
        } else {
          const dataURI = c.toDataURL(mime.type, mime.quality)
          resolve(dataURI);
        }
      }, false);
      
      $player.addEventListener('error', reject);
    });
    
    // Relative seek if `0 < time < 1`, absolute otherwise
    const seekTime = (betweenZeroAndOne(time) ? time * $player.duration : time);
    $player.currentTime = seekTime;
    
    // Play/pause must be trigger to ensure correct seeking on iOS
    $player.play();
    $player.pause();
    
    return promise;
  }

  function betweenZeroAndOne(n) {
    return (n > 0 && n < 1);
  }

  async function getThumbnailDataURI(url, opts) {
    const def = {
      time: 0.1,
      size: 480,
      mime: { type: 'image/png' },
      type: 'dataURI'
    };

    try {
      const isImageMimeType = (s) => (/image\/.+/i).test(s);

      const time = (typeof opts.time === 'number' && opts.time >= 0 ? opts.time : def.size);
      const size = (typeof opts.size === 'number' && opts.size >  0 ? opts.size : def.size);
      const mime = (opts.mime && isImageMimeType(opts.mime.type)    ? opts.mime : def.mime);
      const type = (opts.type === 'objectURL'                       ? opts.type : def.type);

      const $player = await getVideo(url);
      const dataURI = await videoToDataURI($player, time, size, mime, type);
      $player.src = ''; // Unset video

      return dataURI;
    } catch (e) {
      console.info(`Unable to create thumbnail for: ${url}`, e);
    }
  }

  global.videoThumbnail = getThumbnailDataURI;
})(this);