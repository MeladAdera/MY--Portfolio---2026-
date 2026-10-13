# Melad Adera — portfolio

A plain website: HTML, CSS and JavaScript. No framework is needed to run it.

| Page | File | What it is |
|---|---|---|
| Home | `index.html` | The 3D builder scene, "Who am I?", work in progress |
| Work | `work.html` | The three projects, and Contact at the end (`work.html#contact`) |
| Story | `story.html` | The 3D climb with the six steps |

## Open it in VS Code

1. Unzip the folder and open it in VS Code: **File → Open Folder…**
2. Install the extension **Live Server** (by Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**. The site opens in your browser and reloads when you save a file.

Or, with Node.js installed, run this in the VS Code terminal:

```
npm install
npm start
```

Then open the address it prints (usually http://localhost:3000).

Please use Live Server or `npm start` instead of double-clicking the file. The email "Copy" button only works on `http://localhost` or `https://`.

## Where to change things

| You want to change | Edit |
|---|---|
| Text on a page | `index.html`, `work.html`, `story.html` |
| Colours, fonts, spacing | `css/home.css`, `css/work.css`, `css/story.css` |
| Page behaviour (copy button, scroll, play button) | `js/home.js`, `js/work.js`, `js/story.js` |
| The 3D scenes | `src/home-3d/` and `src/story-3d/` (see below) |

Fonts are **Literata** (titles and reading text) and **Instrument Sans** (menus, labels, buttons). They load from Google Fonts in the `<head>` of each page.

The colours of the Home page change with the 3D scene, from warm light to dark. That is done in `js/home.js` (the `paint` function), so `css/home.css` only has the starting colours.

## Changing the 3D scenes

The files `js/builder.bundle.js` and `js/story.bundle.js` are **built** files. Don't edit them by hand. Edit the sources in `src/`, then rebuild:

```
npm install      (only the first time)
npm run build
```

Each scene is a few files joined in order and bundled with three.js (version 0.165):

- `src/home-3d/`: `a-base` (helpers, materials), `b-char` (the drawn figure), `c-seq` (the table, board and the 24-second loop), `d-shader` (the pencil look), `e-mount` (scene, lights, camera, theme)
- `src/story-3d/`: `a-base`, `b-char` (the man), `c-stairs` (staircase, the six stops and their timing), `e-mount` (scene, light, camera, scroll)

To make the climb slower or faster, change `PAUSES` (how long each stop lasts) and `PACE` (step speed) in `src/story-3d/c-stairs.js`.

## Put it online

The folder is a static site. On Vercel, create a new project from this folder (or a GitHub repo with it). No build command is needed, and the output folder is the root.
