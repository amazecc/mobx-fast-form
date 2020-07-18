import { spawnSync } from "child_process";
// eslint-disable-next-line import/no-extraneous-dependencies
import "colors";

function runShell(command: string) {
    const arrayCommand = command.split(" ");
    const result = spawnSync(arrayCommand[0], arrayCommand.slice(1), { stdio: "inherit" });
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }

    if (result.status !== 0) {
        console.error(`non-zero exit code returned, code=${result.status}, command=${command}`.red);
        process.exit(1);
    }
}

function prettier() {
    console.log("[Task: format code]".green);
    runShell("prettier --config .prettierrc --write src/**/*.{ts,tsx}");
}

function checkTypescriptCode() {
    console.log("[Task: Typescript Compile]".green);
    runShell("tsc --noEmit");
}

function eslint() {
    console.log("[Task: esLint]".green);
    runShell(`eslint --fix src/**/*.{ts,tsx,json}`);
}

function run() {
    prettier();
    checkTypescriptCode();
    eslint();
}

run();
