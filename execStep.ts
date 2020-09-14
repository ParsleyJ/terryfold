import {expr, Func} from "./model";

/**
 * Attempts to execute a step in the computation of the functional program.
 * This means that either exactly a function is applied, or a redundant pair of parentheses
 * is removed.
 */
export function execStep(inExpr: expr): [expr, boolean] {
    let result: expr = [];
    let stepDone: boolean = false;
    for (let x of inExpr) {
        if (stepDone) {
            result.push(x);
        } else if (result.length !== 0 && result[result.length - 1] instanceof Func) {
            let f: Func = <Func>result.pop();
            result.push(f.apply(x));
            stepDone = true;
        } else {
            if (typeof x === 'string') {
                result.push(x);
            } else if (x instanceof Func) {
                let [newBody, subStep] = execStep(x.body);
                if (subStep) {
                    stepDone = true;
                    result.push(new Func(x.param, newBody));
                } else {
                    result.push(x);
                }
            } else {
                let [subResult, subStepDone] = execStep(x);

                if (subStepDone) {
                    stepDone = true;
                }

                if (subResult.length == 1) {
                    result.push(subResult[0]);
                    stepDone = true;
                } else {
                    result.push(subResult);
                }
            }
        }
    }
    return [result, stepDone];
}
