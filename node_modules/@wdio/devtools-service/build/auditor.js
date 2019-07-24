"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _weightedMean = _interopRequireDefault(require("weighted-mean"));

var _diagnostics = _interopRequireDefault(require("lighthouse/lighthouse-core/audits/diagnostics"));

var _mainthreadWorkBreakdown = _interopRequireDefault(require("lighthouse/lighthouse-core/audits/mainthread-work-breakdown"));

var _metrics = _interopRequireDefault(require("lighthouse/lighthouse-core/audits/metrics"));

var _timeToFirstByte = _interopRequireDefault(require("lighthouse/lighthouse-core/audits/time-to-first-byte"));

var _utils = require("./utils");

var _logger = _interopRequireDefault(require("@wdio/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const log = (0, _logger.default)('@wdio/devtools-service:Auditor');
/**
 * metric scoring to calculate Lighthouse Performance Score
 * contains: [media, falloff]
 * see https://docs.google.com/spreadsheets/d/1_iDW0B870vZF6dAhf1Icdher0gX_KFxCd6Df0_fZ6do/edit#gid=283330180
 */

const METRIC_SCORING = {
  FMP: [4000, 1600],
  // first meaningful paint
  FI: [10000, 1700],
  // first interactive
  CI: [10000, 1700],
  // consistently interactive
  SI: [5500, 1250],
  // speed index
  EIL: [100, 50] // estimated input latency

};
const WEIGHT_WITHIN_CATEGORY = {
  FMP: 5,
  FI: 5,
  CI: 5,
  SI: 1,
  EIL: 1
};
const SHARED_AUDIT_CONTEXT = {
  settings: {
    throttlingMethod: 'devtools'
  },
  LighthouseRunWarnings: false,
  computedCache: new Map()
};

class Auditor {
  constructor(traceLogs, devtoolsLogs) {
    this.devtoolsLogs = devtoolsLogs;
    this.traceLogs = traceLogs;
    this.url = traceLogs.pageUrl;
    this.loaderId = traceLogs.loaderId;
  }

  _audit(AUDIT, params = {}) {
    const auditContext = _objectSpread({
      options: _objectSpread({}, AUDIT.defaultOptions)
    }, SHARED_AUDIT_CONTEXT);

    try {
      return AUDIT.audit(_objectSpread({
        traces: {
          defaultPass: this.traceLogs
        },
        devtoolsLogs: {
          defaultPass: this.devtoolsLogs
        }
      }, params), auditContext);
    } catch (e) {
      log.error(e);
      return {};
    }
  }
  /**
   * an Auditor instance is created for every trace so provide an updateCommands
   * function to receive the latest performance metrics with the browser instance
   */


  updateCommands(browser) {
    const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(fnName => fnName !== 'constructor' && fnName !== 'updateCommands' && !fnName.startsWith('_'));
    commands.forEach(fnName => browser.addCommand(fnName, this[fnName].bind(this)));
  }

  async getMainThreadWorkBreakdown() {
    const result = await this._audit(_mainthreadWorkBreakdown.default);
    return result.details.items.map(({
      group,
      duration
    }) => ({
      group,
      duration
    }));
  }

  async getDiagnostics() {
    const result = await this._audit(_diagnostics.default);
    /**
     * return null if Audit fails
     */

    if (!Object.prototype.hasOwnProperty.call(result, 'details')) {
      return null;
    }

    return result.details.items[0];
  }

  async getMetrics() {
    const timeToFirstByte = await this._audit(_timeToFirstByte.default, {
      URL: this.url
    });
    const result = await this._audit(_metrics.default);
    const metrics = result.details.items[0] || {};
    return {
      estimatedInputLatency: metrics.estimatedInputLatency,
      timeToFirstByte: Math.round(timeToFirstByte.rawValue, 10),
      domContentLoaded: metrics.observedDomContentLoaded,
      firstVisualChange: metrics.observedFirstVisualChange,
      firstPaint: metrics.observedFirstPaint,
      firstContentfulPaint: metrics.firstContentfulPaint,
      firstMeaningfulPaint: metrics.firstMeaningfulPaint,
      lastVisualChange: metrics.observedLastVisualChange,
      firstCPUIdle: metrics.firstCPUIdle,
      firstInteractive: metrics.interactive,
      load: metrics.observedLoad,
      speedIndex: metrics.speedIndex
    };
  }

  async getPerformanceScore() {
    const {
      firstMeaningfulPaint,
      firstCPUIdle,
      firstInteractive,
      speedIndex,
      estimatedInputLatency
    } = await this.getMetrics();
    /**
     * return null if any of the metrics could not bet calculated and
     * therefor are undefined
     */

    if (!firstMeaningfulPaint || !firstCPUIdle || !firstInteractive || !speedIndex || !estimatedInputLatency) {
      log.info('One or multiple required metrics couldn\'t be found, setting performance score to: null');
      return null;
    }

    const FMPScore = (0, _utils.quantileAtValue)(...METRIC_SCORING.FMP, firstMeaningfulPaint);
    const FIScore = (0, _utils.quantileAtValue)(...METRIC_SCORING.FI, firstCPUIdle);
    const CIScore = (0, _utils.quantileAtValue)(...METRIC_SCORING.CI, firstInteractive);
    const SIScore = (0, _utils.quantileAtValue)(...METRIC_SCORING.SI, speedIndex);
    const EILScore = (0, _utils.quantileAtValue)(...METRIC_SCORING.EIL, estimatedInputLatency);
    return (0, _weightedMean.default)([[FMPScore, WEIGHT_WITHIN_CATEGORY.FMP], [FIScore, WEIGHT_WITHIN_CATEGORY.FI], [CIScore, WEIGHT_WITHIN_CATEGORY.CI], [SIScore, WEIGHT_WITHIN_CATEGORY.SI], [EILScore, WEIGHT_WITHIN_CATEGORY.EIL]]);
  }

}

exports.default = Auditor;