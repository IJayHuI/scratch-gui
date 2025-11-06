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

import storage from "../lib/storage.js";
import { supabase } from "../lib/supabase-client.js";
import { setSession } from "../reducers/session.js";
import { openLoadingProject, closeLoadingProject } from "../reducers/modals.js";
import { setProjectTitle } from "../reducers/project-title.js";
import { setProjectId } from "../reducers/project-state.js";

// 检查 URL 是否包含参数
const param = new URLSearchParams(window.location.search);
const token = param.get("token");
const refreshToken = param.get("refresh-token");
const projectId = param.get("project-id");
localStorage.setItem('project-id', projectId)
// 如果没有，则跳转回原网站
if (!token || !refreshToken || !projectId) {
    window.location.href =
        window.location.hostname === "localhost"
            ? "http://localhost:5173/login"
            : "https://blockcode.com.cn/login";
}
const { error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: refreshToken,
});
if (error) {
    window.location.href =
        window.location.hostname === "localhost"
            ? "http://localhost:5173/login"
            : "https://blockcode.com.cn/login";
}

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

storage.reduxStore.dispatch(openLoadingProject());
const { data } = await supabase.auth.getSession();
const profile = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .maybeSingle();
if (profile.error) console.error(profile.error);
const sessionState = {
    session: {
        user: {
            username: profile.data.nick_name
                ? profile.data.nick_name
                : data.session.user.email.split("@")[0], // 用邮箱前缀做 username
            thumbnailUrl: null, // Supabase avatar 或 null
            classroomId: String(profile.data.class), // 如果你没有 classroom，可以先置 null
        },
    },
    permissions: {
        educator: profile.data.role === "student" ? false : true, // 默认 false，可根据实际业务修改
        student: profile.data.role === "student" ? true : false, // 默认 true
    },
};
// 注入 Redux
storage.reduxStore.dispatch(setSession(sessionState));
const { data: fileData, error: errorData } = await supabase
    .from("files")
    .select("*")
    .eq("id", projectId)
    .single();
if (errorData) {
    this.props.onError(errorData);
    log.error(errorData);
}
const {
    data: { signedUrl: fileUrl },
} = await supabase.storage
    .from("files")
    .createSignedUrl(fileData.file_path, 60 * 60);
storage.reduxStore.dispatch(setProjectId(fileUrl));
storage.reduxStore.dispatch(setProjectTitle(fileData.file_name));
storage.reduxStore.dispatch(closeLoadingProject());
