'use strict';
const createTempStyleSheet = require('./createTempStyleSheet');

function makeExtractResourcesFromStyle({extractResourcesFromStyleSheet}) {
  return function extractResourcesFromStyle(styleSheet, cssContent, doc = document) {
    let corsFreeStyleSheet;
    try {
      styleSheet.cssRules;
      corsFreeStyleSheet = styleSheet;
    } catch (e) {
      console.log(
        `[dom-snapshot] could not access cssRules for ${styleSheet.href} ${e}\ncreating temp style for access.`,
      );
      corsFreeStyleSheet = createTempStyleSheet(cssContent);
    }

    const result = extractResourcesFromStyleSheet(corsFreeStyleSheet, doc);
    if (corsFreeStyleSheet !== styleSheet) {
      corsFreeStyleSheet.ownerNode.parentNode.removeChild(corsFreeStyleSheet.ownerNode);
    }
    return result;
  };
}

module.exports = makeExtractResourcesFromStyle;
