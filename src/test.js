(function utilitiesIIFE(global) {
  // jQuery-like syntactic sugar. Only queries for one element. Does not loop over multiple like jQuery
  function $(query) {
    if (typeof query === 'undefined') throw 'No query provided to $';

    var el;
    if (typeof query.nodeType === 'string') {
      el = query;
    } else if (query[0] === '<') {
      const container = document.createElement('div');
      container.innerHTML = query;
      el = container.firstChild;
    } else if (typeof query === 'string') {
      el = document.querySelector(query);
    } else {
      el = query;
    }

    if (el) {
      el.on = (e, fn, ...args) => {
        if (args.length > 0) {
          el.addEventListener(e, fn, ...args);
        } else {
          el.addEventListener(e, fn, false);
        }

        return el;
      };

      el.off = (eventType, callback) => { el.removeEventListener(eventType, callback); return el; }

      el.once = (e, fn) => el.addEventListener(e, fn, { once: true });

      el.trigger = (eventType, detail) => {
        detail = detail ? { detail: detail } : undefined;
        const e = new CustomEvent(eventType, detail);
        el.dispatchEvent(e);

        return el;
      };

      el.hasClass = c => el.classList.contains(c);
      el.addClass = c => { el.classList.add(c); return el; }
      el.removeClass = c => { el.classList.remove(c); return el; }
      el.toggleClass = c => { el.classList.toggle(c); return el; }
      el.append = element => { el.appendChild($(element)); return el; }
      el.remove = () => { el.parentNode.removeChild(el); return el; }
      el.show = () => { el.style.display = 'initial'; return el; }
      el.attr = (name, val) => {
        if (isUndefined(val)) {
          return el.getAttribute(name);
        } else {
          el.setAttribute(name, val);
          return el;
        }
      };
      el.removeAttr = name => { el.removeAttribute(name); return el; }
      el.val = () => el.value;
      el.find = q => $(q, el);
      el.html = h => {
        if (isUndefined(h)) {
          return el.innerHTML;
        } else {
          el.innerHTML = h;
          return el;
        }
      };
    }

    function isUndefined(v) {
      return typeof v === 'undefined';
    }

    return el;
  }

  global.$ = $;
})(this);

