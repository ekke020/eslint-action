import * as github from '@actions/github';

const octokit = github.getOctokit('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');
const commit = '4a9773d57ea804bada1a3e225593b2e3fc14c5d2';

const owner = 'ekke020';
const repo = 'eslint-action';
const ref = 'heads/test';
const pushCommit = async (sha: String) => {
  const res = await octokit.rest.git.updateRef({
    owner,
    repo,
    ref,
    sha: 'c7eb593ba3fc77b783c13fdf1a31d0eed11eefdc',
  });
  console.log(res);
};

const test = async () => {
  // const results = await lint();
  const res = await octokit.rest.git.createCommit({
    owner: 'ekke020',
    repo: 'eslint-action',
    message: 'from API',
    tree: '242b1af7d0f77d217b0fed68779151a275d3834e',
    parent: '0d5e2d4f4a40e595c314e2ba073506fbcec29c33',
    author: {
      name: 'bot',
      email: 'github@notreply.com',
    },
  });
  console.log(res);
  // octokit.rest.git.getCommit({
  //   owner: 'ekke020',
  //   repo: 'eslint-action',
  //   commit_sha: '4a9773d57ea804bada1a3e225593b2e3fc14c5d2',
  // }).then(({data}) => {
  //   console.log(data.parents);
  // });
  // octokit.rest.git.getTree({
  //   owner: 'ekke020',
  //   repo: 'eslint-action',
  //   tree_sha: '0d5e2d4f4a40e595c314e2ba073506fbcec29c33',
  // }).then(({data}) => {
  //   console.log(data);
  // });
};

pushCommit('');
