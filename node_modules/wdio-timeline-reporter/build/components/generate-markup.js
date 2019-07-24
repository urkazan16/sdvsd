"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const server_1 = require("react-dom/server");
const modal_1 = __importDefault(require("./modal"));
const result_summary_1 = __importDefault(require("./result-summary"));
const results_1 = __importDefault(require("./results"));
const footer_1 = __importDefault(require("./footer"));
const style = {
    paddingBottom: 25
};
exports.generateMarkup = props => {
    const { summary } = props;
    return server_1.renderToStaticMarkup(react_1.default.createElement("div", null,
        react_1.default.createElement(modal_1.default, null),
        react_1.default.createElement("section", { className: "section has-background-light", style: style },
            react_1.default.createElement(result_summary_1.default, Object.assign({}, summary)),
            react_1.default.createElement(results_1.default, Object.assign({}, props))),
        react_1.default.createElement(footer_1.default, null)));
};
