
function() {
  var processPage = (function () {
  'use strict';

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

  return processPage_1;

}());

  return processPage.apply(this, arguments);
}