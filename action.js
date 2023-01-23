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
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
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

const buildComment = (lines) => {
  console.log('Lines:', lines);
  // const combined = lines.reduce((message, line) => {
  //   const errors = line.errors.reduce((errors, err) => {
  //     err.
  //     return errors;
  //   });
  //   return message;
  // }, 'There are other errors:');
  return 'Just a filler';
};

const createComment = async (message) => {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    pull_number: id,
    body: message,
  });
};

const createMessage = (errors) => errors.reduce((m, error) => `${m}\n${error.message}`, '');
const combineErrors = (errors) => {
  const combined = errors.reduce((acc, error) => {
    if (!acc[error.line]) {
      acc[error.line] = {
        line: error.line,
        errors: [],
      };
    }
    acc[error.line].errors.push(error);
    return acc;
  }, {});
  return Object.values(combined);
};

const main = async () => {
  console.log(github.context);
  const noDiffLines = [];
  const files = await lint();
  const path = files[0].filePath;
  // const startLine = files[0].errors[0].line;
  // const endLine = files[0].errors[0].endLine;
  // const message = files[0].errors[0].message;
  console.log(files[0].errors[0]);
  const comb = combineErrors(files[0].errors);
  comb.forEach(async (line) => {
    const message = createMessage(line.errors);
    try {
      await createReviewComment(message, path, line.line);
    } catch (err) {
      noDiffLines.push(line);
    }
  });
  if (noDiffLines.length > 0) {
    const comment = buildComment(noDiffLines);
    await createComment(comment);
  }
};

main();
