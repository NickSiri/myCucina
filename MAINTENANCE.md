# myCucina — Maintenance & App Store Readiness Plan

This document is the operational playbook for taking myCucina from a
working prototype to a maintainable product distributed on the Apple App
Store. It is ordered by priority: do the blockers before the polish.

## 1. The release blocker: backend must leave the home LAN

Today the app talks to a Flask server on a Raspberry Pi at
`http://192.168.50.202:5002` (hardcoded in `App.js`, see the `PI_SERVER`
constant). This works only for devices on the developer's WiFi and over
plain HTTP. It cannot ship.

What has to change before submission:

1. **Host the backend in the cloud.** Move `server.py` to a managed host
   (Fly.io, Render, or Railway are all low-effort for a single Flask
   app). Keep the `ANTHROPIC_KEY` as a host-managed environment variable
   exactly as it is on the Pi today — never in the app or git.
2. **Serve it over HTTPS.** Apple App Transport Security blocks cleartext
   HTTP by default. Managed hosts give you a TLS endpoint for free.
3. **Make the base URL configurable.** Replace the hardcoded
   `PI_SERVER` constant with a value read from Expo config
   (`expo-constants` + `app.json` `extra`) so dev/staging/prod can differ
   without code edits.
4. **Add an app-to-backend auth token.** Every endpoint
   (`/suggest`, `/parse-recipe`, `/scan-receipt`, `/parse-order`) is
   currently unauthenticated. Once public, anyone can spend your
   Anthropic credits. Add a shared secret header check on the server and
   send it from the app, plus per-IP rate limiting (Flask-Limiter).
5. **Add structured logging + an error alert.** You need to know when
   Claude calls fail in production. Log request/latency/status and pipe
   crashes to email or a free Sentry tier.

The Raspberry Pi stays useful as a personal dev/staging server.

## 2. Data durability

All user data (inventory, favorites, custom recipes, shopping list)
lives only in on-device AsyncStorage. Deleting the app erases everything,
and there is no multi-device sync or backup.

Recommendation for v1.1: migrate persistence to a hosted backend
(Supabase is the lowest-friction option — Postgres + auth + row-level
security). This also unlocks accounts, which the App Store generally
expects for a subscription product. Until then, document clearly in the
App Store listing that data is device-local.

## 3. Apple App Store submission checklist

- [ ] Apple Developer Program enrollment ($99/yr).
- [ ] EAS Build configured (`eas build -p ios`) — Expo Go is dev-only;
      a real signed build is required.
- [ ] App icon renders (it only shows in a real build, not Expo Go).
- [ ] **Privacy disclosure** for the store-account import feature: the
      app loads a logged-in grocery page in a WebView and sends its text
      to Anthropic for parsing. Apple's privacy questionnaire and review
      will require this to be disclosed. Confirm each grocer's Terms of
      Service permits this before relying on it as a headline feature.
- [ ] Privacy policy URL (required for any app that transmits user data).
- [ ] Subscription configured in App Store Connect ($9.99/mo, $79.99/yr)
      with StoreKit / `expo-in-app-purchases`. Apple takes 15–30%.
- [ ] Camera and photo-library usage strings in `app.json` (receipt
      scanning) — review will reject missing purpose strings.
- [ ] Test on a physical device via TestFlight before public release.

## 4. Engineering hygiene going forward

- **One source of truth for the backend.** `server.py` is now the only
  tracked copy; exported `.rtf` snapshots are gitignored. Edit
  `server.py`, commit it, then deploy — do not hand-edit on the server.
- **Pin the Anthropic model strings in one place.** Model IDs are
  repeated across endpoints in `server.py`. Hoist them to constants so a
  model upgrade is a one-line change. (History shows several wrong model
  strings cost real debugging time.)
- **Keep `npm audit` noise in perspective.** The moderate advisories are
  in dev tooling, not shipped code. Do not run `npm audit fix --force`
  — it breaks the Expo dependency tree. Upgrade via `expo install` only.
- **Add a smoke test before each release.** Minimum manual pass: add an
  inventory item, scan a receipt, import a recipe (paste), run "What can
  I make tonight?", add to shopping list, force-quit and reopen to
  confirm persistence.
- **Branching.** Keep feature work on branches; tag each App Store
  submission (`v1.0.0`, `v1.0.1`, ...) so you can reproduce any shipped
  build.

## 5. Known product gaps (not blockers)

- Imported recipes are saved with empty `keywords`, so they never appear
  in the per-ingredient "Use Soon" suggestions. Consider deriving
  keywords from ingredient names on import.
- `getRecipesForItem` matches by substring on the item name; it is
  intentionally loose and will occasionally over-match. Fine for now;
  revisit if users complain about irrelevant suggestions.
- The built-in recipe database is 10 recipes. Expand it or lean on the
  import feature as the growth path.
