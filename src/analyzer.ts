import * as fs from "fs";
import { analyzeFile } from "./ast-analyzer";
import { collectTsFiles } from "./fs-utils";
import { AngularFeatures } from "./types";

export function analyzeProject(
  rootDir: string,
  options: { legacy: boolean; verbose: boolean }
): AngularFeatures {
  const initial: AngularFeatures = {
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
  };

  const files = collectTsFiles(rootDir);

  for (const filePath of files) {
    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    const res = analyzeFile(content, filePath, { legacy: options.legacy });

    // Modules
    initial.modules += res.ngModuleCount;
    if (options.verbose && res.ngModuleCount > 0) {
      console.log(`[NgModule] ${filePath}`);
    }

    // Services (any @Injectable class)
    initial.services += res.injectableClasses;

    // Components
    for (const c of res.components) {
      initial.components.total++;
      if (c.standalone) {
        initial.components.standalone++;
      } else {
        initial.components.notStandalone++;
        if (options.verbose)
          console.log(`[non-standalone component] ${c.filePath}`);
      }
      if (c.onPush) {
        initial.components.onPush++;
      } else {
        initial.components.default++;
        if (options.verbose)
          console.log(`[default change detection] ${c.filePath}`);
      }
    }

    // Directives
    for (const d of res.directives) {
      initial.directives.total++;
      if (d.standalone) initial.directives.standalone++;
      else {
        initial.directives.notStandalone++;
        if (options.verbose)
          console.log(`[non-standalone directive] ${d.filePath}`);
      }
    }

    // Pipes
    for (const p of res.pipes) {
      initial.pipes.total++;
      if (p.standalone) initial.pipes.standalone++;
      else {
        initial.pipes.notStandalone++;
        if (options.verbose)
          console.log(`[non-standalone pipe] ${p.filePath}`);
      }
    }
  }

  return initial;
}
