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

