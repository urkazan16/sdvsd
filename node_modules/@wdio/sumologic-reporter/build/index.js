"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _request = _interopRequireDefault(require("request"));

var _dateformat = _interopRequireDefault(require("dateformat"));

var _jsonStringifySafe = _interopRequireDefault(require("json-stringify-safe"));

var _reporter = _interopRequireDefault(require("@wdio/reporter"));

var _logger = _interopRequireDefault(require("@wdio/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('@wdio/sumologic-reporter');
const MAX_LINES = 100;
const DATE_FORMAT = 'yyyy-mm-dd HH:mm:ss,l o';
/**
 * Initialize a new sumologic test reporter.
 */

class SumoLogicReporter extends _reporter.default {
  constructor(options) {
    options = Object.assign({
      // don't create a log file
      stdout: true,
      // define sync interval how often logs get pushed to Sumologic
      syncInterval: 100,
      // endpoint of collector source
      sourceAddress: process.env.SUMO_SOURCE_ADDRESS
    }, options);
    super(options);
    this.options = options;

    if (typeof this.options.sourceAddress !== 'string') {
      log.error('Sumo Logic requires "sourceAddress" paramater');
    } // Cache of entries we are yet to sync


    this.unsynced = [];
    this.isSynchronising = false;
    this.errorCount = 0;
    this.specs = {};
    this.results = {};
    this.interval = setInterval(this.sync.bind(this), this.options.syncInterval);
  }

  get isSynchronised() {
    return this.unsynced.length === 0;
  }

  onRunnerStart(runner) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'runner:start',
      data: runner
    }));
  }

  onSuiteStart(suite) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'suite:start',
      data: suite
    }));
  }

  onTestStart(test) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'test:start',
      data: test
    }));
  }

  onTestSkip(test) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'test:skip',
      data: test
    }));
  }

  onTestPass(test) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'test:pass',
      data: test
    }));
  }

  onTestFail(test) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'test:fail',
      data: test
    }));
  }

  onTestEnd(test) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'test:end',
      data: test
    }));
  }

  onSuiteEnd(suite) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'suite:end',
      data: suite
    }));
  }

  onRunnerEnd(runner) {
    this.unsynced.push((0, _jsonStringifySafe.default)({
      time: (0, _dateformat.default)(new Date(), DATE_FORMAT),
      event: 'runner:end',
      data: runner
    }));
  }

  sync() {
    /**
     * don't synchronise logs if
     *  - we've already send out a request and are waiting for the successful response
     *  - we have nothing to synchronise
     *  - there is an invalid source address
     */
    if (this.isSynchronising || this.unsynced.length === 0 || typeof this.options.sourceAddress !== 'string') {
      return;
    }

    const logLines = this.unsynced.slice(0, MAX_LINES).join('\n');
    /**
     * set `isSynchronising` to true so we don't sync when a request is being made
     */

    this.isSynchronising = true;
    log.debug('start synchronization');
    (0, _request.default)({
      method: 'POST',
      uri: this.options.sourceAddress,
      body: logLines
    }, (err, resp) => {
      const failed = Boolean(err) || resp.statusCode < 200 || resp.statusCode >= 400;
      /* istanbul ignore if  */

      if (failed) {
        return log.error('failed send data to Sumo Logic:\n', err.stack ? err.stack : err);
      }
      /**
       * remove transfered logs from log bucket
       */


      this.unsynced.splice(0, MAX_LINES);
      /**
       * reset sync flag so we can sync again
       */

      log.debug(`synchronised collector data, server status: ${resp.statusCode}`);
      this.isSynchronising = false;
    });
  }

}

exports.default = SumoLogicReporter;