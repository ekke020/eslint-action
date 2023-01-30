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
exports.fixCodeErrors = exports.formatedResult = exports.lint = exports.filterOutFixable = exports.GroupMessages = void 0;
const eslint_1 = require("eslint");
const core = __importStar(require("@actions/core"));
const AUTOFIX = core.getInput('auto_fix') === 'true';
const ROOT = core.getInput('root') || 'src';
const FILE_EXTENSION = core.getInput('extension') || 'ts';
const eslint = new eslint_1.ESLint({ fix: AUTOFIX });
const GroupMessages = (messages, filePath) => {
    const groupedMessages = messages.reduce((acc, message) => {
        const key = `${message.line}-${message.endLine ? message.endLine : message.line}`;
        if (!acc.has(key)) {
            acc.set(key, {
                line: message.line,
                endLine: message.line === message.endLine ? undefined : message.endLine,
                messages: new Set(),
                filePath,
            });
        }
        acc.get(key).messages.add(message.message);
        return acc;
    }, new Map());
    return [...groupedMessages.values()];
};
exports.GroupMessages = GroupMessages;
const filterOutFixable = (results) => results.filter((result) => {
    result.messages = result.messages.filter((message) => !message.fix);
    return result.messages.length > 0;
});
exports.filterOutFixable = filterOutFixable;
const lint = async () => {
    const results = await eslint
        .lintFiles([`${ROOT}/**/*.${FILE_EXTENSION}`]);
    return results;
};
exports.lint = lint;
const formatedResult = async (results) => {
    const formatter = await eslint.loadFormatter();
    return formatter.format(results);
};
exports.formatedResult = formatedResult;
const fixCodeErrors = async (results) => {
    await eslint_1.ESLint.outputFixes(results);
};
exports.fixCodeErrors = fixCodeErrors;
