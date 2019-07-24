
function() {
  var processPageAndSerialize = (function () {
  'use strict';

  // This code was copied and modified from https://github.com/beatgammit/base64-js/blob/bf68aaa277/index.js
  // License: https://github.com/beatgammit/base64-js/blob/bf68aaa277d9de7007cc0c58279c411bb10670ac/LICENSE

  function arrayBufferToBase64(ab) {
    const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

    const uint8 = new Uint8Array(ab);
    const len = uint8.length;
    const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    const parts = [];
    const maxChunkLength = 16383; // must be multiple of 3

    let tmp;

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + '==');
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 0x3f] + lookup[(tmp << 2) & 0x3f] + '=');
    }

    return parts.join('');

    function tripletToBase64(num) {
      return (
        lookup[(num >> 18) & 0x3f] +
        lookup[(num >> 12) & 0x3f] +
        lookup[(num >> 6) & 0x3f] +
        lookup[num & 0x3f]
      );
    }

    function encodeChunk(start, end) {
      let tmp;
      const output = [];
      for (let i = start; i < end; i += 3) {
        tmp = ((uint8[i] << 16) & 0xff0000) + ((uint8[i + 1] << 8) & 0xff00) + (uint8[i + 2] & 0xff);
        output.push(tripletToBase64(tmp));
      }
      return output.join('');
    }
  }

  var arrayBufferToBase64_1 = arrayBufferToBase64;

  function absolutizeUrl(url, absoluteUrl) {
    return new URL(url, absoluteUrl).href;
  }

  var absolutizeUrl_1 = absolutizeUrl;

  function isSameOrigin(location, url) {
    const {origin} = location.protocol === 'data:' ? location.origin : new URL(url, location.href);
    return origin === location.origin || /^blob:/.test(url);
  }

  var isSameOrigin_1 = isSameOrigin;

  function splitOnOrigin(location, urls) {
    const result = urls.reduce(
      (output, url) => {
        if (isSameOrigin_1(location, url)) {
          output.internalUrls.push(url);
        } else {
          output.externalUrls.push(url);
        }
        return output;
      },
      {
        externalUrls: [],
        internalUrls: [],
      },
    );
    return result;
  }

  var splitOnOrigin_1 = splitOnOrigin;

  function uniq(arr) {
    return Array.from(new Set(arr)).filter(x => !!x);
  }

  var uniq_1 = uniq;

  function extractLinks(document) {
    const win = document.defaultView;

    const srcsetUrls = [...document.querySelectorAll('img[srcset],source[srcset]')]
      .map(srcsetEl =>
        srcsetEl
          .getAttribute('srcset')
          .split(',')
          .map(str => str.trim().split(/\s+/)[0]),
      )
      .reduce((acc, urls) => acc.concat(urls), []);

    const srcUrls = [...document.querySelectorAll('img[src],source[src]')].map(srcEl =>
      srcEl.getAttribute('src'),
    );

    const cssUrls = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link =>
      link.getAttribute('href'),
    );

    const videoPosterUrls = [...document.querySelectorAll('video[poster]')].map(videoEl =>
      videoEl.getAttribute('poster'),
    );

    const splitUrls = splitOnOrigin_1(win.location, [
      ...srcsetUrls,
      ...srcUrls,
      ...cssUrls,
      ...videoPosterUrls,
    ]);

    const iframes = [...document.querySelectorAll('iframe[src]')]
      .map(srcEl => {
        try {
          return srcEl.contentDocument;
        } catch (err) {
          //for CORS frames
          return undefined;
        }
      })
      .filter(x => !!x);

    return {
      requiresMoreParsing: uniq_1(iframes),
      externalUrls: uniq_1(splitUrls.externalUrls).map(url => {
        try {
          return absolutizeUrl_1(url, win.location);
        } catch (err) {
          return url;
        }
      }),
      urlsToFetch: uniq_1(splitUrls.internalUrls).map(url => absolutizeUrl_1(url, win.location)),
    };
  }

  var extractLinks_1 = extractLinks;

  /* eslint-disable no-use-before-define */

  function domNodesToCdt(docNode) {
    const NODE_TYPES = {
      ELEMENT: 1,
      TEXT: 3,
      DOCUMENT: 9,
      DOCUMENT_TYPE: 10,
    };

    const domNodes = [
      {
        nodeType: NODE_TYPES.DOCUMENT,
      },
    ];
    domNodes[0].childNodeIndexes = childrenFactory(domNodes, docNode.childNodes);
    return domNodes;

    function childrenFactory(domNodes, elementNodes) {
      if (!elementNodes || elementNodes.length === 0) return null;

      const childIndexes = [];
      elementNodes.forEach(elementNode => {
        const index = elementNodeFactory(domNodes, elementNode);
        if (index !== null) {
          childIndexes.push(index);
        }
      });

      return childIndexes;
    }

    function elementNodeFactory(domNodes, elementNode) {
      let node;
      const {nodeType} = elementNode;
      if (nodeType === NODE_TYPES.ELEMENT) {
        if (elementNode.nodeName !== 'SCRIPT') {
          if (
            elementNode.nodeName === 'STYLE' &&
            !elementNode.textContent &&
            elementNode.sheet &&
            elementNode.sheet.cssRules.length
          ) {
            elementNode.appendChild(
              docNode.createTextNode(
                [...elementNode.sheet.cssRules].map(rule => rule.cssText).join(''),
              ),
            );
          }

          node = {
            nodeType: NODE_TYPES.ELEMENT,
            nodeName: elementNode.nodeName,
            attributes: Object.keys(elementNode.attributes).map(key => {
              let value = elementNode.attributes[key].value;
              const name = elementNode.attributes[key].localName;

              if (/^blob:/.test(value)) {
                value = value.replace(/^blob:http:\/\/localhost:\d+\/(.+)/, '$1'); // TODO don't replace localhost once render-grid implements absolute urls
              }

              return {
                name,
                value,
              };
            }),
            childNodeIndexes: elementNode.childNodes.length
              ? childrenFactory(domNodes, elementNode.childNodes)
              : [],
          };
        }
      } else if (nodeType === NODE_TYPES.TEXT) {
        node = {
          nodeType: NODE_TYPES.TEXT,
          nodeValue: elementNode.nodeValue,
        };
      } else if (nodeType === NODE_TYPES.DOCUMENT_TYPE) {
        node = {
          nodeType: NODE_TYPES.DOCUMENT_TYPE,
          nodeName: elementNode.nodeName,
        };
      }

      if (node) {
        domNodes.push(node);
        return domNodes.length - 1;
      } else {
        // console.log(`Unknown nodeType: ${nodeType}`);
        return null;
      }
    }
  }

  var domNodesToCdt_1 = domNodesToCdt;
  var NODE_TYPES = {
    ELEMENT: 1,
    TEXT: 3,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
  };
  domNodesToCdt_1.NODE_TYPES = NODE_TYPES;

  /* global window */

  function fetchLocalResources(origin, blobUrls, fetch = window.fetch) {
    return Promise.all(
      blobUrls.map(blobUrl =>
        fetch(blobUrl, {cache: 'force-cache', credentials: 'same-origin'}).then(resp =>
          resp.arrayBuffer().then(buff => ({
            url: new URL(blobUrl.replace(/^blob:http:\/\/localhost:\d+\/(.+)/, '$1'), origin).href, // TODO don't replace localhost once render-grid implements absolute urls
            type: resp.headers.get('Content-Type'),
            value: buff,
          })),
        ),
      ),
    );
  }

  var fetchLocalResources_1 = fetchLocalResources;

  function processPage(doc = document) {
    const url = doc.defaultView.frameElement
      ? doc.defaultView.frameElement.src
      : doc.defaultView.location.href;

    let {urlsToFetch, externalUrls, requiresMoreParsing} = extractLinks_1(doc);
    return fetchLocalResources_1(url, urlsToFetch, doc.defaultView.fetch).then(blobs => {
      return Promise.all(requiresMoreParsing.map(frame => processPage(frame))).then(
        framesResults => ({
          cdt: domNodesToCdt_1(doc),
          url,
          resourceUrls: externalUrls,
          blobs,
          frames: framesResults,
        }),
      );
    });
  }

  var processPage_1 = processPage;

  function processPageAndSerialize(doc) {
    return processPage_1(doc).then(serializeFrame);
  }

  function serializeFrame(frame) {
    frame.blobs = frame.blobs.map(({url, type, value}) => ({
      url,
      type,
      value: arrayBufferToBase64_1(value),
    }));
    frame.frames.forEach(serializeFrame);
    return frame;
  }

  var processPageAndSerialize_1 = processPageAndSerialize;

  return processPageAndSerialize_1;

}());

  return processPageAndSerialize.apply(this, arguments);
}