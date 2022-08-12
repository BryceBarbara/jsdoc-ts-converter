import ts from 'typescript'
import { Formatting } from './formatting'
import type { ConversionContext } from './general-types'
import { JSDocConverter } from './jsdoc-conversion'

interface FunctionParamInfo {
  name: string;
  type?: string;
  optional: boolean;
}

export class FunctionConverter {
  static parseFunction(
    name: string,
    node: ts.FunctionLikeDeclarationBase,
    context: ConversionContext,
  ): string | undefined {
    const jsDoc = node
      .getChildren(context.sourceFile)
      .find((e) => ts.isJSDoc(e)) as ts.JSDoc | undefined;
    if (!jsDoc) return;

    const description = JSDocConverter.getJsDocCommentText(
      jsDoc.comment,
      context,
    );

    // generate the function jsdoc comment
    let methodCommentText = `${description ?? 'TODO: add description'}`;
    const params: FunctionParamInfo[] = [];
    let returnType: string | undefined;
    let typeArgumentsText: string = '';
    if (jsDoc.tags) {
      for (const tag of jsDoc.tags) {
        if (ts.isJSDocParameterTag(tag)) {
          const param: FunctionParamInfo = {
            name: tag.name?.getText(context.sourceFile) ?? 'unnamedParam',
            optional: tag.isBracketed,
          };
          if (!tag.typeExpression?.type) {
            // no type
          } else if (ts.isJSDocTypeLiteral(tag.typeExpression.type)) {
            // type expression like { foo: string }
            // param.type = tag.typeExpression.type.getText(context.sourceFile);
            param.type = 'UNSUPPORTED-COMPLEX-TYPE';
          } else if (ts.isJSDocTypeExpression(tag.typeExpression.type)) {
            param.type = 'EXPRESSION';
          } else {
            // something else
            param.type = tag.typeExpression.type.getText(context.sourceFile);
          }
          let paramComment = JSDocConverter.getJsDocCommentText(
            tag.comment,
            context,
          );
          methodCommentText += `\n@param ${param.name}`;
          if (paramComment) {
            paramComment = paramComment.trim();

            // if the comment starts with ' - ' then remove it
            if (paramComment.startsWith('-')) {
              paramComment = paramComment.substring(1).trim();
            }
            methodCommentText += ` ${paramComment}`;
          }
          params.push(param);
        } else if (ts.isJSDocReturnTag(tag)) {
          returnType =
            tag.typeExpression?.type?.getText(context.sourceFile) ?? 'unknown';
        } else if (ts.isJSDocTemplateTag(tag)) {
          typeArgumentsText = (tag.typeParameters ?? [])
            .map((e) => e.getText(context.sourceFile))
            .join(', ');
          typeArgumentsText = '<' + typeArgumentsText + '>';
        }
      }
    }

    // generate the function signature
    let methodSignature = `${name}${typeArgumentsText}(`;
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      methodSignature += `${param.name}`;
      if (param.optional) {
        methodSignature += '?';
      }
      if (param.type) {
        methodSignature += `: ${param.type}`;
      } else {
        methodSignature += `: unknown`;
      }
      if (i < params.length - 1) {
        methodSignature += ', ';
      }
    }
    if (name !== "constructor")
      methodSignature += `): ${returnType || 'unknown'};`;
    else
      methodSignature += ');';

    const functionText = `${Formatting.multiLineComment(
      methodCommentText,
      context.options,
    )}\n${methodSignature}`;

    return functionText;
  }
}
