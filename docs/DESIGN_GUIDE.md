# Harvest AI — Design Guide

## 1. Design Philosophy

The Harvest AI interface follows a **bold agritech editorial** design language. Full-bleed nature photography anchors each view, while glassmorphism cards float above the scene. Headlines are set in a heavy serif/display typeface for authority and warmth; body copy uses a clean sans-serif for legibility. Every screen communicates that powerful AI lives inside a deeply human, land-connected product.

**Core Principles:**

- **Editorial Boldness** — oversized serif display type for hero headings; large, confident numerics for metrics
- **Nature as Canvas** — high-quality field and crop photography fills backgrounds; dark gradient overlays protect text contrast
- **Glassmorphism Depth** — frosted-glass cards with `backdrop-filter: blur` create layered hierarchy above photography
- **Lime Green Energy** — a single vivid lime-green accent (`#84CC16`) anchors every CTA, active state, and data highlight
- **Minimal Chrome** — navigation and controls are restrained; the content and photography do the visual work
- **Mobile-First Field Use** — thumb-reachable controls, large tap targets, offline-ready skeletons

---

## 2. Color Palette

### Primary Colors

| Color Name       | Hex       | RGB               | Usage                                       |
|------------------|-----------|-------------------|---------------------------------------------|
| **Lime Green**   | `#84CC16` | rgb(132, 204, 22) | Primary CTAs, active states, data highlights, links |
| **Lime Dark**    | `#65A30D` | rgb(101, 163, 13) | Hover states, pressed CTAs                   |
| **Lime Light**   | `#A3E635` | rgb(163, 230, 53) | Subtle tints, progress bars                  |

### Dark Background Colors

| Color Name        | Hex       | RGB              | Usage                                    |
|-------------------|-----------|------------------|------------------------------------------|
| **Dark Forest**   | `#1A2E05` | rgb(26, 46, 5)   | Deepest backgrounds, fullscreen overlays |
| **Deep Green**    | `#14532D` | rgb(20, 83, 45)  | Card backgrounds on dark                 |
| **Midnight**      | `#0D1F0A` | rgb(13, 31, 10)  | Modal backdrops, nav overlays            |

### Warm Accent Colors

| Color Name        | Hex       | RGB               | Usage                                    |
|-------------------|-----------|-------------------|------------------------------------------|
| **Warm Amber**    | `#F59E0B` | rgb(245, 158, 11) | Weather warnings, harvest highlights     |
| **Golden Hour**   | `#D97706` | rgb(217, 119, 6)  | Sunset gradients, premium badges         |
| **Terra**         | `#92400E` | rgb(146, 64, 14)  | Soil-tone accents, category badges       |

### Neutral Colors

| Color Name      | Hex       | RGB                | Usage                                     |
|-----------------|-----------|--------------------|--------------------------------------------|
| **White**       | `#FFFFFF` | rgb(255, 255, 255) | Primary text on dark, card headings        |
| **Off White**   | `#F7FEE7` | rgb(247, 254, 231) | Light mode page background (green tint)    |
| **Silver**      | `#E4E4E7` | rgb(228, 228, 231) | Borders, dividers, skeleton loaders        |
| **Medium Gray** | `#A1A1AA` | rgb(161, 161, 170) | Placeholder text, secondary metadata       |
| **Slate**       | `#3F3F46` | rgb(63, 63, 70)    | Body text on light backgrounds             |
| **Near Black**  | `#18181B` | rgb(24, 24, 27)    | Headings on light backgrounds              |

### Semantic Colors

| Color Name        | Hex       | RGB               | Usage                                     |
|-------------------|-----------|-------------------|-------------------------------------------|
| **Alert Red**     | `#EF4444` | rgb(239, 68, 68)  | Critical alerts, errors, pest warnings    |
| **Warning Amber** | `#F59E0B` | rgb(245, 158, 11) | Moderate warnings, temperature alerts     |
| **Success Green** | `#22C55E` | rgb(34, 197, 94)  | Healthy status, success confirmations     |
| **Info Blue**     | `#3B82F6` | rgb(59, 130, 246) | Rain indicators, informational badges     |

### Glassmorphism Overlays

