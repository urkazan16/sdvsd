"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Error = props => {
    const { state, error } = props;
    const failedAndErrorMessageAvailable = state === 'failed' && error;
    return failedAndErrorMessageAvailable ? (react_1.default.createElement("details", null,
        react_1.default.createElement("summary", { className: "subtitle has-text-danger" }, "Error Log"),
        react_1.default.createElement("table", { className: "table is-striped is-bordered is-fullwidth" },
            !!error.type && (react_1.default.createElement("tr", null,
                react_1.default.createElement("td", null, "Type:"),
                react_1.default.createElement("td", null, error.type))),
            !!error.message && (react_1.default.createElement("tr", null,
                react_1.default.createElement("td", null, "Message:"),
                react_1.default.createElement("td", { style: { display: 'grid' } },
                    react_1.default.createElement("pre", { className: "stack has-background-grey-dark has-text-white-bis" }, error.message.replace(/<|>/g, ''))))),
            !!error.stack && (react_1.default.createElement("tr", null,
                react_1.default.createElement("td", null, "Stack:"),
                react_1.default.createElement("td", { style: { display: 'grid' } },
                    react_1.default.createElement("pre", { className: "stack has-background-grey-dark has-text-white-bis" }, error.stack.replace(/<|>/g, '')))))))) : null;
};
exports.default = Error;
