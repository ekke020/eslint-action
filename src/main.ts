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
const octokit = github.getOctokit(TOKEN);

const id = github.context.payload.pull_request!.number;
const repo = github.context.payload.repository!.name;
const owner = github.context.actor;
const commitId = github.context.payload.after;

const getRelativePath = (path: string): string => {
  const currentDir = process.cwd().concat('/');
  const result = path.replace(currentDir, '');
  return result;
};

const createReviewMessage = (messages: Set<string>): string => [...messages].reduce(
  (comment, message) => comment.concat(`- ${message}\n`),
  '',
).trimEnd();

const createReviewComment = async (information: ErrorInformation, path: string) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: createReviewMessage(information.messages),
    commit_id: commitId,
    path: getRelativePath(path),
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
};

const presentAllErrors = async (results: ESLint.LintResult[]) => {
  const formatted = await formatedResult(results);
  await createFormattedComment(formatted, 'There are errors outside of the commit\n');
};

const main = async () => {
  console.log(github.context);
  let results = await lint();
  if (AUTOFIX) {
    // TODO: Add automatic git commit after code fix.
    fixCodeErrors(results);
    results = filterOutFixable(results);
  }
  try {
    for await (const result of results) {
      const groupedMessages = GroupMessages(result.messages);
      for await (const message of groupedMessages) {
        await createReviewComment(message, result.filePath);
      }
    }
  } catch (err) {
    await presentAllErrors(results);
  }
};

main();
