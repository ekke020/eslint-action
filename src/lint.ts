import { ESLint, Linter } from 'eslint';
import * as core from '@actions/core';

const AUTOFIX = core.getInput('auto_fix') === 'true';
const ROOT = core.getInput('root') || 'lint-tests';
const FILE_EXTENSION = core.getInput('extension') || 'ts';
const eslint = new ESLint({ fix: AUTOFIX });

export type FileInformation = {
  path: String,
  errors: Linter.LintMessage[],
  errorCount: Number,
  fixableErrorCount: Number,
}

export interface ErrorInformation {
  line: number;
  endLine: number | undefined;
  messages: Set<string>;
}

export const GroupMessages = (messages: Linter.LintMessage[]) => {
  const groupedMessages = messages.reduce((acc, message) => {
    console.log(message);
    const key = `${message.line}-${message.endLine ? message.endLine : message.line}`;
    if (!acc.has(key)) {
      acc.set(key, {
        line: message.line,
        endLine: message.line === message.endLine ? undefined : message.endLine,
        messages: new Set(),
      });
    }
    acc.get(key)!.messages.add(message.message);
    return acc;
  }, new Map<String, ErrorInformation>());
  return [...groupedMessages.values()];
};

const getRelativePath = (path: String) => {
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
  return result;
};

const filterFile = (file: ESLint.LintResult): FileInformation => ({
  errors: file.messages,
  path: getRelativePath(file.filePath),
  errorCount: file.errorCount,
  fixableErrorCount: file.fixableErrorCount,
});

// export const handleResult = (lintResult: ESLint.LintResult[]): FileInformation[] => ESLint.getErrorResults(lintResult).map(filterFile);

export const filterOutFixable = (results: ESLint.LintResult[]) => results.filter((result) => {
  result.messages = result.messages.filter((message) => !message.fix);
  return result.messages.length > 0;
});

export const lint = async (): Promise<ESLint.LintResult[]> => {
  const results = await eslint
    .lintFiles([`${ROOT}/**/*.${FILE_EXTENSION}`]);
  return results;
};

export const formatedResult = async (results: ESLint.LintResult[]): Promise<String> => {
  const formatter = await eslint.loadFormatter();
  return formatter.format(results);
};

export const fixCodeErrors = async (results: ESLint.LintResult[]) => {
  await ESLint.outputFixes(results);
};

const test = async () => {
  const results = await lint();
  console.log(results);
};

// test();
