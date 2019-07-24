"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runServiceHook = runServiceHook;
exports.runOnPrepareHook = runOnPrepareHook;
exports.runOnCompleteHook = runOnCompleteHook;
exports.getNpmPackageName = getNpmPackageName;
exports.getPackageName = getPackageName;
exports.getRunnerName = getRunnerName;
exports.parseInstallNameAndPackage = parseInstallNameAndPackage;
exports.findInConfig = findInConfig;
exports.replaceConfig = replaceConfig;
exports.addServiceDeps = addServiceDeps;

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('@wdio/cli:utils');
/**
 * run service launch sequences
 */

async function runServiceHook(launcher, hookName, ...args) {
  try {
    return await Promise.all(launcher.map(service => {
      if (typeof service[hookName] === 'function') {
        return service[hookName](...args);
      }
    }));
  } catch (e) {
    log.error(`A service failed in the '${hookName}' hook\n${e.stack}\n\nContinue...`);
  }
}
/**
 * Run onPrepareHook in Launcher
 * @param {Array|Function} onPrepareHook - can be array of functions or single function
 * @param {Object} config
 * @param {Object} capabilities
 */


async function runOnPrepareHook(onPrepareHook, config, capabilities) {
  const catchFn = e => log.error(`Error in onPrepareHook: ${e.stack}`);

  if (typeof onPrepareHook === 'function') {
    onPrepareHook = [onPrepareHook];
  }

  return Promise.all(onPrepareHook.map(hook => {
    try {
      return hook(config, capabilities);
    } catch (e) {
      return catchFn(e);
    }
  })).catch(catchFn);
}
/**
 * Run onCompleteHook in Launcher
 * @param {Array|Function} onCompleteHook - can be array of functions or single function
 * @param {*} config
 * @param {*} capabilities
 * @param {*} exitCode
 * @param {*} results
 */


async function runOnCompleteHook(onCompleteHook, config, capabilities, exitCode, results) {
  if (typeof onCompleteHook === 'function') {
    onCompleteHook = [onCompleteHook];
  }

  return Promise.all(onCompleteHook.map(async hook => {
    try {
      await hook(exitCode, config, capabilities, results);
      return 0;
    } catch (e) {
      log.error(`Error in onCompleteHook: ${e.stack}`);
      return 1;
    }
  }));
}
/**
 * map package names
 * used in the CLI to find the name of the package for different questions
 * answers.framework {String}
 * answers.reporters | answer.services {Array<string>}
 */


function getNpmPackageName(pkgLabels) {
  if (typeof pkgLabels === 'string') {
    return pkgLabels.split('/package/')[1];
  }

  return pkgLabels.map(pkgLabel => pkgLabel.split('/package/')[1]);
}

function getPackageName(pkg) {
  return pkg.trim().split(' -')[0];
}
/**
 * get runner identification by caps
 */


function getRunnerName(caps = {}) {
  let runner = caps.browserName || caps.appPackage || caps.appWaitActivity || caps.app || caps.platformName; // MultiRemote

  if (!runner) {
    runner = Object.values(caps).length === 0 || Object.values(caps).some(cap => !cap.capabilities) ? 'undefined' : 'MultiRemote';
  }

  return runner;
}
/**
 * used by the install command to better find the package to install
 */


function parseInstallNameAndPackage(list) {
  const returnObj = {};

  for (let item of list) {
    returnObj[getPackageName(item)] = getNpmPackageName(item);
  }

  return returnObj;
}

function buildNewConfigArray(str, type, change) {
  const newStr = str.split(`${type}s: `)[1].replace('\'', '');
  let newArray = newStr.match(/(\w*)/gmi).filter(e => !!e).concat([change]);
  return str.replace('// ', '').replace(new RegExp(`(${type}s: )((.*\\s*)*)`), `$1[${newArray.map(e => `'${e}'`)}]`);
}

function buildNewConfigString(str, type, change) {
  return str.replace(new RegExp(`(${type}: )('\\w*')`), `$1'${change}'`);
}

function findInConfig(config, type) {
  let regexStr = `[\\/\\/]*[\\s]*${type}s: [\\s]*\\[([\\s]*['|"]\\w*['|"],*)*[\\s]*\\]`;

  if (type === 'framework') {
    regexStr = `[\\/\\/]*[\\s]*${type}: ([\\s]*['|"]\\w*['|"])`;
  }

  const regex = new RegExp(regexStr, 'gmi');
  return config.match(regex);
}

function replaceConfig(config, type, name) {
  const match = findInConfig(config, type);

  if (match && match.length) {
    if (type === 'framework') {
      return buildNewConfigString(config, type, name);
    }

    const text = match.pop();
    return config.replace(text, buildNewConfigArray(text, type, name));
  }
}

function addServiceDeps(names, packages, update) {
  /**
   * automatically install latest Chromedriver if `wdio-chromedriver-service`
   * was selected for install
   */
  if (names.some(answer => answer.includes('wdio-chromedriver-service'))) {
    packages.push('chromedriver');

    if (update) {
      // eslint-disable-next-line no-console
      console.log('\n=======', '\nPlease change path to / in your wdio.conf.js:', "\npath: '/'", '\n=======\n');
    }
  }
  /**
   * install Appium if it is not installed globally if `@wdio/appium-service`
   * was selected for install
   */


  if (names.some(answer => answer.includes('@wdio/appium-service'))) {
    const result = (0, _child_process.execSync)('appium --version || echo APPIUM_MISSING').toString().trim();

    if (result === 'APPIUM_MISSING') {
      packages.push('appium');
    } else if (update) {
      // eslint-disable-next-line no-console
      console.log('\n=======', '\nUsing globally installed appium', result, '\nPlease add the following to your wdio.conf.js:', "\nappium: { command: 'appium' }", '\n=======\n');
    }
  }
}