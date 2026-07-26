# 🌾 Agriculture Supporter — Frontend

A complete, responsive frontend for a DBMS project that helps farmers with
**crop production** and **animal husbandry** decisions, plus a **search by
location** recommendation tool. Built with plain HTML/CSS/JS + Bootstrap 5,
designed to be dropped in front of a MySQL-backed API with minimal changes.

## Folder structure

```
agriculture-supporter/
├── index.html                 Landing page (hero, about, features, contact)
├── auth.html                  Login / Signup + creators + contact us
├── dashboard.html             Post-login hub with 3 image navigation cards
├── animal-husbandry.html      Animal category grid
├── animal-category.html       Animals within a category (?category=slug)
├── animal-details.html        Full care guide for one animal (?animal=slug)
├── crop-production.html       Crop category grid
├── crop-category.html         Crops within a category (?category=slug)
├── crop-details.html          Full growing guide for one crop (?crop=slug)
├── search-location.html       State/location based recommendations
├── assets/
│   ├── css/main.css           Design tokens, hero, leaf-cards, chatbot, etc.
│   └── js/
│       ├── data.js            Data-access layer (see below) — swap this file
│       ├── main.js            Shared behaviour (reveal-on-scroll, navbar, etc.)
│       ├── auth.js            Login/Signup form logic
│       ├── chatbot.js         Floating assistant widget
│       ├── dashboard.js       Dashboard auth-guard + greeting
│       ├── animal-husbandry.js
│       ├── crop-production.js
│       └── search-location.js
└── backend/
    └── schema.sql             MySQL schema mirroring the data used above
```

## How authentication works today (and how to connect MySQL)

`assets/js/data.js` exposes `agSignup()` and `agLogin()` as `async`
functions. Right now they read/write a mock `users` table in
`localStorage` so the whole demo runs without a server. Every function is
already shaped like an API call — swapping to a real backend means:

1. Stand up an API (Node/Express, PHP, Django, etc.) connected to the
   MySQL database created from `backend/schema.sql`.
2. In `data.js`, replace the body of `agSignup`/`agLogin` with a `fetch()`
   call to `POST /api/auth/signup` / `POST /api/auth/login`.
3. Have the server hash passwords (bcrypt) and return a session
   token/JWT; store that instead of the plain user object.
4. Everywhere else in the app (`getAnimalCategories`, `getCropsByCategory`,
   `getLocationRecommendation`, etc.) has the same pattern — look for the
   `// BACKEND HOOK` comments in `data.js` for the exact line to change.

No other file needs to change, since every page calls these same
functions rather than touching `localStorage` or fetch directly.

## Design notes

- **Leaf-corner cards**: every clickable image card (categories, animals,
  crops, dashboard hubs) uses one asymmetric leaf-tip corner via
  `clip-path`, so image-based navigation is visually consistent site-wide.
- **Field-row hero**: the landing page hero uses layered horizontal bands,
  a drifting sun, and rising leaf/wheat particles instead of a flat
  gradient, to keep the agricultural motif front and centre.
- **Palette**: forest greens, wheat gold, sage and soil brown — defined as
  CSS variables at the top of `assets/css/main.css` for easy re-theming.
- Animations respect `prefers-reduced-motion`, and all interactive
  elements have visible keyboard focus states.

## Running locally

No build step is required — open `index.html` in a browser, or serve the
folder with any static server, e.g.:

```
npx serve .
```

Log in or sign up on `auth.html` (an account is created in your browser's
localStorage on first signup) to unlock the dashboard and the rest of the
authenticated pages.
