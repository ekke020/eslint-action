#! /usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const lint_1 = require("./lint");
const AUTOFIX = core.getInput('auto_fix') === 'true';
const TOKEN = core.getInput('token');
const COMMENT = core.getInput('comment') === 'true';
const COMMENT_LIMIT = Number(core.getInput('comment_limit')) || 3;
const octokit = github.getOctokit(TOKEN);
const id = github.context.payload.pull_request.number;
const repo = github.context.payload.repository.name;
const owner = github.context.actor;
const getCommitId = () => {
    const url = github.context.payload.pull_request.statuses_url;
    return github.context.payload.after || url.substring(url.lastIndexOf('/') + 1);
};
const commitId = getCommitId();
const getRelativePath = (path) => {
    const currentDir = process.cwd().concat('/');
    const result = path.replace(currentDir, '');
    return result.trim();
};
const createReviewMessage = (messages) => [...messages].reduce((comment, message) => comment.concat(`- ${message}\n`), '').trimEnd();
const createReviewComment = async (information) => {
    var _a;
    await octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: id,
        body: createReviewMessage(information.messages),
        commit_id: commitId,
        path: getRelativePath(information.filePath),
        line: (_a = information.endLine) !== null && _a !== void 0 ? _a : information.line,
        start_line: information.endLine ? information.line : undefined,
    });
};
const createComment = async (message) => {
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: id,
        body: message,
    });
};
const createFormattedComment = async (message, title = '') => {
    const formattedComment = `${title}\`\`\`solidity`.concat(`\n${message}`).concat('\n```');
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: id,
        body: formattedComment,
    });
    core.setFailed('There are linting errors that need to be addressed');
};
const presentAllErrors = async (results) => {
    const formatted = await (0, lint_1.formatedResult)(results);
    await createFormattedComment(formatted, 'There are errors outside of the commit\n');
};
const postComments = async (results) => {
    const messages = results.flatMap((result) => (0, lint_1.GroupMessages)(result.messages, result.filePath));
    if (messages.length > COMMENT_LIMIT) {
        const formatted = await (0, lint_1.formatedResult)(results);
        await createFormattedComment(formatted);
    }
    else if (messages.length > 0) {
        try {
            for (const message of messages) {
                await createReviewComment(message);
            }
        }
        catch (e) {
            await presentAllErrors(results);
        }
        core.setFailed('There are linting errors that need to be addressed');
    }
};
const main = async () => {
    let results = await (0, lint_1.lint)();
    if (AUTOFIX) {
        (0, lint_1.fixCodeErrors)(results);
        results = (0, lint_1.filterOutFixable)(results);
    }
    if (COMMENT) {
        await postComments(results);
    }
    else {
        const formatted = await (0, lint_1.formatedResult)(results);
        await createFormattedComment(formatted);
    }
};
main();
