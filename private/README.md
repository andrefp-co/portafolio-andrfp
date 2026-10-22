# Restricted vault media

Files in this folder are served only to signed-in vault sessions, by
`app/api/vault/media/[name]/route.js`. **They are not in git**: this
repository is public, and anything committed here would be public too.

Expected files:

| File | What |
|---|---|
| `andres-pena-cv.pdf` | Engineering CV (download) |
| `andres-pena-cv-1.jpg` | CV page 1 as an image (shown in the file) |
| `x8-board-review.mp4` / `.webm` / `.jpg` | X8 flight-controller layout clip and poster |

Two ways to provide them in production:

1. **Copy them onto the server** next to the app (`/app/private/vault/` in the
   Docker image, or the project root on a VM).
2. **Private storage**: upload them to a private bucket and set
   `VAULT_MEDIA_URL` (base URL) and, if the bucket needs it,
   `VAULT_MEDIA_TOKEN` (sent as a Bearer token). The route fetches from there
   when a file is missing on disk, so the bucket URL never reaches visitors.
