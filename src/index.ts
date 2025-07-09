#!/usr/bin/env node

import { textSync } from "figlet";
import Table from "cli-table3";
import * as fs from "fs";
import * as path from "path";
import minimist from "minimist";

import { AngularFeatures } from "./types";

const argv = minimist(process.argv.slice(2), {
  string: ["path"],
  boolean: ["json", "help", "legacy"],
  alias: { p: "path", j: "json", h: "help", l: "legacy" },
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
if (!argv.legacy) {
  console.log(
    "ℹ️  Assuming Angular v19+ (standalone by default). Use --legacy for v14-v18 behavior."
  );
}
const angularProjectPath = argv.path ? path.resolve(argv.path) : process.cwd();
const filesToCheck = [".ts"];

const IGNORE_DIRS = new Set(["node_modules", "dist", "build", "cache"]);
const IGNORE_FILE_PATTERNS = [".stories.ts", ".spec.ts"];

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
  const result = countAngularFeatures(angularProjectPath);
  if (argv.json) {
    printJson(result);
  } else {
    printLogo();
    printResults(result);
  }
})();

function isStandalone(content: string, legacy: boolean): boolean {
  if (legacy) {
    return content.includes("standalone: true");
  }
  return !content.includes("standalone: false");
}

function countAngularFeatures(
  dirPath: string,
  result: AngularFeatures = {
    modules: 0,
    services: 0,
    components: {
      total: 0,
      standalone: 0,
      notStandalone: 0,
      onPush: 0,
      default: 0,
    },
    directives: { total: 0, standalone: 0, notStandalone: 0 },
    pipes: { total: 0, standalone: 0, notStandalone: 0 },
  }
): AngularFeatures {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      if (!shouldIgnoreDir(file)) {
        countAngularFeatures(filePath, result);
      }
    } else if (
      filesToCheck.includes(path.extname(file)) &&
      !shouldIgnoreFile(file)
    ) {
      const content = fs.readFileSync(filePath, "utf8");
      // Components
      if (content.includes("@Component")) {
        result.components.total++;
        if (isStandalone(content, argv.legacy)) {
          result.components.standalone++;
        } else {
          result.components.notStandalone++;
        }
        if (
          content.includes("changeDetection: ChangeDetectionStrategy.OnPush")
        ) {
          result.components.onPush++;
        } else {
          result.components.default++;
        }
      }
      // Directives
      if (content.includes("@Directive")) {
        result.directives.total++;
        if (isStandalone(content, argv.legacy)) {
          result.directives.standalone++;
        } else {
          result.directives.notStandalone++;
        }
      }
      // Pipes
      if (content.includes("@Pipe")) {
        result.pipes.total++;
        if (isStandalone(content, argv.legacy)) {
          result.pipes.standalone++;
        } else {
          result.pipes.notStandalone++;
        }
      }
      // Modules
      if (content.includes("@NgModule")) {
        result.modules++;
      }
      // Services
      if (
        content.includes("@Injectable") &&
        content.includes("export class ")
      ) {
        result.services++;
      }
    }
  });
  return result;
}

function shouldIgnoreDir(dirName: string): boolean {
  return IGNORE_DIRS.has(dirName) || dirName.startsWith(".");
}

function shouldIgnoreFile(fileName: string): boolean {
  return IGNORE_FILE_PATTERNS.some((pattern) => fileName.endsWith(pattern));
}

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
function printResults(result: AngularFeatures) {
  console.log("Showing results for:", angularProjectPath);
  // Set up the table with customized column widths, alignments, and header styles
  const table = new Table({
    head: [
      "Type",
      "Total",
      "Standalone",
      "Not Standalone",
      "Standalone %",
      "OnPush Strategy",
      "Default Strategy",
      "OnPush %",
    ],
    colWidths: [40, 10, 15, 20, 15, 20, 20, 15],
    colAligns: [
      "left",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
    ],
  });

  // Add rows for each category
  table.push(
    ["Modules", result.modules, "", "", ""],
    ["Services (Including other @Injectable)", result.services, "", "", ""],
    [
      "Components",
      result.components.total,
      result.components.standalone,
      result.components.notStandalone,
      percentage(result.components.standalone, result.components.total),
      result.components.onPush,
      result.components.default,
      percentage(result.components.onPush, result.components.total),
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

  // Print the table to the console
  console.log(table.toString());
}

function printJson(result: AngularFeatures) {
  console.log(JSON.stringify(result, null, 2));
}

function printHelp() {
  console.log(`
Usage: ngx-stats [options]

Options:
--help, -h     Display this help message.
--path, -p     Specify the path to the Angular project directory.
--json, -j     Output the results in JSON format.
--legacy, -l   Use legacy detection (pre-v19: looks for standalone: true)

Examples:
ngx-stats --path ./ --json
ngx-stats -p ./src -l
  `);
}