| Name             | Value                                        | Usage                             |
|------------------|----------------------------------------------|-----------------------------------|
| **Dark Glass**   | `rgba(13, 31, 10, 0.72)` + `blur(20px)`     | Cards floating on photography     |
| **Medium Glass** | `rgba(20, 83, 45, 0.55)` + `blur(14px)`     | Stat chips, secondary cards       |
| **Light Glass**  | `rgba(255, 255, 255, 0.12)` + `blur(10px)`  | Subtle overlays, tag pills        |
| **Hero Scrim**   | `linear-gradient(to bottom, transparent 0%, rgba(13, 31, 10, 0.88) 100%)` | Photography overlay for legibility |

---

## 3. Typography

### Font Families

| Role        | Font                  | Fallback                             | Notes                               |
|-------------|-----------------------|--------------------------------------|-------------------------------------|
| **Display** | `Playfair Display`    | `Georgia, serif`                     | Hero headings, section titles — editorial authority |
| **Primary** | `Inter`               | `-apple-system, sans-serif`          | Body, labels, UI controls           |
| **Mono**    | `JetBrains Mono`      | `monospace`                          | Data values, code                   |

> Load both fonts from Google Fonts. Playfair Display at weights 700 & 900; Inter at 400, 500, 600, 700.

### Type Scale

| Style           | Font      | Size   | Weight     | Line Height | Letter Spacing | Usage                                |
|-----------------|-----------|--------|------------|-------------|----------------|--------------------------------------|
| **Hero XL**     | Display   | 56px   | Black 900  | 1.05        | -0.02em        | Landing hero, full-bleed banner      |
| **Hero**        | Display   | 40px   | Bold 700   | 1.1         | -0.01em        | Page hero titles                     |
| **Display**     | Display   | 30px   | Bold 700   | 1.2         | -0.01em        | Section feature headlines            |
| **Heading 1**   | Primary   | 24px   | SemiBold 600 | 1.3       | 0              | Page titles, modal headers           |
| **Heading 2**   | Primary   | 20px   | SemiBold 600 | 1.3       | 0              | Card titles, sub-sections            |
| **Heading 3**   | Primary   | 16px   | SemiBold 600 | 1.4       | 0              | Panel labels, list headers           |
| **Body**        | Primary   | 14px   | Regular 400  | 1.6       | 0              | General body text                    |
| **Body Small**  | Primary   | 12px   | Regular 400  | 1.5       | 0              | Captions, timestamps                 |
| **Label**       | Primary   | 11px   | Bold 700     | 1.4       | 0.08em         | Section labels (ALL CAPS)            |
| **Stat Value**  | Display   | 32px   | Bold 700     | 1.1       | -0.02em        | Metric numbers (50%, 80%, 35°C)      |

### Typography Rules

- Hero headings may use **italic** variants of Playfair Display for stylistic contrast (e.g. *Growing smarter,* **together**)
- ALL CAPS labels use Inter Bold at 10–11px with `letter-spacing: 0.08–0.1em`
- Never mix Display and Primary at the same visual weight at the same level
- On photography backgrounds, always pair type with a dark scrim or `text-shadow` for contrast

---

## 4. Layout & Spacing

### Grid System

- **Mobile (< 640px):** Single column, 16px horizontal padding
- **Tablet (640px–1024px):** 2-column grid, 24px gutter
- **Desktop (> 1024px):** Asymmetric grids (e.g. 380px fixed + 1fr); max-width 1400px

### Spacing Scale

| Token  | Value | Usage                                      |
|--------|-------|--------------------------------------------|
| `xs`   | 4px   | Tight inline spacing                       |
| `sm`   | 8px   | Between related elements                   |
| `md`   | 12px  | Card internal padding (tight)              |
| `lg`   | 16px  | Standard section gap, card padding         |
| `xl`   | 24px  | Between major sections                     |
| `2xl`  | 32px  | Page top/bottom padding                    |
| `3xl`  | 48px  | Hero section vertical breathing room       |

### Border Radius

