"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _browserstackLocal = _interopRequireDefault(require("browserstack-local"));

var _logger = _interopRequireDefault(require("@wdio/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const log = (0, _logger.default)('@wdio/browserstack-service');

class BrowserstackLauncherService {
  onPrepare(config, capabilities) {
    if (!config.browserstackLocal) {
      return log.info('browserstackLocal is not enabled - skipping...');
    }

    const opts = _objectSpread({
      key: config.key,
      forcelocal: true,
      onlyAutomate: true
    }, config.browserstackOpts);

    this.browserstackLocal = new _browserstackLocal.default.Local();

    if (Array.isArray(capabilities)) {
      capabilities.forEach(capability => {
        capability['browserstack.local'] = true;
      });
    } else if (typeof capabilities === 'object') {
      capabilities['browserstack.local'] = true;
    } else {
      throw TypeError('Capabilities should be an object or Array!');
    }

    let timer;
    return Promise.race([new Promise((resolve, reject) => {
      this.browserstackLocal.start(opts, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    }), new Promise((resolve, reject) => {
      /* istanbul ignore next */
      timer = setTimeout(function () {
        reject('Browserstack Local failed to start within 60 seconds!');
      }, 60000);
    })]).then(function (result) {
      clearTimeout(timer);
      return Promise.resolve(result);
    }, function (err) {
      clearTimeout(timer);
      return Promise.reject(err);
    });
  }

  onComplete(exitCode, config) {
    if (!this.browserstackLocal || !this.browserstackLocal.isRunning()) {
      return;
    }

    if (config.browserstackLocalForcedStop) {
      return process.kill(this.browserstackLocal.pid);
    }

    let timer;
    return Promise.race([new Promise((resolve, reject) => {
      this.browserstackLocal.stop(err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    }), new Promise((resolve, reject) => {
      /* istanbul ignore next */
      timer = setTimeout(function () {
        reject('Browserstack Local failed to stop within 60 seconds!');
      }, 60000);
    })]).then(function (result) {
      clearTimeout(timer);
      return Promise.resolve(result);
    }, function (err) {
      clearTimeout(timer);
      return Promise.reject(err);
    });
  }

}

exports.default = BrowserstackLauncherService;