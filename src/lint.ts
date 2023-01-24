import { ESLint, Linter } from 'eslint';
import * as core from '@actions/core';

const AUTOFIX = core.getInput('auto_fix') === 'true';
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
        messages: new Set
      });
    } 
    acc.get(key)!.messages.add(message.message);
    return acc;
  }, new Map<String, ErrorInformation>());
  return [...groupedMessages.values()];
}

// const combineErrors = (messages: Linter.LintMessage[]): ErrorInformation[] => {
//   const combined = messages.reduce((acc, message) => {
//     if (!acc.has(message.line)) {
//       acc.set(message.line, {
//         line: message.line,
//         errors: [],
//       });
//     }
//     acc.get(message.line)!.errors.push(message.message);
//     return acc;
//   }, new Map<number, ErrorInformation>());
//   return [...combined.values()];
// };

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
  const formatter = await eslint.loadFormatter();

  return formatter.format(result);
}

export const fixCodeErrors = async (result: ESLint.LintResult[]) => {

  await ESLint.outputFixes(result);
}

const test = async () => {
  const result = await lint();
  console.log(GroupMessages(result[0].messages));
  
}
