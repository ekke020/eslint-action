const { ESLint } = require('eslint');
const core = require('@actions/core');
const github = require('@actions/github');

const AUTOFIX = core.getInput('auto_fix') === 'true';

const sortErrors = (file) => {
  const errors = AUTOFIX ? file.messages.filter((message) => !message.fix) : file.messages;
  const notAutoFixable = {
    errors,
    filePath: file.filePath,
  };
  return notAutoFixable;
};

const getErrors = (lintResults) => {
  const files = [];
  ESLint.getErrorResults(lintResults).forEach((file) => {
    files.push(sortErrors(file));
  });
  return files;
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
  return errors;
};

const main = async () => {
  const myToken = core.getInput('token');

  const context = github.context;
  console.log(context);
  const id = context.payload.pull_request.number;
  const repo = context.payload.repository.name;
  const owner = context.actor;
  const files = await lint();
  const commitId = context.sha;

  const path = files[0].filePath;
  const startLine = files[0].errors[0].line;
  const endLine = files[0].errors[0].endLine;

  const octokit = github.getOctokit(myToken);
  console.log(octokit);
  // await octokit.rest.pulls.createReview({
  //   owner,
  //   repo,
  //   id,
  //   body: 'plz work',
  //   path: 'src/lint.js',
  //   line: endLine,
  //   start_line: startLine,
  // });
  await octokit.rest.issues.createComment({
    owner,
    repo,
    id,
    body: 'Does this work?',
  });
};

main();
