import { ESLint, Linter } from 'eslint';

type ErrorInformation = {
  line: Number,
  errors: String[],
}

export type FileInformation = {
  path: String,
  errors: ErrorInformation[],
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
    errors: combineErrors(file.messages),
    path: getRelativePath(file.filePath),
    errorCount: file.errorCount,
    fixableErrorCount: file.fixableErrorCount,
  };
};

const handleResult = (lintResult: ESLint.LintResult[]): FileInformation[] => ESLint.getErrorResults(lintResult).map(filterFile);

const lint = async (fix: boolean) => {
  const eslint = new ESLint({ fix });

  const result = await eslint
    .lintFiles(['lint-tests/**/*.js']);
    
  return handleResult(result);
};

export default lint;
