# AgriSense AI — Design Guide

## 1. Design Philosophy

The AgriSense AI interface follows a **nature-inspired, modern glassmorphism** design language. The UI blends lush agricultural imagery with translucent overlays, creating an immersive experience that connects farmers to their land while providing clear, accessible data.

**Core Principles:**
- **Organic & Natural** — earthy greens, warm gradients, and nature photography as backgrounds
- **Glassmorphism** — frosted glass card effects with semi-transparent backgrounds and backdrop blur
- **Data at a Glance** — key metrics (area, yield, plant age, health) presented as clean stat cards
- **Mobile-First** — designed primarily for mobile use in the field, responsive to web

---

## 2. Color Palette

### Primary Colors

| Color Name        | Hex       | RGB              | Usage                                    |
|-------------------|-----------|------------------|------------------------------------------|
| **Leaf Green**    | `#84CC16` | rgb(132, 204, 22)  | Primary accent, CTAs, active states, icons |
| **Dark Forest**   | `#1A2E05` | rgb(26, 46, 5)     | Dark backgrounds, overlays               |
| **Deep Green**    | `#2D4A0E` | rgb(45, 74, 14)    | Secondary dark backgrounds, cards        |

### Secondary Colors

| Color Name          | Hex       | RGB               | Usage                                   |
|---------------------|-----------|-------------------|-----------------------------------------|
| **Olive Green**     | `#4A7C0F` | rgb(74, 124, 15)   | Secondary accent, hover states          |
| **Sage**            | `#A3BE8C` | rgb(163, 190, 140) | Subtle highlights, borders, tags        |
| **Warm Sunset**     | `#F59E0B` | rgb(245, 158, 11)  | Weather icons, warnings, highlights     |
| **Golden Hour**     | `#D97706` | rgb(217, 119, 6)   | Warm accents, sunrise/sunset elements   |

### Neutral Colors

| Color Name          | Hex       | RGB                | Usage                                  |
|---------------------|-----------|--------------------|-----------------------------------------|
| **White**           | `#FFFFFF` | rgb(255, 255, 255) | Primary text on dark, card text         |
| **Off White**       | `#F5F5F4` | rgb(245, 245, 244) | Light mode backgrounds                  |
| **Light Gray**      | `#E7E5E4` | rgb(231, 229, 228) | Borders, dividers, inactive elements    |
| **Medium Gray**     | `#A8A29E` | rgb(168, 162, 158) | Secondary text, placeholders            |
| **Dark Gray**       | `#44403C` | rgb(68, 64, 60)    | Body text on light backgrounds          |
| **Near Black**      | `#1C1917` | rgb(28, 25, 23)    | Primary text on light backgrounds       |

### Semantic Colors

| Color Name          | Hex       | RGB                | Usage                                  |
|---------------------|-----------|--------------------|-----------------------------------------|
| **Alert Red**       | `#EF4444` | rgb(239, 68, 68)   | Critical alerts, errors, pest warnings  |
| **Warning Amber**   | `#F59E0B` | rgb(245, 158, 11)  | Moderate warnings, temperature alerts   |
| **Success Green**   | `#22C55E` | rgb(34, 197, 94)   | Healthy status, success confirmations   |
| **Info Blue**       | `#3B82F6` | rgb(59, 130, 246)  | Informational, water/rain indicators    |

### Glassmorphism Overlays

| Name                    | Value                                          | Usage                        |
|-------------------------|-------------------------------------------------|------------------------------|
| **Dark Glass**          | `rgba(26, 46, 5, 0.70)` + `blur(16px)`        | Cards on image backgrounds   |
| **Medium Glass**        | `rgba(26, 46, 5, 0.50)` + `blur(12px)`        | Stat cards, navigation bar   |
| **Light Glass**         | `rgba(255, 255, 255, 0.15)` + `blur(10px)`    | Subtle overlays, tags        |
| **White Glass**         | `rgba(255, 255, 255, 0.80)` + `blur(16px)`    | Light mode cards             |

---

## 3. Typography

### Font Family

| Role        | Font                  | Fallback                        |
|-------------|-----------------------|---------------------------------|
| **Primary** | `Inter`               | `-apple-system, sans-serif`     |
| **Display** | `Plus Jakarta Sans`   | `Inter, sans-serif`             |
| **Mono**    | `JetBrains Mono`      | `monospace`                     |

