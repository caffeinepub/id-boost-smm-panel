import { Link, useRouterState } from "@tanstack/react-router";

const navItems = [
  { icon: "🏠", label: "Home", path: "/" },
  { icon: "⚡", label: "AI Tools", path: "/ai-tools" },
  { icon: "➕", label: "Order", path: "/order", center: true },
  { icon: "👤", label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full flex justify-around items-center px-2 py-2 z-50"
      style={{
        background: "#020617",
        borderTop: "1px solid #1e293b",
      }}
      data-ocid="bottom_nav.panel"
    >
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        if (item.center) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 -mt-4"
              data-ocid="bottom_nav.link"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "#2563eb",
                }}
              >
                {item.icon}
              </div>
              <span className="text-[10px] text-blue-400 font-semibold mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
            data-ocid="bottom_nav.link"
          >
            <span
              className={`text-xl transition-all duration-200 ${isActive ? "scale-110" : "opacity-70"}`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-blue-400" : "text-gray-400"}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
