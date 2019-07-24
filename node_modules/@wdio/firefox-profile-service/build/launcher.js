"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _firefoxProfile = _interopRequireDefault(require("firefox-profile"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FirefoxProfileLauncher {
  async onPrepare(config, capabilities) {
    var _context;

    this.config = config;
    this.capabilities = capabilities; // Return if no profile options were specified

    if (!this.config.firefoxProfile) {
      return;
    }

    this.profile = new _firefoxProfile.default(); // Set preferences and proxy

    this._setPreferences();

    if (!Array.isArray(this.config.firefoxProfile.extensions)) {
      return this._buildExtension();
    } // Add the extension


    await (0, _util.promisify)((_context = this.profile).addExtensions.bind(_context))(this.config.firefoxProfile.extensions);
    return this._buildExtension();
  }
  /**
   * Sets any preferences and proxy
   */


  _setPreferences() {
    for (const [preference, value] of Object.entries(this.config.firefoxProfile)) {
      if (['extensions', 'proxy', 'legacy'].includes(preference)) {
        continue;
      }

      this.profile.setPreference(preference, value);
    }

    if (this.config.firefoxProfile.proxy) {
      this.profile.setProxy(this.config.firefoxProfile.proxy);
    }

    this.profile.updatePreferences();
  }

  async _buildExtension() {
    var _context2;

    const zippedProfile = await (0, _util.promisify)((_context2 = this.profile).encoded.bind(_context2))();

    if (Array.isArray(this.capabilities)) {
      this.capabilities.filter(capability => capability.browserName === 'firefox').forEach(capability => {
        this._setProfile(capability, zippedProfile);
      });
      return;
    }

    for (const browser in this.capabilities) {
      const capability = this.capabilities[browser].capabilities;

      if (!capability || capability.browserName !== 'firefox') {
        continue;
      }

      this._setProfile(capability, zippedProfile);
    }
  }

  _setProfile(capability, zippedProfile) {
    if (this.config.firefoxProfile.legacy) {
      // for older firefox and geckodriver versions
      capability.firefox_profile = zippedProfile;
    } else {
      // for firefox >= 56.0 and geckodriver >= 0.19.0
      capability['moz:firefoxOptions'] = capability['moz:firefoxOptions'] || {};
      capability['moz:firefoxOptions'].profile = zippedProfile;
    }
  }

}

exports.default = FirefoxProfileLauncher;