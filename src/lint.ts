import { ESLint, Linter } from 'eslint';
import * as core from '@actions/core';

const AUTOFIX = core.getInput('auto_fix') === 'true';
const ROOT = core.getInput('root') || 'src';
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
  filePath: string;
}

export const GroupMessages = (messages: Linter.LintMessage[], filePath: string) => {
  const groupedMessages = messages.reduce((acc, message) => {
    const key = `${message.line}-${message.endLine ? message.endLine : message.line}`;
    if (!acc.has(key)) {
      acc.set(key, {
        line: message.line,
        endLine: message.line === message.endLine ? undefined : message.endLine,
        messages: new Set(),
        filePath,
      });
    }
    acc.get(key)!.messages.add(message.message);
    return acc;
  }, new Map<String, ErrorInformation>());
  return [...groupedMessages.values()];
};

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
