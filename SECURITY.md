# Security policy

Estimate 456 is a static site with no accounts, no server, and no database.
All calculations run in the browser, and inputs stay in the browser's local
storage. The main risks are a broken page, a wrong formula, or a leaked secret
in a commit.

## Reporting a problem

Report privately. Do not open a public issue with exploit details.

1. Preferred: on GitHub, open **Security > Advisories > New draft security
   advisory** for this repository. Drafts are visible only to the maintainer.
2. Otherwise, send a direct message to the maintainer
   [@HsnAQA](https://github.com/HsnAQA).

A wrong calculation is not a security issue. Open a normal issue with the
inputs, the result you got, and the result the lecture gives.

## If a secret is exposed

The repository should never contain a key or token. If one appears in a
commit, rotate it at its provider first, then clean the history. Removing a
commit does not make a leaked secret safe.
