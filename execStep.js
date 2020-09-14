"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execStep = void 0;
var model_1 = require("./model");
function execStep(inExpr) {
    var result = [];
    var stepDone = false;
    for (var _i = 0, inExpr_1 = inExpr; _i < inExpr_1.length; _i++) {
        var x = inExpr_1[_i];
        if (stepDone) {
            result.push(x);
        }
        else if (result.length !== 0 && result[result.length - 1] instanceof model_1.Func) {
            var f = result.pop();
            result.push(f.apply(x));
            stepDone = true;
        }
        else {
            if (typeof x === 'string') {
                result.push(x);
            }
            else if (x instanceof model_1.Func) {
                var _a = execStep(x.body), newBody = _a[0], subStep = _a[1];
                if (subStep) {
                    stepDone = true;
                    result.push(new model_1.Func(x.param, newBody));
                }
                else {
                    result.push(x);
                }
            }
            else {
                var _b = execStep(x), subResult = _b[0], subStepDone = _b[1];
                if (subStepDone) {
                    stepDone = true;
                }
                if (subResult.length == 1) {
                    result.push(subResult[0]);
                    stepDone = true;
                }
                else {
                    result.push(subResult);
                }
            }
        }
    }
    return [result, stepDone];
}
exports.execStep = execStep;
//# sourceMappingURL=execStep.js.map