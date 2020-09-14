/**
 * A term is etiher a function, or a variable ( a string ) or a subexpression.
 */
export type term = Func | string | expr

/**
 * An expression is simply a sequence of terms.
 */
export type expr = (term)[];

/**
 * Use this to create a lambdaCalculus-style string representation of an expr
 */
export function stringifyExpr(e: expr): string {
    return "" +
        e.map((x: term) => {
            if (typeof x === 'string') {
                return "" + x;
            } else if (x instanceof Func) {
                return x.toString();
            } else {
                return "(" + stringifyExpr(x) + ")";
            }
        })
            .join(" ")

}

/**
 * Use this to create a terryfold-style string representation of an expr
 */
export function stringifySyntax(e: expr): string {
    return "" +
        e.map((x: term) => {
            if (typeof x === 'string') {
                return "" + x;
            } else if (x instanceof Func) {
                return x.toSyntaxString();
            } else {
                return "-" + stringifySyntax(x) + ":";
            }

        })
            .join("");
}


function cloneTerm(t: term): term {
    if (typeof t === 'string') {
        return "" + t;
    } else if (t instanceof Func) {
        return t.clone()
    } else {
        return cloneExpr(t);
    }
}

function cloneExpr(e: expr): expr {
    return e.map(t => cloneTerm(t));
}

/**
 * Replaces, inside the expr {@code e}, all the occurrences of the variable {@code p} with a clone of the
 * term {@code x}.
 */
export function substitute(e: expr, p: string, x: term): expr {
    let result: expr = [];
    for (let subExpr of e) {
        if (typeof subExpr === 'string') {
            if (subExpr === p) {
                result.push(cloneTerm(x));
            } else {
                result.push(subExpr);
            }
        } else if (subExpr instanceof Func) {
            result.push(subExpr.substitute(p, x));
        } else {
            result.push(substitute(subExpr, p, x));
        }
    }
    return result;
}

/**
 * Returns true (and provides a TS typeguard) only if {@code arr is an array of strings}.
 */
export function isArrayOfStrings(arr: any): arr is string[] {
    return Array.isArray(arr) && arr.every(x => typeof x === 'string');
}

/**
 * Class of a Function. Defined by a parameter and an expr which is its body.
 */
export class Func {
    param: string;
    body: expr;

    constructor(param: string, body: expr) {
        this.param = param;
        this.body = body;
    }

    /**
     * Application of the function.
     * Creates an {@link expr} by substituting the term {@code arg} inside the body of the function.
     */
    apply(arg: term): expr {
        return substitute(this.body, this.param, arg);
    }

    /**
     * Returns a lambda-calculus style string representation of this function.
     */
    toString() {
        return "λ" + this.param + ".(" + stringifyExpr(this.body) + ")";
    }

    /**
     * Returns true only if {@code otherF} has the same parameter and identical body as this function.
     * @param otherF
     */
    eq(otherF: Func): boolean {
        return this.param == otherF.param && eqExpr(this.body, otherF.body);
    }

    /**
     * Creates a copy of this function object
     */
    clone() {
        return new Func("" + this.param, cloneExpr(this.body));
    }

    /**
     * Returns a terryfold-style string representation of this function.
     */
    toSyntaxString() {
        return "" + this.param + ".-" + stringifySyntax(this.body) + ":";
    }

    /**
     * Replaces all the occurrences of the parameter {@code p} in the body with clones of the
     * term {@code x}.
     */
    substitute(p: string, x: term) {
        return new Func(this.param, substitute(this.body, p, x));
    }
}

/**
 * Used to generate a curry-ed version of the function.
 */
export function curry(params: string[], body: expr): expr {
    if (params.length === 0) {
        return body;
    }
    let f = new Func(params[params.length - 1], body);
    for (let vi = params.length - 2; vi >= 0; vi--) {
        let v = params[vi];
        f = new Func(v, [f])
    }
    return [f];
}

/**
 * Returns true (and provides a TS typeguard) only if {@code e} is an {@link expr}.
 */
export function isExpr(e: any): e is expr {
    if (Array.isArray(e)) {
        for (let x of e) {
            if (!(typeof x === 'string' || x instanceof Func || isExpr(x))) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

/**
 * Returns true only if {@code e1} and {@code e2} are equal.
 */
export function eqExpr(e1: expr, e2: expr): boolean {
    if (e1.length != e2.length) {
        return false;
    }
    for (let i = 0; i < e1.length; i++) {
        let t1: term = e1[i];
        let t2: term = e2[i];
        if (typeof t1 === 'string') {
            if (typeof t2 !== 'string') {
                return false;
            }
        } else if (t1 instanceof Func) {
            if (t2 instanceof Func) {
                if (!t1.eq(t2)) {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            if (!isExpr(t2) || !eqExpr(t1, t2)) {
                return false;
            }
        }
    }
    return true;
}