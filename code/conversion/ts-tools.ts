import ts from 'typescript';

function walkTreeFindingType<S extends ts.Node>(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  predicate: (value: ts.Node) => value is S,
): S | undefined {
  if (predicate(node)) {
    return node;
  }

  for (const child of node.getChildren(sourceFile)) {
    const childResult = walkTreeFindingType(child, sourceFile, predicate);
    if (childResult) {
      return childResult;
    }
  }
  return undefined;
}

export class TsTools {
  static syntaxKindToString(kind: ts.SyntaxKind): string {
    return ts.SyntaxKind[kind];
  }

  static findNode<S extends ts.Node>(
    sourceFile: ts.SourceFile,
    predicate: (value: ts.Node) => value is S,
  ) {
    return walkTreeFindingType(sourceFile, sourceFile, predicate);
  }

  static findNodeOrThrow<S extends ts.Node>(
    sourceFile: ts.SourceFile,
    predicate: (value: ts.Node) => value is S,
    errorMessage: string,
  ) {
    const result = walkTreeFindingType(sourceFile, sourceFile, predicate);
    if (!result) throw new Error(errorMessage);
    return result;
  }
}
