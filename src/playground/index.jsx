// Polyfills
import "es6-object-assign/auto";
import "core-js/fn/array/includes";
import "core-js/fn/promise/finally";
import "intl"; // For Safari 9

import React from "react";
import ReactDOM from "react-dom";

import AppStateHOC from "../lib/app-state-hoc.jsx";
import BrowserModalComponent from "../components/browser-modal/browser-modal.jsx";
import supportedBrowser from "../lib/supported-browser";

import styles from "./index.css";

// 检查 URL 是否包含参数
const param = new URLSearchParams(window.location.search);
const token = param.get("token");
const refreshToken = param.get("refresh-token");
// 如果没有，则跳转回原网站
if (!token || !refreshToken) {
    window.location.href =
        window.location.hostname === "localhost"
            ? "http://localhost:5173/login"
            : "https://blockcode.com.cn/login";
}
// 如果有，则将其存储在 localStorage 中
localStorage.setItem("token", token);
localStorage.setItem("refresh-token", refreshToken);

const appTarget = document.createElement("div");
appTarget.className = styles.app;
document.body.appendChild(appTarget);

if (supportedBrowser()) {
    // require needed here to avoid importing unsupported browser-crashing code
    // at the top level
    require("./render-gui.jsx").default(appTarget);
} else {
    BrowserModalComponent.setAppElement(appTarget);
    const WrappedBrowserModalComponent = AppStateHOC(
        BrowserModalComponent,
        true /* localesOnly */
    );
    const handleBack = () => {};
    // eslint-disable-next-line react/jsx-no-bind
    ReactDOM.render(
        <WrappedBrowserModalComponent onBack={handleBack} />,
        appTarget
    );
}
