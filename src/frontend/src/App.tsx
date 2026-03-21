import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { GodSpeakAI } from "./components/GodSpeakAI";
import { HelpChat } from "./components/HelpChat";
import { InsufficientBalancePopup } from "./components/InsufficientBalancePopup";
import { LiveOrderToast } from "./components/LiveOrderToast";
import { LiveTicker } from "./components/LiveTicker";
import { PurchasePopup } from "./components/PurchasePopup";
import { TopBar } from "./components/TopBar";
import { AppProvider } from "./context/AppContext";
import { useLocalBalance } from "./hooks/useLocalBalance";
import { AIToolsPage } from "./pages/AIToolsPage";
import { AdminPage } from "./pages/AdminPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BlueTickPage } from "./pages/BlueTickPage";
import { HomePage } from "./pages/HomePage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { OrderPage } from "./pages/OrderPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TermsPage } from "./pages/TermsPage";
import { WalletPage } from "./pages/WalletPage";

function OfferPopup() {
  useEffect(() => {
    if (sessionStorage.getItem("offer_shown")) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem("offer_shown", "1");
      toast(
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-black text-white text-sm">Special Offer!</p>
            <p className="text-yellow-300 font-bold text-base">
              ₹250 +₹60 Bonus
            </p>
            <p className="text-gray-300 text-xs mt-0.5">
              Pay ₹250 → Get ₹310 in wallet
            </p>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
            border: "1px solid rgba(236,72,153,0.5)",
            boxShadow: "0 0 24px rgba(236,72,153,0.3)",
            color: "#fff",
            borderRadius: "16px",
            padding: "12px 16px",
          },
        },
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

function RootLayout() {
  const balance = useLocalBalance();
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="pt-[57px]">
        <LiveTicker />
        {balance === 0 && (
          <div
            style={{
              background: "linear-gradient(90deg, #00ffcc, #00ccff)",
              padding: "8px",
              textAlign: "center",
              fontWeight: "bold",
              color: "black",
              fontSize: "14px",
            }}
            data-ocid="home.panel"
          >
            🎁 Recharge ₹150 Get ₹30 Bonus
          </div>
        )}
        <div className="pb-20">
          <Outlet />
        </div>
      </div>
      <InsufficientBalancePopup />
      <BottomNav />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order",
  component: OrderPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const aiToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-tools",
  component: AIToolsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const ordersHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders-history",
  component: OrderHistoryPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const blueTickRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blue-tick",
  component: BlueTickPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  orderRoute,
  profileRoute,
  aiToolsRoute,
  adminRoute,
  walletRoute,
  ordersHistoryRoute,
  analyticsRoute,
  termsRoute,
  blueTickRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppProvider>
      <GodSpeakAI />
      <OfferPopup />
      <HelpChat />
      <LiveOrderToast />
      <PurchasePopup />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppProvider>
  );
}
