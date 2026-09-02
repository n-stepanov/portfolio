# Nikolai Stepanov Portfolio

Minimal static portfolio prototype for a composer and sound designer.

## Run locally

```bash
python3 server.py
```

Open `http://127.0.0.1:4173`.

The custom server keeps clean URLs working locally, including `/projects/conny-spec-film` and `/about`.

## Content

Project content lives in `src/data/projects.js`.

- Preserve the project order in that file.
- Add or replace thumbnails through the `thumbnail` field.
- Replace FRAME placeholders by changing each `media` item from `placeholder` to `vimeo` or `youtube`.
- Replace placeholder contact links in the exported `contact` object.
