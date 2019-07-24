"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limit = void 0;

var _jsonStringifySafe = _interopRequireDefault(require("json-stringify-safe"));

var _validator = _interopRequireDefault(require("validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const OBJLENGTH = 10;
const ARRLENGTH = 10;
const STRINGLIMIT = 1000;
const STRINGTRUNCATE = 200;

const limit = function (rawVal) {
  if (!rawVal) return rawVal; // Ensure we're working with a copy

  let val = JSON.parse((0, _jsonStringifySafe.default)(rawVal));
  const type = Object.prototype.toString.call(val);

  if (type === '[object String]') {
    if (val.length > 100 && _validator.default.isBase64(val)) {
      return `[base64] ${val.length} bytes`;
    }

    if (val.length > STRINGLIMIT) {
      return val.substr(0, STRINGTRUNCATE) + ` ... (${val.length - STRINGTRUNCATE} more bytes)`;
    }

    return val;
  } else if (type === '[object Array]') {
    const length = val.length;

    if (length > ARRLENGTH) {
      val = val.slice(0, ARRLENGTH);
      val.push(`(${length - ARRLENGTH} more items)`);
    }

    return val.map(limit);
  } else if (type === '[object Object]') {
    const keys = Object.keys(val);
    const removed = [];

    for (let i = 0, l = keys.length; i < l; i++) {
      if (i < OBJLENGTH) {
        val[keys[i]] = limit(val[keys[i]]);
      } else {
        delete val[keys[i]];
        removed.push(keys[i]);
      }
    }

    if (removed.length) {
      val._ = keys.length - OBJLENGTH + ' more keys: ' + JSON.stringify(removed);
    }

    return val;
  }

  return val;
};

exports.limit = limit;