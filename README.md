# Auren Research — Pitch Deck

Keyboard-navigable investor pitch deck. Static HTML/CSS/JS — no build step.

## Local preview

```bash
# From this directory
python3 -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly in a browser.

## Navigation

| Input | Action |
|-------|--------|
| `→` `↓` `Space` `PageDown` | Next slide |
| `←` `↑` `PageUp` | Previous slide |
| `Home` / `End` | First / last |
| On-screen arrows + dots | Click to navigate |
| Swipe / scroll wheel | Next / previous |

Deep links: `#1` … `#10`

## GitHub Pages

1. Create a repo (e.g. `auren-research.github.io` or any repo).
2. Push this folder to the repo root (or `/docs`).
3. **Settings → Pages → Source:** Deploy from branch `main` / root (or `/docs`).
4. Site will be live at `https://<user>.github.io/<repo>/`.

No npm, no bundler, no CI required.

## Structure

```
index.html          # 10 slides
style.css           # Art system + transitions
script.js           # Nav, charts, glyph fields
assets/
  hero-title.jpg    # Silicon wafer → glyphs (signature)
  hero-problem.jpg  # Terminal / access denied
  hero-solution.jpg # Fiber optic connector
  hero-engine.jpg   # Layered data wafers (Argus)
  hero-moc.jpg      # Expert collaboration graph
  hero-lunaris.jpg  # Amber particle shield
  hero-business.jpg # Subscription token
  hero-team.jpg     # Two brass keys
  hero-ask.jpg      # Empty rack, single amber LED
  hero-closing.jpg  # Quiet padlock bookend
```

## Art system

- Background `#0a0a0a` · text `#f2ede4` · accent amber phosphor `#ffb000`
- **Fraunces** (display) · **JetBrains Mono** (labels/data) · **Inter** (body)
