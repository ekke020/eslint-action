const { ESLint } = require('eslint');
const core = require('@actions/core');
const github = require('@actions/github');

const AUTOFIX = core.getInput('auto_fix');

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

const lint = async () => {
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

const main = async () => {
  const myToken = core.getInput('token');

  const octokit = github.getOctokit(myToken);

  const [context] = github;

  const newIssue = await octokit.rest.issues.createComment({
    ...context.repo,
    title: 'New issue!',
    body: 'Hello Universe!',
  });
};

main();
