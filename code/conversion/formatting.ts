import type { ConversionOptions } from './general-types';

export class Formatting {
  /**
   * Turns "test" into "&nbsp;&nbsp;test"
   * @param text
   * @param indentDepth
   * @param options
   * @returns
   */
  static indent(
    text: string,
    indentDepth: number,
    options: ConversionOptions,
  ): string {
    const indent = options.indent;
    const prefix = indent.repeat(indentDepth);
    return `${prefix}${text}`;
  }

  /**
   * Turns "hello world" into "/** hello world *\/"
   * @param comment
   * @param options
   * @param indentDepth
   * @returns
   */
  static singleLineComment(
    comment: string,
    options: ConversionOptions,
    indentDepth = 0,
  ): string {
    const indent = options.indent.repeat(indentDepth);
    return `${indent}/** ${comment} */`;
  }

  /**
   * Turns "hello\nworld" into "/**\n * hello\n * world\n *\/"
   * @param comment
   * @param options
   * @param indentDepth
   * @returns
   */
  static multiLineComment(
    comment: string,
    options: ConversionOptions,
    indentDepth = 0,
  ): string {
    const indent = options.indent.repeat(indentDepth);
    const lines = comment.split('\n');
    return `${indent}/**\n${indent} * ${lines.join(
      `\n${indent} * `,
    )}\n${indent} */`;
  }
}
