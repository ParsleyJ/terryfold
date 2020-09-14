"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var model_1 = require("./model");
function is_lower_alpha(str) {
    var code = str.charCodeAt(0);
    return code > 96 && code < 123;
}
function is_dot(str) {
    var code = str.charCodeAt(0);
    return code === 46;
}
function is_space(str) {
    var code = str.charCodeAt(0);
    return code === 32;
}
function is_nl(str) {
    var code = str.charCodeAt(0);
    return code === 10;
}
var op = "-";
var cl = ":";
function is_open(str) {
    var code = str.charCodeAt(0);
    return str.charAt(0) === op || code === 40;
}
function is_close(str) {
    var code = str.charCodeAt(0);
    return str.charAt(0) === cl || code === 41;
}
function findSubExpressionEnd(inputText, openPars) {
    if (openPars === void 0) { openPars = 1; }
    var result = "";
    var i = 0;
    for (; i < inputText.length; i++) {
        if (is_open(inputText[i]) || is_space(inputText[i])) {
            openPars++;
        }
        else if (is_close(inputText[i]) || is_nl(inputText[i])) {
            openPars--;
        }
        if (openPars > 0) {
            result += inputText[i];
        }
        else {
            break;
        }
    }
    return [result, inputText.substr(i + 1)];
}
function parse(inputText, lineNo, colNo) {
    if (lineNo === void 0) { lineNo = 1; }
    if (colNo === void 0) { colNo = 1; }
    var tmpArr = [];
    while (inputText.length != 0) {
        var c = inputText.charAt(0);
        if (is_lower_alpha(c)) {
            tmpArr.push(c);
            inputText = inputText.substr(1);
            colNo++;
        }
        else if (is_dot(c)) {
            if (model_1.isArrayOfStrings(tmpArr)) {
                return model_1.curry(tmpArr, parse(inputText.substr(1), lineNo, colNo + 1));
            }
            else {
                throw "found non-parameter terms before dot at line" + lineNo + ", col" + colNo + ".";
            }
        }
        else if (is_open(c)) {
            var _a = findSubExpressionEnd(inputText.substr(1)), subE = _a[0], rest = _a[1];
            tmpArr.push([parse(subE, lineNo, colNo + 1)]);
            inputText = rest;
            var skippedLines = 0;
            for (var i = 0; i < subE.length; i++) {
                if (subE.charAt(i) === "\n") {
                    skippedLines++;
                }
            }
            lineNo += skippedLines;
            var restLastLine = rest.split("\n").pop();
            colNo = (!!restLastLine) ? 1 : restLastLine.length;
        }
        else if (is_close(c)) {
            throw "found unexpected closure of scope at line" + lineNo + ", col" + colNo + ".";
        }
        else {
            //ignore char
            inputText = inputText.substr(1);
            colNo++;
        }
        if (c === "\n") {
            lineNo++;
            colNo = 1;
        }
    }
    return tmpArr;
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map