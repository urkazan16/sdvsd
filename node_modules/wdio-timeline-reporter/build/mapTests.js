"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapTests = suiteTests => {
    let tests = [];
    for (let testName of Object.keys(suiteTests)) {
        const test = suiteTests[testName];
        const testCase = {};
        testCase.title = test.title;
        testCase.start = test.start;
        testCase.end = test.end;
        testCase.duration = test._duration;
        testCase.state = test.state;
        testCase.screenshots = test.screenshots;
        testCase.context = test.context;
        if (test.error) {
            testCase.error = {};
            if (test.error.type) {
                testCase.error.type = test.error.type;
            }
            if (test.error.message) {
                testCase.error.message = test.error.message;
            }
            if (test.error.stack) {
                testCase.error.stack = test.error.stack;
            }
        }
        tests.push(testCase);
    }
    return tests;
};
