# Sparkpretty Closet — AGENTS.md

## Brand Identity
- **Business Name:** Sparkpretty Closet
- **Contact:** 0729366991
- **Industry:** Women's fashion ecommerce (Kenya)

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#C2185B` | CTA buttons, links, active states, nav |
| `--primary-dark` | `#AD1457` | Hover states, emphasis |
| `--primary-light` | `#F8BBD0` | Soft backgrounds, badges, hover fills |
| `--accent` | `#D4A574` | Secondary buttons, decorative accents |
| `--accent-light` | `#E8C9A0` | Accent hover states |
| `--bg` | `#FFF5F5` | Page background |
| `--bg-white` | `#FFFFFF` | Cards, modals, sections |
| `--text` | `#1A1A2E` | Body text |
| `--text-light` | `#6B7280` | Secondary/meta text |
| `--text-muted` | `#9CA3AF` | Placeholder text |
| `--border` | `#F3E8E8` | Dividers, card borders |
| `--success` | `#10B981` | In stock, success states |
| `--warning` | `#F59E0B` | Low stock, pending states |
| `--error` | `#EF4444` | Out of stock, errors |

### Gradients
| Name | Value | Usage |
|------|-------|-------|
| `--gradient-hero` | `linear-gradient(135deg, #C2185B, #D4A574)` | Hero sections, featured banners |
| `--gradient-soft` | `linear-gradient(180deg, #FFF5F5, #F8BBD0)` | Section backgrounds |
| `--gradient-card` | `linear-gradient(145deg, #FFF5F5, #FFFFFF)` | Card backgrounds |

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
- Card: `0 2px 12px rgba(194, 24, 91, 0.08)`
- Card hover: `0 8px 30px rgba(194, 24, 91, 0.12)`
- Button: `0 4px 14px rgba(194, 24, 91, 0.25)`
- Modal: `0 20px 60px rgba(0, 0, 0, 0.15)`

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
