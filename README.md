# VEYRON Frontend

React single-page app for the VEYRON barber booking platform. Covers customer booking, barber dashboards, and the admin panel.

## Tech stack

- React 18 (Create React App / react-scripts 5)
- React Router 6
- Redux + Redux Thunk
- React Bootstrap / Bootstrap 5
- Axios for API calls
- Leaflet / React Leaflet for maps
- Lucide React icons

## Setup

```bash
npm install
```

No `.env` file is needed for local development — `package.json` proxies `/api` requests to `http://localhost:5050` (the backend). See `.env.example` if you need to point the app at a separately hosted API in production.

## Run

```bash
npm start       # dev server, http://localhost:3000
npm run build   # production build into build/
npm test        # react-scripts test runner
```

The dev server expects the backend to be running (see the Backend README) so API calls succeed.

## Project layout

```
public/   static HTML template and assets
src/
  actions/      Redux action creators (thunks)
  actionTypes/  Redux action type constants
  api/          axios instance/config
  auth/         client-side route-guard helpers (role routing, auth route checks)
  components/   shared UI components (incl. admin/ and auth/ subfolders)
  hooks/        custom React hooks
  pages/        route-level page components (incl. admin/, auth/, legal/ subfolders)
  reducers/     Redux reducers
  store/        Redux store setup
  utils/        formatting and misc helpers
build/    production build output (already built in this copy)
```

## Note

This folder is a copy of the `client/` directory from the original `barber-booking-platform` project, made for backup/separation purposes. `node_modules` was excluded from the copy — run `npm install` before starting the app.
