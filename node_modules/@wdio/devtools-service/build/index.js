"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _commands = _interopRequireDefault(require("./commands"));

var _driver = _interopRequireDefault(require("./driver"));

var _auditor = _interopRequireDefault(require("./auditor"));

var _trace = _interopRequireDefault(require("./gatherer/trace"));

var _devtools = _interopRequireDefault(require("./gatherer/devtools"));

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('@wdio/devtools-service');
const UNSUPPORTED_ERROR_MESSAGE = 'The @wdio/devtools-service currently only supports Chrome version 63 and up';
const TRACE_COMMANDS = ['click', 'navigateTo'];

class DevToolsService {
  constructor(options = {}) {
    this.options = options;
    this.isSupported = false;
    this.shouldRunPerformanceAudits = false;
  }

  beforeSession(_, caps) {
    if (caps.browserName !== 'chrome' || caps.version && caps.version < 63) {
      return log.error(UNSUPPORTED_ERROR_MESSAGE);
    }

    this.isSupported = true;
  }

  async before() {
    if (!this.isSupported) {
      return global.browser.addCommand('cdp',
      /* istanbul ignore next */
      () => {
        throw new Error(UNSUPPORTED_ERROR_MESSAGE);
      });
    }

    try {
      var _context;

      let debuggerAddress;

      if (this.options.debuggerAddress) {
        const [host, port] = this.options.debuggerAddress.split(':');
        debuggerAddress = {
          host,
          port: parseInt(port, 10)
        };
      } else {
        debuggerAddress = await (0, _utils.findCDPInterface)();
      }

      this.client = await (0, _utils.getCDPClient)(debuggerAddress);
      this.commandHandler = new _commands.default(this.client, global.browser);
      this.devtoolsDriver = await _driver.default.attach(`http://${debuggerAddress.host}:${debuggerAddress.port}`);
      this.traceGatherer = new _trace.default(this.devtoolsDriver);
      const session = await this.devtoolsDriver.getCDPSession();
      session.on('Page.loadEventFired', (_context = this.traceGatherer).onLoadEventFired.bind(_context));
      session.on('Page.frameNavigated', (_context = this.traceGatherer).onFrameNavigated.bind(_context));
      const page = await this.devtoolsDriver.getActivePage();
      page.on('requestfailed', (_context = this.traceGatherer).onFrameLoadFail.bind(_context));
      /**
       * enable domains for client
       */

      await Promise.all(['Page', 'Network', 'Console'].map(domain => Promise.all([session.send(`${domain}.enable`), this.client[domain]['enable']()])));
      this.devtoolsGatherer = new _devtools.default();
      this.client.on('event', (_context = this.devtoolsGatherer).onMessage.bind(_context));
      log.info(`Connected to Chrome on ${debuggerAddress.host}:${debuggerAddress.port}`);
    } catch (err) {
      log.error(`Couldn't connect to chrome: ${err.stack}`);
      return;
    }

    global.browser.addCommand('enablePerformanceAudits', this._enablePerformanceAudits.bind(this));
    global.browser.addCommand('disablePerformanceAudits', this._disablePerformanceAudits.bind(this));
    /**
     * allow user to work with Puppeteer directly
     */

    global.browser.addCommand('getPuppeteer', () => this.devtoolsDriver);
  }

  async beforeCommand(commandName, params) {
    if (!this.shouldRunPerformanceAudits || !this.traceGatherer || this.traceGatherer.isTracing || !TRACE_COMMANDS.includes(commandName)) {
      return;
    }
    /**
     * set browser profile
     */


    this._setThrottlingProfile(this.networkThrottling, this.cpuThrottling, this.cacheEnabled);

    const url = commandName === 'navigateTo' ? params[0] : 'click transition';
    return this.traceGatherer.startTracing(url);
  }

  async afterCommand(commandName) {
    if (!this.traceGatherer || !this.traceGatherer.isTracing || !TRACE_COMMANDS.includes(commandName)) {
      return;
    }
    /**
     * update custom commands once tracing finishes
     */


    this.traceGatherer.once('tracingComplete', traceEvents => {
      const auditor = new _auditor.default(traceEvents, this.devtoolsGatherer.getLogs());
      auditor.updateCommands(global.browser);
    });
    return new Promise(resolve => {
      log.info(`Wait until tracing for command ${commandName} finishes`);
      /**
       * wait until tracing stops
       */

      this.traceGatherer.once('tracingFinished', async () => {
        log.info('Disable throttling');
        await this._setThrottlingProfile('online', 0, true);
        log.info('continuing with next WebDriver command');
        resolve();
      });
    });
  }
  /**
   * set flag to run performance audits for page transitions
   */


  _enablePerformanceAudits({
    networkThrottling = _constants.DEFAULT_NETWORK_THROTTLING_STATE,
    cpuThrottling = 4,
    cacheEnabled = false
  } = {}) {
    if (!Object.prototype.hasOwnProperty.call(_constants.NETWORK_STATES, networkThrottling)) {
      throw new Error(`Network throttling profile "${networkThrottling}" is unknown, choose between ${Object.keys(_constants.NETWORK_STATES).join(', ')}`);
    }

    if (typeof cpuThrottling !== 'number') {
      throw new Error(`CPU throttling rate needs to be typeof number but was "${typeof cpuThrottling}"`);
    }

    this.networkThrottling = networkThrottling;
    this.cpuThrottling = cpuThrottling;
    this.cacheEnabled = Boolean(cacheEnabled);
    this.shouldRunPerformanceAudits = true;
  }
  /**
   * custom command to disable performance audits
   */


  _disablePerformanceAudits() {
    this.shouldRunPerformanceAudits = false;
  }
  /**
   * helper method to set throttling profile
   */


  async _setThrottlingProfile(networkThrottling, cpuThrottling, cacheEnabled) {
    const page = await this.devtoolsDriver.getActivePage();
    await page.setCacheEnabled(Boolean(cacheEnabled));
    await this.devtoolsDriver.send('Emulation.setCPUThrottlingRate', {
      rate: cpuThrottling
    });
    await this.devtoolsDriver.send('Network.emulateNetworkConditions', _constants.NETWORK_STATES[networkThrottling]);
  }

}

exports.default = DevToolsService;