// folder.api (https://github.com/pseudosavant/folder.api): v1.0.1
(function folderApiIIFE(global) {
  'use strict';

  function urlType(url) {
    if (isHiddenFileOrFolder(url)) {
      return 'hidden';
    } else if (isFolder(url)) {
      return 'folder';
    } else if (isFile(url)) {
      return 'file';
    } else {
      return 'unknown';
    }
  }

  function isFolder(url) {
    return (url[url.length - 1] === '/');
  }

  function isFile(url) {
    return !isFolder(url);
  }

  function isHiddenFileOrFolder(url) {
    const reHidden = /\/\..+$/i;
    return url.toString().match(reHidden);
  }

  function parentFolder(url) {
    const parts = url.split('/');
    parts.pop(); // Remove trailing /
    parts.pop(); // Remove current folder
    return parts.join('/') + '/';
  }

  function urlToFoldername(url) {
    var pieces = url.split('/');
    return pieces[pieces.length - 2]; // Return piece before final `/`
  }

  function urlToFilename(url) {
    const re = /\/([^/]+)$/;
    const parts = re.exec(url);
    return (parts && parts.length > 1 ? parts[1] : url);
  }

  async function linkToMetadata(node, server) {
    return (
      typeof servers[server] === 'function' ?
        servers[server](node) :
        {}
    );
  }

  async function getHeaderData(url) {
    if (!url) return {};

    try {
      const res = await fetch(url);
      const h = res.headers;
      return h;
    } catch (e) {
      console.warn(e);
      return {};
    }
  }

  async function getServer(url) {
    const h = await getHeaderData(url);
    const server = (h.get('Server') ? h.get('Server').toString().toLowerCase() : undefined);
    if (server && server.includes) {
      if (server.includes('nginx')) {
        return 'nginx';
      } else if (server.includes('apache')) {
        return 'apache';
      } else if (server.includes('iis')) {
        return 'iis'
      }
    }

    return 'generic';
  }

  const servers = {
    apache: function (node) {
      const metadata = { date: undefined, size: undefined };

      if (!node.parentNode || !node.parentNode.parentNode) return metadata;

      const row = node.parentNode.parentNode;

      const dateNode = row.querySelector('td:nth-of-type(3)');
      if (dateNode) {
        const dateRe = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/g;
        const dateResults = dateRe.exec(dateNode.textContent);

        if (dateResults) {
          const y = toNumber(dateResults[1]) || undefined;
          const m = toNumber(dateResults[2]) || undefined;
          const d = toNumber(dateResults[3]) || undefined;
          const hours = toNumber(dateResults[4]) || undefined;
          const mins = toNumber(dateResults[5]) || undefined;
          metadata.date = new Date(`${m}-${d}, ${y} ${hours}:${mins}:00`);
        }
      }

      const sizeNode = row.querySelector('td:nth-of-type(4)');

      if (sizeNode) {
        const sizeRe = /(\d+)(\w)?/g;
        const sizeResults = sizeRe.exec(sizeNode.textContent);

        if (sizeResults) {
          const val = toNumber(sizeResults[1]);
          const unit = (isUndefined(sizeResults[2]) ? 'B' : sizeResults[2]);

          const factor = {
            B: 0, K: 1, M: 2, G: 3, T: 4
          }

          metadata.size = Math.floor(
            val * Math.pow(1024, factor[unit])
          );
        }
      }

      return metadata;
    },
    nginx: function (node) {
      const metadata = { date: undefined, size: undefined };

      const metadataNode = node.nextSibling;
      if (!metadataNode) return metadata;

      const text = metadataNode.textContent;
      const re = /(\d{2})-(\w{3})-(\d{4})\s(\d{2}):(\d{2})\s+(\d+)?/g;
      const results = re.exec(text);

      if (!results) return metadata;
      const d = toNumber(results[1]) || undefined;
      const m = results[2] || undefined;
      const y = toNumber(results[3]) || undefined;
      const hours = toNumber(results[4]) || undefined;
      const mins = toNumber(results[5]) || undefined;
      metadata.date = new Date(`${m}-${d}, ${y} ${hours}:${mins}:00`);

      metadata.size = toNumber(results[6]) || undefined;

      return metadata;
    },
    iis: function (node) {
      const metadata = { date: undefined, size: undefined };

      const metadataNode = node.previousSibling;
      if (!metadataNode) return metadata;

      const re = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})\s(AM|PM)\s+(\d+)?/i;
      const text = metadataNode.textContent;
      const results = re.exec(text);
      if (!results) return metadata;

      const m = toNumber(results[1]) || undefined;
      const d = toNumber(results[2]) || undefined;
      const y = toNumber(results[3]) || undefined;
      const hours = toNumber(results[4]) || undefined;
      const mins = toNumber(results[5]);
      metadata.date = new Date(`${m}-${d}, ${y} ${hours}:${mins}:00`);

      metadata.size = toNumber(results[7]) || undefined;

      return metadata;
    },
    fallback: function (node) {
      const metadata = { date: undefined, size: undefined };

      const metadataNode = node.nextSibling;
      if (!metadataNode) return metadata;

      const text = metadataNode.textContent;
      const re = /(\d{2})-(\w{3})-(\d{4})\s(\d{2}):(\d{2})\s+(\d+)?/g;
      const results = re.exec(text);

      if (!results) return metadata;
      const d = toNumber(results[1]) || undefined;
      const m = results[2] || undefined;
      const y = toNumber(results[3]) || undefined;
      const hours = toNumber(results[4]) || undefined;
      const mins = toNumber(results[5]) || undefined;
      metadata.date = new Date(`${m}-${d}, ${y} ${hours}:${mins}:00`);

      metadata.size = toNumber(results[6]) || undefined;

      return metadata;
    },
  }

  async function getLinksFromFrame(frame, baseUrl) {
    const server = await getServer(baseUrl) || 'generic';

    var query;

    switch (server) {
      case 'apache':
        query = 'td a';

        if ([...frame.contentDocument.querySelectorAll(query)].length === 0) {
          query = 'a'; // Fallback to any `<a>` if none are found
        }

        break;
      case 'iis':
      case 'nginx':
      default:
        query = 'a';
        break;
    }

    const links = [...frame.contentDocument.querySelectorAll(query)];
    const folders = [];
    const files = [];

    for (var i = 0; i < links.length; i++) {
      const link = links[i];
      const url = link.toString();
      const type = urlType(url);

      var target;
      const metadata = await linkToMetadata(link, server);
      const res = { url };

      switch (type) {
        case 'folder':
          res.name = urlToFoldername(url);
          res.type = 'child';
          target = folders;
          break;
        case 'file':
          res.name = urlToFilename(url);
          target = files;
          break;
      }

      if (metadata.size) res.size = metadata.size;
      if (metadata.date) res.date = metadata.date;

      if (target === folders) {
        if (server === 'apache' && !metadata.date || // Apache never has a date for parent folders
          url === '../' ||
          url === parentFolder(baseUrl)
        ) {
          res.type = 'parent';
        } else if (url === '/') {
          res.type = 'root';
        }
      }

      target.push(res);

    }
    return { server, folders, files };
  }

  async function folderApiRequest(url) {
    const $frame = document.createElement('iframe');
    $frame.style.visibility = 'hidden';
    document.body.appendChild($frame);

    const promise = new Promise((resolve, reject) => {
      $frame.onerror = reject;

      $frame.onload = async () => {
        const links = await getLinksFromFrame($frame, url);
        $frame.parentElement.removeChild($frame);

        resolve(links);
      };
    });

    $frame.src = url; // Setting src starts loading

    return promise;
  }

  function toNumber(d) {
    return parseInt(d, 10);
  }

  function isUndefined(v) {
    return typeof v === 'undefined';
  }

  global.folderApiRequest = folderApiRequest;
})(this);

