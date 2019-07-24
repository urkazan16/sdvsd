"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
exports.LinkableHeaderH5 = ({ id, children, level = 1, styleName = '' }) => {
    return (react_1.default.createElement("h5", { id: id, className: `subtitle is-${level} linkable-header ${styleName}` },
        id && (react_1.default.createElement("a", { href: `#${id}`, className: "linkable-header__link" }, "\uD83D\uDD17")),
        children));
};
exports.LinkableHeaderH4 = ({ id, children, level = 1, styleName = '' }) => {
    return (react_1.default.createElement("h4", { id: id, className: `subtitle is-${level} linkable-header ${styleName}` },
        id && (react_1.default.createElement("a", { href: `#${id}`, className: "linkable-header__link" }, "\uD83D\uDD17")),
        children));
};
exports.makeId = title => (title ? title.replace(/ /g, '-') : null);
