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

The production frontend is written to `dist/`. Preview runs at http://127.0.0.1:4173 and also supplies the local form API.

## Structure

```text
src/
  App.jsx
  main.jsx
  components/       Shared navigation and footer
  pages/            Home, BMI assessment, questionnaire and information pages
  lib/              BMI validation and form submission
  styles/           Original styles and English/LTR adaptations
public/             Local logo, video, images and fonts
server/forms.js     Server-only form validation and Bale delivery
vite.config.js      React tooling and local API middleware
tests/              Form, calculation and API tests
```

There is one React root, actual editable JSX components, and normal `react` / `react-dom` dependencies. No copied React runtime is used. All visuals load from local files.

## Forms

The BMI calculator and questionnaire run locally. The `/api/forms` middleware delivers completed submissions to the original Bale destinations, using server-only variables from `.env.local`. Existing credentials are configured locally with the owner's authorization. The `.env.local` file is ignored by Git and must never be published or placed in `public/`.

For a fresh checkout, copy `.env.example` to `.env.local`, set `BALE_BOT_TOKEN` and `BALE_CHAT_IDS`, and restart Vite. No credentials are exposed through `VITE_` variables or the frontend build.

`npm run preview` includes the API. Deploying only the static `dist/` folder elsewhere requires a compatible `/api/forms` backend.

The Node/Vite process needs outbound HTTPS access to `tapi.bale.ai`. If the server reports that it cannot connect to Bale, start `npm start` from a normal local terminal with network access. A sandboxed server can serve the website while blocking its outgoing messages. Confirmed connection failures remain retryable; uncertain or partial deliveries are not reported as successful.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` tests, builds and publishes the site on pushes to `main`, or when run manually from the Actions tab.

1. Push the project to `MuhammadGolchin1/RoxanaEN` on GitHub.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Push to `main`, or run **Actions → Deploy to GitHub Pages → Run workflow**.

The expected project URL is **https://muhammadgolchin1.github.io/RoxanaEN/**. The actual deployment URL appears in the workflow result. The workflow obtains the base path from GitHub Pages metadata, so user sites and custom domains are also supported. Media and navigation use that base path. The build emits an HTML entry for each internal route, allowing links such as `/RoxanaEN/assessment/` to load directly and refresh successfully.

### Form delivery on Pages

GitHub Pages hosts the frontend only; it does not run Node.js or `/api/forms`. Local `npm start` continues to use the working local API. To enable hosted form submissions:

1. Host `server/index.js` on a Node.js 24 service with outbound HTTPS access. Its start command is `npm run start:api`; it uses `PORT` when supplied by the host. This API needs no npm dependencies.
2. Configure **server-only** environment variables `BALE_BOT_TOKEN` and `BALE_CHAT_IDS` using the original credentials. Set `BALE_ALLOWED_ORIGINS=https://muhammadgolchin1.github.io` (add any custom-domain origin separated by commas).
3. Give that API an HTTPS address. In **GitHub → Settings → Secrets and variables → Actions → Variables**, add the repository variable **`VITE_FORMS_API_URL`**, for example `https://your-api.example.com/api/forms`.
4. Run the Pages workflow again. Form submissions now go to the configured API, which calls the original Bale service with the same server-side token and IDs.

The API URL is public configuration. The bot token and recipient IDs belong on the API host, not in GitHub Pages assets or `VITE_` variables. Without an API URL, hosted forms show an accurate unavailable message instead of pretending to send; the BMI calculation and questionnaire still work.

To check the standalone API locally, run `npm run start:api`; it listens at `http://127.0.0.1:8787/api/forms` and loads the ignored `.env.local`. Never publish `.env.local`.

References: [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

