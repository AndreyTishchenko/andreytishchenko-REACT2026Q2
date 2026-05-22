# Wizarding Character Search

React application for searching Harry Potter character records from
[PotterDB](https://potterdb.com/). The app is built with Vite, React, and
TypeScript, and uses function components throughout the UI.

## Features

- Search PotterDB characters by name.
- Display up to 12 sorted character cards per request.
- Show house, species, gender, birth date, jobs, and aliases when PotterDB
  provides them.
- Persist the last search term in `localStorage`.
- Show loading, empty, API error, and application fallback states.
- Include a `Simulate app error` button for checking the React error boundary.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- ESLint 9
- Prettier 3
- PotterDB REST API

## Getting Started

Install dependencies from the app directory:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript project checks and creates a production build.
- `npm run lint` checks the project with ESLint.
- `npm run format:fix` formats files with Prettier.
- `npm run preview` serves the built app locally.
- `npm run prepare` installs Husky hooks from the repository root.

## Project Structure

```text
rs-react-app/
  public/              Static icons and favicon
  src/
    api/               PotterDB request and response mapping
    components/        React function components
    constants/         Shared constants
    types/             TypeScript data models
    utils/             Local storage helpers
    App.tsx            Error boundary wrapper
    main.tsx           React entry point
    styles.css         App styles
```

## API Notes

The app requests characters from:

```text
https://api.potterdb.com/v1/characters
```

Requests are sorted by character name, use the first page, and limit the result
set to 12 items. When a search term is submitted, it is sent with PotterDB's
`filter[name_cont]` parameter.
