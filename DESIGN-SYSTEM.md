# Facilities Technology Atlas: Design System

The design rules behind the Al Ghurair Facilities Technology Atlas (Tech Incubation Hub).

- Live site: https://agi-ship-it.github.io/innovations/
- Repository: https://github.com/AGI-ship-it/innovations

---

## 1. Principles

- **Keep it on one screen.** On common laptop and desktop screens, every view fits without scrolling the page.
- **Content cards are flat, floating parts are layered.** Cards don't use gradients or glass. Only the floating parts (side panel, hover cards, tooltips) use shadows.
- **Use pink sparingly.** Brand magenta marks selection, focus and key data. It isn't decoration.
- **Round shapes.** Buttons are pills, icon buttons are circles, and cards have generous corner radii.
- **Text sizes stay consistent.** The same kind of text is the same size everywhere.
- **Accessible by default.** Everything works by keyboard, focus is visible, interactive parts have labels, and reduced-motion settings are respected.

---

## 2. Design tokens

Tokens come from the Figma variables export and are turned into CSS variables. Never edit `tokens.css` by hand.

| File | Role |
|---|---|
| `design-system/tokens.json` | Figma variables export (source of truth) |
| `design-system/build-tokens.py` | Generator that turns each `Group/Name` into `--group-name` |
| `tokens.css` | Generated CSS variables, loaded before `styles.css` |

To update the tokens, re-export the variables from Figma, overwrite `tokens.json`, then run:

```bash
python3 design-system/build-tokens.py
```

### Brand tokens

| Token | Value | Use |
|---|---|---|
| `--page-primary-button` | `#DE0090` | Brand magenta: selected states, focus, highlights |
| `--border-secondary` | `#410266` | Deep purple: galaxy glow, depth |
| `--page-button-hover` | `#30004F` | Darkest purple |
| `--border-primary` | `#71717A` | Neutral grey border |
| `--text-headings` / `--text-body` | `#18181B` | Text on light surfaces |

---

## 3. Colour

### Dark theme (default)

| Role | Value |
|---|---|
| Page and sky | Near-black, `#141218` to `#1d1923` |
| Top bar | `#1a1720`, 1px `#ffffff17` border |
| Card surface | Translucent white, `#ffffff08` to `#ffffff0d` |
| Hairline | `#ffffff12` to `#ffffff1f` |
| Primary text | `#ffffff` / `#f1eaf6` |
| Body text | `#ddd3e6` |
| Muted text | `#a99fb3` / `#bdb4c7` |

### Light theme

Set with `html[data-theme="light"]` and saved in `localStorage` under `atlas-theme`.

| Variable | Value | Use |
|---|---|---|
| `--l-bg` | `#ffffff` | Page |
| `--l-surface` | `#ffffff` | Panels and dialogs |
| `--l-surface-2` | `#f3eef6` | Inputs and switches |
| `--l-line` | `#e5dcea` | Borders |
| `--l-line-2` | `#d7cbe0` | Stronger borders |
| `--l-text` | `#1d1823` | Primary text |
| `--l-text-2` | `#5b5265` | Body text |
| `--l-text-3` | `#877d91` | Muted text |
| `--l-pink-text` | `#b0006f` | Pink text with enough contrast on white |

The logo uses a separate light-mode file, `assets/logo-light.svg`, so the brand pink stays exact. It isn't produced by inverting the colours with a filter.

### Score bands

Every assessment tile uses the same rule, based on the score as a percentage of its maximum.

| Band | Range | Gauge gradient | Label |
|---|---|---|---|
| Low | under 25% | `#e3958c` to `#b9675f` (grey-red) | Low |
| Moderate | 25% to under 50% | `#ffbb3a` to `#ff7a1a` (orange) | Moderate |
| Strong | 50% and above | `#4ade80` to `#14c98b` (green) | Strong |

### Challenge and Outcome cards

| Card | Dark | Light |
|---|---|---|
| Challenge | Orange tint `#ff962e1f`, icon `#ffb562` | `#fff4e8`, icon `#b35a00` |
| Outcome | Green tint `#22c97a24`, icon `#4fe39a` | `#eafaf1`, icon `#0d7d45` |

---

## 4. Typography

- **Font:** Inter (variable, weights 100–900), self-hosted in `assets/fonts/`.
- **Rendering:** standard Inter letter shapes (`font-feature-settings: normal`) and lighter rendering (`-webkit-font-smoothing: antialiased`).
- **Licence:** SIL Open Font License 1.1 (`assets/fonts/Inter-LICENSE.txt`).

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Panel title | 20–24px | 400 | Use-case title |
| Top-bar title | 15–16px | 500 | "Facilities Technology Atlas" or the family name |
| Body | 14px / 1.6 | 400 | Descriptions, steps, value |
| UI | 13px | 400 | Tabs, pills, buttons |
| Meta | 12px | 400 | Domain, rank, index |
| Label | 11px, uppercase, letter-spacing 1–1.6px | 500 | Section headings, band labels |
| Gauge number | 22px | 700 | Assessment tiles |

Display titles show "and" as "&". Long titles use `text-wrap: pretty`.

---

## 5. Shape, spacing and elevation

| Element | Radius |
|---|---|
| Buttons, tabs, pills, search | `999px` (pill) |
| Icon buttons | `50%` (circle) |
| Cards and tiles | `14–16px` |
| Side panel | `28px` |
| Top bar | `999px` |

- **Content width:** 1240px for the top bar, the navigation rows and the footer, with 22px inner padding.
- **Gaps:** 6px between pills and 8–10px between cards. Sections are separated by 18–24px.
- **Elevation:** cards have none. The top bar and side panel have one soft neutral shadow, with no coloured glow.

---

## 6. Components

