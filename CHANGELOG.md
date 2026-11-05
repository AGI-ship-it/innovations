# Changelog

## Facilities Technology Atlas: interface enhancements (November 2026)

- Live site: https://agi-ship-it.github.io/innovations/
- Repository: https://github.com/AGI-ship-it/innovations
- Design system: [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)

### Overall look

- **Font:** Inter, self-hosted, with standard letter shapes and lighter text rendering on Mac.
- **Text sizes:** consistent throughout: 14px body, 13px controls, 12px small text, 11px uppercase labels.
- **Light mode:** a sun/moon switch that is remembered between visits, with a white background and thin grey borders.
- **Light-mode logo:** its own logo file, so the brand pink stays exact.
- **Flat style:** flat content cards, with no gradients or heavy pink glow.
- **Rounded shapes:** pill buttons, round icon buttons and rounded cards.
- **Motion:** a Pause motion button, and reduced-motion settings in the operating system are respected.

### Top bar

- **Surface:** solid background with a soft border, no frosted glass.
- **Size:** narrower (1240px), centred, and a little taller.
- **Branding:** larger logo, then a thin divider, the title, and "Tech Incubation Hub" underneath.
- **Simplified:** the Preview badge was removed.
- **Collection switch:** Service / Internal with case counts.
- **Collection info:** an info icon next to the switch that explains each collection.
- **Search:** a pill-shaped search box that opens from anywhere with ⌘K.
- **Icon buttons:** theme, motion pause and About, each with a tooltip.

### Home page

- **Family tabs:** "All families" and each family with its case count, for whichever collection is selected.
- **Tab row:** stays on one line, scrolls sideways and fades at the right edge.
- **Linked hover:** hovering a tab lights up that family's planet in the galaxy.
- **Galaxy:** fits on one screen, with a softer brand glow behind it.
- **Hover cards:** a preview card appears on hover, placed so it doesn't cover what you're reading.
- **Footer:** narrower and lined up with the header.

### Technology family view

- **Navigation row:** the back link, a divider and the maturity tabs share one line.
- **Maturity tabs:** pill style with counts, and they scroll sideways if they don't fit.
- **Alignment:** the row lines up with the header.
- **Centre planet:** shows the Al Ghurair diamond mark.
- **Layout:** planets are spread out to fit on one screen.

### Use-case side panel

- **Panel:** floats with rounded corners and a smooth slide-in animation.
- **Case switching:** Next and Previous change only the content, and the panel stays put.
- **Pager:** "‹ 1 / 25 ›" is kept separate from the close button.
- **Close:** returns you to the planet or the Index row you came from.
- **Shortcuts:** arrow keys go to the previous or next case, and Esc closes.
- **Header:** the chips were removed, and long titles wrap neatly.
- **Section tabs:** Scores, How it works and Value realised stay at the top while you scroll.
- **Intro text:** shows three lines with "…" and expands when clicked.

### Assessment

- **Gauge tiles:** half-circle gauges with rounded ends, a gradient, a big number and "of N".
- **Order:** Maturity, Priority, Viability, Feasibility.
- **Colour rule:** under 25% Low (grey-red), 25–50% Moderate (orange), 50% and above Strong (green).
- **Summary:** "Stage · Rank #N of M" in the section header.
- **Score guide:** a "How to read the scores" panel that opens when clicked.

### How it works

- **Steps:** numbered "Step 1, 2, 3" markers joined by a dashed line.
- **Challenge → Outcome:** an orange card and a green card joined by an arrow.
- **Wording:** the repeated lead-ins are trimmed for easier reading.

### Value realised

- **Highlight:** a light pink tint and border so the benefit stands out.
- **Label:** "Reported benchmark".

### Use-Case Index

- **Dropdowns:** custom styled, with full keyboard support.
- **Search:** a pill-shaped search box with Reset next to it.
- **Cards:** flat, with the title first and the details underneath.

### Content

- **Titles:** "and" is shown as "&".
- **Workbook references:** all removed, including the sheet and row lists.
- **About dialog:** rewritten and simplified.
- **External links:** shown with an external-link icon.

### Accessibility

- **Keyboard:** every control works with the keyboard and shows a visible focus outline.
- **Screen readers:** descriptive labels on gauges, tabs, pills and buttons.
- **Colour:** score colours always come with a text label.
- **Readability:** consistent sizes, normal-weight text, and accessible pink text in light mode.

### Design system

- **Tokens:** Figma variables export (`design-system/tokens.json`), converted into `tokens.css` by `build-tokens.py`.
- **Brand colours:** magenta `#DE0090`, and purples `#410266` and `#30004F`.
- **Documentation:** [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) covers principles, colour, type, spacing, components, motion, icons and accessibility.

### Libraries and assets

- **Lucide icons:** v1.67.0, ISC licence, saved in the repo.
- **Inter font:** variable weight, SIL Open Font License 1.1, self-hosted.
- **No framework:** plain HTML, CSS and JavaScript, with no build step.

### Publishing

- **Hosting:** GitHub Pages, which updates automatically on every push to `main`.
- **Workflow:** `.github/workflows/deploy.yml`.
- **Security:** a strict Content Security Policy, with no inline scripts or styles and every asset self-hosted.
