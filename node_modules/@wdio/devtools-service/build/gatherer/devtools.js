"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class DevtoolsGatherer {
  constructor() {
    this.logs = [];
  }

  onMessage(msgObj) {
    this.logs.push(msgObj);
  }
  /**
   * retrieve logs and clean cache
   */


  getLogs() {
    return this.logs.splice(0, this.logs.length);
  }

}

exports.default = DevtoolsGatherer;