### Type Scale

| Style          | Size   | Weight    | Line Height | Usage                           |
|----------------|--------|-----------|-------------|---------------------------------|
| **Display XL** | 32px   | Bold 700  | 1.2         | Welcome heading, hero titles    |
| **Display**    | 28px   | Bold 700  | 1.2         | Page titles                     |
| **Heading 1**  | 24px   | SemiBold 600 | 1.3      | Section headers                 |
| **Heading 2**  | 20px   | SemiBold 600 | 1.3      | Card titles, sub-sections       |
| **Heading 3**  | 16px   | SemiBold 600 | 1.4      | Stat labels, list headers       |
| **Body**       | 14px   | Regular 400  | 1.5      | General body text               |
| **Body Small** | 12px   | Regular 400  | 1.5      | Captions, secondary info        |
| **Caption**    | 10px   | Medium 500   | 1.4      | Stat values (Area, Yield, etc.) |
| **Stat Value** | 28px   | Bold 700     | 1.1      | Metric numbers (50%, 80%)       |

---

## 4. Layout & Spacing

### Grid System

- **Mobile:** Single column, 16px horizontal padding
- **Tablet:** 2-column grid, 24px gutter
- **Desktop:** 3-4 column grid, 24px gutter, max-width 1280px

### Spacing Scale

| Token  | Value | Usage                                    |
|--------|-------|------------------------------------------|
| `xs`   | 4px   | Tight spacing, inline elements           |
| `sm`   | 8px   | Between related items                    |
| `md`   | 12px  | Card internal padding                    |
| `lg`   | 16px  | Section padding, card gaps               |
| `xl`   | 24px  | Between major sections                   |
| `2xl`  | 32px  | Page top/bottom padding                  |
| `3xl`  | 48px  | Hero section spacing                     |

### Border Radius

| Token       | Value | Usage                              |
|-------------|-------|------------------------------------|
| `sm`        | 8px   | Small buttons, tags, chips         |
| `md`        | 12px  | Input fields, stat cards           |
| `lg`        | 16px  | Content cards, media cards         |
| `xl`        | 20px  | Large cards, modals                |
| `2xl`       | 24px  | Bottom sheets, navigation bar      |
| `full`      | 9999px| Circular buttons, avatars, pills   |

---

## 5. Component Specifications

### 5.1 Navigation Bar (Bottom)

Based on the reference UI, the app uses a **bottom tab bar** with 4 main sections:

```
┌─────────────────────────────────────────┐
│   [Home]   [Fields]   [Calendar]  [Profile] │
│     🏠       🌱          📅         👤      │
└─────────────────────────────────────────┘
```

