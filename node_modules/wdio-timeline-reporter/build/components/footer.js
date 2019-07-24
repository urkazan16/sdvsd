"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Footer = () => {
    return (react_1.default.createElement("footer", { className: "footer" },
        react_1.default.createElement("div", { className: "content has-text-centered" },
            react_1.default.createElement("p", null,
                react_1.default.createElement("strong", null, "wdio-timeline-reporter"),
                " by Qops. The source code is licensed ",
                react_1.default.createElement("a", { href: "http://opensource.org/licenses/mit-license.php" }, "MIT"),
                "."),
            react_1.default.createElement("a", { href: "https://bulma.io" },
                react_1.default.createElement("img", { src: "https://bulma.io/images/made-with-bulma--black.png", alt: "Made with Bulma", width: "128", height: "24" })))));
};
exports.default = Footer;
