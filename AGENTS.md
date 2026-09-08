# Sparkpretty Closet — AGENTS.md

## Brand Identity
- **Business Name:** Sparkpretty Closet
- **Contact:** 0729366991
- **Industry:** Women's fashion ecommerce (Kenya)

## Design Tokens

### Theming (4 switchable themes — no gradients)
The site supports **4 distinct flat themes**: `blue`, `green`, `pink`, `maroon`.
Themes are applied via the `data-theme` attribute on `<html>` and defined in `frontend/src/index.css`
as CSS custom properties. `frontend/src/context/ThemeContext.jsx` exposes `useTheme()` (`theme`,
`setTheme`, `cycleTheme`, `themes`, `themeList`, `loaded`) and manages persistence in localStorage
(`sparkpretty-theme`). The site-wide default is read from the `site_theme` Setting (via `/api/site/settings`).

### Color tokens (per theme)
| Token | Role | Usage |
|-------|------|-------|
| `--primary` | Brand accent (deep) | Buttons (white text), links, active nav/tabs, header `footer-gradient` |
| `--primary-dark` | Darker hover | Hover states, `header-top` bar |
| `--primary-light` | Soft tint | Badges, active tab fills, `gradient-soft` |
| `--accent` | Complement | Secondary/decorative accents (subtle) |
| `--accent-light` | Accent tint | Accent hover fills |
| `--bg` | Page background (very light tint) | Body background |
| `--bg-white` | `#FFFFFF` always | Cards, modals, sections |
| `--footer` | Deep footer color | Footer background |
| `--border` | Tinted border | Dividers, card borders, inputs |
| `--text` | `#1A1A2E` | Body text (near-black, high contrast on all themes) |
| `--text-light` / `--text-muted` | Neutral grays | Meta/placeholder text |

Palettes (swatch → primary):
- **blue** `#1D6FD8` (Ocean Blue) — professional, crisp
- **green** `#1E8A5A` (Emerald Green) — fresh, natural
- **pink** `#D6337B` (Blush Pink) — soft, feminine
- **maroon** `#8E1F3B` (Royal Maroon) — rich, elegant

**Legacy utility names are retained but now render *solid*, not gradients:**
`gradient-hero` → solid `--primary` (white text), `gradient-soft` → solid `--primary-light`,
`footer-gradient` → solid `--footer`, `header-top` → solid `--primary-dark`, `text-gradient` → solid `--primary-dark` text.

The Tailwind alias color `secondary` maps to `var(--primary)` for backward compatibility, so all
existing `text-secondary` / `bg-secondary` usages stay theme-aware and produce visible brand-colored
nav/active states. See `frontend/tailwind.config.js` and `frontend/src/index.css`.

### Typography
| Role | Font | Weight | Size |
|------|------|--------|------|
| Heading 1 | Playfair Display | 700 | 48px / 3rem |
| Heading 2 | Playfair Display | 600 | 36px / 2.25rem |
| Heading 3 | Playfair Display | 600 | 24px / 1.5rem |
| Body | Inter | 400 | 16px / 1rem |
| Body Small | Inter | 400 | 14px / 0.875rem |
| Caption | Inter | 500 | 12px / 0.75rem |
| Price | Inter | 700 | 20px / 1.25rem |

### Spacing (8px grid)
`8, 16, 24, 32, 48, 64, 96, 128`

### Border Radius
- Cards: `12px`
- Buttons: `8px`
- Inputs: `8px`
- Avatars: `50%`
- Badges: `9999px` (pill)

### Shadows
Per-theme, defined as CSS vars (`--shadow-card`, `--shadow-card-hover`, `--shadow-button`), tinted to the
current theme's `--primary`. Modal shadow is fixed: `0 20px 60px rgba(0, 0, 0, 0.15)`.

## Data Models

### User
```
name: String, required
email: String, unique, required, lowercase
password: String (bcrypt hashed)
phone: String
role: "customer" | "admin", default "customer"
addresses: [{ label, street, city, county, zip, country, isDefault }]
timestamps
```

### Product
```
name: String, required
slug: String, unique (auto-generated from name)
description: String
category: ObjectId → Category
variants: [{
  size, color, colorHex, price, salePrice, sku, stock, images[]
}]
tags: [String]
featured: Boolean, default false
active: Boolean, default true
timestamps
```

