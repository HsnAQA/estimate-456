# Deployment

The site is static and hosted on Vercel at
[estimate-456.vercel.app](https://estimate-456.vercel.app). The Vercel project
is connected to this repository.

## How a change goes live

| Event | Result |
|---|---|
| push to `main` | Vercel builds and publishes to production |
| push to any other branch, or a pull request | Vercel builds a preview deployment and links it on the pull request |
| any push or pull request | GitHub Actions runs the unit and browser tests |

Vercel reads `vercel.json` at the repository root: the build command
(`node web-app/tools/build-site.js`), the output folder (`site`), security
headers, and cache rules. Run the tests before pushing to `main`:

```powershell
cd web-app
node --test "tests/*.test.js"
node tests/e2e/run-e2e.mjs
```

To check the live site after a deploy:

```powershell
cd web-app
$env:E2E_URL = "https://estimate-456.vercel.app/"; node tests/e2e/run-e2e.mjs
```

## What `site/` contains

`index.html`, `favicon.ico`, `css/`, `js/`, `vendor/`, `assets/brand/`,
`assets/fonts/` with their licenses, a copy of the headers in `vercel.json`,
and `.vercelignore`. The folder is generated and ignored by git; never edit it
by hand. You can still deploy it by hand with `npx vercel@latest deploy` from
`site/`.

## Roll back

In the Vercel dashboard, open the project's deployments and promote an earlier
one, or:

```powershell
npx vercel@latest ls estimate-456
npx vercel@latest rollback <previous-deployment-url> --yes
```