| Token    | Value   | Usage                                      |
|----------|---------|--------------------------------------------|
| `sm`     | 8px     | Input fields, small chips                  |
| `md`     | 12px    | Standard cards, stat cards                 |
| `lg`     | 16px    | Content cards                              |
| `xl`     | 20px    | Large cards, advisory panels               |
| `2xl`    | 24px    | Bottom sheets, nav bar                     |
| `full`   | 9999px  | Pill buttons, location tags, avatar badges |

---

## 5. Component Specifications

### 5.1 Hero / Banner Section

Full-bleed agricultural photography with a dark gradient scrim and bold serif headline.

```
┌──────────────────────────────────────────────────────┐
│  [Full-bleed field photography]                      │
│                                                      │
│    Growing smarter,                  [🌿 Platform]   │
│    *together.*                                       │
│                                                      │
│    AI-powered insights for the modern farm.          │
│                                                      │
│    [● Get Started]   [Learn More →]                  │
│                                                      │
│    ╔══════════╗  ╔══════════╗  ╔══════════╗          │
│    ║ 12k+     ║  ║  94%     ║  ║  50+     ║          │
│    ║ Farmers  ║  ║ Accuracy ║  ║ Crops    ║          │
│    ╚══════════╝  ╚══════════╝  ╚══════════╝          │
└──────────────────────────────────────────────────────┘
```

- **Background:** Full-bleed WebP, `object-fit: cover`, min-height 520px on desktop
- **Scrim:** `linear-gradient(to bottom, rgba(13,31,10,0.3) 0%, rgba(13,31,10,0.85) 100%)`
- **Headline:** `Hero` type (Playfair Display 40px Bold), White; italic word in Playfair Italic
- **Subtext:** `Body` 14px, White at 85% opacity
- **Primary CTA:** Lime Green pill button, 48px height, `border-radius: full`, Black text, Bold 700
- **Secondary CTA:** Transparent pill button, White border 1.5px, White text
- **Stat chips:** `Dark Glass` cards, 12px radius, floating row below CTAs

### 5.2 Navigation Bar (Top — Desktop / Bottom — Mobile)

**Desktop:**
- Fixed top bar, `rgba(13,31,10,0.85)` background + `backdrop-filter: blur(16px)`
- Logo: Harvest AI wordmark + leaf icon, Lime Green
- Nav links: Inter 14px Medium, White at 80% opacity; active = Lime Green
- CTA: Lime Green pill button, right-aligned

**Mobile (Bottom Tab Bar):**
- Height: 64px + safe-area-inset-bottom
- Background: `Dark Glass` + `backdrop-filter: blur(20px)`
- Border-top: 1px solid `rgba(255,255,255,0.08)`
- Active: Lime Green icon + label; Inactive: Medium Gray

| Tab      | Icon         | Feature                       |
|----------|--------------|-------------------------------|
| Home     | Home         | Dashboard + Weather           |
| Diagnose | Camera/Scan  | Crop Diagnosis Chatbot        |
| News     | Newspaper    | Agricultural News             |
| Community| People       | Community + Marketplace       |
| Profile  | User         | Settings & Farm Profile       |

### 5.3 Glassmorphism Cards

Cards used throughout the app for data, advisory, alerts, and product listings.

```
┌─────────────────────────────────────────┐  ← border: 1px solid rgba(255,255,255,0.12)
│                                         │  ← background: Dark Glass
│  SECTION LABEL (11px, ALL CAPS, Green)  │
│                                         │
│  Card Heading (Heading 2)               │
│  Body text at 80% opacity (14px)        │
│                                         │
│  [  Action Button  ]                    │
└─────────────────────────────────────────┘
```

- **Background:** `Dark Glass` (`rgba(13,31,10,0.72)` + `blur(20px)`)
- **Border:** `1px solid rgba(255, 255, 255, 0.12)`
- **Border radius:** `xl` (20px) for large cards; `md` (12px) for compact cards
- **Section label:** Inter 11px Bold, Lime Green, ALL CAPS, `letter-spacing: 0.1em`
- **Hover:** subtle `border-color` lift to `rgba(132, 204, 22, 0.3)`

### 5.4 Pill Buttons (CTAs)

Two variants used throughout:

