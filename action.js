import lint from './lint';

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

const createReviewComment = async (message, path, line) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: message,
    commit_id: commitId,
    path,
    line,
    // start_line: startLine,
  });
};

const fileSection = (file) => {
  const errorList = file.errors.reduce(
    (message, line) => message
      .concat(
        `\n${line.errors.reduce((m, err) => m.concat(`\n- ${err.message}`), '')}`,
      ),
    {},
  );
  return `## ${file.path}\n${errorList}\nI could autofix ${file.fixableErrorCount}/${file.errorCount} errors.`;
};

const buildComment = (files) => files
  .map(fileSection)
  .reduce((comment, section) => comment.concat(`\n${section}`), '# Errors');

const createComment = async (message) => {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: message,
  });
};

const createMessage = (errors) => errors.reduce((m, error) => `${m}\n${error.message}`, '');

// const test = async () => {
//   const files = await lint();
//   const path = files[0].filePath;
//   const noDiffLines = [];
//   for await (const line of comb) {
//     const message = createMessage(line.errors);
//     try {
//       await createReviewComment(message, path, line.line);
//     } catch (err) {
//       noDiffLines.push(line);
//     }
//   }
//   return noDiffLines;
// };
const main = async () => {
  const result = await lint(AUTOFIX).catch(() => console.error(1));
  const comment = buildComment(result);
  await createComment(comment);
};

main();
