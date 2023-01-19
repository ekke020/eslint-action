const { ESLint } = require('eslint');
const core = require('@actions/core');
const github = require('@actions/github');

const AUTOFIX = core.getInput('auto_fix') === 'true';
const TOKEN = core.getInput('token');
const octokit = github.getOctokit(TOKEN);

const id = github.context.payload.pull_request.number;
const repo = github.context.payload.repository.name;
const owner = github.context.actor;
const commitId = github.context.payload.after;

const getRelativePath = (path) => {
  const currentDir = process.cwd();
  const result = path.replace(currentDir, '.');
  return result;
};

const sortErrors = (file) => {
  const errors = AUTOFIX ? file.messages.filter((message) => !message.fix) : file.messages;
  const notAutoFixable = {
    errors,
    filePath: getRelativePath(file.filePath),
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

const createReviewComment = async (message, path, endLine, startLine) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: message,
    commit_id: commitId,
    path,
    line: endLine,
    start_line: startLine,
  });
};

const main = async () => {
  const files = await lint();
  const path = files[0].filePath;
  const startLine = files[0].errors[0].line;
  const endLine = files[0].errors[0].endLine;
  const message = files[0].errors[0].message;

  createReviewComment(message, path, endLine, startLine);
};

main();