### Top bar
The bar has a solid surface and a soft border, with no frosted glass. From left to right it holds:
- the logo
- a divider
- the title with "Tech Incubation Hub" underneath
- the Service / Internal switch with counts
- an info icon for the selected collection
- search (⌘K)
- the theme, motion and About icon buttons

### Tabs and pills
Plain text with a count, used in:
- the maturity filter
- the home page family tabs
- the side panel section tabs
- the collection switch

| State | Look |
|---|---|
| Default | Text only, `#bdb4c7` |
| Hover | Soft background, `#ffffff0d` |
| Selected | Magenta tint (12%) with a 1px magenta inset outline (45%) |
| Disabled | Dimmed and can't be clicked |

Rows never wrap. When the items don't fit, the row scrolls sideways and fades out over the last 56px on the right, and a vertical mouse wheel scrolls it sideways.

### Home page family tabs
"All families" comes first and is selected, followed by each family with its case count, largest first. Hovering a tab lights up that family's planet in the galaxy, and clicking it opens the family.

### Family navigation row
The back link (← Service technologies), a divider and the maturity tabs share one line.

### Hover preview card
An almost solid card that appears beside a planet. It is placed to the right, below, to the left or above, in that order of preference, so it never covers the item you're pointing at. It has one action button.

### Side panel (use case)
- **Shape:** floats 12px in from the screen edges, with 28px rounded corners, a hairline border and a neutral shadow. It fills the screen on phones.
- **Opening:** it slides in, scaling up from 96% while coming into focus. Next and Previous only change the content inside.
- **Header:**
  - a kicker line (case number · domain)
  - the pager (‹ 1 / 25 ›), kept separate from the close button
  - the title
- **Section tabs** stay at the top of the scrolling area.
- **Intro text** shows three lines with "…" and expands when clicked.

### Assessment tiles
- **Gauge:** a half circle (viewBox `0 0 100 56`, radius 38, stroke 6, rounded ends) with a grey track and a gradient fill.
- **Contents:** a large number, "of N", a label and a band pill.
- **Order:** Maturity, Priority, Viability, Feasibility.
- **Border:** a light pink border on each tile.
- **Header summary:** "Stage · Rank #N of M".

### Steps
- **Number markers:** "Step" on top with the number below.
- **Connector:** the markers are joined by a 2px dashed magenta line.
- **Text:** each step's text sits in a flat card beside its marker.

### Challenge → Outcome
- **Layout:** two cards with an arrow between them. They stack vertically on screens under 600px.
- **Badges:** each card has a round icon badge, a warning triangle or a check mark.
- **Text:** the repeated lead-ins "The output is…" and "It is needed because…" are trimmed for display only.

### Value realised
A light pink tint and border, with the note "Reported benchmark".

### Dropdowns (Index filters)
- **Enhancement:** the custom list box in `select.js` wraps the native `<select>`, which stays the source of truth.
- **Keyboard:** arrow keys, Home, End, Enter, Space, typing to jump to an option, and Esc.

### Search
- **Shape:** a pill-shaped field with a custom clear button.
- **Reset:** sits 8px from the field.

---

## 7. Motion

| Interaction | Animation |
|---|---|
| Side panel opens | 480ms, `cubic-bezier(.16,1,.3,1)`: moves in from 56px to the right, scales from .96 to 1, blur goes from 6px to 0 |
| Next or previous case | 280ms: content moves in from ±28px to the side and fades in |
| Planets | Slow orbital movement that pauses on hover or keyboard focus |

The Pause motion button stops all movement. `prefers-reduced-motion` turns animations off.

---

## 8. Iconography

- **Library:** Lucide icons, v1.67.0, ISC licence, saved in the repo at `assets/vendor/lucide.min.js`.
- **Helpers:** `window.icon(name, className)` and `setIconLabel(node, label, icon, side)` in `icons.js`.
- **Decorative only:** icons are hidden from screen readers (`aria-hidden`), and the labels carry the meaning.
- **External links:** always use `external-link`.

---

## 9. Accessibility

- **Keyboard:** every control works with the keyboard. In the side panel, ← and → move between cases and Esc closes.
- **Focus:** a visible 2px magenta outline.
- **Screen readers:** descriptive `aria-label`s on gauges, tiles, tabs and pills, and `aria-pressed` / `aria-current` for selection.
- **Colour:** the band colour always comes with a text label (Low, Moderate or Strong).
- **Light mode:** uses `--l-pink-text` (`#b0006f`) for pink text so it stays readable on white.

---

## 10. Technical constraints

- **No build step:** plain HTML, CSS and JavaScript.
- **Content Security Policy:**
  - `script-src 'self'`, `style-src 'self'`
  - no inline scripts and no `style=""` attributes
  - dynamic values are set with CSSOM (`style.setProperty`)
- **Self-hosted:** all assets, fonts and icons are in the repo.
- **Cache busting:** `?v=` query strings in `index.html`. Change the value whenever the file changes.
- **Deployment:** GitHub Pages through `.github/workflows/deploy.yml` on every push to `main`. It uses `actions/checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3` and `deploy-pages@v4`.

---

## 11. File map

| File | Purpose |
|---|---|
| `index.html` | Page structure and security policy |
| `tokens.css` | Generated design tokens |
| `styles.css` | All styles, including light mode |
| `theme.js` | Light/dark theme, applied before first paint |
| `icons.js` | Lucide helpers |
| `app.js` | State, navigation, side panel, Index |
| `family-map.js` | Home galaxy and family layout |
| `solar.js` | Use-case orbits inside a family |
| `orbit-layout.js` | Orbit maths |
| `select.js` | Accessible custom dropdowns |
| `data.js` | Use-case data |
| `assets/` | Logos, planets, fonts, vendor scripts |
