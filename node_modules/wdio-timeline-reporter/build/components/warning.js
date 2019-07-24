"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Warning = props => {
    return props.state === 'unknown' ?
        (react_1.default.createElement("article", { className: "message is-warning" },
            react_1.default.createElement("div", { className: "message-body" }, "Test returned without a status. Have you focused on a different test in suite using fit in Jasmine?"))) : null;
};
exports.default = Warning;
