# ngx-stats

## Overview

Angular Project Analyzer is a tool that analyzes Angular projects. It counts the number of modules, components, directives, pipes, and services, including distinctions between standalone and non-standalone components and directives. This utility helps developers gain insights into the structure and complexity of their Angular applications.

## Getting Started

### How to use

Install globally:

```bash
npm i -g ngx-stats
```

then write in any angular project directory:

```bash
ngx-stats
```

![image](https://github.com/tomer953/ngx-stats/assets/1807493/603d01c7-2def-433f-b802-fbee60481dba)


## Specify a different path
```bash
# Run analysis on a specific path
ngx-stats --path path/to/angular/project
```

## Output results in JSON format

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

## Help

For detailed usage instructions, use the help option:
```bash
ngx-stats --help
ngx-stats -h
```



