import ts from 'typescript';
import { FunctionConverter } from './function-conversion';
import { JSDocConverter } from './jsdoc-conversion';
import {
  ConversionContext,
  ConversionOptions,
  ConversionResult,
} from './general-types';
import { TsTools } from './ts-tools';

function parseTypeDefTag(
  node: ts.JSDocTypedefTag,
  context: ConversionContext,
  pendingResults: ConversionResult,
): string | undefined {
  const interfaceName = node.name?.escapedText ?? 'unnamedTypeDef';
  if (!node.typeExpression) {
    return `// unknown typedef ${interfaceName}, no type expression`;
  }
  if (ts.isJSDocTypeExpression(node.typeExpression)) {
    if (ts.isImportTypeNode(node.typeExpression.type)) {
      pendingResults.importStatements.push(
        JSDocConverter.convertTypeDefImport(
          interfaceName,
          node.typeExpression.type,
          node,
          context,
        ),
      );
    } else if (ts.isTupleTypeNode(node.typeExpression.type)) {
      pendingResults.typeStatements.push(
        JSDocConverter.convertTypeDefTupleType(
          interfaceName,
          node.typeExpression.type,
          node,
          context,
        ),
      );
    } else if (ts.isTypeReferenceNode(node.typeExpression.type)) {
      pendingResults.typeStatements.push(
        JSDocConverter.convertTypeDefTypeReference(
          interfaceName,
          node.typeExpression.type,
          node,
          context,
        ),
      );
    } else if (ts.isUnionTypeNode(node.typeExpression.type)) {
      pendingResults.typeStatements.push(
        JSDocConverter.convertTypeDefUnionType(
          interfaceName,
          node.typeExpression.type,
          node,
          context,
        ),
      );
    } else if (ts.isIntersectionTypeNode(node.typeExpression.type)) {
      pendingResults.typeStatements.push(
        JSDocConverter.convertTypeDefIntersectionType(
          interfaceName,
          node.typeExpression.type,
          node,
          context,
        ),
      );
    } else if (node.typeExpression.type.kind == ts.SyntaxKind.StringKeyword) {
      pendingResults.typeStatements.push(
        JSDocConverter.convertTypeDefForSimpleType(
          interfaceName,
          'string',
          node,
          context,
        ),
      );
    } else {
      pendingResults.interfaces.push(
        `// unknown typedef ${interfaceName}, unsupported type expression ${TsTools.syntaxKindToString(
          node.typeExpression.type.kind,
        )}`,
      );
    }
  } else if (ts.isJSDocTypeLiteral(node.typeExpression)) {
    pendingResults.interfaces.push(
      JSDocConverter.convertTypeDefWithProps(
        interfaceName,
        node.typeExpression,
        node,
        context,
      ),
    );
  } else {
    pendingResults.interfaces.push(
      `// unknown typedef ${interfaceName}, unsupported node kind: ${TsTools.syntaxKindToString(
        node.kind,
      )}`,
    );
  }
}

function parseFunction(
  name: string,
  node: ts.FunctionLikeDeclarationBase,
  context: ConversionContext,
  pendingResults: ConversionResult,
) {
  const func = FunctionConverter.parseFunction(name, node, context);
  if (!func) return;
  pendingResults.functions.push(func);
}

function walkTreeFindingInterfaces(
  node: ts.Node,
  depth: number,
  context: ConversionContext,
  pendingResults: ConversionResult,
) {
  if (ts.isJSDocTypedefTag(node)) {
    parseTypeDefTag(node, context, pendingResults);
  } else if (ts.isConstructorDeclaration(node)) {
    parseFunction('constructor', node, context, pendingResults);
  } else if (ts.isMethodDeclaration(node)) {
    parseFunction(
      node.name.getText(context.sourceFile) ?? 'unnamedMethod',
      node,
      context,
      pendingResults,
    );
  } else {
    node
      .getChildren(context.sourceFile)
      .forEach((n) =>
        walkTreeFindingInterfaces(n, depth + 1, context, pendingResults),
      );
  }
}

export class TheTool {
  static parseInput(input: string, fileName?: string): ConversionResult {
    if (!fileName) fileName = 'temp.js';
    const sourceFile = ts.createSourceFile(fileName, input, {
      languageVersion: ts.ScriptTarget.ES2022,
    });
    return TheTool.parseSourceFile(sourceFile);
  }

  static parseSourceFile(
    sourceFile: ts.SourceFile,
    options?: ConversionOptions,
  ): ConversionResult {
    const results: ConversionResult = {
      fileName: sourceFile.fileName,
      importStatements: [],
      typeStatements: [],
      interfaces: [],
      functions: [],
    };
    const context: ConversionContext = {
      sourceFile,
      options: {
        indent: '  ',
        ...options,
      },
    };
    sourceFile
      .getChildren(sourceFile)
      .forEach((n) => walkTreeFindingInterfaces(n, 0, context, results));
    return results;
  }
}
