# eslint-action
- Shows linting errors as comments on PRs 
- Can be configured to leave code reviews or simple comments.
- Can autofix certain errors.

The actions purpose is to give clear feedback on the outcome of a lint.
Either through code reviews that point out specific linting errors or a normal PR comment with a summary of the lint.
It is important to note that the workflow needs to run on **pull requests** for it to work properly.
## Example snippets
This example shows the default configuration for the action. It wont leave any code review comments but instead opt for summary comments.
```yml
---
name: Lint files

on: [pull_request]

permissions:
  contents: read
  id-token: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3 
      - name: Install dependencies
        shell: bash
        run: npm install
      - name: Run Lint
        uses: ekke020/eslint-action@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```
This example leaves code review comments instead and tries to fix any issues it can.
```yml
---
name: Lint files

on: [pull_request]
...
  - name: Run Lint
    uses: ekke020/eslint-action@main
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      auto-fix: true
      review: true
  - name: Commit changes
    shell: bash
    run: |
      git add .
      git commit -m "Fixed errors"
      git push
```

## Input Parameters
|name|description|required|default|
|----|-----------|--------|-------|
|token|Github token used for comments|true| -- |
|auto_fix|Auto fixes certain errors/warnings|false|false|
|root|The folder to target with the lint|false|src|
|review|Leave review comment|false|false|
|comment_limit|The maximum number of review comments|false|3|
|extension|The extension to target|false|ts|