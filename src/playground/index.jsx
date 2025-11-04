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

// 检查 URL 是否包含 token 参数
const token = new URLSearchParams(window.location.search).get("token");
// 如果没有 token，则跳转回原网站
if (!token) {
    window.location.href =
        window.location.hostname === "localhost"
            ? "http://localhost:5173/login"
            : "https://blockcode.com.cn/login";
}
// 如果有 token，则将其存储在 sessionStorage 中
sessionStorage.setItem("token", token);
// 清除地址栏参数（防止泄露）
const cleanUrl = window.location.origin + window.location.pathname;
window.history.replaceState({}, document.title, cleanUrl);

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
