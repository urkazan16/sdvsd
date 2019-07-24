"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const linkOrPlainText = item => {
    return item.value.startsWith('<a') ? (react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: item.value } })) : item.value;
};
const AdditionalContext = props => {
    const { context } = props;
    return !!context ?
        (react_1.default.createElement("details", null,
            react_1.default.createElement("summary", { className: "subtitle has-text-danger" }, "Additional Context"),
            react_1.default.createElement("table", { className: "table is-striped is-bordered is-fullwidth" }, context.map((item, index) => {
                return typeof item === 'string' ? (react_1.default.createElement("tr", { key: index },
                    react_1.default.createElement("td", null),
                    react_1.default.createElement("td", null, item))) : typeof item === 'object' ?
                    (react_1.default.createElement("tr", { key: index },
                        react_1.default.createElement("td", null,
                            item.title,
                            ":"),
                        react_1.default.createElement("td", null, linkOrPlainText(item))))
                    : null;
            })))) : null;
};
exports.default = AdditionalContext;
