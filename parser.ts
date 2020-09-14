import {expr, isArrayOfStrings, curry} from "./model";


function is_lower_alpha(str: string): boolean {
    let code = str.charCodeAt(0);
    return code > 96 && code < 123;
}

function is_dot(str: string): boolean {
    let code = str.charCodeAt(0);
    return code === 46;
}

function is_space(str: string): boolean {
    let code = str.charCodeAt(0);
    return code === 32;
}

function is_nl(str: string): boolean {
    let code = str.charCodeAt(0);
    return code === 10;
}

let op = "-";
let cl = ":"

function is_open(str: string): boolean {
    let code = str.charCodeAt(0);
    return str.charAt(0) === op || code === 40;
}

function is_close(str: string): boolean {
    let code = str.charCodeAt(0);
    return str.charAt(0) === cl || code === 41;
}

/**
 * Splits the input text in two substrings, finding the first closed parentheses character that does not match
 * to any open parentheses in the input substring and using such found character as delimiter for the split.
 */
function findSubExpressionEnd(inputText: string, openPars: number = 1): [string, string] {
    let result: string = "";
    let i = 0;
    for (; i < inputText.length; i++) {
        if (is_open(inputText[i]) || is_space(inputText[i])) {
            openPars++;
        } else if (is_close(inputText[i]) || is_nl(inputText[i])) {
            openPars--;
        }
        if (openPars > 0) {
            result += inputText[i];
        } else {
            break;
        }
    }
    return [result, inputText.substr(i + 1)];
}


/**
 * Parses the strings and builds an {@link expr}.
 */
export function parse(inputText: string, lineNo: number = 1, colNo: number = 1): expr {
    let tmpArr: expr = [];
    while (inputText.length != 0) {
        let c: string = inputText.charAt(0);
        if (is_lower_alpha(c)) {
            tmpArr.push(c);
            inputText = inputText.substr(1);
            colNo++;
        } else if (is_dot(c)) {
            if (isArrayOfStrings(tmpArr)) {
                return curry(tmpArr, parse(inputText.substr(1), lineNo, colNo+1))
            } else {
                throw "found non-parameter terms before dot at line"+lineNo+", col"+colNo+".";
            }
        } else if (is_open(c)) {
            let [subE, rest] = findSubExpressionEnd(inputText.substr(1))
            tmpArr.push([parse(subE, lineNo, colNo+1)]);
            inputText = rest;

            let skippedLines = 0;
            for(let i = 0; i < subE.length; i++){
                if(subE.charAt(i) === "\n"){
                    skippedLines++;
                }
            }

            lineNo += skippedLines;
            let restLastLine = rest.split("\n").pop();
            colNo = (!!restLastLine)?1:restLastLine.length;
        } else if (is_close(c)) {
            throw "found unexpected closure of scope at line"+lineNo+", col"+colNo+".";
        } else {
            //ignore char
            inputText = inputText.substr(1);
            colNo++;
        }
        if(c === "\n"){
            lineNo++;
            colNo = 1;
        }
    }
    return tmpArr
}


