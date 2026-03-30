# ID BOOST SMM Panel — Admin Panel Security

## Current State
- `/admin` route exists and shows AdminPage
- AdminPage checks `isAdmin` from IC context (backend role)
- Admin link (👑 Admin) is visible to ALL users in SideDrawer NAV_ITEMS
- Navbar also shows Admin Panel link based on `isAdmin`
- No username/password login gate exists
- Any user can navigate to `/admin` and see it if their IC identity has admin role

## Requested Changes (Diff)

### Add
- Admin login gate screen on `/admin` route: username + password form
- Session stored in `localStorage` key `adminAuth` (JSON: `{authenticated: true, expiry: timestamp}`)
- Admin credentials hardcoded: username `admin`, password `idboost@2024`
- Professional dark login UI with shield icon, error state for wrong credentials
- Logout button inside admin panel (clears session)
- Dashboard stats card section (Total Users, Total Orders, Pending Payments)
- Sidebar layout inside admin panel (Dashboard, Users, Payments, Orders tabs)

### Modify
- `SideDrawer.tsx`: Remove `{ icon: "👑", label: "Admin", path: "/admin" }` from NAV_ITEMS entirely
- `Navbar.tsx`: Remove all admin-visible links/buttons (`isAdmin` conditional blocks showing Admin Panel link)
- `AdminPage.tsx`: Wrap entire admin content behind local auth check. If `adminAuth` session missing/expired → show login form. If authenticated → show admin panel with sidebar layout
- Admin panel sections: Dashboard (stats), Users (list + add/deduct balance), Payments (screenshot requests + approve/reject), Orders (list + status update)

### Remove
- Admin link from SideDrawer
- Admin link from Navbar
- Multi-admin / settings tabs from admin panel
- Framer Motion dependencies causing public deployment issues (use CSS animations only)

## Implementation Plan
1. Update `SideDrawer.tsx` - remove Admin from NAV_ITEMS
2. Update `Navbar.tsx` - remove isAdmin conditional admin link blocks
3. Rewrite `AdminPage.tsx`:
   - Local auth state: check `localStorage.adminAuth` on mount
   - Login screen: username + password form with validation
   - On correct credentials → set `localStorage.adminAuth` with 24hr expiry
   - On wrong → show error message
   - If authenticated → render AdminDashboard with sidebar
   - Sidebar tabs: Dashboard | Users | Payments | Orders
   - Dashboard: stat cards (total users, total orders, pending payments count)
   - Payments: show `pendingUTR` from localStorage, approve/reject actions
   - Orders: show orders from backend + localStorage orders, status toggle
   - Users: show users with balance adjust
   - Logout button clears `adminAuth` from localStorage
