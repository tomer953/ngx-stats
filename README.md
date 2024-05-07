# ngx-stats - Angular Project Analyzer

## Overview

Angular Project Analyzer is a tool that analyzes Angular projects. It counts the number of modules, components, directives, pipes, and services, including distinctions between standalone and non-standalone components and directives. This utility helps developers gain insights into the structure and complexity of their Angular applications.

## Features

- **Component Analysis**: Counts total, standalone, and non-standalone components.
- **Directive Analysis**: Identifies and counts total, standalone, and non-standalone directives.
- **Pipe Analysis**: Enumerates all pipes, highlighting which are standalone.
- **Module and Service Analysis**: Details total modules and services, including guards and other injectables.

## Getting Started

### Prerequisites

- Node.js

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/tomer953/ngx-stats.git
cd ngx-stats
npm install
```

Link the CLI tool:
```bash
npm link
```

### Running the CLI tool

To run the tool within any Angular project directory:
```bash
ngx-stats
```

You can specify a different path or output the results in JSON format:
```bash
# Run analysis on a specific path
ngx-stats --path path/to/angular/project

# Output results in JSON format
ngx-stats --json

# Combine path specification and JSON output
ngx-stats --path path/to/angular/project --json
```

### Help

For detailed usage instructions, use the help option:
```bash
ngx-stats --help
```

or

```bash
ngx-stats -h
```

### Demo

![image](https://github.com/tomer953/ngx-stats/assets/1807493/04518537-9560-4c3b-ae6f-d5a7de42b8de)
