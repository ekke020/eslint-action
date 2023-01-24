#! /usr/bin/env node
import * as core from '@actions/core';
import * as github from '@actions/github';
import {lint ,FileInformation, handleResult, formatedResult } from './lint';

const AUTOFIX = core.getInput('auto_fix') === 'true';
const TOKEN = core.getInput('token');
const octokit = github.getOctokit(TOKEN);

const id = github.context.payload.pull_request!.number;
const repo = github.context.payload.repository!.name;
const owner = github.context.actor;
const commitId = github.context.payload.after;

const createReviewComment = async (message: string, path: string, line: number) => {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: id,
    body: message,
    commit_id: commitId,
    path,
    line,
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
  const formattedComment = '```Stylus'.concat(`\n${message}`).concat('\n```');
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: formattedComment,
  });
}
const main = async () => {
  const result = await lint();
  const formatted = await formatedResult(result);
  await createFormattedComment(formatted);
};

main();