| Variant     | Background          | Border              | Text     | Usage                  |
|-------------|---------------------|---------------------|----------|------------------------|
| **Primary** | `#84CC16`           | none                | `#000`   | Primary actions        |
| **Outline** | transparent         | rgba(255,255,255,0.2)| `#FFF`  | Secondary actions      |
| **Ghost**   | rgba(255,255,255,0.06)| rgba(255,255,255,0.15)| `#FFF`| Tertiary, dismiss      |

- **Height:** 40px (standard), 48px (hero/prominent)
- **Border radius:** `full` (9999px) — always pill-shaped
- **Font:** Inter Bold 700, 13–14px
- **Transition:** `background 150ms ease-out, box-shadow 150ms ease-out`
- **Hover (primary):** darken to `#65A30D`, add `box-shadow: 0 4px 20px rgba(132,204,22,0.35)`

### 5.5 Location / Category Pills (Filter Chips)

Horizontal scrollable row of location or filter options.

- **Inactive:** `rgba(255,255,255,0.05)` background, `rgba(255,255,255,0.1)` border, Medium Gray text
- **Active:** `rgba(132,204,22,0.15)` background, `#84CC16` border, Lime Green text
- **Hover:** `rgba(255,255,255,0.1)` background, White text
- **Height:** 32px; **border-radius:** `full`; **font:** Inter 12px Medium

### 5.6 Stat / Metric Cards (Floating Chips)

Compact data chips displayed as a row in hero sections or dashboard headers.

```
╔════════════════╗
║  12,400+       ║
║  Farmers       ║
╚════════════════╝
```

- **Background:** `Medium Glass` (`rgba(20,83,45,0.55)` + `blur(14px)`)
- **Border:** `1px solid rgba(255,255,255,0.15)`
- **Border radius:** `md` (12px)
- **Value:** Playfair Display Bold 28px, White
- **Label:** Inter 11px, White at 65%
- **Padding:** 12px 16px

### 5.7 Product / Feature Cards (Grid)

Cards in a 2–4 column grid for crop guides, news, or marketplace items.

```
┌──────────────────┐
│  [Crop Photo]    │  ← border-radius top: 16px
│                  │
│  ♡               │  ← favorite icon, top-right
├──────────────────┤
│ Category (lime)  │
│                  │
│ Card Title       │  ← Heading 2, Dark text or White
│ Short desc...    │  ← Body Small, Medium Gray
│                  │
│            [→]   │  ← Lime Green circle arrow
└──────────────────┘
```

- **Card:** White (light mode) or `Dark Glass` (dark mode); `lg` border radius (16px)
- **Image:** 48–55% of card height; `object-fit: cover`; `border-radius: 16px 16px 0 0`
- **Category badge:** Inter 10px Bold, Lime Green, ALL CAPS, `rgba(132,204,22,0.12)` background, pill shape
- **Arrow CTA:** 32px Lime Green circle, White arrow icon

### 5.8 Social Proof / Trust Row

A horizontal strip of credibility indicators shown below hero or CTA sections.

```
[ ●●●● 12k+ Farmers ]  |  [ ★★★★★ 4.9 Rated ]  |  [ 🏆 Award 2024 ]
```

- **Style:** Inline, `rgba(255,255,255,0.08)` pill background, 10px border radius
- **Avatars:** Overlapping circles (4 avatars), 28px diameter, bordered White
- **Font:** Inter 12px Medium, White at 85%
- **Separator:** `|` in Medium Gray

### 5.9 Weather Card

Dedicated weather status card displayed in the dashboard.

- Background: `Dark Glass` card, Lime Green left-border accent (4px)
- Current temp: Playfair Display 48px Bold, White
- Condition: Inter 14px, White at 70%, with emoji icon
- Stats row (humidity, wind, UV): Inter 12px, icon + value pairs
- Forecast strip: Compact day chips below, horizontally scrollable

### 5.10 Alert Cards

Threshold-based alert notifications with severity-coded borders.

| Severity   | Background                      | Border                          |
|------------|---------------------------------|---------------------------------|
| Critical   | `rgba(239,68,68,0.12)`          | `rgba(239,68,68,0.4)`           |
| Warning    | `rgba(245,158,11,0.08)`         | `rgba(245,158,11,0.3)`          |
| Info       | `rgba(59,130,246,0.08)`         | `rgba(59,130,246,0.25)`         |