### Category
```
name: String, required
slug: String, unique
description: String
image: String (URL)
order: Number
timestamps
```

### Cart
```
user: ObjectId → User (or sessionId for guests)
items: [{
  product: ObjectId → Product
  variantIndex: Number
  size: String
  color: String
  quantity: Number
  price: Number
}]
timestamps
```

### Order
```
user: ObjectId → User
items: [{ product, name, size, color, quantity, price }]
shippingAddress: { label, street, city, county, zip, country }
subtotal: Number
shipping: Number
total: Number
payment: {
  method: "mpesa"
  mpesaReceipt: String
  checkoutRequestId: String
  merchantRequestId: String
  status: "pending" | "completed" | "failed"
}
status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
timestamps
```

### Subscriber
```
email: String, unique, lowercase
active: Boolean, default true
timestamps
```

### ContactMessage
```
name: String, required
email: String, required
phone: String
subject: String
message: String, required
read: Boolean, default false
replied: Boolean, default false
timestamps
```

### Setting (key-value site config)
```
key: String, unique
value: Mixed
type: "text" | "textarea" | "number" | "boolean" | "json"
group: String, default "general"
label: String
timestamps
```

### Banner
```
title: String
subtitle: String
image: String
link: String
cta: String
type: "hero" | "promo" | "story"
order: Number
active: Boolean, default true
timestamps
```

## Admin API (`/api/admin`, all behind `auth` + `adminOnly`)
- `GET /stats` — dashboard totals (products, orders, users, blogs, subscribers, unread contacts, revenue, today orders, low stock)
- `GET /analytics/sales?days=` — revenue + order count per day
- `GET /analytics/top-products`, `GET /analytics/orders` — chart data
- `GET/POST/PUT/DELETE /products`, `GET/POST/PUT/DELETE /products/:id` (search, category filter, pagination)
- `GET/POST/PUT/DELETE /categories`, `GET/POST/PUT/DELETE /categories/:id` (category list includes productCount)
- `GET/POST/PUT/DELETE /orders`, `GET/POST/PUT/DELETE /orders/:id`, `PUT /orders/:id/status` (search by id/receipt, status filter, pagination; paid orders cannot be deleted)
- `GET/POST/PUT/DELETE /blog`, `GET/POST/PUT/DELETE /blog/:id` (search, pagination)
- `GET/POST/PUT/DELETE /users`, `GET/POST/PUT/DELETE /users/:id` (search by name/email/phone, role filter; delete self blocked)
- `GET/DELETE /subscribers`, `GET/PUT/DELETE /contacts`, `GET/POST/PUT/DELETE /banners`, `GET/PUT/DELETE /settings`
- Public routes: `GET /api/site/banners` (active only), `GET /api/site/settings` (key→value map)

## Admin Frontend
- All `/admin*` routes guarded by `ProtectedRoute adminOnly` + wrapped in `AdminLayout` (sidebar shell)
- Pages: Dashboard, Products (+ form), Categories, Orders, Blog (+ form), Users, Subscribers, Messages, Banners, Settings
- Admin pages use `components/admin/ui.jsx` helpers: `PageHeader`, `Card`, `Pagination`, `EmptyState`, `Modal`, `StatusPill`, `ORDER_STATUS`, `PAYMENT_STATUS`
- Admin routes are lazy-loaded (code split) to keep the public site bundle lean

## Conventions
- All API responses: `{ success: true, data: ... }` or `{ success: false, message: "..." }`
- Slugs are auto-generated from product/category names via `slugify`
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens in `Authorization: Bearer <token>` header
- Guest carts use sessionId stored in localStorage
- M-Pesa amounts are always whole numbers (KES, no decimals)
- Phone numbers normalized to `254XXXXXXXXX` format
- All env vars in `.env`, never hardcoded
- Placeholder images: `https://placehold.co/600x800/C2185B/FFFFFF?text=ProductName`
- Admin list endpoints use `parsePagination` (`?page=&limit=&search=&...`) from `utils/pagination.js` and return `{ items, total, page, pages, limit }`
