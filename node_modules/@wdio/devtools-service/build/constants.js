"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NETWORK_STATES = exports.DEFAULT_NETWORK_THROTTLING_STATE = exports.NETWORK_IDLE_TIMEOUT = exports.MAX_TRACE_WAIT_TIME = exports.CPU_IDLE_TRESHOLD = exports.TRACING_TIMEOUT = exports.FRAME_LOAD_START_TIMEOUT = exports.IGNORED_URLS = exports.DEFAULT_TRACING_CATEGORIES = void 0;

var _constants = require("lighthouse/lighthouse-core/config/constants");

/**
 * performance tracing categories
 */
const DEFAULT_TRACING_CATEGORIES = [// Exclude default categories. We'll be selective to minimize trace size
'-*', // Used instead of 'toplevel' in Chrome 71+
'disabled-by-default-lighthouse', // All compile/execute events are captured by parent events in devtools.timeline..
// But the v8 category provides some nice context for only <0.5% of the trace size
'v8', // Same situation here. This category is there for RunMicrotasks only, but with other teams
// accidentally excluding microtasks, we don't want to assume a parent event will always exist
'v8.execute', // For extracting UserTiming marks/measures
'blink.user_timing', // Not mandatory but not used much
'blink.console', // Most the events we need come in on these two
'devtools.timeline', 'disabled-by-default-devtools.timeline', // Up to 450 (https://goo.gl/rBfhn4) JPGs added to the trace
'disabled-by-default-devtools.screenshot', // This doesn't add its own events, but adds a `stackTrace` property to devtools.timeline events
'disabled-by-default-devtools.timeline.stack', // Include screenshots for frame viewer
'disabled-by-default-devtools.screenshot'];
/**
 * ignored urls in request logger
 */

exports.DEFAULT_TRACING_CATEGORIES = DEFAULT_TRACING_CATEGORIES;
const IGNORED_URLS = ['data:,', // empty pages
'about:', // new tabs
'chrome-extension://' // all chrome extensions
];
exports.IGNORED_URLS = IGNORED_URLS;
const FRAME_LOAD_START_TIMEOUT = 2000;
exports.FRAME_LOAD_START_TIMEOUT = FRAME_LOAD_START_TIMEOUT;
const TRACING_TIMEOUT = 10000;
exports.TRACING_TIMEOUT = TRACING_TIMEOUT;
const CPU_IDLE_TRESHOLD = 10000;
exports.CPU_IDLE_TRESHOLD = CPU_IDLE_TRESHOLD;
const MAX_TRACE_WAIT_TIME = 45000;
exports.MAX_TRACE_WAIT_TIME = MAX_TRACE_WAIT_TIME;
const NETWORK_IDLE_TIMEOUT = 5000;
exports.NETWORK_IDLE_TIMEOUT = NETWORK_IDLE_TIMEOUT;
const DEFAULT_NETWORK_THROTTLING_STATE = 'Good 3G';
exports.DEFAULT_NETWORK_THROTTLING_STATE = DEFAULT_NETWORK_THROTTLING_STATE;
const NETWORK_STATES = {
  offline: {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0
  },
  GPRS: {
    offline: false,
    downloadThroughput: 50 * 1024 / 8,
    uploadThroughput: 20 * 1024 / 8,
    latency: 500
  },
  'Regular 2G': {
    offline: false,
    downloadThroughput: 250 * 1024 / 8,
    uploadThroughput: 50 * 1024 / 8,
    latency: 300
  },
  'Good 2G': {
    offline: false,
    downloadThroughput: 450 * 1024 / 8,
    uploadThroughput: 150 * 1024 / 8,
    latency: 150
  },
  'Regular 3G': {
    offline: false,
    latency: _constants.throttling.mobileRegluar3G.requestLatencyMs,
    // DevTools expects throughput in bytes per second rather than kbps
    downloadThroughput: Math.floor(_constants.throttling.mobileRegluar3G.downloadThroughputKbps * 1024 / 8),
    uploadThroughput: Math.floor(_constants.throttling.mobileRegluar3G.uploadThroughputKbps * 1024 / 8)
  },
  'Good 3G': {
    offline: false,
    latency: _constants.throttling.mobileSlow4G.requestLatencyMs,
    // DevTools expects throughput in bytes per second rather than kbps
    downloadThroughput: Math.floor(_constants.throttling.mobileSlow4G.downloadThroughputKbps * 1024 / 8),
    uploadThroughput: Math.floor(_constants.throttling.mobileSlow4G.uploadThroughputKbps * 1024 / 8)
  },
  'Regular 4G': {
    offline: false,
    downloadThroughput: 4 * 1024 * 1024 / 8,
    uploadThroughput: 3 * 1024 * 1024 / 8,
    latency: 20
  },
  'DSL': {
    offline: false,
    downloadThroughput: 2 * 1024 * 1024 / 8,
    uploadThroughput: 1 * 1024 * 1024 / 8,
    latency: 5
  },
  'Wifi': {
    offline: false,
    downloadThroughput: 30 * 1024 * 1024 / 8,
    uploadThroughput: 15 * 1024 * 1024 / 8,
    latency: 2
  },
  online: {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1
  }
};
exports.NETWORK_STATES = NETWORK_STATES;