- **Animation:** `slideIn` 300ms ease — slides down from -6px opacity 0
- **Dismiss:** Ghost button, right-aligned in alert footer

### 5.11 Chat / Diagnosis Interface

```
┌─────────────────────────────────────┐
│  Harvest AI              [···]    │
├─────────────────────────────────────┤
│  [Bot bubble — Dark Glass, left]    │
│                                     │
│            [User photo — right]     │
│            [User bubble — Lime]     │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 🔴 Early Blight  92% conf   │   │
│  │ Severity: Moderate           │   │
│  │ [View Treatment Plan →]      │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ [📷]  [Type here…]         [Send]   │
└─────────────────────────────────────┘
```

- Bot bubbles: `Dark Glass`, left-aligned, `md` radius
- User bubbles: Lime Green background (`#84CC16`), Black text, right-aligned
- Input bar: `Medium Glass` background, Lime Green send button

---

## 6. Iconography

- **Style:** Outline (inactive), Filled (active/accent)
- **Library:** Lucide Icons (recommended) or Phosphor Icons
- **Sizes:** 16px (inline text), 20px (UI controls), 24px (navigation), 32px (feature cards)
- **Color:** Lime Green (active/accent), Medium Gray (inactive), White (on dark cards)

| Feature      | Icon                  |
|--------------|-----------------------|
| Weather      | Cloud-Sun             |
| Temperature  | Thermometer           |
| Flood/Rain   | Cloud-Rain            |
| Drought      | Sun                   |
| Camera       | Camera                |
| Diagnosis    | Scan-Line / Microscope|
| News         | Newspaper             |
| Community    | Users                 |
| Marketplace  | Store                 |
| Location     | Map-Pin               |
| Notification | Bell                  |
| Plant/Crop   | Sprout / Leaf         |
| AI/Bedrock   | Sparkles / Brain      |

---

## 7. Motion & Animation

| Animation          | Duration | Easing                          | Usage                          |
|--------------------|----------|---------------------------------|--------------------------------|
| Page transition    | 300ms    | `ease-in-out`                   | Tab navigation                 |
| Card appear        | 200ms    | `ease-out`                      | Cards entering viewport        |
| Button press       | 100ms    | `ease-in`                       | Scale to 0.97                  |
| Fade in            | 200ms    | `ease-out`                      | Content loading                |
| Slide up           | 300ms    | `cubic-bezier(0.16, 1, 0.3, 1)`| Bottom sheets, modals          |
| Alert slide-in     | 300ms    | `ease`                          | New alert notification         |
| Skeleton pulse     | 1.5s     | `ease-in-out` infinite          | Loading placeholders           |
| Hero parallax      | continuous| `linear`                       | Subtle photography scroll      |

---

## 8. Dark Mode (Primary) & Light Mode

### Dark Mode — Default

- **Background:** Full-bleed nature photography OR `#0D1F0A` / `#1A2E05`
- **Cards:** `Dark Glass` (`rgba(13,31,10,0.72)` + `blur(20px)`)
- **Text:** White / White at 85–70% opacity
- **Accent:** Lime Green `#84CC16`
- **Borders:** `rgba(255,255,255,0.08–0.15)`

### Light Mode

- **Background:** `#F7FEE7` (green-tinted off-white) or plain `#FAFAFA`
- **Cards:** White with `box-shadow: 0 2px 16px rgba(0,0,0,0.06)`; subtle `#E4FAC4` border
- **Text:** `#18181B` (headings), `#3F3F46` (body)
- **Accent:** Lime Green `#65A30D` (darkened for AA contrast on light)
- Hero sections remain dark-overlay-on-photography for visual consistency

---

## 9. Responsive Breakpoints

| Breakpoint  | Width        | Layout                                                |
|-------------|--------------|-------------------------------------------------------|
| **Mobile**  | < 640px      | Single column, bottom tab nav, stacked sections       |
| **Tablet**  | 640–1024px   | 2-column grid, top nav, collapsible sidebar option    |
| **Desktop** | > 1024px     | Asymmetric multi-column, persistent sidebar, expanded dashboard |

