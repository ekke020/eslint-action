#! /usr/bin/env node
import * as core from '@actions/core';
import * as github from '@actions/github';
import { ESLint } from 'eslint';
import {
  lint, GroupMessages, ErrorInformation,
  formatedResult, filterOutFixable, fixCodeErrors,
} from './lint';

const AUTOFIX = core.getInput('auto_fix') === 'true';
const TOKEN = core.getInput('token');
const COMMENT = core.getInput('comment') === 'true';
const COMMENT_LIMIT = Number(core.getInput('comment_limit')) || 3;

const octokit = github.getOctokit(TOKEN);
const id = github.context.payload.pull_request!.number ;
const repo = github.context.payload.repository!.name;
const owner = github.context.actor;
const getCommitId = () => {
  const url = github.context.payload.pull_request!.statuses_url;
  return github.context.payload.after || url.substring(url.lastIndexOf('/') + 1);
};
const commitId = getCommitId();

const getRelativePath = (path: string): string => {
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
  return result.trim();
};

const createReviewMessage = (messages: Set<string>): string => [...messages].reduce(
  (comment, message) => comment.concat(`- ${message}\n`),
  '',
).trimEnd();

const createReviewComment = async (
  information: ErrorInformation,
) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: createReviewMessage(information.messages),
    commit_id: commitId,
    path: getRelativePath(information.filePath),
    line: information.endLine ?? information.line,
    start_line: information.endLine ? information.line : undefined,
  });
};

const createComment = async (message: string) => {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: message,
  });
};

const createFormattedComment = async (message: String, title: String = '') => {
  const formattedComment = `${title}\`\`\`solidity`.concat(`\n${message}`).concat('\n```');
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: formattedComment,
  });
  core.setFailed('There are linting errors that need to be addressed');
};

const presentAllErrors = async (results: ESLint.LintResult[]) => {
  const formatted = await formatedResult(results);
  await createFormattedComment(formatted, 'There are errors outside of the commit\n');
};

const postComments = async (results: ESLint.LintResult[]) => {
  const messages = results.flatMap((result) => GroupMessages(result.messages, result.filePath));
  if (messages.length > COMMENT_LIMIT) {
    const formatted = await formatedResult(results);
    await createFormattedComment(formatted);
  } else if (messages.length > 0) {
    try {
      for (const message of messages) {
        await createReviewComment(message);
      }
    } catch (e) {
      await presentAllErrors(results);
    }
    core.setFailed('There are linting errors that need to be addressed');
  }
};

const main = async () => {
  let results = await lint();
  if (AUTOFIX) {
    fixCodeErrors(results);
    results = filterOutFixable(results);
  }
  if (COMMENT) {
    await postComments(results);
  } else {
    const formatted = await formatedResult(results);
    await createFormattedComment(formatted);
  }
};

main();
