# Roxana Lifestyle — local React project

An English, left-to-right React recreation of **roxanalifestyle.ir**, retaining the original layout, colors, video, logo, illustrations, animation and mobile breakpoints.

## Run

Open a terminal in `D:\RoxanaEN`:

```sh
npm install
npm start
```

Open **http://127.0.0.1:5173**. `npm run dev` runs the same Vite development server with React Fast Refresh.

```sh
npm run build
npm run preview
npm test
```

The production frontend is written to `dist/`. Preview runs at http://127.0.0.1:4173.

## Structure

```text
src/
  App.jsx
  main.jsx
  components/       Shared navigation and footer
  pages/            Home, BMI assessment, questionnaire and information pages
  lib/              BMI validation and form submission
  config/bale.json  Public frontend Bale token and destination IDs
  styles/           Original styles and English/LTR adaptations
public/             Local logo, video, images and fonts
server/pages-build.js  Static HTML entries for GitHub Pages
vite.config.js      React tooling and repository base path
tests/              Form, calculation, browser transport and routing tests
```

There is one React root, actual editable JSX components, and normal `react` / `react-dom` dependencies. No copied React runtime is used. All visuals load from local files.

## Forms

Both forms submit **directly from the visitor's browser to Bale**, using the original token and destination IDs configured in `src/config/bale.json`. This public frontend configuration is included in the JavaScript build as explicitly requested by the owner.

Clicking Send calls `https://tapi.bale.ai/bot<TOKEN>/sendMessage` for each configured destination. Text uses a `URLSearchParams` POST; optional photos use multipart `FormData` with `sendPhoto`. Message labels and results are English. Long questionnaires are split into messages below the service limit.

Requests use `mode: 'no-cors'` and no custom headers, matching the original site's browser transport. The application does not call `/api/forms`, a proxy, or an external application server.

Bale does not expose its response to browser JavaScript through CORS. An opaque response is shown as "sent from your browser", with delivery explicitly unconfirmed. Readable positive API responses are reported as confirmed. Interrupted or partial submissions are shown as uncertain. Repeated clicks with the same reference do not automatically resend messages.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` tests, builds and publishes the site on pushes to `main`, or when run manually from the Actions tab.

1. Push the project to `MuhammadGolchin1/RoxanaEN` on GitHub.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Push to `main`, or run **Actions → Deploy to GitHub Pages → Run workflow**.

The expected project URL is **https://muhammadgolchin1.github.io/RoxanaEN/**. The actual deployment URL appears in the workflow result. The workflow obtains the base path from GitHub Pages metadata, so user sites and custom domains are also supported. Media and navigation use that base path. The build emits an HTML entry for each internal route, allowing links such as `/RoxanaEN/assessment/` to load directly and refresh successfully.

### Form delivery on Pages

The same direct browser transport runs on GitHub Pages. Commit `src/config/bale.json` together with the application. No separate API host, repository secret or `VITE_FORMS_API_URL` is required. Edit that config file and rebuild when the token or destination IDs change. Older server-side `.env.local` values are no longer used for sending.

References: [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

