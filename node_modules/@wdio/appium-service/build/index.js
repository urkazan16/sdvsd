"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launcher = exports.default = void 0;

var _launcher = require("./launcher");

class AppiumService {}

exports.default = AppiumService;
const launcher = _launcher.AppiumLauncher;
exports.launcher = launcher;