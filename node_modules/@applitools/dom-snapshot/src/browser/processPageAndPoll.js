'use strict';

const processPageAndSerialize = require('./processPageAndSerialize');
const EYES_NAME_SPACE = '__EYES__APPLITOOLS__';

function processPageAndPoll(doc) {
  if (!window[EYES_NAME_SPACE]) {
    window[EYES_NAME_SPACE] = {};
  }
  if (!window[EYES_NAME_SPACE].processPageAndSerializeResult) {
    window[EYES_NAME_SPACE].processPageAndSerializeResult = {
      status: 'WIP',
      value: null,
      error: null,
    };
    processPageAndSerialize(doc)
      .then(r => ((resultObject.status = 'SUCCESS'), (resultObject.value = r)))
      .catch(e => ((resultObject.status = 'ERROR'), (resultObject.error = e.message)));
  }

  const resultObject = window[EYES_NAME_SPACE].processPageAndSerializeResult;
  if (resultObject.status === 'SUCCESS') {
    window[EYES_NAME_SPACE].processPageAndSerializeResult = null;
  }

  return JSON.stringify(resultObject);
}

module.exports = processPageAndPoll;
