"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = builder;
exports.handler = handler;
exports.desc = exports.command = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _yarnInstall = _interopRequireDefault(require("yarn-install"));

var _setup = _interopRequireDefault(require("../setup"));

var _config = require("../config");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */

/**
    wdio install <type> <packageName>
 */
const supportedInstallations = {
  service: (0, _utils.parseInstallNameAndPackage)(_config.SUPPORTED_SERVICES),
  reporter: (0, _utils.parseInstallNameAndPackage)(_config.SUPPORTED_REPORTER),
  framework: (0, _utils.parseInstallNameAndPackage)(_config.SUPPORTED_FRAMEWORKS)
};
const command = 'install <type> <name>';
exports.command = command;
const desc = 'Add a `reporter`, `service`, or `framework` to your WebdriverIO project';
exports.desc = desc;

function builder(yargs) {
  return yargs.option('npm', {
    desc: 'Install packages using npm',
    type: 'boolean',
    default: false
  });
}

async function handler(argv) {
  /**
   * type = service | reporter | framework
   * name = names for the supported service or reporter
   * npm = optional flag to install package using npm instead of default yarn
   */
  const {
    type,
    name,
    npm
  } = argv; // verify for supported types via `supportedInstallations` keys

  if (!Object.keys(supportedInstallations).includes(type)) {
    console.log(`Type ${type} is not supported.`);
    process.exit(0);
    return;
  } // verify if the name of the `type` is valid


  if (!Object.keys(supportedInstallations[type]).includes(name)) {
    console.log(`${name} is not a supported ${type}.`);
    process.exit(0);
    return;
  }

  const localConfPath = _path.default.join(process.cwd(), 'wdio.conf.js');

  if (!_fs.default.existsSync(localConfPath)) {
    try {
      const {
        config
      } = await _inquirer.default.prompt([{
        type: 'confirm',
        name: 'config',
        message: `Error: Could not install ${name} ${type} due to missing configuration. Would you like to create one?`,
        default: false
      }]);

      if (!config) {
        console.log(`
Cannot install packages without a WebdriverIO configuration.
You can create one by running 'wdio config'`);
        process.exit(0);
      }

      await (0, _setup.default)(false);
    } catch (error) {
      console.error('Error installing', error);
      process.exit(1);
    }
  }

  const configFile = _fs.default.readFileSync(localConfPath, {
    encoding: 'UTF-8'
  });

  const match = (0, _utils.findInConfig)(configFile, type);

  if (match && match[0].includes(name)) {
    console.log(`The ${type} ${name} is already part of your configuration`);
    process.exit(0);
    return;
  }

  const pkgNames = [supportedInstallations[type][name]];
  (0, _utils.addServiceDeps)(pkgNames, pkgNames, true);
  console.log(`Installing ${pkgNames}${npm ? ' using npm.' : '.'}`);
  const install = (0, _yarnInstall.default)({
    deps: pkgNames,
    dev: true,
    respectNpm5: npm
  });

  if (install.status !== 0) {
    console.error('Error installing packages', install.stderr);
    process.exit(1);
  }

  console.log(`Package ${pkgNames} installed successfully.`);
  console.log('Updating wdio.conf.js file.');
  const newConfig = (0, _utils.replaceConfig)(configFile, type, name);

  _fs.default.writeFileSync(localConfPath, newConfig, {
    encoding: 'utf-8'
  });

  console.log('Your wdio.conf.js file has been updated');
  process.exit(0);
}
/* eslint-enable no-console */