- Style: Frosted glass background (`White Glass` overlay)
- Active icon: `Leaf Green` (#84CC16) with filled style
- Inactive icon: `Medium Gray` (#A8A29E) with outline style
- Height: 64px (+ safe area inset on mobile)
- Border radius (top): 24px

**Tab Mapping for AgriSense AI:**

| Tab | Icon | Feature |
|-----|------|---------|
| Home | Home/Weather icon | Dashboard + Weather Intelligence |
| Diagnose | Plant/Camera icon | Crop Diagnosis Chatbot |
| News | Newspaper icon | Agricultural News Feed |
| Community | People icon | AgriCommunity + Marketplace |
| Profile | User icon | Settings & Farm Profile |

### 5.2 Stat Cards

Compact metric cards displaying key farm data at a glance.

```
┌──────────────────────────────────────────────┐
│  [Area]        [Yield]       [Plant Age]     │
│   15m²         12 Tons        44 Days        │
└──────────────────────────────────────────────┘
```

- Background: `Medium Glass` or `Dark Glass` depending on context
- Border: 1px solid `rgba(255, 255, 255, 0.1)`
- Border radius: `md` (12px)
- Padding: 12px 16px
- Label: `Caption` style, `Medium Gray`
- Value: `Heading 3` style, `White`

### 5.3 Hero / Welcome Card

Full-width card with nature photography background and overlay text.

- Background: Full-bleed agricultural photo (sunset, fields, crops)
- Overlay: Linear gradient from `transparent` to `rgba(26, 46, 5, 0.85)`
- Title: `Display XL`, White, Bold
- Subtitle: `Body`, White with 80% opacity
- CTA Button: `Leaf Green` background, White text, `full` border radius, 48px height

### 5.4 Field / Crop Cards

Cards in a horizontal scrollable list showing individual fields or crop guides.

```
┌──────────────┐
│  [Photo]     │
│              │
│  ♡           │
├──────────────┤
│ Grow Healthy │
│ Carrots      │
│              │
│ Learn to...  │
│         [→]  │
└──────────────┘
```

- Width: ~180px (scrollable horizontal list)
- Image height: 140px with `lg` border radius (top only)
- Favorite icon: top-right, white circle with heart
- Title: `Heading 3`, Dark text
- Description: `Body Small`, `Medium Gray`
- Action arrow: `Leaf Green` circle, 32px, bottom-right

### 5.5 Health Metric Grid

2x2 grid showing field health metrics (from the field detail view).

```
┌──────────┬──────────┐
│ 💧 Water │ 🌱 Plant │
│  Depth   │  Health  │
│   50%    │   80%    │
├──────────┼──────────┤
│ 🧪 Soil  │ 🐛 Pest  │
│          │          │
│   70%    │    5%    │
└──────────┴──────────┘
```

- Card background: `Dark Glass`
- Border: 1px solid `rgba(255, 255, 255, 0.08)`
- Icon: 24px, `Leaf Green` or semantic color
- Label: `Body Small`, `Medium Gray`
- Value: `Stat Value` (28px Bold), `White`
- Color coding: Green (healthy) → Amber (moderate) → Red (critical)

### 5.6 Chat / Diagnosis Interface

```
┌─────────────────────────────────────┐
│  AgriSense AI              [···]    │
├─────────────────────────────────────┤
│                                     │
│        [Bot message bubble]         │
│                                     │
│            [User photo upload]      │
│            [User message]           │
│                                     │
│        [Diagnosis result card]      │
│        ┌─────────────────────┐      │
│        │ 🔴 Early Blight     │      │
│        │ Confidence: 92%     │      │
│        │ Severity: Moderate  │      │
│        │ [View Treatment →]  │      │
│        └─────────────────────┘      │
│                                     │
├─────────────────────────────────────┤
│ [📷] [Type a message...]    [Send]  │
└─────────────────────────────────────┘
```

- Bot bubbles: `Dark Glass` background, left-aligned
- User bubbles: `Leaf Green` background, right-aligned
- Photo previews: Rounded (16px), max-width 240px
- Diagnosis card: Special styled card with severity color coding
- Input bar: Frosted glass, camera icon, send button (`Leaf Green`)

### 5.7 Category Pills / Chips

Horizontal scrollable filter chips (All, Fruit, Grain, Orchards, Vegetables).

- Active: `Leaf Green` background, White text
- Inactive: `Light Glass` background, White or Dark text
- Border radius: `full` (pill shape)
- Height: 36px
- Padding: 0 16px
- Font: `Heading 3` (16px SemiBold)

---

## 6. Iconography

### Style
- **Type:** Outline icons (inactive), Filled icons (active/accent)
- **Library:** Lucide Icons or Phosphor Icons (recommended)
- **Size:** 20px (inline), 24px (navigation/cards), 32px (feature highlights)
- **Color:** Follows context — `Leaf Green` for active, `Medium Gray` for inactive, `White` on dark

### Key Icons

| Feature | Icon | Context |
|---------|------|---------|
| Weather | Cloud-Sun | Dashboard, weather tab |
| Temperature High | Thermometer-Sun | Alert cards |
| Temperature Low | Thermometer-Snowflake | Alert cards |
| Flood | Cloud-Rain | Alert cards |
| Drought | Sun | Alert cards |
| Camera | Camera | Chat input, photo upload |
| Diagnosis | Scan-Line / Microscope | Diagnosis results |
| News | Newspaper | News tab |
| Community | Users | Community tab |
| Marketplace | Store | Marketplace section |
| Location | Map-Pin | Location badges |
| Notification | Bell | Header |
| Plant | Sprout | Field/crop related |
| Heart | Heart | Favorites, likes |

---

## 7. Motion & Animation

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 300ms | `ease-in-out` | Navigate between tabs |
| Card appear | 200ms | `ease-out` | Cards loading into view |
| Button press | 100ms | `ease-in` | Scale to 0.97 on press |
| Fade in | 200ms | `ease-out` | Content loading |
| Slide up | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Bottom sheets, modals |
| Skeleton pulse | 1.5s | `ease-in-out` (infinite) | Loading placeholders |
| Alert notification | 400ms | `spring(1, 80, 10)` | Slide in from top |

---

## 8. Dark Mode & Light Mode

The reference UI shows **both** a dark mode (screen 1 & 3) and a light mode (screen 2). The app should support both.

### Dark Mode (Default)
- Background: Full-bleed nature photography or `Dark Forest` (#1A2E05)
- Cards: `Dark Glass` overlay
- Text: White / Off White
- Accents: `Leaf Green`

### Light Mode
- Background: `Off White` (#F5F5F4) or soft green tint `#F0F7E6`
- Cards: `White Glass` overlay or solid white with subtle shadow
- Text: `Near Black` / `Dark Gray`
- Accents: `Leaf Green` (slightly darker variant `#6DA012` for contrast)
- Hero section keeps dark overlay for readability

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | < 640px | Single column, bottom tab nav |
| **Tablet** | 640px - 1024px | 2 columns, side nav option |
| **Desktop** | > 1024px | 3-4 columns, persistent side nav, expanded dashboard |

### Desktop Adaptations
- Bottom nav → Left sidebar navigation
- Stat cards expand into a dashboard grid
- Chat interface opens as a side panel (not full-screen)
- Community feed uses a 2-column masonry layout
- Marketplace grid: 3-4 cards per row

---

## 10. CSS Variables Reference

```css
:root {
  /* Primary */
  --color-primary: #84CC16;
  --color-primary-dark: #6DA012;
  --color-primary-light: #A3D944;

  /* Dark */
  --color-dark-forest: #1A2E05;
  --color-deep-green: #2D4A0E;
  --color-olive: #4A7C0F;

  /* Warm */
  --color-sunset: #F59E0B;
  --color-golden: #D97706;

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-off-white: #F5F5F4;
  --color-light-gray: #E7E5E4;
  --color-medium-gray: #A8A29E;
  --color-dark-gray: #44403C;
  --color-near-black: #1C1917;

  /* Semantic */
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #22C55E;
  --color-info: #3B82F6;

  /* Glass */
  --glass-dark: rgba(26, 46, 5, 0.70);
  --glass-medium: rgba(26, 46, 5, 0.50);
  --glass-light: rgba(255, 255, 255, 0.15);
  --glass-white: rgba(255, 255, 255, 0.80);
  --glass-blur: 16px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;

  /* Transitions */
  --transition-fast: 100ms ease-in;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## 11. Accessibility Guidelines

- **Contrast:** All text meets WCAG 2.1 AA minimum contrast (4.5:1 for body, 3:1 for large text)
- **Touch targets:** Minimum 44x44px for all interactive elements
- **Focus indicators:** Visible focus ring (`Leaf Green` 2px outline with 2px offset)
- **Alt text:** All images and icons have descriptive alt text
- **Screen reader:** Semantic HTML, ARIA labels for glass-effect cards
- **Reduced motion:** Respect `prefers-reduced-motion` — disable animations
- **Color independence:** Never rely on color alone — use icons + text labels for alerts

---

## 12. Asset Requirements

### Photography
- High-quality agricultural imagery (fields, crops, sunsets, farmers)
- Minimum resolution: 1920x1080 for hero backgrounds
- Style: Warm golden-hour lighting, lush green fields, close-up crop detail
- Optimize for web: WebP format, lazy loading

### Illustrations
- Empty states: Friendly line illustrations (no results, first-time setup)
- Onboarding: Step-by-step agricultural-themed illustrations
- Style: Minimal line art with `Leaf Green` accent color

### App Icon
- Shape: Rounded square (iOS style)
- Design: Abstract leaf/plant sprout on `Dark Forest` to `Leaf Green` gradient
- Sizes: 1024x1024 master, exported for all platforms

---

*This design guide should be used as the source of truth for all UI/UX decisions across the AgriSense AI platform.*