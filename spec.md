# ID BOOST SMM Panel

## Current State
InsufficientBalancePopup shows a single fixed popup with fixed timing (5s, 15s, 25s, every 15s). Balance is managed via `idboost_balance` localStorage key.

## Requested Changes (Diff)

### Add
- Sequence popup system: 5 rotating popup messages that cycle one by one
- Close gap: if popup was closed within 10s, skip next trigger
- appData unified localStorage object: `{ balance, selectedAmount, lastRecharge }` stored as `appData` key — alias on top of existing `idboost_balance` key
- `goRecharge()` action in popup: close popup, navigate to `/`, scroll to `#quick-recharge`, auto-select ₹250
- Banner element `rechargeBanner` updates dynamically based on selectedAmount

### Modify
- `InsufficientBalancePopup`: replace single static popup with rotating sequence of 5 popup messages; timing changes to first popup at 3s then every 10s repeat (with 10s close gap)
- Popup 2 (Blue Tick Offer) uses badge image `/assets/uploads/20260321_003208-1.png`

### Remove
- Old fixed timing system (5s, 15s, 25s, every 15s) replaced by new (3s then every 10s)

## Implementation Plan
1. Update `InsufficientBalancePopup.tsx` — add popups array with 5 messages, cycle through them, enforce 10s close gap, update timing to 3s + every 10s
2. Update `useLocalBalance.ts` — add `appData` helpers (saveAppData, loadAppData, selectAmount, addBalance) that sync with existing `idboost_balance` key for compatibility
3. `goRecharge` in popup navigates to `/` and scrolls to `#quick-recharge` and sets selectedAmount=250
