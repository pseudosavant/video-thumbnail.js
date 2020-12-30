(function videoThumbnailIIFE(global) {
  // video-thumbnail.js
  // https://github.com/pseudosavant/video-thumbnail.js
  // © 2020 Paul Ellis (https://github.com/pseudosavant)
  // License: MIT
  // v1.1.0

  function store(key, val) {
    try {
      return localStorage.setItem(key, val);
    } catch (e) {
      console.warn(`Failed to store: ${key}`, e);
      return null;
    }
  }

  function retrieve(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Failed to retrieve: ${key}`, e);
      return null;
    }
  }

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

  const canThumbnail = (function(){
    const falseMessage = 'Thumbnail support: false';

    // Must support `localStorage`
    try {
        const key = '__canThumbnailTest__';
        const val = 'true';

        localStorage.setItem(key, val);
        const supported = localStorage.getItem(key) === val;
        localStorage.removeItem(key);

      if (!supported) console.info(falseMessage);

      return supported;
    } catch (e) {
      console.info(falseMessage);
      return false;
    }
  })();

  async function getThumbnailDataURI(url, opts) {
    if (!canThumbnail) return undefined;

    const def = {
      time: 0.1,
      size: 480,
      mime: { type: 'image/png' },
      type: 'dataURI',
      cache: false
    };

    const isImageMimeType = (s) => (/image\/.+/i).test(s);

    const time = (typeof opts.time === 'number' && opts.time >= 0 ? opts.time : def.size);
    const size = (typeof opts.size === 'number' && opts.size >  0 ? opts.size : def.size);
    const mime = (opts.mime && isImageMimeType(opts.mime.type)    ? opts.mime : def.mime);
    const type = (opts.type === 'objectURL'                       ? opts.type : def.type);
    const cache = (typeof opts.cache === 'boolean'                ? opts.cache : def.cache);

    try {
      const key = `video-thumbnail.js-cache-${size}|${time}|${url}`;
      const cachedURI = retrieve(key);

      if (cache && cachedURI) {
        return cachedURI;
      } else {
        const $player = await getVideo(url);
        const dataURI = await videoToDataURI($player, time, size, mime, type);
        $player.src = ''; // Unset video
        
        if (cache) store(key, dataURI);

        return dataURI;
      }
    } catch (e) {
      console.info(`Unable to create thumbnail for: ${url}`, e);
    }
  }

  global.videoThumbnail = getThumbnailDataURI;
})(this);