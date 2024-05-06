import { textSync } from "figlet";
import Table from "cli-table3";
import * as fs from "fs";
import * as path from "path";

import { AngularFeatures } from "./types";

const ANGULAR_PROJECT_PATH = "/PATH_TO_ANGULAR_SRC_FOLDER";
const filesToCheck = [".ts"];

(function main() {
  const result = countAngularFeatures(ANGULAR_PROJECT_PATH);
  printLogo();
  printResults(result);
})();

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
      if (file !== "node_modules") {
        countAngularFeatures(filePath, result);
      }
    } else if (filesToCheck.includes(path.extname(file))) {
      const content = fs.readFileSync(filePath, "utf8");
      // Components
      if (content.includes("@Component")) {
        result.components.total++;
        if (content.includes("standalone: true")) {
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
        if (content.includes("standalone: true")) {
          result.directives.standalone++;
        } else {
          result.directives.notStandalone++;
        }
      }
      // Pipes
      if (content.includes("@Pipe")) {
        result.pipes.total++;
        if (content.includes("standalone: true")) {
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

function percentage(part: number, total: number): string {
  return total > 0 ? ((part / total) * 100).toFixed(2) + "%" : "0%";
}

function printLogo() {
  console.log("");
  const logo = textSync("NG-Stats", {
    font: "ANSI Regular",
  });
  console.log(logo);
}
function printResults(result: AngularFeatures) {
  console.log("Showing results for:", ANGULAR_PROJECT_PATH);
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
