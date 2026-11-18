---
name: PAL
description: A personal anime watchlist that plays like a game's title menu, cut from red, ink and paper.
colors:
  red: "#D7141A"
  red-band: "rgb(0 0 0 / .09)"
  red-hot: "#FF3B3F"
  ink: "#0B0B0D"
  ink-2: "#1C1C21"
  ink-3: "#34343B"
  ink-muted: "#BDBDC6"
  paper: "#F4F1EA"
  paper-dim: "#D9D4C9"
  paper-muted: "#4A4A52"
typography:
  ransom:
    fontFamily: "Anton, Abril Fatface, Archivo Black, Bowlby One SC, Dela Gothic One"
    fontSize: "clamp(48px, 7.4vw, 104px)"
    fontWeight: 400
    lineHeight: 1
  logo:
    fontFamily: "Anton, Abril Fatface, Archivo Black, Bowlby One SC, Dela Gothic One"
    fontSize: "clamp(64px, 7.4vw, 112px)"
    fontWeight: 400
    lineHeight: 1
  menu-entry:
    fontFamily: "Anton, Abril Fatface, Archivo Black, Bowlby One SC, Dela Gothic One"
    fontSize: "clamp(30px, 3vw, 44px)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "clamp(26px, 3vw, 42px)"
    fontWeight: 400
    lineHeight: 1.1
  detail-title:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 52px)"
    fontWeight: 400
    lineHeight: 1.08
  row-title:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 900
    lineHeight: 1.25
  body:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
  body-strong:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.5
  button:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    letterSpacing: ".06em"
  label:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: ".08em"
  numeral:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "58px"
    fontWeight: 400
    lineHeight: 0.9
  file-no:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "88px"
    fontWeight: 400
    lineHeight: 0.8
  clock:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "clamp(72px, 8vw, 128px)"
    fontWeight: 400
    lineHeight: 0.9
  stamp:
    fontFamily: "Anton, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 400
  key:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 900
rounded:
  none: "0px"
spacing:
  tight: "6px"
  row: "14px"
  gutter: "24px"
  section: "32px"
  shell: "48px"
  strip: "52px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "52px"
  button-primary-on-paper:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.red-hot}"
    textColor: "{colors.ink}"
  button-small:
    padding: "0 18px"
    height: "44px"
  menu-entry-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.menu-entry}"
    padding: "10px 76px 10px 20px"
  section-tab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    padding: "0 14px"
    height: "36px"
  section-tab-current:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  save-slot-hero:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "34px 48px 36px 34px"
  save-slot-row:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "14px 34px 14px 20px"
  slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "26px 30px 28px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "0 18px 0 22px"
    height: "60px"
  stamp-clear:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.red}"
    typography: "{typography.stamp}"
    padding: "6px 14px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "12px 12px 12px 22px"
---

# Design System: PAL

## Overview

**Creative North Star: "The Title Menu"**

PAL opens on a game's title screen, not a dashboard. The left half is the main menu: a ransom-note `PAL` logo and four entries, `01 CONTINUE`, `02 NEW GAME`, `03 LOAD GAME` and `04 PLAYER DATA`. The selected entry is struck through with an ink banner and an arrow. The right half shows the latest save behind a diagonal cut: its poster in black and white halftone, the file number in huge outline numerals, and a paper slip carrying the title, the episode readout, memory blocks and **Watched EP n**. The daily loop stays one press long, even from the title screen.

The four entries are sections of a save file. Every anime on the list is a save file with a permanent number, a play time, a last-saved time and progress drawn as memory blocks. A finished file gets a CLEAR! stamp that slams on.

The world is a red poster. The page is a red ground cut by darker diagonal bands. Ink slabs and off-white paper slips sit on it at slight tilts. Screen titles are ransom-note lettering, each letter cut from a different face. Poster art supplies every other colour.

The menu shapes how the app behaves:
- Arrows move, Enter opens, Esc backs out (a section returns to the title screen and the cursor lands on the entry you came from).
- 1–4 jump straight to a section, / opens the search, + logs an episode (from the title screen it logs the latest save), U undoes.
- A wipe of paper, ink and hot red crosses the page on every screen change; the new screen appears behind the ink slab, its title drops in letter by letter and its panels are dealt in.

The look is inspired by the energy of stylish game menus, and it is PAL's own: no franchise characters, logos, calling cards or star emblem. The big art is always the owner's own anime.

**Key characteristics:**
- Red ground, ink slabs, paper slips; hot red only as an accent on ink
- Ransom-note lettering for the logo, menu entries and screen titles only; content is set in readable faces
- Outline numerals as PAL's emblem: file numbers, row numbers, the big number behind the latest save
- Everything leans: skewed buttons, tabs and tags, tilted slips and posters, trapezoid slab cuts
- Flat: no soft shadows, gradients or blur; depth comes from ink and paper against red

## Colors

