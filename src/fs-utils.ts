import * as fs from "fs";
import * as path from "path";
import { FILE_EXTS, IGNORE_DIRS, IGNORE_FILE_PATTERNS } from "./constants";

export function shouldIgnoreDir(dirName: string): boolean {
  return IGNORE_DIRS.has(dirName) || dirName.startsWith(".");
}

export function shouldIgnoreFile(fileName: string): boolean {
  return IGNORE_FILE_PATTERNS.some((pattern) => fileName.endsWith(pattern));
}

export function isFileToCheck(fileName: string): boolean {
  return FILE_EXTS.includes(path.extname(fileName));
}

export function collectTsFiles(rootDir: string): string[] {
  const results: string[] = [];
  walk(rootDir, results);
  return results;
}

function walk(currentDir: string, results: string[]) {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (!shouldIgnoreDir(entry.name)) {
        walk(fullPath, results);
      }
    } else if (entry.isFile()) {
      if (isFileToCheck(entry.name) && !shouldIgnoreFile(entry.name)) {
        results.push(fullPath);
      }
    }
  }
}
