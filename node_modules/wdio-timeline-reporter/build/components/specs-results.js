"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const suites_results_1 = __importDefault(require("./suites-results"));
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const test_summary_1 = require("./test-summary");
const SpecsResults = props => {
    const { specs } = props;
    return specs.map(spec => {
        return (react_1.default.createElement("div", { className: "box", "data-box-is": "spec" },
            react_1.default.createElement("h4", { className: "title is-4" },
                react_1.default.createElement("span", { className: "has-text-grey-light" }, "Spec:"),
                " ",
                spec.filename,
                ' '),
            react_1.default.createElement("h4", { className: "title is-4" },
                react_1.default.createElement("span", { className: "has-text-grey-light" }, "Duration:"),
                ' ',
                humanize_duration_1.default(spec.duration, { round: true })),
            react_1.default.createElement("h4", { className: "title is-4" },
                react_1.default.createElement("span", { className: "has-text-grey-light" }, "Browser: "),
                react_1.default.createElement("span", { className: "has-text-grey-light" },
                    react_1.default.createElement("i", { className: `fab ${test_summary_1.getBrowserFontIconClass(spec.browser)}` })),
                " ",
                spec.browser),
            react_1.default.createElement(suites_results_1.default, { suites: spec.suites })));
    });
};
exports.default = SpecsResults;
