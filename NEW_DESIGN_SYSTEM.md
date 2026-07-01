# Dynamic HILI Design System
**Procurement Hub — v1.1.0**

Stack: Nuxt 4 · Tailwind CSS v4 · @Nuxt/UI · Vue 3

---

## Table of Contents

1. [Brand](#1-brand)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing](#4-spacing)
5. [Border Radius](#5-border-radius)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Motion](#7-motion)
8. [Z-Index](#8-z-index)
9. [Layout & Grid](#9-layout--grid)
10. [Themes](#10-themes)
11. [Components](#11-components)
12. [CSS Classes (Global Primitives)](#12-css-classes-global-primitives)
13. [Icon System](#13-icon-system)
14. [Internationalisation](#14-internationalisation)

---

## 1. Brand

| Asset | Value |
|---|---|
| Product name | Procurement Hub |
| Primary typeface | **Chesna Grotesk** (custom, licensed — 10 weights) |
| Monospace typeface | **IBM Plex Mono** (Google Fonts CDN, weights 400 / 500 / 600) |
| Brand hue | Green — `#009245` (Dark) · `#39B54A` (Mid) · `#6CCB5F` (Light) |
| Brand gradient (vertical) | `linear-gradient(180deg, #009245 0%, #6CCB5F 100%)` |
| Brand gradient (horizontal) | `linear-gradient(90deg, #009245 0%, #6CCB5F 100%)` |
| Brand gradient (135°) | `linear-gradient(135deg, #009245 0%, #6CCB5F 100%)` |
| Default locale | Thai (`th`) |

---

## 2. Color Tokens

### 2.1 Brand Green Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-green-900` | `#004d23` | — |
| `--color-green-800` | `#006b32` | — |
| `--color-green-700` | `#007d3a` | — |
| `--color-green-600` | `#009245` | Brand Dark Green — logo, primary |
| `--color-green-500` | `#39B54A` | Brand Mid Green — hover, accent |
| `--color-green-400` | `#56C45A` | — |
| `--color-green-300` | `#6CCB5F` | Brand Light Green — gradient end |
| `--color-green-200` | `#A8DFA1` | — |
| `--color-green-100` | `#D4EFD0` | — |
| `--color-green-50` | `#F0FAF0` | Subtle tints |

### 2.2 Neutral Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-950` | `#030712` | — |
| `--color-neutral-900` | `#111827` | Near Black — primary text |
| `--color-neutral-800` | `#1F2937` | Dark UI surface |
| `--color-neutral-700` | `#374151` | Secondary text, dark borders |
| `--color-neutral-600` | `#4B5563` | — |
| `--color-neutral-500` | `#6B7280` | Muted labels, placeholders |
| `--color-neutral-400` | `#9CA3AF` | — |
| `--color-neutral-300` | `#D1D5DB` | Dividers, table borders |
| `--color-neutral-200` | `#E5E7EB` | Card borders (light mode) |
| `--color-neutral-100` | `#F3F4F6` | Surface gray, table rows |
| `--color-neutral-50` | `#F9FAFB` | — |
| `--color-white` | `#FFFFFF` | — |
| `--color-black` | `#000000` | — |

### 2.3 Semantic Status Colors

| Tone | 700 | 600 | 500 | 100 | 50 |
|---|---|---|---|---|---|
| **Success** | `#005c2b` | `#009245` | `#39B54A` | `#D4EFD0` | `#F0FAF0` |
| **Warning** | `#B45309` | `#D97706` | `#F59E0B` | `#FEF3C7` | `#FFFBEB` |
| **Error** | `#B91C1C` | `#DC2626` | `#EF4444` | `#FEE2E2` | `#FFF5F5` |
| **Info** | `#1D4ED8` | `#2563EB` | `#3B82F6` | `#DBEAFE` | `#EFF6FF` |

### 2.4 Semantic Alias Tokens (Light Mode)

#### Backgrounds
| Token | Resolves to |
|---|---|
| `--bg-base` | `#FFFFFF` |
| `--bg-subtle` | `--color-neutral-50` |
| `--bg-surface` | `--color-neutral-100` |
| `--bg-elevated` | `#FFFFFF` |
| `--bg-overlay` | `rgba(17, 24, 39, 0.5)` |

#### Foreground / Text
| Token | Resolves to |
|---|---|
| `--fg-primary` | `--color-neutral-900` |
| `--fg-secondary` | `--color-neutral-700` |
| `--fg-tertiary` | `--color-neutral-500` |
| `--fg-disabled` | `--color-neutral-400` |
| `--fg-inverse` | `--color-white` |
| `--fg-brand` | `--color-green-600` |
| `--fg-success` | `--color-success-600` |
| `--fg-warning` | `--color-warning-600` |
| `--fg-error` | `--color-error-600` |
| `--fg-info` | `--color-info-600` |

#### Borders
| Token | Resolves to |
|---|---|
| `--border-subtle` | `--color-neutral-200` |
| `--border-default` | `--color-neutral-300` |
| `--border-strong` | `--color-neutral-400` |
| `--border-brand` | `--color-green-600` |
| `--border-focus` | `--color-green-600` |

#### Interactive
| Token | Resolves to |
|---|---|
| `--interactive-primary` | `--color-green-600` |
| `--interactive-primary-hover` | `--color-green-700` |
| `--interactive-primary-text` | `--color-white` |
| `--interactive-secondary` | `--color-neutral-100` |
| `--interactive-secondary-hover` | `--color-neutral-200` |
| `--interactive-destructive` | `--color-error-600` |
| `--interactive-destructive-hover` | `--color-error-700` |
| `--interactive-focus-ring` | `rgba(0, 146, 69, 0.3)` |

---

## 3. Typography

### 3.1 Font Families

| Token | Stack |
|---|---|
| `--font-sans` | `'Chesna Grotesk'`, IBM Plex Sans, system-ui, sans-serif |
| `--font-display` | `'Chesna Grotesk'`, IBM Plex Sans, system-ui, sans-serif |
| `--font-mono` | `'IBM Plex Mono'`, Fira Code, Courier New, monospace |

### 3.2 Font Size Scale (8pt-based)

| Token | Size | Notes |
|---|---|---|
| `--text-xs` | `12px` | — |
| `--text-sm` | `13px` | — |
| `--text-base` | `15px` | Default UI text |
| `--text-md` | `16px` | — |
| `--text-lg` | `17px` | — |
| `--text-xl` | `19px` | — |
| `--text-2xl` | `22px` | — |
| `--text-3xl` | `26px` | — |
| `--text-4xl` | `34px` | — |
| `--text-5xl` | `43px` | — |
| `--text-6xl` | `52px` | — |

### 3.3 Font Weights

| Token | Value |
|---|---|
| `--weight-light` | `300` |
| `--weight-regular` | `400` |
| `--weight-medium` | `500` |
| `--weight-semibold` | `600` |
| `--weight-bold` | `700` |
| `--weight-extrabold` | `800` |
| `--weight-black` | `900` |

### 3.4 Line Heights

| Token | Value |
|---|---|
| `--leading-none` | `1` |
| `--leading-tight` | `1.2` |
| `--leading-snug` | `1.35` |
| `--leading-normal` | `1.5` |
| `--leading-relaxed` | `1.625` |

### 3.5 Letter Spacing

| Token | Value |
|---|---|
| `--tracking-tight` | `-0.025em` |
| `--tracking-normal` | `0em` |
| `--tracking-wide` | `0.025em` |
| `--tracking-wider` | `0.05em` |
| `--tracking-widest` | `0.1em` |

### 3.6 Semantic Type Styles

| Style | Size | Weight | Leading | Notes |
|---|---|---|---|---|
| **Display** | `52px` | Black (900) | 1.2 | `--font-display` |
| **H1** | `34px` | Bold (700) | 1.2 | `tracking-tight` |
| **H2** | `26px` | SemiBold (600) | 1.35 | — |
| **H3** | `22px` | SemiBold (600) | 1.35 | — |
| **H4** | `17px` | SemiBold (600) | 1.5 | — |
| **Body LG** | `17px` | Regular (400) | 1.5 | — |
| **Body** | `15px` | Regular (400) | 1.5 | Default UI text |
| **Body SM** | `13px` | Regular (400) | 1.5 | — |
| **Label** | `13px` | Medium (500) | — | `tracking-wide` |
| **Overline** | `12px` | SemiBold (600) | — | `tracking-widest`, uppercase |
| **Mono** | `13px` | Regular (400) | — | `--font-mono` |

---

## 4. Spacing

8pt grid system.

| Token | Size |
|---|---|
| `--space-0` | `0px` |
| `--space-px` | `1px` |
| `--space-0-5` | `2px` |
| `--space-1` | `4px` |
| `--space-1-5` | `6px` |
| `--space-2` | `8px` |
| `--space-2-5` | `10px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |
| `--space-24` | `96px` |
| `--space-32` | `128px` |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | `0px` | — |
| `--radius-xs` | `2px` | Badges, tags in dense tables |
| `--radius-sm` | `3px` | Compact inputs |
| `--radius-md` | `4px` | Default inputs, buttons |
| `--radius-lg` | `6px` | Cards, panels |
| `--radius-xl` | `8px` | Modals, drawers |
| `--radius-2xl` | `12px` | Large modals |
| `--radius-full` | `9999px` | Status pills |

---

## 6. Elevation & Shadows

| Token | Value | Semantic alias |
|---|---|---|
| `--shadow-0` | `none` | — |
| `--shadow-1` | `0 1px 2px 0 rgba(0,0,0,.05)` | `--elevation-card` |
| `--shadow-2` | `0 1px 3px … + 0 1px 2px …` | — |
| `--shadow-3` | `0 4px 6px … + 0 2px 4px …` | `--elevation-dropdown` |
| `--shadow-4` | `0 10px 15px … + 0 4px 6px …` | `--elevation-modal` |
| `--shadow-5` | `0 20px 25px … + 0 8px 10px …` | `--elevation-overlay` |
| `--shadow-inner` | `inset 0 2px 4px rgba(0,0,0,.06)` | — |
| `--shadow-focus` | `0 0 0 3px var(--interactive-focus-ring)` | Focus ring |

---

## 7. Motion

### Durations

| Token | Value |
|---|---|
| `--duration-instant` | `50ms` |
| `--duration-fast` | `100ms` |
| `--duration-base` | `150ms` |
| `--duration-slow` | `200ms` |
| `--duration-slower` | `300ms` |
| `--duration-slowest` | `500ms` |

### Easing

| Token | Curve |
|---|---|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` — ease-in-out |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` — snappy enter |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |

### Transition Shorthands

| Token | Value |
|---|---|
| `--transition-base` | `150ms ease-default` |
| `--transition-enter` | `200ms ease-enter` |
| `--transition-exit` | `100ms ease-exit` |

---

## 8. Z-Index

| Token | Value | Layer |
|---|---|---|
| `--z-below` | `-1` | Behind everything |
| `--z-base` | `0` | Default |
| `--z-raised` | `10` | Slightly lifted |
| `--z-dropdown` | `100` | Dropdowns, popovers |
| `--z-sticky` | `200` | Sticky headers |
| `--z-fixed` | `300` | Fixed toolbars |
| `--z-overlay` | `400` | Backdrop overlays |
| `--z-modal` | `500` | Modals, dialogs |
| `--z-toast` | `600` | Toasts, notifications |
| `--z-tooltip` | `700` | Tooltips |
| `--z-top` | `999` | Emergency top layer |

---

## 9. Layout & Grid

| Token | Value |
|---|---|
| `--sidebar-width` | `240px` |
| `--sidebar-collapsed` | `64px` |
| `--topbar-height` | `56px` |
| `--content-max-width` | `1440px` |
| `--panel-width` | `380px` |

### Breakpoints (reference, use in media queries)

| Name | Width |
|---|---|
| handheld | `360px` |
| mobile | `480px` |
| tablet | `768px` |
| desktop | `1024px` |
| wide | `1280px` |
| ultrawide | `1440px` |

---

## 10. Themes

The design system supports three themes controlled via `data-theme` on the root element (or `.dark` class for Tailwind compatibility).

| Theme | Selector | Description |
|---|---|---|
| **Light** | `:root` (default) | Default — white surfaces, green accents |
| **Dark** | `[data-theme="dark"]` / `.dark` | Dark slate surfaces, lighter green accents |
| **Control Tower** | `[data-theme="control-tower"]` | Near-black deep-space surfaces for display/monitoring screens |

### Dark Mode Key Overrides

| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#FFFFFF` | `#111827` |
| `--bg-subtle` | `#F9FAFB` | `#0D1117` |
| `--bg-surface` | `#F3F4F6` | `#1F2937` |
| `--bg-elevated` | `#FFFFFF` | `#293548` |
| `--fg-primary` | `#111827` | `#F9FAFB` |
| `--fg-brand` | `#009245` | `#6CCB5F` |
| `--interactive-primary` | `#009245` | `#39B54A` |
| `--interactive-focus-ring` | `rgba(0,146,69,.3)` | `rgba(108,203,95,.3)` |

---

## 11. Components

All components live under `app/components/ui/` (prefixed with `Ui`) and `app/components/ui/hili/` (prefixed with `Hili`).

---

### AppButton (`<AppButton>`)

**File:** `app/components/ui/AppButton.vue`

A token-based button with variants and sizes.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'danger-soft'` | `'secondary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `iconOnly` | `boolean` | `false` | Square icon-only button |
| `loading` | `boolean` | `false` | Shows spinner, disables button |
| `block` | `boolean` | `false` | Full-width |

#### Variants

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `--interactive-primary` | white | transparent | `--interactive-primary-hover` |
| `secondary` | `--bg-base` | `--fg-secondary` | `--border-default` | `--bg-subtle` |
| `outline` | transparent | `--fg-brand` | `--border-brand` | `--color-green-50` |
| `ghost` | transparent | `--fg-secondary` | transparent | `--bg-subtle` |
| `danger` | `--interactive-destructive` | white | transparent | `--interactive-destructive-hover` |
| `danger-soft` | `--color-error-100` | `--color-error-700` | `--color-error-100` | `--color-error-50` |

#### Sizes

| Size | Font | Padding | Icon-only |
|---|---|---|---|
| `sm` | `11px` | `4px 11px` | `28×28px` |
| `md` | `12px` | `6px 14px` | `34×34px` |
| `lg` | `13px` | `8px 18px` | `40×40px` |
| `xl` | `14px` | `10px 22px` | `48×48px` |

#### Usage

```vue
<AppButton variant="primary" size="md">Save</AppButton>
<AppButton variant="danger" loading>Deleting…</AppButton>
<AppButton variant="outline" size="sm" iconOnly>
  <span class="i-lucide-plus" />
</AppButton>
```

---

### Badge (`<UiBadge>`)

**File:** `app/components/ui/Badge.vue`

Compact label for statuses, counts, or categorical data.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' \| 'brand'` | `'neutral'` | Color tone |
| `square` | `boolean` | `false` | Square corners (`--radius-sm`) instead of pill |
| `dot` | `boolean` | `false` | Prepend a colored dot indicator |

#### Tone Map

| Tone | Foreground | Background |
|---|---|---|
| `success` | `--color-success-700` | `--color-green-100` |
| `warning` | `--color-warning-700` | `--color-warning-100` |
| `error` | `--color-error-700` | `--color-error-100` |
| `info` | `--color-info-700` | `--color-info-100` |
| `neutral` | `--fg-secondary` | `--bg-surface` |
| `brand` | white | `--color-green-600` |

#### Usage

```vue
<UiBadge tone="success" dot>Active</UiBadge>
<UiBadge tone="error" square>3 Errors</UiBadge>
<UiBadge tone="brand">New</UiBadge>
```

---

### Alert (`<UiAlert>`)

**File:** `app/components/ui/Alert.vue`

Inline notification banner with icon, title, description, and optional action link.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'success' \| 'warning' \| 'error' \| 'info'` | `'info'` | Color tone and icon |
| `title` | `string` | — | Bold heading |

#### Slots

| Slot | Description |
|---|---|
| `default` | Description text |
| `action` | Underlined action link/button |

#### Usage

```vue
<UiAlert tone="warning" title="Low stock">
  Only 3 units remaining.
  <template #action>Reorder now</template>
</UiAlert>
```

---

### StatusPill (`<UiStatusPill>`)

**File:** `app/components/ui/StatusPill.vue`

Pill-shaped status indicator with a leading dot. Automatically maps known status strings to semantic colors.

#### Props

| Prop | Type | Description |
|---|---|---|
| `status` | `string` | Status string (case-insensitive) |

#### Status Map

| Status | Tone |
|---|---|
| DELIVERED, OK, ACTIVE, ONLINE, CLOSED, LOW, APPROVED | Success (green) |
| IN TRANSIT, INVITED, PRINTING, MEDIUM, INVESTIGATING | Warning (amber) |
| PICKING, PENDING, IN PROGRESS, ASSIGNED | Info (blue) |
| FAILED, SUSPENDED, OFFLINE, HIGH, OVERDUE, OPEN, CANCELLED | Error (red) |
| DRAFT, INACTIVE | Neutral (gray) |

#### Usage

```vue
<UiStatusPill status="APPROVED" />
<UiStatusPill status="PENDING" />
<UiStatusPill status="CANCELLED" />
```

---

### KpiCard (`<UiKpiCard>`)

**File:** `app/components/ui/KpiCard.vue`

Metric card for dashboards. Shows a label, primary value, optional delta pill, and optional progress bar.

#### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Uppercase overline label |
| `value` | `string` | Primary metric value |
| `unit` | `string` | Unit suffix (e.g. `%`, `THB`) |
| `delta` | `string` | Delta text (e.g. `+12%`) |
| `dir` | `'up' \| 'down' \| 'flat'` | Delta direction — drives arrow and color |
| `sub` | `string` | Subtext after delta pill |
| `icon` | `string` | SVG HTML string for the icon chip |
| `accent` | `string` | CSS color override for accent/icon |
| `bar` | `number` | Progress bar fill 0–100 |
| `barColor` | `string` | CSS color override for progress bar |

#### Usage

```vue
<UiKpiCard
  label="Total Orders"
  value="1,284"
  delta="+8.3%"
  dir="up"
  sub="vs last month"
  :bar="68"
/>
```

---

### Form Primitives (Global CSS classes)

**File:** `app/assets/css/components.css`

These are plain CSS classes used directly in markup — no component wrapper required.

| Class | Description |
|---|---|
| `.ds-field` | Column flex container with `5px` gap for label + input |
| `.ds-label` | Field label — `13px`, medium, `--fg-secondary` |
| `.ds-label--upper` | Uppercase variant — `9px`, bold, wide tracking |
| `.ds-input` | Text input — full width, `--radius-md`, focus ring |
| `.ds-input--error` | Error border state — red border + red focus glow |
| `.ds-input--mono` | Monospace input (codes / SKUs) |
| `.ds-input--disabled` | Disabled appearance |
| `.ds-select` | Styled `<select>` with chevron background image |
| `.ds-hint` | Helper text below input — `12px`, `--fg-tertiary` |
| `.ds-error-msg` | Error message below input — `12px`, `--fg-error` |
| `.ds-search` | Search field wrapper with absolute icon positioning |
| `.ds-skeleton` | Shimmer loading placeholder |
| `.ds-skeleton--text` | Text-line skeleton (`12px` height, pill radius) |
| `.ds-skeleton--line` | Compact text-line skeleton (`10px` height) |

#### Form Field Example

```html
<div class="ds-field">
  <label class="ds-label">Purchase Order</label>
  <input class="ds-input" placeholder="PO-00001" />
  <span class="ds-hint">Enter the document number</span>
</div>

<div class="ds-field">
  <label class="ds-label">Status</label>
  <input class="ds-input ds-input--error" value="bad" />
  <span class="ds-error-msg">Invalid status value</span>
</div>
```

---

### Page Layout Classes

**File:** `app/assets/css/main.css`

| Class | Description |
|---|---|
| `.fillpage` | Full-height flex column page with white card surface — wraps header + data grid |
| `.page` | Standard page wrapper — white surface, `--radius-xl`, `--space-4` padding, min 100% height |
| `.hpage` | Header-page — same as `.page` but flex column with `--space-4` gap |
| `.gridfill` | Makes the Hili `<DataGrid>` fill remaining vertical space; table scrolls internally |
| `.gridsearch` | Search input override — forces `--bg-base` background |

---

## 12. CSS Classes (Global Primitives)

### Scrollbar

Custom scrollbar is set globally in `app.css`:

- Width / height: `6px`
- Thumb: `rgba(155,155,155,.35)` — rounded pill
- Thumb hover: `rgba(155,155,155,.55)`

---

## 13. Icon System

Icons are served via **Lucide** through `@egoist/tailwindcss-icons` + `@iconify-json/lucide`.

Usage in Tailwind:

```html
<span class="i-lucide-plus w-4 h-4" />
<span class="i-lucide-trash-2 w-4 h-4 text-red-500" />
```

The Hili component layer also resolves `i-lucide-*` classes internally via the `@plugin "./hili-icons.js"` Tailwind plugin registered in `main.css`.

---

## 14. Internationalisation

| Setting | Value |
|---|---|
| Strategy | `no_prefix` (no locale segment in URL) |
| Default locale | `th` (Thai) |
| Supported locales | `th` · `en` |
| Config file | `i18n.config.ts` |
| Language detection | Cookie — key `phub_lang`, redirect on root |

---

## CSS Architecture

CSS loads in this order (later layers win on conflicts):

```
main.css      ← Tailwind v4 base + @nuxt/ui + Hili icon plugin + brand @theme tokens
tokens.css    ← All design tokens (CSS custom properties, @font-face)
app.css       ← Global resets, scrollbar, base element styles
components.css← Design-system primitive classes (.ds-*, .fillpage, .gridfill …)
```

---

*Generated from source: `app/assets/css/tokens.css`, `app/assets/css/components.css`, `app/assets/css/main.css`, `app/assets/css/app.css`, and `app/components/ui/`.*
