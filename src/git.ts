import * as github from '@actions/github';

const octokit = github.getOctokit('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');
const commit = '4a9773d57ea804bada1a3e225593b2e3fc14c5d2';

const id = github.context.payload.pull_request!.number;
const repo = github.context.payload.repository!.name;
const owner = github.context.actor;
const commitId = github.context.payload.after;

const ref = 'heads/git-test';

const pushCommit = async (sha: String) => {
  const res = await octokit.rest.git.updateRef({
    owner,
    repo,
    ref,
    sha: '87568f3f5cdc7c91ebbc4b1b3fae93cb5e224e62',
  });
  console.log(res);
};

const createCommit = async () => {
  const res = await octokit.rest.git.createCommit({
    owner: 'ekke020',
    repo: 'eslint-action',
    message: 'from API',
    tree: 'f8bf7918ebefe4e23e606e1c1dc7f6a185e15453',
    parents: [
      '3edf57f70f884f62cf1eab3e0749c74588f5068e',
      '1231883d1a0dee83b7a491cb84a84f6e0d76e866',
    ],
    author: {
      name: 'bot',
      email: 'github@notreply.com',
    },
  });
  console.log(res); // return res.data.sha and use in push
};

const getTree = async () => {
  const res = await octokit.rest.git.getTree({
    owner: 'ekke020',
    repo: 'eslint-action',
    tree_sha: 'a81fecd9b595c15486bdf769eec4ea45612e965b', // context.payload.sha
  });
  console.log(res.data.tree); // filter on path === 'root folder'
};

const getParents = async () => {
  const res = await octokit.rest.git.getCommit({
    owner: 'ekke020', // context.payload.owner.name
    repo: 'eslint-action', // context.payload.repository.name
    commit_sha: 'a81fecd9b595c15486bdf769eec4ea45612e965b', // context.payload.sha
  });
  return res.data.parents.map((p) => p.sha);
};

const test = async () => {
  // const results = await lint();
  // console.log(await getParents());
  // await pushCommit('');
  const commits = await octokit.rest.pulls.listCommits({
    owner: 'ekke020',
    repo: 'eslint-action',
    pull_number: id, // pull number
  });
  console.log(commits);
};

test();