(function appIIFE(global) {
  'use strict';

  window.app = {
    options: {
      thumbnails: {
        timestamps: [0, 0.2, 0.4, 0.6, 0.8], // Array of where in the clip it should grab the thumbnails from (e.g. 0.10 = 10%)
        size: 360, // Maximum width of thumbnails. Setting this smaller will save localStorage space.
        cache: true,
        mime: {
          type: 'image/webp',
          quality: 0.4
        }
      }
    },
    supportedVideoTypes: getSupportedVideoTypes()
  };

  function getSupportedVideoTypes() {
    const supported = {
      extensions: [],
      mime: []
    };

    const types = [
      { mime: 'video/mp4', extensions: ['mp4', 'm4v', 'mov'] },
      { mime: 'video/webm', extensions: ['webm'] },
      { mime: 'video/x-matroska', extensions: ['mkv'] },
      { mime: 'video/ogg', extensions: ['ogg'] }
    ];

    const v = document.createElement('video');
    types.forEach(type => {
      if (v.canPlayType(type.mime) !== '') {
        supported.extensions.push(...type.extensions);
        supported.mime.push(type.mime);
      }
    });

    return supported;
  }

  function urlToFolder(url){
    var pieces = url.split('/'); // Break the URL into pieces
    pieces.pop(); // Remove the last piece (the filename)
    return pieces.join('/') + '/'; // Put it back together with a trailing /
  }

  function urlToLabel(url) {
    if (typeof url !== 'string') return;

    const fragments = url.split('/');

    const label = removeFileExtension(
      decodeURIComponent(
        fragments[fragments.length - 1]
      )
    );

    const prefixRe = /^(the|a)(\s|%20)/i;
    const hasPrefix = prefixRe.test(label);

    if (hasPrefix) {
      const prefix = prefixRe.exec(label);
      const length = prefix[1].length + prefix[2].length;
      return `${label.substring(length)}, ${prefix[1]}`;
    } else {
      return label;
    }
  }

  function sortFiles(a, b) {
    const labelA = urlToLabel(a);
    const labelB = urlToLabel(b);

    return labelA < labelB ? -1 : 1;
  }

  function isVideo(haystack) {
    const re = new RegExp(`\.+(${app.supportedVideoTypes.extensions.join('|')})+$`, 'i');
    return re.test(haystack);
  };

  function getBaseLocation(l) {
    return l.protocol + '//' + l.host;
  }

  async function createLinks(url) {
    const links = await folderApiRequest(urlToFolder(url || window.location.href));
    showLinks(links);
  }

  function createFileTemplate(url, label, optionalClasses = '') {
    return `<a href='${url}' class='file ${optionalClasses}'><div class='title'>${label}</div></a>`;
  }

  function createFolderTemplate(url, label, optionalClasses = '') {
    return `<a href='${url}' class='folder ${optionalClasses}'><div class='title'>${label}</div></a>`;
  }

  async function showLinks(links) {
    var html = '';
    const folders = links.folders;
    const files = links.files;
    const base = getBaseLocation(window.location);

    // Render folders
    html += `<div class='folders'>`;
    folders.forEach((folder) => {
      const rawUrl = folder.url;
      const url = decodeURI(rawUrl).replace(base, '');
      const label = url;

      html += createFolderTemplate(rawUrl, label);
    });
    html += `</div>`;

    // Render files
    html += `<div class='files'>`;
    const videos = files.filter((file) => isVideo(file.url));
    videos.sort(sortFiles);
    videos.forEach((file) => {
      const rawUrl = file.url;
      const url = decodeURI(rawUrl).replace(base, '');
      const label = url;

      html += createFileTemplate(rawUrl, label);
    });
    html += `</div>`;

    // Populate links
    $('.links').innerHTML = html;
    
    // Click handler
    const $links = [...document.querySelectorAll('.file, .folder')];
    $links.forEach((link) => $(link).on('click', clickLink));

    // async generate data URIs
    generateURIs(videos.map((v) => v.url));
  }

  function clickLink(e) {
    e.preventDefault();

    // `this` always refers to the parent element. `e.target` can be children too instead.
    const $el = $(this);
    
    if ($el.hasClass('file'))   actionOpen($el.href);
    if ($el.hasClass('folder')) createLinks($el.href);
  }

  async function actionOpen(url) {
    // const type = 'objectURL';
    const type = 'dataURI';
    const size = app.options.thumbnails.size;
    const timestamps = app.options.thumbnails.timestamps;

    const mime = app.options.thumbnails.mime;
    const cache = app.options.thumbnails.cache;

    const start = Date.now();
    const thumbnails = await videoThumbnail(url, {timestamps, size, type, mime, cache});
    const duration = Math.round(Date.now() - start);

    const msg = `${url} (${app.options.thumbnails.size}px max, ${type}): ${duration}ms`;
    $('.console').innerHTML = msg;
    console.info(msg);

    $('.thumbnails').html('');
    
    if (thumbnails && thumbnails.length > 0) {
      thumbnails.forEach((thumbnail) => {
        const details =
`size: ${thumbnail.sizeKB}KB
seek time: ${thumbnail.seekTime}
max dimension: ${size}px
mime-type: ${thumbnail.mime.type}`;
        const $container = $(`<span class="thumbnail-preview-container" title="${details}"></span>`);
        const $figure = $(`<figure>${thumbnail.timestamp} / ${thumbnail.seekTime}</figure>`);
        const $thumbnail = $(`<img class="thumbnail-preview">`);
        $thumbnail.src = thumbnail.URI;
        
        $container.append($thumbnail);
        $container.append($figure);
        $('.thumbnails').append($container);

        $container.on('click', () => $videoFrame.currentTime = $videoFrame.duration * thumbnail.timestamp);
      });

      const $videoFrame = $('.video-frame');
      $videoFrame.muted = true;
      $videoFrame.autoplay = true;
      
      const event = 'onloadedmetadata';
      $videoFrame[event] = () => {        
        $videoFrame[event] = undefined;
        const timestamp = Array.isArray(timestamps ? timestamps[0] : timestamps);
        $videoFrame.currentTime = timestamp * $videoFrame.duration;
        $videoFrame.pause();
      };
      $videoFrame.src = url;
    } else {
      console.warn(`No thumbnails generated for ${url}`);
    }
  }
  
  async function generateURIs(urls) {
    const type = 'dataURI';
    const size = app.options.thumbnails.size;
    const timestamps = app.options.thumbnails.timestamps;
    const timeout = app.options.thumbnails.timeout;
    const cache = app.options.thumbnails.cache;
    const mime = app.options.thumbnails.mime;

    const start = Date.now();
    const promises = urls.map((url) => {
      const promise = new Promise(async (resolve, reject) => {
        const before = Date.now();
        const thumbnails = await videoThumbnail(url, {timestamps, size, type, timeout, cache, mime});

        const duration = Date.now() - before;
        resolve({url, thumbnails, duration});
      });

      return promise;
    });

    const uris = await Promise.all(promises);

    const totalDuration = Math.round(Date.now() - start);
    const urlsRequested = urls.length;
    const urlsProcessed = uris.length;
    
    const thumbnailsPerUrl = timestamps.length;
    const thumbnailsRequested = urlsRequested * thumbnailsPerUrl;
    const thumbnailsGenerated = urlsProcessed * thumbnailsPerUrl;
    const perThumbnail = Math.round(totalDuration / thumbnailsGenerated);

    const totalSize = uris.reduce((total, uri) => {
      if (uri.thumbnails && uri.thumbnails.length > 0) {
        return total += uri.thumbnails.reduce((acc, thumbnail) => acc += thumbnail.URI.length, 0);
      } else {
        return total;
      }
    }, 0);
    const avgSize = totalSize / thumbnailsGenerated;

    const isCachingEnabled = (cache ? 'enabled' : 'disabled')

    console.info(`${urlsRequested} URLs requested, ${size}px, caching: ${isCachingEnabled}, ${thumbnailsPerUrl} thumbnails per URL (${totalDuration}ms)`);
    console.info(`${thumbnailsGenerated}/${thumbnailsRequested} thumbnails generated from ${urlsRequested} URLs (${perThumbnail}ms/${Math.floor(avgSize / 1024)}KB per thumbnail)`);
  }

  // Fill the cache with dummy data using a valid vt.js key
  const fillCache = () => {
    const val = '1234567890'.repeat(500);

    for (let i = 0; i < 99999; i++) {
      const key = `video-thumbnail.js-${Date.now()}-12.99-360|webp|0.4|https://web.local/code/video-thumbnail.js/test.webm`;
      try {
        localStorage.setItem(key, val);
      } catch {}
    }
    console.info('Cache filled')
  };
  window.fillCache = fillCache;

  // Print size of the localStorage
  const cacheSize = () => {
    const keys = Object.keys(localStorage);
    const size = keys.reduce((acc, key) => acc += localStorage.getItem(key).length, 0);

    return size;
  };
  window.cacheSize = cacheSize;

  // main()
  async function main() {
    createLinks(urlToFolder(location.toString()) + '../videos/');

    // Only show controls when hovering
    const $video = $('video');
    $video.on('mouseenter', () => $video.controls = true);
    $video.on('mouseleave', () => $video.controls = false);
  }

  main();
})(this);