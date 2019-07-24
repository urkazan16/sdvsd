"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _testingbotTunnelLauncher = _interopRequireDefault(require("testingbot-tunnel-launcher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestingBotLauncher {
  onPrepare(config) {
    if (!config.tbTunnel) {
      return;
    }

    this.tbTunnelOpts = Object.assign({
      apiKey: config.user,
      apiSecret: config.key
    }, config.tbTunnelOpts);
    config.protocol = 'http';
    config.hostname = 'localhost';
    config.port = 4445;
    return new Promise((resolve, reject) => (0, _testingbotTunnelLauncher.default)(this.tbTunnelOpts, (err, tunnel) => {
      /* istanbul ignore if */
      if (err) {
        return reject(err);
      }

      this.tunnel = tunnel;
      return resolve();
    }));
  }
  /**
   * Shut down the tunnel
   * @returns {Promise} Resolved promise when tunnel is closed
   */


  onComplete() {
    if (!this.tunnel) {
      return;
    }

    return new Promise(resolve => this.tunnel.close(resolve));
  }

}

exports.default = TestingBotLauncher;