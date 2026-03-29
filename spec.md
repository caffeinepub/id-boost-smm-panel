# ID BOOST SMM Panel

## Current State
HomePage currently shows:
- A service tabs row (Followers / Likes / Views)
- A full order form card: service dropdown, Instagram link input, quantity input, total charge box, T&C checkbox, Buy button
- Blue Tick promo card
- Quick Recharge section with plan buttons, QR code, UPI app buttons, UTR verification
- Quick Box grid (Orders, Wallet, Boost, Analytics, Blue Tick)
- Stats grid
- Features list

## Requested Changes (Diff)

### Add
- Platform tabs: Instagram | YouTube | Facebook (replaces old Followers/Likes/Views tabs)
- Service cards grid (2-column, glassmorphism) showing all services per platform with price per 1K
  - Instagram: Followers (₹0.5/1K), Likes (₹0.15/1K), Views (₹0.15/1K), Shares (₹0.15/1K), Comments (₹0.30/1K), Story Views (₹0.15/1K)
  - YouTube: Subscribers (₹1/1K), Views (₹0.15/1K), Likes (₹0.15/1K), Watch Time (₹0.50/1K)
  - Facebook: Likes (₹0.15/1K), Followers (₹0.50/1K), Page Likes (₹0.15/1K), Views (₹0.15/1K)
- Platform-based card glow: Instagram=pink, YouTube=red, Facebook=blue
- On card click → navigate to /order with service pre-selected via URL param or localStorage

### Modify
- Platform tabs become Instagram / YouTube / Facebook (not service-type tabs)
- Keep Quick Recharge section (plans + QR + UPI app buttons)
- Keep header/balance (TopBar handles this)
- Keep Quick Box grid
- Remove Stats grid and Features list (clutter)

### Remove
- Full order form (service dropdown, Instagram link input, quantity input, total charge box, T&C checkbox, Buy button)
- "Place Order" form section
- Stats grid
- Features list
- LiveStatsPopup references from HomePage
- UTR verification section from HomePage recharge (keep screenshot-only as per existing WalletPage)

## Implementation Plan
1. Replace HomePage platform tabs with Instagram/YouTube/Facebook tabs
2. Replace order form card with 2-column service cards grid
3. Each card: platform icon, service name, emoji icon, price badge (₹X/1K), platform-colored glow, glass effect
4. Card click: save selected service key to localStorage, navigate to /order
5. Keep Quick Recharge section (plans + QR + UPI buttons) unchanged
6. Keep Quick Box grid
7. Keep Blue Tick promo card
8. Remove Stats, Features list, LiveStatsPopup, OrderLoader from HomePage
9. OrderPage should read pre-selected service from localStorage on mount and auto-select it
