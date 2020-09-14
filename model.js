"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eqExpr = exports.isExpr = exports.curry = exports.Func = exports.isArrayOfStrings = exports.substitute = exports.stringifySyntax = exports.stringifyExpr = void 0;
function stringifyExpr(e) {
    return "" +
        e.map(function (x) {
            if (typeof x === 'string') {
                return "" + x;
            }
            else if (x instanceof Func) {
                return x.toString();
            }
            else {
                return "(" + stringifyExpr(x) + ")";
            }
        })
            .join(" ");
}
exports.stringifyExpr = stringifyExpr;
function stringifySyntax(e) {
    return "" +
        e.map(function (x) {
            if (typeof x === 'string') {
                return "" + x;
            }
            else if (x instanceof Func) {
                return x.toSyntaxString();
            }
            else {
                return "-" + stringifySyntax(x) + ":";
            }
        })
            .join("");
}
exports.stringifySyntax = stringifySyntax;
function cloneTerm(t) {
    if (typeof t === 'string') {
        return "" + t;
    }
    else if (t instanceof Func) {
        return t.clone();
    }
    else {
        return cloneExpr(t);
    }
}
function cloneExpr(e) {
    return e.map(function (t) { return cloneTerm(t); });
}
function substitute(e, p, x) {
    var result = [];
    for (var _i = 0, e_1 = e; _i < e_1.length; _i++) {
        var subExpr = e_1[_i];
        if (typeof subExpr === 'string') {
            if (subExpr === p) {
                result.push(cloneTerm(x));
            }
            else {
                result.push(subExpr);
            }
        }
        else if (subExpr instanceof Func) {
            result.push(subExpr.substitute(p, x));
        }
        else {
            result.push(substitute(subExpr, p, x));
        }
    }
    return result;
}
exports.substitute = substitute;
function isArrayOfStrings(arr) {
    return Array.isArray(arr) && arr.every(function (x) { return typeof x === 'string'; });
}
exports.isArrayOfStrings = isArrayOfStrings;
var Func = /** @class */ (function () {
    function Func(param, body) {
        this.param = param;
        this.body = body;
    }
    Func.prototype.apply = function (arg) {
        return substitute(this.body, this.param, arg);
    };
    Func.prototype.toString = function () {
        return "λ" + this.param + ".(" + stringifyExpr(this.body) + ")";
    };
    Func.prototype.eq = function (otherF) {
        return this.param == otherF.param && eqExpr(this.body, otherF.body);
    };
    Func.prototype.clone = function () {
        return new Func("" + this.param, cloneExpr(this.body));
    };
    Func.prototype.toSyntaxString = function () {
        return "" + this.param + ".-" + stringifySyntax(this.body) + ":";
    };
    Func.prototype.substitute = function (p, x) {
        return new Func(this.param, substitute(this.body, p, x));
    };
    return Func;
}());
exports.Func = Func;
function curry(params, body) {
    if (params.length === 0) {
        return body;
    }
    var f = new Func(params[params.length - 1], body);
    for (var vi = params.length - 2; vi >= 0; vi--) {
        var v = params[vi];
        f = new Func(v, [f]);
    }
    return [f];
}
exports.curry = curry;
function isExpr(e) {
    if (Array.isArray(e)) {
        for (var _i = 0, e_2 = e; _i < e_2.length; _i++) {
            var x = e_2[_i];
            if (!(typeof x === 'string' || x instanceof Func || isExpr(x))) {
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}
exports.isExpr = isExpr;
function eqExpr(e1, e2) {
    if (e1.length != e2.length) {
        return false;
    }
    for (var i = 0; i < e1.length; i++) {
        var t1 = e1[i];
        var t2 = e2[i];
        if (typeof t1 === 'string') {
            if (typeof t2 !== 'string') {
                return false;
            }
        }
        else if (t1 instanceof Func) {
            if (t2 instanceof Func) {
                if (!t1.eq(t2)) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            if (!isExpr(t2) || !eqExpr(t1, t2)) {
                return false;
            }
        }
    }
    return true;
}
exports.eqExpr = eqExpr;
//# sourceMappingURL=model.js.map