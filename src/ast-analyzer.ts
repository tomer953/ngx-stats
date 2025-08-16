import * as ts from "typescript";

export interface ComponentInfo {
  filePath: string;
  standalone: boolean;
  onPush: boolean;
}

export interface StandaloneInfo {
  filePath: string;
  standalone: boolean;
}

export interface FileAnalysis {
  components: ComponentInfo[];
  directives: StandaloneInfo[];
  pipes: StandaloneInfo[];
  ngModuleCount: number;
  injectableClasses: number;
}

export function analyzeFile(
  fileContent: string,
  filePath: string,
  options: { legacy: boolean }
): FileAnalysis {
  const source = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true /* setParentNodes */
  );

  const res: FileAnalysis = {
    components: [],
    directives: [],
    pipes: [],
    ngModuleCount: 0,
    injectableClasses: 0,
  };

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      const decorators = getNodeDecorators(node);
      if (decorators) {
        for (const dec of decorators) {
          const decName = getDecoratorName(dec);
          switch (decName) {
            case "Component": {
              const meta = getDecoratorMetadataObject(dec);
              const standalone = computeStandalone(meta, options.legacy);
              const onPush = computeOnPush(meta);
              res.components.push({ filePath, standalone, onPush });
              break;
            }
            case "Directive": {
              const meta = getDecoratorMetadataObject(dec);
              const standalone = computeStandalone(meta, options.legacy);
              res.directives.push({ filePath, standalone });
              break;
            }
            case "Pipe": {
              const meta = getDecoratorMetadataObject(dec);
              const standalone = computeStandalone(meta, options.legacy);
              res.pipes.push({ filePath, standalone });
              break;
            }
            case "NgModule": {
              res.ngModuleCount++;
              break;
            }
            case "Injectable": {
              res.injectableClasses++;
              break;
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return res;
}

function getNodeDecorators(node: ts.Node): readonly ts.Decorator[] | undefined {
  // TS 5 provides helper APIs; fall back to node.decorators for older versions
  const anyTs: any = ts as any;
  if (typeof anyTs.canHaveDecorators === "function" && anyTs.canHaveDecorators(node)) {
    return anyTs.getDecorators(node) as readonly ts.Decorator[] | undefined;
  }
  // @ts-ignore - 'decorators' exists on ClassDeclaration in legacy decorator AST
  return (node as any).decorators as readonly ts.Decorator[] | undefined;
}

function getDecoratorName(dec: ts.Decorator): string | undefined {
  const expr = dec.expression;
  if (ts.isCallExpression(expr)) {
    const ce = expr.expression;
    if (ts.isIdentifier(ce)) return ce.text;
    if (ts.isPropertyAccessExpression(ce)) return ce.name.text;
  } else if (ts.isIdentifier(expr)) {
    return expr.text;
  }
  return undefined;
}

function getDecoratorMetadataObject(
  dec: ts.Decorator
): ts.ObjectLiteralExpression | undefined {
  const expr = dec.expression;
  if (!ts.isCallExpression(expr)) return undefined;
  const firstArg = expr.arguments[0];
  if (firstArg && ts.isObjectLiteralExpression(firstArg)) {
    return firstArg;
  }
  return undefined;
}

function computeStandalone(
  meta: ts.ObjectLiteralExpression | undefined,
  legacy: boolean
): boolean {
  if (!meta) {
    return legacy ? false : true;
  }
  const prop = findProperty(meta, "standalone");
  if (!prop) return legacy ? false : true;

  if (ts.isPropertyAssignment(prop)) {
    const init = prop.initializer;
    if (init.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (init.kind === ts.SyntaxKind.FalseKeyword) return false;
  }
  // If value is not a boolean literal, assume default based on mode
  return legacy ? false : true;
}

function computeOnPush(meta: ts.ObjectLiteralExpression | undefined): boolean {
  if (!meta) return false;
  const prop = findProperty(meta, "changeDetection");
  if (!prop || !ts.isPropertyAssignment(prop)) return false;
  const init = prop.initializer;
  if (ts.isPropertyAccessExpression(init)) {
    return init.name.text === "OnPush";
  }
  // If user wrote something like `ChangeDetectionStrategy["OnPush"]`
  if (ts.isElementAccessExpression(init)) {
    const arg = init.argumentExpression;
    if (arg && ts.isStringLiteral(arg)) return arg.text === "OnPush";
  }
  if (ts.isIdentifier(init)) {
    // Rare case: alias to OnPush; best-effort check
    return /OnPush$/i.test(init.text);
  }
  return false;
}

function findProperty(
  obj: ts.ObjectLiteralExpression,
  name: string
): ts.ObjectLiteralElementLike | undefined {
  return obj.properties.find((p) => {
    if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) {
      const n = p.name;
      if (n && (ts.isIdentifier(n) || ts.isStringLiteral(n))) {
        return n.text === name;
      }
    }
    return false;
  });
}
