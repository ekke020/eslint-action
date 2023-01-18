import { ESLint } from 'eslint';

const AUTOFIX = false;

const sortErrors = (file) => {
  const errors = AUTOFIX ? file.messages.filter((message) => !message.fix) : file.messages;
  const notAutoFixable = {
    errors,
    filePath: file.filePath,
  };
  return notAutoFixable;
};

const getErrors = (lintResults) => {
  const errors = [];
  ESLint.getErrorResults(lintResults).forEach((file) => {
    errors.push(sortErrors(file));
  });
  return errors;
};

const main = async () => {
  const eslint = new ESLint({ fix: AUTOFIX });

  const results = await eslint
    .lintFiles(['src/**/*.js'])
    .catch(() => console.error(1));

  const errors = getErrors(results);

  if (AUTOFIX) {
    await ESLint.outputFixes(results);
  }
  console.log(errors);
};

main();
