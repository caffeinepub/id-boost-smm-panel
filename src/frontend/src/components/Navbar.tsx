import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Menu, Rocket, Shield, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, userProfile } = useAppContext();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: hamburger */}
        <button
          type="button"
          data-ocid="nav.toggle"
          className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Center: Logo + Title */}
        <Link
          to="/"
          className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="gradient-text">ID</span>
            <span className="text-foreground"> BOOST</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex items-center gap-6"
          data-ocid="nav.section"
        >
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Home
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="dashboard.link"
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="admin.link"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right: wallet */}
        <div className="flex items-center gap-2">
          {userProfile !== null && (
            <div className="hidden sm:flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-primary">
                ₹{userProfile?.balance?.toFixed(2) ?? "0.00"}
              </span>
            </div>
          )}
          <Button
            size="sm"
            className="btn-gradient text-white border-0"
            onClick={() => navigate({ to: "/" })}
            data-ocid="nav.primary_button"
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-card"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                Home
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
                data-ocid="dashboard.link"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="admin.link"
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