### Grounds
- **Red** (#D7141A): the page. Diagonal bands of black at 9% cross it at 115°. Paper text on it reads 5.3:1.
- **Ink** (#0B0B0D): rows, empty states, Player data boxes, the toast, the guide bar and the menu banner. **Ink 2** (#1C1C21) is hover on ink; **Ink 3** (#34343B) is unfilled blocks and bars on ink.
- **Paper** (#F4F1EA): the hero save slot, the title slip, the save panel, dialogs, the data box, primary buttons on red and ink. **Paper dim** (#D9D4C9) is unfilled blocks on paper.

### Text
- On red: paper only. There is no muted text on red; hierarchy comes from size and weight.
- On ink: paper, with **Ink muted** (#BDBDC6, 10:1) for secondary text.
- On paper: ink, with **Paper muted** (#4A4A52, 7.9:1) for secondary text.

### Accents
- **Red hot** (#FF3B3F): the accent on ink. Numbers in the section tabs, the latest-episode block, genre bars, score columns, record headings, the hover of primary buttons on red and ink. It reads 5.6:1 on ink.
- **Red** (#D7141A) on paper: the latest-episode block, percentages, the slip kicker, the CLEAR! lettering. It reads 4.7:1 on paper.

### Named rules
**The Context Flip Rule.** Every surface sets its own tokens (`--fg`, `--muted`, `--track`, `--fill`, `--pri-bg`, `--pri-fg`, `--ring`). The red ground and ink flip to paper text; paper flips to ink text. Never hard-code a text colour that only works on one side.

**The Posters Bring the Colour Rule.** Anime posters are the only multicolour on screen. The title art is the latest poster in black and white with a red halftone.

## Typography

**Ransom set:** Anton, Abril Fatface, Archivo Black, Bowlby One SC and Dela Gothic One, cut letter by letter. **UI face:** Anton (condensed caps). **Title face:** Dela Gothic One. **Body face:** Zen Kaku Gothic New 500, 700 and 900.

### Ransom lettering
Used for the `PAL` logo, the four menu entries and the screen titles, nowhere else. Each letter is its own tile, from three kinds only: paper with ink, ink with paper, and red with paper lettering and an ink edge (the mix the owner picked from LOAD GAME). No two neighbouring letters share a kind. Each takes a face, a tilt (±8°, ±5° on the menu) and a size (0.84–1.14em) from a deterministic hash, so a word always cuts the same way on the server and in every browser. The first letter is always a paper tile. Screen readers get the plain word once; the tiles are hidden.

### Hierarchy
- **Screen titles** (ransom, `clamp(48px, 7.4vw, 104px)`), **logo** (ransom, up to 112px), **menu entries** (calm ransom, `clamp(30px, 3vw, 44px)`).
- **Anime titles**: Dela Gothic One, 26–42px on the hero and slip, 32–52px on details. Never ransom: content must read.
- **Row titles**: Zen Kaku 900, 20px (17px on phone).
- **Body**: Zen Kaku 500, 16px, line-height 1.6; synopses 18px at 700; readouts 15px at 700 with tabular figures.
- **Chrome**: Anton uppercase with .06–.1em tracking for buttons (20px; 17px small), tabs (18px), labels (15px), section tags (22px), the guide (14px).
- **Numerals**: Anton outline numerals for file numbers (88px hero, 64px panel), row numbers (58px) and the big title number (up to 260px). The play-time clock is Anton up to 128px.

### Named rules
**The Ransom Is Chrome Rule.** Ransom lettering names places (PAL, the four sections). It never carries content, data or controls.

**The Caps Are Chrome Rule.** Uppercase belongs to buttons, tabs, labels, section tags and the stamp. Content stays in sentence case.

## Layout

Fixed **top strip** (52px; 48px on phone): the `PAL // SAVE SELECT` tag links home on the left; the four section tabs sit in the middle (hidden on the title screen, which draws the big menu); `LOCAL SAVE · N FILES` sits on the right. Inside a section the strip turns solid red so content scrolls under it cleanly.

Fixed **guide bar** (52px, ink) at the bottom: kbd keys with their actions for the current screen, and the clock on the right. Hidden on phone.

**Title screen**: a two-column grid, 46/54. The left column centres the logo and the menu. The right column is a paper band cut on a diagonal, the latest poster behind it, the outline file number top-right and the slip bottom-left, tilted −2.2°.

**Sections**: a centred 1280px column with 48px side padding. Screens stack 32px apart; rows sit 14px apart; poster cards auto-fill 176px columns. File details is poster, head and save panel in three columns (two below 1180px).

**Phone (below 1024px)**: one column with 16px gutters. The section tabs become a fixed 60px ink bottom bar with icons and 12px labels; the current one is red. The title screen stacks logo, menu, then the latest save, so **Watched EP n** stays in the first screen. The toast moves to the top. Tabs and chips scroll sideways; New game's filters sit behind a toggle.

## Elevation & Depth

Flat. Depth is ink and paper against red, and tilt. No box shadows except one 1px rule under the solid top strip; no gradients except the halftone dots and the stripe bands; no blur.

## Shapes

Every radius is 0. Shapes are cut and leaned.
- **Skew**: buttons, tabs, chips, tags, kbd keys, the search field and the section tabs lean −10° to −12°, with their text counter-skewed upright.
- **Slabs**: rows are trapezoids that alternate their lean down a list; the hero is cut on the right (97% at the bottom); empty states and Player data boxes take a small bottom-right cut.
- **Tilt**: the title slip −2.2°, the hero poster −3°, the details poster −3° in a 6px paper frame, cleared posters alternate −3° and 2.5°.
- **Memory blocks**: discrete blocks leaning −20°, one per episode up to 26; the latest watched block is red. Longer series draw two segments.

## Components

### Buttons
- **Primary**: paper on red and ink, ink on paper. Hover turns hot red (on red and ink) or red (on paper). Press sinks 2px.
- **Outline**: a 3px inset border in the current text colour; hover fills it.
- **Muted**: ink 2, for tertiary actions. On the save panel, Delete file is an ink outline.
- **Small**: 44px tall, the minimum target.

### Title menu (signature)
Each entry is a number, a calm ransom label and a one-line description that appears when the entry is selected. The selected entry gets an ink banner that grows from the left (220ms), a paper arrow and a broken paper border (the same one selected slots use). Hover moves focus, so the cursor and the keyboard never disagree. Arrows wrap.

### Section tabs
Ink parallelograms in the top strip with a hot red number; the current section is paper with a red number. On phone, a bottom bar.

### Save slots
- **Hero (Continue)**: paper, poster tilted with an ink frame, outline file number, play time and last saved, the title, the episode readout with percent, memory blocks, **Watched EP n** and **Open file**.
- **Row (Continue, Load game)**: ink trapezoid, outline row number that turns hot red on hover and focus, poster, title, readout, blocks, and **+1 EP** or **Start**.
- **Poster card (New game, recommendations, cleared wall)**: a parallelogram poster with an ink title strip overlapping its foot, meta, then one action or a status tag.
- **Selection** (hover and arrow keys look the same; hovering a slot selects it, so there is only ever one cursor): the title menu's broken border, owner-approved and kept exactly: a 4px border 8-9px outside the slab, cut by a slanted clip (10px down at the top left, 16px in at the bottom right, 8px in at the bottom left) so it shows as long pieces, never a closed box. Rows take it in paper; the featured hero on Continue takes it in ink. A poster card gets a parallelogram frame, ink outside and paper inside, lifts 4px and tilts, and its title strip turns paper.

### CLEAR! stamp (signature)
Paper tile, red Anton lettering, a 3px ink edge, rotated −8°. When a file clears, the slot floods red with ink rays (760ms) and the stamp slams in from 3× scale (460ms, after 260ms).

### Toast
An ink slab bottom-left (top on phone) with the message and, when it applies, a paper **Undo U** button. Undoable toasts stay 6 seconds.

### Dialog
Paper, slightly cut, over an 80% ink backdrop. Destructive questions name the file and put focus on **No**.

## Motion

- **Screen wipe** (620ms, `cubic-bezier(.7, 0, .3, 1)`): paper, ink and a narrow hot red band sweep left to right, skewed −18°. The new screen appears at 260ms, behind the ink.
- **Title drop**: ransom letters drop in 28ms apart after the wipe, from a counter-tilt and 1.4× scale (420ms).
- **Deal-in**: slabs, cards and menu entries slide 40px from the left and fade in, a few at a time (380ms).
- **+1**: a red frame flashes inside the slot and the new block pops (380–420ms).
- **Reduced motion**: the wipe becomes a short fade through ink; every entrance becomes a 240ms fade.

## App icon

- **Browser tab** (`src/app/favicon.ico` at 16, 32 and 48px, `src/app/icon.png` at 192px): one paper tile with an ink Anton **P**, tilted −6° on red. It stays readable at 16px.
- **Home screen** (`src/app/apple-icon.png`, 180px): the full ransom **PAL** (a paper tile with an Abril Fatface P, an ink tile with an Anton A, a red tile with an ink edge and an Archivo Black L) on the striped red ground.

## Do's and Don'ts

### Do:
- **Do** keep **Watched EP n** one press from the title screen and the + key working there.
- **Do** flip tokens by context; check contrast on red, ink and paper separately.
- **Do** keep ransom lettering to the logo, menu entries and screen titles.
- **Do** use the owner's posters as the only imagery.
- **Do** keep touch targets at least 44px and every write undoable.

### Don't:
- **Don't** use any game franchise's characters, logos, calling cards or star emblem.
- **Don't** set anime titles, data or controls in ransom lettering.
- **Don't** put muted or red text on the red ground; it fails contrast.
- **Don't** add soft shadows, glows, blur or rounded corners.
- **Don't** set content in uppercase.
