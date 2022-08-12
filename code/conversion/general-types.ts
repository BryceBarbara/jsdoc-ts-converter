import type ts from 'typescript'

export interface ConversionResult {
  fileName: string
  importStatements: string[]
  typeStatements: string[]
  interfaces: string[]
  functions: string[]
}

export interface ConversionOptions {
  indent: string
}

export interface ConversionContext {
  sourceFile: ts.SourceFile
  options: ConversionOptions
}
