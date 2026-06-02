# FPA — Financial Performance Dashboard

Self-hosted wrapper for the GP / ATL / Consolidated financial dashboard.
Same "system" as `eagle`: an Express server serves `index.html`, with an
optional PIN gate and anti-crawl headers. **To update the dashboard, just
replace `index.html`.**

## Run locally

```bash
npm install
npm start
# open http://localhost:3000
```

The PIN is **OFF** by default, so `/` serves the dashboard directly.

## Update the dashboard

Replace the HTML and (optionally) deploy:

```bash
# manual
cp "path/to/new_dashboard.html" index.html

# or use the helper (copies + commits + pushes to GitHub & Heroku)
./update_dashboard.sh "path/to/new_dashboard.html"
```

## Turn the PIN back on

The PIN gate (`views/pin.html`) and all its server logic are kept intact —
they're just bypassed while `PIN_ENABLED=false`. To re-enable:

```bash
# local: edit .env
PIN_ENABLED=true
DASHBOARD_PIN=123456      # your chosen PIN (the pad supports up to 6 digits)

# Heroku:
heroku config:set PIN_ENABLED=true DASHBOARD_PIN=123456
```

With the PIN on, unauthenticated visitors are redirected to `/pin`, and
`/logout` clears the session.

## Files

| File             | Purpose                                              |
|------------------|------------------------------------------------------|
| `server.js`      | Express server + PIN toggle + anti-crawl headers     |
| `index.html`     | The dashboard (replace this to update)               |
| `views/pin.html` | PIN gate page (themed to match the dashboard)        |
| `.env`           | Local config (PIN off by default) — not committed    |
| `Procfile`       | Heroku process definition                            |

## Notes

- The dashboard's in-page **Highlights** note has its own save/lock
  (password `FPA`) — that is separate from the system PIN and left as-is.
