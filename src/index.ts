#!/usr/bin/env node

import { textSync } from "figlet";
import Table from "cli-table3";
import * as fs from "fs";
import * as path from "path";
import minimist from "minimist";

import { AngularFeatures } from "./types";
import { analyzeProject } from "./analyzer";

const argv = minimist(process.argv.slice(2), {
  string: ["path"],
  boolean: ["json", "help", "legacy", "verbose"],
  alias: { p: "path", j: "json", h: "help", l: "legacy", v: "verbose" },
  unknown: (arg) => {
    console.error(`Unknown option: ${arg}`);
    printHelp();
    process.exit(1);
  },
});

if (argv.help) {
  printHelp();
  process.exit(0);
}
const angularProjectPath = argv.path ? path.resolve(argv.path) : process.cwd();

if (
  !fs.existsSync(angularProjectPath) ||
  !fs.statSync(angularProjectPath).isDirectory()
) {
  console.error(
    `Error: The specified path '${angularProjectPath}' does not exist or is not a directory.`
  );
  process.exit(1);
}

(function main() {
  const result = analyzeProject(angularProjectPath, {
    legacy: !!argv.legacy,
    verbose: !!argv.verbose,
  });
  if (argv.json) {
    printJson(result);
  } else {
    printLogo();
    printContext();
    printResults(result);
  }
})();

function percentage(part: number, total: number): string {
  return total > 0 ? ((part / total) * 100).toFixed(2) + "%" : "0%";
}

function printLogo() {
  console.log("");
  const logo = textSync("ngx-stats", {
    font: "ANSI Regular",
  });
  console.log(logo);
}
function printContext() {
  if (!argv.legacy) {
    console.log(
      "ℹ️  Assuming Angular v19+ (standalone by default). Use --legacy for v14-v18 behavior."
    );
  }
  const line = "─".repeat(12);
  console.log(`${line} Showing results for: ${angularProjectPath} ${line}`);
  console.log("");
}
function printResults(result: AngularFeatures) {
  // Summary table: Modules and Services
  const summary = new Table({
    head: ["Type", "Total"],
    colWidths: [40, 12],
    colAligns: ["left", "center"],
  });
  summary.push(
    ["Modules", result.modules],
    ["Services (Including other @Injectable)", result.services]
  );
  console.log(summary.toString());

  // Declarations table: Components / Directives / Pipes with Standalone stats
  const decl = new Table({
    head: ["Type", "Total", "Standalone", "Not Standalone", "Standalone %"],
    colWidths: [40, 12, 15, 18, 15],
    colAligns: ["left", "center", "center", "center", "center"],
  });
  decl.push(
    [
      "Components",
      result.components.total,
      result.components.standalone,
      result.components.notStandalone,
      percentage(result.components.standalone, result.components.total),
    ],
    [
      "Directives",
      result.directives.total,
      result.directives.standalone,
      result.directives.notStandalone,
      percentage(result.directives.standalone, result.directives.total),
    ],
    [
      "Pipes",
      result.pipes.total,
      result.pipes.standalone,
      result.pipes.notStandalone,
      percentage(result.pipes.standalone, result.pipes.total),
    ]
  );
  console.log(decl.toString());

  // Components strategy table
  const compStrategy = new Table({
    head: ["Components Strategy", "OnPush", "Default", "OnPush %"],
    colWidths: [40, 12, 12, 12],
    colAligns: ["left", "center", "center", "center"],
  });
  compStrategy.push([
    "OnPush vs Default",
    result.components.onPush,
    result.components.default,
    percentage(result.components.onPush, result.components.total),
  ]);
  console.log(compStrategy.toString());
}

function printJson(result: AngularFeatures) {
  console.log(JSON.stringify(result, null, 2));
}

function printHelp() {
  console.log(`
Usage: ngx-stats [options]

Options:
--help, -h      Display this help message.
--path, -p      Specify the path to the Angular project directory.
--json, -j      Output the results in JSON format.
--legacy, -l    Use legacy detection (pre-v19: looks for standalone: true)
--verbose, -v   Print paths for modules, default-strategy components, and non-standalone declarations

Examples:
ngx-stats --path ./ --json
ngx-stats -p ./src -l -v
  `);
}
