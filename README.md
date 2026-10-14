# School Games API — local integration test

This repo contains a static frontend and a small local mock API for testing form state, JSON requests, and HTTP error handling. The frontend does not call the live Kahoot bot endpoint.

## Run locally

Requires Node.js 18+.

1. In a terminal, run `node mock-api/server.js`.
2. Open `http://localhost:3001` in your browser.
3. Submit the Game PIN, nickname, and amount. The form sends JSON to `POST /api/session-check`.

The mock API accepts `{ "pin": "123456", "name": "Demo", "amount": 1 }`. It returns:
- `200` for valid sample fields
- `400` when required fields are missing or the amount is outside 1–25
- `404` when the PIN is `404` or the name is `taken`

These predictable cases make it possible to test the UI's success and error states without contacting a live game service.

## Files

- `index.html` — page structure
- `styles.css` — responsive styling
- `app.js` — form validation, fetch call, and response/error rendering
- `mock-api/server.js` — local mock API and static-file server

## Optional API base

The frontend uses `http://localhost:3001` by default. For a different local test server, set `window.SCHOOL_GAMES_API_BASE` before loading `app.js`.
