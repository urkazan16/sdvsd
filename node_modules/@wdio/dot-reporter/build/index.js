"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _reporter = _interopRequireDefault(require("@wdio/reporter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initialize a new `Dot` matrix test reporter.
 */
class DotReporter extends _reporter.default {
  constructor(options) {
    /**
     * make dot reporter to write to output stream by default
     */
    options = Object.assign({
      stdout: true
    }, options);
    super(options);
  }
  /**
   * pending tests
   */


  onTestSkip() {
    this.write(_chalk.default.cyanBright('.'));
  }
  /**
   * passing tests
   */


  onTestPass() {
    this.write(_chalk.default.greenBright('.'));
  }
  /**
   * failing tests
   */


  onTestFail() {
    this.write(_chalk.default.redBright('F'));
  }

}

exports.default = DotReporter;