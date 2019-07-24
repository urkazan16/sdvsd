'use strict';

function createTempStylsheet(cssContent) {
  if (!cssContent) {
    console.log('[dom-snapshot] error createTempStylsheet called without cssContent');
    return;
  }
  const head = document.head || document.querySelectorAll('head')[0];
  const style = document.createElement('style');
  style.type = 'text/css';
  style.setAttribute('data-desc', 'Applitools tmp variable created by DOM SNAPSHOT');
  head.appendChild(style);

  // This is required for IE8 and below.
  if (style.styleSheet) {
    style.styleSheet.cssText = cssContent;
  } else {
    style.appendChild(document.createTextNode(cssContent));
  }
  return style.sheet;
}

module.exports = createTempStylsheet;
