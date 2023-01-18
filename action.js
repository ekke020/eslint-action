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
  const octokit = github.getOctokit(myToken);

  const context = github.context;
  console.log(context);
  const pullId = context.payload.pull_request.number;
  const repo = context.payload.repository.name;

  const files = await lint();

  const path = files[0].filePath;
  const startLine = files[0].errors[0].line;
  const endLine = files[0].errors[0].endLine;

  await octokit.request(`POST /repos/${context.repo}/${repo}/pulls/${pullId}/comments`, {
    ...context,
    body: 'Great stuff!',
    path: path,
    start_line: startLine,
    start_side: 'RIGHT',
    line: endLine,
    side: 'RIGHT',
  });
};

main();
