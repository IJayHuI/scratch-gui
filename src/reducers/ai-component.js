const SET_AI_COMPONENT = "scratch-gui/AIComponent/SET_AI_COMPONENT";

const initialState = {
    aiComponent: false,
};

const reducer = function (state, action) {
    if (typeof state === "undefined") state = initialState;
    switch (action.type) {
        case SET_AI_COMPONENT:
            return {
                aiComponent: action.aiComponent,
            };
        default:
            return state;
    }
};

const setAIComponent = function (status) {
    return {
        type: SET_AI_COMPONENT,
        aiComponent: status,
    };
};

export {
    reducer as default,
    initialState as aiComponentInitialState,
    setAIComponent,
};
