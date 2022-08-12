import ts from 'typescript';
import { Formatting } from './formatting';
import { ConversionContext } from './general-types';

export class JSDocConverter {
  static getJsDocCommentText(
    comments: string | ts.NodeArray<ts.JSDocComment> | undefined,
    context: ConversionContext,
  ): string | undefined {
    return comments
      ? typeof comments === 'string'
        ? comments
        : comments.map((c) => c.getText(context.sourceFile)).join('\n')
      : undefined;
  }

  static formatJsDocComment(
    comments: string | ts.NodeArray<ts.JSDocComment> | undefined,
    context: ConversionContext,
    indentDepth = 0,
  ) {
    let comment = JSDocConverter.getJsDocCommentText(comments, context)?.trim();
    if (!comment) return undefined;
    // trim the leading " - " if it exists
    if (comment.startsWith('- ')) {
      comment = comment.substring(2).trimStart();
    }
    return comment.indexOf('\n') >= 0
      ? Formatting.multiLineComment(comment, context.options, indentDepth)
      : Formatting.singleLineComment(comment, context.options, indentDepth);
  }

  static convertTypeDefImport(
    typeName: string,
    importNode: ts.ImportTypeNode,
    _typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // It's a @typedef {import} thing
    const qualifier = importNode.qualifier?.getText(context.sourceFile);
    const importFile = importNode.argument.getText(context.sourceFile);
    if (!qualifier) {
      // default import
      return `import ${typeName} from ${importFile};`;
    }
    if (qualifier !== typeName)
      return `import { ${qualifier} as ${typeName} } from ${importFile};`;
    return `import { ${typeName} } from ${importFile};`;
  }

  static convertTypeDefWithProps(
    typeName: string,
    typeExpression: ts.JSDocTypeLiteral,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef with properties
    const indent = context.options.indent;
    let result = `export interface ${typeName} {`;
    const propertyTags = typeExpression.jsDocPropertyTags ?? [];
    for (const param of propertyTags) {
      const comment = JSDocConverter.formatJsDocComment(
        param.comment,
        context,
        1,
      );
      if (comment) {
        result += `\n${comment}`;
      }
      let name = param.name?.getText(context.sourceFile) ?? 'unnamedProperty';
      if (param.isBracketed) {
        name = `${name}?`;
      }
      const type =
        param.typeExpression?.type?.getText(context.sourceFile) ?? 'unknown';
      result += `\n${indent}${name}: ${type};`;
    }
    result += '\n}';
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }

  static convertTypeDefTupleType(
    typeName: string,
    typeExpression: ts.TupleTypeNode,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef of a tuple type like [string, number]
    let result = `type ${typeName} = `;
    for (let i = 0; i < typeExpression.elements.length; i++) {
      const element = typeExpression.elements[i];
      result += element.getText(context.sourceFile);
      if (i < typeExpression.elements.length - 1) {
        result += ' | ';
      }
    }
    result += ';';
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }

  static convertTypeDefTypeReference(
    typeName: string,
    typeExpression: ts.TypeReferenceNode,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef of a tuple type like [string, number]
    let result = `type ${typeName} = ${typeExpression.typeName.getText(
      context.sourceFile,
    )}`;
    if (typeExpression.typeArguments != null) {
      result += '<';
      for (let i = 0; i < typeExpression.typeArguments.length; i++) {
        const element = typeExpression.typeArguments[i];
        result += element.getText(context.sourceFile);
        if (i < typeExpression.typeArguments.length - 1) {
          result += ', ';
        }
      }
      result += '>';
    }
    result += ';';
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }

  static convertTypeDefUnionType(
    typeName: string,
    typeExpression: ts.UnionTypeNode,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef of a union type like string | number
    let result = `type ${typeName} = `;
    for (let i = 0; i < typeExpression.types.length; i++) {
      const element = typeExpression.types[i];
      result += element.getText(context.sourceFile);
      if (i < typeExpression.types.length - 1) {
        result += ' | ';
      }
    }
    result += ';';
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }

  static convertTypeDefIntersectionType(
    typeName: string,
    typeExpression: ts.IntersectionTypeNode,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef of a union type like string | number
    let result = `type ${typeName} = `;
    for (let i = 0; i < typeExpression.types.length; i++) {
      const element = typeExpression.types[i];
      result += element.getText(context.sourceFile);
      if (i < typeExpression.types.length - 1) {
        result += ' & ';
      }
    }
    result += ';';
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }

  static convertTypeDefForSimpleType(
    typeName: string,
    type: string,
    typeDefNode: ts.JSDocTypedefTag,
    context: ConversionContext,
  ): string {
    // it's a @typedef of a union type like string | number
    let result = `type ${typeName} = ${type};`;
    const comments = JSDocConverter.formatJsDocComment(
      typeDefNode.comment,
      context,
    );
    if (comments) {
      result = `${comments}\n${result}`;
    }
    return result;
  }
}
