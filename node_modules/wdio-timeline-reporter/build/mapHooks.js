"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapHooks = suiteHooks => {
    let hooks = [];
    for (let hookName of Object.keys(suiteHooks)) {
        const hook = suiteHooks[hookName];
        let hookResult = {};
        hookResult.start = hook.start;
        hookResult.end = hook.end;
        hookResult.duration = hook._duration;
        hookResult.title = hook.title;
        hookResult.associatedSuite = hook.parent;
        hookResult.associatedTest = hook.currentTest;
        if (hook.error) {
            hookResult.error = {};
            if (hook.error.type) {
                hookResult.error.type = hook.error.type;
            }
            if (hook.error.message) {
                hookResult.error.message = hook.error.message;
            }
            if (hook.error.stack) {
                hookResult.error.stack = hook.error.stack;
            }
        }
        hooks.push(hookResult);
    }
    return hooks;
};
