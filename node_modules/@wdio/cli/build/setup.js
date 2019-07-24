"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setup;

var _fs = _interopRequireDefault(require("fs"));

var _ejs = _interopRequireDefault(require("ejs"));

var _path = _interopRequireDefault(require("path"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _yarnInstall = _interopRequireDefault(require("yarn-install"));

var _config = require("./config");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

async function setup(exit = true) {
  try {
    console.log(_config.CONFIG_HELPER_INTRO);
    const answers = await _inquirer.default.prompt(_config.QUESTIONNAIRE);
    const packagesToInstall = [(0, _utils.getNpmPackageName)(answers.runner), (0, _utils.getNpmPackageName)(answers.framework), ...answers.reporters.map(_utils.getNpmPackageName), ...answers.services.map(_utils.getNpmPackageName)];

    if (answers.executionMode === 'sync') {
      packagesToInstall.push('@wdio/sync');
    } // add packages that are required by services


    (0, _utils.addServiceDeps)(answers.services, packagesToInstall);
    console.log('\nInstalling wdio packages:\n-', packagesToInstall.join('\n- '));
    const result = (0, _yarnInstall.default)({
      deps: packagesToInstall,
      dev: true
    });

    if (result.status !== 0) {
      throw new Error(result.stderr);
    }

    console.log('\nPackages installed successfully, creating configuration file...');

    const parsedAnswers = _objectSpread({}, answers, {
      runner: (0, _utils.getPackageName)(answers.runner),
      framework: (0, _utils.getPackageName)(answers.framework),
      reporters: answers.reporters.map(_utils.getPackageName),
      services: answers.services.map(_utils.getPackageName),
      packagesToInstall
    });

    renderConfigurationFile(parsedAnswers);

    if (exit) {
      process.exit(0);
    }
  } catch (error) {
    throw new Error(error);
  }
}

function renderConfigurationFile(answers) {
  const tpl = _fs.default.readFileSync(_path.default.join(__dirname, '/templates/wdio.conf.tpl.ejs'), 'utf8');

  const renderedTpl = _ejs.default.render(tpl, {
    answers
  });

  _fs.default.writeFileSync(_path.default.join(process.cwd(), 'wdio.conf.js'), renderedTpl);

  console.log(_config.CONFIG_HELPER_SUCCESS_MESSAGE);
}