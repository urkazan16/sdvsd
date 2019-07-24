"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.url");

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _network = _interopRequireDefault(require("./handler/network"));

var _constants = require("./constants");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('@wdio/devtools-service:CommandHandler');

class CommandHandler {
  constructor(client, browser) {
    this.client = client;
    this.browser = browser;
    this.isTracing = false;
    this.networkHandler = new _network.default(client);
    /**
     * register browser commands
     */

    const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(fnName => fnName !== 'constructor' && !fnName.startsWith('_'));
    commands.forEach(fnName => this.browser.addCommand(fnName, this[fnName].bind(this)));
    /**
     * propagate CDP events to the browser event listener
     */

    this.client.on('event', event => {
      const method = event.method || 'event';
      log.debug(`cdp event: ${method} with params ${JSON.stringify(event.params)}`);
      this.browser.emit(method, event.params);
    });
  }
  /**
   * allow to easily access the CDP from the browser object
   */


  cdp(domain, command, args = {}) {
    if (!this.client[domain]) {
      throw new Error(`Domain "${domain}" doesn't exist in the Chrome DevTools protocol`);
    }

    if (!this.client[domain][command]) {
      throw new Error(`The "${domain}" domain doesn't have a method called "${command}"`);
    }

    log.info(`Send command "${domain}.${command}" with args: ${JSON.stringify(args)}`);
    return new Promise((resolve, reject) => this.client[domain][command](args, (err, result) => {
      /* istanbul ignore if */
      if (err) {
        return reject(new Error(`Chrome DevTools Error: ${result.message}`));
      }

      return resolve(result);
    }));
  }
  /**
   * helper method to receive Chrome remote debugging connection data to
   * e.g. use external tools like lighthouse
   */


  cdpConnection() {
    const {
      host,
      port
    } = this.client;
    return {
      host,
      port
    };
  }
  /**
   * get nodeId to use for other commands
   */


  async getNodeId(selector) {
    const document = await this.cdp('DOM', 'getDocument');
    const {
      nodeId
    } = await this.cdp('DOM', 'querySelector', {
      nodeId: document.root.nodeId,
      selector
    });
    return nodeId;
  }
  /**
   * get nodeIds to use for other commands
   */


  async getNodeIds(selector) {
    const document = await this.cdp('DOM', 'getDocument');
    const {
      nodeIds
    } = await this.cdp('DOM', 'querySelectorAll', {
      nodeId: document.root.nodeId,
      selector
    });
    return nodeIds;
  }
  /**
   * start tracing the browser
   *
   * @param  {string[]} [categories=DEFAULT_TRACING_CATEGORIES]  categories to trace for
   * @param  {Number}   [samplingFrequency=10000]                sampling frequency
   */


  startTracing(categories = _constants.DEFAULT_TRACING_CATEGORIES, samplingFrequency = 10000) {
    if (this.isTracing) {
      throw new Error('browser is already being traced');
    }

    this.isTracing = true;
    return this.cdp('Tracing', 'start', {
      categories: categories.join(','),
      transferMode: 'ReturnAsStream',
      options: `sampling-frequency=${samplingFrequency}` // 1000 is default and too slow.

    });
  }
  /**
   * stop tracing the browser
   *
   * @return {Number}  tracing id to use for other commands
   */


  async endTracing() {
    if (!this.isTracing) {
      throw new Error('No tracing was initiated, call `browser.startTracing()` first');
    }

    this.cdp('Tracing', 'end');
    const stream = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
      /* istanbul ignore next */
      () => reject('Did not receive a Tracing.tracingComplete event'), 5000);
      this.browser.once('Tracing.tracingComplete', ({
        stream
      }) => {
        clearTimeout(timeout);
        resolve(stream);
        this.isTracing = false;
      });
    });
    this.traceEvents = await (0, _utils.readIOStream)(this.cdp.bind(this), stream);
    return stream;
  }
  /**
   * get raw trace logs
   */


  getTraceLogs() {
    return this.traceEvents;
  }
  /**
   * get page weight from last page load
   */


  getPageWeight() {
    const pageWeight = (0, _utils.sumByKey)(Object.values(this.networkHandler.requestTypes), 'size');
    const transferred = (0, _utils.sumByKey)(Object.values(this.networkHandler.requestTypes), 'encoded');
    const requestCount = (0, _utils.sumByKey)(Object.values(this.networkHandler.requestTypes), 'count');
    return {
      pageWeight,
      transferred,
      requestCount,
      details: this.networkHandler.requestTypes
    };
  }

}

exports.default = CommandHandler;