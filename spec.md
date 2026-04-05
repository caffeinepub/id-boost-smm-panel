# ID BOOST SMM Panel — Real API Integration

## Current State
- OrderPage has multi-platform tabs (Instagram/YouTube/Facebook) with dynamic pricing based on localStorage balance
- Motoko backend has `placeOrder(serviceId, link, quantity)` that saves to internal order store but does NOT call external SMM API
- No HTTP outcalls to `apestsmmpanels.com` exist
- Services use internal service IDs (BigInt 1–23), not the real external service IDs

## Requested Changes (Diff)

### Add
- New Motoko function `placeOrderExternal(serviceKey, link, quantity)` that:
  - Maps serviceKey to real external service ID
  - Makes HTTP POST outcall to `https://apestsmmpanels.com/api/v2`
  - Body: `key=d99a3954e1ec2d10c29c74ba9a385658&action=add&service=<ID>&link=<link>&quantity=<qty>`
  - Returns the raw JSON response text
- 6 fixed services mapped in backend:
  - youtube_subscribers → 230
  - youtube_views → 4568
  - instagram_followers → 4679
  - instagram_views → 1348
  - facebook_followers → 4070
  - facebook_views → 4772
- New `SmmOrderForm` component (simple, standalone) OR update existing OrderPage with a new "API Orders" section
- Frontend shows: success message with order ID on success, error message on failure
- Loading state during API call

### Modify
- OrderPage: replace current service list with the 6 fixed real API services
- Remove localStorage balance dependency from order flow
- Quantity validation: minimum 100 (not 1000), link must not be empty
- On success: show "Order placed successfully" + order ID from API response
- On error: show exact error from API
- Remove pricing/balance/cost display (per user requirement — no pricing logic)
- Remove "Terms & Conditions" checkbox (keep it simple)
- Remove insufficient balance check

### Remove
- Dynamic price calculation box
- localStorage balance deduction on order
- AI Suggestion button
- Comments textarea
- Live Views notice
- Premium/rate badges
- Insufficient balance popup trigger

## Implementation Plan
1. Update `main.mo` to add `placeOrderExternal` using http-outcalls mixin
2. Regenerate/update `backend.did.d.ts` bindings
3. Rewrite `OrderPage.tsx` with:
   - Simple dropdown for 6 services (grouped by platform)
   - Link input
   - Quantity input (min 100)
   - Order button with loading spinner
   - Success/error status display
   - Calls `backend.placeOrderExternal(serviceKey, link, quantity)`
4. Keep existing components (OrderSuccessModal, LiveActivityFeed) but simplify success flow
