import { ESLint, Linter } from 'eslint';
import * as core from '@actions/core';
const AUTOFIX = core.getInput('auto_fix') === 'true';

const eslint = new ESLint({ fix: AUTOFIX });

type ErrorInformation = {
  line: Number,
  errors: String[],
}

export type FileInformation = {
  path: String,
  errors: Linter.LintMessage[],
  errorCount: Number,
  fixableErrorCount: Number,
}

const combineErrors = (messages: Linter.LintMessage[]): ErrorInformation[] => {
  const combined = messages.reduce((acc, message) => {
    if (!acc.has(message.line)) {
      acc.set(message.line, {
        line: message.line,
        errors: [],
      });
    }
    acc.get(message.line)!.errors.push(message.message);
    return acc;
  }, new Map<number, ErrorInformation>());
  return [...combined.values()];
};

const getRelativePath = (path: String) => {
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
  return result;
};

const filterFile = (file: ESLint.LintResult): FileInformation => {
  return {
    errors: file.messages,
    path: getRelativePath(file.filePath),
    errorCount: file.errorCount,
    fixableErrorCount: file.fixableErrorCount,
  };
};

export const handleResult = (lintResult: ESLint.LintResult[]): FileInformation[] => ESLint.getErrorResults(lintResult).map(filterFile);

export const lint = async (): Promise<ESLint.LintResult[]> => {
  const result = await eslint
    .lintFiles(['lint-tests/**/*.js']);
  
  return result;
};

export const formatedResult = async (result: ESLint.LintResult[]): Promise<String> => {
  const formatter = await eslint.loadFormatter("stylish");

  return formatter.format(result);
}

export const fixCodeErrors = async (result: ESLint.LintResult[]) => {

  await ESLint.outputFixes(result);
}
