const readline = require('readline');

import {parse} from "./parser";
import {stringifySyntax, expr, eqExpr} from "./model";
import {execStep} from "./execStep";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function ask(question: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(question, (answer: string) => resolve(answer));
    });
}

async function execute(parsedExpr:expr) {
    let oldExpr: expr = parsedExpr;
    let newExpr: expr = null;
    while (true) {
        await ask(stringifySyntax(oldExpr));
        newExpr = execStep(oldExpr)[0];
        if (eqExpr(oldExpr, newExpr)) {
            console.log("[END]");
            break;
        } else {
            oldExpr = newExpr;
        }
    }
}

async function main() {
    let lines: string[] = [];
    while (true) {
        let line = await ask(">");
        if (line === "#") {
            break;
        }
        lines.push(line);
    }
    let parsedExpr: expr;

    console.log("input:\n");
    // for (let l of lines) {
    //     let pe = parse(l);
    //     console.log("" + l);
    //     parsedExpr.push(pe);
    // }
    let inputText = lines.join("\n");
    console.log(inputText);
    console.log("\n\n\n");

    parsedExpr = parse(inputText);
    await execute(parsedExpr);
}


main();





