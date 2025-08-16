# ngx-stats

## Overview

**ngx-stats** is a CLI tool that analyzes Angular projects. It counts the number of modules, components, directives, pipes, and services — including distinctions between:

- Standalone vs. non-standalone declarations
- OnPush vs. Default change detection

This utility helps developers understand the structure and architectural patterns of their Angular applications.

---

## 📦 Installation

Install globally:

```bash
npm i -g ngx-stats
````

---

## 🚀 Usage

In any Angular project directory:

```bash
ngx-stats
```

<img width="2492" height="1610" alt="image" src="https://github.com/user-attachments/assets/f722c8ed-d48b-4668-ac2b-d2b4ee0a5116" />


---

### 📁 Analyze a Specific Path

```bash
ngx-stats --path path/to/angular/project
```

or shorthand:

```bash
ngx-stats -p ./apps/admin
```

---

### 🧮 Output Results in JSON

```bash
ngx-stats --json
```

```json
{
  "modules": 0,
  "services": 0,
  "components": {
    "total": 4,
    "standalone": 4,
    "notStandalone": 0,
    "onPush": 2,
    "default": 2
  },
  "directives": {
    "total": 0,
    "standalone": 0,
    "notStandalone": 0
  },
  "pipes": {
    "total": 0,
    "standalone": 0,
    "notStandalone": 0
  }
}
```

---

### 🔙 Legacy Mode (for Angular v14–v18)

Angular v19+ treats components/directives/pipes as **standalone by default**.

To use legacy detection logic (`standalone: true`), add:

```bash
ngx-stats --legacy
```

or:

```bash
ngx-stats -l
```

---

## 🧼 Ignored Files and Folders

The following are **excluded by default**:

### 📂 Ignored directories:

* `node_modules`
* `dist`
* `build`
* `cache`
* `.nx`
* `.angular`
* Any directory that starts with a `.`

### 📄 Ignored files:

* Files ending in `.stories.ts`
* Files ending in `.spec.ts`
* Files ending in `.d.ts`

---

## 🆘 Help

```bash
ngx-stats --help
```

---

## 🔧 CLI Options Summary

| Option      | Alias | Description                                                                 |
| ----------- | ----- | --------------------------------------------------------------------------- |
| `--path`    | `-p`  | Specify target directory to scan                                            |
| `--json`    | `-j`  | Output result as JSON                                                       |
| `--legacy`  | `-l`  | Use legacy detection logic (Angular v14–v18: looks for `standalone: true`)  |
| `--verbose` | `-v`  | Print file paths of: NgModules, non-standalone declarations, and non-OnPush |
| `--help`    | `-h`  | Show usage info                                                             |


