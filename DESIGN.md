---
name: PAL
description: A personal anime watchlist that plays like a game's save-select screen, drawn as a manga page.
colors:
  page-ink: "#0F0F12"
  ink: "#141418"
  paper: "#F3F3EF"
  paper-lit: "#FFFFFF"
  signal-yellow: "#FFD60A"
  signal-yellow-hover: "#FFE24D"
  gutter-track: "#2B2B33"
  gutter-line: "#3C3C46"
  gutter-slate: "#8A8A94"
  gutter-muted: "#A9A9B2"
  paper-muted: "#55555E"
  paper-track: "#D6D6D0"
  paper-line: "#B5B5AE"
  paper-slate: "#6E6E76"
typography:
  display:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "58px"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "1px"
  title:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.12
  section:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.2
  title-row:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
  button:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "2px"
  label:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "2px"
  meta:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  clock:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
  stamp-large:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 400
  numeral:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
  heading-small:
    fontFamily: "Dela Gothic One, Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.15
  body-large:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.6
  key:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "1px"
  caption:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
rounded:
  none: "0px"
spacing:
  block: "4px"
  tight: "10px"
  stack: "14px"
  gutter: "20px"
  section: "36px"
  shell: "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 32px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.signal-yellow-hover}"
  button-outline:
    backgroundColor: "transparent"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 32px"
    height: "52px"
  button-muted:
    backgroundColor: "{colors.gutter-track}"
    textColor: "{colors.paper}"
    padding: "0 32px"
    height: "52px"
  button-small:
    padding: "0 18px"
    height: "44px"
  menu-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "14px 22px"
  menu-item-active:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "0 22px"
    height: "48px"
  tab-selected:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  save-slot-hero:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "40px"
  save-slot-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "18px 30px 18px 22px"
  save-slot-row-selected:
    backgroundColor: "{colors.paper-lit}"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    padding: "4px 14px 4px 22px"
    height: "50px"
  stamp-clear:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "2px 18px"
  toast:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "12px 14px 12px 24px"
---

# Design System: PAL

## Overview

**Creative North Star: "The Save Select Screen"**

PAL is a game's save-select screen drawn as a manga page. Every anime on the list is a save file. Each file has a permanent number, a play time, a last-saved time, and progress drawn as memory blocks. A finished file gets a CLEAR! stamp that slams on like a sound effect. The four sections are menu entries, not database pages: `01 CONTINUE`, `02 NEW GAME`, `03 LOAD GAME`, `04 PLAYER DATA`. The menu shapes how the app behaves:
- A bracket cursor marks the selected slot.
- Arrows move, Enter opens, Esc backs out.
- 1–4 jump between sections, / searches, + logs an episode and U undoes.

The world is a manga page with the lights off. The page is ink and the panels are paper. Panels are cut as trapezoids, with alternating slants down a list. Screentone dots fade into the far corner of each panel. Signal yellow is the only accent: it means selected, confirmed or cleared. The energy borrows from Persona 5's menus but not their look. There is no red, no ransom-note lettering and no calling cards. The energy lives in motion that answers the owner:
- on every screen change a yellow slash with speed lines crosses the page, the new screen is cut in behind it, the title strikes in and panels are dealt in a few at a time
- the chosen menu entry strikes in trailing speed lines
- +1 punches radial speed lines out of the panel
- CLEAR floods the panel in a yellow burst before the stamp slams on

Density is moderate and the daily loop is one action. Continue puts the cursor on the latest save. Its primary button reads "Watched EP 13". Every write can be undone from the toast. Clarity wins over style: the motion is short and state-driven, and every effect becomes a fade under reduced motion.

**Key Characteristics:**
- Ink page, paper panels, one signal-yellow accent; poster art supplies every other colour
- Trapezoid panel cuts, screentone, speed lines: a manga page, not a SaaS card kit
- Dela Gothic One for names, titles and identifying numbers; Zen Kaku Gothic New for everything you read or operate
- Save-file vocabulary throughout: file, Continue, New game, Load game, Player data, Save game, Cleared, Delete file, Back up / Restore
- A bracket cursor that follows focus, never hover, and a button guide like a game's control hints
- Flat: no shadows, gradients or blur; depth comes from ink against paper

## Colors

Ink and paper with a single signal yellow. Tokens flip with context: every panel switches to ink-on-paper values.

