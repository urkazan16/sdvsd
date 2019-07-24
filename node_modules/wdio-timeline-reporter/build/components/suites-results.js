"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const tests_results_1 = __importDefault(require("./tests-results"));
const linkable_header_1 = require("./linkable-header");
const SuitesResults = props => {
    const { suites } = props;
    return suites.map(item => {
        const id = linkable_header_1.makeId(item.title);
        return (react_1.default.createElement("div", { className: "box suites-results", "data-box-is": "suite" },
            react_1.default.createElement(linkable_header_1.LinkableHeaderH4, { styleName: 'subtitle', level: 4, id: id }, item.title),
            react_1.default.createElement(tests_results_1.default, { tests: item.tests })));
    });
};
exports.default = SuitesResults;
