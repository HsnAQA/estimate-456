# Deployment

The site is static and hosted on Vercel at
[estimate-456.vercel.app](https://estimate-456.vercel.app). Nothing is
published to production before a preview of the same build passes the tests.

## Publish

```powershell
cd web-app
node tools/build-site.js            # writes ..\site
cd ..\site
npx vercel@latest deploy --yes      # preview deployment, prints its URL
```

Test the built folder, then promote the preview:

```powershell
cd ..\site
python -m http.server 8766          # in a second terminal
cd ..\web-app
$env:E2E_URL = "http://127.0.0.1:8766/"; node tests/e2e/run-e2e.mjs
cd ..\site
npx vercel@latest promote <preview-url> --yes
cd ..\web-app
$env:E2E_URL = "https://estimate-456.vercel.app/"; node tests/e2e/run-e2e.mjs
```

## What `site/` contains

`index.html`, `css/`, `js/`, `vendor/`, `assets/brand/`, `assets/fonts/` with
their licenses, `vercel.json` (security headers and a content security policy
that allows only the site itself), and `.vercelignore`. The folder is generated
and ignored by git; never edit it by hand.

The Saudi and The Year of Handicrafts fonts are added to `site/` only when
`assets/fonts/private/` exists on the publishing machine. Their license from
the Ministry of Culture allows use on websites but not redistribution, so they
are never committed.

## Roll back

```powershell
npx vercel@latest ls estimate-456
npx vercel@latest rollback <previous-deployment-url> --yes
```