### Primary
- **Signal Yellow** (#FFD60A): the only accent. It marks the active menu entry and selected tab, primary buttons, the bracket cursor, the CLEAR! stamp, the toast, the marker swipe under a selected file number, and the focus ring on ink. Ink text on it reads 13.0:1.
- **Signal Yellow Hover** (#FFE24D): hover state of primary buttons only.

### Neutral (the ink page)
- **Page Ink** (#0F0F12): the page itself and the gutters between panels.
- **Gutter Track** (#2B2B33): unfilled bars, status tags and kbd keys on the page.
- **Gutter Line** (#3C3C46): rules on the page, such as the guide divider.
- **Gutter Slate** (#8A8A94): borders of chips, selects and the search field on ink (5.6:1).
- **Gutter Muted** (#A9A9B2): secondary text on ink (8.2:1).

### Neutral (the paper panels)
- **Paper** (#F3F3EF): every panel, save slot, menu item and tab.
- **Paper Lit** (#FFFFFF): a slot row under hover or the cursor.
- **Ink** (#141418): text, filled memory blocks and the focus ring on paper.
- **Paper Muted** (#55555E): secondary text on paper (6.6:1).
- **Paper Slate** (#6E6E76): resting file numbers and the edges of score chips (4.5:1).
- **Paper Track** (#D6D6D0) and **Paper Line** (#B5B5AE): unfilled blocks and the fills of steppers and score chips.

### Named Rules
**The One Signal Rule.** Signal yellow is the only chromatic colour PAL owns. More emphasis means yellow or more size, never a second hue. Never use red: it belongs to the reference, not to PAL.

**The Context Flip Rule.** Colour tokens are set per context. On the page, text is paper. Inside a panel, text, borders and the focus ring are ink. Never hard-code a text colour that only works on one side.

**The Posters Bring the Colour Rule.** Anime posters are the only multicolour on screen.

## Typography

**Display Font:** Dela Gothic One (with Zen Kaku Gothic New, system-ui)
**Body Font:** Zen Kaku Gothic New 500 and 700

**Character:** a heavy, wide display face with the weight of manga lettering, paired with a clean Japanese-Latin gothic that stays quiet at operating sizes.

### Hierarchy
- **Display** (58px; 34px on phone): the `PAL.` logo.
- **Headline** (56px, uppercase; 40px on phone): screen titles.
- **Title** (40px, line-height 1.12; 26px on phone): the anime title on the Continue hero and on file details.
- **Section** (22px, display face, sentence case): section headings such as "Also in progress", "About" and "Top genres".
- **Title Row** (700, 22px; 18px on phone): titles in save-slot rows.
- **Body** (500, 16px, line-height 1.6): running text, kept to about 65ch; synopses use 18px.
- **Button** (700, 20px, 2px tracking, uppercase; 16px small): button labels.
- **Label** (700, 15px, 2px tracking, uppercase): field labels such as Genre, Type, Status, Episodes and My score, and save stats (File, Play time, Last saved).
- **Meta** (500, 15px, tabular figures): readouts such as "Episode 12 of 28", meta lists, legends and toasts.
- **Numerals** (display face, 34px): file numbers. **Clock** (64px; 44px on phone): the Player data play time. **Heading small** (28px): empty-state and dialog titles, phone titles. **Body large** (18px): synopses, tabs, selects. **Key** (14px): kbd keys. **Caption** (12px): phone menu labels. **Stamp large** (44px): CLEAR! on a clearing hero.

### Named Rules
**The Display Means Identity Rule.** The display face carries names, titles and numbers that identify a file. Data you read or edit uses the body face: last saved, scores in rows, readouts.

**The Caps Are Chrome Rule.** Uppercase belongs to menu items, buttons, tabs, field labels and the stamp. Content stays in sentence case: titles, sections, meta, toasts, placeholders.

## Layout

On desktop (1024px and up), a centred 1280px shell holds a sticky 260px sidebar and the main column, with 48px padding and a 48px gap. The sidebar holds:
- the logo
- the menu: four equal-width entries on one edge
- the button guide

The main column opens with the screen title. Screens stack sections 36px apart. Rows sit 14px apart. Poster grids auto-fill 170px columns. The page reserves the scrollbar gutter, so the centred layout never shifts between screens. Skewed controls keep about 6px of slack so a lean never clips its own corner, and scroll strips pad 8px so focus rings are never cut.

Search lives only inside New game, as one query bar: search, then browse tabs, then a row of genre and type. Elsewhere, / opens it. Load game has its own "Find a file" for the owner's list.

Below 1024px, the layout becomes one column with 16px gutters:
- The menu becomes a fixed bottom bar of four equal 52px items with 12px labels. The trail is removed there.
- Content keeps 110px of bottom clearance, and scroll-padding keeps focused controls above the bar.
- New game's filters sit behind a Filters toggle.
- Tabs and chips become horizontal scroll strips.
- File details puts the save panel right under the title.

## Elevation & Depth

Flat. There are no shadows, gradients, glows or blur. Depth is ink against paper: panels float as paper shapes on the ink page, and their trapezoid cuts make the gutters read as part of a manga page. Screentone fading toward a panel's far corner adds texture, not depth.

### Named Rules
**The Flat Page Rule.** To make something stand out, give it paper-lit, yellow, or size. Never add a box-shadow, filter or backdrop blur.

## Shapes

Sharp, slanted and cut. Every radius is 0px.
- **Panel cuts:** the Continue hero is cut with a right-side slant (96% at the bottom). Rows alternate a slight left and right slant down a list. Other panels take a small bottom-right slant. Cut panels pad their slanted side so content never meets the cut.
- **Skew:** buttons, menu items, tabs, chips, tags, kbd keys and the search field lean -10°, and their text is counter-skewed upright. Large posters lean -6°, and grid posters are parallelograms.
- **Memory blocks:** progress is drawn as discrete blocks leaning -20°: one per episode up to 26 (two cours), and two segments beyond that.
- **Bracket cursor:** four 26px yellow corners, 4px strokes, set 10px outside the selected slot.

## Components

Components are snappy and physical. Hover changes tone, press sinks 2px, and nothing moves on hover.

### Buttons
- **Primary:** signal yellow with ink text and a 2px ink edge. It carries the one main action: "Watched EP 13", "+1 EP", "Save game", "No".
- **Outline:** transparent with a 2px current-text border. Used for secondary actions such as "Open file", "Plan to watch", "Back" and "Yes, delete".
- **Muted:** track fill, for tertiary actions such as "Start" and "Delete file".
- **Small:** 44px tall, the minimum target.

### Navigation
- **Menu:** four equal paper parallelograms on one edge, with ink display-face labels. The active entry is yellow with speed lines trailing behind it.
- **Button guide:** kbd keys with their actions. It adapts to the screen and hides on phone.

### Tabs and chips
- **Tabs:** paper with ink display-face labels; the selected tab is yellow. They follow the ARIA tablist pattern with roving focus, and counts read with a separator.
- **Genre chips:** outlined (Gutter Slate) and toggled with `aria-pressed`; the selected chip is yellow.

### Inputs
- **Search field:** a skewed frame with a 2px Gutter Slate border. It stays ink while focused, so typed text stays visible, with a yellow border and ring. Esc clears it, then leaves it.
- **Select:** an unskewed native select with a 2px slate border.
- **Score picker:** native radios drawn as 44px chips with a slate inner edge; the selected chip is yellow with an ink inner edge.
- **Episode stepper:** −, the count, and +. + is disabled at the known total.

### Save slots (signature)
- **Hero (Continue):**
  - A paper trapezoid with the poster, file number and save stats (play time, last saved).
  - The title, the episode readout with percent, and memory blocks.
  - "Watched EP n" and "Open file" buttons.
- **Row (Continue and Load game):**
  - The file number, poster, title, readout and blocks.
  - A +1 EP button while watching, or Start for plan-to-watch.
- **Poster card (New game, recommendations, cleared wall):** a parallelogram poster, title and meta, plus one action or a status tag.
- **Keyboard:** slots are focusable; Enter opens the file and + logs an episode.

### Bracket cursor (signature)
It follows focus, never hover, and glides in 160ms. It snaps in from outside on each new slot. After a screen change it lands on the slot you last opened, or the first slot. It is the slot's focus indicator.

### CLEAR! stamp (signature)
Yellow with a 3px ink edge, display face, rotated -7°, with an exclamation mark. It slams in once on clear, after a yellow speed-line burst floods the panel. On the save panel it sits low-left, clear of the stats.

### Toast
- A yellow cut-corner bar carrying the action's message and, when it applies, Undo (U).
- On desktop it sits bottom-left, clear of the +1 column; on phone it sits at the top.
- Undoable toasts stay 6 seconds. Messages name the show and any side effect.

### Dialog
A native modal on paper. Destructive questions name the file ("Delete file 08?") and put focus on No.

## Do's and Don'ts

### Do:
- **Do** flip tokens by context: ink-on-paper inside panels, paper-on-ink on the page, including the focus ring.
- **Do** keep signal yellow (#FFD60A) as the only accent, and put ink text on it.
- **Do** tie every motion to a state change (screen change, selection, +1, CLEAR), keep it to 200–400ms, and make it a fade under reduced motion.
- **Do** give every file a permanent number and keep lists steady while the owner acts in them.
- **Do** pair progress with a text readout and an accessible label.
- **Do** keep touch targets at least 44px, and pad scroll strips so focus rings are never clipped.
- **Do** make every write undoable, and say any side effect in the toast.

### Don't:
- **Don't** use red, ransom-note lettering or calling-card motifs; borrow the energy of the reference, never its look.
- **Don't** put a global search above every screen; search lives in New game and opens with /.
- **Don't** use yellow for text or focus rings on paper; use ink.
- **Don't** add shadows, gradients, blur or rounded corners.
- **Don't** set content in uppercase, or use tracked-caps eyebrows above sections.
- **Don't** show status codes or system words in user-facing copy.
