import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { BottomNav } from "./components/BottomNav";
import { GodSpeakAI } from "./components/GodSpeakAI";
import { HelpChat } from "./components/HelpChat";
import { LiveTicker } from "./components/LiveTicker";
import { TopBar } from "./components/TopBar";
import { AppProvider } from "./context/AppContext";
import { useLocalBalance, useSelectedAmount } from "./hooks/useLocalBalance";
import { AIToolsPage } from "./pages/AIToolsPage";
import { AdminPage } from "./pages/AdminPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BlueTickPage } from "./pages/BlueTickPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { OrderPage } from "./pages/OrderPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReportPage } from "./pages/ReportPage";
import { TermsPage } from "./pages/TermsPage";
import { WalletPage } from "./pages/WalletPage";

function RechargeBanner() {
  const balance = useLocalBalance();
  const selectedAmount = useSelectedAmount();

  if (balance !== 0) return null;

  const label =
    selectedAmount > 0
      ? `🎁 Recharge ₹${selectedAmount} Get Bonus`
      : "🎁 Recharge ₹150 Get ₹30 Bonus";

  return (
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
      {label}
    </div>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="pt-[57px]">
        <LiveTicker />
        <RechargeBanner />
        <div className="pb-20">
          <Outlet />
        </div>
      </div>
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

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const reportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report",
  component: ReportPage,
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
  historyRoute,
  reportRoute,
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
      <HelpChat />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppProvider>
  );
}