### Desktop Adaptations

- Bottom nav → Persistent left sidebar (64px icon-only or 240px expanded)
- Hero section: full-bleed with split text/photo layout
- Dashboard uses CSS Grid with named areas; `380px fixed + 1fr` for data panels
- Marketplace / News: 3–4 card grid per row
- Chat interface: side panel (not full-screen takeover)

---

## 10. CSS Variables Reference

```css
:root {
  /* Primary — Lime Green */
  --color-primary:       #84CC16;
  --color-primary-dark:  #65A30D;
  --color-primary-light: #A3E635;

  /* Dark Backgrounds */
  --color-dark-forest:   #1A2E05;
  --color-deep-green:    #14532D;
  --color-midnight:      #0D1F0A;

  /* Warm Accents */
  --color-amber:         #F59E0B;
  --color-golden:        #D97706;
  --color-terra:         #92400E;

  /* Neutrals */
  --color-white:         #FFFFFF;
  --color-off-white:     #F7FEE7;
  --color-silver:        #E4E4E7;
  --color-medium-gray:   #A1A1AA;
  --color-slate:         #3F3F46;
  --color-near-black:    #18181B;

  /* Semantic */
  --color-alert-red:     #EF4444;
  --color-warning:       #F59E0B;
  --color-success:       #22C55E;
  --color-info:          #3B82F6;

  /* Glassmorphism */
  --glass-dark:          rgba(13, 31, 10, 0.72);
  --glass-medium:        rgba(20, 83, 45, 0.55);
  --glass-light:         rgba(255, 255, 255, 0.12);
  --glass-white:         rgba(255, 255, 255, 0.80);
  --glass-blur:          20px;
  --glass-blur-sm:       12px;

  /* Hero Scrim */
  --hero-scrim: linear-gradient(
    to bottom,
    rgba(13, 31, 10, 0.30) 0%,
    rgba(13, 31, 10, 0.88) 100%
  );

  /* Spacing */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   12px;
  --space-lg:   16px;
  --space-xl:   24px;
  --space-2xl:  32px;
  --space-3xl:  48px;

  /* Border Radius */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md:    0 4px 6px rgba(0, 0, 0, 0.10);
  --shadow-lg:    0 10px 15px rgba(0, 0, 0, 0.15);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-lime:  0 4px 20px rgba(132, 204, 22, 0.35);

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Transitions */
  --transition-fast: 100ms ease-in;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-in-out;
  --transition-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 11. Accessibility Guidelines

- **Contrast:** WCAG 2.1 AA minimum — 4.5:1 body text, 3:1 large text (≥ 18px Bold)
- **Photography backgrounds:** Always add dark scrim before placing text; do not rely on photo contrast alone
- **Touch targets:** 44×44px minimum for all interactive elements
- **Focus ring:** Lime Green 2px outline, 2px offset (`outline: 2px solid #84CC16; outline-offset: 2px`)
- **Alt text:** All photos and icons have descriptive `alt` attributes
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — disable parallax, fade only
- **Color independence:** Icons + text labels accompany all color-coded alerts; never color alone

---

## 12. Asset Requirements

### Photography Style
- **Subject:** Agricultural fields, crop close-ups, sunrise/sunset over farmland, hands in soil, farmers at work
- **Mood:** Golden-hour light, lush green rows, dramatic skies, authentic (not stock-generic)
- **Minimum resolution:** 1920×1080 for hero backgrounds; 800×600 for card thumbnails
- **Format:** WebP with JPEG fallback; lazy-load all non-hero images
- **Overlay readiness:** Images must have sufficient dark tones in lower third for scrim + text contrast

### Illustrations
- Empty states: Minimal line art with Lime Green accent (no results, first setup)
- Onboarding: Friendly agricultural illustrations, 2-color scheme (Dark Forest + Lime Green)

### App Icon
- Shape: Rounded square (iOS/Android style)
- Design: Stylized leaf/sprout on `Dark Forest → Lime Green` diagonal gradient
- Master: 1024×1024px; exported for all platform sizes

---

*This design guide is the source of truth for all UI/UX decisions across the Harvest AI platform. When in doubt, favour bold typography, nature photography, and lime green energy.*
