#! /usr/bin/env node
import * as core from '@actions/core';
import * as github from '@actions/github';
import { ESLint } from 'eslint';
import {lint ,FileInformation, handleResult, formatedResult, GroupMessages, ErrorInformation } from './lint';

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

const createReviewMessage = (messages: string[]): string => {
  return messages.reduce(
    (comment, message) => comment.concat(`- ${message}\n`),
  );
};

const createReviewComment = async (information: ErrorInformation, path: string) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: createReviewMessage(information.messages),
    commit_id: commitId,
    path: getRelativePath(path),
    line: information.endLine,
    start_line: information.line,
  });
};

// const fileSection = (file: FileInformation) => {
//   const errorList = file.errors.reduce(
//     (message: string, error) => message
//       .concat(
//         `\n${error.errors.reduce((m: string, err: String) => m.concat(`\n- ${err}`), '')}`,
//       ),
//     '',
//   );
//   return `## ./${file.path}\n${errorList}\n\n**I could autofix ${file.fixableErrorCount}/${file.errorCount} errors.**`;
// };

// const buildComment = (files: FileInformation[]) => files
//   .map(fileSection)
//   .reduce((comment: string, section: string) => comment.concat(`\n${section}`), '# Errors');

const createComment = async (message: string) => {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: message,
  });
};

const createFormattedComment = async (message: String) => {
  const formattedComment = '```solidity'.concat(`\n${message}`).concat('\n```');
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: formattedComment,
  });
}

const main = async () => {
  const results = await lint();
  // if (results.length > 3) {
  const formatted = await formatedResult(results);
  await createFormattedComment(formatted);
  // } 
  for(const result of results) {
    const groupedMessages = GroupMessages(result.messages);
    await createReviewComment(groupedMessages[0], result.filePath)
    // for await (const message of groupedMessages) {
    //   await createReviewComment(message, result.filePath)
    // }
  }
};

main();
