# Chris Tower Defense

Minimal web scaffold for a browser-playable game. Contains a page that shows "Hello World!" and empty CSS/JS files for you to start developing.

Files created:
- index.html
- css/style.css (empty)
- js/main.js (empty)
- js/sw-register.js (registers the service worker)
- sw.js (basic caching service worker)
- manifest.json

See also: `DEV_NOTES.md` for feature tracking and development progress.

Run locally (serves on http://localhost:8000):

```bash
python3 -m http.server 8000

# then open http://localhost:8000 in your browser
```

Notes:
- Service workers require a secure origin; `http://localhost` is treated as secure for development.
- `css/style.css` and `js/main.js` are intentionally empty for you to start coding.
