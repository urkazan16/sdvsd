"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _streamBuffers = require("stream-buffers");

var _worker = _interopRequireDefault(require("./worker"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const log = (0, _logger.default)('@wdio/local-runner');

class LocalRunner {
  constructor(configFile, config) {
    this.configFile = configFile;
    this.config = config;
    this.workerPool = {};
    this.stdout = new _streamBuffers.WritableStreamBuffer(_constants.BUFFER_OPTIONS);
    this.stderr = new _streamBuffers.WritableStreamBuffer(_constants.BUFFER_OPTIONS);
  }
  /**
   * nothing to initialise when running locally
   */


  initialise() {}

  getWorkerCount() {
    return Object.keys(this.workerPool).length;
  }

  run(_ref) {
    let {
      command,
      argv
    } = _ref,
        options = _objectWithoutProperties(_ref, ["command", "argv"]);

    /**
     * adjust max listeners on stdout/stderr when creating listeners
     */
    const workerCnt = this.getWorkerCount();

    if (workerCnt >= process.stdout.getMaxListeners() - 2) {
      process.stdout.setMaxListeners(workerCnt + 2);
      process.stderr.setMaxListeners(workerCnt + 2);
    }

    const worker = new _worker.default(this.config, options, this.stdout, this.stderr);
    this.workerPool[options.cid] = worker;
    worker.postMessage(command, argv);
    return worker;
  }
  /**
   * shutdown all worker processes
   *
   * @return {Promise}  resolves when all worker have been shutdown or
   *                    a timeout was reached
   */


  shutdown() {
    log.info('Shutting down spawned worker');

    for (const [cid, worker] of Object.entries(this.workerPool)) {
      const {
        caps,
        server,
        sessionId,
        config,
        isMultiremote,
        instances
      } = worker;
      let payload = {};
      /**
       * put connection information to payload if in watch mode
       * in order to attach to browser session and kill it
       */

      if (config && config.watch && (sessionId || isMultiremote)) {
        payload = {
          config: _objectSpread({}, server, {
            sessionId
          }),
          caps,
          watch: true,
          isMultiremote,
          instances
        };
      } else if (!worker.isBusy) {
        delete this.workerPool[cid];
        continue;
      }

      worker.postMessage('endSession', payload);
    }

    return new Promise(resolve => {
      const interval = setInterval(() => {
        const busyWorker = Object.entries(this.workerPool).filter(([, worker]) => worker.isBusy).length;
        log.info(`Waiting for ${busyWorker} to shut down gracefully`);

        if (busyWorker === 0) {
          clearInterval(interval);
          log.info('shutting down');
          return resolve();
        }
      }, 250);
      setTimeout(resolve, _constants.SHUTDOWN_TIMEOUT);
    });
  }

}

exports.default = LocalRunner;