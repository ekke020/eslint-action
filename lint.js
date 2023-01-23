const { ESLint } = require('eslint');
const util = require('util');

const combineErrors = (messages) => {
  const combined = messages.reduce((acc, message) => {
    if (!acc[message.line]) {
      acc[message.line] = {
        line: message.line,
        errors: [],
      };
    }
    acc[message.line].errors.push(message.message);
    return acc;
  }, {});
  return Object.values(combined);
};

const extractInformation = (file) => ({
  path: file.path,
  errors: combineErrors(file.errors),
  errorCount: file.errorCount,
  fixableErrorCount: file.fixableErrorCount,
});

const getRelativePath = (path) => {
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
  return result;
};

const filterFile = (file) => {
  // false ? file.messages.filter((message) => !message.fix) :
  const errors = file.messages;
  const notAutoFixable = {
    errors,
    path: getRelativePath(file.filePath),
    errorCount: file.errorCount,
    fixableErrorCount: file.fixableErrorCount,
  };
  return notAutoFixable;
};

const handleResult = (lintResult) => ESLint.getErrorResults(lintResult).map(filterFile);

const lint = async (fix) => {
  const eslint = new ESLint({ fix });

  const result = await eslint
    .lintFiles(['src/**/*.js'])
    .catch(() => console.error(1));

  return handleResult(result)
    .map(extractInformation);
};

export default lint;
